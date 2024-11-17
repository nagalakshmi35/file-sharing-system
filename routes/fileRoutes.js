const express = require('express');
const router = express.Router();
const {uploadFile, upload} = require("../controllers/fileController")

router.post('/uploads', upload.single('file'), uploadFile)

module.exports = router;
