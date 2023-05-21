import CPU from "./cpu";
import PPU from "./ppu";

class Clock {
  private TICKS_PER_FRAME = 89342;
  private isRunning = false;
  private frameCount = 0;
  private cycleCount = 0;

  // debugging
  private logStats = false;
  private fakeCPUcalls = 0;
  private fakePPUcalls = 0;

  private cpu: CPU;
  private ppu: PPU;
  constructor(cpu: CPU, ppu: PPU) {
    this.cpu = cpu;
    this.ppu = ppu;
  }

  public start() {
    this.isRunning = true;
    this.run();
  }

  public step() {
    this.tick();
    this.cycleCount++;
  }

  public stop() {
    this.isRunning = false;
  }

  public reset() {
    this.isRunning = false;
    this.cycleCount = 0;
    // call cpu.reset() and ppu.reset() here too
  }

  private run() {
    try {
      this.cycleFrame();
    } catch (e) {
      this.stop();
      console.warn(e);
    } finally {
      this.isRunning && this.queueNextFrame();
    }
  }

  public cycleFrame() {
    let i = this.TICKS_PER_FRAME;
    this.logStats && console.time('frame time:');
    while (i--) {
        this.tick();
        this.cycleCount++;
    }
    this.logStats && console.timeEnd('frame time:');
    this.frameCount++;
    this.logStats && console.log("Frame: ", this.cycleCount);
    this.logStats && console.log("Cycle: ", this.frameCount);
    this.logStats && console.log("CPU: ", this.fakeCPUcalls);
    this.logStats && console.log("PPU: ", this.fakePPUcalls);
  }

  private tick() {
    if (this.cycleCount % 3 === 0) {
      this.cpu.tick();
      this.fakeCPUcalls++;
    }
    this.ppu.tick();
    this.fakePPUcalls++;
  }

  private queueNextFrame() {
    window.requestAnimationFrame(() => {
      this.run();
    });
  }
}


export default Clock;