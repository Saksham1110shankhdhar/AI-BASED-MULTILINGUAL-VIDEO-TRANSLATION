import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translateMessage, setTranslateMessage] = useState("");
  const [language, setLanguage] = useState("auto");
  const [targetLang, setTargetLang] = useState("hi"); // New state for target language
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [modelSize, setModelSize] = useState("base");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("model", modelSize);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 minutes timeout for large files
      });
      setText(res.data.transcription || "No transcription found");
      setDetectedLanguage(res.data.detected_language || language);
    } catch (error) {
      console.error(error);
      let errorMessage = "Error during transcription!";
      
      if (error.code === "ECONNREFUSED") {
        errorMessage = "Could not connect to the backend server. Please make sure the Python microservice is running on port 8000.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. The file might be too large or processing took too long.";
      } else if (error.response) {
        errorMessage = `Error: ${error.response.data.error || error.response.data.message || "Unknown error"}`;
      }
      
      alert(errorMessage);
      setText("");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!text) return;
    setTranslateMessage('');
    try {
      // Normalize language code (convert to lowercase, handle "EN" -> "en")
      const sourceLang = detectedLanguage ? detectedLanguage.toLowerCase() : 'en';
      
      const res = await axios.post("http://localhost:3000/api/translate", {
        text,
        target_lang: targetLang,
        source_lang: sourceLang,
      });
  
      if (res.data.translated_text) {
        setTranslateMessage(res.data.translated_text);
      } else if (res.data.error) {
        setTranslateMessage("Error: " + (res.data.details || res.data.error));
      } else {
        setTranslateMessage("Unknown response");
      }
    } catch (err) {
      setTranslateMessage("Error: " + (err?.response?.data?.error || err.message));
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            🎤 MultiVidAI
          </h1>
          <p className="text-xl text-gray-300">
            Transcribe Video/Audio in 22 Indian Languages
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* File Upload Section */}
          <div className="mb-8">
            <label htmlFor="file-upload" className="block">
              <div className="relative">
                <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-400 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:border-blue-400 transition-all duration-300 cursor-pointer group">
                  <svg className="w-16 h-16 text-gray-400 group-hover:text-blue-400 transition-colors duration-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xl text-gray-300 font-semibold mb-2">
                    {file ? file.name : "Drop your audio or video file here"}
                  </p>
                  <p className="text-sm text-gray-400">
                    or <span className="text-blue-400 font-medium">browse files</span>
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="audio/*,video/*"
                  className="hidden"
                />
              </div>
            </label>
          </div>

          {/* Language Selector */}
          <div className="mb-6">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-3">
              Select Indian Language:
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="auto" style={{ background: '#1e293b', color: '#e2e8f0' }}>🌍 Auto-detect (Recommended)</option>
                <option value="hi" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Hindi (हिंदी)</option>
                <option value="bn" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Bengali (বাংলা)</option>
                <option value="te" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Telugu (తెలుగు)</option>
                <option value="mr" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Marathi (मराठी)</option>
                <option value="ta" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Tamil (தமிழ்)</option>
                <option value="gu" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Gujarati (ગુજરાતી)</option>
                <option value="ur" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Urdu (اردو)</option>
                <option value="kn" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Kannada (ಕನ್ನಡ)</option>
                <option value="or" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Odia (ଓଡ଼ିଆ)</option>
                <option value="ml" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Malayalam (മലയാളം)</option>
                <option value="pa" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="as" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 Assamese (অসমীয়া)</option>
                <option value="en" style={{ background: '#1e293b', color: '#e2e8f0' }}>🇮🇳 English</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {language === "auto" && (
              <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Whisper will automatically detect the Indian language from your audio/video
              </p>
            )}
          </div>

          {/* Model Size Selector */}
          <div className="mb-6">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-3">
              Model Size (Speed vs Accuracy):
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <select
                id="model-select"
                value={modelSize}
                onChange={(e) => setModelSize(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="tiny" style={{ background: '#1e293b', color: '#e2e8f0' }}>⚡ Tiny - Fastest (Lowest Accuracy)</option>
                <option value="base" style={{ background: '#1e293b', color: '#e2e8f0' }}>🚀 Base - Fast (Good Accuracy) ⭐ Recommended</option>
                <option value="small" style={{ background: '#1e293b', color: '#e2e8f0' }}>⚖️ Small - Balanced</option>
                <option value="medium" style={{ background: '#1e293b', color: '#e2e8f0' }}>🎯 Medium - Slower (High Accuracy)</option>
                <option value="large" style={{ background: '#1e293b', color: '#e2e8f0' }}>🏆 Large - Slowest (Best Accuracy)</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Audio...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upload & Transcribe
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
          </div>

          {/* Transcription Result */}
      {text && (
            <div className="mt-8">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-green-400">Transcribed Text</h3>
                  </div>
                  {detectedLanguage && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span>
                        {language === "auto" ? "Detected Language: " : "Transcribed in: "}
                        <span className="font-semibold text-green-400 uppercase">{detectedLanguage}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-line">{text}</p>
                </div>
              </div>
              {/* Week 6 Placeholder: Translate Text Button */}
              <div className="mt-4 flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:shadow-lg transition"
                  >
                    Translate Text
                  </button>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  >
                    <option value="hi" style={{ background: '#1e293b' }}>to Hindi (हिंदी)</option>
                    <option value="bn" style={{ background: '#1e293b' }}>to Bengali (বাংলা)</option>
                    <option value="te" style={{ background: '#1e293b' }}>to Telugu (తెలుగు)</option>
                    <option value="mr" style={{ background: '#1e293b' }}>to Marathi (मराठी)</option>
                    <option value="ta" style={{ background: '#1e293b' }}>to Tamil (தமிழ்)</option>
                    <option value="gu" style={{ background: '#1e293b' }}>to Gujarati (ગુજરાતી)</option>
                    <option value="ur" style={{ background: '#1e293b' }}>to Urdu (اردو)</option>
                    <option value="kn" style={{ background: '#1e293b' }}>to Kannada (ಕನ್ನಡ)</option>
                    <option value="or" style={{ background: '#1e293b' }}>to Odia (ଓଡ଼ିଆ)</option>
                    <option value="ml" style={{ background: '#1e293b' }}>to Malayalam (മലയാളം)</option>
                    <option value="pa" style={{ background: '#1e293b' }}>to Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="as" style={{ background: '#1e293b' }}>to Assamese (অসমীয়া)</option>
                    <option value="en" style={{ background: '#1e293b' }}>to English</option>
                  </select>
                </div>
                {translateMessage && (
                  <div className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg w-full">
                    <p className="font-semibold text-purple-300 mb-1">Translation:</p>
                    {translateMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Powered by React & OpenAI Whisper</p>
        </div>
      </div>
    </div>
  );
}

export default App;
