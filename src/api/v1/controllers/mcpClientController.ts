import { NextFunction, Request, Response } from 'express';
import CustomError from '@/classes/CustomError';
import { callMcpClient } from '@/mcp-client';
import fetchData from '@/utils/fetchData';

const postMcpClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      next(new CustomError('Prompt is required and must be a string', 400));
      return;
    }

    const result = await callMcpClient(prompt);

    // Generate TTS for the answer
    let audioBase64 = null;
    try {
      const ttsResponse = await fetchData<ArrayBuffer>(
        (process.env.OPENAI_PROXY_URL || '') + '/v1/audio/speech',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_TTS_MODEL || 'tts-1',
            input: result.answer,
            voice: 'alloy', // or other voices
          }),
        },
      );

      // Convert to base64
      const audioBuffer = Buffer.from(ttsResponse);
      audioBase64 = audioBuffer.toString('base64');
    } catch (ttsError) {
      console.warn('TTS generation failed:', ttsError);
      // Continue without audio
    }

    res.json({
      ...result,
      audio: audioBase64, // Base64 encoded audio, or null if failed
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export { postMcpClient };