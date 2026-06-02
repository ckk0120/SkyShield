/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MOCK_RELIABLE_VERSIONS } from "../data/mockData";
import { ReleaseVersion } from "../types";
import FlightTester from "./FlightTester";
import { Compass, AlertTriangle, ShieldCheck, Activity, Info, BarChart3, HelpCircle } from "lucide-react";

export default function CompassModule() {
  const [selectedVersion, setSelectedVersion] = useState<ReleaseVersion>(MOCK_RELIABLE_VERSIONS[0]);

  // Color matching helpers
  const getRiskColorClass = (level: "SAFE" | "WARNING" | "TAKEOFF_DENIED") => {
    switch (level) {
      case "SAFE": return "text-teal-400";
      case "WARNING": return "text-amber-400";
      case "TAKEOFF_DENIED": return "text-red-500";
    }
  };

  const getRiskBgClass = (level: "SAFE" | "WARNING" | "TAKEOFF_DENIED") => {
    switch (level) {
      case "SAFE": return "bg-teal-950/40 border-teal-500/20";
      case "WARNING": return "bg-amber-950/40 border-amber-500/20";
      case "TAKEOFF_DENIED": return "bg-red-950/40 border-red-500/20";
    }
  };

  // SVG Gauge Math
  const getGaugeTransform = (score: number) => {
    // Math to convert 0-100 score to degrees for rotating gauge arrow.
    // Range from -90deg to 90deg.
    const degrees = (score / 100) * 180 - 90;
    return `rotate(${degrees}, 120, 120)`;
  };

  return (
    <div className="space-y-6">
      
      {/* Module Intro */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-sans font-medium text-gray-100 flex items-center gap-2 text-base">
            <Compass className="w-5 h-5 text-amber-500" />
            版本迭代缺陷预测罗盘与因果拓扑图 (Release Compass & Causal Radar)
          </h3>
          <p className="text-xs text-gray-400">
            学术突破：传统预测不讲因果，SkyShield 使用时序划分 ($n \to n+1$) 配合 DiBS 算法寻找指标间的纯粹因果。不仅做预测，还直观反馈为何代码中一处注释或时延改变会引起坠机。
          </p>
        </div>

        {/* Dropdown Version Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-sans">选择评估版本：</span>
          <select
            id="vcompass-release-select"
            value={selectedVersion.id}
            onChange={(e) => {
              const selected = MOCK_RELIABLE_VERSIONS.find(v => v.id === e.target.value);
              if (selected) {
                setSelectedVersion(selected);
              }
            }}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 font-sans cursor-pointer"
          >
            {MOCK_RELIABLE_VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Gauge safety score and Causal metrics list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Gauge dial and Risk Level details */}
        <div className="lg:col-span-5 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between items-center space-y-4">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider self-start flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            版本安全罗盘与仪表盘 (System Safety Dial)
          </span>

          {/* Large Graphical Gauge Chart */}
          <div className="relative w-64 h-44 flex items-center justify-center pt-2">
            <svg width="240" height="240" className="absolute top-0">
              {/* Gauge arc track */}
              <path 
                d="M 30,120 A 90,90 0 0,1 210,120" 
                fill="none" 
                stroke="#1F2937" 
                strokeWidth="20" 
                strokeLinecap="round" 
              />
              {/* Green Safe Segment */}
              <path 
                d="M 30,120 A 90,90 0 0,1 90,44.7" 
                fill="none" 
                stroke="#EF4444" 
                strokeWidth="20" 
              />
              {/* Yellow Warning Segment */}
              <path 
                d="M 90,44.7 A 90,90 0 0,1 150,44.7" 
                fill="none" 
                stroke="#F59E0B" 
                strokeWidth="20" 
              />
              {/* Red Danger Segment */}
              <path 
                d="M 150,44.7 A 90,90 0 0,1 210,120" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="20" 
              />
              
              {/* Gauge pointer arrow */}
              <polygon 
                points="120,50 115,120 125,120" 
                fill="#F3F4F6" 
                className="transition-transform duration-1000 ease-out origin-[120px_120px]"
                transform={getGaugeTransform(selectedVersion.safetyScore)}
              />
              {/* Center Cap */}
              <circle cx="120" cy="120" r="14" fill="#374151" stroke="#F3F4F6" strokeWidth="2.5" />
            </svg>

            {/* Inner text values */}
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-4xl font-mono font-bold text-gray-100 mt-6">
                {selectedVersion.safetyScore}
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                安全指数 (Score)
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border w-full text-center ${getRiskBgClass(selectedVersion.activeRiskLevel)}`}>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
              当前版本风险研判：
            </span>
            <strong className={`text-sm font-sans font-extrabold ${getRiskColorClass(selectedVersion.activeRiskLevel)} flex items-center justify-center gap-1`}>
              {selectedVersion.activeRiskLevel === "SAFE" && "🟢 纯净飞控 (安全起飞)"}
              {selectedVersion.activeRiskLevel === "WARNING" && "🟡 注意温漂 (防颤飞起)"}
              {selectedVersion.activeRiskLevel === "TAKEOFF_DENIED" && "🔴 危险挂载 (强否决起飞)"}
            </strong>
            <p className="text-[11px] text-gray-300 leading-relaxed font-sans mt-2">
              {selectedVersion.statusDescription}
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Bayesian causal metrics table */}
        <div className="lg:col-span-7 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              DiBS 因果元因链矩阵因子 (Causal Weight Assessment)
            </span>
            
            <p className="text-[11px] text-gray-400 font-sans">
              经过因果门限时空切分，我们找出了促退系统被判为有缺陷（Buggy_Label=1）的各个真实物理原因占比。下表直接反应代码重构方向：
            </p>

            <div className="space-y-2.5">
              {selectedVersion.metrics.map((m, idx) => {
                const isComment = m.name.includes("comments");
                return (
                  <div key={idx} className="bg-gray-950 p-3 rounded-lg border border-gray-900 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold text-gray-300 block">{m.name}</span>
                      <span className="text-[10px] text-gray-500 font-sans block mt-0.5">{m.description}</span>
                    </div>

                    <div className="text-right flex items-center space-x-4">
                      <div className="font-mono">
                        <span className="text-sm font-bold text-gray-200">{m.value}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">{m.unit}</span>
                      </div>
                      
                      {/* Weight pill */}
                      <div className="w-24 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isComment 
                          ? m.value > 100 ? 'bg-teal-950 text-teal-400' : 'bg-amber-950 text-amber-400' 
                          : Math.abs(m.causalWeight) >= 0.35 
                          ? 'bg-red-950 text-red-400 border border-red-500/10' 
                          : 'bg-green-950 text-green-400'
                        }`}>
                          因果影响: {m.causalWeight > 0 ? '+' : ''}{(m.causalWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800/60 flex items-start space-x-2 text-[10.5px] text-gray-400 font-sans">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>学术解读：</strong>硬件级安全策略注释 (hw_comments) 具备反向权重(-20%)。这充分论证了如果我们在底层编写更周密的时间和总线重置保障注释（意味着重构健全程度高），飞控的死锁崩溃缺陷率将被有效降压。
            </span>
          </div>
        </div>

      </div>

      {/* Embedded Deep Bayesian Topological Graph */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
            🕸️ DiBS 贝叶斯因果网络拓扑图 (Causal Dynamic Bayesian Network)
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            可理解为公式：A_Func_Call ➡️ 总线死锁 ➡️ Buggy_Label
          </span>
        </div>

        <div className="bg-gray-950 rounded-lg p-5 border border-gray-900 relative overflow-hidden flex flex-col md:flex-row justify-around items-center min-h-[220px] gap-6">
          
          {/* Node columns rendering a flow from Metrics -> Intermediates -> Outcome */}
          {/* Level 1: Core Metrics */}
          <div className="flex flex-col space-y-4 z-10 w-full md:w-1/3">
            <span className="text-[10px] text-center text-gray-500 font-sans uppercase">底层原始指标</span>
            {selectedVersion.graphNodes.filter(n => n.type === "metric").map((node) => (
              <div 
                key={node.id} 
                className={`p-3 rounded border text-center transition-all ${
                  node.riskRating === "high" 
                  ? "bg-red-950/40 border-red-500/30 text-red-300" 
                  : node.riskRating === "medium"
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  : "bg-teal-950/40 border-teal-500/30 text-teal-300"
                }`}
              >
                <div className="text-[11px] font-sans font-semibold">{node.label}</div>
                <div className="text-xs font-mono font-bold mt-1">{node.value}</div>
              </div>
            ))}
          </div>

          {/* SVG Arrows drawing for causal directions */}
          {/* We will draw interactive lines between columns */}
          <div className="hidden md:block absolute inset-0 z-0 opacity-40 pointers-none">
            <svg className="w-full h-full text-slate-700">
              {/* Dynamic glowing arrow lanes depending on risk */}
              <defs>
                <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="#10B981" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="#F59E0B" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 10 5 L 0 8 z" fill="#EF4444" />
                </marker>
              </defs>

              {selectedVersion.activeRiskLevel === "TAKEOFF_DENIED" ? (
                <>
                  <line x1="180" y1="50" x2="310" y2="90" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                  <line x1="180" y1="170" x2="310" y2="105" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                  <line x1="390" y1="95" x2="520" y2="100" stroke="#EF4444" strokeWidth="3" markerEnd="url(#arrow-red)" className="animate-pulse" />
                </>
              ) : selectedVersion.activeRiskLevel === "WARNING" ? (
                <>
                  <line x1="180" y1="50" x2="310" y2="90" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-amber)" />
                  <line x1="180" y1="170" x2="310" y2="105" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-amber)" />
                  <line x1="390" y1="95" x2="520" y2="100" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-amber)" />
                </>
              ) : (
                <>
                  <line x1="180" y1="50" x2="310" y2="90" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  <line x1="180" y1="170" x2="310" y2="105" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                  <line x1="390" y1="95" x2="520" y2="100" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />
                </>
              )}
            </svg>
          </div>

          {/* Level 2: Intermediates */}
          <div className="flex flex-col space-y-4 z-10 w-full md:w-1/4">
            <span className="text-[10px] text-center text-gray-500 font-sans uppercase">因果中间变量</span>
            {selectedVersion.graphNodes.filter(n => n.type === "intermediate").map((node) => (
              <div 
                key={node.id} 
                className={`p-3 rounded border text-center transition-all ${
                  node.riskRating === "high" 
                  ? "bg-red-950/40 border-red-500/30 text-red-300" 
                  : node.riskRating === "medium"
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  : "bg-teal-950/40 border-teal-500/30 text-teal-300"
                }`}
              >
                <div className="text-[11px] font-sans font-semibold">{node.label}</div>
                <div className="text-xs font-mono font-bold mt-1 text-gray-200">{node.value}</div>
              </div>
            ))}
          </div>

          {/* Level 3: Outcome (Buggy_Label) */}
          <div className="flex flex-col space-y-4 z-10 w-full md:w-1/4">
            <span className="text-[10px] text-center text-gray-500 font-sans uppercase">预警概率输出</span>
            {selectedVersion.graphNodes.filter(n => n.type === "outcome").map((node) => (
              <div 
                key={node.id} 
                className={`p-4 rounded border text-center transition-all ${
                  node.riskRating === "high" 
                  ? "bg-red-950 border-red-500 text-red-400 ring-2 ring-red-500/30" 
                  : node.riskRating === "medium"
                  ? "bg-amber-950 border-amber-500 text-amber-400"
                  : "bg-teal-950 border-teal-500 text-teal-400"
                }`}
              >
                <div className="text-xs font-sans font-extrabold uppercase tracking-widest">{node.label}</div>
                <div className="text-lg font-mono font-bold mt-1">{node.value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Integrated Pre-flight Testing Interface - Real Consequence of causal code metrics */}
      <FlightTester selectedVersion={selectedVersion} />

    </div>
  );
}
