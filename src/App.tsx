import { useState, useEffect } from "react";
import { EmployeePortal } from "./components/EmployeePortal";
import { AdminPanel } from "./components/AdminPanel";
import { ZapierSetup } from "./components/ZapierSetup";
import {
  Users,
  LayoutDashboard,
  Cpu,
  Clock,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Mail,
  Zap,
  CheckCircle,
  Building2,
  FolderLock
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  photoUrl: string;
  status: "Active" | "Inactive";
  attendance: "Present" | "Absent";
  role: string;
}

interface ProductionLog {
  id: string;
  date: string;
  time: string;
  employeeId: string;
  employeeName: string;
  department: string;
  productionQuantity: number;
  machineUsed: string;
  machineIssues: boolean;
  issuesDetails: string;
  productionDelay: boolean;
  delayDetails: string;
  qualityIssueObserved: boolean;
  qualityDetails: string;
  suggestions: string;
  workingHours: number;
  safetyIssues: boolean;
  safetyDetails: string;
  materialShortage: boolean;
  materialDetails: string;
  supervisorName: string;
  supervisorFeedback: string;
}

export default function App() {
  // Navigation State: "portal" | "admin" | "zapier"
  const [activeTab, setActiveTab] = useState<"portal" | "admin" | "zapier">("portal");

  // Global Sync States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [systemLoading, setSystemLoading] = useState(true);
  const [systemError, setSystemError] = useState("");

  const [currentTime, setCurrentTime] = useState("");

  // Periodically refresh the header clock to show actual industrial time
  useEffect(() => {
    function refreshClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    refreshClock();
    const interval = setInterval(refreshClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all databases from Server Endpoint Routing
  async function fetchSystemDB() {
    try {
      setSystemError("");
      const [empRes, logRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/logs"),
      ]);

      if (!empRes.ok || !logRes.ok) {
        throw new Error("Local database server communication failure.");
      }

      const empData = await empRes.json();
      const logData = await logRes.json();

      setEmployees(empData);
      setLogs(logData);
    } catch (err: any) {
      console.error(err);
      setSystemError(err.message || "Failed to sync factory database records.");
    } finally {
      setSystemLoading(false);
    }
  }

  // Load and sync upon startup
  useEffect(() => {
    fetchSystemDB();
  }, []);

  return (
    <div id="factory-system-app" className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased border-[8px] md:border-[12px] border-slate-900">
      
      {/* PROFESSIONAL SLATE CORPORATE RAIL HEADER */}
      <header className="bg-slate-900 border-b-4 border-emerald-500 text-white sticky top-0 z-30 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* System Logo Branding */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-emerald-500 rotate-45 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-slate-900 -rotate-44">V</span>
              </div>
              <div className="text-left">
                <h1 className="text-sm md:text-base font-bold text-white leading-none tracking-tight uppercase">
                  VANTAGE PRO <span className="text-emerald-400 font-black">TERMINAL</span>
                </h1>
                <span className="text-[9px] text-emerald-400/80 font-mono tracking-wider font-extrabold uppercase mt-1 block">
                  STATION ID: P-402 // HUB-KAIZEN
                </span>
              </div>
            </div>

            {/* Industrial clock & Lead credentials */}
            <div className="flex items-center gap-4">
              {/* Dynamic Shift Live Timeline */}
              <div className="bg-slate-850 border-2 border-slate-700 rounded-none px-3 py-1 text-right flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                <span>SHIFT TIME: {currentTime || "18:00:00"}</span>
                <span className="text-[9px] bg-emerald-500 text-slate-900 px-1 py-0.5 rounded-none font-sans font-medium">UTC</span>
              </div>

              {/* Lead Officer Indicator */}
              <div className="hidden md:flex items-center gap-2 border-l-2 border-slate-800 pl-4 text-left">
                <div className="w-8 h-8 rounded-none bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] font-extrabold text-emerald-400 font-mono shadow-inner">
                  AD
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Admin Supervisor</div>
                  <div className="text-[9px] text-slate-400">Mark Harrison</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* CORE CONTROL SHEET NAVIGATION BUTTONS BAR */}
      <div className="bg-slate-100 border-b-2 border-slate-300 text-slate-700 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <nav className="flex flex-wrap gap-2 py-1 overflow-x-auto scrollbar-none" aria-label="Tabs">
            <button
              id="nav-tab-portal"
              onClick={() => setActiveTab("portal")}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer border-2 border-slate-900 rounded-none ${
                activeTab === "portal"
                  ? "bg-emerald-500 text-slate-900 shadow-[3px_3px_0px_0px_#0f172a]"
                  : "bg-white text-slate-700 hover:bg-slate-50 shadow-[1px_1px_0px_0px_#0f172a]"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Employee Portal
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab("admin")}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer border-2 border-slate-900 rounded-none ${
                activeTab === "admin"
                  ? "bg-emerald-500 text-slate-900 shadow-[3px_3px_0px_0px_#0f172a]"
                  : "bg-white text-slate-700 hover:bg-slate-50 shadow-[1px_1px_0px_0px_#0f172a]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Operations
              {employees.length > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 border-2 border-slate-900 rounded-none shadow-[1px_1px_0px_0px_#0f172a]">
                  {employees.filter((e) => !logs.some((l) => l.employeeId === e.id && l.date === new Date().toISOString().split("T")[0])).length} Absent
                </span>
              )}
            </button>

            <button
              id="nav-tab-zapier"
              onClick={() => setActiveTab("zapier")}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer border-2 border-slate-900 rounded-none ${
                activeTab === "zapier"
                  ? "bg-emerald-500 text-slate-900 shadow-[3px_3px_0px_0px_#0f172a]"
                  : "bg-white text-slate-700 hover:bg-slate-50 shadow-[1px_1px_0px_0px_#0f172a]"
              }`}
            >
              <Zap className="w-4 h-4" />
              Zapier Automation
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 bg-white border-2 border-slate-900 px-3 py-1.5 rounded-none text-[10px] font-mono font-bold text-slate-700 shadow-[2px_2px_0px_0px_#0f172a]">
            <div className={`w-2 h-2 rounded-full ${systemError ? "bg-rose-500 animate-ping" : "bg-emerald-500 border border-slate-900"}`} />
            <span>SHEETS LEDGER CORRESPONDENCE: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* CORE MAIN CONTENT DISPLAY FRAME */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {systemLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <h3 className="text-sm font-bold text-slate-700 tracking-wide animate-pulse">Establishing central handshake channels...</h3>
            <p className="text-xs text-slate-400">Parsing employee biometric matrices and daily logs directory...</p>
          </div>
        ) : systemError ? (
          <div className="max-w-lg mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-rose-800">Connection Failed</h2>
              <p className="text-xs text-slate-500 mt-2">
                Could not establish contact with the backend. Ensure your Express dev-server has booted successfully. Full error:
              </p>
              <pre className="mt-3 p-3 bg-slate-950 text-rose-400 font-mono text-[10px] rounded-lg overflow-x-auto">
                {systemError}
              </pre>
            </div>
            <button
              id="retry-connection-action"
              onClick={fetchSystemDB}
              className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "portal" && (
              <EmployeePortal
                employees={employees}
                onFeedbackSubmitted={fetchSystemDB}
              />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                employees={employees}
                logs={logs}
                onEmployeeChange={fetchSystemDB}
              />
            )}

            {activeTab === "zapier" && (
              <ZapierSetup
                onSettingsSaved={fetchSystemDB}
              />
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono">Central Integration Ledger • 2026 Shift v4.1</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 transition cursor-pointer flex items-center gap-1">
              <FolderLock className="w-3.5 h-3.5" /> Google Sheets Backend Secure
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
