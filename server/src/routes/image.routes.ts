import { Router } from 'express';
import { uploadImage } from '../controllers/image.controller';
import { upload } from '../services/image.service';
import { auth } from '../middlewares/auth';

const router = Router();

// Upload image endpoint (protected)
router.post('/upload', auth, upload.single('image'), uploadImage);

export default router;
