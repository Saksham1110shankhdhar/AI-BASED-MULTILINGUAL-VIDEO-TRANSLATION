const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware layer
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MultiVidAI server running' });
});

// 🔹 Import and use your transcribe route
const transcribeRoute = require('./routes/transcribe');
app.use('/api', transcribeRoute); // all /api/transcribe and /api/translate requests go through this

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});



