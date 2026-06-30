import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectTextCommand,
  DetectLabelsCommand,
} from '@aws-sdk/client-rekognition';
import { prepareImageBytes } from './imagePrep.js';
import { scanContactViolations, normalizeContactText } from './contactValidation.js';
import { messageForViolationCode } from './moderationMessages.js';

const EXPLICIT_PARENTS = new Set([
  'Explicit Nudity',
  'Violence',
  'Visually Disturbing',
  'Hate Symbols',
  'Drugs',
  'Tobacco',
  'Alcohol',
  'Gambling',
]);

const REJECT_CONFIDENCE = 80;
const PENDING_CONFIDENCE_MIN = 55;

/** Rekognition label names that indicate a person (not a room/building photo). */
const PERSON_LABELS = new Set([
  'Person',
  'Human',
  'Face',
  'Head',
  'Portrait',
  'Selfie',
]);

const PERSON_REJECT_CONFIDENCE = 75;
const PERSON_PENDING_CONFIDENCE_MIN = 60;

let rekognitionClient;

function getRekognition() {
  if (!rekognitionClient) {
    if (!process.env.AWS_REGION) {
      return null;
    }
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

function isTransientError(err) {
  const code = err?.name || err?.Code || '';
  const status = err?.$metadata?.httpStatusCode;
  return status >= 500 || code === 'ThrottlingException' || code === 'ProvisionedThroughputExceededException';
}

function mergeOcrText(blocks) {
  if (!blocks?.length) return '';
  return blocks
    .filter((b) => b.BlockType === 'LINE' || b.BlockType === 'WORD')
    .map((b) => b.Text || '')
    .join(' ');
}

function mergeAdjacentDigitWords(blocks) {
  const words = (blocks || [])
    .filter((b) => b.BlockType === 'WORD')
    .map((b) => String(b.Text || '').trim())
    .filter(Boolean);

  const merged = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^\d{1,2}$/.test(w) && i + 1 < words.length && /^\d{1,2}$/.test(words[i + 1])) {
      let run = w;
      let j = i + 1;
      while (j < words.length && /^\d{1,2}$/.test(words[j])) {
        run += words[j];
        j++;
      }
      if (run.replace(/\D/g, '').length >= 3) {
        merged.push(run);
        i = j - 1;
        continue;
      }
    }
    merged.push(w);
  }
  return merged.join(' ');
}

function findTopPersonLabel(labels) {
  let top = null;
  for (const label of labels || []) {
    if (!PERSON_LABELS.has(label.Name)) continue;
    const confidence = label.Confidence || 0;
    if (!top || confidence > top.confidence) {
      top = { name: label.Name, confidence };
    }
  }
  return top;
}

/**
 * AI moderation: explicit content + person detection + OCR contact scan.
 */
export async function moderatePropertyImage(buffer, mimetype) {
  let bytes;
  try {
    ({ bytes } = await prepareImageBytes(buffer, mimetype));
  } catch {
    return {
      approved: false,
      rejected: true,
      pending: false,
      confidence: 100,
      code: 'image_explicit',
      userMessage: messageForViolationCode('image_explicit'),
      reason: 'invalid_image',
      bytes: buffer,
    };
  }

  const client = getRekognition();
  if (!client) {
    return { approved: true, rejected: false, pending: false, confidence: 0, bytes };
  }

  let moderationLabels = [];
  let textBlocks = [];
  let sceneLabels = [];

  try {
    const [modRes, textRes, labelsRes] = await Promise.all([
      client.send(new DetectModerationLabelsCommand({ Image: { Bytes: bytes }, MinConfidence: 50 })),
      client.send(new DetectTextCommand({ Image: { Bytes: bytes } })),
      client.send(
        new DetectLabelsCommand({
          Image: { Bytes: bytes },
          MinConfidence: 50,
          MaxLabels: 50,
        })
      ),
    ]);
    moderationLabels = modRes.ModerationLabels || [];
    textBlocks = textRes.TextDetections || [];
    sceneLabels = labelsRes.Labels || [];
  } catch (err) {
    if (err.name === 'InvalidImageFormatException' || err.code === 'InvalidImageFormatException') {
      return {
        approved: false,
        rejected: true,
        pending: false,
        confidence: 100,
        code: 'image_explicit',
        userMessage: messageForViolationCode('image_explicit'),
        reason: 'invalid_format',
        bytes,
      };
    }
    if (isTransientError(err)) {
      console.warn('Rekognition transient error (fail-open):', err.message);
      return { approved: true, rejected: false, pending: false, confidence: 0, bytes };
    }
    throw err;
  }

  let topExplicit = null;
  for (const label of moderationLabels) {
    const parent = label.ParentName || label.Name;
    if (EXPLICIT_PARENTS.has(parent) || EXPLICIT_PARENTS.has(label.Name)) {
      if (!topExplicit || (label.Confidence || 0) > topExplicit.confidence) {
        topExplicit = { name: label.Name, confidence: label.Confidence || 0 };
      }
    }
  }

  if (topExplicit && topExplicit.confidence >= REJECT_CONFIDENCE) {
    return {
      approved: false,
      rejected: true,
      pending: false,
      confidence: topExplicit.confidence,
      code: 'image_explicit',
      userMessage: messageForViolationCode('image_explicit'),
      reason: topExplicit.name,
      bytes,
    };
  }

  const topPerson = findTopPersonLabel(sceneLabels);
  if (topPerson && topPerson.confidence >= PERSON_REJECT_CONFIDENCE) {
    return {
      approved: false,
      rejected: true,
      pending: false,
      confidence: topPerson.confidence,
      code: 'image_person',
      userMessage: messageForViolationCode('image_person'),
      reason: topPerson.name,
      bytes,
    };
  }

  const ocrLine = mergeOcrText(textBlocks);
  const ocrMerged = mergeAdjacentDigitWords(textBlocks);
  const ocrCombined = `${ocrLine}\n${ocrMerged}\n${normalizeContactText(ocrLine)}`;
  const contactScan = scanContactViolations(ocrCombined);

  if (contactScan.codes.length > 0) {
    const code = contactScan.codes.includes('phone') ? 'image_contact' : contactScan.codes[0];

    return {
      approved: false,
      rejected: true,
      pending: false,
      confidence: 95,
      code: code === 'phone' ? 'image_contact' : code,
      userMessage:
        code === 'image_contact' || code === 'phone'
          ? messageForViolationCode('image_contact')
          : messageForViolationCode(code),
      reason: `ocr_${contactScan.codes[0]}`,
      bytes,
    };
  }

  if (topExplicit && topExplicit.confidence >= PENDING_CONFIDENCE_MIN) {
    return {
      approved: false,
      rejected: false,
      pending: true,
      confidence: topExplicit.confidence,
      code: 'image_pending',
      userMessage: messageForViolationCode('image_pending'),
      reason: topExplicit.name,
      bytes,
    };
  }

  if (topPerson && topPerson.confidence >= PERSON_PENDING_CONFIDENCE_MIN) {
    return {
      approved: false,
      rejected: false,
      pending: true,
      confidence: topPerson.confidence,
      code: 'image_pending',
      userMessage: messageForViolationCode('image_pending'),
      reason: topPerson.name,
      bytes,
    };
  }

  return {
    approved: true,
    rejected: false,
    pending: false,
    confidence: topExplicit?.confidence || 0,
    bytes,
  };
}
