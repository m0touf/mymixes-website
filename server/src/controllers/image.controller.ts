import { Request, Response } from 'express';
import { uploadImageToCloudinary } from '../services/image.service';
import { asyncHandler } from '../middlewares/asyncHandler';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const result = await uploadImageToCloudinary(req.file.buffer);
    
    res.json({
      success: true,
      imageUrl: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    });
  }
});
