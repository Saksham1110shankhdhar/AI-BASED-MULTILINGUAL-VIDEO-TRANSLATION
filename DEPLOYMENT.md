# MultiVidAI Deployment Guide

MultiVidAI deploys as three services:

1. React frontend: `3-frontend/frontend`
2. Node/Express API: `1-backend`
3. Python/Flask media service: `2-python-microservices`

## Required Environment Variables

### Frontend

Set these in the frontend host before running `npm run build`:

```env
REACT_APP_API_BASE_URL=https://your-node-api.example.com
REACT_APP_PYTHON_API_BASE_URL=https://your-python-service.example.com
```

Build command:

```bash
npm ci
npm run build
```

Publish directory:

```text
build
```

### Node API

Set these in the backend host:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=https://your-frontend.example.com
PYTHON_SERVICE_URL=https://your-python-service.example.com
```

Install and start:

```bash
npm ci
npm start
```

Health check:

```text
/api/health
```

### Python Media Service

Set these in the Python service host:

```env
PORT=8000
CLIENT_ORIGIN=https://your-frontend.example.com
FFMPEG_BINARY=/usr/bin/ffmpeg
```

Install and start:

```bash
pip install -r requirements.txt
waitress-serve --host=0.0.0.0 --port=$PORT app:app
```

Health check:

```text
/health
```

## Deployment Notes

- The Wav2Lip `.pth` model files are tracked with Git LFS. Make sure your deployment platform pulls LFS files or run `git lfs pull` during setup.
- FFmpeg must be available on the Python service. Use a platform package such as `apt install ffmpeg`, or set `FFMPEG_BINARY` to a bundled binary path.
- Large video processing is CPU/GPU intensive. Use a host with enough memory and request timeout for long uploads and dubbing jobs.
- `CLIENT_ORIGIN` supports comma-separated URLs, useful for production plus preview domains.
- Keep real `.env` files out of git. Use the `.env.example` files as templates.
