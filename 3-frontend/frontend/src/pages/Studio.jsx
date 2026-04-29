import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { pythonApiUrl } from "../config/api";

const sidebarItems = [
  { icon: "🏠", label: "Home",   to: "/" },
  { icon: "🎬", label: "Studio", to: "/studio" },
  { icon: "🎙", label: "Voices", to: "/voices" },
  { icon: "📖", label: "Docs",   to: "/docs" },
  { icon: "ℹ️",  label: "About",  to: "/about" },
];

const LANGS = [
  { value: "auto", label: "Auto detect" },
  { value: "en",   label: "English" },
  { value: "hi",   label: "Hindi" },
  { value: "bn",   label: "Bengali" },
  { value: "ta",   label: "Tamil" },
  { value: "te",   label: "Telugu" },
  { value: "mr",   label: "Marathi" },
  { value: "gu",   label: "Gujarati" },
  { value: "ur",   label: "Urdu" },
  { value: "kn",   label: "Kannada" },
  { value: "ml",   label: "Malayalam" },
  { value: "pa",   label: "Punjabi" },
  { value: "or",   label: "Odia" },
  { value: "as",   label: "Assamese" },
];

const TARGET_LANGS = LANGS.filter(l => l.value !== "auto");

export default function Studio() {
  const location                                = useLocation();
  const { dark }                                = useTheme();
  const [activeTab, setActiveTab]               = useState("dub");
  const [file, setFile]                         = useState(null);
  const [text, setText]                         = useState("");
  const [loading, setLoading]                   = useState(false);
  const [translateMessage, setTranslateMessage] = useState("");
  const [language, setLanguage]                 = useState("auto");
  const [targetLang, setTargetLang]             = useState("hi");
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [modelSize, setModelSize]               = useState("base");
  const [ttsLang, setTtsLang]                   = useState("hi");
  const [voiceProfile, setVoiceProfile]         = useState("female");
  const [audioUrl, setAudioUrl]                 = useState(null);
  const [statusMessage, setStatusMessage]       = useState("Waiting for a media file");
  const [errorMessage, setErrorMessage]         = useState("");
  const [dubLoading, setDubLoading]             = useState(false);
  const [dubVideoUrl, setDubVideoUrl]           = useState(null);
  const [dubProgress, setDubProgress]           = useState("");
  const [dragOver, setDragOver]                 = useState(false);

  const hasTranscription = Boolean(text);
  const hasTranslation   = Boolean(translateMessage);
  const isProcessing     = loading || dubLoading;

  // ── Premium theme tokens ──
  const t = {
    // Page
    pageBg:      dark ? "bg-[#030616]"
                      : "bg-[#f8f7ff]",
    // Sidebar
    sidebarBg:   dark ? "bg-[#0a0d1a] border-white/5"
                      : "bg-white border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.06)]",
    // Right panel
    panelBg:     dark ? "bg-[#0a0d1a] border-white/5"
                      : "bg-white border-slate-200 shadow-[-4px_0_24px_rgba(0,0,0,0.06)]",
    // Top bar
    topbarBg:    dark ? "bg-[#0a0d1a]/80 border-white/5 backdrop-blur-xl"
                      : "bg-white/90 border-slate-200 backdrop-blur-xl",
    // Cards
    cardBg:      dark ? "bg-white/[0.04] border-white/8"
                      : "bg-white border-slate-200 shadow-[0_2px_12px_rgba(99,91,255,0.07)]",
    // Inputs
    inputBg:     dark ? "bg-[#12162a] border-white/10 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white",
    // Divider
    divider:     dark ? "bg-white/5" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent",
    // Text
    textPrimary: dark ? "text-white"     : "text-slate-900",
    textSec:     dark ? "text-slate-400" : "text-slate-600",
    textMuted:   dark ? "text-slate-500" : "text-slate-500",
    textXs:      dark ? "text-slate-600" : "text-slate-400",
    tipText:     dark ? "text-slate-400" : "text-slate-600",
    labelText:   dark ? "text-slate-500" : "text-slate-500",
    // Nav
    navLink:     dark ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-purple-50 hover:text-purple-700",
    navActive:   dark ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border-l-2 border-purple-400"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200",
    // Mode buttons
    modeActive:  dark ? "bg-gradient-to-r from-purple-600/30 to-pink-500/20 border-purple-500/40 text-white"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-md shadow-purple-200",
    modeInactive:dark ? "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                      : "border-transparent text-slate-500 hover:bg-purple-50 hover:text-purple-700",
    // Status card
    statusCard:  dark ? "bg-white/[0.03] border-white/5"
                      : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100",
    // Buttons
    resetBtn:    dark ? "border-white/10 text-slate-400 hover:border-white/30 hover:text-white hover:bg-white/5"
                      : "border-slate-300 bg-white text-slate-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 shadow-sm",
    copyBtn:     dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/30"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-400 hover:text-purple-700 shadow-sm",
    // Steps
    stepDone:    dark ? "border-emerald-400 bg-emerald-500 text-white shadow-emerald-900/30"
                      : "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200",
    stepActive:  dark ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 animate-pulse"
                      : "border-amber-400 bg-amber-400 text-white animate-pulse shadow-md shadow-amber-200",
    stepPending: dark ? "border-white/20 bg-white/5 text-slate-500"
                      : "border-slate-200 bg-white text-slate-400 shadow-sm",
  };

  // ── Select classes ──
  const selectCls = `w-full rounded-xl border px-3 py-2.5 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all duration-200 ${t.inputBg}`;

  // ── Pipeline steps ──
  const stepperItems = useMemo(() => [
    { label: "Upload",      description: file ? file.name : "Drop audio/video",                                               done: Boolean(file) },
    { label: "Transcribe",  description: hasTranscription ? `Detected: ${detectedLanguage || language}` : "Speech to text",  done: hasTranscription },
    { label: "Translate",   description: hasTranslation ? `→ ${targetLang}` : "Optional",                                    done: hasTranslation },
    { label: "Voice Style", description: `Tone: ${voiceProfile}`,                                                             done: Boolean(voiceProfile) },
    { label: "Voiceover",   description: audioUrl ? "Preview ready ✓" : "Generate AI voice",                                 done: Boolean(audioUrl) },
  ], [file, hasTranscription, detectedLanguage, language, hasTranslation, targetLang, voiceProfile, audioUrl]);

  // ── Handlers (all original, untouched) ──
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f); setText(""); setTranslateMessage(""); setAudioUrl(null);
    setVoiceProfile("female");
    setStatusMessage(f ? "Ready to process" : "Waiting for a media file");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setText(""); setTranslateMessage(""); setAudioUrl(null); setStatusMessage("Ready to process"); }
  };

  const handleUpload = async () => {
    if (!file) { alert("Please select a file first!"); return; }
    const formData = new FormData();
    formData.append("file", file); formData.append("language", language); formData.append("model", modelSize);
    setLoading(true); setErrorMessage(""); setStatusMessage("Uploading and transcribing…");
    try {
      const res = await axios.post(pythonApiUrl("/transcribe"), formData, { headers: { "Content-Type": "multipart/form-data" }, timeout: 900000 });
      setText(res.data.transcription || "No transcription found");
      setDetectedLanguage(res.data.detected_language || language);
      setStatusMessage("Transcription completed");
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || error?.message || "Transcription failed.");
      setText(""); setStatusMessage("Something went wrong");
    } finally { setLoading(false); }
  };

  const handleTranslate = async () => {
    if (!text) return;
    setTranslateMessage(""); setErrorMessage(""); setStatusMessage("Translating text…");
    try {
      const sourceLang = detectedLanguage ? detectedLanguage.toLowerCase() : "en";
      const res = await axios.post(pythonApiUrl("/translate"), { text, source_lang: sourceLang, target_lang: targetLang });
      if (res.data.translated_text) { setTranslateMessage(res.data.translated_text); setStatusMessage("Translation ready"); }
      else { setTranslateMessage("Translation failed!"); setStatusMessage("Translation failed"); }
    } catch (err) { setTranslateMessage("Error: " + err.message); setErrorMessage(err.message); setStatusMessage("Translation failed"); }
  };

  const handleTTS = async () => {
    if (!translateMessage) return;
    setStatusMessage("Generating synthetic voice…"); setErrorMessage("");
    try {
      const res = await axios.post(pythonApiUrl("/tts"), { text: translateMessage, lang: ttsLang, voice: voiceProfile });
      if (res.data.audio_url) { setAudioUrl(pythonApiUrl(res.data.audio_url)); setStatusMessage("Voiceover created"); }
      else setStatusMessage("TTS failed");
    } catch (err) { setStatusMessage("TTS failed"); setErrorMessage(err.message); }
  };

  const resetPipeline = () => {
    setFile(null); setText(""); setTranslateMessage(""); setAudioUrl(null);
    setDetectedLanguage(null); setVoiceProfile("female");
    setStatusMessage("Waiting for a media file"); setErrorMessage("");
    setDubVideoUrl(null); setDubProgress("");
  };

  const handleDubVideo = async () => {
    if (!file) { alert("Please select a video file first!"); return; }
    const formData = new FormData();
    formData.append("file", file); formData.append("source_lang", language);
    formData.append("target_lang", targetLang); formData.append("voice", voiceProfile);
    formData.append("translate", "true"); formData.append("model_size", modelSize);
    setDubLoading(true); setErrorMessage(""); setDubProgress("Starting dubbing pipeline..."); setDubVideoUrl(null);
    try {
      setDubProgress("Step 1/4: Transcribing video...");
      const res = await axios.post(pythonApiUrl("/dub/dub"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 1800000,
        onUploadProgress: (p) => setDubProgress(`Uploading: ${Math.round((p.loaded * 100) / p.total)}%`),
      });
      if (res.data.success && res.data.video_url) {
        setDubVideoUrl(pythonApiUrl(res.data.video_url));
        setDubProgress("Dubbing completed successfully!");
        setStatusMessage("Professional dubbed video ready!");
      } else throw new Error("Dubbing failed - no video URL returned");
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || error?.message || "Dubbing failed.");
      setDubProgress("Dubbing failed");
    } finally { setDubLoading(false); }
  };

  // ── Section label component ──
  const SectionLabel = ({ children }) => (
    <p className={`mb-3 text-[10px] font-bold uppercase tracking-[0.15em] ${t.labelText}`}>{children}</p>
  );

  return (
    <div className={`flex flex-col lg:flex-row min-h-[calc(100vh-56px)] transition-colors duration-300 ${t.pageBg} ${t.textPrimary}`}>

      {/* ══════════════════════════════════
          MOBILE TOP BAR
      ══════════════════════════════════ */}
      <div className={`flex items-center justify-between border-b px-4 py-3 lg:hidden ${dark ? "border-white/5 bg-[#0a0d1a]" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-xs font-bold text-white shadow-md">M</div>
          <span className={`text-sm font-bold ${t.textPrimary}`}>Studio</span>
        </div>
        <div className={`flex rounded-xl border p-1 gap-1 ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
          {[{ id: "dub", label: "🎬 Dub" }, { id: "transcribe", label: "📝 Transcribe" }].map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === m.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : t.textMuted
              }`}>
              {m.label}
            </button>
          ))}
        </div>
        <span className={`h-2 w-2 rounded-full ${isProcessing ? "animate-pulse bg-yellow-400" : "bg-emerald-400"}`} />
      </div>

      {/* ══════════════════════════════════
          LEFT SIDEBAR
      ══════════════════════════════════ */}
      <aside className={`hidden w-[220px] flex-shrink-0 flex-col border-r lg:flex transition-colors duration-300 ${t.sidebarBg}`}>

        {/* Logo */}
        <div className={`border-b px-5 py-4 ${dark ? "border-white/5" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-200">M</div>
            <div>
              <p className={`text-sm font-extrabold tracking-tight ${t.textPrimary}`}>MultiVidAI</p>
              <p className={`text-[10px] uppercase tracking-widest ${t.textMuted}`}>Studio v2</p>
            </div>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="px-3 pt-5 pb-3">
          <SectionLabel>Mode</SectionLabel>
          <div className="space-y-1.5">
            {[
              { id: "dub",        icon: "🎬", label: "Pro Dubbing",  desc: "Lip-sync video" },
              { id: "transcribe", icon: "📝", label: "Transcribe",   desc: "Speech to text" },
            ].map((m) => (
              <button key={m.id} onClick={() => setActiveTab(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                  activeTab === m.id ? t.modeActive : t.modeInactive
                }`}>
                <span className="text-lg">{m.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className={`text-[10px] ${activeTab === m.id ? "opacity-70" : t.textMuted}`}>{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`mx-4 h-px ${t.divider}`} />

        {/* Navigation */}
        <div className="px-3 py-3">
          <SectionLabel>Navigate</SectionLabel>
          <div className="space-y-0.5">
            {sidebarItems.map((item) => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.to ? t.navActive : t.navLink
                }`}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Status card */}
        <div className={`mt-auto border-t px-4 py-4 ${dark ? "border-white/5" : "border-slate-100"}`}>
          <div className={`rounded-xl border p-3 ${t.statusCard}`}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isProcessing ? "animate-pulse bg-yellow-400" : "bg-emerald-400"}`} />
              <p className={`text-xs font-bold ${t.textPrimary}`}>{isProcessing ? "Processing…" : "Ready"}</p>
            </div>
            <p className={`text-[10px] leading-relaxed line-clamp-2 ${t.textMuted}`}>{statusMessage}</p>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════
          CENTER WORKSPACE
      ══════════════════════════════════ */}
      <main className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <div className={`hidden items-center justify-between border-b px-6 py-3 lg:flex ${t.topbarBg}`}>
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${isProcessing ? "animate-pulse bg-yellow-400" : "bg-emerald-400"}`} />
            <span className={`text-xs font-semibold uppercase tracking-widest ${t.textSec}`}>
              {activeTab === "dub" ? "Wav2Lip Dubbing Pipeline" : "Whisper Transcription Pipeline"}
            </span>
          </div>
          <div className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest ${t.textXs}`}>
            <span>22 Languages</span>
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-white/20" : "bg-slate-300"}`} />
            <span>Neural TTS</span>
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-white/20" : "bg-slate-300"}`} />
            <span>Wav2Lip GAN</span>
          </div>
        </div>

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-7">

          {/* ── DUB MODE ── */}
          {activeTab === "dub" && (
            <div className="space-y-5">

              {/* HERO UPLOAD ZONE */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  file        ? dark ? "border-emerald-500/50 bg-emerald-500/5" : "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
                  : dragOver  ? dark ? "border-purple-400 bg-purple-500/10 scale-[1.01]" : "border-purple-500 bg-purple-50 scale-[1.01] shadow-xl shadow-purple-100"
                  : dark      ? "border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-500/5"
                              : "border-purple-200 bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100/60 shadow-md"
                }`}
              >
                <label htmlFor="dub-file" className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 p-10 text-center">
                  {file ? (
                    <>
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg ${dark ? "bg-emerald-500/20" : "bg-emerald-100"}`}>✅</div>
                      <div>
                        <p className={`text-base font-bold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>{file.name}</p>
                        <p className={`text-sm ${t.textMuted}`}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg ${dark ? "bg-purple-500/20" : "bg-purple-100"}`}>🎬</div>
                      <div>
                        <p className={`text-lg font-extrabold tracking-tight ${t.textPrimary}`}>Drop your video here</p>
                        <p className={`mt-1 text-sm ${t.textMuted}`}>MP4, MOV, AVI · max 2GB · Clear face visibility for best lip-sync</p>
                      </div>
                      <span className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        dark ? "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                             : "border-purple-300 bg-white text-purple-700 shadow-md hover:shadow-lg hover:border-purple-400"
                      }`}>
                        Browse files →
                      </span>
                    </>
                  )}
                  <input id="dub-file" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${dark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"}`}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Progress */}
              {dubProgress && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  dubProgress.includes("failed") || dubProgress.includes("Failed")
                    ? dark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"
                    : dubProgress.includes("completed")
                    ? dark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                    : dark ? "border-purple-500/30 bg-purple-500/10 text-purple-300" : "border-purple-200 bg-purple-50 text-purple-700 shadow-sm"
                }`}>
                  <div className="flex items-center gap-2">
                    {dubLoading && <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />}
                    {dubProgress}
                  </div>
                  {dubLoading && (
                    <div className={`mt-2.5 h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-purple-100"}`}>
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Dubbed video */}
              {dubVideoUrl && (
                <div className={`rounded-2xl border p-5 ${dark ? "border-emerald-400/30 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50 shadow-md shadow-emerald-100"}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-emerald-400" : "text-emerald-600"}`}>✅ Dubbed Video Ready</p>
                      <p className={`text-sm ${t.textSec}`}>Professional lip-synced output</p>
                    </div>
                    <a href={dubVideoUrl} download
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all hover:scale-105 ${
                        dark ? "border-white/20 bg-white/5 text-white hover:border-white/40"
                             : "border-emerald-300 bg-white text-emerald-700 shadow-md hover:shadow-lg"
                      }`}>
                      ⬇ Download
                    </a>
                  </div>
                  <video className="w-full rounded-xl shadow-lg" controls src={dubVideoUrl} />
                  {/* Waveform */}
                  <div className={`mt-4 rounded-xl border p-3 ${dark ? "border-white/5 bg-white/[0.03]" : "border-slate-200 bg-white shadow-inner"}`}>
                    <p className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${t.textXs}`}>Audio Timeline</p>
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${dark ? "bg-emerald-500/50" : "bg-emerald-400"}`}
                          style={{ height: `${30 + Math.sin(i * 0.6) * 50 + Math.random() * 20}%` }} />
                      ))}
                    </div>
                    <div className={`mt-2 flex justify-between text-[10px] font-medium ${t.textXs}`}>
                      <span>0:00</span>
                      <span className={dark ? "text-emerald-400" : "text-emerald-600"}>◀ Dubbed Audio ▶</span>
                      <span>0:18</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature chips */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "👄", title: "Wav2Lip-GAN", desc: "Realistic lip-sync",
                    dark: "border-purple-500/20 bg-purple-500/5", light: "border-purple-200 bg-white shadow-md shadow-purple-100/60",
                    dtxt: "text-purple-300", ltxt: "text-purple-700" },
                  { icon: "🔊", title: "Neural TTS",  desc: "High-quality voices",
                    dark: "border-pink-500/20 bg-pink-500/5",     light: "border-pink-200 bg-white shadow-md shadow-pink-100/60",
                    dtxt: "text-pink-300",   ltxt: "text-pink-700" },
                  { icon: "🌐", title: "22 Languages",desc: "Multi-language",
                    dark: "border-blue-500/20 bg-blue-500/5",     light: "border-blue-200 bg-white shadow-md shadow-blue-100/60",
                    dtxt: "text-blue-300",   ltxt: "text-blue-700" },
                ].map((c) => (
                  <div key={c.title}
                    className={`rounded-xl border p-4 text-center transition-all duration-200 hover:scale-[1.03] hover:shadow-lg cursor-default ${dark ? c.dark : c.light}`}>
                    <div className="mb-2 text-2xl">{c.icon}</div>
                    <p className={`text-xs font-bold ${dark ? c.dtxt : c.ltxt}`}>{c.title}</p>
                    <p className={`mt-0.5 text-[10px] ${t.textMuted}`}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRANSCRIBE MODE ── */}
          {activeTab === "transcribe" && (
            <div className="space-y-5">

              {/* Upload */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  file       ? dark ? "border-blue-500/50 bg-blue-500/5" : "border-blue-400 bg-blue-50 shadow-lg shadow-blue-100"
                  : dragOver ? dark ? "border-blue-400 bg-blue-500/10 scale-[1.01]" : "border-blue-500 bg-blue-50 scale-[1.01]"
                  : dark     ? "border-white/10 bg-white/[0.02] hover:border-blue-500/40"
                              : "border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 hover:border-blue-400 hover:shadow-xl shadow-md"
                }`}
              >
                <label htmlFor="file-upload" className="flex w-full cursor-pointer flex-col items-center gap-4 p-10 text-center">
                  {file ? (
                    <>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md ${dark ? "bg-blue-500/20" : "bg-blue-100"}`}>✅</div>
                      <p className={`font-bold ${dark ? "text-blue-300" : "text-blue-700"}`}>{file.name}</p>
                      <p className={`text-xs ${t.textMuted}`}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </>
                  ) : (
                    <>
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md ${dark ? "bg-blue-500/20" : "bg-blue-100"}`}>🎙</div>
                      <div>
                        <p className={`text-lg font-extrabold tracking-tight ${t.textPrimary}`}>Drop your audio or video</p>
                        <p className={`mt-1 text-sm ${t.textMuted}`}>mp3 · wav · mp4 · mov · mkv · max 2GB</p>
                      </div>
                      <span className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        dark ? "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                             : "border-blue-300 bg-white text-blue-700 shadow-md hover:shadow-lg hover:border-blue-400"
                      }`}>Browse files →</span>
                    </>
                  )}
                  <input id="file-upload" type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              {errorMessage && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${dark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"}`}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Transcription output */}
              {hasTranscription && (
                <div className={`rounded-2xl border p-5 ${dark ? "border-emerald-400/30 bg-emerald-500/5" : "border-emerald-200 bg-white shadow-md shadow-emerald-100/40"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-emerald-400" : "text-emerald-600"}`}>Transcription</p>
                      {detectedLanguage && (
                        <p className={`text-sm ${t.textSec}`}>Detected: <span className={`font-bold uppercase ${dark ? "text-emerald-300" : "text-emerald-600"}`}>{detectedLanguage}</span></p>
                      )}
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(text)} type="button"
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 ${t.copyBtn}`}>
                      Copy
                    </button>
                  </div>
                  <p className={`whitespace-pre-line text-sm leading-relaxed ${t.textPrimary}`}>{text}</p>
                </div>
              )}

              {/* Translation */}
              {hasTranscription && (
                <div className={`rounded-2xl border p-5 ${dark ? "border-pink-500/30 bg-pink-500/5" : "border-pink-200 bg-white shadow-md shadow-pink-100/40"}`}>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-pink-400" : "text-pink-600"}`}>Translation</p>
                    <select className={`rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 ${t.inputBg}`}
                      value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                      {TARGET_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <button type="button" onClick={handleTranslate}
                      className="ml-auto rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-pink-200 transition-all hover:scale-105 hover:shadow-lg">
                      Translate →
                    </button>
                  </div>
                  {hasTranslation
                    ? <p className={`whitespace-pre-line text-sm leading-relaxed ${t.textPrimary}`}>{translateMessage}</p>
                    : <p className={`text-xs ${t.textMuted}`}>Choose a target language and click Translate.</p>
                  }
                </div>
              )}

              {/* Voice + TTS */}
              {hasTranslation && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-2xl border p-5 ${dark ? "border-indigo-400/30 bg-indigo-500/5" : "border-indigo-200 bg-white shadow-md shadow-indigo-100/40"}`}>
                    <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-600"}`}>Voice Persona</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["female", "male"].map((p) => (
                        <button key={p} type="button" onClick={() => setVoiceProfile(p)}
                          className={`rounded-xl border py-3 text-sm font-bold capitalize transition-all hover:scale-[1.02] ${
                            voiceProfile === p
                              ? dark ? "border-indigo-400 bg-indigo-500/20 text-indigo-200 shadow-inner"
                                     : "border-indigo-400 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200"
                              : dark ? "border-white/10 bg-white/5 text-slate-300 hover:border-indigo-400/50"
                                     : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                          }`}>
                          {p === "female" ? "👩 Female" : "👨 Male"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-2xl border p-5 ${dark ? "border-yellow-400/30 bg-yellow-400/5" : "border-amber-200 bg-white shadow-md shadow-amber-100/40"}`}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-yellow-400" : "text-amber-600"}`}>Voiceover</p>
                      <select className={`rounded-lg border px-2 py-1.5 text-sm focus:outline-none ${t.inputBg}`}
                        value={ttsLang} onChange={(e) => setTtsLang(e.target.value)}>
                        {TARGET_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                      <button type="button" onClick={handleTTS}
                        className="ml-auto rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-amber-200 transition-all hover:scale-105 hover:shadow-lg">
                        Generate →
                      </button>
                    </div>
                    {audioUrl
                      ? <audio className="mt-2 w-full" controls><source src={audioUrl} type="audio/mp3" /></audio>
                      : <p className={`text-xs ${t.textMuted}`}>Generate AI voice from translated text.</p>
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════
          RIGHT CONTROLS PANEL
      ══════════════════════════════════ */}
      <aside className={`flex flex-col border-t lg:border-t-0 lg:border-l lg:w-[280px] lg:flex-shrink-0 lg:overflow-y-auto transition-colors duration-300 ${t.panelBg}`}>

        {/* Panel header */}
        <div className={`border-b px-5 py-4 ${dark ? "border-white/5" : "border-slate-100"}`}>
          <p className={`text-xs font-extrabold uppercase tracking-[0.15em] ${t.textSec}`}>
            {activeTab === "dub" ? "🎬 Dub Settings" : "📝 Transcribe Settings"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-0 p-4 sm:grid-cols-2 lg:block lg:p-5 lg:space-y-5">

            {/* Source language */}
            <div className="sm:pr-2 lg:pr-0">
              <label className={`mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] ${t.labelText}`}>Source Language</label>
              <select className={selectCls} value={language} disabled={isProcessing} onChange={(e) => setLanguage(e.target.value)}>
                {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Target language */}
            <div className="sm:pl-2 lg:pl-0">
              <label className={`mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] ${t.labelText}`}>Target Language</label>
              <select className={selectCls} value={targetLang} disabled={isProcessing} onChange={(e) => setTargetLang(e.target.value)}>
                {TARGET_LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Voice type */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={`mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] ${t.labelText}`}>Voice Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["female", "male"].map((v) => (
                  <button key={v} type="button" onClick={() => setVoiceProfile(v)} disabled={isProcessing}
                    className={`rounded-xl border py-2.5 text-sm font-bold capitalize transition-all duration-200 hover:scale-[1.02] ${
                      voiceProfile === v
                        ? dark ? "border-purple-400 bg-purple-500/20 text-purple-200 shadow-inner"
                               : "border-purple-400 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-200"
                        : dark ? "border-white/10 bg-white/5 text-slate-300 hover:border-purple-400/50 hover:bg-purple-500/10"
                               : "border-slate-200 bg-slate-50 text-slate-600 hover:border-purple-300 hover:bg-purple-50"
                    }`}>
                    {v === "female" ? "👩 Female" : "👨 Male"}
                  </button>
                ))}
              </div>
            </div>

            {/* Model size */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={`mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] ${t.labelText}`}>Whisper Model</label>
              <select className={selectCls} value={modelSize} disabled={isProcessing} onChange={(e) => setModelSize(e.target.value)}>
                {activeTab === "transcribe" && <option value="tiny">Tiny · Fastest</option>}
                <option value="base">Base · Recommended</option>
                {activeTab === "transcribe" && <option value="small">Small</option>}
                <option value="medium">Medium · Balanced</option>
                <option value="large">Large · Best Quality</option>
              </select>
              <p className={`mt-1.5 text-[10px] font-medium ${t.textXs}`}>
                {modelSize === "base"   && "⚡ Fast processing, good accuracy"}
                {modelSize === "medium" && "⚖️ Balanced speed and quality"}
                {modelSize === "large"  && "🎯 Highest accuracy, slower"}
                {modelSize === "tiny"   && "🚀 Fastest, lower accuracy"}
                {modelSize === "small"  && "✅ Good balance for short clips"}
              </p>
            </div>

            <div className={`hidden lg:block h-px ${t.divider}`} />

            {/* Action buttons */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-2.5">
              {activeTab === "dub" ? (
                <button onClick={handleDubVideo} disabled={dubLoading || !file}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark ? "bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 shadow-lg shadow-purple-900/40 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-[0.98]"
                         : "bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 shadow-xl shadow-purple-300/60 hover:shadow-purple-400/80 hover:scale-[1.03] active:scale-[0.97]"
                  }`}>
                  {dubLoading
                    ? <><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Processing...</>
                    : <><span>🎬</span> Create Dubbed Video</>
                  }
                </button>
              ) : (
                <button onClick={handleUpload} disabled={loading || !file}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/40 hover:shadow-blue-500/60 hover:scale-[1.02]"
                         : "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl shadow-blue-300/60 hover:shadow-blue-400/80 hover:scale-[1.03]"
                  }`}>
                  {loading
                    ? <><span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Transcribing…</>
                    : "🎙 Upload & Transcribe"
                  }
                </button>
              )}
              <button onClick={resetPipeline} type="button" disabled={isProcessing}
                className={`w-full rounded-xl border py-2.5 text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.01] disabled:opacity-30 ${t.resetBtn}`}>
                ↺ Reset Pipeline
              </button>
            </div>

            <div className={`hidden lg:block h-px ${t.divider}`} />

            {/* Pipeline status */}
            <div className="hidden lg:block sm:col-span-2 lg:col-span-1">
              <SectionLabel>{activeTab === "dub" ? "Dub Status" : "Pipeline Tracker"}</SectionLabel>
              <div className="space-y-3">
                {activeTab === "transcribe" ? (
                  stepperItems.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-extrabold shadow-sm transition-all ${
                        step.done ? t.stepDone : t.stepPending
                      }`}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${step.done ? t.textPrimary : t.textMuted}`}>{step.label}</p>
                        <p className={`truncate text-[10px] ${t.textXs}`}>{step.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { num: 1, label: "Upload Video", desc: file ? file.name.slice(0, 18) + "…" : "Select video", done: Boolean(file),       pulse: false },
                    { num: 2, label: "Processing",   desc: "Transcribe → Translate → TTS",                       done: Boolean(dubVideoUrl),  pulse: dubLoading },
                    { num: 3, label: "Complete",      desc: dubVideoUrl ? "Video ready ✅" : "Waiting…",          done: Boolean(dubVideoUrl),  pulse: false },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-extrabold shadow-sm transition-all ${
                        s.done ? t.stepDone : s.pulse ? t.stepActive : t.stepPending
                      }`}>
                        {s.done ? "✓" : s.num}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${s.done ? t.textPrimary : t.textMuted}`}>{s.label}</p>
                        <p className={`truncate text-[10px] max-w-[160px] ${t.textXs}`}>{s.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`hidden lg:block h-px ${t.divider}`} />

            {/* Pro tips */}
            <div className="hidden lg:block sm:col-span-2 lg:col-span-1">
              <SectionLabel>Pro Tips</SectionLabel>
              <ul className="space-y-2.5">
                {(activeTab === "dub" ? [
                  { color: "bg-purple-500", text: "Clear face visibility = better lip-sync" },
                  { color: "bg-pink-500",   text: "GPU: 10–30s · CPU: 2–5 min/min video" },
                  { color: "bg-blue-500",   text: "Wav2Lip = Dubverse / HeyGen quality" },
                  { color: "bg-emerald-500",text: "Supports all 22 Indian languages" },
                ] : [
                  { color: "bg-emerald-500",text: "Auto-detect works for most languages" },
                  { color: "bg-blue-500",   text: "Base model = best speed/accuracy" },
                  { color: "bg-pink-500",   text: "Keep tab active during processing" },
                  { color: "bg-amber-500",  text: "Download voiceover for social reuse" },
                ]).map((tip, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-[11px] font-medium ${t.tipText}`}>
                    <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${tip.color}`} />
                    {tip.text}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
}
