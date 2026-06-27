const DRAFT_KEY = 'harshToLet_addListing_draft_v1';
const MAX_DRAFT_BYTES = 6 * 1024 * 1024;

function readDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl, filename, mime) {
  const [header, b64] = dataUrl.split(',');
  const mimeMatch = header?.match(/:(.*?);/);
  const type = mime || mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type });
}

async function filesToDraftEntries(files, budgetBytes) {
  const entries = [];
  let used = 0;
  let truncated = false;

  for (const file of files) {
    if (!file) continue;
    const dataUrl = await fileToDataUrl(file);
    const size = readDataUrlBytes(dataUrl);
    if (used + size > budgetBytes) {
      truncated = true;
      break;
    }
    entries.push({ name: file.name, type: file.type, dataUrl });
    used += size;
  }

  if (files.length > entries.length) truncated = true;
  return { entries, truncated };
}

async function fileToDraftEntry(file, budgetBytes) {
  if (!file) return { entry: null, truncated: false };
  const dataUrl = await fileToDataUrl(file);
  if (readDataUrlBytes(dataUrl) > budgetBytes) {
    return { entry: null, truncated: true };
  }
  return { entry: { name: file.name, type: file.type, dataUrl }, truncated: false };
}

function draftEntriesToFiles(entries) {
  if (!entries?.length) return [];
  return entries.map((e) => dataUrlToFile(e.dataUrl, e.name, e.type));
}

function draftEntryToFile(entry) {
  if (!entry) return null;
  return dataUrlToFile(entry.dataUrl, entry.name, entry.type);
}

/**
 * Save add-property / add-project form state before login/signup.
 */
export async function saveAddListingDraft({
  listingMode,
  formData,
  projectData,
  kathaPreset,
  kathaDecimal,
  images,
  projectPdf,
}) {
  let budget = MAX_DRAFT_BYTES;
  const { entries: imageDrafts, truncated: imagesTruncated } = await filesToDraftEntries(
    images || [],
    budget
  );
  budget -= imageDrafts.reduce((sum, e) => sum + readDataUrlBytes(e.dataUrl), 0);

  const { entry: projectPdfDraft, truncated: pdfTruncated } = await fileToDraftEntry(
    projectPdf,
    budget
  );

  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    listingMode,
    formData,
    projectData,
    kathaPreset,
    kathaDecimal,
    imageDrafts,
    projectPdfDraft,
    imagesTruncated: imagesTruncated || pdfTruncated,
  };

  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    return { ok: true, imagesTruncated: payload.imagesTruncated };
  } catch {
    try {
      const lean = { ...payload, imageDrafts: [], projectPdfDraft: null, imagesTruncated: true };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(lean));
      return { ok: true, imagesTruncated: true };
    } catch {
      return { ok: false, error: 'Could not save listing draft. Try fewer or smaller images.' };
    }
  }
}

/** Restore saved listing draft into component state. */
export async function loadAddListingDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;

    return {
      listingMode: data.listingMode === 'project' ? 'project' : 'property',
      formData: data.formData || {},
      projectData: data.projectData || {},
      kathaPreset: data.kathaPreset ?? '1',
      kathaDecimal: data.kathaDecimal ?? '',
      images: draftEntriesToFiles(data.imageDrafts),
      projectPdf: draftEntryToFile(data.projectPdfDraft),
      imagesTruncated: Boolean(data.imagesTruncated),
    };
  } catch {
    return null;
  }
}

export function clearAddListingDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function buildAuthSwitchUrl(path, searchParams) {
  const q = new URLSearchParams();
  const next = searchParams?.get?.('next');
  const from = searchParams?.get?.('from');
  if (next) q.set('next', next);
  if (from) q.set('from', from);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
