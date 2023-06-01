import CPU from "./cpu";
import PPU from "./ppu";

class Clock {
  private slowClock = false;
  private TICKS_PER_FRAME = 89342;
  private isRunning = false;
  private frameCount = 0;
  private cycleCount = 0;
  private startTime = 0;
  private fps = 0;

  // debugging
  private logStats = true;

  private cpu: CPU;
  private ppu: PPU;
  constructor(cpu: CPU, ppu: PPU) {
    this.cpu = cpu;
    this.ppu = ppu;
  }

  public start() {
    this.startTime = Date.now();
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
    // this.cpu.reset();
    // this.ppu.reset();
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
    this.logStats && console.time("frame time:");
    while (i--) {
      this.tick();
      this.cycleCount++;
    }
    this.logStats && console.timeEnd("frame time:");
    this.frameCount++;
    this.logStats && console.log("Frame: ", this.cycleCount);
    this.logStats && console.log("Cycle: ", this.frameCount);
    this.fps = this.frameCount / ((Date.now() - this.startTime) / 1000);
    this.logStats && console.log("FPS: ", this.fps);
  }

  private tick() {
    if (this.cycleCount % 3 === 0) {
      this.cpu.tick();
    }
    this.ppu.tick();
  }

  private queueNextFrame() {
    if (this.slowClock) {
      setTimeout(() => this.run(), 200);
    } else {
      window.requestAnimationFrame(() => {
        this.run();
      });
    }
  }
}

export default Clock;
