import { RekognitionClient, DetectModerationLabelsCommand, DetectTextCommand } from '@aws-sdk/client-rekognition';

const MIN_CONFIDENCE = 80;

let rekognitionClient;

function getRekognitionClient() {
  if (!rekognitionClient) {
    rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return rekognitionClient;
}

function isFormatError(error) {
  const code = error?.name || error?.Code || error?.__type || '';
  return code === 'InvalidImageFormatException' || code.includes('InvalidImageFormat');
}

function isTransientRekognitionError(error) {
  if (isFormatError(error)) return false;
  const status = error?.$metadata?.httpStatusCode;
  if (status && status >= 500) return true;
  const code = error?.name || error?.Code || '';
  return (
    code === 'ThrottlingException' ||
    code === 'ProvisionedThroughputExceededException' ||
    code === 'InternalServerError'
  );
}

function handleRekognitionError(error, context) {
  console.error(`Rekognition ${context} failed:`, error);

  if (isFormatError(error)) {
    return { flagged: true, error: false, formatRejected: true };
  }

  if (isTransientRekognitionError(error)) {
    return { flagged: false, error: true };
  }

  return { flagged: false, error: true };
}

/**
 * Nudity & other explicit content via Rekognition ModerationLabels.
 */
export async function checkExplicitContent(imageBytes) {
  try {
    const response = await getRekognitionClient().send(
      new DetectModerationLabelsCommand({
        Image: { Bytes: imageBytes },
        MinConfidence: MIN_CONFIDENCE,
      })
    );

    const labels = (response.ModerationLabels || [])
      .filter((label) => (label.Confidence ?? 0) >= MIN_CONFIDENCE)
      .map((label) => ({
        name: label.Name,
        confidence: label.Confidence,
        parentName: label.ParentName,
      }));

    return {
      flagged: labels.length > 0,
      labels,
      error: false,
    };
  } catch (error) {
    const err = handleRekognitionError(error, 'DetectModerationLabels');
    if (err.formatRejected) {
      return {
        flagged: true,
        labels: [{ name: 'InvalidImageFormat', confidence: 100 }],
        error: false,
      };
    }
    return { flagged: err.flagged, labels: [], error: err.error };
  }
}

function collectOcrStrings(detections) {
  const lines = [];
  const seen = new Set();

  for (const d of detections || []) {
    if (d.Type !== 'LINE' && d.Type !== 'WORD') continue;
    const t = String(d.DetectedText || '').trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    lines.push(t);
  }

  const combined = lines.join(' ');
  return { lines, combined };
}

function lineContainsPhoneNumber(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return false;

  if (/\+91[\s.\-]*\d/.test(trimmed)) return true;

  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length >= 10 && /\d{10,}/.test(digitsOnly)) return true;

  if (/^[\d\s.\-+()]+$/.test(trimmed) && digitsOnly.length >= 6) return true;

  // Handwritten / overlay numbers (OCR often reads "933" as "93" or "937")
  if (/^\d{2,9}$/.test(trimmed)) return true;

  return false;
}

/**
 * Rekognition often splits hand-drawn numbers into separate WORD boxes ("9","3","3")
 * or partial reads ("93"). Merge nearby digit WORDs and flag short overlays.
 */
function detectMergedDigitOverlays(detections) {
  const MIN_CONF = 50;
  const items = (detections || [])
    .filter((d) => d.Type === 'WORD' && (d.Confidence ?? 0) >= MIN_CONF)
    .map((d) => {
      const raw = String(d.DetectedText || '').trim();
      const digits = raw.replace(/\D/g, '');
      if (!digits) return null;
      const box = d.Geometry?.BoundingBox;
      return {
        digits,
        raw,
        left: box?.Left ?? 0,
        top: box?.Top ?? 0,
        width: box?.Width ?? 0,
        right: (box?.Left ?? 0) + (box?.Width ?? 0),
      };
    })
    .filter(Boolean);

  if (!items.length) return [];

  items.sort((a, b) => a.top - b.top || a.left - b.left);

  const groups = [];
  for (const item of items) {
    let placed = false;
    for (const group of groups) {
      const last = group[group.length - 1];
      const sameRow = Math.abs(item.top - last.top) < 0.1;
      const horizontallyClose = item.left - last.right < 0.2;
      if (sameRow && horizontallyClose) {
        group.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([item]);
  }

  const matches = [];
  for (const group of groups) {
    const combined = group.map((g) => g.digits).join('');
    const label = group.map((g) => g.raw).join('');
    if (combined.length >= 2) {
      matches.push(label || combined);
    }
  }

  return [...new Set(matches)];
}

function lineContainsEmail(text) {
  return /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(String(text || ''));
}

function lineContainsWhatsAppOrCall(text) {
  const t = String(text || '').toLowerCase();
  return (
    /\bwhatsapp\b/.test(t) ||
    /\bwa\.me\b/.test(t) ||
    /\bcall\s*(me|now|us|at)\b/.test(t) ||
    /\bcontact\s*(me|us|no|number)\b/.test(t)
  );
}

function lineContainsAdvertising(text) {
  const t = String(text || '').trim();
  if (!t) return false;

  const lower = t.toLowerCase();

  if (/\b(?:https?:\/\/|www\.)\S+/i.test(t)) return true;
  if (/\b[a-z0-9-]+\.(?:com|in|net|org|co)\b/i.test(t) && !/\.(jpg|jpeg|png|webp)$/i.test(t)) return true;

  if (/\b(?:instagram|facebook|telegram|youtube|snapchat|twitter|x\.com)\b/i.test(lower)) return true;
  if (/@[\w.]{3,}/.test(t)) return true;

  const promoPatterns = [
    /\badvertisement\b/i,
    /\badvertising\b/i,
    /\bpromo(?:tion|tional)?\b/i,
    /\boffer(?:s)?\s+(?:available|inside|now)\b/i,
    /\blimited\s+offer\b/i,
    /\bbest\s+(?:deals?|price|rates?)\b/i,
    /\bemi\s+available\b/i,
    /\bloan\s+available\b/i,
    /\bfree\s+consultation\b/i,
    /\bbook\s+now\b/i,
    /\benquir(?:y|e)\s+now\b/i,
    /\bfor\s+booking\b/i,
    /\bvisit\s+our\s+office\b/i,
    /\breal\s*estate\s+(?:agent|agency|services)\b/i,
    /\bproperty\s+dealer\b/i,
    /\bbroker\s*(?:no|number|contact)?\b/i,
  ];

  return promoPatterns.some((re) => re.test(t));
}

function analyzeTextDetections(detections) {
  const { lines, combined } = collectOcrStrings(detections);

  const contactMatches = [];
  const advertisingMatches = [];
  const contactSeen = new Set();
  const adSeen = new Set();

  const addContact = (text) => {
    const t = String(text).trim();
    if (!t || contactSeen.has(t)) return;
    contactSeen.add(t);
    contactMatches.push(t);
  };

  const addAd = (text) => {
    const t = String(text).trim();
    if (!t || adSeen.has(t)) return;
    adSeen.add(t);
    advertisingMatches.push(t);
  };

  for (const line of lines) {
    if (
      lineContainsPhoneNumber(line) ||
      lineContainsEmail(line) ||
      lineContainsWhatsAppOrCall(line)
    ) {
      addContact(line);
    }
    if (lineContainsAdvertising(line)) {
      addAd(line);
    }
  }

  const combinedDigits = combined.replace(/\D/g, '');
  if (combinedDigits.length >= 10 && /\d{10,}/.test(combinedDigits)) {
    addContact(combined);
  }

  // Merged digit WORD clusters (hand-drawn overlays split across boxes)
  for (const merged of detectMergedDigitOverlays(detections)) {
    addContact(merged);
  }

  // Any LINE with confidence >= 50 that is mostly digits (handwriting gets ~60–70% conf)
  for (const d of detections || []) {
    if (d.Type !== 'LINE' || (d.Confidence ?? 0) < 50) continue;
    const t = String(d.DetectedText || '').trim();
    if (lineContainsPhoneNumber(t)) addContact(t);
  }

  return {
    contact: {
      flagged: contactMatches.length > 0,
      matchedText: contactMatches,
    },
    advertising: {
      flagged: advertisingMatches.length > 0,
      matchedText: advertisingMatches,
    },
  };
}

/**
 * Single OCR pass — contact info (phone, email, WhatsApp) and advertising text.
 */
export async function analyzeImageText(imageBytes) {
  try {
    const response = await getRekognitionClient().send(
      new DetectTextCommand({
        Image: { Bytes: imageBytes },
      })
    );

    const detections = response.TextDetections || [];

    if (process.env.NODE_ENV === 'development' && detections.length) {
      const ocrPreview = detections
        .filter((d) => d.Type === 'LINE' || d.Type === 'WORD')
        .map((d) => `${d.Type}:${d.DetectedText}`)
        .slice(0, 25);
      console.log('Rekognition OCR preview:', ocrPreview.join(' | '));
    }

    const analysis = analyzeTextDetections(detections);
    return { ...analysis, error: false };
  } catch (error) {
    const err = handleRekognitionError(error, 'DetectText');
    if (err.formatRejected) {
      return {
        contact: { flagged: true, matchedText: ['Unreadable image format'] },
        advertising: { flagged: false, matchedText: [] },
        error: false,
      };
    }
    return {
      contact: { flagged: false, matchedText: [] },
      advertising: { flagged: false, matchedText: [] },
      error: err.error,
    };
  }
}

/** @deprecated Use analyzeImageText */
export async function checkForPhoneNumber(imageBytes) {
  const result = await analyzeImageText(imageBytes);
  return {
    flagged: result.contact.flagged,
    matchedText: result.contact.matchedText,
    error: result.error,
  };
}
