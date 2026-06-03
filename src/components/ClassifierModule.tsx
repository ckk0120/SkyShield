/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MOCK_CODE_SNIPPETS } from "../data/mockData";
import { CodeSnippet } from "../types";
import { Terminal, Send, FileCode, ShieldAlert, Cpu } from "lucide-react";

export default function ClassifierModule() {
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet>(MOCK_CODE_SNIPPETS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPromptDrawer, setShowPromptDrawer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  const steps = [
    "📡 [1/4] 连接云端 SkyShield LLM 安全中控服务器...",
    "📄 [2/4] 注入零温指令约束规范 (Zero-Temperature Schema Constraints)...",
    "🧠 [3/4] 模型多级前向传播，分析寄存器、引脚与变量指针依赖链...",
    "🛡️ [4/4] 过滤和清洗幻觉输出，执行本地 AST 词法安全断言校验(Hallucination Clean)..."
  ];

  const triggerSemanticAnalysis = () => {
    setIsAnalyzing(true);
    setIsCompleted(false);
    setAnalysisLogs([]);
    setCurrentStep(0);

    let nextStep = 0;
    const runStep = () => {
      if (nextStep < steps.length) {
        setAnalysisLogs((prev) => [...prev, steps[nextStep]]);
        setCurrentStep(nextStep + 1);
        nextStep++;
        setTimeout(runStep, 800);
      } else {
        setIsAnalyzing(false);
        setIsCompleted(true);
        setAnalysisLogs((prev) => [...prev, "🚀 [SUCCESS] 语义分类完成。大模型成功捕获结构化边数据！"]);
      }
    };

    runStep();
  };

  return (
    <div className="space-y-6">
      {/* Explanation Banner */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-3 space-y-1">
          <h3 className="font-sans font-medium text-gray-100 flex items-center gap-2 text-base">
            <Cpu className="w-5 h-5 text-[#00D2FF]" />
            云端 LLM 软硬交互底层语义分类器 (Semantic Classifier)
          </h3>
          <p className="text-sm text-gray-400">
            基于大语言模型区分纯算数层与物理硬件操作层，零温约束下杜绝幻觉误判。
          </p>
        </div>

        <div className="flex md:justify-end">
          <button
            id="btn-toggle-prompt-drawer"
              className="px-3.5 py-1.5 rounded border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-sm font-sans text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => setShowPromptDrawer(!showPromptDrawer)}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            {showPromptDrawer ? "收起提示词模板" : "展开提示词模型约束"}
          </button>
        </div>
      </div>

      {/* Extensible Prompt Template Drawer */}
      {showPromptDrawer && (
        <div className="bg-gray-950 p-4 rounded-xl border border-dashed border-gray-800 animate-slide-down space-y-3">
          <span className="text-[12px] font-mono text-gray-500 uppercase block">
            🔒 核心零温大模型推理前置约束条件 (System Schema Prompts)
          </span>
          <pre className="text-[13px] font-mono text-teal-400 leading- relaxed bg-gray-950 p-3 rounded border border-gray-900 overflow-x-auto whitespace-pre-wrap select-all">
{`You are an isolated binary-level static analyzer for flight controllers. Return only valid raw JSON conforming to this schema:
{
  "function_name": "string",
  "hardware_dependent": 1 | 0,
  "subsystem_category": "SPI" | "I2C" | "UART" | "ISR" | "PWM" | "None",
  "estimated_takeoff_safety_rating_percent": integer (0 to 100),
  "layman_threat_metric": "string describing safety impact on uav takeoff roll",
  "suggested_remediation": "string with corrective flight patching guidelines"
}
Strict Rules: 
1. If code writes to TIMER registries (TIMx->CCRx) or SPI line select (CS_LOW), output hardware_dependent=1.
2. If code only performs floating math point (kp / dt), output hardware_dependent=0.
3. Completely avoid verbose textual conversation. Execute zero-temperature deterministic output.`}
          </pre>
          <p className="text-[14px] text-gray-500 font-sans leading-3">
            LLM 注入强类型 JSON Schema 约束，消除模型幻觉与冗余输出，保证扫描结果稳定一致。
          </p>
        </div>
      )}

      {/* Main Panel Side-by-Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: raw flight control function selector & code view (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
              <span className="text-sm font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" />
                无人机飞控底层物理函数库 (C++ source view)
              </span>

              {/* Snippet selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[12px] text-gray-500 font-sans">预设源码:</span>
                <select
                  id="code-snippet-select"
                  value={selectedSnippet.id}
                  onChange={(e) => {
                    const sn = MOCK_CODE_SNIPPETS.find(s => s.id === e.target.value);
                    if (sn) {
                      setSelectedSnippet(sn);
                      setIsCompleted(false);
                    }
                  }}
                  className="bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-sm text-gray-300 font-mono focus:outline-none cursor-pointer"
                >
                  {MOCK_CODE_SNIPPETS.map((s) => (
                    <option key={s.id} value={s.id}>{s.title.split(" - ")[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulated file window */}
            <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-950 flex flex-col">
              {/* Window chrome tab bar */}
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-950 flex items-center justify-between">
                <span className="text-[12px] font-mono text-gray-400">
                  {selectedSnippet.title}.cpp (read-only)
                </span>
                <span className="flex space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500/60" />
                </span>
              </div>
              
              <pre className="p-4 text-[14px] font-mono text-gray-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                <code>{selectedSnippet.code}</code>
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between">
            <span className="text-[12px] text-gray-500 font-mono">
              所属层级：{selectedSnippet.subsystem}
            </span>
            <button
              id="btn-run-semantic-classifier"
              disabled={isAnalyzing}
              onClick={triggerSemanticAnalysis}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-sans font-bold text-sm rounded transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isAnalyzing ? "模型深度分析中..." : "语义解析静态分类"}
            </button>
          </div>
        </div>

        {/* Right Side: LLM Analysis Panel & Steps terminal logs (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-sm font-mono text-gray-400 uppercase tracking-wider block border-b border-gray-800 pb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#00D2FF]" />
              LLM 模型运算执行控制台 (LLM COMPILER)
            </span>

            {/* Logging terminal lines */}
            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-900 font-mono text-[13px] text-gray-400 min-h-36 max-h-36 overflow-y-auto space-y-1.5">
              {analysisLogs.length === 0 && !isAnalyzing ? (
                <div className="text-gray-600 italic text-center pt-8">
                  [待命] 点击左侧“语义解析静态分类”触发模型
                </div>
              ) : (
                analysisLogs.map((log, index) => (
                  <div key={index} className="leading-5">
                    {log.includes("SUCCESS") ? (
                      <span className="text-teal-400 font-semibold">{log}</span>
                    ) : log.includes("ERROR") ? (
                      <span className="text-red-400 font-semibold">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))
              )}

              {isAnalyzing && (
                <div className="flex items-center space-x-1 text-[#00D2FF] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping" />
                  <span className="animate-pulse">LLM 状态机活跃运算中...</span>
                </div>
              )}
            </div>

            {/* Results Output Block if completed */}
            {isCompleted && (
              <div className="space-y-3 animate-fade-in text-sm font-sans">
                
                {/* Structured JSON verdict schema block */}
                <div className="bg-slate-900/40 border border-gray-800 p-3.5 rounded-lg space-y-3.5">
                  <div className="flex justify-between items-center text-[12px] font-mono border-b border-gray-800 pb-1.5">
                    <span className="text-gray-400">📊 大模型结构化数据边 (STRUCT OUT)</span>
                    <span className={`px-2 py-0.5 rounded text-[14px] font-bold ${
                      selectedSnippet.isHardwareDependent 
                      ? 'bg-red-950 text-red-400 border border-red-500/10' 
                      : 'bg-teal-950 text-teal-400 border border-teal-500/10'
                    }`}>
                      {selectedSnippet.isHardwareDependent ? "硬件依赖高 (D=1)" : "算法运算层 (D=0)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm leading-4">
                    <div>
                      <span className="text-gray-500 font-mono block text-[9.5px]">解析方法名称:</span>
                      <strong className="text-gray-300 font-mono font-semibold block truncate mt-0.5">{selectedSnippet.title.split(" - ")[0]}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-sans block text-[9.5px]">大模型起降安全预判:</span>
                      <strong className={`block text-sm mt-0.5 font-bold ${
                        selectedSnippet.isHardwareDependent ? 'text-red-400 animate-pulse' : 'text-teal-400'
                      }`}>
                        {selectedSnippet.isHardwareDependent ? '🔴 高危挂锁' : '🟢 极其安全'}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-gray-800 mt-2">
                    <span className="text-[12px] text-gray-400 font-mono block mb-1">大模型对源文件之语义识别诊断：</span>
                    <p className="text-gray-300 leading-relaxed text-[14px] bg-gray-950/20 p-2.5 rounded border border-gray-800/40">
                      {selectedSnippet.semanticAnalysis}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Corrective Action for Ordinary User */}
          {isCompleted && (
            <div className="pt-3 border-t border-gray-800 space-y-2 text-sm font-sans">
                <span className="text-[14px] font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  起飞安全性评估：
                </span>
              <p className="text-gray-300 leading-relaxed text-[14px]">
                {selectedSnippet.takeoffSafetyImpact}
              </p>
              
              <div className="mt-2 text-gray-300 leading-relaxed text-[14px] bg-slate-900 border border-slate-800 p-2.5 rounded">
                <span className="text-sky-400 font-semibold">🔧 修正飞行安全配方建议：</span>
                {selectedSnippet.remediationAction}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Inline minimalist layout icon replacement
function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m12 3-10 5 10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}
