import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const API_BASE_URL = "http://localhost:3000";

async function getTracksForMood(mood) {
  try {
    const response = await fetch(`${API_BASE_URL}/songs?mood=${mood}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.song || [];
  } catch (err) {
    console.error("Failed to fetch tracks from backend:", err);
    return [];
  }
}

const MOOD_META = {
  happy: { emoji: "😄", color: "#f59e0b" },
  sad: { emoji: "😔", color: "#60a5fa" },
  angry: { emoji: "😠", color: "#f87171" },
  surprised: { emoji: "😲", color: "#a78bfa" },
  neutral: { emoji: "😐", color: "#94a3b8" },
  fearful: { emoji: "😨", color: "#818cf8" },
  disgusted: { emoji: "🤢", color: "#4ade80" },
};

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [emotion, setEmotion] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  async function loadModels() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      await startWebcam();
    } catch (err) {
      console.error("Model Loading Error:", err);
    }
  }

  async function startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setLoading(false);
      };
    } catch (err) {
      console.error("Webcam Error:", err);
    }
  }

  async function handleDetectClick() {
    if (!videoRef.current || !canvasRef.current) return;
    setDetecting(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const containerWidth = video.clientWidth;
    const containerHeight = video.clientHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
      )
      .withFaceLandmarks(true)
      .withFaceExpressions();

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detection) {
      setEmotion("none");
      setTracks([]);
      console.log("No Face Detected");
      setDetecting(false);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const scale = Math.max(
      containerWidth / videoWidth,
      containerHeight / videoHeight
    );

    const offsetX = (videoWidth * scale - containerWidth) / 2;
    const offsetY = (videoHeight * scale - containerHeight) / 2;

    const box = detection.detection.box;

    const drawBox = {
      x: box.x * scale - offsetX,
      y: box.y * scale - offsetY,
      width: box.width * scale,
      height: box.height * scale,
    };

    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 3;
    ctx.strokeRect(drawBox.x, drawBox.y, drawBox.width, drawBox.height);

    const expressions = detection.expressions;
    const bestEmotion = Object.keys(expressions).reduce((a, b) =>
      expressions[a] > expressions[b] ? a : b
    );
    const confidence = (expressions[bestEmotion] * 100).toFixed(1);

    setEmotion({ label: bestEmotion, confidence });
    console.log("Detected Mood:", `${bestEmotion} (${confidence}%)`);
    console.log("Full Expressions Data:", expressions);

    setTracksLoading(true);
    const fetchedTracks = await getTracksForMood(bestEmotion);
    setTracks(fetchedTracks);
    setTracksLoading(false);

    setDetecting(false);
  }

  function handlePlayTrack(track) {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (playingId === track._id) {
      setPlayingId(null);
      return;
    }

    const audio = new Audio(track.audio);
    audioRef.current = audio;
    audio.play();
    setPlayingId(track._id);

    audio.onended = () => setPlayingId(null);
  }

  useEffect(() => {
    loadModels();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const moodLabel = emotion && emotion !== "none" ? emotion.label : null;
  const meta = moodLabel ? MOOD_META[moodLabel] || MOOD_META.neutral : null;

  const t = darkMode
    ? {
        pageBg: "bg-[#08080c]",
        headerBg: "bg-[#0c0c12]/80",
        border: "border-white/[0.06]",
        card: "bg-[#111118] border-white/[0.06]",
        cardInner: "bg-white/[0.03]",
        text: "text-white",
        subtext: "text-slate-400",
        muted: "text-slate-500",
        row: "hover:bg-white/[0.04]",
        rowBorder: "border-white/[0.06]",
        shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
      }
    : {
        pageBg: "bg-[#f7f7fa]",
        headerBg: "bg-white/80",
        border: "border-slate-200",
        card: "bg-white border-slate-200",
        cardInner: "bg-slate-50",
        text: "text-slate-900",
        subtext: "text-slate-500",
        muted: "text-slate-400",
        row: "hover:bg-slate-50",
        rowBorder: "border-slate-100",
        shadow: "shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
      };

  return (
    <div className={`min-h-screen ${t.pageBg} transition-colors font-sans`}>
      {/* Top header */}
      <header
        className={`sticky top-0 z-40 ${t.headerBg} backdrop-blur-md border-b ${t.border}`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-violet-500/20 shrink-0">
              M
            </div>
            <span className={`${t.text} font-semibold text-[15px] tracking-tight`}>
              Mood Player
            </span>
          </div>

          <button
            onClick={() => setDarkMode((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${t.border} ${t.subtext} transition-colors hover:${darkMode ? "bg-white/5" : "bg-slate-50"}`}
          >
            {darkMode ? "☀️" : "🌙"}
            <span className="hidden sm:inline">{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold ${t.text} tracking-tight`}>
            Live Mood Detection
          </h1>
          <p className={`${t.subtext} text-sm mt-1.5`}>
            Detect your expression and get tracks that match it.
          </p>
        </div>

        {/* Detection Card */}
        <div className={`${t.card} border rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10 ${t.shadow}`}>
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center">
            <div className="relative w-full sm:w-52 md:w-56 h-52 sm:h-52 md:h-56 rounded-2xl overflow-hidden bg-black shrink-0 ring-1 ring-white/10">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                disablePictureInPicture
                controlsList="nofullscreen noremoteplayback nodownload"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-slate-300">Starting camera...</span>
                </div>
              )}

              {moodLabel && (
                <div
                  className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md"
                  style={{ backgroundColor: `${meta.color}cc` }}
                >
                  <span>{meta.emoji}</span>
                  <span className="capitalize">{moodLabel}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
              <div>
                <h2 className={`${t.text} font-semibold text-lg`}>
                  Live Mood Reaction
                </h2>
                <p className={`${t.subtext} text-sm mt-1.5 leading-relaxed`}>
                  {moodLabel
                    ? `Detected mood: `
                    : emotion === "none"
                    ? "No face detected — try again with better lighting."
                    : "Press the button below to scan your current expression."}
                  {moodLabel && (
                    <span className={`font-semibold ${t.text} capitalize`}>
                      {moodLabel} · {emotion.confidence}%
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={handleDetectClick}
                disabled={loading || detecting}
                className="self-start px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md shadow-violet-500/25 flex items-center gap-2"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-white ${detecting ? "animate-pulse" : ""}`}
                />
                {loading ? "Starting camera..." : detecting ? "Detecting..." : "Live Listening"}
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Tracks */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className={`${t.text} font-semibold text-base tracking-tight`}>
              Recommended Tracks
            </h3>
            {tracks.length > 0 && (
              <span className={`${t.muted} text-xs`}>{tracks.length} tracks</span>
            )}
          </div>

          <div className={`${t.card} border rounded-2xl overflow-hidden ${t.shadow}`}>
            {tracksLoading ? (
              <div className={`${t.subtext} text-sm p-8 text-center`}>
                Fetching tracks...
              </div>
            ) : tracks.length === 0 ? (
              <div className={`${t.muted} text-sm p-8 text-center`}>
                {emotion
                  ? "Koi track nahi mili is mood ke liye — backend check karo."
                  : "Detect your mood to see track recommendations here."}
              </div>
            ) : (
              tracks.map((track, i) => {
                const isPlaying = playingId === track._id;
                return (
                  <div
                    key={track._id}
                    onClick={() => handlePlayTrack(track)}
                    className={`flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 ${t.row} transition-colors cursor-pointer ${
                      i !== tracks.length - 1 ? `border-b ${t.rowBorder}` : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isPlaying
                            ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                            : t.cardInner
                        }`}
                      >
                        <span className={isPlaying ? "text-white text-sm" : `${t.muted} text-sm`}>
                          {isPlaying ? "⏸" : "▶"}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`${t.text} text-sm font-medium truncate`}>
                          {track.songName}
                        </span>
                        <span className={`${t.subtext} text-xs mt-0.5 truncate`}>
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    {isPlaying && (
                      <span className="text-[11px] font-medium text-violet-500 shrink-0">
                        Playing
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;