const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const mimeTypes = {
  files: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'application/vnd.ms-powerpoint', // For .ppt files
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // For .pptx files
  ],
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
   // absolute path here
   const tempDir = path.resolve(process.cwd(), 'temp');
    
   //ensure the temp directory exists
   if (!fs.existsSync(tempDir)) {
     fs.mkdirSync(tempDir, { recursive: true });
   }
   cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const newFilename = `${uniqueSuffix}${extension}`;
    cb(null, newFilename);
  },
});

const fileFilter = (filetype) => (req, file, cb) => {
  const allowedTypes = mimeTypes[filetype];
  if (allowedTypes && allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${filetype} are allowed!`), false);
  }
};

const getMulterUpload = (filetype) =>
  multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024 }, // MAX_FILE_SIZE from .env or default to 10 MB
    fileFilter: fileFilter(filetype),
  });

module.exports = getMulterUpload;
