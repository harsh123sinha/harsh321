import { useRef } from 'react';
import { Camera, ImagePlus } from 'lucide-react';

const ACCEPT_IMAGES = 'image/jpeg,image/jpg,image/png,image/webp,image/*';

/**
 * Image picker with explicit mobile camera + gallery options.
 * @param {'user'|'environment'} captureFacing - front camera for selfies, rear for documents
 */
export default function ImageCaptureInput({
  label,
  required = false,
  multiple = false,
  captureFacing = 'environment',
  accept = ACCEPT_IMAGES,
  previewUrl = '',
  previewUrls = [],
  previewShape = 'rectangle',
  onChange,
  className = '',
}) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const resetInputs = () => {
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const emitFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !onChange) return;
    onChange(files);
    resetInputs();
  };

  const previews = previewUrls?.length ? previewUrls : previewUrl ? [previewUrl] : [];
  const previewClass =
    previewShape === 'circle'
      ? 'h-24 w-24 rounded-full object-cover border-2 border-gold/40'
      : 'max-h-24 rounded-lg border object-contain';

  return (
    <div className={className}>
      {label && (
        <span className="block text-sm font-medium text-navy mb-2">
          {label}
          {required && ' *'}
        </span>
      )}

      {previews.length > 0 && (
        <div className={`mb-3 flex flex-wrap gap-2 ${previewShape === 'circle' ? '' : ''}`}>
          {previews.map((src, i) => (
            <img key={`${src}-${i}`} src={src} alt="" className={previewClass} />
          ))}
        </div>
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

      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture={captureFacing}
        className="hidden"
        onChange={(e) => emitFiles(e.target.files)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => emitFiles(e.target.files)}
      />
    </div>
  );
}
