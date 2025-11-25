import React, { useMemo, useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translateMessage, setTranslateMessage] = useState("");
  const [language, setLanguage] = useState("auto");
  const [targetLang, setTargetLang] = useState("hi");
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [modelSize, setModelSize] = useState("base");
  const [ttsLang, setTtsLang] = useState("hi");
  const [voiceProfile, setVoiceProfile] = useState("female");
  const [audioUrl, setAudioUrl] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Waiting for a media file");
  const [errorMessage, setErrorMessage] = useState("");

  const hasTranscription = Boolean(text);
  const hasTranslation = Boolean(translateMessage);

  const stepperItems = useMemo(
    () => [
      {
        label: "Upload",
        description: file ? file.name : "Drop audio/video or click to browse",
        done: Boolean(file),
      },
      {
        label: "Transcribe",
        description: hasTranscription
          ? `Detected ${detectedLanguage || language}`
          : "Convert speech to text",
        done: hasTranscription,
      },
      {
        label: "Translate",
        description: hasTranslation ? `Translated to ${targetLang}` : "Optional",
        done: hasTranslation,
      },
      {
        label: "Voice style",
        description: `Tone: ${voiceProfile}`,
        done: Boolean(voiceProfile),
      },
      {
        label: "Voiceover",
        description: audioUrl ? "Preview ready" : "Generate AI voice",
        done: Boolean(audioUrl),
      },
    ],
    [file, hasTranscription, detectedLanguage, language, hasTranslation, targetLang, voiceProfile, audioUrl]
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
    setText("");
    setTranslateMessage("");
    setAudioUrl(null);
    setVoiceProfile("female");
    setStatusMessage(selectedFile ? "Ready to transcribe" : "Waiting for a media file");
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
    setErrorMessage("");
    setStatusMessage("Uploading and transcribing…");
    try {
      const res = await axios.post("http://localhost:8000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 900000,
      });
      setText(res.data.transcription || "No transcription found");
      setDetectedLanguage(res.data.detected_language || language);
      setStatusMessage("Transcription completed");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.message ||
          "Transcription failed. Check backend logs."
      );
      setText("");
      setStatusMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!text) return;
    setTranslateMessage("");
    setErrorMessage("");
    setStatusMessage("Translating text…");

    try {
      const sourceLang = detectedLanguage ? detectedLanguage.toLowerCase() : "en";

      const res = await axios.post("http://localhost:8000/translate", {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      });

      if (res.data.translated_text) {
        setTranslateMessage(res.data.translated_text);
        setStatusMessage("Translation ready");
      } else {
        setTranslateMessage("Translation failed!");
        setStatusMessage("Translation failed");
      }
    } catch (err) {
      setTranslateMessage("Error: " + err.message);
      setErrorMessage(err.message);
      setStatusMessage("Translation failed");
    }
  };

  const handleTTS = async () => {
    if (!translateMessage) return;

    setStatusMessage("Generating synthetic voice…");
    setErrorMessage("");

    try {
      const res = await axios.post("http://localhost:8000/tts", {
        text: translateMessage,
        lang: ttsLang,
        voice: voiceProfile,
      });

      if (res.data.audio_url) {
        setAudioUrl("http://localhost:8000" + res.data.audio_url);
        setStatusMessage("Voiceover created");
      } else {
        setStatusMessage("TTS failed");
      }
    } catch (err) {
      setStatusMessage("TTS failed");
      setErrorMessage(err.message);
      alert("TTS failed! Check backend logs.");
    }
  };

  const resetPipeline = () => {
    setFile(null);
    setText("");
    setTranslateMessage("");
    setAudioUrl(null);
    setDetectedLanguage(null);
    setVoiceProfile("female");
    setStatusMessage("Waiting for a media file");
    setErrorMessage("");
  };

  const renderStepIndicator = () => (
    <div className="space-y-4">
      {stepperItems.map((step, index) => (
        <div key={step.label} className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              step.done
                ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                : "border-white/30 text-gray-300"
            }`}
          >
            {step.done ? "✓" : index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
              {step.label}
            </p>
            <p className="text-sm text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const glassCard =
    "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.45)]";

  return (
    <div className="relative min-h-screen bg-[#030616] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute right-0 top-44 h-64 w-64 rounded-full bg-blue-500/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
        <header className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-[0.65rem] uppercase tracking-[0.35em] text-blue-200/90 ring-1 ring-white/5 lg:flex-row">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              Whisper powered pipeline
            </span>
            <span className="text-[0.6rem] tracking-[0.45em] text-white/60">
              Transcribe · Translate · Voiceover
            </span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div className="space-y-5 text-center lg:text-left">
              <h1 className="text-4xl font-semibold leading-tight text-transparent md:text-6xl bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text">
                MultiVidAI
              </h1>
              <p className="text-base text-slate-200 md:text-xl">
                Premium studio-grade studio to convert any media into multilingual subtitles,
                real-time translations, and cinematic AI narration—crafted for next-gen storytellers.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.35em] text-slate-200">
                <span>Fast lane</span>
                <span className="text-white/40">•</span>
                <span>22 languages</span>
                <span className="text-white/40">•</span>
                <span>Studio ready output</span>
              </div>
            </div>
            <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/5 text-center text-sm text-slate-200">
              <div className="border-r border-white/5 py-5">
                <p className="text-2xl font-semibold text-white">22+</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                  Languages
                </p>
              </div>
              <div className="border-r border-white/5 py-5">
                <p className="text-2xl font-semibold text-white">∞</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                  Duration
                </p>
              </div>
              <div className="py-5">
                <p className="text-2xl font-semibold text-white">3 steps</p>
                <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                  Workflow
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className={`${glassCard} p-8`}>
            <div className="grid gap-6">
              <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                <label
                  htmlFor="file-upload"
                  className="relative flex h-full flex-col justify-between rounded-2xl border border-dashed border-white/20 bg-gradient-to-br from-white/10 to-transparent p-6 text-sm text-slate-200 transition hover:border-blue-400 hover:bg-white/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-white/80">Media File</p>
                    <p className="text-xs text-slate-400">Audio / Video · max 2GB</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-base font-medium text-white">
                    <span>{file ? file.name : "Drop or browse your file"}</span>
                    <span className="text-xs text-slate-400">
                      Supported: mp3 · wav · mp4 · mov · mkv
                    </span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="audio/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-xs text-blue-300">Click to browse</span>
                </label>

                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">
                        Input language
                      </label>
                      <select
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-[#060b1e] px-3 py-2 text-sm text-gray-100 focus:border-blue-400 focus:outline-none"
                        value={language}
                        disabled={loading}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="auto">Auto detect</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="te">Telugu</option>
                        <option value="mr">Marathi</option>
                        <option value="ta">Tamil</option>
                        <option value="gu">Gujarati</option>
                        <option value="ur">Urdu</option>
                        <option value="kn">Kannada</option>
                        <option value="or">Odia</option>
                        <option value="ml">Malayalam</option>
                        <option value="pa">Punjabi</option>
                        <option value="as">Assamese</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-slate-400">
                        Model size
                      </label>
                      <select
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-[#060b1e] px-3 py-2 text-sm text-gray-100 focus:border-blue-400 focus:outline-none"
                        value={modelSize}
                        disabled={loading}
                        onChange={(e) => setModelSize(e.target.value)}
                      >
                        <option value="tiny">Tiny · Fastest</option>
                        <option value="base">Base · Recommended</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large · Highest accuracy</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <button
                      onClick={resetPipeline}
                      className="w-full rounded-2xl border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-white/50 hover:text-white md:w-auto"
                      type="button"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={loading || !file}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:shadow-blue-600/60 disabled:cursor-not-allowed disabled:opacity-50 md:flex-1"
                    >
                      {loading ? (
                        <>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                          Transcribing…
                        </>
                      ) : (
                        "Upload & Transcribe"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </p>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                {hasTranscription && (
                  <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/5 p-5 shadow-inner lg:col-span-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-300">
                          Transcription
                        </p>
                        {detectedLanguage && (
                          <p className="text-sm text-emerald-100">
                            Detected language:{" "}
                            <span className="font-semibold uppercase">
                              {detectedLanguage}
                            </span>
                          </p>
                        )}
                      </div>
                      <button
                        className="ml-auto rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-wide text-gray-200 transition hover:border-white/60 hover:text-white"
                        onClick={() => navigator.clipboard.writeText(text)}
                        type="button"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-100">
                      {text}
                    </p>
                  </div>
                )}

                {hasTranscription && (
                  <div
                    className={`space-y-4 rounded-3xl border border-pink-500/30 bg-pink-500/5 p-5 shadow-inner ${
                      hasTranslation ? "lg:col-span-2" : "lg:col-span-3"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-pink-300">
                          Translate
                        </p>
                        <p className="text-sm text-gray-200">Target language</p>
                      </div>
                      <select
                        className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                      >
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="mr">Marathi</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="gu">Gujarati</option>
                        <option value="kn">Kannada</option>
                        <option value="ml">Malayalam</option>
                        <option value="pa">Punjabi</option>
                        <option value="ur">Urdu</option>
                        <option value="en">English</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleTranslate}
                        className="ml-auto rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow"
                      >
                        Translate text
                      </button>
                    </div>
                    {hasTranslation ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">
                        {translateMessage}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300">
                        Choose a target language and convert instantly into culturally accurate text.
                      </p>
                    )}
                  </div>
                )}

                {hasTranslation && (
                  <div className="rounded-3xl border border-indigo-400/30 bg-indigo-500/5 p-5 shadow-inner lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-indigo-300">
                          Voice persona
                        </p>
                        <p className="text-sm text-gray-200">Choose tone</p>
                      </div>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-white/70">
                        Function
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {["female", "male"].map((profile) => {
                        const active = voiceProfile === profile;
                        return (
                          <button
                            key={profile}
                            type="button"
                            onClick={() => setVoiceProfile(profile)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                              active
                                ? "border-white/60 bg-white/10 text-white shadow-lg"
                                : "border-white/10 bg-black/30 text-slate-200 hover:border-white/30"
                            }`}
                          >
                            {profile}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-xs text-slate-300">
                      Tune the narration energy before generating the final AI voiceover.
                    </p>
                  </div>
                )}

                {hasTranslation && (
                  <div className="rounded-3xl border border-yellow-400/30 bg-yellow-400/5 p-5 shadow-inner lg:col-span-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-yellow-400">
                          Voiceover
                        </p>
                        <p className="text-sm text-gray-200">Narration language</p>
                      </div>
                      <select
                        className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100"
                        value={ttsLang}
                        onChange={(e) => setTtsLang(e.target.value)}
                      >
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="mr">Marathi</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="gu">Gujarati</option>
                        <option value="kn">Kannada</option>
                        <option value="ml">Malayalam</option>
                        <option value="pa">Punjabi</option>
                        <option value="ur">Urdu</option>
                        <option value="en">English</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleTTS}
                        className="ml-auto rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:shadow"
                      >
                        Generate voiceover
                      </button>
                    </div>
                    {audioUrl ? (
                      <audio className="mt-4 w-full" controls>
                        <source src={audioUrl} type="audio/mp3" />
                      </audio>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">
                        Create natural voice narration in seconds after translating.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className={`${glassCard} p-6`}>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
                Pipeline tracker
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {statusMessage}
              </p>
              <div className="mt-6">{renderStepIndicator()}</div>
            </div>

            <div className={`${glassCard} space-y-4 p-6 text-sm text-gray-200`}>
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-white">Pro tips</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-purple-200">
                  Live
                </span>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Use auto-detect when unsure of the spoken language for better accuracy.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Base model balances precision and speed for most clips.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-400" />
                  Keep the tab active for long media to prevent browser throttling.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-300" />
                  Download your AI voiceover to reuse across social channels.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
