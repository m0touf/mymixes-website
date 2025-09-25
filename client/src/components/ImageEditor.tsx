import { useState, useRef, useEffect } from "react";

interface ImageEditorProps {
  imageUrl: string;
  onImageChange: (newImageUrl: string) => void;
  onClose: () => void;
}

interface ImageTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
}

export function ImageEditor({ imageUrl, onImageChange, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load the image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageLoaded(true);
      // Reset transform when new image loads
      setTransform({
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
      });
    };
    img.src = imageUrl;
    imageRef.current = img;
  }, [imageUrl]);

  // Draw the image with current transform
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply transforms
    ctx.translate(transform.x, transform.y);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scale, transform.scale);

    // Draw image centered
    const imgWidth = img.width;
    const imgHeight = img.height;
    ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    // Restore context
    ctx.restore();
  }, [imageLoaded, transform]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale * delta)),
    }));
  };

  const rotateLeft = () => {
    setTransform(prev => ({
      ...prev,
      rotation: prev.rotation - 90,
    }));
  };

  const rotateRight = () => {
    setTransform(prev => ({
      ...prev,
      rotation: prev.rotation + 90,
    }));
  };

  const resetTransform = () => {
    setTransform({
      scale: 1,
      rotation: 0,
      x: 0,
      y: 0,
    });
  };

  const applyChanges = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!ctx) return;

    // Create a new canvas for the final image
    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");

    if (!finalCtx) return;

    // Set final canvas size to match the original image dimensions
    finalCanvas.width = img.width;
    finalCanvas.height = img.height;

    // Clear and draw the transformed image
    finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCtx.save();

    // Apply the same transforms
    finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
    finalCtx.translate(transform.x, transform.y);
    finalCtx.rotate((transform.rotation * Math.PI) / 180);
    finalCtx.scale(transform.scale, transform.scale);

    // Draw the image
    finalCtx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    finalCtx.restore();

    // Convert to data URL and apply
    const newImageUrl = finalCanvas.toDataURL("image/jpeg", 0.9);
    onImageChange(newImageUrl);
    onClose();
  };

  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="rounded-2xl bg-gray-800 p-8">
          <div className="text-center text-white">Loading image...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-2xl rounded-2xl bg-gray-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Edit Image</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        <div className="mb-4 text-center">
          <div className="mb-2 text-sm text-gray-400">
            Drag to move • Scroll to zoom • Use buttons to rotate
          </div>
          <div
            className="relative mx-auto inline-block cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              className="rounded-lg border border-gray-600"
              style={{ width: 400, height: 400 }}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-4">
          <button
            onClick={rotateLeft}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            ↺ Rotate Left
          </button>
          <button
            onClick={rotateRight}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            ↻ Rotate Right
          </button>
          <button
            onClick={resetTransform}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-600 bg-gray-700 px-6 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={applyChanges}
            className="rounded-lg bg-pink-600 px-6 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
