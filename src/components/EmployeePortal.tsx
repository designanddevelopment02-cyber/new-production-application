import React, { useState } from "react";
import { CameraVerification } from "./CameraVerification";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  Check,
  Building2,
  Lock,
  ArrowRight,
  ClipboardList,
  Cpu,
  Mail,
  Zap,
  Info
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  status: "Active" | "Inactive";
  role: string;
}

interface EmployeePortalProps {
  employees: Employee[];
  onFeedbackSubmitted: () => void;
}

export function EmployeePortal({ employees, onFeedbackSubmitted }: EmployeePortalProps) {
  // Navigation: "biometric" | "id_verify" | "form" | "submitted"
  const [step, setStep] = useState<"biometric" | "id_verify" | "form" | "submitted">("biometric");

  const [verifiedEmployeeId, setVerifiedEmployeeId] = useState<string>("");
  const [verifiedName, setVerifiedName] = useState<string>("");
  const [inputEmployeeId, setInputEmployeeId] = useState("");
  const [idError, setIdError] = useState("");

  // Form State
  const [productionQuantity, setProductionQuantity] = useState<number | "">("");
  const [machineUsed, setMachineUsed] = useState("");
  const [machineIssues, setMachineIssues] = useState(false);
  const [issuesDetails, setIssuesDetails] = useState("");
  const [productionDelay, setProductionDelay] = useState(false);
  const [delayDetails, setDelayDetails] = useState("");
  const [qualityIssueObserved, setQualityIssueObserved] = useState(false);
  const [qualityDetails, setQualityDetails] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [workingHours, setWorkingHours] = useState<number>(8);
  const [safetyIssues, setSafetyIssues] = useState(false);
  const [safetyDetails, setSafetyDetails] = useState("");
  const [materialShortage, setMaterialShortage] = useState(false);
  const [materialDetails, setMaterialDetails] = useState("");
  const [supervisorName, setSupervisorName] = useState("Mark Harrison");
  const [supervisorFeedback, setSupervisorFeedback] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    logId: string;
    date: string;
    time: string;
    zapierTriggered: boolean;
    zapierStatus?: number | null;
    zapierError?: string | null;
  } | null>(null);

  const [formError, setFormError] = useState("");

  // Handler for successful face recognition match
  function handleBiometricVerified(empId: string, empName: string) {
    setVerifiedEmployeeId(empId);
    setVerifiedName(empName);
    setInputEmployeeId("");
    setStep("id_verify");
  }

  // Handler for double check ID matching
  function handleVerifyId(e: React.FormEvent) {
    e.preventDefault();
    setIdError("");

    if (!inputEmployeeId.trim()) {
      setIdError("Employee ID cannot be empty.");
      return;
    }

    const cleanedInput = inputEmployeeId.trim().toUpperCase();

    if (cleanedInput !== verifiedEmployeeId) {
      setIdError(`Mismatched Credentials! Input ID does not belong to the biometrically-verified user (${verifiedName}). Please crosscheck.`);
      return;
    }

    // Move to feedback form stage
    setStep("form");
  }

  // Submit Feedback Handler
  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!productionQuantity || Number(productionQuantity) <= 0) {
      setFormError("Please enter a valid production quantity.");
      return;
    }

    if (!machineUsed.trim()) {
      setFormError("Please specify the machinery or tool module used.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        employeeId: verifiedEmployeeId,
        productionQuantity: Number(productionQuantity),
        machineUsed: machineUsed.trim(),
        machineIssues,
        issuesDetails: machineIssues ? issuesDetails.trim() : "",
        productionDelay,
        delayDetails: productionDelay ? delayDetails.trim() : "",
        qualityIssueObserved,
        qualityDetails: qualityIssueObserved ? qualityDetails.trim() : "",
        suggestions: suggestions.trim(),
        workingHours,
        safetyIssues,
        safetyDetails: safetyIssues ? safetyDetails.trim() : "",
        materialShortage,
        materialDetails: materialShortage ? materialDetails.trim() : "",
        supervisorName,
        supervisorFeedback: supervisorFeedback.trim(),
      };

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Form submission rejected.");
      }

      const outcome = await res.json();

      setSubmissionReceipt({
        logId: outcome.log.id,
        date: outcome.log.date,
        time: outcome.log.time,
        zapierTriggered: outcome.zapier.sent,
        zapierStatus: outcome.zapier.responseStatus,
        zapierError: outcome.zapier.error,
      });

      // Reset form variables
      setProductionQuantity("");
      setMachineUsed("");
      setMachineIssues(false);
      setIssuesDetails("");
      setProductionDelay(false);
      setDelayDetails("");
      setQualityIssueObserved(false);
      setQualityDetails("");
      setSuggestions("");
      setWorkingHours(8);
      setSafetyIssues(false);
      setSafetyDetails("");
      setMaterialShortage(false);
      setMaterialDetails("");
      setSupervisorFeedback("");

      setStep("submitted");
      onFeedbackSubmitted(); // Fetch updated employees / reports on parent dashboard
    } catch (err: any) {
      setFormError(err.message || "Could not push records to sheets.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeEmployee = employees.find((e) => e.id === verifiedEmployeeId);

  return (
    <div id="employee-portal-root" className="max-w-4xl mx-auto py-4">
      
      {/* Dynamic Workflow Progress Header */}
      <div className="flex justify-around items-center mb-8 border-4 border-slate-900 bg-slate-100 p-4 rounded-none shadow-[4px_4px_0px_0px_#0f172a]">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-none border-2 border-slate-900 flex items-center justify-center text-xs font-black leading-none ${
            step === "biometric" ? "bg-slate-900 text-emerald-450 text-white" : "bg-emerald-500 text-slate-900"
          }`}>
            {step !== "biometric" ? <Check className="w-4.5 h-4.5 text-slate-900" /> : "1"}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wide ${step === "biometric" ? "text-slate-950" : "text-slate-500"}`}>
            Biometrics Scan
          </span>
        </div>
        <div className="w-10 h-1 bg-slate-900" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-none border-2 border-slate-900 flex items-center justify-center text-xs font-black leading-none ${
            step === "id_verify" ? "bg-slate-900 text-white" :
            step === "biometric" ? "bg-white text-slate-400" :
            "bg-emerald-500 text-slate-900"
          }`}>
            {step === "form" || step === "submitted" ? <Check className="w-4.5 h-4.5 text-slate-900" /> : "2"}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wide ${step === "id_verify" ? "text-slate-950" : "text-slate-500"}`}>
            ID Lock
          </span>
        </div>
        <div className="w-10 h-1 bg-slate-900" />
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-none border-2 border-slate-900 flex items-center justify-center text-xs font-black leading-none ${
            step === "form" ? "bg-slate-900 text-white" :
            step === "submitted" ? "bg-emerald-500 text-slate-900" :
            "bg-white text-slate-400"
          }`}>
            {step === "submitted" ? <Check className="w-4.5 h-4.5 text-slate-900" /> : "3"}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wide ${step === "form" ? "text-slate-950" : "text-slate-500"}`}>
            Production Form
          </span>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-slate-900 text-rose-900 text-xs font-bold uppercase tracking-tight rounded-none flex items-start gap-2.5 shadow-[3px_3px_0px_0px_#0f172a]">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Execution Warning:</span> {formError}
          </div>
        </div>
      )}

      {/* STAGE 1: CAMERAS BIOMETRIC FACE RECOGNITION */}
      {step === "biometric" && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Daily Shift Log-In</h1>
            <p className="text-xs text-slate-600 mt-2 font-mono">
              Welcome to the shop-floor terminal. Please position your face before the biometric sensor gate to authenticate your active digital record.
            </p>
          </div>
          <CameraVerification
            onVerified={handleBiometricVerified}
            registeredEmployees={employees}
          />
        </div>
      )}

      {/* STAGE 2: EMPLOYEE ID CROSS- VERIFICATION */}
      {step === "id_verify" && (
        <div className="max-w-md mx-auto bg-white rounded-none border-4 border-slate-900 p-6 shadow-[6px_6px_0px_0px_#0f172a] animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-none bg-emerald-500 text-slate-900 flex items-center justify-center mx-auto mb-4 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">Double Identity Security</h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Biometrics matched successfully. Please insert your Employee ID to unlock reporting access.
            </p>
          </div>

          <div className="p-3 bg-emerald-5 border-2 border-slate-900 rounded-none mb-6 flex items-center gap-3 shadow-[2px_2px_0px_0px_#0f172a]">
            <div className="w-10 h-10 rounded-none bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs border border-slate-900">
              {verifiedEmployeeId.replace("EMP-", "")}
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase font-bold font-mono">Linked Profile</div>
              <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{verifiedName}</div>
            </div>
          </div>

          <form onSubmit={handleVerifyId} className="space-y-4">
            <div>
              <label htmlFor="verify-id-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                Verify Employee ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-900 font-mono text-sm leading-none font-black">
                  EMP-
                </span>
                <input
                  id="verify-id-input"
                  type="text"
                  required
                  placeholder="101"
                  value={inputEmployeeId.replace("EMP-", "")}
                  onChange={(e) => setInputEmployeeId(e.target.value)}
                  className="w-full pl-14 pr-4 py-2.5 rounded-none border-2 border-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold placeholder-slate-300 bg-white text-slate-900 shadow-[2px_2px_0px_0px_#0f172a]"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-2 leading-relaxed">
                The numeric suffix of your badge number. For illustration, enter <strong>101</strong> for John Doe.
              </p>
            </div>

            {idError && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-250 text-rose-905 rounded-none text-xs flex gap-2 font-mono">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{idError}</span>
              </div>
            )}

            <button
              id="id-unlock-btn"
              type="submit"
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 text-slate-900 rounded-none font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer text-xs"
            >
              Verify Badge Identity
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cancel-biometric-btn"
              type="button"
              onClick={() => setStep("biometric")}
              className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back to Biometric Capture
            </button>
          </form>
        </div>
      )}

      {/* STAGE 3: INTERACTIVE DAILY FEEDBACK FORM */}
      {step === "form" && activeEmployee && (
        <div className="bg-white rounded-none border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] overflow-hidden animate-fade-in">
          {/* Form Header info */}
          <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-emerald-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-none bg-emerald-500 text-slate-900 flex items-center justify-center border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-md md:text-lg font-bold uppercase tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                  Reporting Session: <span className="font-black text-emerald-400">{verifiedName}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-350 mt-1.5 font-mono uppercase">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-emerald-400 font-bold">{verifiedEmployeeId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-405" /> {activeEmployee.department}</span>
                  <span>•</span>
                  <span>{activeEmployee.role}</span>
                </div>
              </div>
            </div>
            <button
              id="exit-session-btn"
              type="button"
              onClick={() => {
                setStep("biometric");
                setVerifiedEmployeeId("");
                setVerifiedName("");
              }}
              className="text-xs uppercase font-bold tracking-wider bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-none border-2 border-slate-705 transition cursor-pointer"
            >
              Exit Badge Gate
            </button>
          </div>

          {/* Form Itself */}
          <form onSubmit={handleSubmitFeedback} className="p-6 md:p-8 space-y-6">
            
            {/* Meta data reminder */}
            <div className="bg-emerald-50 border-2 border-slate-900 rounded-none p-4 text-slate-900 text-xs flex gap-2.5 leading-relaxed shadow-[3px_3px_0px_0px_#0f172a]">
              <Info className="w-4.5 h-4.5 text-slate-900 shrink-0 mt-0.5" />
              <p className="font-mono">
                <strong>Sheets Database Sync Session:</strong> Form submission will create a persistent entry in the company database, dynamically calculate physical labor shifts, and activate Google Workspace report summarizers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b-2 border-slate-900">
              {/* Production Quantity */}
              <div>
                <label htmlFor="prod-qty-input" className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono">
                  Production Completion Quantity <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="prod-qty-input"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={productionQuantity}
                    onChange={(e) => setProductionQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-none border-2 border-slate-900 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 bg-white shadow-[2px_2px_0px_0px_#0f172a]"
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs font-mono font-black uppercase text-slate-500">units</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Total finished physical goods submitted downstream.</p>
              </div>

              {/* Machinery Used */}
              <div>
                <label htmlFor="machine-used-input" className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono">
                  Station / Machinery Used <span className="text-rose-600">*</span>
                </label>
                <input
                  id="machine-used-input"
                  type="text"
                  required
                  placeholder="e.g. CNC Milling Block #2"
                  value={machineUsed}
                  onChange={(e) => setMachineUsed(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none border-2 border-slate-900 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 bg-white shadow-[2px_2px_0px_0px_#0f172a]"
                />
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Specific machine catalog, booth number, or line ID used.</p>
              </div>
            </div>

            {/* Checkbox Warnings */}
            <div className="space-y-4 pb-6 border-b-2 border-slate-900">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Cpu className="w-4.5 h-4.5 text-slate-900" />
                Operational Warnings & Logistics Interruptions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Machine Issue Card */}
                <div className={`p-4 rounded-none border-2 border-slate-900 transition-all shadow-[3px_3px_0px_0px_#0f172a] ${
                  machineIssues ? "bg-amber-100" : "bg-white"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="machine-issues-chk"
                      type="checkbox"
                      checked={machineIssues}
                      onChange={(e) => setMachineIssues(e.target.checked)}
                      className="mt-1 w-5 h-5 text-slate-905 rounded-none border-2 border-slate-900 focus:ring-0 focus:outline-none accent-slate-900"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-tight text-slate-905">Machine Issue Observed</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Vibration alerts, coolant drop, thermal triggers.</div>
                    </div>
                  </label>
                  {machineIssues && (
                    <div className="mt-3">
                      <textarea
                        id="machine-issues-details"
                        required
                        placeholder="Detail mechanical symptoms, heat spikes, error labels or noise spikes..."
                        value={issuesDetails}
                        onChange={(e) => setIssuesDetails(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-none border-2 border-slate-905 bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono shadow-inner"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                {/* Delay Incident Card */}
                <div className={`p-4 rounded-none border-2 border-slate-900 transition-all shadow-[3px_3px_0px_0px_#0f172a] ${
                  productionDelay ? "bg-amber-100" : "bg-white"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="delay-issue-chk"
                      type="checkbox"
                      checked={productionDelay}
                      onChange={(e) => setProductionDelay(e.target.checked)}
                      className="mt-1 w-5 h-5 text-slate-905 rounded-none border-2 border-slate-900 focus:ring-0 focus:outline-none accent-slate-900"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-tight text-slate-905">Production Delay Occurred</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Tool stoppage, core bottlenecks, recalibrations.</div>
                    </div>
                  </label>
                  {productionDelay && (
                    <div className="mt-3">
                      <textarea
                        id="delay-details"
                        required
                        placeholder="Estimate delay time and specify root cause of stoppage..."
                        value={delayDetails}
                        onChange={(e) => setDelayDetails(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-none border-2 border-slate-905 bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono shadow-inner"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                {/* Quality Issue Card */}
                <div className={`p-4 rounded-none border-2 border-slate-900 transition-all shadow-[3px_3px_0px_0px_#0f172a] ${
                  qualityIssueObserved ? "bg-amber-100" : "bg-white"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="quality-issue-chk"
                      type="checkbox"
                      checked={qualityIssueObserved}
                      onChange={(e) => setQualityIssueObserved(e.target.checked)}
                      className="mt-1 w-5 h-5 text-slate-905 rounded-none border-2 border-slate-900 focus:ring-0 focus:outline-none accent-slate-900"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-tight text-slate-905">Quality Deficiency Observed</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Surface defects, warp tolerances, dimension drift.</div>
                    </div>
                  </label>
                  {qualityIssueObserved && (
                    <div className="mt-3">
                      <textarea
                        id="quality-details"
                        required
                        placeholder="Outline deviation values, unit batches containing defect patterns..."
                        value={qualityDetails}
                        onChange={(e) => setQualityDetails(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-none border-2 border-slate-905 bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono shadow-inner"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                {/* Safety Hazmat Alerts Card */}
                <div className={`p-4 rounded-none border-2 border-slate-900 transition-all shadow-[3px_3px_0px_0px_#0f172a] ${
                  safetyIssues ? "bg-rose-100" : "bg-white"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="safety-issues-chk"
                      type="checkbox"
                      checked={safetyIssues}
                      onChange={(e) => setSafetyIssues(e.target.checked)}
                      className="mt-1 w-5 h-5 text-slate-905 rounded-none border-2 border-slate-900 focus:ring-0 focus:outline-none accent-slate-900"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-tight text-rose-950">Safety Concern Observed</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Spillages on pathways, loose piping, shield bypass.</div>
                    </div>
                  </label>
                  {safetyIssues && (
                    <div className="mt-3">
                      <textarea
                        id="safety-details"
                        required
                        placeholder="Explain hazard location, warning flags deployed..."
                        value={safetyDetails}
                        onChange={(e) => setSafetyDetails(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-none border-2 border-rose-905 bg-white focus:outline-none focus:border-rose-400 text-slate-900 font-mono shadow-inner"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                {/* Raw Material Deficiency Card */}
                <div className={`p-4 rounded-none border-2 border-slate-900 transition-all shadow-[3px_3px_0px_0px_#0f172a] ${
                  materialShortage ? "bg-amber-100" : "bg-white"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="material-shortage-chk"
                      type="checkbox"
                      checked={materialShortage}
                      onChange={(e) => setMaterialShortage(e.target.checked)}
                      className="mt-1 w-5 h-5 text-slate-905 rounded-none border-2 border-slate-900 focus:ring-0 focus:outline-none accent-slate-900"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-tight text-slate-905">Raw Material Deficiency</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Billets, raw plastic, packaging cartons low.</div>
                    </div>
                  </label>
                  {materialShortage && (
                    <div className="mt-3">
                      <textarea
                        id="material-details"
                        required
                        placeholder="Specify material types and length of delay..."
                        value={materialDetails}
                        onChange={(e) => setMaterialDetails(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-none border-2 border-slate-905 bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono shadow-inner"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Shift working hour and Supervisor Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b-2 border-slate-900">
              {/* Working Hours completed */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono" htmlFor="working-hours-select">
                  Shift Labor Hours Completed <span className="text-rose-600">*</span>
                </label>
                <select
                  id="working-hours-select"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-none border-2 border-slate-900 text-slate-900 font-bold bg-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_0px_#0f172a]"
                >
                  <option value={4}>4 Hours (Half Shift)</option>
                  <option value={8}>8 Hours (Standard Shift)</option>
                  <option value={10}>10 Hours (Extended Shift)</option>
                  <option value={12}>12 Hours (Overtime Double-Shift)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Specific billing hours registered for corporate audit sheets.</p>
              </div>

              {/* Assignment Supervisor */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono" htmlFor="supervisor-name-select">
                  Reporting Supervisor Lead <span className="text-rose-600">*</span>
                </label>
                <select
                  id="supervisor-name-select"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none border-2 border-slate-900 text-slate-900 font-bold bg-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_0px_#0f172a]"
                >
                  <option value="Mark Harrison">Mark Harrison (Assembly Manager)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (CNC Line Director)</option>
                  <option value="David Kojo">David Kojo (Lead Automation Inspector)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Authorized manager confirming physical inventory receipt files.</p>
              </div>
            </div>

            {/* Continuous Improvement & Comments */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono" htmlFor="improvement-suggest">
                  Process Improvement Suggestions (Kaizen)
                </label>
                <textarea
                  id="improvement-suggest"
                  placeholder="How can we make this process safer, faster, or higher quality? Share suggestions for line improvement..."
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="w-full p-4 rounded-none border-2 border-slate-900 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm font-semibold shadow-[2px_2px_0px_0px_#0f172a]"
                  rows={3}
                />
                <p className="text-[10px] text-slate-500 mt-2 font-mono">
                  Suggestions are aggregated daily by Gemini AI to automate smart shopfloor modernization trends.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 font-mono" htmlFor="supervisor-comments">
                  Supervisor Additional Notes / Direct Comments
                </label>
                <input
                  id="supervisor-comments"
                  type="text"
                  placeholder="Any outstanding directives or remarks..."
                  value={supervisorFeedback}
                  onChange={(e) => setSupervisorFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none border-2 border-slate-900 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm font-semibold shadow-[2px_2px_0px_0px_#0f172a]"
                />
              </div>
            </div>

            {/* Actions list */}
            <div className="pt-6 border-t-2 border-slate-900 flex items-center justify-between gap-4">
              <button
                id="reset-form-btn"
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clean today's progress parameters?")) {
                    setStep("biometric");
                    setVerifiedEmployeeId("");
                    setVerifiedName("");
                  }
                }}
                className="px-5 py-2.5 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 rounded-none font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#0f172a] transition cursor-pointer text-xs"
              >
                Reset Verification
              </button>

              <button
                id="submit-feedback-btn"
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 text-slate-900 rounded-none font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer text-xs ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4.5 h-4.5 rounded-none border-2 border-slate-900 border-t-transparent animate-spin" />
                    Storing Log & Webhooks...
                  </>
                ) : (
                  <>
                    <FileText className="w-4.5 h-4.5" />
                    Submit Production Log
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 4: SUBMISSION CONFIRMATION PAGE & WEBHOOK RESPONSE DISPLAY */}
      {step === "submitted" && submissionReceipt && (
        <div className="max-w-xl mx-auto bg-white rounded-none border-4 border-slate-900 p-8 shadow-[6px_6px_0px_0px_#0f172a] text-center animate-fade-in">
          <div className="w-16 h-16 rounded-none bg-emerald-500 text-slate-900 border-2 border-slate-900 flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_0px_#0f172a]">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight leading-tight">Response Submitted</h2>
          <p className="text-slate-600 text-xs mt-2 max-w-sm mx-auto font-mono">
            Your daily shift report and feedback answers have been stored successfully in the central database ledger.
          </p>

          <div className="bg-slate-100 rounded-none p-5 border-2 border-slate-900 my-6 text-left space-y-3 font-mono text-xs shadow-[4px_4px_0px_0px_#0f172a]">
            <div className="flex justify-between items-center border-b border-slate-355 pb-1.5Packed font-mono">
              <span className="text-slate-500">Ledger Index ID</span>
              <span className="font-bold text-slate-900">{submissionReceipt.logId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-355 pb-1.5 font-mono">
              <span className="text-slate-500">Date Logged</span>
              <span className="font-semibold text-slate-900">{submissionReceipt.date}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-355 pb-1.5 font-mono">
              <span className="text-slate-500">Timestamp</span>
              <span className="font-semibold text-slate-905">{submissionReceipt.time}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-355 pb-1.5 font-mono animate-pulse">
              <span className="text-slate-500">Attendance Lock</span>
              <span className="font-bold text-emerald-600 flex items-center gap-0.5 uppercase">
                <Check className="w-3.5 h-3.5" /> Present
              </span>
            </div>
            
            {/* Zapier Live Webhook transmission logs */}
            <div>
              <div className="text-slate-900 text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3 text-slate-900 fill-amber-400" />
                Zapier Automation Webhook Pipe:
              </div>
              {submissionReceipt.zapierTriggered ? (
                <div className={`p-3 border-2 border-slate-900 text-[11px] rounded-none bg-white font-mono`}>
                  <div className="font-bold flex items-center gap-1.5 uppercase text-slate-900">
                    {submissionReceipt.zapierStatus === 200 || submissionReceipt.zapierStatus === 201 ? (
                      <span className="w-2.5 h-2.5 bg-emerald-500 border border-slate-900 inline-block" />
                    ) : (
                      <span className="w-2.5 h-2.5 bg-rose-500 border border-slate-900 inline-block animate-ping" />
                    )}
                    Status {submissionReceipt.zapierStatus || "Dispatched"}
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-700">
                    {submissionReceipt.zapierError
                      ? `Connection pipeline warning: ${submissionReceipt.zapierError}. Check Zapier endpoint listener settings.`
                      : "The daily transaction payload was delivered to Zapier API endpoints. Google Sheets database is in-sync."}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-none border border-slate-300 text-slate-500 text-[10px] font-mono leading-relaxed">
                  Zapier webhook pipeline was skipped today (Inactive or URL unspecified in integrations settings).
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              id="new-sign-in-btn"
              onClick={() => {
                setStep("biometric");
                setVerifiedEmployeeId("");
                setVerifiedName("");
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-900 text-slate-900 font-extrabold uppercase tracking-wider rounded-none transition shadow-[4px_4px_0px_0px_#0f172a] cursor-pointer text-xs"
            >
              Sign In Another Employee
            </button>

            <p className="text-[10px] text-slate-550 font-mono">
              Shift manager: Mark Harrison • Shopfloor Station #4 Terminal
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
