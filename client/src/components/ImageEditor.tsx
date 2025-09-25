import { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  imageFile: File;
  onSave: (editedImage: File) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageFile, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(400);
  const [cropHeight, setCropHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      // Set initial crop to center of image
      const initialCrop = Math.min(img.width, img.height) * 0.8;
      setCropWidth(initialCrop);
      setCropHeight(initialCrop);
      setCropX((img.width - initialCrop) / 2);
      setCropY((img.height - initialCrop) / 2);
    };
    img.src = URL.createObjectURL(imageFile);
  }, [imageFile]);

  const drawImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image position to center it
    const imageAspect = image.width / image.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      drawHeight = canvas.height * scale;
      drawWidth = drawHeight * imageAspect;
    } else {
      drawWidth = canvas.width * scale;
      drawHeight = drawWidth / imageAspect;
    }
    
    drawX = (canvas.width - drawWidth) / 2;
    drawY = (canvas.height - drawHeight) / 2;

    // Save context
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw image
    ctx.drawImage(image, drawX - canvas.width / 2, drawY - canvas.height / 2, drawWidth, drawHeight);
    
    // Restore context
    ctx.restore();

    // Draw crop overlay
    const cropXScaled = (cropX / image.width) * drawWidth + drawX;
    const cropYScaled = (cropY / image.height) * drawHeight + drawY;
    const cropWidthScaled = (cropWidth / image.width) * drawWidth;
    const cropHeightScaled = (cropHeight / image.height) * drawHeight;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area
    ctx.clearRect(cropXScaled, cropYScaled, cropWidthScaled, cropHeightScaled);
    
    // Draw crop border
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropXScaled, cropYScaled, cropWidthScaled, cropHeightScaled);
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(cropXScaled - handleSize/2, cropYScaled - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropXScaled + cropWidthScaled - handleSize/2, cropYScaled - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropXScaled - handleSize/2, cropYScaled + cropHeightScaled - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropXScaled + cropWidthScaled - handleSize/2, cropYScaled + cropHeightScaled - handleSize/2, handleSize, handleSize);
  };

  useEffect(() => {
    drawImage();
  }, [image, rotation, scale, cropX, cropY, cropWidth, cropHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const deltaX = e.clientX - rect.left - dragStart.x;
    const deltaY = e.clientY - rect.top - dragStart.y;
    
    // Convert canvas coordinates to image coordinates
    const imageAspect = image.width / image.height;
    const canvasAspect = 600 / 400;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      drawHeight = 400 * scale;
      drawWidth = drawHeight * imageAspect;
    } else {
      drawWidth = 600 * scale;
      drawHeight = drawWidth / imageAspect;
    }
    
    drawX = (600 - drawWidth) / 2;
    drawY = (400 - drawHeight) / 2;
    
    const scaleX = image.width / drawWidth;
    const scaleY = image.height / drawHeight;
    
    setCropX(prev => Math.max(0, Math.min(image.width - cropWidth, prev + deltaX * scaleX)));
    setCropY(prev => Math.max(0, Math.min(image.height - cropHeight, prev + deltaY * scaleY)));
    
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to crop size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply rotation and scaling
    ctx.save();
    ctx.translate(cropWidth / 2, cropHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw cropped image
    ctx.drawImage(
      image,
      cropX, cropY, cropWidth, cropHeight,
      -cropWidth / 2, -cropHeight / 2, cropWidth, cropHeight
    );

    ctx.restore();

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
        onSave(editedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  if (!image) {
    return <div className="flex items-center justify-center p-8">Loading image...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Image</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                className="w-full border border-gray-600 rounded cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Drag to move crop area • Red corners show what will be saved
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rotation: {rotation}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>-180°</span>
                <span>0°</span>
                <span>180°</span>
              </div>
            </div>

            {/* Scale */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scale: {Math.round(scale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Crop Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width: {Math.round(cropWidth)}px
                </label>
                <input
                  type="range"
                  min="100"
                  max={image.width}
                  value={cropWidth}
                  onChange={(e) => setCropWidth(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height: {Math.round(cropHeight)}px
                </label>
                <input
                  type="range"
                  min="100"
                  max={image.height}
                  value={cropHeight}
                  onChange={(e) => setCropHeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation(0)}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Reset Rotation
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Reset Scale
                </button>
                <button
                  onClick={() => {
                    const size = Math.min(image.width, image.height) * 0.8;
                    setCropWidth(size);
                    setCropHeight(size);
                    setCropX((image.width - size) / 2);
                    setCropY((image.height - size) / 2);
                  }}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Center Crop
                </button>
                <button
                  onClick={() => {
                    setCropWidth(image.width);
                    setCropHeight(image.height);
                    setCropX(0);
                    setCropY(0);
                  }}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                >
                  Full Image
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Save & Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
