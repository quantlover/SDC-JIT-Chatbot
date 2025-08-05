import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and audio files are allowed.'), false);
    }
  }
});

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
  url: string;
}

export async function processUploadedFile(file: Express.Multer.File): Promise<FileUploadResult> {
  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
    url: `/uploads/${file.filename}`
  };
}

export async function deleteFile(filename: string): Promise<boolean> {
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

export async function getFileMetadata(filename: string): Promise<FileUploadResult | null> {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    const stats = await fs.stat(filePath);
    
    return {
      filename,
      originalName: filename,
      size: stats.size,
      mimetype: 'application/octet-stream', // Default, could be enhanced
      path: filePath,
      url: `/uploads/${filename}`
    };
  } catch {
    return null;
  }
}