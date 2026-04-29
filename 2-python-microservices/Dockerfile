FROM python:3.10-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Create uploads directories
RUN mkdir -p uploads/tts uploads/dubbed uploads/temp

# Expose port
EXPOSE 7860

# Start with waitress
CMD ["waitress-serve", "--host=0.0.0.0", "--port=7860", "app:app"]