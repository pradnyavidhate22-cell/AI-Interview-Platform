import React, { useEffect, useRef, useState, useCallback } from "react";
import { useInterview } from "../context/InterviewContext";

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      c: Math.random() > 0.5 ? "#e040fb" : "#ce93d8",
      o: Math.random() * 0.5 + 0.2,
    }));
    let raf;
    const draw = () => {
      const W = (canvas.width = canvas.offsetWidth);
      const H = (canvas.height = canvas.offsetHeight);
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;
        ctx.beginPath();
        ctx.arc((p.x / 100) * W, (p.y / 100) * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.o;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

function HumanoidFace({ speaking, listening, thinking }) {
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setScan((s) => (s + 1) % 100), 20);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!speaking) {
      setMouth(0);
      return;
    }
    const iv = setInterval(() => setMouth(Math.random()), 110);
    return () => clearInterval(iv);
  }, [speaking]);

  const iris = listening ? "#e040fb" : thinking ? "#f48fb1" : "#ce93d8";
  const eyeRy = blink ? 0.5 : 7;

  return (
    <svg
      viewBox="0 0 200 260"
      style={{ width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="38%">
          <stop offset="0%" stopColor="#e8d5c4" />
          <stop offset="60%" stopColor="#c4a882" />
          <stop offset="100%" stopColor="#8b6f47" />
        </radialGradient>
        <radialGradient id="metalGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#b0b0c0" />
          <stop offset="100%" stopColor="#404055" />
        </radialGradient>
        <radialGradient id="eyeGlowL" cx="50%" cy="50%">
          <stop offset="0%" stopColor={iris} stopOpacity="1" />
          <stop offset="60%" stopColor={iris} stopOpacity="0.6" />
          <stop offset="100%" stopColor={iris} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eyeGlowR" cx="50%" cy="50%">
          <stop offset="0%" stopColor={iris} stopOpacity="1" />
          <stop offset="60%" stopColor={iris} stopOpacity="0.6" />
          <stop offset="100%" stopColor={iris} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neckGrad" cx="50%" cy="20%">
          <stop offset="0%" stopColor="#555570" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="subtleGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="faceClip">
          <ellipse cx="100" cy="110" rx="62" ry="78" />
        </clipPath>
        <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={iris} stopOpacity="0" />
          <stop offset="50%" stopColor={iris} stopOpacity="0.12" />
          <stop offset="100%" stopColor={iris} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Neck */}
      <rect x="70" y="195" width="60" height="65" rx="8" fill="url(#neckGrad)" />
      <rect x="55" y="215" width="90" height="8" rx="4" fill="#2a2a3e" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={58 + i * 17}
          y="218"
          width="13"
          height="5"
          rx="2"
          fill="#333350"
          stroke={iris}
          strokeWidth="0.3"
          strokeOpacity="0.5"
        />
      ))}
      <path
        d="M 88 200 Q 85 220 82 235"
        stroke="#444460"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 100 220 100 235"
        stroke="#444460"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 112 200 Q 115 220 118 235"
        stroke="#444460"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 88 200 Q 85 220 82 235"
        stroke={iris}
        strokeWidth="0.6"
        fill="none"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 112 200 Q 115 220 118 235"
        stroke={iris}
        strokeWidth="0.6"
        fill="none"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* Head */}
      <ellipse cx="100" cy="108" rx="65" ry="80" fill="#1e1e30" />
      <ellipse cx="100" cy="108" rx="63" ry="78" fill="url(#metalGrad)" />
      <ellipse cx="100" cy="112" rx="58" ry="72" fill="url(#skinGrad)" />

      {/* Scan line */}
      <rect
        x="40"
        y={40 + scan * 1.5}
        width="120"
        height="18"
        fill="url(#scanLine)"
        clipPath="url(#faceClip)"
      />

      {/* Crown */}
      <ellipse
        cx="100"
        cy="38"
        rx="30"
        ry="6"
        fill="#2a2a3e"
        stroke={iris}
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />
      <circle cx="100" cy="38" r="4" fill={iris} opacity="0.9" filter="url(#subtleGlow)" />
      <circle cx="82" cy="40" r="2" fill={iris} opacity="0.5" />
      <circle cx="118" cy="40" r="2" fill={iris} opacity="0.5" />

      {/* Ears */}
      {[37, 163].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="108" rx="10" ry="22" fill="#252540" stroke="#555570" strokeWidth="0.8" />
          <ellipse cx={cx} cy="108" rx="6" ry="14" fill="#1a1a30" />
          <circle
            cx={cx}
            cy="100"
            r="2.5"
            fill={iris}
            opacity={listening ? 1 : 0.4}
            filter="url(#subtleGlow)"
          />
          <circle cx={cx} cy="108" r="2" fill={iris} opacity="0.3" />
          <circle cx={cx} cy="116" r="2.5" fill={iris} opacity={listening ? 0.8 : 0.3} />
        </g>
      ))}

      {/* Eyes */}
      <ellipse cx="72" cy="98" rx="18" ry="13" fill="#0d0d1a" />
      <ellipse cx="72" cy="98" rx="16" ry="11" fill="#0a0a15" stroke={iris} strokeWidth="0.5" strokeOpacity="0.4" />
      <ellipse cx="72" cy="98" rx="12" ry="12" fill="url(#eyeGlowL)" opacity="0.7" filter="url(#softGlow)" />
      <ellipse cx="72" cy="98" rx="10" ry={eyeRy} fill="#0f0f20" />
      {!blink && (
        <>
          <ellipse cx="72" cy="98" rx="7" ry="7" fill={iris} opacity="0.95" />
          <ellipse cx="72" cy="98" rx="4" ry="4" fill="#050510" />
          <ellipse cx="72" cy="98" rx="2.5" ry="2.5" fill={iris} opacity="0.8" />
          <circle cx="69" cy="95" r="2" fill="white" opacity="0.7" />
          <circle cx="75" cy="101" r="1" fill="white" opacity="0.3" />
        </>
      )}

      <ellipse cx="128" cy="98" rx="18" ry="13" fill="#0d0d1a" />
      <ellipse cx="128" cy="98" rx="16" ry="11" fill="#0a0a15" stroke={iris} strokeWidth="0.5" strokeOpacity="0.4" />
      <ellipse cx="128" cy="98" rx="12" ry="12" fill="url(#eyeGlowR)" opacity="0.7" filter="url(#softGlow)" />
      <ellipse cx="128" cy="98" rx="10" ry={eyeRy} fill="#0f0f20" />
      {!blink && (
        <>
          <ellipse cx="128" cy="98" rx="7" ry="7" fill={iris} opacity="0.95" />
          <ellipse cx="128" cy="98" rx="4" ry="4" fill="#050510" />
          <ellipse cx="128" cy="98" rx="2.5" ry="2.5" fill={iris} opacity="0.8" />
          <circle cx="125" cy="95" r="2" fill="white" opacity="0.7" />
          <circle cx="131" cy="101" r="1" fill="white" opacity="0.3" />
        </>
      )}

      {/* Nose */}
      <path d="M 100 110 L 96 128 Q 100 132 104 128 L 100 110" fill="#b89470" opacity="0.8" />
      <ellipse cx="94" cy="128" rx="5" ry="3.5" fill="#9a7455" opacity="0.9" />
      <ellipse cx="106" cy="128" rx="5" ry="3.5" fill="#9a7455" opacity="0.9" />

      {/* Mouth (speaking animation) */}
      <path d="M 82 150 Q 91 145 100 146 Q 109 145 118 150" stroke="#9a7060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {mouth > 0.1 && (
        <ellipse
          cx="100"
          cy={153 + mouth * 4}
          rx={14 * mouth}
          ry={mouth * 5 + 1}
          fill="#0a0a15"
          stroke={iris}
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
      )}
      <path d="M 85 156 Q 100 162 115 156" stroke="#7a5545" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {speaking && (
        <path
          d="M 82 150 Q 100 148 118 150"
          stroke={iris}
          strokeWidth="0.6"
          fill="none"
          strokeOpacity="0.7"
          filter="url(#subtleGlow)"
        />
      )}

      {/* Temple circuits */}
      <path d="M 46 90 L 54 86 L 58 78" stroke={iris} strokeWidth="0.5" fill="none" strokeOpacity="0.4" />
      <path d="M 154 90 L 146 86 L 142 78" stroke={iris} strokeWidth="0.5" fill="none" strokeOpacity="0.4" />
      <circle cx="46" cy="90" r="1.5" fill={iris} opacity="0.5" />
      <circle cx="154" cy="90" r="1.5" fill={iris} opacity="0.5" />
    </svg>
  );
}

function VoiceWave({ active, color }) {
  const bars = 24;
  const [heights, setHeights] = useState(Array(bars).fill(3));
  useEffect(() => {
    if (!active) {
      setHeights(Array(bars).fill(3));
      return;
    }
    const iv = setInterval(() => {
      setHeights(
        Array.from({ length: bars }, (_, i) => {
          const center = Math.abs(i - bars / 2) / (bars / 2);
          return (Math.random() * 26 + 4) * (1 - center * 0.4);
        })
      );
    }, 80);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5, height: 40 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            height: h,
            borderRadius: 3,
            background: active ? color : "rgba(206,147,216,0.2)",
            transition: "height 0.07s ease",
          }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            marginRight: 8,
            marginTop: 2,
            background: "linear-gradient(135deg, #6a1b9a, #e040fb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "white",
            fontWeight: 700,
          }}
        >
          A
        </div>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
          background: isUser ? "linear-gradient(135deg, #6a1b9a, #e040fb)" : "rgba(255,255,255,0.05)",
          border: isUser ? "none" : "1px solid rgba(224,64,251,0.2)",
          color: "#f3e5f5",
          fontSize: 13.5,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// Main ─────────────────────────────────────────────────────────────────────
export default function HumanoidInterviewAvatar() {
  const { currentQuestion, startInterview, submitResponse } = useInterview();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("Online");
  const [latestRating, setLatestRating] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  const recRef = useRef(null);
  const chatEndRef = useRef(null);
  const videoRef = useRef(null);
  const didAutoSpeakRef = useRef(false);
  const speakingRef = useRef(false);
  const pendingQuestionRef = useRef(null);

  useEffect(() => {
    setQuestion(currentQuestion || "");
  }, [currentQuestion]);

  useEffect(() => {
    (async () => {
      const data = await startInterview();
      const q = (data?.question || "").trim();
      if (!q) return;
      setQuestion(q);
      didAutoSpeakRef.current = true;
      const intro =
        "Hello, I am ARIA, your AI interview coach. I will ask you technical questions and help you improve your answers.";
      speakText(`${intro} First question: ${q}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Camera access (local preview only, not sent to backend).
  useEffect(() => {
    if (!cameraOn) return;
    let stream;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStatus("Camera access denied");
        setCameraOn(false);
      }
    })();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraOn]);

  const speakText = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    // If voice recognition is active, stop it before speaking.
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
    setSpeaking(true);
    speakingRef.current = true;
    setStatus("Speaking...");
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92;
    utt.pitch = 1.15;

    const chooseVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      return (
        voices.find((v) => v.name.toLowerCase().includes("female") && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0]
      );
    };
    const v = chooseVoice();
    if (v) utt.voice = v;

    utt.onend = () => {
      setSpeaking(false);
      speakingRef.current = false;
      setStatus("Online");
      // If a new question arrived while we were speaking the answer, speak it now.
      if (pendingQuestionRef.current) {
        const q = pendingQuestionRef.current;
        pendingQuestionRef.current = null;
        didAutoSpeakRef.current = true; // prevent re-trigger from the same question change
        speakText(q);
      }
    };
    utt.onerror = () => {
      setSpeaking(false);
      speakingRef.current = false;
      setStatus("Online");
    };
    window.speechSynthesis.speak(utt);
  }, []);

  // Fallback speaker: if question changes and we are not currently speaking, read it.
  useEffect(() => {
    if (!question) return;
    if (didAutoSpeakRef.current) return;
    didAutoSpeakRef.current = true;
    if (speakingRef.current) {
      pendingQuestionRef.current = question;
      return;
    }
    speakText(question);
  }, [question, speakText]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed) return;

      // If voice recognition is active, stop it before analyzing/speaking.
      try {
        recRef.current?.stop();
      } catch {}
      setListening(false);

      setMessages((p) => [...p, { role: "user", content: trimmed }]);
      setThinking(true);
      setStatus("Processing...");

      try {
        const data = await submitResponse(trimmed);
        const feedback = data.feedback || "";
        const nextQ = (data.next_question || "").trim();
        const improved = data.improved_answer || "";
        const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        const conf = typeof data.confidence_score === "number" ? data.confidence_score : null;

        if (conf != null) {
          setLatestRating(Math.round(conf * 10000) / 100); // 0-1 => percent with 2 decimals
        }

        const ratingText = conf == null ? "" : `Rating: ${Math.round(conf * 10 * 10) / 10}/10`;
        const suggestionsText = suggestions.length
          ? `Suggestions:\n${suggestions.map((s) => `• ${s}`).join("\n")}`
          : "";

        const assistantText =
          `Feedback: ${feedback}\n` +
          (ratingText ? `${ratingText}\n` : "") +
          (improved ? `\nImproved Answer:\n${improved}\n` : "") +
          (suggestionsText ? `\n${suggestionsText}` : "");

        setMessages((p) => [...p, { role: "assistant", content: assistantText }]);
        if (nextQ) {
          setQuestion(nextQ);
          // Queue next question explicitly after we finish speaking the answer.
          pendingQuestionRef.current = nextQ;
          didAutoSpeakRef.current = true; // avoid duplicate speaking from question effect
        }

        setThinking(false);
        setStatus("Online");
        speakText(improved || feedback);
      } catch (e) {
        setThinking(false);
        setStatus("Error");
        setMessages((p) => [
          ...p,
          { role: "assistant", content: "Could not analyze response. Check backend." },
        ]);
      }
    },
    [speakText, submitResponse]
  );

  const revealAnswer = useCallback(async () => {
    if (thinking || listening) return;
    setThinking(true);
    setStatus("Revealing answer...");
    try {
      const data = await submitResponse("");
      const feedback = data.feedback || "";
      const nextQ = (data.next_question || "").trim();
      const improved = data.improved_answer || "";
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      const conf = typeof data.confidence_score === "number" ? data.confidence_score : null;

      if (conf != null) {
        setLatestRating(Math.round(conf * 10000) / 100); // 0-1 => percent
      }

      const suggestionText = suggestions.length
        ? `Suggestions:\n${suggestions.map((s) => `• ${s}`).join("\n")}`
        : "";

      const assistantText =
        `Feedback: ${feedback}\n` +
        (conf != null ? `Rating: ${(conf * 10).toFixed(1)}/10\n` : "") +
        (improved ? `\nImproved Answer:\n${improved}\n` : "") +
        (suggestionText ? `\n${suggestionText}` : "");

      setMessages((p) => [...p, { role: "assistant", content: assistantText }]);
      if (nextQ) {
        setQuestion(nextQ);
        pendingQuestionRef.current = nextQ;
        didAutoSpeakRef.current = true;
      }

      setStatus("Online");
      speakText(improved || feedback);
    } catch (e) {
      setStatus("Error");
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Could not reveal answer. Try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }, [listening, submitResponse, speakText, thinking]);

  const toggleVoice = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      setStatus("Online");
      return;
    }

    // Prevent SpeechRecognition conflicts with SpeechSynthesis.
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    setSpeaking(false);

    // Ensure microphone permission is granted (if browser supports it).
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err) {
      setStatus("Microphone permission denied");
      setListening(false);
      return;
    }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => {
      setListening(true);
      setStatus("Listening...");
    };
    rec.onresult = (e) => {
      setListening(false);
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) sendMessage(transcript);
    };
    rec.onerror = (e) => {
      setListening(false);
      const err = e?.error || e?.message || "unknown";
      let friendly = err;
      if (err === "not-allowed") friendly = "Microphone permission denied.";
      if (err === "service-not-allowed") friendly = "Speech service not allowed.";
      if (err === "no-speech") friendly = "No speech detected. Try again.";
      setStatus(`Voice error: ${friendly}`);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    try {
      rec.start();
    } catch (err) {
      setListening(false);
      setStatus(`Voice error: ${err?.message || "failed to start speech recognition"}`);
    }
  }, [listening, sendMessage]);

  const statusColor = listening
    ? "#e040fb"
    : thinking
    ? "#ce93d8"
    : speaking
    ? "#f48fb1"
    : "#69f0ae";
  const ringColor = listening
    ? "#e040fb"
    : speaking
    ? "#f48fb1"
    : thinking
    ? "#ce93d8"
    : "rgba(206,147,216,0.25)";
  const active = listening || speaking || thinking;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 940,
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(224,64,251,0.15)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(224,64,251,0.06)",
          minHeight: 620,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            background: "linear-gradient(180deg, #0e0818 0%, #06060f 100%)",
            borderRight: "1px solid rgba(224,64,251,0.1)",
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
            padding: "24px 18px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <ParticleField />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: 18 }}>
            <p
              style={{
                color: "#9c27b0",
                fontSize: 10,
                letterSpacing: 4,
                textTransform: "uppercase",
                margin: 0,
                fontWeight: 600,
              }}
            >
              Neural Interface
            </p>
            <h1 style={{ color: "#f3e5f5", fontSize: 28, fontWeight: 800, margin: "4px 0 0", letterSpacing: 2 }}>
              ARIA
            </h1>
            <p style={{ color: "#7b1fa2", fontSize: 11, margin: "2px 0 0", letterSpacing: 1 }}>
              v2.5 · Humanoid AI
            </p>
          </div>

          {/* Avatar + controls row */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* Avatar orb */}
            <div style={{ position: "relative", width: "100%", paddingTop: "100%" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${ringColor}`,
                  boxShadow: active
                    ? `0 0 20px ${ringColor}, inset 0 0 20px ${ringColor}20`
                    : "none",
                  transition: "all 0.4s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "radial-gradient(circle at 50% 40%, #1a0a2e, #06060f)",
                  border: "1.5px solid rgba(224,64,251,0.25)",
                }}
              >
                <HumanoidFace speaking={speaking} listening={listening} thinking={thinking} />
              </div>
            </div>

            {/* Status + voice + camera */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 8px ${statusColor}`,
                  }}
                />
                <span style={{ color: "#ce93d8", fontSize: 12, letterSpacing: 0.5 }}>{status}</span>
              </div>

              {latestRating != null && (
                <div style={{ color: "#f3e5f5", fontSize: 12 }}>
                  Confidence rating: <strong>{latestRating}%</strong>
                </div>
              )}

              <div style={{ width: "100%", marginTop: 4 }}>
                <VoiceWave active={listening || speaking} color={listening ? "#e040fb" : "#f48fb1"} />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={toggleVoice}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: listening
                      ? "linear-gradient(135deg, #e040fb, #ad1457)"
                      : "linear-gradient(135deg, #6a1b9a, #9c27b0)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: listening ? "0 0 24px rgba(224,64,251,0.6)" : "0 0 16px rgba(156,39,176,0.4)",
                    transition: "all 0.25s ease",
                    fontSize: 22,
                  }}
                >
                  {listening ? "⏹" : "🎤"}
                </button>

                <button
                  onClick={() => setCameraOn((v) => !v)}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    border: "1px solid rgba(224,64,251,0.3)",
                    background: cameraOn ? "rgba(129,199,132,0.2)" : "rgba(106,27,154,0.2)",
                    color: "#f3e5f5",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {cameraOn ? "Camera on" : "Turn camera on"}
                </button>
              </div>

              <p style={{ color: "#6a1b9a", fontSize: 11, margin: "4px 0 0" }}>
                {listening ? "Tap to stop listening" : "Tap to answer by voice"}
              </p>

              <button
                onClick={revealAnswer}
                disabled={thinking || listening}
                style={{
                  marginTop: 4,
                  width: "100%",
                  height: 40,
                  borderRadius: 14,
                  background: thinking || listening ? "rgba(206,147,216,0.2)" : "linear-gradient(135deg, #6a1b9a, #e040fb)",
                  border: "1px solid rgba(224,64,251,0.3)",
                  color: "white",
                  fontWeight: 700,
                  cursor: thinking || listening ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  fontSize: 12,
                }}
              >
                💡 Speak Answer
              </button>

              <button
                onClick={() => {
                  if (!question || listening || thinking) return;
                  setStatus("Advancing to next question...");
                  // Backend will return an updated `next_question` even when response is empty.
                  setThinking(true);
                  submitResponse("")
                    .then((data) => {
                      const nextQ = (data?.next_question || "").trim();
                      if (nextQ) {
                        setQuestion(nextQ);
                        pendingQuestionRef.current = null;
                        didAutoSpeakRef.current = true; // speaking explicitly below
                      } else {
                        setStatus("No next question received");
                      }
                      setStatus("Online");
                      speakText(nextQ || question);
                    })
                    .catch(() => {
                      setStatus("Error");
                    })
                    .finally(() => {
                      setThinking(false);
                    });
                }}
                disabled={listening || thinking || !question}
                style={{
                  marginTop: 4,
                  width: "100%",
                  height: 38,
                  borderRadius: 14,
                  background: listening || thinking || !question ? "rgba(206,147,216,0.2)" : "rgba(106,27,154,0.18)",
                  border: "1px solid rgba(224,64,251,0.2)",
                  color: "#f3e5f5",
                  fontWeight: 700,
                  cursor: listening || thinking || !question ? "not-allowed" : "pointer",
                  fontSize: 12,
                }}
              >
                ➡ Next (Speak)
              </button>
            </div>
          </div>

          {/* Camera preview */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: 12,
              width: "100%",
              height: 110,
              borderRadius: 16,
              border: "1px solid rgba(224,64,251,0.25)",
              background: "rgba(3,0,30,0.8)",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cameraOn ? 1 : 0.15 }}
            />
            {!cameraOn && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6a1b9a",
                  fontSize: 11,
                }}
              >
                Camera is off · Turn it on to boost confidence
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(224,64,251,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#69f0ae", boxShadow: "0 0 8px #69f0ae" }} />
            <span style={{ color: "#f3e5f5", fontSize: 14, fontWeight: 600 }}>Interview</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 20px",
              minHeight: 400,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(224,64,251,0.2) transparent",
            }}
          >
            {question ? (
              <Message msg={{ role: "assistant", content: `Question: ${question}` }} />
            ) : null}
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}

            {thinking && (
              <div style={{ display: "flex", gap: 5, padding: "6px 0 6px 36px" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#e040fb",
                      animation: `dot-bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(224,64,251,0.1)", background: "rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setInput("");
                    sendMessage(input);
                  }
                }}
                placeholder="Type your answer… (Enter to send)"
                rows={1}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(224,64,251,0.2)",
                  borderRadius: 14,
                  color: "#f3e5f5",
                  padding: "10px 14px",
                  fontSize: 13.5,
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                  minHeight: 42,
                }}
              />
              <button
                onClick={() => {
                  const t = input;
                  setInput("");
                  sendMessage(t);
                }}
                style={{
                  background: input.trim() ? "linear-gradient(135deg, #6a1b9a, #e040fb)" : "rgba(106,27,154,0.2)",
                  border: "1px solid rgba(224,64,251,0.3)",
                  borderRadius: 14,
                  color: "white",
                  padding: "10px 20px",
                  cursor: input.trim() ? "pointer" : "default",
                  fontSize: 13.5,
                  fontWeight: 600,
                  height: 42,
                  transition: "all 0.2s ease",
                }}
              >
                Send
              </button>
            </div>
            <p style={{ color: "#4a148c", fontSize: 11, margin: "8px 0 0", textAlign: "center" }}>
              Enter ↵ to send · Shift+Enter for new line · 🎤 for voice
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

