// 1-backend/routes/transcribe.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const PYTHON_SERVICE_URL = (process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`✅ Created upload dir: ${UPLOAD_DIR}`);
}


const upload = multer({ dest: UPLOAD_DIR }); // temp file storage

// Transcription route
router.post('/transcribe', upload.single('file'), async (req, res) => {
  console.log('📥 [Node] /api/transcribe called');

  if (!req.file) {
    console.log('⚠️ [Node] No file found in request');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`📥 [Node] File received from frontend: ${req.file.originalname} (${req.file.path})`);

  const language = req.body.language || 'auto';
  const model = req.body.model || 'base';

  try {
    console.log('➡️ [Node] Preparing form to send to Flask service...');

    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
    form.append('language', language);
    form.append('model', model);

    const flaskUrl = `${PYTHON_SERVICE_URL}/transcribe`;
    console.log(`➡️ [Node] Sending to Flask: ${flaskUrl} (language=${language}, model=${model})`);

    const axiosConfig = {
      headers: {
        ...form.getHeaders()
      },
      timeout: 1000 * 60 * 10, // 10 minutes
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };

    const response = await axios.post(flaskUrl, form, axiosConfig);

    console.log('✅ [Node] Received response from Flask, forwarding to frontend');
    res.json(response.data);
  } catch (error) {
    // Detailed logging to find the real cause
    console.error('[Error] [Node] Error while forwarding to Flask:');
    console.error('message:', error.message);
    if (error.response) {
      console.error('status:', error.response.status);
      console.error('data:', error.response.data);
      console.error('headers:', error.response.headers);
    } else {
      console.error('no response from Flask (network/connect/timeouts?)');
    }
    console.error('stack:', error.stack);

    res.status(500).json({
      error: 'Failed to transcribe',
      details: (error.response && error.response.data) || error.message
    });
  } finally {
    // try to remove temp file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('⚠️ [Node] Failed to delete temp file:', req.file.path, err.message);
        else console.log('🧹 [Node] Temp file removed:', req.file.path);
      });
    }
  }
});

// Translation proxy endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, target_lang, source_lang } = req.body;
    const flaskUrl = `${PYTHON_SERVICE_URL}/translate`;
    const response = await axios.post(flaskUrl, { text, target_lang, source_lang }, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error('[Error] [Node] Error proxying translate:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to translate', details: error.message });
    }
  }
});

module.exports = router;
