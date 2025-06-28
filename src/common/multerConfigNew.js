const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


const validExtensions = {
  images: ['.jpg', '.jpeg', '.png', '.gif','.webp'],
  documents: ['.doc', '.docx', '.pdf', '.xls', '.xlsx'],
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    const newFilename = `${uniqueSuffix}${extension}`;
    cb(null, newFilename);
  },
});


const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isImage = validExtensions.images.includes(extension);
  const isDocument = validExtensions.documents.includes(extension);

  if (isImage || isDocument) {
    cb(null, true); 
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed!'), false); 
  }
};


const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
    fileFilter: fileFilter,
  });
  
  module.exports = upload;
