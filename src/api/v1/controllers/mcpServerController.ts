import { NextFunction, Request, Response } from 'express';
import CustomError from '@/classes/CustomError';

const postMcp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'MCP Server Endpoint - not implemented yet' });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export { postMcp };
