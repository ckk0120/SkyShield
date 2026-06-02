/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ReleaseVersion, TelemetryState } from "../types";
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, Zap, Plane, Wind, Flame } from "lucide-react";

interface FlightTesterProps {
  selectedVersion: ReleaseVersion;
}

export default function FlightTester({ selectedVersion }: FlightTesterProps) {
  const [testPhase, setTestPhase] = useState<"idle" | "calibration" | "arming" | "takeoff" | "hover" | "heavyThrottle" | "landing" | "crash">("idle");
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    time: 0,
    altitude: 0,
    pitch: 0,
    roll: 0,
    vibration: 0.1,
    motorTemps: [32, 32, 32, 32],
    rcSignal: 99,
    gpsLock: "RTK Fix",
    sensorStatus: { imu: "OK", compass: "OK", barometer: "OK", batteryStatus: "24.2V (6S 100%)" }
  });
  const [flightLogs, setFlightLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTest = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTestPhase("idle");
    setProgress(0);
    setTelemetry({
      time: 0,
      altitude: 0,
      pitch: 0,
      roll: 0,
      vibration: 0.05,
      motorTemps: [30, 30, 30, 30],
      rcSignal: 100,
      gpsLock: "RTK Fix",
      sensorStatus: { imu: "OK", compass: "OK", barometer: "OK", batteryStatus: "24.6V (100%)" }
    });
    setFlightLogs(["[SYSTEM] 无人机系统待命，就绪测试。"]);
  };

  useEffect(() => {
    resetTest();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedVersion]);

  const addLog = (msg: string) => {
    setFlightLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startTest = () => {
    if (testPhase !== "idle") {
      resetTest();
    }
    setTestPhase("calibration");
    setProgress(0);
    addLog(`[⚡] 开始起飞前诊断程序：搭载 [${selectedVersion.tag}] 固件...`);
  };

  useEffect(() => {
    if (testPhase === "idle") return;

    let localProgress = 0;
    const isv405 = selectedVersion.id === "rel_1";
    const isv412 = selectedVersion.id === "rel_2";
    const isv430 = selectedVersion.id === "rel_3";

    intervalRef.current = setInterval(() => {
      localProgress += 2.5; // 每 50ms 走 2.5% -> 每个大阶段自选跳变
      setProgress(Math.min(localProgress, 100));

      setTelemetry((prev) => {
        const nextTime = Math.round((prev.time + 0.05) * 100) / 100;
        let alt = prev.altitude;
        let r = prev.roll;
        let p = prev.pitch;
        let vib = prev.vibration;
        let temps = [...prev.motorTemps];
        let rc = prev.rcSignal;
        let sensorIMU = prev.sensorStatus.imu;
        let sensorCompass = prev.sensorStatus.compass;

        // 根据测试时间点，推进不同阶段
        if (localProgress < 15) {
          // Calibration (0% - 15%)
          if (testPhase !== "calibration") {
            setTestPhase("calibration");
            addLog("[校验] 正在读取底层IMU陀螺仪偏置、加速度计对齐参数...");
          }
          vib = 0.05 + Math.random() * 0.02;
          temps = temps.map(t => t + 0.1);
        } 
        else if (localProgress >= 15 && localProgress < 30) {
          // Arming (15% - 30%)
          if (isv430) {
            // Betaflight v4.3.0 crashes at arming because of timer collision!
            setTestPhase("crash");
            if (intervalRef.current) clearInterval(intervalRef.current);
            addLog("🚨 [ERROR] 飞控检测到 TIM3 寄存器在 DShot 配置中死锁！3号定时器无安全通道。");
            addLog("🚨 [CRASH] 解锁时硬件产生电调(ESC)过置流保护！3号电机停止响应并瞬间爆鸣冒烟！");
            sensorIMU = "FAIL";
            sensorCompass = "FAIL";
            return {
              ...prev,
              time: nextTime,
              vibration: 2.5,
              motorTemps: [45, 42, 120, 38], // M3 is burning!
              sensorStatus: { ...prev.sensorStatus, imu: "FAIL", compass: "FAIL" }
            };
          }

          if (testPhase !== "arming") {
            setTestPhase("arming");
            addLog("[解锁] 解锁开关已拨(ARM)。电机进入1000us基础怠速，电调输出正常。");
          }
          vib = 0.15 + Math.random() * 0.05;
          temps = temps.map(t => t + 0.3);
        } 
        else if (localProgress >= 30 && localProgress < 55) {
          // Takeoff (30% - 55%)
          if (testPhase !== "takeoff") {
            setTestPhase("takeoff");
            addLog("[爬升] 油门拉升。电机均值PWM达到1450us，机体垂直爬升至5.0米...");
          }
          // Climb altitude
          alt = Math.min(5, alt + 0.25);
          vib = 0.3 + Math.random() * 0.15;
          // Motor temps increase under load
          temps = temps.map(t => t + 0.8);
          p = Math.sin(nextTime * 3) * 1.5; // Slight normal tilt
          r = Math.cos(nextTime * 3) * 1.0;
        } 
        else if (localProgress >= 55 && localProgress < 80) {
          // Hover and Heavy Throttle (55% - 80%)
          if (testPhase !== "heavyThrottle" && testPhase !== "hover") {
            setTestPhase(isv412 ? "heavyThrottle" : "hover");
            addLog(
              isv412 
              ? "⚠️ [极限打杆] 进入高负载横滚指令输入。IMU高频无校验缺陷开始暴露！" 
              : "⭐ [悬停] 姿态机动测试。输入50%最大倾斜、航向修正。信号完美闭环。"
            );
          }

          // If v4.1.2, telemetry will start oscillating severely!
          if (isv412) {
            vib = 0.8 + Math.random() * 0.4; // High vibration
            p = Math.sin(nextTime * 8) * (8 + (localProgress - 55) * 0.8); // exponential wobble
            r = Math.cos(nextTime * 9) * (6 + (localProgress - 55) * 0.6);
            temps[0] += 1.2;
            temps[1] += 1.1;
            temps[2] += 1.6; // Motor imbalance
            temps[3] += 1.0;
            sensorIMU = "DRIFT";
            if (localProgress > 72) {
              addLog("⚠️ [ALERT] 检测到 IMU 存在累计温漂噪声 & SPI读缓存溢出。飞机发生剧烈点头颤动！");
            }
          } else {
            alt = 5.0 + Math.sin(nextTime) * 0.1;
            p = Math.sin(nextTime * 2) * 2;
            r = Math.cos(nextTime * 1.5) * 1.5;
            vib = 0.25 + Math.random() * 0.08;
            temps = temps.map(t => t + 0.4);
          }
        } 
        else if (localProgress >= 80 && localProgress < 100) {
          // Landing (80% - 100%)
          if (isv412) {
            // v4.1.2 survives but safely warning on high drift
            if (testPhase !== "landing") {
              setTestPhase("landing");
              addLog("[报警降落] 姿态计算大幅漂移，触发保护性自动迫降。");
            }
            alt = Math.max(0, alt - 0.15);
            vib = 0.5 + Math.random() * 0.2;
            p = p * 0.8;
            r = r * 0.8;
          } else {
            // v4.0.5 landing smoothly
            if (testPhase !== "landing") {
              setTestPhase("landing");
              addLog("[降落] 模拟测试完美圆满。飞机降低转速，平稳着陆。");
            }
            alt = Math.max(0, alt - 0.25);
            vib = 0.12;
            p = 0;
            r = 0;
          }
        } 
        else if (localProgress >= 100) {
          // Complete
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (isv412) {
            addLog("[完成] 地面迫降完成。电机停止，检测到传感器存在强烈偏差错误，不建议起飞。");
          } else {
            addLog("[完成] 试飞诊断全部合格！软件与底层硬件控制逻辑完全契合！");
          }
        }

        return {
          time: nextTime,
          altitude: Math.round(alt * 100) / 100,
          pitch: Math.round(p * 100) / 100,
          roll: Math.round(r * 100) / 100,
          vibration: Math.round(vib * 100) / 100,
          motorTemps: temps.map(t => Math.round(t * 10) / 10),
          rcSignal: rc,
          gpsLock: prev.gpsLock,
          sensorStatus: {
            ...prev.sensorStatus,
            imu: sensorIMU,
            compass: sensorCompass
          }
        };
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testPhase, selectedVersion]);

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 to-[#0B0F19] p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Plane className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-gray-100 flex items-center gap-2">
              🛫 核心物理验证：SkyShield 虚拟真机起飞推断系统
            </h3>
            <p className="text-xs text-gray-400">
              将因果拓扑 $n \to n+1$ 维度推断翻译为直观的起飞机动，解决学术模型晦涩难懂问题
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">当前被载固件:</span>
          <span className="px-2 py-0.5 rounded bg-gray-800 text-xs font-mono text-teal-400 border border-teal-500/20">
            {selectedVersion.tag.split(" ")[0]}
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Control Panel / Visual 3D Position */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800/80 flex flex-col items-center">
            <span className="text-xs text-gray-400 self-start mb-2 font-mono">✈️ 无人机姿态动态仿真仪</span>
            
            {/* Visual Artificial Horizon (Gyroscopic Pitch/Roll Indicator) */}
            <div className="relative w-44 h-44 rounded-full border-4 border-gray-800 bg-[#0F1D36] overflow-hidden shadow-inner flex items-center justify-center">
              {/* Sky and Ground partition reflecting pitch/roll */}
              <div 
                className="absolute w-80 h-80 transition-transform duration-100"
                style={{
                  transform: `rotate(${telemetry.roll}deg) translateY(${telemetry.pitch * 3}px)`,
                  background: 'linear-gradient(to bottom, #2563EB 50%, #78350F 50%)'
                }}
              />
              {/* Center pointer lines */}
              <div className="absolute inset-0 flex items-center justify-between px-6 z-10 pointers-none">
                <div className="w-8 h-1 bg-yellow-500 rounded" />
                <div className="w-3 h-3 border-2 border-yellow-500 rounded-full bg-red-500" />
                <div className="w-8 h-1 bg-yellow-500 rounded" />
              </div>

              {/* Angle ticks */}
              <div className="absolute top-2 text-[10px] font-mono text-white/70 z-10 bg-slate-900/80 px-1.5 rounded">
                R: {telemetry.roll}°
              </div>
              <div className="absolute bottom-2 text-[10px] font-mono text-white/70 z-10 bg-slate-900/80 px-1.5 rounded">
                P: {telemetry.pitch}°
              </div>

              {/* Overlay elements under crash conditions */}
              {testPhase === "crash" && (
                <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center z-20 animate-fade-in">
                  <Flame className="w-8 h-8 text-red-500 animate-bounce" />
                  <span className="text-xs font-mono font-bold text-red-400 mt-1 uppercase tracking-wider">
                    HARDWARE DEADLOCK
                  </span>
                </div>
              )}
            </div>

            {/* Altitude slider feedback */}
            <div className="w-full mt-4 bg-gray-950 p-2.5 rounded border border-gray-800 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                高度上限 (5.0m):
              </span>
              <span className="text-sm font-mono font-bold text-teal-400">
                {telemetry.altitude} m
              </span>
            </div>
          </div>

          {/* Verification execution command buttons */}
          <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800 flex flex-col space-y-3">
            <span className="text-xs text-gray-300 font-sans font-medium">起飞诊断执行中枢</span>
            
            {/* Simulation Phase Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>当前阶段: 
                  <span className="text-teal-400 ml-1 uppercase font-bold">
                    {testPhase === "idle" && "未开始"}
                    {testPhase === "calibration" && "1. 传感器对齐校准"}
                    {testPhase === "arming" && "2. 电机怠速解锁"}
                    {testPhase === "takeoff" && "3. 油门加速升空"}
                    {testPhase === "hover" && "4. 悬停闭环自校"}
                    {testPhase === "heavyThrottle" && "4. 极限侧风高负载"}
                    {testPhase === "landing" && "5. 安全返航降落"}
                    {testPhase === "crash" && "❌ 硬件死锁崩溃"}
                  </span>
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${
                    testPhase === "crash" 
                    ? "bg-red-500" 
                    : testPhase === "heavyThrottle" || testPhase === "landing" && selectedVersion.id === "rel_2"
                    ? "bg-amber-500"
                    : "bg-teal-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-start-test-flight"
                onClick={startTest}
                className="py-2.5 px-3 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-teal-500/10"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                虚拟试飞验证
              </button>
              <button
                id="btn-reset-test-flight"
                onClick={resetTest}
                className="py-2.5 px-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-sans text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                复位就绪
              </button>
            </div>
          </div>
        </div>

        {/* Center Live Instruments (Gauge & Bar trackers) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Telemetry Panel A: Sensor Bus */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/60 space-y-2.5">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              飞控底层时钟和总线状态
            </span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-800/40">
                <span className="text-gray-400 font-mono">IMU姿态传感器</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  telemetry.sensorStatus.imu === "OK" 
                  ? "bg-teal-950 text-teal-400 border border-teal-500/20"
                  : telemetry.sensorStatus.imu === "DRIFT"
                  ? "bg-amber-950 text-amber-400 border border-amber-500/20"
                  : "bg-red-950 text-red-400 border border-red-500/20"
                }`}>
                  {telemetry.sensorStatus.imu}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-800/40">
                <span className="text-gray-400 font-mono">电子罗盘总线</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  telemetry.sensorStatus.compass === "OK"
                  ? "bg-teal-950 text-teal-400 border border-teal-500/20"
                  : "bg-red-950 text-red-500 border border-red-500/20"
                }`}>
                  {telemetry.sensorStatus.compass}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-gray-800/40">
                <span className="text-gray-400 font-mono">系统电池电压</span>
                <span className="font-mono text-gray-300">{telemetry.sensorStatus.batteryStatus}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400 font-mono">GPS定位锁</span>
                <span className="font-mono text-teal-400 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {telemetry.gpsLock}
                </span>
              </div>
            </div>
            
            {/* System Jitter Bar */}
            <div className="pt-2 border-t border-gray-800">
              <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                <span>IMU杂音频频漂移率</span>
                <span className={telemetry.vibration > 0.6 ? "text-amber-400" : "text-teal-400"}>
                  {telemetry.vibration} g-vibe
                </span>
              </div>
              <div className="h-1 bg-gray-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${
                    telemetry.vibration > 1.0 
                    ? "bg-red-500" 
                    : telemetry.vibration > 0.5 
                    ? "bg-amber-500" 
                    : "bg-teal-500"
                  }`}
                  style={{ width: `${Math.min(100, telemetry.vibration * 80)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Telemetry Panel B: Motor ESC Output */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/60 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" />
              四轴电机脉宽电调输出(ESC)
            </span>

            <div className="grid grid-cols-2 gap-2 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const temp = telemetry.motorTemps[idx];
                const isOutlier = (selectedVersion.id === "rel_3" && idx === 2) || (selectedVersion.id === "rel_2" && idx === 2 && testPhase === "heavyThrottle");
                
                return (
                  <div key={idx} className="bg-gray-950 p-2 rounded border border-gray-900">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-gray-400">电机 #{idx+1}</span>
                      <span className={isOutlier ? "text-red-400 animate-pulse font-bold" : "text-gray-500"}>
                        {temp}°C
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Simulating Pulse gauge indicator */}
                      <div className="w-full bg-gray-900 h-2 rounded overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-100 ${
                            isOutlier ? "bg-red-500 animate-pulse" : "bg-sky-500"
                          }`}
                          style={{
                            width: `${testPhase === "idle" ? 0 : isOutlier ? 100 : (testPhase === "calibration" ? 10 : (testPhase === "arming" ? 25 : (testPhase === "landing" ? 30 : 65 + (idx % 2 === 0 ? 5 : -5))))}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-gray-400 text-right mt-1">
                      {testPhase === "idle" ? "1000us" : isOutlier ? "65535us!!(溢出)" : `${1000 + (testPhase === "calibration" ? 0 : (testPhase === "arming" ? 100 : (testPhase === "landing" ? 150 : 450 + (idx % 2 === 0 ? 30 : -20))))}us`}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-[9px] font-mono text-gray-400 bg-gray-950/60 p-1 rounded border border-gray-800/40 text-center">
              DShot-D2 (1.2MHz) 时钟波特通道
            </div>
          </div>

          {/* Real-time System Debug Console Terminal Logger */}
          <div className="col-span-2 bg-gray-950 p-3 rounded-lg border border-gray-800 text-left font-mono min-h-36 max-h-36 flex flex-col justify-between">
            <span className="text-[10px] text-teal-400 border-b border-gray-800 pb-1 flex items-center justify-between">
              <span>🖥️ 航空诊断端状态日志 (REAL-TIME UAV DIAGNOSTIC TERMINAL)</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </span>
            
            <div className="overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-gray-800 text-[11px] text-gray-300 space-y-1 my-1.5 flex-grow font-mono">
              {flightLogs.map((log, index) => (
                <div key={index} className="leading-5">
                  {log.includes("🚨") || log.includes("FAIL") ? (
                    <span className="text-red-400 font-semibold">{log}</span>
                  ) : log.includes("⚠️") || log.includes("ALERT") ? (
                    <span className="text-amber-400 font-semibold">{log}</span>
                  ) : log.includes("✅") || log.includes("[完成]") ? (
                    <span className="text-teal-400 font-semibold">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Layperson-friendly Verdict & Explanations */}
        <div className="lg:col-span-3 bg-gray-900/40 p-4 rounded-lg border border-gray-800 flex flex-col justify-between">
          <div className="space-y-3.5">
            <span className="text-xs text-gray-400 font-sans font-medium uppercase tracking-wider block border-b border-gray-800 pb-1.5">
              ⚖️ 天空合规起飞裁决书
            </span>

            {/* Big Verdict Indicator */}
            {selectedVersion.flightTestOutcome.canTakeoff ? (
              <div className={`p-3 rounded-lg border flex items-start space-x-2.5 ${
                selectedVersion.id === "rel_2"
                ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                : "bg-teal-950/40 border-teal-500/30 text-teal-200"
              }`}>
                {selectedVersion.id === "rel_2" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-sans font-bold text-sm">
                    {selectedVersion.id === "rel_2" ? "限飞警告起飞" : "绿色合规可起飞"}
                  </div>
                  <div className="text-[11px] text-gray-300 mt-1 leading-5">
                    {selectedVersion.id === "rel_2" 
                      ? "允许低负荷物理试飞，禁止开启大姿态横滚打杆及高振动黑匣子保存。"
                      : "各总线控制时间片处于健康时域，允许一切真机极限载荷测试。"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 rounded-lg flex items-start space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-sans font-bold text-sm">一票否决：绝对禁止起飞</div>
                  <div className="text-[11px] text-gray-300 mt-1 leading-5">
                    前置高危硬件定时器与DMA资源重合碰撞。起飞解锁极易直接引燃电机造成火灾事故！
                  </div>
                </div>
              </div>
            )}

            {/* Simple corrective guide */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-gray-400 font-sans font-medium">💡 普通人怎么看懂哪里有问题：</span>
              <div className="bg-gray-950/60 p-2.5 rounded border border-gray-800 text-[11px] text-gray-300 leading-relaxed font-sans">
                {selectedVersion.flightTestOutcome.detailedCrashScenario}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 space-y-1.5">
            <span className="text-[11px] text-amber-400 font-sans font-medium flex items-center gap-1">
              🛠️ 怎么修改缺陷以保障飞行：
            </span>
            <div className="text-[11px] leading-relaxed text-gray-300 font-sans">
              {selectedVersion.flightTestOutcome.laymanRemedy}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
