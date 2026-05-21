import React, { useState, useEffect } from "react";
import {
  ToggleLeft,
  ToggleRight,
  Webhook,
  Terminal,
  Clipboard,
  CheckCircle,
  Play,
  FileSpreadsheet,
  Network,
  Info,
  ExternalLink,
  ChevronRight,
  Mail,
  Zap,
  HelpCircle
} from "lucide-react";

interface ZapierSetupProps {
  onSettingsSaved: () => void;
}

export function ZapierSetup({ onSettingsSaved }: ZapierSetupProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [testPayloadStatus, setTestPayloadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testFeedback, setTestFeedback] = useState("");
  const [activeTab, setActiveTab] = useState<"zapier" | "sheets" | "api">("zapier");

  // Fetch current Webhook config
  useEffect(() => {
    fetch("/api/zapier")
      .then((res) => res.json())
      .then((data) => {
        setWebhookUrl(data.webhookUrl || "");
        setIsEnabled(!!data.isEnabled);
      })
      .catch((err) => console.error("Could not load Zapier settings:", err));
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaveMessage("");
    try {
      const response = await fetch("/api/zapier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, isEnabled }),
      });

      if (!response.ok) throw new Error("Could not update integration parameters.");
      setSaveMessage("Integration settings updated successfully!");
      onSettingsSaved();
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    }
  }

  // Trigger test payload
  async function testWebhookPipeline() {
    if (!webhookUrl) {
      alert("Please configure a Webhook URL before firing connection tests.");
      return;
    }
    setTestPayloadStatus("loading");
    setTestFeedback("");
    try {
      const payload = {
        trigger: "CONNECTION_HANDSHAKE_TEST",
        timestamp: new Date().toISOString(),
        id: "TEST-888",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString(),
        employeeId: "EMP-101",
        employeeName: "John Doe (Verification Probe)",
        department: "Assembly",
        productionQuantity: 220,
        machineUsed: "Test Platform Engine V1",
        machineIssues: false,
        issuesDetails: "",
        workingHours: 8,
        suggestions: "This is a direct API verification frame sent from Google AI Studio.",
        supervisorName: "Mark Harrison",
        employeeEmail: "john.doe@factory.com"
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Standard loose Zapier capture type
        body: JSON.stringify(payload),
        mode: "no-cors", // Standard fallback for cross-domain triggers
      });

      setTestPayloadStatus("success");
      setTestFeedback("Ping dispatched! Check your Zapier Dashboard for received Catch Webhook payloads.");
    } catch (err: any) {
      setTestPayloadStatus("error");
      setTestFeedback(`Network failure: ${err.message}. Ensure your target URL permits active CORS triggers.`);
    }
  }

  function copyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  const samplePayloadString = JSON.stringify(
    {
      id: "LOG-5512",
      date: "2026-05-21",
      time: "17:35",
      employeeId: "EMP-102",
      employeeName: "Sarah Jenkins",
      department: "Machining",
      productionQuantity: 125,
      machineUsed: "CNC Milling Station #2",
      machineIssues: true,
      issuesDetails: "Unstable fluid circulation observed near coolant ports.",
      productionDelay: true,
      delayDetails: "Calibration hold cost 20 minutes.",
      qualityIssueObserved: false,
      qualityDetails: "",
      suggestions: "Weekly motor inspections will reduce downtime.",
      workingHours: 8,
      safetyIssues: false,
      safetyDetails: "",
      materialShortage: false,
      materialDetails: "",
      supervisorName: "Mark Harrison",
      employeeEmail: "sarah.j@factory.com",
      status: "Submitted"
    },
    null,
    2
  );

  return (
    <div id="zapier-setup-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
      
      {/* LEFT COLUMN: ACTIVE INTEGRATIONS CONTROLLER */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Webhook className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h2 className="text-lg font-display font-semibold text-slate-900">Automation Settings</h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Specify your Zapier or third-party webhooks here. When validated employee logs are created on this portal, their payloads are delivered to this listener in real time.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label htmlFor="webhook-url-input" className="block font-bold text-slate-700 uppercase mb-1.5">
                Zapier Webhook Target URL
              </label>
              <input
                id="webhook-url-input"
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/12345/abcde/"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150">
              <div>
                <div className="font-bold text-slate-800">State Gateway</div>
                <div className="text-[10px] text-slate-400">Enable automated event pipelines</div>
              </div>
              <button
                id="toggle-pipeline-btn"
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className="text-slate-600 hover:text-slate-800 p-1 cursor-pointer"
              >
                {isEnabled ? (
                  <ToggleRight className="w-9 h-9 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>

            {saveMessage && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg font-semibold text-[11px]">
                {saveMessage}
              </div>
            )}

            <button
              id="save-zapier-config-btn"
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
            >
              Update Gateway Credentials
            </button>
          </form>
        </div>

        {/* WEBHOOK CONNECTION PROBING SANDBOX */}
        {webhookUrl && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <Terminal className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
              API Handshake Probe
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatch a structured test feedback payload (John Doe simulation) to verify your catch-webhook catcher listens successfully.
            </p>

            {testFeedback && (
              <div className={`p-3 rounded-lg border text-[11px] ${
                testPayloadStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {testFeedback}
              </div>
            )}

            <button
              id="test-pipeline-btn"
              onClick={testWebhookPipeline}
              disabled={testPayloadStatus === "loading"}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {testPayloadStatus === "loading" ? "Probing Connection..." : "Ping Handshake Payload"}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAILED GUIDELINES, DATABASE STRUCTURE & FLOW SCHEMATICS */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            id="tab-zapier-diagram"
            onClick={() => setActiveTab("zapier")}
            className={`px-4 py-2 font-display text-sm font-semibold border-b-2 transition ${
              activeTab === "zapier"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Zapier Flow Chart
          </button>
          <button
            id="tab-sheets-diagram"
            onClick={() => setActiveTab("sheets")}
            className={`px-4 py-2 font-display text-sm font-semibold border-b-2 transition ${
              activeTab === "sheets"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Google Sheets Database Schema
          </button>
          <button
            id="tab-api-diagram"
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 font-display text-sm font-semibold border-b-2 transition ${
              activeTab === "api"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            JSON API payload
          </button>
        </div>

        {/* CONTAINER FOR ACTIVE CONFIG TAB */}
        {activeTab === "zapier" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fade-in text-xs">
            <div>
              <h3 className="text-md font-display font-semibold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-600" />
                Centralized Process Workflow Schema
              </h3>
              <p className="text-slate-500 mt-1">Design the automation using Zapier with the following structured sequence:</p>
            </div>

            {/* Visual Steps Map using beautifully styled CSS nodes */}
            <div className="space-y-4">
              
              {/* NODE 1 */}
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-indigo-100" />
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-left">
                  <div className="font-bold text-slate-800">FACE BIOMETRICS VERIFIED</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-relaxed">
                    Employee stands before the gate camera. The gateway uploads are reviewed server-side by <strong>Gemini 3.5-flash</strong> camera verification to resolve profile matched keys.
                  </p>
                </div>
              </div>

              {/* NODE 2 */}
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-indigo-100" />
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-left">
                  <div className="font-bold text-slate-800">DOUBLE IDENTITY VALIDATION</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-relaxed">
                    System retrieves credentials. Employee enters their Badge Pin. Credentials must align with biometrically verified rosters to check in.
                  </p>
                </div>
              </div>

              {/* NODE 3 */}
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-indigo-100" />
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-left">
                  <div className="font-bold text-slate-800">DAILY SHIFT FEEDBACK RECORD</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-relaxed">
                    Once verified, custom interactive form unlocks. Employee logs shift production volume and alerts before exit checkout.
                  </p>
                </div>
              </div>

              {/* NODE 4 */}
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-indigo-100" />
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-left">
                  <div className="font-bold text-slate-800">ZAPIER CATCH WEBHOOK TRIGGER</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-relaxed">
                    Submission dispatches instant webhook logs containing raw JSON blocks to Zapier trigger listeners.
                  </p>
                </div>
              </div>

              {/* NODE 5 */}
              <div className="flex gap-4 items-start relative pb-4">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-indigo-100" />
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center shrink-0">
                  5
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 text-left">
                  <div className="font-bold text-slate-800">PERSISTENT SHEETS DATA UPDATE</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 mt-1 leading-relaxed">
                    Zapier translates webhook keys directly into a new row in Column index A-M, changing employee state from <strong>Absent</strong> to <strong>Present</strong>.
                  </p>
                </div>
              </div>

              {/* NODE 6 */}
              <div className="flex gap-4 items-start relative">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-850 text-indigo-300 font-extrabold flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-3.5 flex-1 text-left">
                  <div className="font-bold text-indigo-400 flex items-center gap-1">
                    DAILY AI REPORT & EMAIL DISPATCH
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    At shift termination, Zapier cron triggers. High-fidelity analytics summary reports are generated and automatically dispatched to predefined lead managers.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "sheets" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fade-in text-xs">
            <div>
              <h3 className="text-md font-display font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Google Sheets Structured Schema
              </h3>
              <p className="text-slate-500 mt-1">Configure your target Google Sheet columns exactly as described below to ensure faultless data insertion templates.</p>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-3">Excel Column</th>
                    <th className="p-3">Variable Key Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Description / Sample Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">A</td>
                    <td className="p-3">date</td>
                    <td className="p-3 font-bold text-indigo-800">Date</td>
                    <td className="p-3 font-sans text-slate-500">Auto timestamp date: e.g. 2026-05-21</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">B</td>
                    <td className="p-3">time</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Auto submit timestamp format: e.g. 17:35</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">C</td>
                    <td className="p-3">employeeName</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Pre-enrolled profile name: e.g. John Doe</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">D</td>
                    <td className="p-3">employeeId</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Unique corporate suffix badge code: e.g. EMP-101</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">E</td>
                    <td className="p-3">department</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Station assignments: e.g. Assembly, Machining</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">F</td>
                    <td className="p-3">productionQuantity</td>
                    <td className="p-3 font-bold text-indigo-800">Integer</td>
                    <td className="p-3 font-sans text-slate-500">Output volume: e.g. 150</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">G</td>
                    <td className="p-3">machineUsed</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Calibration station code: e.g. CNC Mill V3</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">H</td>
                    <td className="p-3">machineIssues</td>
                    <td className="p-3 font-bold text-indigo-800">Boolean</td>
                    <td className="p-3 font-sans text-slate-500">Alert triggers: TRUE / FALSE</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">I</td>
                    <td className="p-3">issuesDetails</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Mechanical issues detail comment</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">J</td>
                    <td className="p-3">suggestions</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Kaizen or general optimization suggestion</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">K</td>
                    <td className="p-3">safetyIssues</td>
                    <td className="p-3 font-bold text-indigo-800">Boolean</td>
                    <td className="p-3 font-sans text-slate-500">Safety hazard alert triggers: TRUE / FALSE</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">L</td>
                    <td className="p-3">supervisorName</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Manager review name key</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-indigo-600">M</td>
                    <td className="p-3">attendanceStatus</td>
                    <td className="p-3 font-bold text-indigo-800">String</td>
                    <td className="p-3 font-sans text-slate-500">Attendance Status, values: Present / Absent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-indigo-50 p-4 border border-indigo-150 rounded-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-indigo-900">Pro-Tip for Zapier Google Sheets actions:</span>
                <p className="text-[11px] text-indigo-800 font-sans leading-relaxed">
                  Map each column to its matching variable key. Select <strong>"Create Spreadsheet Row in Google Sheets"</strong> as your secondary step downstream in the Zapier visual creator interface.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-md font-display font-semibold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  Structured JSON Webhook Schema
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Use this raw payload schema to complete catch webhook triggers under customization maps.</p>
              </div>
              <button
                id="copy-payload-btn"
                onClick={() => copyTextToClipboard(samplePayloadString)}
                className="px-3 py-1 bg-slate-150 hover:bg-slate-200 border border-slate-250 text-slate-700 font-semibold rounded-md flex items-center gap-1 transition-all"
              >
                <Clipboard className="w-3.5 h-3.5" /> Copy Code
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
              {samplePayloadString}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
