import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import fetchData from '@/utils/fetchData';
import FormData from 'form-data';

// Configure multer for audio file uploads
const upload = multer({
  dest: 'uploads/', // Temporary directory for uploads
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// STT Middleware
export const sttMiddleware = [
  upload.single('audio'), // Expect 'audio' field in form-data
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const audioPath = req.file.path;
      const audioBuffer = fs.readFileSync(audioPath);

      // Prepare form data for OpenAI Whisper
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: req.file.originalname || 'audio',
        contentType: req.file.mimetype,
      });
      formData.append('model', process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1');

      // Call OpenAI proxy
      const transcription = await fetchData<{ text: string }>(
        (process.env.OPENAI_PROXY_URL || '') + '/v1/audio/transcriptions',
        {
          method: 'POST',
          body: formData as any,
        },
      );

      // Inject transcription into request body
      req.body.prompt = transcription.text;

      // Clean up the uploaded file
      fs.unlinkSync(audioPath);

      next();
    } catch (error) {
      // Clean up on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      next(error);
    }
  },
];