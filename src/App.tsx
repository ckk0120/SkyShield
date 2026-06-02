/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import ScannerModule from "./components/ScannerModule";
import ClassifierModule from "./components/ClassifierModule";
import CompassModule from "./components/CompassModule";
import { ShieldCheck, HardDrive, Compass, Cpu, Clock, Activity, AlertTriangle, Play, Sun, Moon } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"scanner" | "classifier" | "compass">("compass");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div className={`min-h-screen bg-[#070A13] text-gray-200 font-sans flex flex-col justify-between transition-colors duration-300 ${theme === "light" ? "light-theme" : ""}`}>
      
      {/* Top Main Navigation Header Banner */}
      <header className="bg-gradient-to-r from-[#0E1528] to-[#070A13] border-b border-gray-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3.5">
            {/* Interactive Animated Logo */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-gray-100 tracking-tight leading-tight flex items-center gap-1.5 md:text-lg">
                SkyShield 航盾 
                <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded font-mono font-bold border border-sky-500/10">
                  UAV V4.1
                </span>
              </span>
              <span className="text-[10.5px] text-gray-400 font-sans">
                双用途无人机固/硬件协同监管缺陷预警平台 · 国创赛答辩系统
              </span>
            </div>
          </div>

          {/* Right Header Navigation - Metadata & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Clock / System status metadata (Simplifies cockpit style with no telemetry-larp) */}
            <div className="hidden md:flex items-center space-x-3 text-xs text-gray-400">
              <div className="flex items-center space-x-2 font-mono bg-gray-950/60 px-3 py-1.5 rounded border border-gray-800">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>系统时间 (UTC): 2026-06-02 13:29:21</span>
              </div>
              <div className="flex items-center space-x-2 font-mono bg-gray-950/60 px-3 py-1.5 rounded border border-gray-800">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>防护引擎: 静态安全闭环</span>
              </div>
            </div>

            {/* Dark & Light Theme Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-gray-950/60 hover:bg-slate-800 border border-gray-800 text-gray-300 hover:text-white cursor-pointer transition-all duration-200 flex items-center justify-center"
              title={theme === "dark" ? "切换至浅色模式" : "切换至深色模式"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Workstation */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top High-level Bento Overview Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827]/40 p-4 rounded-xl border border-gray-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-teal-950 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-sans block">平台防御级别</span>
              <strong className="text-sm font-sans font-bold text-gray-200">A级 物理拒溢防死锁</strong>
            </div>
          </div>

          <div className="bg-[#111827]/40 p-4 rounded-xl border border-gray-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-sky-950 text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-sans block">LLM 零温约束集</span>
              <strong className="text-sm font-sans font-bold text-gray-200">100% 词法自对齐清洗</strong>
            </div>
          </div>

          <div className="bg-[#111827]/40 p-4 rounded-xl border border-gray-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-amber-950 text-amber-500">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-sans block">因果分析引擎</span>
              <strong className="text-sm font-sans font-bold text-gray-200">DiBS 动态贝叶斯装载</strong>
            </div>
          </div>

          <div className="bg-[#111827]/40 p-4 rounded-xl border border-gray-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-purple-950 text-purple-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-sans block">起飞机动验证仪</span>
              <strong className="text-sm font-sans font-bold text-gray-200">仿真空中航迹闭环</strong>
            </div>
          </div>
        </div>

        {/* Tab Selection Switches (Centered) */}
        <div className="flex justify-center w-full">
          <div className="bg-slate-950/85 p-1 rounded-xl border border-gray-800/80 flex flex-wrap items-center justify-center gap-1 w-full md:w-max">
            <button
              id="tab-compass"
              onClick={() => setActiveTab("compass")}
              className={`px-5 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "compass"
                  ? "bg-slate-800/90 text-[#FFF] shadow-md border-b border-amber-500/80"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-900/60"
              }`}
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>起飞罗盘与虚拟飞行</span>
            </button>
            
            <button
              id="tab-scanner"
              onClick={() => setActiveTab("scanner")}
              className={`px-5 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "scanner"
                  ? "bg-slate-800/90 text-[#FFF] shadow-md border-b border-sky-400/80"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>软硬交互热点扫描</span>
            </button>

            <button
              id="tab-classifier"
              onClick={() => setActiveTab("classifier")}
              className={`px-5 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === "classifier"
                  ? "bg-slate-800/90 text-[#FFF] shadow-md border-b border-blue-400/80"
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-900/60"
              }`}
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>底层函数语义分类</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Render area */}
        <div className="bg-[#0B0F19] rounded-2xl border border-gray-800/40 p-5 min-h-[500px]">
          {activeTab === "scanner" && <ScannerModule />}
          {activeTab === "classifier" && <ClassifierModule />}
          {activeTab === "compass" && <CompassModule />}
        </div>

      </main>

      {/* Elegant minimalist platform footer */}
      <footer className="bg-gray-950/60 border-t border-gray-800 py-6 text-center text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026-2027 SkyShield 航盾 · UAV Multi-Level Defense Center</span>
          <span className="flex items-center gap-1">
            本展示方案经过国创赛评委实用性升级：将深奥卡尔曼滤波、贝叶斯拓扑翻译为一键式
            <strong className="text-teal-400 font-semibold">物理起飞/坠落断言指示</strong>，极易上手看懂操作。
          </span>
        </div>
      </footer>

    </div>
  );
}
