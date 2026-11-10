
import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { LIMITS } from '../config/constants.js';



const fileFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }
  cb(null, true);
};


const buildUploader = ({ allowedMimeTypes, maxFileSizeMb, maxFiles, field, multiple = false }) => {
  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSizeMb * 1024 * 1024,
      files: maxFiles,
    },
    fileFilter: fileFilter(allowedMimeTypes),
  });

  const middleware = multiple
    ? uploader.array(field, maxFiles)
    : uploader.single(field);

  return { middleware, maxFiles };
};


const wrap = (multerMiddleware, maxFiles) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest(`File too large. Max size: ${LIMITS.MAX_FILE_SIZE_MB}MB`));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(ApiError.badRequest(`Too many files. Max: ${maxFiles}`));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        ApiError.badRequest(
          `Unexpected file field: ${err.field}. Check the field name in your form.`
        )
      );
    }
    return next(err);
  });
};

const profileUploader = buildUploader({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSizeMb: LIMITS.MAX_FILE_SIZE_MB,
  maxFiles: 1,
  field: 'profileImage',
  multiple: false,
});

const attachmentsUploader = buildUploader({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxFileSizeMb: LIMITS.MAX_FILE_SIZE_MB,
  maxFiles: LIMITS.MAX_ATTACHMENTS_PER_TRANSACTION,
  field: 'attachments',
  multiple: true,
});


export default {
  profilePicture: wrap(profileUploader.middleware, profileUploader.maxFiles),
  transactionAttachments: wrap(attachmentsUploader.middleware, attachmentsUploader.maxFiles),
};