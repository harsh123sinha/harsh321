import { useRef, useCallback } from 'react';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const ACCEPT_IMAGES = 'image/jpeg,image/jpg,image/png,image/webp,image/*';

function newItem(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    issue: null,
    checking: true,
  };
}

/**
 * Multi-image picker with thumbnails, remove (×), and per-image moderation feedback.
 */
export default function PropertyImagePicker({
  label,
  required = false,
  multiple = true,
  captureFacing = 'environment',
  items = [],
  onChange,
  moderatePath = '/properties/moderate-images',
  className = '',
}) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const resetInputs = () => {
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const moderateOne = useCallback(
    async (item) => {
      const fd = new FormData();
      fd.append('images', item.file);
      try {
        const { data } = await api.post(moderatePath, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = data.results?.[0];
        if (!result) return { ...item, checking: false };
        const issue =
          result.rejected || result.pending
            ? {
                rejected: Boolean(result.rejected),
                pending: Boolean(result.pending),
                userMessage: result.userMessage,
                code: result.code,
              }
            : null;
        return { ...item, issue, checking: false };
      } catch {
        return {
          ...item,
          checking: false,
          issue: {
            rejected: false,
            pending: true,
            userMessage: 'Could not verify this image — it may be reviewed after upload.',
            code: 'check_failed',
          },
        };
      }
    },
    [moderatePath]
  );

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !onChange) return;

    const fresh = files.map(newItem);
    const next = [...items, ...fresh];
    onChange(next);
    resetInputs();

    const checked = await Promise.all(fresh.map((item) => moderateOne(item)));
    const byId = Object.fromEntries(checked.map((i) => [i.id, i]));
    onChange(next.map((item) => byId[item.id] || item));
  };

  const removeItem = (id) => {
    const target = items.find((i) => i.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((i) => i.id !== id));
  };

  const hasRejected = items.some((i) => i.issue?.rejected);

  return (
    <div className={className}>
      {label && (
        <span className="block text-sm font-medium text-navy mb-2">
          {label}
          {required && ' *'}
        </span>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gold/50 bg-gold/10 px-3 py-2 text-sm font-medium text-navy hover:bg-gold/20 transition-colors touch-target"
        >
          <Camera className="h-4 w-4 text-gold" />
          Take photo
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-light bg-white px-3 py-2 text-sm font-medium text-navy hover:border-gold/40 transition-colors touch-target"
        >
          <ImagePlus className="h-4 w-4 text-gray" />
          {multiple ? 'Choose images' : 'Choose from gallery'}
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white shadow hover:bg-red-600 touch-manipulation"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {item.checking && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              {item.issue && (
                <p
                  className={`mt-1 rounded px-1.5 py-1 text-[10px] leading-snug ${
                    item.issue.rejected
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.issue.userMessage ||
                    (item.issue.rejected
                      ? 'This image cannot be used.'
                      : 'This image may need admin review.')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT_IMAGES}
        capture={captureFacing}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT_IMAGES}
        multiple={multiple}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}

/** Extract File[] safe to upload (no rejected images). */
export function filesFromImageItems(items) {
  return (items || [])
    .filter((i) => i?.file && !i.issue?.rejected)
    .map((i) => i.file);
}

export function hasRejectedImageItems(items) {
  return (items || []).some((i) => i.issue?.rejected);
}

export function hasCheckingImageItems(items) {
  return (items || []).some((i) => i.checking);
}
