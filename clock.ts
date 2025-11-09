import CPU from "./cpu";
import PPU from "./ppu";
import APU from "./apu";

class Clock {
  private readonly NATIVE_NES_MS_PER_FRAME = 1000.0 / (21477272 / 4 / 89342.0)
  private slowClock = false;
  private TICKS_PER_FRAME = 89342;
  private isRunning = false;
  private frameCount = 0;
  private cycleCount = 0;
  private startTime = 0;
  private fps = 0;

  private speedFactor: number = 1.0;
  private lastTime: number = 0;
  private timeAccumulator: number = 0;

  // debugging
  private logStats = true;

  private cpu: CPU;
  private ppu: PPU;
  private apu: APU;
  constructor(cpu: CPU, ppu: PPU, apu: APU) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
  }

  public setSpeed(factor: number) {
    if (factor > 0) {
      this.speedFactor = factor;
    }
  }

  public start() {
    this.startTime = Date.now();
    this.isRunning = true;
    this.lastTime = 0; 
    this.timeAccumulator = 0;
    window.requestAnimationFrame(this.run.bind(this));
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

private run(timestamp: number) {
    if (!this.isRunning) {
      return;
    }

    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.timeAccumulator += deltaTime;
    const msPerFrame = this.NATIVE_NES_MS_PER_FRAME / this.speedFactor;

    while (this.timeAccumulator >= msPerFrame) {
      try {
        this.cycleFrame(); //
      } catch (e) {
        this.stop(); //
        console.warn(e);
        return; // Stop the loop on error
      }
      this.timeAccumulator -= msPerFrame;
    }

    this.fps = this.frameCount / ((Date.now() - this.startTime) / 1000); //

    window.requestAnimationFrame(this.run.bind(this));
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

  public getFrameRate() {
    return this.fps;
  }

  private tick() {
    if (this.cycleCount % 3 === 0) {
      this.cpu.tick();
      this.apu.tick();
    }
    this.ppu.tick();
  }

  // private queueNextFrame() {
  //   if (this.slowClock) {
  //     setTimeout(() => this.run(), 200);
  //   } else {
  //     window.requestAnimationFrame(() => {
  //       this.run();
  //     });
  //   }
  // }
}

export default Clock;
