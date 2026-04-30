FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# ✅ ADD THIS — Install Argos language packages
RUN python -c "\
from argostranslate import package; \
package.update_package_index(); \
available = package.get_available_packages(); \
needed = [('en','hi'),('en','bn'),('en','ur'),('hi','en'),('bn','en'),('ur','en')]; \
[package.install_from_path(p.download()) for f,t in needed for p in available if p.from_code==f and p.to_code==t]"

COPY . .

RUN mkdir -p uploads/tts uploads/dubbed uploads/temp

EXPOSE 7860

CMD ["waitress-serve", "--host=0.0.0.0", "--port=7860", "app:app"]