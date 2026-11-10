
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';


const UPLOAD_ROOT = path.resolve(process.cwd(), config.upload.dir);
const PROFILE_PICTURES_DIR = path.join(UPLOAD_ROOT, 'profile_pictures');
const TRANSACTION_ATTACHMENTS_DIR = path.join(
  UPLOAD_ROOT,
  'transaction_attachments'
);
const REPORT_EXPORTS_DIR = path.join(UPLOAD_ROOT, 'report_exports');

const SUBFOLDERS = {
  profilePictures: PROFILE_PICTURES_DIR,
  transactionAttachments: TRANSACTION_ATTACHMENTS_DIR,
  reportExports: REPORT_EXPORTS_DIR,
};


const assertSafePath = (filePath) => {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(UPLOAD_ROOT + path.sep)) {
    throw ApiError.badRequest('Invalid file path');
  }
  return resolved;
};


const ensureDirectories = async () => {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
  await Promise.all(
    Object.values(SUBFOLDERS).map((dir) =>
      fs.mkdir(dir, { recursive: true })
    )
  );
};


const saveFile = async (file, options) => {
  if (!file) throw ApiError.badRequest('No file provided');

  const folder = SUBFOLDERS[options.folder];
  if (!folder) throw ApiError.badRequest(`Unknown folder: ${options.folder}`);

  
  const originalFileName = file.originalname;
  const extension = path.extname(originalFileName).toLowerCase();
  const storedFileName = `${crypto.randomUUID()}${extension}`;
  const filePath = path.join(folder, storedFileName);

  
  await fs.mkdir(folder, { recursive: true });

  
  if (file.buffer) {
    await fs.writeFile(filePath, file.buffer);
  } else if (file.path) {
    
    await fs.rename(file.path, filePath);
  } else {
    throw ApiError.badRequest('Uploaded file has neither buffer nor path');
  }

  return {
    originalFileName,
    storedFileName,
    filePath,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
};



const deleteFile = async (filePath) => {
  if (!filePath) return { deleted: false };

  let absolutePath;
  try {
    absolutePath = assertSafePath(filePath);
  } catch (err) {
    
    logger.warn('Refused to delete file outside upload root', { filePath });
    return { deleted: false };
  }

  try {
    await fs.unlink(absolutePath);
    return { deleted: true };
  } catch (err) {
    if (err.code === 'ENOENT') {
      
      return { deleted: false };
    }
    
    logger.error('Failed to delete file', {
      filePath: absolutePath,
      error: err.message,
    });
    throw ApiError.internal('Failed to delete file');
  }
};


const getAbsolutePath = (filePath) => {
  return assertSafePath(filePath);
};


const buildPublicUrl = (filePath) => {
  if (!filePath) return null;
  const relative = path.relative(UPLOAD_ROOT, filePath).split(path.sep).join('/');
  return `${config.app.apiPrefix}/static/uploads/${relative}`;
};


const getUploadRoot = () => UPLOAD_ROOT;


export default {
  ensureDirectories,
  saveFile,
  deleteFile,
  getAbsolutePath,
  buildPublicUrl,
  getUploadRoot,
};