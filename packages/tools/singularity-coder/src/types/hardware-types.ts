// Type declarations for optional hardware detection dependencies

declare module 'os-utils' {
    ')  export function cpuUsage(callback:(usage: number) => void): void;
  export function freemem():number;
  export function totalmem():number;
  export function freememPercentage():number;
  export function freeCommand(callback:(free: string) => void): void;
  export function harddrive(
    callback:(free: number, used:number, total:number) => void
  ):void;
  export function getProcesses(callback:(processes: any[]) => void): void;
  export function allLoadavgs():number[];
  export function loadavg(period?:number): number;
  export function platform():string;
  export function cpuCount():number;
  export function sysUptime():number;
  export function processUptime():number;
}

declare module 'systeminformation' {
    ')  export interface CpuInfo {
    brand:string;
    cores:number;
    speed:number;
    manufacturer:string;
    family:string;
    model:string;
    stepping:string;
    revision:string;
    voltage:string;
    speedmin:number;
    speedmax:number;
    governor:string;
    cache:{
      l1d:number;
      l1i:number;
      l2:number;
      l3:number;
};
    physicalCores:number;
    processors:number;
    socket:string;
    flags:string;
}

  export interface MemInfo {
    total:number;
    free:number;
    used:number;
    active:number;
    available:number;
    buffcache:number;
    swaptotal:number;
    swapused:number;
    swapfree:number;
}

  export interface GraphicsController {
    vendor:string;
    model:string;
    bus:string;
    vram:number;
    vramDynamic:boolean;
    pciID:string;
    driverVersion:string;
    name:string;
    pciBus:string;
    memoryTotal:number;
    memoryUsed:number;
    memoryFree:number;
    utilizationGpu:number;
    utilizationMemory:number;
    temperatureGpu:number;
    fanSpeed:number;
    powerDraw:number;
    clockCore:number;
    clockMemory:number;
}

  export interface GraphicsInfo {
    controllers:GraphicsController[];
    displays:any[];
}

  export interface SystemInfo {
    manufacturer:string;
    model:string;
    version:string;
    serial:string;
    uuid:string;
    sku:string;
    virtual:boolean;
}

  export function cpu():Promise<CpuInfo>;
  export function mem():Promise<MemInfo>;
  export function graphics():Promise<GraphicsInfo>;
  export function system():Promise<SystemInfo>;
  export function cpuCurrentspeed():Promise<{
    avg:number;
    min:number;
    max:number;
    cores:number[];
}>;
  export function cpuTemperature():Promise<{
    main:number;
    cores:number[];
    max:number;
    socket:number[];
    chipset:number;
}>;
  export function currentLoad():Promise<{
    avgload:number;
    currentload:number;
    currentload_user:number;
    currentload_system:number;
    currentload_nice:number;
    currentload_idle:number;
    currentload_irq:number;
    raw_currentload:number;
    raw_currentload_user:number;
    raw_currentload_system:number;
    raw_currentload_nice:number;
    raw_currentload_idle:number;
    raw_currentload_irq:number;
    cpus:any[];
}>;
}
