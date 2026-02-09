// Global type declarations
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

export {};