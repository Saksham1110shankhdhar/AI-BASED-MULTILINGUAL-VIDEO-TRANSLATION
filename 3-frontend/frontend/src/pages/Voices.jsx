import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";



const voices = [
  // Female voices
  { lang: "Hindi",     code: "hi", flag: "🇮🇳", female: "hi-IN-SwaraNeural",    male: "hi-IN-MadhurNeural",   region: "North India",   color: "violet",  script: "Devanagari", sample: "नमस्ते, मैं आपकी सेवा में हूँ।" },
  { lang: "Bengali",   code: "bn", flag: "🇧🇩", female: "bn-IN-TanishaaNeural", male: "bn-IN-BashkarNeural",  region: "East India",    color: "blue",    script: "Bengali",    sample: "আমি আপনার সেবায় আছি।" },
  { lang: "Tamil",     code: "ta", flag: "🇮🇳", female: "ta-IN-PallaviNeural",  male: "ta-IN-ValluvarNeural", region: "South India",   color: "orange",  script: "Tamil",      sample: "நான் உங்கள் சேவையில் இருக்கிறேன்।" },
  { lang: "Telugu",    code: "te", flag: "🇮🇳", female: "te-IN-ShrutiNeural",   male: "te-IN-MohanNeural",    region: "South India",   color: "green",   script: "Telugu",     sample: "నేను మీ సేవలో ఉన్నాను।" },
  { lang: "Marathi",   code: "mr", flag: "🇮🇳", female: "mr-IN-AarohiNeural",   male: "mr-IN-ManoharNeural",  region: "West India",    color: "pink",    script: "Devanagari", sample: "मी तुमच्या सेवेत आहे।" },
  { lang: "Gujarati",  code: "gu", flag: "🇮🇳", female: "gu-IN-DhwaniNeural",   male: "gu-IN-NiranjanNeural", region: "West India",    color: "amber",   script: "Gujarati",   sample: "હું તમારી સેવામાં છું।" },
  { lang: "Kannada",   code: "kn", flag: "🇮🇳", female: "kn-IN-SapnaNeural",    male: "kn-IN-GaganNeural",    region: "South India",   color: "indigo",  script: "Kannada",    sample: "ನಾನು ನಿಮ್ಮ ಸೇವೆಯಲ್ಲಿ ಇದ್ದೇನೆ।" },
  { lang: "Malayalam", code: "ml", flag: "🇮🇳", female: "ml-IN-SobhanaNeural",  male: "ml-IN-MidhunNeural",   region: "South India",   color: "teal",    script: "Malayalam",  sample: "ഞാൻ നിങ്ങളുടെ സേവനത്തിലാണ്।" },
  { lang: "Punjabi",   code: "pa", flag: "🇮🇳", female: "ur-PK-UzmaNeural",     male: "ur-PK-AsadNeural",     region: "North India",   color: "rose",    script: "Gurmukhi",   sample: "ਮੈਂ ਤੁਹਾਡੀ ਸੇਵਾ ਵਿੱਚ ਹਾਂ।" },
  { lang: "Urdu",      code: "ur", flag: "🇵🇰", female: "ur-PK-UzmaNeural",     male: "ur-PK-AsadNeural",     region: "South Asia",    color: "purple",  script: "Nastaliq",   sample: "میں آپ کی خدمت میں حاضر ہوں۔" },
  { lang: "Odia",      code: "or", flag: "🇮🇳", female: "hi-IN-SwaraNeural",    male: "hi-IN-MadhurNeural",   region: "East India",    color: "cyan",    script: "Odia",       sample: "ମୁଁ ଆପଣଙ୍କ ସେବାରେ ଅଛି।" },
  { lang: "Assamese",  code: "as", flag: "🇮🇳", female: "bn-IN-TanishaaNeural", male: "bn-IN-BashkarNeural",  region: "Northeast India",color: "emerald", script: "Assamese",   sample: "মই আপোনাৰ সেৱাত আছো।" },
  { lang: "English",   code: "en", flag: "🌐",  female: "en-US-JennyNeural",    male: "en-US-GuyNeural",      region: "Global",        color: "blue",    script: "Latin",      sample: "I am at your service." },
];

const accentDark = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/25",  text: "text-violet-300",  badge: "bg-violet-500/20 text-violet-200",  glow: "hover:shadow-violet-500/20",  dot: "bg-violet-400",  wave: "bg-violet-400" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/25",    text: "text-blue-300",    badge: "bg-blue-500/20 text-blue-200",      glow: "hover:shadow-blue-500/20",    dot: "bg-blue-400",    wave: "bg-blue-400" },
  orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/25",  text: "text-orange-300",  badge: "bg-orange-500/20 text-orange-200",  glow: "hover:shadow-orange-500/20",  dot: "bg-orange-400",  wave: "bg-orange-400" },
  green:   { bg: "bg-green-500/10",   border: "border-green-500/25",   text: "text-green-300",   badge: "bg-green-500/20 text-green-200",    glow: "hover:shadow-green-500/20",   dot: "bg-green-400",   wave: "bg-green-400" },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/25",    text: "text-pink-300",    badge: "bg-pink-500/20 text-pink-200",      glow: "hover:shadow-pink-500/20",    dot: "bg-pink-400",    wave: "bg-pink-400" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",   text: "text-amber-300",   badge: "bg-amber-500/20 text-amber-200",    glow: "hover:shadow-amber-500/20",   dot: "bg-amber-400",   wave: "bg-amber-400" },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/25",  text: "text-indigo-300",  badge: "bg-indigo-500/20 text-indigo-200",  glow: "hover:shadow-indigo-500/20",  dot: "bg-indigo-400",  wave: "bg-indigo-400" },
  teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/25",    text: "text-teal-300",    badge: "bg-teal-500/20 text-teal-200",      glow: "hover:shadow-teal-500/20",    dot: "bg-teal-400",    wave: "bg-teal-400" },
  rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/25",    text: "text-rose-300",    badge: "bg-rose-500/20 text-rose-200",      glow: "hover:shadow-rose-500/20",    dot: "bg-rose-400",    wave: "bg-rose-400" },
  purple:  { bg: "bg-purple-500/10",  border: "border-purple-500/25",  text: "text-purple-300",  badge: "bg-purple-500/20 text-purple-200",  glow: "hover:shadow-purple-500/20",  dot: "bg-purple-400",  wave: "bg-purple-400" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    text: "text-cyan-300",    badge: "bg-cyan-500/20 text-cyan-200",      glow: "hover:shadow-cyan-500/20",    dot: "bg-cyan-400",    wave: "bg-cyan-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-200",glow: "hover:shadow-emerald-500/20", dot: "bg-emerald-400", wave: "bg-emerald-400" },
};

const accentLight = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700",  glow: "hover:shadow-violet-100",  dot: "bg-violet-500",  wave: "bg-violet-400" },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700",      glow: "hover:shadow-blue-100",    dot: "bg-blue-500",    wave: "bg-blue-400" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-100 text-orange-700",  glow: "hover:shadow-orange-100",  dot: "bg-orange-500",  wave: "bg-orange-400" },
  green:   { bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   badge: "bg-green-100 text-green-700",    glow: "hover:shadow-green-100",   dot: "bg-green-500",   wave: "bg-green-400" },
  pink:    { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    badge: "bg-pink-100 text-pink-700",      glow: "hover:shadow-pink-100",    dot: "bg-pink-500",    wave: "bg-pink-400" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700",    glow: "hover:shadow-amber-100",   dot: "bg-amber-500",   wave: "bg-amber-400" },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  badge: "bg-indigo-100 text-indigo-700",  glow: "hover:shadow-indigo-100",  dot: "bg-indigo-500",  wave: "bg-indigo-400" },
  teal:    { bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700",    badge: "bg-teal-100 text-teal-700",      glow: "hover:shadow-teal-100",    dot: "bg-teal-500",    wave: "bg-teal-400" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-100 text-rose-700",      glow: "hover:shadow-rose-100",    dot: "bg-rose-500",    wave: "bg-rose-400" },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  badge: "bg-purple-100 text-purple-700",  glow: "hover:shadow-purple-100",  dot: "bg-purple-500",  wave: "bg-purple-400" },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    badge: "bg-cyan-100 text-cyan-700",      glow: "hover:shadow-cyan-100",    dot: "bg-cyan-500",    wave: "bg-cyan-400" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700",glow: "hover:shadow-emerald-100", dot: "bg-emerald-500", wave: "bg-emerald-400" },
};

// Animated waveform bars
function Waveform({ color, playing }) {
  const heights = [3, 5, 8, 6, 10, 7, 4, 9, 6, 5, 8, 4, 7, 10, 5];
  return (
    <div className="flex items-end gap-0.5 h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${color} ${playing ? "opacity-100" : "opacity-30"}`}
          style={{
            height: playing ? `${h * 2.5}px` : `${h}px`,
            animationName: playing ? "wave" : "none",
            animationDuration: `${0.6 + i * 0.05}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            transition: "height 0.3s ease",
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function Voices() {
  const { dark } = useTheme();
  const [selectedGender, setSelectedGender] = useState("both");
  const [playingId, setPlayingId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [loadingId, setLoadingId] = useState(null);
  const acc = dark ? accentDark : accentLight;

  const regions = ["All", "North India", "South India", "East India", "West India", "Northeast India", "South Asia", "Global"];

  const filtered = voices.filter(v =>
    selectedRegion === "All" || v.region === selectedRegion
  );

  const pg    = dark ? "bg-[#030714]"   : "bg-[#f5f4ff]";
  const tx1   = dark ? "text-white"     : "text-slate-900";
  const tx2   = dark ? "text-slate-400" : "text-slate-600";
  const tx3   = dark ? "text-slate-500" : "text-slate-400";
  const glass = dark
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl"
    : "bg-white/90 border-slate-200 backdrop-blur-xl shadow-[0_4px_24px_rgba(99,91,255,0.08)]";
const handlePlay = async (id, text, lang, voice) => {
  // If already playing this — stop it
  if (playingId === id) {
    setPlayingId(null);
    return;
  }

  setLoadingId(id);
  setPlayingId(null);

  try {
    const res = await fetch("http://localhost:8000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang, voice }),
    });

    const data = await res.json();

    if (data.audio_url) {
      const audio = new Audio("http://localhost:8000" + data.audio_url);
      audio.play();
      setPlayingId(id);
      audio.onended = () => setPlayingId(null);
    }
  } catch (err) {
    console.error("TTS failed:", err);
  } finally {
    setLoadingId(null);
  }
};

  return (
    <div className={`relative min-h-screen ${pg} ${tx1} transition-colors duration-300 overflow-hidden`}>

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px]" />
            <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-pink-700/12 blur-[150px]" />
            <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-indigo-700/10 blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-200/60 blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-pink-200/50 blur-[130px]" />
            <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-200/30 blur-[100px]" />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 lg:px-12">

        {/* ══ HERO ══ */}
        <section className="mb-14 text-center">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest ${
            dark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
          }`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Neural Voice Library
          </div>
          <h1 className={`mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${tx1}`}>
            22 voices.{" "}
            <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              Every language.
            </span>
          </h1>
          <p className={`mx-auto max-w-2xl text-lg leading-relaxed ${tx2}`}>
            High-quality male and female neural voices for all 22 Indian languages,
            powered by Microsoft Edge TTS. Used in the dubbing pipeline for natural speech generation.
          </p>

          {/* Stats row */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { num: "22",  label: "Languages",     color: "text-violet-500" },
              { num: "2",   label: "Voice genders",  color: "text-pink-500" },
              { num: "44",  label: "Total voices",   color: "text-blue-500" },
              { num: "100%",label: "Neural quality", color: "text-emerald-500" },
            ].map(({ num, label, color }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center transition-all hover:scale-[1.03] ${glass}`}>
                <p className={`text-2xl font-black ${color}`}>{num}</p>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${tx3}`}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FILTERS ══ */}
        <section className="mb-8">
          <div className={`rounded-2xl border p-4 ${glass}`}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Gender filter */}
              <div className="flex items-center gap-1">
                <p className={`mr-2 text-xs font-bold uppercase tracking-widest ${tx3}`}>Gender</p>
                {["both", "female", "male"].map((g) => (
                  <button key={g} onClick={() => setSelectedGender(g)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold capitalize transition-all hover:scale-105 ${
                      selectedGender === g
                        ? dark ? "border-violet-500/40 bg-violet-500/20 text-violet-200" : "border-violet-400 bg-violet-100 text-violet-700"
                        : dark ? "border-white/10 bg-white/5 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                    }`}>
                    {g === "both" ? "👥 Both" : g === "female" ? "👩 Female" : "👨 Male"}
                  </button>
                ))}
              </div>

              <div className={`h-6 w-px ${dark ? "bg-white/10" : "bg-slate-200"}`} />

              {/* Region filter */}
              <div className="flex flex-wrap items-center gap-1">
                <p className={`mr-1 text-xs font-bold uppercase tracking-widest ${tx3}`}>Region</p>
                {regions.map((r) => (
                  <button key={r} onClick={() => setSelectedRegion(r)}
                    className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedRegion === r
                        ? dark ? "border-pink-500/40 bg-pink-500/20 text-pink-200" : "border-pink-400 bg-pink-50 text-pink-700"
                        : dark ? "border-white/5 text-slate-500 hover:text-white" : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <span className={`text-xs font-bold ${tx3}`}>{filtered.length} languages</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ VOICE CARDS ══ */}
        <section className="mb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((v) => {
              const a = acc[v.color];
              const femaleId = `${v.code}-female`;
              const maleId   = `${v.code}-male`;
              const femPlaying = playingId === femaleId;
              const malePlaying = playingId === maleId;

              return (
                <div key={v.code}
                  className={`group rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${a.glow} ${glass} ${a.border}`}>

                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${a.bg}`}>
                        {v.flag}
                      </div>
                      <div>
                        <p className={`text-sm font-extrabold ${tx1}`}>{v.lang}</p>
                        <p className={`text-[10px] font-semibold ${tx3}`}>{v.region}</p>
                      </div>
                    </div>
                    <div className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${a.badge}`}>
                      {v.script}
                    </div>
                  </div>

                  {/* Sample text */}
                  <div className={`mb-4 rounded-xl border p-3 ${dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                    <p className={`text-xs leading-relaxed ${v.code === "ur" ? "text-right" : ""} ${tx2}`}>
                      {v.sample}
                    </p>
                  </div>

                  {/* Waveform */}
                  <div className="mb-4">
                    <Waveform color={a.wave} playing={femPlaying || malePlaying} />
                  </div>

                  {/* Voice buttons */}
                  {(selectedGender === "both" || selectedGender === "female") && (
                    <button onClick={() => handlePlay(femaleId, v.sample, v.code, "female")}
                      className={`mb-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                        femPlaying
                          ? `${a.bg} ${a.border} ${a.text}`
                          : dark ? "border-white/8 bg-white/[0.02] text-slate-300 hover:border-white/20" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 shadow-sm"
                      }`}>
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
                        femPlaying ? a.bg : dark ? "bg-white/10" : "bg-slate-100"
                      }`}>
                        {loadingId === femaleId ? "⏳" : femPlaying ? "⏸" : "▶"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[9px] opacity-70">{v.female}</p>
                        <p className="text-[10px] font-bold">👩 Female</p>
                      </div>
                      {femPlaying && (
                        <span className={`h-2 w-2 animate-pulse rounded-full ${a.dot}`} />
                      )}
                    </button>
                  )}

                  {(selectedGender === "both" || selectedGender === "male") && (
                    <button onClick={() => handlePlay(maleId, v.sample, v.code, "male")}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                        malePlaying
                          ? `${a.bg} ${a.border} ${a.text}`
                          : dark ? "border-white/8 bg-white/[0.02] text-slate-300 hover:border-white/20" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 shadow-sm"
                      }`}>
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
                        malePlaying ? a.bg : dark ? "bg-white/10" : "bg-slate-100"
                      }`}>
                        {loadingId === maleId ? "⏳" : malePlaying ? "⏸" : "▶"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[9px] opacity-70">{v.male}</p>
                        <p className="text-[10px] font-bold">👨 Male</p>
                      </div>
                      {malePlaying && (
                        <span className={`h-2 w-2 animate-pulse rounded-full ${a.dot}`} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ HOW VOICES WORK ══ */}
        <section className="mb-16">
          <div className={`rounded-3xl border p-8 lg:p-10 ${glass}`}>
            <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <p className={`mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${tx3}`}>How it works</p>
                <h2 className={`text-2xl font-black tracking-tight ${tx1}`}>Voice generation pipeline</h2>
                <p className={`mt-3 text-sm leading-relaxed ${tx2}`}>
                  Translated text is sent to Microsoft Edge TTS with the selected voice model.
                  The audio segments are saved as MP3 files, concatenated by FFmpeg, and
                  muxed back into the video as the final dubbed audio track.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  { step: "01", icon: "🌐", label: "Text input",    desc: "Translated text from Argos",         color: "violet" },
                  { step: "02", icon: "🗣", label: "Edge TTS",      desc: "Neural voice generation per segment", color: "blue" },
                  { step: "03", icon: "🎵", label: "MP3 segments",  desc: "Saved to uploads/tts/",              color: "pink" },
                  { step: "04", icon: "🎞", label: "FFmpeg mux",    desc: "Concat + replace video audio",        color: "emerald" },
                ].map((s) => {
                  const sa = acc[s.color];
                  return (
                    <div key={s.step} className={`flex items-center gap-3 rounded-xl border p-3 ${dark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg ${sa.bg}`}>{s.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black ${sa.text}`}>{s.step}</span>
                          <span className={`text-xs font-bold ${tx1}`}>{s.label}</span>
                        </div>
                        <p className={`text-[10px] ${tx3}`}>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voice engine info cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: "⚡", title: "Edge TTS Engine",   desc: "Microsoft's neural TTS service with 22+ Indian language voices.",          color: "violet" },
                { icon: "🎭", title: "Gender Selection",  desc: "Male and female voices per language — passed directly to the dub pipeline.",color: "pink" },
                { icon: "🌐", title: "Internet Required", desc: "Edge TTS requires internet. Argos translation runs fully offline.",        color: "amber" },
              ].map((c) => {
                const ca = acc[c.color];
                return (
                  <div key={c.title} className={`rounded-2xl border p-4 ${ca.bg} ${ca.border}`}>
                    <div className="mb-2 text-xl">{c.icon}</div>
                    <p className={`mb-1 text-sm font-extrabold ${tx1}`}>{c.title}</p>
                    <p className={`text-xs leading-relaxed ${tx2}`}>{c.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section>
          <div className={`relative overflow-hidden rounded-3xl border p-10 lg:p-12 ${
            dark ? "border-violet-500/20 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-pink-900/20"
                 : "border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 shadow-xl shadow-violet-100/50"
          }`}>
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-[60px]" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/15 blur-[60px]" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className={`mb-2 text-3xl font-black tracking-tight ${tx1}`}>Use these voices now</h2>
                <p className={`text-base ${tx2}`}>
                  Open the Studio, pick your language and gender, and create a dubbed video in minutes.
                </p>
              </div>
              <Link to="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-500/40 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/60 whitespace-nowrap">
                Launch Studio →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
