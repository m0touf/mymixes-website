import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { 
  centerCrop, 
  makeAspectCrop
} from 'react-image-crop';
import type { 
  Crop, 
  PixelCrop
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
  recipeTitle?: string;
  recipeDescription?: string;
}

export function ImageCropper({ src, onCropComplete, onClose, recipeTitle, recipeDescription }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1); // Start with square (1:1)
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a center crop that's 80% of the image size
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, [aspect]);

  // Function to compress image if it's too large
  const compressImage = async (blob: Blob, maxSizeKB: number = 500): Promise<Blob> => {
    if (blob.size <= maxSizeKB * 1024) {
      return blob;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions to reduce file size
        const ratio = Math.sqrt((maxSizeKB * 1024) / blob.size);
        const newWidth = Math.floor(img.width * ratio);
        const newHeight = Math.floor(img.height * ratio);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (compressedBlob) => {
            resolve(compressedBlob || blob);
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.src = URL.createObjectURL(blob);
    });
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: PixelCrop,
    size?: { width: number; height: number }
  ): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.reject(new Error('No 2d context'));
    }

    // Calculate the scale factors between the displayed image and natural image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Determine output dimensions
    const outputWidth = size ? size.width : Math.floor(crop.width * scaleX);
    const outputHeight = size ? size.height : Math.floor(crop.height * scaleY);

    // Set canvas dimensions
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Set image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      Math.floor(crop.x * scaleX),      // Source X
      Math.floor(crop.y * scaleY),      // Source Y
      Math.floor(crop.width * scaleX),  // Source width
      Math.floor(crop.height * scaleY), // Source height
      0,                                // Destination X
      0,                                // Destination Y
      outputWidth,                      // Destination width
      outputHeight                      // Destination height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.7 // Reduced quality for smaller file size
      );
    });
  };

  // Generate preview when crop changes
  const generatePreview = useCallback(async () => {
    if (imgRef.current && completedCrop) {
      try {
        // Convert percentage crop to pixel crop if needed
        const pixelCrop = {
          x: Math.round(completedCrop.x),
          y: Math.round(completedCrop.y),
          width: Math.round(completedCrop.width),
          height: Math.round(completedCrop.height),
          unit: 'px' as const
        };

        const blob = await getCroppedImg(
          imgRef.current,
          pixelCrop,
          { width: 300, height: 300 } // Standard preview size
        );
        
        if (blob) {
          // Clean up previous URL to prevent memory leaks
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    }
  }, [completedCrop, previewUrl]);

  // Generate preview when crop changes
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const handleApplyCrop = async () => {
    if (imgRef.current && completedCrop) {
      try {
        // Convert percentage crop to pixel crop if needed
        const pixelCrop = {
          x: Math.round(completedCrop.x),
          y: Math.round(completedCrop.y),
          width: Math.round(completedCrop.width),
          height: Math.round(completedCrop.height),
          unit: 'px' as const
        };

        const croppedImageBlob = await getCroppedImg(
          imgRef.current,
          pixelCrop
        );
        
        if (croppedImageBlob) {
          // Compress the image to reduce file size
          const compressedBlob = await compressImage(croppedImageBlob, 500); // Max 500KB
          console.log(`Original size: ${(croppedImageBlob.size / 1024).toFixed(1)}KB, Compressed size: ${(compressedBlob.size / 1024).toFixed(1)}KB`);
          
          const croppedImageUrl = URL.createObjectURL(compressedBlob);
          onCropComplete(croppedImageUrl);
        }
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  const aspectOptions = [
    { label: 'Square (List Card)', value: 1 },
    { label: 'Wide (Detail Page)', value: 16/9 },
    { label: 'Free', value: undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-auto rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Crop Image</h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cropper Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2 flex-wrap">
                {aspectOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setAspect(option.value)}
                    className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                      aspect === option.value
                        ? 'bg-pink-600 text-white'
                        : 'border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minHeight={100}
                minWidth={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={src}
                  className="max-h-[400px] w-auto"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCrop}
                disabled={!completedCrop}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                  !completedCrop
                    ? 'cursor-not-allowed bg-gray-500'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                Apply Crop
              </button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-200">Live Preview</h3>
              
              {previewUrl && completedCrop ? (
                <div className="space-y-4">
                  {/* List Card Preview */}
                  <div>
                    <div className="mb-2 text-sm font-medium text-gray-300">List Card</div>
                    <article className="overflow-hidden rounded-xl border border-gray-600 bg-gray-700 shadow-sm">
                      <div className="aspect-square w-full overflow-hidden bg-gray-600">
                        <img
                          src={previewUrl}
                          alt="List card preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="line-clamp-1 text-sm font-semibold">{recipeTitle || "Recipe Title"}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                          {recipeDescription || "Recipe description will appear here"}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          3 ingredients
                        </div>
                      </div>
                    </article>
                  </div>

                  {/* Detail View Preview */}
                  <div>
                    <div className="mb-2 text-sm font-medium text-gray-300">Detail Page</div>
                    <div className="overflow-hidden rounded-xl border border-gray-600 bg-gray-700 shadow-sm">
                      <img 
                        src={previewUrl} 
                        alt="Detail page preview" 
                        className="aspect-video w-full object-cover" 
                      />
                      <div className="p-3">
                        <h4 className="text-base font-semibold">{recipeTitle || "Recipe Title"}</h4>
                        <p className="mt-1 text-xs text-gray-400">
                          {recipeDescription || "Recipe description will appear here"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-gray-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    Crop the image to see previews
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
