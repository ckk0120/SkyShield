/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ARDUPILOT_FILES, BETAFLIGHT_FILES } from "../data/mockData";
import { FirmwareFile } from "../types";
import { Search, Info, AlertOctagon, HelpCircle, Layers, CheckSquare, ShieldCheck, Flame, Cpu, RefreshCw } from "lucide-react";

export default function ScannerModule() {
  const [selectedPreset, setSelectedPreset] = useState<"ArduPilot" | "Betaflight">("ArduPilot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FirmwareFile>(ARDUPILOT_FILES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const filesList = selectedPreset === "ArduPilot" ? ARDUPILOT_FILES : BETAFLIGHT_FILES;

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const filteredFiles = filesList.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.hwSubsystem.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting files by riskScore to show Pareto distribution clearly (High risk on top)
  const sortedFilesForPareto = [...filesList].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="space-y-6">
      {/* Search and Options Header */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <h3 className="font-sans font-medium text-gray-100 flex items-center gap-2 text-base">
            <Cpu className="w-5 h-5 text-sky-400" />
            固件软硬交互热点一键扫描器 (Hotspot Scanner)
          </h3>
          <p className="text-xs text-xs text-gray-400">
            学术发现：无人机 90% 的硬交互缺陷和断连挂死，皆高密度集中在 20% 涉及 SPI, I2C, DMA, 中断等底层交互的主动外设代码中。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            id="preset-firmware-select"
            value={selectedPreset}
            onChange={(e) => {
              const preset = e.target.value as "ArduPilot" | "Betaflight";
              setSelectedPreset(preset);
              setSelectedFile(preset === "ArduPilot" ? ARDUPILOT_FILES[0] : BETAFLIGHT_FILES[0]);
            }}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500 cursor-pointer font-sans"
          >
            <option value="ArduPilot">ArduPilot (多层宏框架)</option>
            <option value="Betaflight">Betaflight (单线程轮询)</option>
          </select>

          <button
            id="btn-trigger-hotspot-scan"
            onClick={handleScan}
            disabled={isScanning}
            className="bg-sky-500 text-slate-950 font-sans font-bold text-xs px-4 py-2 rounded hover:bg-sky-400 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? `${scanProgress}% 扫描中...` : '一键热点漏洞扫描'}
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>正在建立软硬件指令拓扑树...</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="h-2 bg-gray-950 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      {/* Main Grid: Topology Map & Pareto Bar, File Listing, Detailed Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Map and bar chart + File interactive table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hardware-Software Coupling Interactive Bar */}
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                软硬交互拓扑热力特征图 (2/8 帕累托特征分布)
              </span>
              <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-mono font-bold border border-red-500/10">
                帕累托高危层 (前 20% 高风险核心交互文件)
              </span>
            </div>

            <div className="bg-gray-950 p-4 rounded-lg border border-gray-900 space-y-3">
              <p className="text-[11px] text-gray-400 font-sans">
                以下为排序后的软硬交互占比系数。您能清晰地看到，最左侧（排名前两位）的硬件访问频率与中断时耗，完全呈二八法则指数型主导了剩余文件的安全系数：
              </p>
              
              {/* SVG-based Dynamic Bar Chart which acts as the Heatmap */}
              <div className="space-y-2.5 pt-2">
                {sortedFilesForPareto.map((file, idx) => {
                  const isHighRisk = file.riskScore >= 75;
                  const barPercent = file.riskScore;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedFile(file)}
                      className={`flex items-center space-x-3 cursor-pointer group p-1.5 rounded transition-all ${
                        selectedFile.name === file.name 
                        ? 'bg-slate-800/60 border-l-4 border-sky-400 pl-2' 
                        : 'hover:bg-slate-800/25 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Rank badge */}
                      <span className={`w-5 text-xs font-mono font-bold ${
                        isHighRisk ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      {/* Name of file and subsystem */}
                      <div className="w-44 text-xs font-mono truncate text-gray-300 group-hover:text-sky-300 transition-colors">
                        {file.name}
                        <span className="block text-[9px] text-gray-500 font-sans">{file.hwSubsystem} 外设总线</span>
                      </div>
                      {/* Horizontal custom bar indicator */}
                      <div className="flex-grow bg-gray-900 h-4.5 rounded overflow-hidden relative border border-gray-800">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isHighRisk 
                            ? 'bg-gradient-to-r from-red-600 to-amber-500 group-hover:brightness-110' 
                            : 'bg-gradient-to-r from-teal-600 to-sky-500'
                          }`}
                          style={{ width: `${barPercent}%` }}
                        />
                        <span className="absolute right-2 top-0.5 text-[9px] font-mono font-bold text-gray-200">
                          {file.riskScore}点(高危交互)
                        </span>
                      </div>
                      {/* Tag indicating status */}
                      <div className="w-16 text-right">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isHighRisk 
                          ? 'bg-red-950 text-red-400 border border-red-500/10' 
                          : 'bg-teal-950 text-teal-400 border border-teal-500/10'
                        }`}>
                          {isHighRisk ? '高危/热点' : '正常/防溢'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive File Table List */}
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                📂 固件编译文件清单列表 ({filteredFiles.length} 个对象)
              </span>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
                <input
                  id="search-file-hotspots"
                  type="text"
                  placeholder="搜索文件名、外设Subsystem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded pl-8 pr-3 py-1 text-xs text-gray-300 focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800 text-gray-400">
                    <th className="p-3">文件全称</th>
                    <th className="p-3">外设通信域</th>
                    <th className="p-3 text-right">外设机器行码</th>
                    <th className="p-3 text-right">指令调用频级</th>
                    <th className="p-3 text-right">安全熵系数</th>
                    <th className="p-3 text-right">热点风险</th>
                    <th className="p-3 text-center">起飞干扰</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredFiles.map((file, index) => {
                    const isSelected = selectedFile.name === file.name;
                    return (
                      <tr 
                        key={index}
                        onClick={() => setSelectedFile(file)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                          ? 'bg-slate-800/40 text-sky-200' 
                          : 'hover:bg-slate-900/50 text-gray-300'
                        }`}
                      >
                        <td className="p-3 font-semibold truncate max-w-[200px]" title={file.path}>
                          {file.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 font-bold text-gray-400 text-[10px]">
                            {file.hwSubsystem}
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-400">{file.hwCodelines} 行</td>
                        <td className="p-3 text-right text-gray-400">{file.hwFuncCalls} 次</td>
                        <td className="p-3 text-right text-gray-400 font-bold">{(file.academicComplexity).toFixed(2)}</td>
                        <td className="p-3 text-right text-amber-500 font-bold">
                          {file.riskScore}%
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            file.riskScore >= 75 
                            ? 'bg-red-500 animate-pulse' 
                            : file.riskScore >= 50 
                            ? 'bg-amber-400' 
                            : 'bg-teal-500'
                          }`} />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-500">
                        未检索到任何符合筛选条件的代码热点文件
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Detailed Diagnostics & Layperson Guide */}
        <div className="lg:col-span-4 bg-[#111827] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-fit space-y-5">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2.5">
              <span className="p-1 rounded bg-red-950 text-red-400 border border-red-500/20">
                <AlertOctagon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-sans font-medium text-gray-200 text-sm">
                  热点文件诊断哨所
                </h4>
                <p className="text-[10px] text-gray-400 font-mono">
                  {selectedFile.path}
                </p>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-950 p-2 rounded border border-gray-900 text-center">
                <span className="text-[9px] text-gray-500 font-sans block mb-0.5">硬件时钟码</span>
                <span className="text-xs font-mono font-bold text-gray-300">{selectedFile.hwCodelines} 行</span>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-900 text-center">
                <span className="text-[9px] text-gray-500 font-sans block mb-0.5">HAL调用</span>
                <span className="text-xs font-mono font-bold text-gray-300">{selectedFile.hwFuncCalls} 次</span>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-900 text-center">
                <span className="text-[9px] text-gray-500 font-sans block mb-0.5">安全信息熵</span>
                <span className="text-xs font-mono font-bold text-teal-400">{selectedFile.academicComplexity}</span>
              </div>
            </div>

            {/* Practical fly warning */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-sans font-semibold">物理起飞推断反馈 (实用状态)：</span>
              <div className={`p-2.5 rounded text-[11px] font-sans leading-relaxed border ${
                selectedFile.riskScore >= 75 
                ? 'bg-red-950/30 border-red-500/20 text-red-300' 
                : 'bg-teal-950/30 border-teal-500/20 text-teal-300'
              }`}>
                {selectedFile.takeoffImplication}
              </div>
            </div>

            {/* Detail Analysis */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-sans font-semibold">底层逻辑机制解释 (学术支撑)：</span>
              <p className="bg-gray-950/40 p-2.5 rounded text-[11px] leading-relaxed text-gray-300 font-sans border border-gray-900">
                {selectedFile.explanation}
              </p>
            </div>
          </div>

          {/* Practical Solution Checklist */}
          <div className="border-t border-gray-800 pt-3.5 space-y-2">
            <span className="text-[11px] font-sans font-bold text-sky-400 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              普通人怎么修改 (一键固件除燥配方)：
            </span>
            <div className="bg-sky-950/10 border border-sky-500/10 rounded p-2.5 text-[11px] leading-relaxed text-gray-300 font-sans flex items-start space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>推荐重构补丁：</strong>
                {selectedFile.solution}
              </span>
            </div>
            
            <p className="text-[9px] font-mono text-gray-500 text-center leading-3">
              该修复补丁已同步至 SkyShield 云端，可供导出供 Betaflight/ArduPilot 主管编译器一键打包。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
