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
    const degrees = (score / 100) * 180 - 90;
    return `rotate(${degrees}, 150, 100)`;
  };

  return (
    <div className="space-y-6">
      
      {/* Module Intro */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-sans font-medium text-gray-100 flex items-center gap-2 text-base">
            <Compass className="w-5 h-5 text-amber-500" />
            版本缺陷预测罗盘与因果拓扑图
          </h3>
          <p className="text-xs text-gray-400">
            基于 DiBS 动态贝叶斯网络进行因果推断，量化版本迭代中隐性风险传递路径与影响权重。
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
          <div className="relative w-full flex items-center justify-center pt-2 pb-4">
            <svg viewBox="0 0 300 240" className="w-full max-w-[340px]">
              <defs>
                <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#991B1B"/>
                  <stop offset="100%" stopColor="#FCA5A5"/>
                </linearGradient>
                <linearGradient id="g-yellow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#92400E"/>
                  <stop offset="100%" stopColor="#FDE68A"/>
                </linearGradient>
                <linearGradient id="g-green" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#047857"/>
                  <stop offset="100%" stopColor="#A7F3D0"/>
                </linearGradient>
              </defs>

              {/* Track */}
              <path d="M 75,100 A 75,75 0 0,1 225,100"
                    fill="none" stroke="#0F172A" strokeWidth="16" strokeLinecap="butt"/>

              {/* Red (0-33) */}
              <path d="M 75,100 A 75,75 0 0,1 112.5,35.1"
                    fill="none" stroke="url(#g-red)" strokeWidth="16" strokeLinecap="butt"
                    opacity="0.95"/>

              {/* Yellow (33-67) */}
              <path d="M 112.5,35.1 A 75,75 0 0,1 187.5,35.1"
                    fill="none" stroke="url(#g-yellow)" strokeWidth="16" strokeLinecap="butt"
                    opacity="0.95"/>

              {/* Green (67-100) */}
              <path d="M 187.5,35.1 A 75,75 0 0,1 225,100"
                    fill="none" stroke="url(#g-green)" strokeWidth="16" strokeLinecap="butt"
                    opacity="0.95"/>

              {/* Tick marks */}
              {[0,10,20,30,40,50,60,70,80,90,100].map((tick) => {
                const theta = Math.PI + (tick / 100) * Math.PI;
                const r1 = 62;
                const r2 = 70;
                const cos = Math.cos(theta);
                const sin = Math.sin(theta);
                return (
                  <line key={tick}
                    x1={150 + r1 * cos} y1={100 + r1 * sin}
                    x2={150 + r2 * cos} y2={100 + r2 * sin}
                    stroke={tick % 50 === 0 ? "#D1D5DB" : "#6B7280"}
                    strokeWidth={tick % 50 === 0 ? 2.5 : 1.2}
                    strokeLinecap="round"/>
                );
              })}

              {/* Scale labels — pushed well outside the arc */}
              <text x="56" y="124" textAnchor="middle" fill="#D1D5DB"
                    fontFamily="monospace" fontSize="17" fontWeight="bold">0</text>
              <text x="150" y="11" textAnchor="middle" fill="#D1D5DB"
                    fontFamily="monospace" fontSize="17" fontWeight="bold">50</text>
              <text x="244" y="124" textAnchor="middle" fill="#D1D5DB"
                    fontFamily="monospace" fontSize="17" fontWeight="bold">100</text>

              {/* Pointer needle */}
              <polygon
                points="150,104 147,32 153,32"
                fill={selectedVersion.activeRiskLevel === "TAKEOFF_DENIED" ? "#EF4444" : "#F9FAFB"}
                className="transition-transform duration-1000 ease-out"
                style={{ transformOrigin: "150px 100px" }}
                transform={getGaugeTransform(selectedVersion.safetyScore)}/>

              {/* Center hub */}
              <circle cx="150" cy="100" r="10" fill="#111827" stroke="#4B5563" strokeWidth="2"/>
              <circle cx="150" cy="100" r="3.5" fill="#D1D5DB"/>

              {/* Score */}
              <text x="150" y="200" textAnchor="middle" fill="currentColor"
                    fontSize="52" fontFamily="ui-monospace, monospace" fontWeight="700"
                    className="text-gray-100">
                {selectedVersion.safetyScore}
              </text>
              <text x="150" y="226" textAnchor="middle" fill="currentColor"
                    className="text-xs font-mono text-gray-400 tracking-widest">
                SAFETY SCORE
              </text>
            </svg>
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
              因果门限切分后的底层指标对缺陷判定的贡献权重，直接反映代码重构方向：
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
              <strong>说明：</strong>安全注释量 (hw_comments) 具备负向因果权重，注释越完善，缺陷概率越低。
            </span>
          </div>
        </div>

      </div>

      {/* Embedded Deep Bayesian Topological Graph */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
            🕸️ DiBS 贝叶斯因果网络拓扑图
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            节点间连线对应 graphLinks，方向代表因果传递
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          {(() => {
            const isRed = selectedVersion.activeRiskLevel === "TAKEOFF_DENIED";
            const isAmber = selectedVersion.activeRiskLevel === "WARNING";
            const lineColor = isRed ? "#EF4444" : isAmber ? "#F59E0B" : "#10B981";
            const markerId = isRed ? "m-red" : isAmber ? "m-amber" : "m-green";

            const posMap: Record<string, {x:number,y:number,w:number,h:number}> = {
              "A_Func":    {x:15, y:20, w:175, h:56},
              "Comment":   {x:15, y:126,w:175, h:56},
              "Latency":   {x:15, y:232,w:175, h:56},
              "BusDeadlock":{x:290,y:72, w:175, h:56},
              "SensorDrift":{x:290,y:180,w:175, h:56},
              "Buggy":     {x:540,y:126,w:165, h:56},
            };

            const nodeStyle = (r: "low"|"medium"|"high", isOutcome: boolean) => {
              if (isOutcome) {
                if (r==="high") return {fill:"#450a0a", stroke:"#EF4444", text:"#FCA5A5", sw:2.5};
                if (r==="medium") return {fill:"#451a03", stroke:"#F59E0B", text:"#FDE68A", sw:2};
                return {fill:"#022c22", stroke:"#10B981", text:"#6EE7B7", sw:2};
              }
              if (r==="high") return {fill:"rgba(69,10,10,0.5)", stroke:"rgba(239,68,68,0.35)", text:"#FCA5A5", sw:1};
              if (r==="medium") return {fill:"rgba(69,26,3,0.5)", stroke:"rgba(245,158,11,0.35)", text:"#FDE68A", sw:1};
              return {fill:"rgba(2,44,34,0.5)", stroke:"rgba(16,185,129,0.35)", text:"#6EE7B7", sw:1};
            };

            return (
              <svg viewBox="0 0 720 310" className="w-full min-w-[600px]" style={{maxHeight: 310}}>
                <defs>
                  <marker id="m-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444"/>
                  </marker>
                  <marker id="m-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B"/>
                  </marker>
                  <marker id="m-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981"/>
                  </marker>
                </defs>

                {/* Connection lines from graphLinks */}
                {selectedVersion.graphLinks.map((link, i) => {
                  const from = posMap[link.source];
                  const to = posMap[link.target];
                  if (!from || !to) return null;
                  const sy = from.y + from.h / 2;
                  let ty = to.y + to.h / 2;
                  if (link.source === "Latency" && link.target === "BusDeadlock") ty += 12;
                  if (link.source === "SensorDrift" && link.target === "Buggy") ty += 10;
                  const mx = (from.x + from.w + to.x) / 2;
                  return (
                    <g key={i}>
                      <path d={`M ${from.x+from.w},${sy} C ${mx},${sy} ${mx},${ty} ${to.x-2},${ty}`}
                            fill="none" stroke={lineColor} strokeWidth={2.5}
                            strokeLinecap="round" opacity={0.8}
                            markerEnd={`url(#${markerId})`}/>
                    </g>
                  );
                })}

                {/* Nodes */}
                {selectedVersion.graphNodes.map((node) => {
                  const p = posMap[node.id];
                  if (!p) return null;
                  const s = nodeStyle(node.riskRating, node.type === "outcome");
                  const label = node.label.length > 20 ? node.label.slice(0, 20)+"…" : node.label;
                  return (
                    <g key={node.id}>
                      <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={8}
                            fill={s.fill} stroke={s.stroke} strokeWidth={s.sw}/>
                      <text x={p.x + p.w/2} y={p.y + 24} textAnchor="middle"
                            fill={s.text} fontSize="12" fontFamily="sans-serif" fontWeight="600">{label}</text>
                      <text x={p.x + p.w/2} y={p.y + 46} textAnchor="middle"
                            fill={s.text} fontSize="13" fontFamily="monospace" fontWeight="700">{node.value}</text>
                    </g>
                  );
                })}

                {/* Column headers */}
                <text x="102" y="10" textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="monospace">底层原始指标</text>
                <text x="377" y="62" textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="monospace">因果中间变量</text>
                <text x="622" y="116" textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="monospace">预警概率输出</text>
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Integrated Pre-flight Testing Interface - Real Consequence of causal code metrics */}
      <FlightTester selectedVersion={selectedVersion} />

    </div>
  );
}
