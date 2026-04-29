import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ── Data ──────────────────────────────────────────────
const pipeline = [
  { step: "01", icon: "📁", label: "Upload",     tool: "MP4 / MOV / AVI",  color: "violet" },
  { step: "02", icon: "🔊", label: "Extract",    tool: "FFmpeg",            color: "blue" },
  { step: "03", icon: "🎤", label: "Transcribe", tool: "OpenAI Whisper",   color: "indigo" },
  { step: "04", icon: "🌐", label: "Translate",  tool: "Argos Translate",  color: "cyan" },
  { step: "05", icon: "🗣", label: "TTS Voice",  tool: "Edge Neural TTS",  color: "pink" },
  { step: "06", icon: "🎬", label: "Dub Video",  tool: "Wav2Lip + FFmpeg", color: "emerald" },
];

const features = [
  { icon: "🎤", title: "Whisper ASR",         desc: "Auto language detection with segment-level timestamps. Tiny → Large model sizes.", accent: "violet" },
  { icon: "🌐", title: "Offline Translation", desc: "Argos Translate — fully offline, zero API cost, no internet dependency.",           accent: "blue" },
  { icon: "🔊", title: "Neural TTS",          desc: "High-quality male & female voices across all 22 Indian languages.",                accent: "indigo" },
  { icon: "👄", title: "Wav2Lip Lip-sync",    desc: "GAN-based lip synchronization — comparable to Dubverse and HeyGen.",              accent: "pink" },
  { icon: "⚡", title: "Microservices",        desc: "Each service works independently: /transcribe /translate /tts /dub.",             accent: "amber" },
  { icon: "🎞", title: "FFmpeg Pipeline",     desc: "Extract, merge, concatenate, replace audio tracks at any quality.",                accent: "emerald" },
];

const languages = [
  "Hindi","Bengali","Tamil","Telugu","Marathi",
  "Gujarati","Kannada","Malayalam","Punjabi","Odia",
  "Urdu","Assamese","English","Sanskrit","+8 more",
];

const accentDark = {
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-300",  dot: "bg-violet-400"  },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-300",    dot: "bg-blue-400"    },
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  text: "text-indigo-300",  dot: "bg-indigo-400"  },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-300",    dot: "bg-cyan-400"    },
  pink:    { bg: "bg-pink-500/10",    border: "border-pink-500/20",    text: "text-pink-300",    dot: "bg-pink-400"    },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-300",   dot: "bg-amber-400"   },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
};

const accentLight = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  dot: "bg-violet-500"  },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    dot: "bg-blue-500"    },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  dot: "bg-indigo-500"  },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    dot: "bg-cyan-500"    },
  pink:    { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700",    dot: "bg-pink-500"    },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
};

// ── Animated counter ─────────────────────────────────
function CountUp({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const started = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const n = parseInt(to);
        if (isNaN(n)) { setVal(to); return; }
        let cur = 0;
        const step = Math.max(1, Math.ceil(n / 40));
        const t = setInterval(() => {
          cur += step;
          if (cur >= n) { setVal(n); clearInterval(t); }
          else setVal(cur);
        }, 28);
      }
    }, { threshold: 0.5 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function Home() {
  const { dark } = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % pipeline.length), 1400);
    return () => clearInterval(t);
  }, []);

  const acc = dark ? accentDark : accentLight;

  // Theme tokens
  const pg   = dark ? "bg-[#030714]"      : "bg-[#f5f4ff]";
  const tx1  = dark ? "text-white"        : "text-slate-900";
  const tx2  = dark ? "text-slate-400"    : "text-slate-600";
  const tx3  = dark ? "text-slate-500"    : "text-slate-400";
  const card = dark
    ? "bg-white/[0.03] border-white/8 hover:border-white/15 hover:bg-white/[0.06]"
    : "bg-white border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/60 shadow-sm";
  const divBg = dark ? "bg-white/5" : "bg-slate-200";

  return (
    <div className={`relative min-h-screen ${pg} ${tx1} transition-colors duration-300 overflow-hidden`}>

      {/* ── Ambient background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -left-48 top-0 h-[600px] w-[600px] rounded-full bg-violet-700/15 blur-[140px]" />
            <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-indigo-700/12 blur-[160px]" />
            <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-700/10 blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/50 blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-[130px]" />
            <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-pink-200/30 blur-[100px]" />
          </>
        )}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">

        {/* ════════════════════════════════
            HERO
        ════════════════════════════════ */}
        <section className="mb-24 text-center">
          {/* Badge */}
          <div className={`mb-8 inline-flex items-center gap-2.5 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest backdrop-blur ${
            dark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
          }`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            AI Video Dubbing Platform
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${dark ? "bg-violet-500/20 text-violet-200" : "bg-violet-100 text-violet-600"}`}>v2.0</span>
          </div>

          {/* Heading */}
          <h1 className={`mb-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl ${tx1}`}>
            Dub any video<br />
            <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              into 22 languages
            </span>
          </h1>

          <p className={`mx-auto mb-4 max-w-2xl text-lg leading-relaxed ${tx2}`}>
            Upload → Transcribe → Translate → Generate voice → Lip-sync — fully automated pipeline.
          </p>
          <p className={`mx-auto mb-10 max-w-xl text-sm ${tx3}`}>
            Powered by OpenAI Whisper · Argos Translate · Wav2Lip GAN · Edge Neural TTS · FFmpeg
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/studio"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-violet-500/30 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/50">
              Launch Studio
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link to="/docs"
              className={`inline-flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold transition-all duration-200 hover:scale-105 ${
                dark ? "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                     : "border-slate-300 bg-white text-slate-700 shadow-md hover:border-violet-400 hover:text-violet-700 hover:shadow-lg"
              }`}>
              Read Docs
            </Link>
          </div>

          {/* Stats */}
          <div className={`mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4`}>
            {[
              { num: "22", suffix: "+", label: "Languages" },
              { num: "6",  suffix: "",  label: "Pipeline Steps" },
              { num: "100",suffix: "%", label: "Automated" },
              { num: "0",  suffix: " API cost", label: "Translation" },
            ].map(({ num, suffix, label }) => (
              <div key={label} className={`rounded-2xl border p-5 text-center transition-all duration-300 hover:scale-[1.03] ${
                dark ? "border-white/8 bg-white/[0.03] hover:border-violet-500/30 hover:bg-violet-500/5"
                     : "border-slate-200 bg-white shadow-md hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/50"
              }`}>
                <p className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                  <CountUp to={num} suffix={suffix} />
                </p>
                <p className={`mt-1 text-[11px] font-semibold uppercase tracking-widest ${tx3}`}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            PIPELINE
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className="mb-12 text-center">
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${tx3}`}>End-to-end pipeline</p>
            <h2 className={`text-3xl font-black tracking-tight ${tx1}`}>How your video gets dubbed</h2>
            <p className={`mt-3 text-sm ${tx2}`}>Click any step to inspect it · Watch the pipeline animate automatically</p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {pipeline.map((s, i) => {
              const a = acc[s.color];
              const isActive = activeStep === i;
              const isDone   = activeStep > i;
              return (
                <button key={s.label} onClick={() => setActiveStep(i)}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-300 ${
                    isActive
                      ? `${a.bg} ${a.border} scale-105 shadow-lg`
                      : isDone
                      ? dark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-300 bg-emerald-50 shadow-sm"
                      : dark ? "border-white/5 bg-white/[0.02] hover:border-white/15" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                  }`}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
                    isActive ? `${a.bg} shadow-inner` : isDone ? dark ? "bg-emerald-500/20" : "bg-emerald-100" : dark ? "bg-white/5" : "bg-slate-50"
                  }`}>
                    {isDone ? "✓" : s.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isActive ? a.text : isDone ? dark ? "text-emerald-400" : "text-emerald-600" : tx2}`}>{s.label}</p>
                    <p className={`text-[9px] mt-0.5 ${tx3}`}>{s.tool}</p>
                  </div>
                  <div className={`text-[9px] font-black ${tx3}`}>{s.step}</div>
                </button>
              );
            })}
          </div>

          {/* Active step description */}
          <div className={`mx-auto mt-5 max-w-sm rounded-2xl border px-5 py-3.5 text-center transition-all duration-300 ${
            dark ? `${acc[pipeline[activeStep].color].bg} ${acc[pipeline[activeStep].color].border}`
                 : `${acc[pipeline[activeStep].color].bg} ${acc[pipeline[activeStep].color].border} shadow-md`
          }`}>
            <p className={`text-sm font-bold ${acc[pipeline[activeStep].color].text}`}>
              {pipeline[activeStep].icon} {pipeline[activeStep].label}
            </p>
            <p className={`text-xs mt-0.5 ${tx3}`}>Powered by {pipeline[activeStep].tool}</p>
          </div>
        </section>

        {/* ════════════════════════════════
            FEATURES
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className="mb-12 text-center">
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${tx3}`}>Core features</p>
            <h2 className={`text-3xl font-black tracking-tight ${tx1}`}>What's inside the pipeline</h2>
            <p className={`mt-3 text-sm ${tx2}`}>Every component is a standalone microservice — use together or independently.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const a = acc[f.accent];
              return (
                <div key={f.title}
                  className={`group rounded-2xl border p-6 transition-all duration-300 cursor-default ${card}`}>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110 ${a.bg}`}>
                    {f.icon}
                  </div>
                  <p className={`mb-2 text-base font-extrabold tracking-tight ${tx1}`}>{f.title}</p>
                  <p className={`text-sm leading-relaxed ${tx2}`}>{f.desc}</p>
                  <div className={`mt-4 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-16 ${a.dot}`} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════
            HOW IT WORKS  (alternating layout)
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className="mb-12 text-center">
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${tx3}`}>Simple as 1-2-3</p>
            <h2 className={`text-3xl font-black tracking-tight ${tx1}`}>Start dubbing in 3 steps</h2>
          </div>
          <div className="space-y-5">
            {[
              { num: "01", icon: "📁", title: "Upload your video",       desc: "Drop any MP4, MOV or AVI. Any language, any accent, any duration.", side: "left",  color: "violet" },
              { num: "02", icon: "⚙️", title: "Configure & run",         desc: "Pick source/target languages, voice type, model size — hit go.", side: "right", color: "indigo" },
              { num: "03", icon: "⬇️", title: "Download dubbed video",   desc: "Get a fully dubbed, lip-synced video in minutes. Ready to use.", side: "left",  color: "emerald" },
            ].map((item) => {
              const a = acc[item.color];
              return (
                <div key={item.num}
                  className={`flex flex-col gap-5 rounded-3xl border p-8 transition-all duration-300 hover:scale-[1.01] sm:flex-row sm:items-center ${
                    item.side === "right" ? "sm:flex-row-reverse" : ""
                  } ${
                    dark ? "border-white/8 bg-white/[0.02] hover:border-white/15" : "border-slate-200 bg-white shadow-md hover:shadow-xl hover:border-violet-200"
                  }`}>
                  <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-4xl shadow-lg mx-auto sm:mx-0 ${a.bg}`}>
                    {item.icon}
                  </div>
                  <div className={`flex-1 text-center sm:text-left ${item.side === "right" ? "sm:text-right" : ""}`}>
                    <div className={`mb-1 text-xs font-black uppercase tracking-[0.2em] ${a.text}`}>{item.num}</div>
                    <h3 className={`text-xl font-extrabold tracking-tight ${tx1}`}>{item.title}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${tx2}`}>{item.desc}</p>
                  </div>
                  <div className={`hidden text-7xl font-black opacity-5 sm:block ${tx1}`}>{item.num}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════
            LANGUAGES
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className="mb-10 text-center">
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${tx3}`}>Language support</p>
            <h2 className={`text-3xl font-black tracking-tight ${tx1}`}>22 Indian languages</h2>
            <p className={`mt-3 text-sm ${tx2}`}>Any source language → any target language, bridged through the AI pipeline.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {languages.map((lang, i) => (
              <span key={lang}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 cursor-default ${
                  i === languages.length - 1
                    ? dark ? "border-white/5 bg-white/[0.02] text-slate-600" : "border-slate-200 bg-slate-100 text-slate-400"
                    : dark ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                           : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
                }`}>
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            TECH STACK
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className={`rounded-3xl border p-8 text-center ${
            dark ? "border-white/8 bg-white/[0.02]" : "border-slate-200 bg-white shadow-md"
          }`}>
            <p className={`mb-6 text-xs font-bold uppercase tracking-[0.2em] ${tx3}`}>Powered by</p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {[
                { name: "OpenAI Whisper", color: "text-violet-500" },
                { name: "Argos Translate", color: "text-blue-500" },
                { name: "Edge Neural TTS", color: "text-indigo-500" },
                { name: "Wav2Lip GAN", color: "text-pink-500" },
                { name: "FFmpeg", color: "text-amber-500" },
                { name: "Flask",  color: "text-emerald-500" },
                { name: "React",  color: "text-cyan-500" },
              ].map((t) => (
                <span key={t.name} className={`text-sm font-extrabold tracking-tight transition-all duration-200 hover:scale-110 cursor-default ${t.color} ${dark ? "opacity-60 hover:opacity-100" : "opacity-70 hover:opacity-100"}`}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            CTA
        ════════════════════════════════ */}
        <section>
          <div className={`relative overflow-hidden rounded-3xl border p-12 text-center ${
            dark ? "border-violet-500/20 bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-900/30"
                 : "border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 shadow-xl shadow-violet-100/50"
          }`}>
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-[60px]" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/15 blur-[60px]" />

            <div className="relative">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
                dark ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-violet-300 bg-white text-violet-700 shadow-sm"
              }`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Ready to dub
              </div>
              <h2 className={`mb-4 text-4xl font-black tracking-tight ${tx1}`}>Your video. Any language.</h2>
              <p className={`mb-8 text-base ${tx2}`}>
                Upload once — get a fully dubbed, lip-synced video in minutes.
              </p>
              <Link to="/studio"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-10 py-4 text-base font-extrabold text-white shadow-xl shadow-violet-500/40 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/60">
                Open Studio
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}