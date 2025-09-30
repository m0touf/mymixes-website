import { useState, useRef, useCallback, useMemo } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
}

export function ImageCropper({
  src,
  onCropComplete,
  onClose
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect] = useState<number | undefined>(1);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // ========= GLOBAL UI SCALE (change this) =========
  const UI_SCALE = 0.75; // 80% everywhere

  // Fit image fully and create centered crop; scale physical container by UI_SCALE
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    const MAX_H = Math.min(window.innerHeight * 0.7, 700);
    const MAX_W = Math.min(window.innerWidth - 96, 800);

    const ratio = img.naturalWidth / img.naturalHeight;

    let height = MAX_H;
    let width = height * ratio;
    if (width > MAX_W) {
      width = MAX_W;
      height = width / ratio;
    }

    const displayW = Math.round(width * UI_SCALE);
    const displayH = Math.round(height * UI_SCALE);
    setContainerSize({ width: displayW, height: displayH });

    const next = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, (aspect ?? 1), displayW, displayH),
      displayW,
      displayH
    );
    setCrop(next);
  }, [aspect, UI_SCALE]);

  const compressImage = async (blob: Blob, maxSizeKB: number = 500): Promise<Blob> => {
    if (blob.size <= maxSizeKB * 1024) return blob;
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const ratio = Math.sqrt((maxSizeKB * 1024) / blob.size);
        const newWidth = Math.floor(img.width * ratio);
        const newHeight = Math.floor(img.height * ratio);
        canvas.width = newWidth; canvas.height = newHeight;
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob((compressedBlob) => resolve(compressedBlob || blob), 'image/jpeg', 0.8);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.reject(new Error('No 2d context'));

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const outputWidth = Math.floor(crop.width * scaleX);
    const outputHeight = Math.floor(crop.height * scaleY);

    canvas.width = outputWidth; canvas.height = outputHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      Math.floor(crop.x * scaleX),
      Math.floor(crop.y * scaleY),
      Math.floor(crop.width * scaleX),
      Math.floor(crop.height * scaleY),
      0, 0,
      outputWidth, outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  };


  const handleApplyCrop = async () => {
    if (imgRef.current && completedCrop) {
      try {
        const pixelCrop = {
          x: Math.round(completedCrop.x),
          y: Math.round(completedCrop.y),
          width: Math.round(completedCrop.width),
          height: Math.round(completedCrop.height),
          unit: 'px' as const
        };
        const croppedImageBlob = await getCroppedImg(imgRef.current, pixelCrop);
        if (croppedImageBlob) {
          const compressedBlob = await compressImage(croppedImageBlob, 800);
          const croppedImageUrl = URL.createObjectURL(compressedBlob);
          onCropComplete(croppedImageUrl);
        }
      } catch (err) {
        console.error('Error cropping image:', err);
      }
    }
  };

  // ===== Crop Info (display & export px) =====
  const cropInfo = useMemo(() => {
    if (!imgRef.current || !completedCrop) return null;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const dispW = Math.max(0, Math.round(completedCrop.width));
    const dispH = Math.max(0, Math.round(completedCrop.height));
    const outW = Math.max(0, Math.round(completedCrop.width * scaleX));
    const outH = Math.max(0, Math.round(completedCrop.height * scaleY));
    const x = Math.max(0, Math.round(completedCrop.x));
    const y = Math.max(0, Math.round(completedCrop.y));

    return { x, y, dispW, dispH, outW, outH };
  }, [completedCrop]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-auto rounded-3xl border border-gray-600 bg-gray-900 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Crop Image</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-500 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

         {/* Simplified layout with just the cropper */}
         <div style={{ fontSize: `${UI_SCALE}em` }}>
           <div className="flex justify-center">
             {/* Cropper only */}
             <div className="max-w-2xl w-full">

              {/* Cropper */}
              <div className="mb-2">
                <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3 sm:p-4">
                  <div className="flex justify-center">
                    <div
                      className="
                        inline-flex items-center justify-center
                        rounded-xl border border-gray-700 overflow-hidden
                        bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.06)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(255,255,255,0.06)_75%),linear-gradient(-45deg,transparent_75%,rgba(255,255,255,0.06)_75%)]
                        bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]
                      "
                       style={{
                         width: containerSize.width ? `${containerSize.width}px` : undefined,
                         height: containerSize.height ? `${containerSize.height}px` : 'min(64vh, 560px)',
                       }}
                    >
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        minHeight={100}
                        minWidth={100}
                        className="mx-auto"
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={src}
                          draggable={false}
                          className="select-none block"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onLoad={onImageLoad}
                        />
                      </ReactCrop>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop info bar */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                  {cropInfo ? (
                    <>
                      <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700">
                        Pos: <span className="text-white font-semibold">{cropInfo.x}</span>, <span className="text-white font-semibold">{cropInfo.y}</span>
                      </span>
                      <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700">
                        Display: <span className="text-white font-semibold">{cropInfo.dispW}×{cropInfo.dispH}px</span>
                      </span>
                      <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700">
                        Export: <span className="text-white font-semibold">{cropInfo.outW}×{cropInfo.outH}px</span>
                      </span>
                      {aspect && (
                        <span className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700">
                          Aspect: <span className="text-white font-semibold">{aspect.toFixed(3)}</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Drag to create a crop to see dimensions…</span>
                  )}
                </div>
              </div>

               <div className="flex items-center justify-center gap-4 mt-6">
                 <button
                   onClick={onClose}
                   className="rounded-xl border border-gray-500 bg-gray-800 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-400 transition-all duration-200"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleApplyCrop}
                   disabled={!completedCrop}
                   className={`rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200 ${!completedCrop
                       ? 'cursor-not-allowed bg-gray-500'
                       : 'bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-600/25 hover:shadow-pink-600/40'
                     }`}
                 >
                   Apply Crop
                 </button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
