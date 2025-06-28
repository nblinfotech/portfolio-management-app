const fs = require('fs');
const path = require('path');
const getMulterUpload = require('../../common/multerConfig');

const catchAsync = require('../../utils/catchAsync');

// upload files to server
const uploadFiles = catchAsync((req, res) => {
  const filetype = req.params.filetype;

  const upload = getMulterUpload(filetype);

  // Note: files allowed for upload count
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: 'File upload failed', error: err.message });
    }

    if (!req.files.length) {
      return res.status(400).send({ message: 'File/File Type not allowed' });
    }

    res.status(200).send({ message: 'Files uploaded successfully', fileNames: req.files });
  });
});

// delete file from server
const deleteFile = catchAsync((req, res) => {
  const fileName = req.query.filename;
  const filePath = path.join(__dirname, '../../../temp/', fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).send({ message: 'File deletion failed', error: err.message });
    }
    res.status(200).send({ message: 'File deleted successfully' });
  });
});




module.exports = { uploadFiles, deleteFile };
