/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FirmwareFile {
  name: string;
  path: string;
  hwSubsystem: "SPI" | "I2C" | "UART" | "ISR" | "PWM" | "DMA" | "Flash";
  hwCodelines: number;
  hwComments: number;
  hwFuncCalls: number;
  academicComplexity: number; // academic entropy metric
  riskScore: number; // 0 to 100
  takeoffImplication: string; // Layman explanation of takeoff impact
  explanation: string; // Detail on the hardware/software coupling hotspot
  solution: string; // Layman action item on how to fix this
  hasHardwareBug: boolean;
}

export interface CodeSnippet {
  id: string;
  title: string;
  subsystem: string;
  code: string;
  semanticAnalysis: string;
  isHardwareDependent: boolean;
  takeoffSafetyImpact: string;
  remediationAction: string;
}

export interface CausalMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  causalWeight: number; // 0-1 represent impact factor
}

export interface CausalNode {
  id: string;
  label: string;
  type: "metric" | "intermediate" | "outcome";
  value: string | number;
  riskRating: "low" | "medium" | "high";
}

export interface CausalLink {
  source: string;
  target: string;
  weight: number;
}

export interface ReleaseVersion {
  id: string;
  tag: string;
  system: "ArduPilot" | "Betaflight";
  safetyScore: number;
  activeRiskLevel: "SAFE" | "WARNING" | "TAKEOFF_DENIED";
  statusDescription: string;
  causalInsights: string[];
  metrics: CausalMetric[];
  graphNodes: CausalNode[];
  graphLinks: CausalLink[];
  flightTestOutcome: {
    canTakeoff: boolean;
    failPhase: "None" | "Calibration" | "Arming" | "Hover" | "HeavyThrottle";
    failReason: string;
    laymanRemedy: string;
    detailedCrashScenario: string;
  };
}

export interface TelemetryState {
  time: number;
  altitude: number;
  pitch: number;
  roll: number;
  vibration: number;
  motorTemps: number[];
  rcSignal: number;
  gpsLock: "RTK Fix" | "GPS Lock" | "Sats Searching" | "No Lock";
  sensorStatus: {
    imu: "OK" | "DRIFT" | "FAIL";
    compass: "OK" | "LOCK_ERR" | "FAIL";
    barometer: "OK" | "ERR";
    batteryStatus: string;
  };
}
