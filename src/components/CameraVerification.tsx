import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Sparkles, AlertCircle, Eye } from "lucide-react";

interface CameraVerificationProps {
  onVerified: (employeeId: string, employeeName: string) => void;
  registeredEmployees: { id: string; name: string; department: string; status: string; role: string }[];
}

export function CameraVerification({ onVerified, registeredEmployees }: CameraVerificationProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "streaming" | "processing" | "success" | "fail">("idle");
  const [verificationFeedback, setVerificationFeedback] = useState<{
    matchedId?: string;
    matchedName?: string;
    confidence?: number;
    reasoning?: string;
    message?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto start camera if available
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    setVideoError(null);
    setScanStatus("idle");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Web camera APIs are not fully supported or blocked in this browser sandbox.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setScanStatus("streaming");
    } catch (err: any) {
      console.warn("Could not start camera:", err.message);
      setVideoError("Camera access unavailable. Direct manual simulation is available below.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }

  // Action: Take snapshot and send to server
  async function captureFace() {
    if (scanStatus !== "streaming" || !videoRef.current || !canvasRef.current) return;

    setScanStatus("processing");
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Flip horizontal to look mirrored/natural
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL("image/jpeg", 0.85);

        // Fetch verification result from back-end server
        const response = await fetch("/api/verify-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Image }),
        });

        if (!response.ok) {
          throw new Error(`Authentication server returned status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.confidence > 0.7) {
          setScanStatus("success");
          setVerificationFeedback({
            matchedId: data.matchedEmployeeId,
            matchedName: data.matchedName,
            confidence: data.confidence,
            reasoning: data.reasoning,
            message: data.message,
          });
          // Wait 1.5 seconds to show visual feedback before proceeding
          setTimeout(() => {
            onVerified(data.matchedEmployeeId, data.matchedName);
          }, 1500);
        } else {
          setScanStatus("fail");
          setVerificationFeedback({
            reasoning: data.reasoning || "Face scan did not yield a confident match against active files.",
          });
        }
      }
    } catch (err: any) {
      setScanStatus("fail");
      setVerificationFeedback({
        reasoning: `Server authentication failed: ${err.message}. Please use simulation selection.`,
      });
    }
  }

  // Trigger quick manual check/bypass simulation
  function selectSimulationEmployee(empId: string) {
    const matched = registeredEmployees.find((e) => e.id === empId);
    if (!matched) return;

    setScanStatus("processing");
    setTimeout(() => {
      setScanStatus("success");
      setVerificationFeedback({
        matchedId: matched.id,
        matchedName: matched.name,
        confidence: 0.99,
        reasoning: `Manual simulation confirmed for ${matched.name} (${matched.id}) from the active database.`,
      });

      setTimeout(() => {
        onVerified(matched.id, matched.name);
      }, 1200);
    }, 600);
  }

  return (
    <div id="face-verifier-card" className="bg-white rounded-none border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 border-b-2 border-slate-900 pb-3">
        <div>
          <h2 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            Biometric Gate: Face Recognition
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Face scanned & compared with Google Sheet verified portraits.
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-slate-900 text-emerald-400 border border-slate-900 rounded-none shadow-[2px_2px_0px_0px_#0f172a] uppercase font-mono shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Scanner Active
        </span>
      </div>

      {/* Main Camera Sandbox Screen Area */}
      <div className="relative aspect-video rounded-none bg-slate-950 overflow-hidden border-4 border-slate-900 flex flex-col items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_#0f172a]">
        
        {/* Viewfinder Corner Overlays */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-emerald-500 pointer-events-none z-10" />
        <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-emerald-500 pointer-events-none z-10" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-emerald-500 pointer-events-none z-10" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-emerald-500 pointer-events-none z-10" />

        {/* Dynamic targeting silhouette overlay inside camera framing */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-48 h-60 border-2 border-emerald-500/30 rounded-full flex flex-col items-center justify-center">
            <div className="w-full h-[1px] bg-emerald-500/20 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* Hidden internal snapshot canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {scanStatus === "streaming" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* Dynamic Scan Laser Overlay in video */}
        {scanStatus === "streaming" && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)] scanner-laser z-10" />
        )}

        {/* Video Overlays based on scan status */}
        {scanStatus === "idle" && !videoError && (
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-none bg-slate-900 border-2 border-slate-705 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-mono text-slate-300">Setting up biometric camera sensor...</p>
          </div>
        )}

        {videoError && scanStatus === "idle" && (
          <div className="text-center p-6 bg-slate-900/40 w-full h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-none bg-rose-900/40 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-rose-300 mb-1 uppercase tracking-wider font-mono">Webcam Stream Blocked</p>
            <p className="text-[11px] text-slate-400 max-w-sm mb-4 font-mono">
              Camera permission is required, or your container iframe does not support it. Please use the simulator below.
            </p>
            <button
              id="retry-camera-btn"
              onClick={startCamera}
              className="px-4 py-2 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Camera Sensor
            </button>
          </div>
        )}

        {scanStatus === "processing" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 rounded-none border-4 border-emerald-400 border-t-transparent animate-spin mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 animate-pulse">Vision Biometric Core Active</p>
            <p className="text-[10px] text-slate-450 mt-1 font-mono">Comparing facial coordinates with sheets catalog...</p>
          </div>
        )}

        {scanStatus === "success" && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-center px-4">
            <div className="w-14 h-14 rounded-none bg-emerald-500 text-slate-900 flex items-center justify-center mb-4 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-white uppercase tracking-wider">Face Verified</h3>
            <p className="text-emerald-300 text-sm mt-1">Welcome, {verificationFeedback?.matchedName}</p>
            <p className="text-slate-405 text-[10px] mt-2 font-mono uppercase">
              Confidence Coefficient: {(verificationFeedback?.confidence || 0.99 * 100).toFixed(1)}% | {verificationFeedback?.matchedId}
            </p>
          </div>
        )}

        {scanStatus === "fail" && (
          <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-center px-6">
            <div className="w-12 h-12 rounded-none bg-rose-500 text-slate-900 flex items-center justify-center mb-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Verification Failure</h3>
            <p className="text-rose-300 text-[11px] mt-1 max-w-md font-mono">
              {verificationFeedback?.reasoning || "Could not reconcile scanned physical features with active sheets roster."}
            </p>
            <div className="flex gap-2.5 mt-4">
              <button
                id="retry-scan-btn"
                onClick={startCamera}
                className="px-3.5 py-1.5 border-2 border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_#0f172a]"
              >
                Scan Again
              </button>
              <button
                id="bypass-sim-btn"
                onClick={() => selectSimulationEmployee("EMP-101")}
                className="px-3.5 py-1.5 border-2 border-slate-900 bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-900 uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_#0f172a]"
              >
                Bypass Scan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-4">
        {scanStatus === "streaming" && (
          <button
            id="snap-face-action-btn"
            onClick={captureFace}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer text-xs"
          >
            <Camera className="w-5 h-5" />
            Analyze Visual Capture Key
          </button>
        )}

        {/* SIMULATION WORKBENCH FOR SEAMLESS DEMONSTATIONS */}
        <div className="bg-slate-100 border-2 border-slate-900 rounded-none p-4 mt-2 shadow-[4px_4px_0px_0px_#0f172a]">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wider text-xs mb-3">
            <Eye className="w-4 h-4 text-emerald-600" />
            Simulation Workbench (Direct Roster Select)
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed font-mono">
            Click any active roster profile to simulate a facial recognition match. This guarantees error-free demonstrations if web camera blockages occur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {registeredEmployees.map((emp) => (
              <button
                key={emp.id}
                id={`simulate-emp-${emp.id}`}
                onClick={() => selectSimulationEmployee(emp.id)}
                disabled={emp.status !== "Active" || scanStatus === "processing"}
                className={`p-2.5 rounded-none border-2 text-left transition-all flex flex-col gap-1 items-start cursor-pointer ${
                  emp.status === "Active"
                    ? "bg-white hover:bg-emerald-50 hover:border-slate-900 border-slate-350 shadow-[1px_1px_0px_0px_#0f172a]"
                    : "bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold text-slate-700">{emp.id}</span>
                  <span className={`w-2 h-2 rounded-full border border-slate-900 ${emp.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                </div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-tight line-clamp-1">{emp.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate w-full">{emp.department} • {emp.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
