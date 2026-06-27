import { PDFDocument } from 'pdf-lib';

/** Max incoming PDF size (multer should match). */
export const PDF_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/**
 * Re-save PDF with object streams and stripped metadata to reduce size before S3 upload.
 * Falls back to the original buffer if optimization fails.
 */
export async function compressPdfForUpload(buffer) {
  if (!buffer?.length) {
    const err = new Error('Empty PDF file');
    err.status = 400;
    throw err;
  }

  if (buffer.length > PDF_MAX_UPLOAD_BYTES) {
    const err = new Error(
      `PDF is too large. Maximum upload size is ${PDF_MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`
    );
    err.status = 400;
    throw err;
  }

  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const optimized = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const out = optimized.length < buffer.length ? Buffer.from(optimized) : buffer;
    const savedPct =
      buffer.length > 0
        ? Math.round((1 - out.length / buffer.length) * 100)
        : 0;
    if (savedPct > 0) {
      console.log(
        `PDF compressed: ${(buffer.length / 1024 / 1024).toFixed(2)}MB → ${(out.length / 1024 / 1024).toFixed(2)}MB (${savedPct}% smaller)`
      );
    }
    return out;
  } catch (error) {
    console.warn('PDF optimization skipped, uploading original:', error.message);
    return buffer;
  }
}
