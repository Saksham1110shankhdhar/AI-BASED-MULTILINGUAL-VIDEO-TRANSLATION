import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "overview",
    label: "Overview",
    icon: "📖",
    color: "violet",
    content: {
      title: "API Reference",
      subtitle: "MultiVidAI REST API — 4 independent microservice endpoints",
      body: "MultiVidAI exposes four independent REST API endpoints running on port 8000. Each can be called individually or chained together as a full dubbing pipeline. All endpoints accept multipart/form-data or JSON and return structured JSON responses.",
      extras: [
        { icon: "🌐", label: "Base URL",    value: "http://localhost:8000",    color: "violet" },
        { icon: "🔒", label: "Auth",        value: "None required",             color: "emerald" },
        { icon: "📦", label: "Format",      value: "JSON + multipart/form-data",color: "blue" },
        { icon: "⚡", label: "Timeout",     value: "900s transcribe · 1800s dub",color: "amber" },
      ],
      endpoints: [
        { method: "POST", route: "/transcribe", desc: "Speech → Text",         color: "violet" },
        { method: "POST", route: "/translate",  desc: "Text → Translated Text", color: "blue" },
        { method: "POST", route: "/tts",        desc: "Text → Audio",           color: "pink" },
        { method: "POST", route: "/dub/dub",    desc: "Video → Dubbed Video",   color: "emerald" },
      ],
    },
  },
  {
    id: "transcribe",
    label: "POST /transcribe",
    icon: "🎤",
    color: "violet",
    content: {
      title: "POST /transcribe",
      subtitle: "Convert audio or video to text using OpenAI Whisper",
      body: "Accepts any audio or video file. Whisper automatically detects the spoken language and returns full transcription with detected language code. Model size controls the accuracy/speed tradeoff.",
      request: {
        type: "multipart/form-data",
        fields: [
          { name: "file",     type: "File",   required: true,  desc: "Audio or video file (mp3, wav, mp4, mov, mkv)" },
          { name: "language", type: "string", required: false, desc: "Language code or 'auto' for auto-detection" },
          { name: "model",    type: "string", required: false, desc: "Whisper model size: tiny | base | small | medium | large" },
        ],
      },
      response: `{
  "transcription": "See, I've made myself in such a way...",
  "detected_language": "en",
  "segments": [
    { "text": "...", "start": 0.0, "end": 3.2 }
  ]
}`,
      notes: [
        "Model size affects accuracy and speed — base is recommended for most use cases",
        "Auto language detection works for all 22 Indian languages",
        "Processing time: ~1–3 min per minute of audio on CPU",
      ],
    },
  },
  {
    id: "translate",
    label: "POST /translate",
    icon: "🌐",
    color: "blue",
    content: {
      title: "POST /translate",
      subtitle: "Translate text offline using Argos Translate",
      body: "Accepts source text and returns translated text. Uses Argos Translate — completely offline, no API keys needed. Non-direct language pairs are bridged automatically through English.",
      request: {
        type: "application/json",
        fields: [
          { name: "text",        type: "string", required: true,  desc: "Text to translate" },
          { name: "source_lang", type: "string", required: true,  desc: "Source language code (e.g. 'en', 'hi', 'bn')" },
          { name: "target_lang", type: "string", required: true,  desc: "Target language code (e.g. 'hi', 'ta', 'ur')" },
        ],
      },
      response: `{
  "translated_text": "देखो, मैंने खुद को इस तरह बनाया है..."
}`,
      notes: [
        "Runs 100% offline — no internet required after package installation",
        "Non-direct pairs (e.g. Tamil → Gujarati) bridge through English automatically",
        "Install language packages via install_languages.py before use",
      ],
    },
  },
  {
    id: "tts",
    label: "POST /tts",
    icon: "🔊",
    color: "pink",
    content: {
      title: "POST /tts",
      subtitle: "Generate neural voice audio from text using Edge TTS",
      body: "Converts translated text to high-quality neural speech. Supports male and female voices for all 22 Indian languages via Microsoft Edge TTS. Returns a downloadable audio file URL.",
      request: {
        type: "application/json",
        fields: [
          { name: "text",  type: "string", required: true,  desc: "Text to convert to speech" },
          { name: "lang",  type: "string", required: true,  desc: "Target language code (e.g. 'hi', 'bn', 'ta')" },
          { name: "voice", type: "string", required: false, desc: "'female' (default) or 'male'" },
        ],
      },
      response: `{
  "success": true,
  "audio_url": "/tts/audio/tts_abc123.mp3",
  "filename": "tts_abc123.mp3"
}`,
      notes: [
        "Uses Microsoft Edge Neural TTS — requires internet connection",
        "Urdu voices use ur-PK locale (ur-PK-AsadNeural / ur-PK-UzmaNeural)",
        "Generated files saved to uploads/tts/ directory",
      ],
    },
  },
  {
    id: "dub",
    label: "POST /dub/dub",
    icon: "🎬",
    color: "emerald",
    content: {
      title: "POST /dub/dub",
      subtitle: "Full pipeline — video in, dubbed video out",
      body: "The complete end-to-end dubbing pipeline in a single API call. Extracts audio, transcribes with Whisper, translates with Argos, generates TTS voice, concatenates segments, and muxes back into the original video using FFmpeg.",
      request: {
        type: "multipart/form-data",
        fields: [
          { name: "file",        type: "File",   required: true,  desc: "Video file (mp4, mov, avi) — max 2GB" },
          { name: "source_lang", type: "string", required: false, desc: "Source language code or 'auto'" },
          { name: "target_lang", type: "string", required: true,  desc: "Target language code for dubbing" },
          { name: "voice",       type: "string", required: false, desc: "'female' (default) or 'male'" },
          { name: "model_size",  type: "string", required: false, desc: "Whisper model: base | medium | large" },
          { name: "translate",   type: "string", required: false, desc: "'true' to enable translation step" },
        ],
      },
      response: `{
  "success": true,
  "video_url": "/dub/video/dubbed_abc123.mp4"
}`,
      notes: [
        "Processing: ~2–5 minutes per minute of video on CPU, 10–30s on GPU",
        "Video with clear face visibility gives best Wav2Lip lip-sync results",
        "Dubbed video saved to uploads/dubbed/ directory",
        "Stream output video via GET /dub/video/<filename>",
      ],
    },
  },
];

const methodColor = {
  POST: "bg-emerald-500 text-white",
};

const accentDark = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/25",  text: "text-violet-300",  badge: "bg-violet-500/20 text-violet-200",  active: "bg-violet-500/20 border-violet-500/40 text-violet-200" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/25",    text: "text-blue-300",    badge: "bg-blue-500/20 text-blue-200",      active: "bg-blue-500/20 border-blue-500/40 text-blue-200" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/25",  text: "text-indigo-300",  badge: "bg-indigo-500/20 text-indigo-200",  active: "bg-indigo-500/20 border-indigo-500/40 text-indigo-200" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/25",    text: "text-pink-300",    badge: "bg-pink-500/20 text-pink-200",      active: "bg-pink-500/20 border-pink-500/40 text-pink-200" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",   text: "text-amber-300",   badge: "bg-amber-500/20 text-amber-200",    active: "bg-amber-500/20 border-amber-500/40 text-amber-200" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-200",active: "bg-emerald-500/20 border-emerald-500/40 text-emerald-200" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    text: "text-cyan-300",    badge: "bg-cyan-500/20 text-cyan-200",      active: "bg-cyan-500/20 border-cyan-500/40 text-cyan-200" },
};

const accentLight = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700",  active: "bg-violet-100 border-violet-400 text-violet-800" },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700",      active: "bg-blue-100 border-blue-400 text-blue-800" },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  badge: "bg-indigo-100 text-indigo-700",  active: "bg-indigo-100 border-indigo-400 text-indigo-800" },
  pink:    { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    badge: "bg-pink-100 text-pink-700",      active: "bg-pink-100 border-pink-400 text-pink-800" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700",    active: "bg-amber-100 border-amber-400 text-amber-800" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700",active: "bg-emerald-100 border-emerald-400 text-emerald-800" },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    badge: "bg-cyan-100 text-cyan-700",      active: "bg-cyan-100 border-cyan-400 text-cyan-800" },
};

export default function Docs() {
  const { dark } = useTheme();
  const [active, setActive] = useState("overview");
  const acc = dark ? accentDark : accentLight;

  const pg    = dark ? "bg-[#030714]"   : "bg-[#f5f4ff]";
  const tx1   = dark ? "text-white"     : "text-slate-900";
  const tx2   = dark ? "text-slate-400" : "text-slate-600";
  const tx3   = dark ? "text-slate-500" : "text-slate-400";
  const glass = dark
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl"
    : "bg-white/90 border-slate-200 backdrop-blur-xl shadow-[0_4px_24px_rgba(99,91,255,0.08)]";
  const codeBg = dark
    ? "bg-[#0a0d1a] border-white/8"
    : "bg-slate-900 border-slate-700";

  const cur = sections.find(s => s.id === active);
  const a   = acc[cur.color];

  return (
    <div className={`relative min-h-screen ${pg} ${tx1} transition-colors duration-300 overflow-hidden`}>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px]" />
            <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-700/12 blur-[150px]" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-200/60 blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-indigo-200/50 blur-[130px]" />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12">

        {/* ── Page header ── */}
        <div className="mb-10 text-center">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest ${
            dark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
          }`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            API Reference
          </div>
          <h1 className={`text-4xl font-black tracking-tight sm:text-5xl ${tx1}`}>Documentation</h1>
          <p className={`mt-3 text-base ${tx2}`}>4 REST endpoints · Port 8000 · Flask microservices</p>
        </div>

        {/* ── Main layout: sidebar + content ── */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="lg:sticky lg:top-24 lg:h-fit space-y-2">

            {/* API status card */}
            <div className={`rounded-2xl border p-4 mb-4 ${glass}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`text-xs font-bold uppercase tracking-widest ${tx3}`}>API Status</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Base URL", value: ":8000", color: "text-violet-500" },
                  { label: "Version",  value: "v2.0",  color: "text-blue-500"   },
                  { label: "Status",   value: "Live",  color: "text-emerald-500" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className={`text-xs ${tx3}`}>{label}</span>
                    <span className={`text-xs font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav items */}
            <div className={`rounded-2xl border p-2 ${glass}`}>
              {sections.map((s) => {
                const sa = acc[s.color];
                const isActive = active === s.id;
                return (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 last:mb-0 ${
                      isActive
                        ? `${sa.active} shadow-sm`
                        : `border-transparent ${tx2} hover:${dark ? "bg-white/5" : "bg-slate-50"} hover:${tx1}`
                    }`}>
                    <span className="text-base">{s.icon}</span>
                    <span className="truncate text-xs">{s.label}</span>
                    {isActive && <span className={`ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      dark ? "bg-white/50" : "bg-current opacity-60"
                    }`} />}
                  </button>
                );
              })}
            </div>

            {/* Quick reference card */}
            <div className={`rounded-2xl border p-4 mt-2 ${glass}`}>
              <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${tx3}`}>Quick Reference</p>
              <div className="space-y-1.5">
                {[
                  { route: "/transcribe", color: "violet" },
                  { route: "/translate",  color: "blue" },
                  { route: "/tts",        color: "pink" },
                  { route: "/dub/dub",    color: "emerald" },
                ].map(({ route, color }) => (
                  <button key={route} onClick={() => setActive(route.replace("/", "").replace("/dub", ""))}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all hover:scale-[1.02] ${acc[color].bg}`}>
                    <span className={`text-[9px] font-black ${acc[color].text}`}>POST</span>
                    <span className={`font-mono text-[10px] font-bold ${tx1}`}>{route}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="space-y-5">

            {/* Header card */}
            <div className={`rounded-3xl border p-7 ${glass}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${a.badge} ${a.border}`}>
                    {cur.content.icon || cur.icon} {cur.id === "overview" ? "Reference" : "Endpoint"}
                  </div>
                  <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>{cur.content.title}</h2>
                  <p className={`mt-1.5 text-sm font-semibold ${a.text}`}>{cur.content.subtitle}</p>
                </div>
                {cur.id !== "overview" && (
                  <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm font-bold ${a.bg} ${a.border}`}>
                    <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">POST</span>
                    <span className={a.text}>{cur.content.title.split(" ")[1]}</span>
                  </div>
                )}
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${tx2}`}>{cur.content.body}</p>
            </div>

            {/* ── OVERVIEW specific content ── */}
            {cur.id === "overview" && (
              <>
                {/* Extras grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {cur.content.extras.map((e) => {
                    const ea = acc[e.color];
                    return (
                      <div key={e.label} className={`rounded-2xl border p-4 ${glass} ${ea.border}`}>
                        <div className="mb-2 text-xl">{e.icon}</div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${tx3}`}>{e.label}</p>
                        <p className={`mt-1 text-sm font-bold ${ea.text}`}>{e.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Endpoints grid */}
                <div className={`rounded-3xl border p-6 ${glass}`}>
                  <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${tx3}`}>Available Endpoints</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cur.content.endpoints.map((ep) => {
                      const ea = acc[ep.color];
                      return (
                        <button key={ep.route}
                          onClick={() => setActive(ep.route.replace("/", "").replace("dub/", ""))}
                          className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${ea.bg} ${ea.border}`}>
                          <span className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-black text-white flex-shrink-0">POST</span>
                          <div className="min-w-0 flex-1">
                            <p className={`font-mono text-sm font-bold ${ea.text}`}>{ep.route}</p>
                            <p className={`text-xs ${tx2}`}>{ep.desc}</p>
                          </div>
                          <span className={`text-lg transition-transform duration-200 group-hover:translate-x-1 ${tx3}`}>→</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Code block */}
                <div className={`rounded-3xl border p-6 ${glass}`}>
                  <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${tx3}`}>All Routes</p>
                  <div className={`rounded-2xl border p-5 font-mono text-sm ${codeBg}`}>
                    {["POST /transcribe", "POST /translate", "POST /tts", "POST /dub/dub"].map((r, i) => (
                      <div key={r} className={`py-1 ${
                        i === 0 ? "text-violet-400" : i === 1 ? "text-blue-400" : i === 2 ? "text-pink-400" : "text-emerald-400"
                      }`}>{r}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── ENDPOINT specific content ── */}
            {cur.id !== "overview" && cur.content.request && (
              <>
                {/* Request card */}
                <div className={`rounded-3xl border p-6 ${glass}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${a.badge} ${a.border}`}>
                      Request Body
                    </span>
                    <span className={`text-xs font-semibold ${tx3}`}>{cur.content.request.type}</span>
                  </div>
                  <div className="space-y-3">
                    {cur.content.request.fields.map((f) => (
                      <div key={f.name}
                        className={`flex flex-col gap-1.5 rounded-2xl border p-4 sm:flex-row sm:items-start sm:gap-4 ${
                          dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"
                        }`}>
                        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:w-48">
                          <code className={`rounded-lg px-2.5 py-1 font-mono text-xs font-black ${a.badge}`}>{f.name}</code>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                          }`}>{f.type}</span>
                          {f.required && (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-black bg-rose-500/20 text-rose-400">required</span>
                          )}
                        </div>
                        <p className={`flex-1 text-sm ${tx2}`}>{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response card */}
                <div className={`rounded-3xl border p-6 ${glass}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${a.badge} ${a.border}`}>
                      Response
                    </span>
                    <span className={`text-xs font-semibold ${tx3}`}>application/json</span>
                    <span className="ml-auto rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-400">200 OK</span>
                  </div>
                  <div className={`rounded-2xl border p-5 font-mono text-sm leading-relaxed ${codeBg}`}>
                    {cur.content.response.split("\n").map((line, i) => {
                      const isKey    = line.includes('"') && line.includes(':');
                      const isString = line.includes('"') && !line.includes(':');
                      const isBrace  = line.trim() === "{" || line.trim() === "}" || line.trim() === "[" || line.trim() === "]";
                      return (
                        <div key={i} className={
                          isBrace  ? "text-slate-400" :
                          isKey    ? "text-blue-300"  :
                          isString ? "text-emerald-300" :
                          "text-slate-300"
                        }>{line}</div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes card */}
                {cur.content.notes && (
                  <div className={`rounded-3xl border p-6 ${glass}`}>
                    <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${tx3}`}>Notes & Tips</p>
                    <ul className="space-y-3">
                      {cur.content.notes.map((note, i) => (
                        <li key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                          dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"
                        }`}>
                          <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${a.text.replace("text-", "bg-")}`} />
                          <span className={`text-sm leading-relaxed ${tx2}`}>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Example curl card */}
                <div className={`rounded-3xl border p-6 ${glass}`}>
                  <p className={`mb-4 text-[10px] font-black uppercase tracking-widest ${tx3}`}>Example Request</p>
                  <div className={`rounded-2xl border p-5 font-mono text-xs leading-relaxed ${codeBg}`}>
                    {cur.id === "transcribe" && (
                      <>
                        <span className="text-slate-400">curl -X POST \</span><br/>
                        <span className="text-slate-400">  http://localhost:8000/transcribe \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"file=@video.mp4"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"language=auto"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"model=base"</span>
                      </>
                    )}
                    {cur.id === "translate" && (
                      <>
                        <span className="text-slate-400">curl -X POST \</span><br/>
                        <span className="text-slate-400">  http://localhost:8000/translate \</span><br/>
                        <span className="text-slate-400">  -H </span><span className="text-blue-400">"Content-Type: application/json"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -d </span><span className="text-emerald-400">'{`{"text":"Hello","source_lang":"en","target_lang":"hi"}`}'</span>
                      </>
                    )}
                    {cur.id === "tts" && (
                      <>
                        <span className="text-slate-400">curl -X POST \</span><br/>
                        <span className="text-slate-400">  http://localhost:8000/tts \</span><br/>
                        <span className="text-slate-400">  -H </span><span className="text-blue-400">"Content-Type: application/json"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -d </span><span className="text-emerald-400">'{`{"text":"नमस्ते","lang":"hi","voice":"female"}`}'</span>
                      </>
                    )}
                    {cur.id === "dub" && (
                      <>
                        <span className="text-slate-400">curl -X POST \</span><br/>
                        <span className="text-slate-400">  http://localhost:8000/dub/dub \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"file=@video.mp4"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"target_lang=hi"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"voice=male"</span><span className="text-slate-400"> \</span><br/>
                        <span className="text-slate-400">  -F </span><span className="text-emerald-400">"model_size=base"</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Bottom nav ── */}
            <div className={`flex items-center justify-between rounded-2xl border p-4 ${glass}`}>
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx > 0) setActive(sections[idx - 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === 0}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600 shadow-sm"
                }`}>
                ← Previous
              </button>
              <span className={`text-xs font-bold ${tx3}`}>
                {sections.findIndex(s => s.id === active) + 1} / {sections.length}
              </span>
              <button
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === active);
                  if (idx < sections.length - 1) setActive(sections[idx + 1].id);
                }}
                disabled={sections.findIndex(s => s.id === active) === sections.length - 1}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600 shadow-sm"
                }`}>
                Next →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}