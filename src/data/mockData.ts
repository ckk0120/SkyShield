/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FirmwareFile, CodeSnippet, ReleaseVersion } from "../types";

export const ARDUPILOT_FILES: FirmwareFile[] = [
  {
    name: "AP_InertialSensor_Invensense.cpp",
    path: "libraries/AP_InertialSensor/AP_InertialSensor_Invensense.cpp",
    hwSubsystem: "SPI",
    hwCodelines: 184,
    hwComments: 45,
    hwFuncCalls: 96,
    academicComplexity: 0.88,
    riskScore: 92,
    takeoffImplication: "⚠️ 强烈危险 (IMU数据抖动导致起飞即侧翻崩溃)",
    explanation: "由于SPI总线在高温下读取陀螺仪缓存出现位偏移，且没有滤波容错机制，将直接导致姿态解算出现50度以上的瞬间偏差。",
    solution: "在读取寄存器数据后，引入滑动中值滤波器 (Median Filter) 过滤毛刺，并添加校验和检验 (checksum validation)。",
    hasHardwareBug: true
  },
  {
    name: "Scheduler.cpp",
    path: "libraries/AP_HAL_ChibiOS/Scheduler.cpp",
    hwSubsystem: "ISR",
    hwCodelines: 125,
    hwComments: 32,
    hwFuncCalls: 54,
    academicComplexity: 0.92,
    riskScore: 85,
    takeoffImplication: "🛑 起飞拒绝 (中端嵌套失控导致失去遥控锁死)",
    explanation: "当高度计和GPS同时触发中断处理时，嵌套优先级设置不当会导致遥控器接收程序中断被挂起，无法起飞或空中失联。",
    solution: "重新设定 ChibiOS 硬件中断优先级向量：将 RC 接收中断 (SPI/UART) 加高为 2级，传感器读取中断降为 5级。",
    hasHardwareBug: true
  },
  {
    name: "AP_MotorsMatrix.cpp",
    path: "libraries/AP_Motors/AP_MotorsMatrix.cpp",
    hwSubsystem: "PWM",
    hwCodelines: 220,
    hwComments: 18,
    hwFuncCalls: 40,
    academicComplexity: 0.62,
    riskScore: 28,
    takeoffImplication: "✅ 正常起飞 (高度安全，无硬件冲突)",
    explanation: "虽然该文件实现了多旋翼桨叶动力矩阵映射，但它是纯算术乘加运算，不涉及对微控制器底层时钟及GPIO的直接侵入式修改。",
    solution: "无需紧急改动。保持周期性软件逻辑静态扫描即可。",
    hasHardwareBug: false
  },
  {
    name: "AP_Baro_MS5611.cpp",
    path: "libraries/AP_Baro/AP_Baro_MS5611.cpp",
    hwSubsystem: "I2C",
    hwCodelines: 92,
    hwComments: 24,
    hwFuncCalls: 38,
    academicComplexity: 0.74,
    riskScore: 71,
    takeoffImplication: "⚠️ 次级警告 (气压计死锁导致高度保持失效坠落)",
    explanation: "I2C总线读取气压计温漂校正值时，若遭遇电磁脉冲杂音，由于无硬件看门狗超时闭环，总线会永远在 while(!I2C_Ready) 死循环。",
    solution: "在所有 `while` 检测底层寄存器忙状态时，添加循环计数计时：超时 2ms 则执行 I2C 总线自动硬重置 (Bus Reset)。",
    hasHardwareBug: true
  },
  {
    name: "AP_GPS_UBLOX.cpp",
    path: "libraries/AP_GPS/AP_GPS_UBLOX.cpp",
    hwSubsystem: "UART",
    hwCodelines: 146,
    hwComments: 28,
    hwFuncCalls: 62,
    academicComplexity: 0.68,
    riskScore: 64,
    takeoffImplication: "🟡 安全隐患 (RTK精细定位包丢失导致搜星变慢)",
    explanation: "串口波特率配置在 460800 时，DMA 接收环形缓冲区太小 (128字节)，在飞控满负载时会溢出，丢弃RTK修正差分数据包。",
    solution: "将接收缓冲区扩容到 512 字节，并开启流控 (RTS/CTS) 防缓冲区溢出。",
    hasHardwareBug: false
  },
  {
    name: "AP_NavEKF3_Core.cpp",
    path: "libraries/AP_NavEKF3/AP_NavEKF3_Core.cpp",
    hwSubsystem: "DMA",
    hwCodelines: 310,
    hwComments: 80,
    hwFuncCalls: 22,
    academicComplexity: 0.95,
    riskScore: 19,
    takeoffImplication: "✅ 正常起飞 (算法数学闭环，不涉及底层竞争)",
    explanation: "作为卡尔曼滤波的核心实现，由于代码全部使用标准内存堆栈做矩阵迭代计算，其硬件交互几乎为零，非常安全稳定。",
    solution: "不需要调整硬件操作逻辑，只要防止内存过度分配触发堆栈破坏 (Stack Overflow) 即可。",
    hasHardwareBug: false
  }
];

export const BETAFLIGHT_FILES: FirmwareFile[] = [
  {
    name: "rx.c",
    path: "src/main/rx/rx.c",
    hwSubsystem: "UART",
    hwCodelines: 160,
    hwComments: 19,
    hwFuncCalls: 85,
    academicComplexity: 0.82,
    riskScore: 89,
    takeoffImplication: "🛑 起飞拒绝 (接收机断连导致瞬间失控射桨)",
    explanation: "串口接收多协议遥控数据时，缺少死区超时信号看门狗机制，当外部强电磁干扰导致1个包乱码，指针容易溢出内存越界。",
    solution: "增加死区时间判断，100ms 无信号输入直接通过硬件定时器触发安全硬返航/怠速停桨动作，指针范围加严边界约束。",
    hasHardwareBug: true
  },
  {
    name: "bus_spi.c",
    path: "src/main/drivers/bus_spi.c",
    hwSubsystem: "SPI",
    hwCodelines: 138,
    hwComments: 14,
    hwFuncCalls: 90,
    academicComplexity: 0.85,
    riskScore: 78,
    takeoffImplication: "⚠️ 强烈危险 (黑匣子高频写入抢占SPI总线导致闪断)",
    explanation: "由于IMU采样与板载Flash高速写入共用了硬件SPI的DMA传输寄存器，高负荷下造成IMU传感器数据传输时钟间断，姿态偏航。",
    solution: "分配不同的DMA通道，或将闪存和陀螺仪的读取强制设计成严格互斥锁排队传输逻辑。",
    hasHardwareBug: true
  },
  {
    name: "pid.c",
    path: "src/main/flight/pid.c",
    hwSubsystem: "PWM",
    hwCodelines: 245,
    hwComments: 20,
    hwFuncCalls: 45,
    academicComplexity: 0.79,
    riskScore: 42,
    takeoffImplication: "✅ 正常起飞 (动力控制链闭环，低频风险)",
    explanation: "主要是PID参数积分微分计算和D-term高频截止低通滤波，虽有浮点性能高开销，但是不会导致底层总线卡死。",
    solution: "优化浮点整型互转指令，并使用高效 FPU 硬件加速器提升循环执行频率。",
    hasHardwareBug: false
  },
  {
    name: "timer.c",
    path: "src/main/drivers/timer.c",
    hwSubsystem: "ISR",
    hwCodelines: 104,
    hwComments: 35,
    hwFuncCalls: 70,
    academicComplexity: 0.90,
    riskScore: 88,
    takeoffImplication: "🛑 起飞拒绝 (电机时钟定时器引脚冲突导致停转坠落)",
    explanation: "在四轴电机的高频 DShot600 控制中，DMA和硬件定时器触发引脚通道发生内部冲突，可能导致起飞时 3号电机突然停机。",
    solution: "在底层时钟分频器映射表中重新分立通道，禁止电机 DMA 通道重映射到遥控器捕获端口上。",
    hasHardwareBug: true
  }
];

export const MOCK_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: "sn_imu",
    title: "GYRO_SPI_READ - 陀螺仪SPI底层读取与零点校准",
    subsystem: "SPI / 交互通信类",
    code: `// 读取 InvenSense MPU6050 
void read_gyro_data(int16_t *gyro_out) {
    uint8_t buffer[6];
    
    // 拉低 Chip Select 片选信号，开启SPI总线读取
    SPI_CS_LOW(); 
    
    SPI_Transfer(MPU6050_GYRO_OUT_REG | 0x80); // 读操作指令
    for(int i = 0; i < 6; i++) {
        buffer[i] = SPI_Transfer(0x00); // 连续同步时钟读取
    }
    
    SPI_CS_HIGH(); // 拉高复位CS
    
    // 底层二进制移位拼接
    gyro_out[0] = (int16_t)((buffer[0] << 8) | buffer[1]);
    gyro_out[1] = (int16_t)((buffer[2] << 8) | buffer[3]);
    gyro_out[2] = (int16_t)((buffer[4] << 8) | buffer[5]);
    
    // ⚠️ 隐患：如果SPI信号线有瞬时强电磁干扰，高八位溢出可能使数据突变突减100倍！
    // 缺少传感器校准漂移溢出和中值差分滤波安全断言。
}`,
    semanticAnalysis: "【大模型智能语义识别】该源码对物理寄存器执行了直接移位合并。该移位具有高硬件依赖性 (DMA、寄存器缓存对齐)，在SPI噪声脉冲射频干扰下存在重大硬件敏感缺陷。移位高8位拼接缺乏边界防卷绕阈值过滤。",
    isHardwareDependent: true,
    takeoffSafetyImpact: "❌ 飞行隐患强烈：SPI总线出现电磁干扰时，陀螺仪数据会突变，造成姿态解算程序瞬间输出极端指令，电机反向射力导致起飞发生180°剧烈侧空翻并断桨崩溃！",
    remediationAction: "使用差分阈值检验，突变温差偏航超过 1500°/s 的值直接丢弃，强制保持上一次有效帧，并输出警告信号。"
  },
  {
    id: "sn_scheduler",
    title: "ISR_TRIGGER - 高频中断调度与空载时间分配",
    subsystem: "ISR / 中断并发类",
    code: `// MPU6050 硬件中断标志响应，高频1kHz触发
void EXTI0_IRQHandler(void) {
    if (__HAL_GPIO_EXTI_GET_IT(GPIO_PIN_0) != RESET) {
        __HAL_GPIO_EXTI_CLEAR_IT(GPIO_PIN_0); // 清理中断悬挂
        
        // 调度姿态控制环路
        run_fast_attitude_loop();
        
        // ⚠️ 隐患：在中断服务函数里做耗时的递归或慢速阻塞
        if (g_serial_logger_active) {
            // 通过串口在中断里吐出128字节日志，会导致执行时间超时 800us 
            serial_write_buf_blocking(&debug_port, "IMU_INT_TRIGGERED", 17);
        }
    }
}`,
    semanticAnalysis: "【大模型智能语义识别】该函数属于底层硬件外部中断（EXTI0）。该代码属于高保真中断服务（ISR）。缺陷警告：在硬中断上下文中执行了阻塞式串行总线写入。此操作严重违背嵌入式实时的无阻塞约束，会触发死锁和中断抢占嵌套丢失。",
    isHardwareDependent: true,
    takeoffSafetyImpact: "🛑 起飞拒绝级：如果开启调试日志模式，在起飞测试时一旦陀螺仪触发1kHz中断，整机将陷入长达800us的串口硬时钟暂停。其他更低优先级的中断（例如RC遥控器指令接收、GPS高度传感器）将被阻塞，电机会因为接收不到控制指令而直接启动失控急停，无人机完全无法离地起飞！",
    remediationAction: "中断内禁止使用任何阻塞式(Blocking)同步串口写操作。应改用双缓冲区循环FIFO，将串行日志输出代码放到非中断的主循环(Main Loop)后台执行。"
  },
  {
    id: "sn_pid",
    title: "PID_MATH - 姿态控制环路纯数学运算",
    subsystem: "Algorithms / 软件算法类",
    code: `// 飞控姿态环 PID 位置控制计算
float calculate_pid(float target, float current, PID_State *state, float dt) {
    float error = target - current;
    
    state->integral += error * dt;
    // 限制积分上限防止积分饱和
    if (state->integral > state->max_i) state->integral = state->max_i;
    else if (state->integral < -state->max_i) state->integral = -state->max_i;
    
    float derivative = (error - state->last_error) / dt;
    state->last_error = error;
    
    float output = (state->kp * error) + (state->ki * state->integral) + (state->kd * derivative);
    return output;
}`,
    semanticAnalysis: "【大模型智能语义识别】该代码为标准软件控制理论中的PID算术实现。无中断触发，不涉及SPI/I2C/GPIO寄存器等物理操作，属于纯CPU运算层，硬件依赖性为：【0】。数学模型边界合理，没有直接的软硬冲突异常风险。",
    isHardwareDependent: false,
    takeoffSafetyImpact: "✅ 正常安全：纯算术软件层面。无论传感器状态如何，该部分代码自身不会触发操作系统硬锁，起飞安全性高。",
    remediationAction: "保持高精度双精度浮点运算（如果MCU支持硬浮点算力组），定期做零除数防护检测即可。"
  },
  {
    id: "sn_gpio_motor",
    title: "GPIO_PWM_SET - 直接控制电机ESC电子调速引脚",
    subsystem: "PWM / 执行输出类",
    code: `// 写入PWM脉宽直接驱动电机底层极性
void set_motor_pulse_width(uint8_t channel, uint16_t pulse_us) {
    // 根据飞控板引脚重映射，直接写定时器时钟捕获寄存器(CCR)
    switch(channel) {
        case 0: TIM3->CCR1 = pulse_us; break;
        case 1: TIM3->CCR2 = pulse_us; break;
        case 2: TIM3->CCR3 = pulse_us; break;
        case 3: TIM3->CCR4 = pulse_us; break;
        default: break;
    }
    // ⚠️ 隐患：未在写控制寄存器前进行pulse_us限幅保护(1000us ~ 2000us)
    // 若 pulse_us 因代码逻辑异常被配置为零或极端大值65535，极易由于过流导致全机电机瞬间硬化烧坏!
}`,
    semanticAnalysis: "【大模型智能语义识别】涉及特指嵌入式微处理器定时器寄存器映射（TIM3->CCR）。该动作是极强的主力外设物理交互，硬件依赖性：【1】。未在硬件物理写操作之前进行严格限幅拦截，是物理防飞/防溢出的一大重大安全缺环。",
    isHardwareDependent: true,
    takeoffSafetyImpact: "❌ 重大起飞灾难：在无人机通电校准及按键“怠速解锁”时，如果飞控因为未初始化的脏内存在解锁瞬间传入脏数据(如 50000 脉宽)，定时器计数溢出将向电调(ESC)发送致命全频高压，会导致电机一落解锁便啸叫极速空转爆浆，甚至使锂电池放电倍率瞬间超载而引燃发热起火！",
    remediationAction: "在写入 TIM3->CCR 寄存器前加入硬件安全锁屏栅：\`pulse_us = constrain_value(pulse_us, 1000, 2000);\`，并且添加全局 `IS_ARMED` 有效飞行保护锁判定，不解锁时强制禁写硬件极性。"
  }
];

export const MOCK_RELIABLE_VERSIONS: ReleaseVersion[] = [
  {
    id: "rel_1",
    tag: "ArduPilot v4.0.5 (标准稳定版)",
    system: "ArduPilot",
    safetyScore: 92,
    activeRiskLevel: "SAFE",
    statusDescription: "绿色可起飞状态 - 经过2万公里极限真机试飞无任何软件引起的总线死锁突变汇报。",
    causalInsights: [
      "I2C与SPI通信采用分级非抢占式处理，不存在高速高频数据堆积引起的硬件时钟重置冲突。",
      "中断上下文中的串口日志输出已被剥离并下放到主后台环路，无阻塞星环发生。",
      "所有直接控制电机的外设CCR写动作都加有严格的安全看门狗边界拦截器。"
    ],
    metrics: [
      { name: "HW_Codeline (硬件交互代码量)", value: 420, unit: "行", description: "底层敏感操作总规模", causalWeight: 0.15 },
      { name: "A_Func_Total (总外随硬件调用深度)", value: 78, unit: "次/周期", description: "底层交互执行频率", causalWeight: 0.25 },
      { name: "hw_comments (硬件级安全策略注释)", value: 164, unit: "条", description: "说明文档与校准策略深度", causalWeight: -0.20 }, // 负权重意味着注释越多，风险越低
      { name: "exti_blocking_rate (中断时间延迟率)", value: 1.2, unit: "us", description: "硬中断平均长耗时动作", causalWeight: 0.40 }
    ],
    graphNodes: [
      { id: "A_Func", label: "硬件调用 (A_Func)", type: "metric", value: "78次", riskRating: "low" },
      { id: "Comment", label: "安全注释 (hw_comments)", type: "metric", value: "164条", riskRating: "low" },
      { id: "Latency", label: "中断延迟 (exti_blocking)", type: "metric", value: "1.2us", riskRating: "low" },
      { id: "BusDeadlock", label: "总线死锁几率", type: "intermediate", value: "0.03%", riskRating: "low" },
      { id: "SensorDrift", label: "IMU突变温漂", type: "intermediate", value: "2.1°", riskRating: "low" },
      { id: "Buggy", label: "缺陷判定 (Buggy_Label)", type: "outcome", value: "0 (完全无风险)", riskRating: "low" }
    ],
    graphLinks: [
      { source: "A_Func", target: "BusDeadlock", weight: 0.25 },
      { source: "Comment", target: "SensorDrift", weight: -0.20 },
      { source: "Latency", target: "BusDeadlock", weight: 0.40 },
      { source: "BusDeadlock", target: "Buggy", weight: 0.85 },
      { source: "SensorDrift", target: "Buggy", weight: 0.70 }
    ],
    flightTestOutcome: {
      canTakeoff: true,
      failPhase: "None",
      failReason: "无任何已知异常，软硬件处于纯净正交状态。",
      laymanRemedy: "一切状态极好！设备处于一等战备，气压计、姿态传感器、遥控链路与电调通路全部工作在最佳额定状态。可以尽情起飞测试！",
      detailedCrashScenario: "起飞过程：地面解锁正常 -> 开桨怠速转动，无异响震动 -> 稳步拉升至5米点悬停 -> 输入滚转命令动作利落 -> 完美原地返航降落。"
    }
  },
  {
    id: "rel_2",
    tag: "ArduPilot v4.1.2-beta3 (软硬件高负载体验版)",
    system: "ArduPilot",
    safetyScore: 59,
    activeRiskLevel: "WARNING",
    statusDescription: "橙色次级红色警报 - 该版本新增高频双向 DShot 陀螺仪谐振反馈读取，对电磁杂音耐受极差。",
    causalInsights: [
      "新增了高频IMU数据通道，将硬件总调用频率推升至180次/周期，容易挤占I2C主控制器。",
      "因果判定显示：因安全注释和校验注释并未同步跟进配置，开发工程师可能忽略了老主板对新高频传输时隙的时限宽容（因果权重-0.20处于失效悬空状态）。",
      "在极限侧风或极高振动下，IMU的突变漂移可能因数值积累被误判为物理俯仰动作。"
    ],
    metrics: [
      { name: "HW_Codeline (硬件交互代码量)", value: 680, unit: "行", description: "底层敏感操作总规模", causalWeight: 0.15 },
      { name: "A_Func_Total (总外随硬件调用深度)", value: 182, unit: "次/周期", description: "底层交互执行频率", causalWeight: 0.25 },
      { name: "hw_comments (硬件级安全策略注释)", value: 85, unit: "条", description: "说明文档与校准策略深度", causalWeight: -0.20 },
      { name: "exti_blocking_rate (中断时间延迟率)", value: 12.8, unit: "us", description: "硬中断平均长耗时动作", causalWeight: 0.40 }
    ],
    graphNodes: [
      { id: "A_Func", label: "硬件调用 (A_Func)", type: "metric", value: "182次", riskRating: "medium" },
      { id: "Comment", label: "安全注释 (hw_comments)", type: "metric", value: "85条", riskRating: "medium" },
      { id: "Latency", label: "中断延迟 (exti_blocking)", type: "metric", value: "12.8us", riskRating: "medium" },
      { id: "BusDeadlock", label: "总线死锁几率", type: "intermediate", value: "12.4%", riskRating: "medium" },
      { id: "SensorDrift", label: "IMU突变温漂", type: "intermediate", value: "12.5°", riskRating: "medium" },
      { id: "Buggy", label: "缺陷判定 (Buggy_Label)", type: "outcome", value: "0.42 (中危预警)", riskRating: "medium" }
    ],
    graphLinks: [
      { source: "A_Func", target: "BusDeadlock", weight: 0.45 },
      { source: "Comment", target: "SensorDrift", weight: -0.15 },
      { source: "Latency", target: "BusDeadlock", weight: 0.45 },
      { source: "BusDeadlock", target: "Buggy", weight: 0.85 },
      { source: "SensorDrift", target: "Buggy", weight: 0.70 }
    ],
    flightTestOutcome: {
      canTakeoff: true,
      failPhase: "Hover",
      failReason: "起飞悬停正常，但在强风或大幅机动时，IMU与电机高频交互DMA寄存器冲突，由于没有校验重试，会瞬间使桨叶转速发生1阶不均匀卡顿。",
      laymanRemedy: "可以起飞。但切勿开启高级物理定点定深度或黑匣子极限采样。此版本用于内场无振动环境测试，强烈不提倡在雷雨、极冷极热或高速航拍环境中使用，建议升级至最新的防御固件。",
      detailedCrashScenario: "起飞过程：地面解锁无异样 -> 离地平稳上升到2.5米 -> 开始左右机动模拟对风 -> 风阻加强时IMU温漂叠加电调信号重影，发生空中‘打滑’式轻微点头颤动。虽没有彻底倾覆，但姿态开始周期性缓慢偏航。"
    }
  },
  {
    id: "rel_3",
    tag: "Betaflight v4.3.0-rc1 (核心定时器锁死严重风险版)",
    system: "Betaflight",
    safetyScore: 18,
    activeRiskLevel: "TAKEOFF_DENIED",
    statusDescription: "红色危险不可起飞 - DShot600 控制冲突未解决。存在中断嵌套引起的心跳永久挂死风险。",
    causalInsights: [
      "因果雷达拓扑强烈预警：硬延迟时间（exti_blocking_rate）飙升至 89us 以上，极其致命！",
      "这引发了高达 94.6% 概率的总线时钟相互践踏，卡住主轮询状态计数机。",
      "在起飞前进行遥控拨杆解锁瞬间，或者起飞油门拉高到 40% 的高负荷瞬态，将不可避免地导致3号电机锁死断相，引发严重的地面空转冒烟，或者空中‘射桨、断连’事故。"
    ],
    metrics: [
      { name: "HW_Codeline (硬件交互代码量)", value: 920, unit: "行", description: "底层敏感操作总规模", causalWeight: 0.15 },
      { name: "A_Func_Total (总外随硬件调用深度)", value: 410, unit: "次/周期", description: "底层交互执行频率", causalWeight: 0.25 },
      { name: "hw_comments (硬件级安全策略注释)", value: 12, unit: "条", description: "说明文档与校准策略深度", causalWeight: -0.20 },
      { name: "exti_blocking_rate (中断时间延迟率)", value: 89.4, unit: "us", description: "硬中断平均长耗时动作", causalWeight: 0.40 }
    ],
    graphNodes: [
      { id: "A_Func", label: "硬件调用 (A_Func)", type: "metric", value: "410次", riskRating: "high" },
      { id: "Comment", label: "安全注释 (hw_comments)", type: "metric", value: "12条", riskRating: "high" },
      { id: "Latency", label: "中断延迟 (exti_blocking)", type: "metric", value: "89.4us", riskRating: "high" },
      { id: "BusDeadlock", label: "总线死锁几率", type: "intermediate", value: "94.6%", riskRating: "high" },
      { id: "SensorDrift", label: "IMU突变温漂", type: "intermediate", value: "45.1°", riskRating: "high" },
      { id: "Buggy", label: "缺陷判定 (Buggy_Label)", type: "outcome", value: "0.94 (特大缺陷警告)", riskRating: "high" }
    ],
    graphLinks: [
      { source: "A_Func", target: "BusDeadlock", weight: 0.75 },
      { source: "Comment", target: "SensorDrift", weight: -0.05 },
      { source: "Latency", target: "BusDeadlock", weight: 0.85 },
      { source: "BusDeadlock", target: "Buggy", weight: 0.85 },
      { source: "SensorDrift", target: "Buggy", weight: 0.70 }
    ],
    flightTestOutcome: {
      canTakeoff: false,
      failPhase: "Arming",
      failReason: "飞控触发起飞前电机校验错，3号电机对应的时钟定时器寄存器发生了未缓冲脏写，无法进行频率捕获。如果强制闭着眼睛解锁，3号电机会疯狂运转到极限甚至自燃，且完全不响应遥控器封桨切断指令！",
      laymanRemedy: "🚨 绝对静止起飞测试！！目前起飞检测为：一票否决(Takeoff Denied)！您必须在底层修复：在 `src/main/drivers/timer.c` 冲突表中将 3号引脚从 DMA1_Ch3 退锁。或者降级重新烧录稳定版 v4.0.5 固件，否则必坠无疑并可能导致物理烧机！",
      detailedCrashScenario: "解锁瞬间：遥控臂开关拨至 ARM -> 电机未响应一秒怠速 -> 突然 3号引擎发出高频刺耳嘶鸣声，飞控死锁卡进 HardFault 死循环，油门和急停开关完全失灵 -> 3号电机过热升温至120℃瞬间冒起青烟，高强电流击穿电调烧坏并彻底报废！"
    }
  }
];
