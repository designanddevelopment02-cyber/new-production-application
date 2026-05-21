import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  AlertOctagon,
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Brain,
  TrendingUp,
  X,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Check,
  Building2,
  Mail,
  Activity,
  UserCheck,
  Info
} from "lucide-react";
import { AIReportSummary } from "../types";

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

interface AdminPanelProps {
  employees: Employee[];
  logs: ProductionLog[];
  onEmployeeChange: () => void;
}

export function AdminPanel({ employees, logs, onEmployeeChange }: AdminPanelProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Search/Filters
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  const [logSearch, setLogSearch] = useState("");
  const [selectedLogDept, setSelectedLogDept] = useState("All");

  // CRUD Employee Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState("");
  const [empDept, setEmpDept] = useState("Assembly");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empStatus, setEmpStatus] = useState<"Active" | "Inactive">("Active");
  const [empPhoto, setEmpPhoto] = useState("default_profile");
  const [crudError, setCrudError] = useState("");

  // AI Gemini Insights State
  const [aiReport, setAiReport] = useState<AIReportSummary | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const departments = ["Assembly", "Machining", "Quality Control", "Packaging", "Maintenance"];

  // Run AI production sweep
  async function generateAiAudit() {
    setIsAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/analyze-production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });

      if (!response.ok) {
        throw new Error(`Audit server failed: ${response.status}`);
      }

      const outcome = await response.json();
      setAiReport(outcome);
    } catch (err: any) {
      setAiError(err.message || "Could not retrieve Gemini insights.");
    } finally {
      setIsAiLoading(false);
    }
  }

  // Auto trigger AI evaluation on date shift or initial load
  useEffect(() => {
    generateAiAudit();
  }, [selectedDate, logs]);

  // Handle Create or Update Employee
  async function submitEmployeeForm(e: React.FormEvent) {
    e.preventDefault();
    setCrudError("");

    if (!empName.trim() || !empEmail.trim() || !empRole.trim()) {
      setCrudError("Please fill out all required parameters.");
      return;
    }

    const payload = {
      name: empName.trim(),
      department: empDept,
      email: empEmail.trim(),
      role: empRole.trim(),
      status: empStatus,
      photoUrl: empPhoto,
    };

    try {
      let response;
      if (editingEmployee) {
        // Update
        response = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error("Directory server rejected transaction.");
      }

      // Refresh data
      onEmployeeChange();
      setIsEmployeeModalOpen(false);
      resetEmployeeForm();
    } catch (err: any) {
      setCrudError(err.message || "Failed to sync directory logs.");
    }
  }

  function startEditEmployee(emp: Employee) {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpDept(emp.department);
    setEmpEmail(emp.email);
    setEmpRole(emp.role);
    setEmpStatus(emp.status);
    setEmpPhoto(emp.photoUrl);
    setCrudError("");
    setIsEmployeeModalOpen(true);
  }

  async function deleteEmployee(id: string) {
    if (window.confirm(`Are you sure you want to delete employee ID ${id} from your Google Sheet roster? This is irreversible.`)) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Could not delete record from directory.");
        onEmployeeChange();
      } catch (err: any) {
        alert(err.message);
      }
    }
  }

  function resetEmployeeForm() {
    setEditingEmployee(null);
    setEmpName("");
    setEmpDept("Assembly");
    setEmpEmail("");
    setEmpRole("");
    setEmpStatus("Active");
    setEmpPhoto("default_profile");
    setCrudError("");
  }

  // Handle Photo uploading simulation
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Filter local logs based on active selected criteria
  const filteredLogs = logs.filter((log) => {
    const matchesDate = log.date === selectedDate;
    const matchesDept = selectedLogDept === "All" || log.department === selectedLogDept;
    const matchesQuery =
      log.employeeName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.suggestions.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.issuesDetails.toLowerCase().includes(logSearch.toLowerCase());

    return matchesDate && matchesDept && matchesQuery;
  });

  // Filter employee database index
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDeptFilter === "All" || emp.department === selectedDeptFilter;
    const matchesQuery =
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(employeeSearch.toLowerCase());

    return matchesDept && matchesQuery;
  });

  // Derived variables for daily metrics
  const logsOfToday = logs.filter((l) => l.date === selectedDate);
  const presentEmployeesCount = logsOfToday.length;
  const absentEmployeesCount = employees.length - presentEmployeesCount;
  const grandProductionSum = logsOfToday.reduce((acc, log) => acc + log.productionQuantity, 0);
  const issuesFoundToday = logsOfToday.filter((l) => l.machineIssues || l.safetyIssues || l.materialShortage).length;

  // Department-wise quota analysis calculations for chart
  const departmentStats = departments.map((dept) => {
    const deptLogs = logsOfToday.filter((l) => l.department === dept);
    const amount = deptLogs.reduce((acc, l) => acc + l.productionQuantity, 0);
    return { name: dept, total: amount, count: deptLogs.length };
  });

  // Excel CSV exporter function
  function exportToCSV() {
    if (filteredLogs.length === 0) {
      alert("No logs available for selected parameters to export.");
      return;
    }

    const headers = [
      "Record ID",
      "Date",
      "Time",
      "Employee ID",
      "Employee Name",
      "Department",
      "Production Qty",
      "Machine Used",
      "Mechanical Issues",
      "Issue Details",
      "Delay Triggered",
      "Delay Details",
      "Defects Observed",
      "Defect Details",
      "Continuous Improvement Ideas",
      "Safety Alert Triggers",
      "Safety Details",
      "Supervisor Name",
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      log.date,
      log.time,
      log.employeeId,
      `"${log.employeeName.replace(/"/g, '""')}"`,
      log.department,
      log.productionQuantity,
      `"${log.machineUsed.replace(/"/g, '""')}"`,
      log.machineIssues ? "YES" : "NO",
      `"${log.issuesDetails.replace(/"/g, '""')}"`,
      log.productionDelay ? "YES" : "NO",
      `"${log.delayDetails.replace(/"/g, '""')}"`,
      log.qualityIssueObserved ? "YES" : "NO",
      `"${log.qualityDetails.replace(/"/g, '""')}"`,
      `"${log.suggestions.replace(/"/g, '""')}"`,
      log.safetyIssues ? "YES" : "NO",
      `"${log.safetyDetails.replace(/"/g, '""')}"`,
      `"${log.supervisorName.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shopfloor_Log_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div id="admin-panel-root" className="space-y-8 animate-fade-in text-left">
      
      {/* Date Controls & Title Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Admin Operations Deck</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feedback archives, employee credential indices, and automated Gemini AI reports.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xs">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Target Shift:</span>
          <input
            id="target-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-mono font-bold text-indigo-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Primary KPI Dash Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Present workers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Present Staff</span>
            <div className="text-3xl font-display font-black text-indigo-600 mt-1">{presentEmployeesCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Shift attendance logged today</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Absentee tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Absent Staff</span>
            <div className="text-3xl font-display font-black text-rose-500 mt-1">{absentEmployeesCount}</div>
            <div className="text-[10px] text-slate-500 mt-1">Pending feedback sheets</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Quota */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Shift Production</span>
            <div className="text-3xl font-display font-black text-indigo-900 mt-1">{grandProductionSum}</div>
            <div className="text-[10px] text-slate-500 mt-1">Total accumulated unit count</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Issues and alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Friction Warnings</span>
            <div className="text-3xl font-display font-black text-amber-500 mt-1">{issuesFoundToday}</div>
            <div className="text-[10px] text-slate-500 mt-1">Fails logged today</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ABSENTEE QUICK ALERT BANNER */}
      {absentEmployeesCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex gap-2.5 items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-rose-850">Unlogged / Absentee Personnel Check needed!</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {absentEmployeesCount} employee{absentEmployeesCount > 1 ? "s are" : " is"} currently registered as <strong>Absent</strong>, because they have not yet locked in their daily reports.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 self-stretch md:self-auto">
            {employees.map((emp) => {
              const logged = logsOfToday.some((l) => l.employeeId === emp.id);
              if (!logged && emp.status === "Active") {
                return (
                  <span key={emp.id} className="inline-flex items-center gap-1 bg-white border border-rose-200 text-rose-800 text-[10px] font-mono px-2 py-1 rounded-sm shadow-2xs">
                    {emp.name} ({emp.id})
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* CENTRAL ROW: GEMINI AI SUMMARY HUB & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRID COL 1 & 2: GEMINI AUTOMATED INTELLIGENCE */}
        <div className="lg:col-span-2 bg-gradient-to-tr from-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          {/* Subtle design highlight background circle */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div>
            <div className="flex items-start justify-between border-b border-indigo-800/50 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/20">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-white tracking-tight flex items-center gap-1.5">
                    Gemini AI Daily Insight Summary
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Kaizen optimization on shift: {selectedDate}
                  </p>
                </div>
              </div>
              <button
                id="generate-ai-audit-btn"
                onClick={generateAiAudit}
                disabled={isAiLoading || logsOfToday.length === 0}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAiLoading
                    ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed"
                    : logsOfToday.length === 0
                    ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                    : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-md"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {isAiLoading ? "Analyzing Sheets..." : "Regenerate AI Audit"}
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-indigo-300 animate-pulse">Running advanced Kaizen semantic aggregates...</p>
                <p className="text-[10px] text-slate-400">Parsing machinery, path-lines and material comments...</p>
              </div>
            ) : aiError ? (
              <div className="py-6 text-rose-400 text-xs flex gap-2 border border-rose-900/30 bg-rose-950/20 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <strong>Biometric Engine Prompt Error:</strong> {aiError}
                </div>
              </div>
            ) : aiReport ? (
              <div className="space-y-4">
                {/* AI report metadata summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b border-slate-800">
                  <div className="p-2 bg-slate-800/45 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Mean Labor</span>
                    <div className="text-sm font-black text-indigo-300 font-mono">{aiReport.averageWorkingHours} Hrs/Worker</div>
                  </div>
                  <div className="p-2 bg-slate-800/45 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Quota Performance</span>
                    <div className="text-sm font-black text-indigo-300 font-mono">
                      {Math.round(aiReport.totalProduction / Math.max(aiReport.presentEmployees, 1))} Pts/worker
                    </div>
                  </div>
                  <div className="p-2 bg-slate-800/45 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Uptime Delays</span>
                    <div className="text-sm font-black text-amber-400 font-mono">{aiReport.machineIssuesCount} Events</div>
                  </div>
                  <div className="p-2 bg-slate-800/45 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Hazard Logs</span>
                    <div className="text-sm font-black text-rose-400 font-mono">{aiReport.safetyIssuesCount} Flags</div>
                  </div>
                </div>

                {/* Main AI commentary rendered beautifully */}
                <div className="prose prose-invert prose-xs text-xs max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-900 leading-relaxed text-slate-200">
                  <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                    {aiReport.aiInsights.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("###")) {
                        return (
                          <h4 key={pIdx} className="font-display font-semibold text-white mt-3 mb-1.5 first:mt-0 text-[13px] tracking-wide uppercase border-b border-slate-800 pb-0.5">
                            {para.replace(/###\s*/, "")}
                          </h4>
                        );
                      }
                      if (para.startsWith("* ")) {
                        return (
                          <ul key={pIdx} className="space-y-1 my-1.5 list-disc pl-4 text-slate-300 font-sans">
                            {para.split("\n").map((li, lIdx) => (
                              <li key={lIdx} className="leading-relaxed">
                                {li.replace(/\*\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={pIdx} className="mb-2 last:mb-0">
                          {para.replace(/\*\*(.*?)\*\*/g, "$1")}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6">No insights calculated yet.</p>
            )}
          </div>

          <div className="text-[10px] text-indigo-400/80 mt-4 pt-3 border-t border-indigo-950 flex justify-between">
            <span>Powered by Gemini 3.5-flash AI Reasoning</span>
            <span>Ref: central-sheets-kaizen-schema</span>
          </div>
        </div>

        {/* DETAILED SVG DEPARTMENTS HISTOGRAM QUOTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-extrabold text-slate-800 tracking-wide uppercase">Department Production Performance</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Physical items processed per department today</p>
          </div>

          {logsOfToday.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No shift telemetry received to plot graphs today.</p>
            </div>
          ) : (
            <div className="py-4 space-y-3.5">
              {departmentStats.map((item, idx) => {
                const maxVal = Math.max(...departmentStats.map((d) => d.total), 1);
                const percent = (item.total / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-800">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        {item.name}
                      </span>
                      <span className="font-mono">{item.total} pts ({item.count} log{item.count !== 1 ? "s" : ""})</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 flex justify-between">
            <span>Quota Source: Google Sheets database</span>
            <span>Uptime Logged</span>
          </div>
        </div>

      </div>

      {/* TABS CONTROLS: DIRECTORY INDEX & RECORD LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB 1: INTERACTIVE EMPLOYEE DIRECTORY CRUD (GRID 2/3 DEFAULT) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-md font-display font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                Personnel Staff Directory
              </h3>
              <p className="text-xs text-slate-500">Add, modify, and manage security image nodes for Biometric verification.</p>
            </div>
            
            <button
              id="new-employee-btn"
              onClick={() => {
                resetEmployeeForm();
                setIsEmployeeModalOpen(true);
              }}
              className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll Staff Profile
            </button>
          </div>

          {/* Directory Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="staff-search-box"
                type="text"
                placeholder="Search staff by Name, ID, or Title..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-slate-800"
              />
            </div>
            <select
              id="staff-dept-select"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Table index list */}
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-3">Staff Profile</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role / Position</th>
                  <th className="p-3">Google Sheet Indicators</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No registered employees match selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const loggedToday = logsOfToday.some((l) => l.employeeId === emp.id);
                    return (
                      <tr key={emp.id} className="border-b border-slate-150 hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-indigo-700 font-bold font-mono text-[10px]">
                              {emp.photoUrl && emp.photoUrl.startsWith("data:image") ? (
                                <img src={emp.photoUrl} alt="Employee" className="w-full h-full object-cover scale-x-[-1]" />
                              ) : (
                                emp.name.split(" ").map((n) => n[0]).join("")
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <span>{emp.id}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 opacity-70"><Mail className="w-3 h-3" /> {emp.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{emp.department}</td>
                        <td className="p-3 font-mono text-slate-500">{emp.role}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                            }`}>
                              {emp.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                              loggedToday ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {loggedToday ? "Present" : "Absent"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`edit-staff-${emp.id}`}
                              onClick={() => startEditEmployee(emp)}
                              className="p-1 px-1.5 hover:bg-indigo-50 rounded-md text-indigo-600 transition"
                              title="Edit Credentials"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`delete-staff-${emp.id}`}
                              onClick={() => deleteEmployee(emp.id)}
                              className="p-1 px-1.5 hover:bg-rose-50 rounded-md text-rose-600 transition"
                              title="Revoke Credentials"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED DAILY FEEDBACK HISTORICAL LOG VIEWER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-md font-display font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
                  Logs of: {selectedDate}
                </h3>
                <p className="text-xs text-slate-500">Export active shift feedback tables to spreadsheets.</p>
              </div>
              <button
                id="export-csv-btn"
                onClick={exportToCSV}
                className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Google Sheets CSV Export"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {/* Quick search inside active date log */}
            <div className="space-y-2">
              <input
                id="logs-inner-search"
                type="text"
                placeholder="Filter logs of today..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none bg-slate-50/50 font-medium"
              />
              <select
                id="logs-dept-select"
                value={selectedLogDept}
                onChange={(e) => setSelectedLogDept(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none text-slate-600 font-medium"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Micro card layout list */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No daily production feedback logs matches parameters today.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-white hover:shadow-xs transition space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-800">{log.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1">({log.employeeId})</span>
                      </div>
                      <span className="font-mono text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm">
                        {log.time}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-mono">
                      <div>Quota: <span className="font-bold text-indigo-700">{log.productionQuantity} units</span></div>
                      <div>Dept: <span className="font-semibold text-slate-850">{log.department}</span></div>
                      <div className="col-span-2">Machinery: <span className="font-mono text-[9px] text-slate-600">{log.machineUsed}</span></div>
                    </div>

                    {/* Operational warning badges */}
                    <div className="flex flex-wrap gap-1">
                      {log.machineIssues && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                          🛠️ Machine Issue
                        </span>
                      )}
                      {log.safetyIssues && (
                        <span className="bg-rose-50 text-rose-800 border border-rose-100 text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                          ⚠️ Safety Concern
                        </span>
                      )}
                      {log.materialShortage && (
                        <span className="bg-amber-100/60 text-amber-800 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                          📦 Material Short
                        </span>
                      )}
                    </div>

                    {log.suggestions && (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 italic text-[10px] leading-relaxed text-slate-500">
                        &ldquo;{log.suggestions}&rdquo;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[9px] text-slate-400 pt-3 border-t border-slate-105 font-medium">
            * Attendance status transitions to &apos;Present&apos; automatically upon daily feedback submission.
          </div>
        </div>

      </div>

      {/* CRUD MODAL DESIGN (OVERLAY) */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden animate-zoom-in text-xs">
            
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h4 className="text-sm font-display font-semibold flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5" />
                {editingEmployee ? `Modify Employee Credentials: ${editingEmployee.id}` : "Enroll New Employee Profile"}
              </h4>
              <button
                id="close-crud-modal"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitEmployeeForm} className="p-5 space-y-4">
              
              {crudError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{crudError}</span>
                </div>
              )}

              {/* Photo Upload and Preview Section */}
              <div className="p-3 border border-slate-150 rounded-xl bg-slate-50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-205 border border-slate-200 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-640 shrink-0 shadow-inner">
                  {empPhoto && empPhoto.startsWith("data:image") ? (
                    <img src={empPhoto} alt="Preview" className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    "Biometric"
                  )}
                </div>
                <div className="text-left space-y-1">
                  <div className="font-bold text-slate-800">Biometric Image Node</div>
                  <label className="inline-block px-3 py-1 bg-white hover:bg-slate-100 cursor-pointer border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 transition">
                    Capture or Upload Photo
                    <input
                      id="biometric-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 font-sans">Used for biometric face verification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-name-input" className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Employee Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="modal-name-input"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full p-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="modal-email-input" className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Corporate Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="modal-email-input"
                    type="email"
                    required
                    placeholder="john.doe@factory.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full p-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-dept-select" className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Department assigned <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="modal-dept-select"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full p-2 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modal-role-input" className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Job Title / Role description <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="modal-role-input"
                    type="text"
                    required
                    placeholder="e.g. CNC Specialist Operator"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full p-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Roster Status:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      id="modal-status-chk"
                      type="checkbox"
                      checked={empStatus === "Active"}
                      onChange={(e) => setEmpStatus(e.target.checked ? "Active" : "Inactive")}
                      className="w-3.5 h-3.5 text-indigo-600 rounded-sm focus:ring-0 accent-indigo-600"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">{empStatus}</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    id="modal-cancel-btn"
                    type="button"
                    onClick={() => setIsEmployeeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-save-btn"
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    {editingEmployee ? "Save Changes" : "Register Employee"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
