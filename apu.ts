import RAM from "./ram";

interface Channel {
  oscillator: OscillatorNode;
  gain: GainNode;
  dutyCycle: number;
  envelope: {
    enabled: boolean;
    loop: boolean;
    decay: number;
  };
  sweep: {
    enabled: boolean;
    period: number;
    negate: boolean;
    shift: number;
  };
  timer: number;
  lengthCounter: number;
}

interface Triangle {
  oscillator: OscillatorNode;
  gain: GainNode;
  linearCounter: number;
  linearCounterReloadValue: number;
  linearCounterControlFlag: boolean;
  timer: number;
  lengthCounter: number;
  linearCounterReload: boolean;
}

interface Noise {
  node: AudioBufferSourceNode;
  gain: GainNode;
  envelope: {
    enabled: boolean;
    loop: boolean;
    decay: number;
  };
  timerPeriod: number;
  mode: boolean; // false = 15-bit LFSR, true = 7-bit LFSR
  lengthCounter: number;
}

class APU {
  static readonly lengthCounterTable: number[] = [
    // 0  1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
    10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24,
    18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30,
  ];

  static readonly noisePeriodTable: number[] = [
    4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068,
  ];

  private frameCounter = 0;
  private ram: RAM;
  private audioContext: AudioContext;
  private cycle: number = 0;
  private pulse1: Channel;
  private pulse2: Channel;
  private triangle: Triangle;
  private noise: Noise;

  constructor(ram: RAM) {
    this.ram = ram;
    this.audioContext = new AudioContext();

    // Pulse 1 Channel
    this.pulse1 = {
      oscillator: this.audioContext.createOscillator(),
      gain: this.audioContext.createGain(),
      dutyCycle: 0,
      envelope: {
        enabled: false,
        loop: false,
        decay: 0,
      },
      sweep: {
        enabled: false,
        period: 0,
        negate: false,
        shift: 0,
      },
      timer: 0,
      lengthCounter: 0,
    };

    this.pulse1.oscillator.type = "square";
    this.pulse1.gain.gain.value = 0;
    this.pulse1.oscillator.connect(this.pulse1.gain);
    this.pulse1.gain.connect(this.audioContext.destination);
    this.pulse1.oscillator.start();

    // Pulse 2 Channel
    this.pulse2 = {
      oscillator: this.audioContext.createOscillator(),
      gain: this.audioContext.createGain(),
      dutyCycle: 0,
      envelope: {
        enabled: false,
        loop: false,
        decay: 0,
      },
      sweep: {
        enabled: false,
        period: 0,
        negate: false,
        shift: 0,
      },
      timer: 0,
      lengthCounter: 0,
    };

    this.pulse2.oscillator.type = "square";
    this.pulse2.gain.gain.value = 0;
    this.pulse2.oscillator.connect(this.pulse2.gain);
    this.pulse2.gain.connect(this.audioContext.destination);
    this.pulse2.oscillator.start();

    // Triangle Channel
    this.triangle = {
      oscillator: this.audioContext.createOscillator(),
      gain: this.audioContext.createGain(),
      linearCounter: 0,
      linearCounterReloadValue: 0,
      linearCounterControlFlag: false,
      timer: 0,
      lengthCounter: 0,
      linearCounterReload: false,
    };

    this.triangle.oscillator.type = "triangle";
    this.triangle.gain.gain.value = 0; // Start silenced
    this.triangle.oscillator.connect(this.triangle.gain);
    this.triangle.gain.connect(this.audioContext.destination);
    this.triangle.oscillator.start();



    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    // Fill the buffer with random values
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true; // Loop the noise buffer indefinitely

    this.noise = {
      node: noiseNode,
      gain: this.audioContext.createGain(),
      envelope: {
        enabled: false,
        loop: false,
        decay: 0,
      },
      timerPeriod: 0,
      mode: false,
      lengthCounter: 0,
    };

    this.noise.gain.gain.value = 0; // Start silenced
    this.noise.node.connect(this.noise.gain);
    this.noise.gain.connect(this.audioContext.destination);
    this.noise.node.start();
  }

  public tick() {
    // The APU is clocked every other CPU cycle
    if (this.cycle % 64 === 0) {
      this.read();
    }
    if (this.cycle % 7457 === 0) {
      this.tickFrameCounter();
    }
    this.cycle++;
  }

  public tickFrameCounter() {
    // --- Quarter Frame Tick (Clocks Linear Counter & Envelopes) ---
    // This happens on every tick of the 240Hz clock.

    // Triangle Linear Counter
    if (this.triangle.linearCounterReload) {
      this.triangle.linearCounter = this.triangle.linearCounterReloadValue;
    } else if (this.triangle.linearCounter > 0) {
      this.triangle.linearCounter = this.triangle.linearCounter - 1;
    }

    // The reload flag is cleared only if the control flag (halt) is false
    if (!this.triangle.linearCounterControlFlag) {
      this.triangle.linearCounterReload = false;
      this.ram.clearLinearCounterReload();
    }

    // TODO: Clock the Pulse 1 and Pulse 2 envelope generators here.

    // --- Half Frame Tick (Clocks Length Counters & Sweep Units) ---
    // This happens on the 2nd and 4th ticks of a 4-step sequence.
    // We can simulate this by checking if the frameCounter is odd.
    if (this.frameCounter % 2 === 1) {
      this.tickLengthCounters();
      // TODO: Clock the Pulse 1 and Pulse 2 sweep units here.
    }

    // Increment the frame counter, wrapping around to keep it simple.
    // The actual hardware has a 4 or 5 step sequence, but this is sufficient for timing.
    this.frameCounter = (this.frameCounter + 1) % 4;
  }

  private tickLengthCounters() {
    // Pulse 1 Length Counter
    if (!this.pulse1.envelope.loop && this.pulse1.lengthCounter > 0) {
      this.pulse1.lengthCounter--;
    }

    // Pulse 2 Length Counter
    if (!this.pulse2.envelope.loop && this.pulse2.lengthCounter > 0) {
      this.pulse2.lengthCounter--;
    }

    if (
      !this.triangle.linearCounterControlFlag &&
      this.triangle.lengthCounter > 0
    ) {
      this.triangle.lengthCounter = this.triangle.lengthCounter - 1;
    }

    if (!this.noise.envelope.loop && this.noise.lengthCounter > 0) {
      this.noise.lengthCounter--;
    }
  }

  public testPulse1() {
    if (this.pulse1.gain.gain.value === 0) {
      this.pulse1.gain.gain.value = 0.5;
    } else {
      this.pulse1.gain.gain.value = 0;
    }
  }

  public testPulse2() {
    if (this.pulse1.gain.gain.value === 0) {
      this.pulse1.gain.gain.value = 0.5;
    } else {
      this.pulse1.gain.gain.value = 0;
    }
  }
  public testTriangle() {
    if (this.triangle.gain.gain.value === 0) {
      this.triangle.gain.gain.value = 1;
    } else {
      this.triangle.gain.gain.value = 0;
    }
  }

  public testNoise() {
    if (this.noise.gain.gain.value === 0) {
      this.noise.gain.gain.value = 0.2;
    } else {
      this.noise.gain.gain.value = 0;
    }
  }

  public read() {
    this.updatePulse1();
    this.updatePulse2();
    this.updateTriangle();
    this.updateNoise();
  }

  private updatePulse1() {
    const timerLow = this.ram.getPulse1Low();
    const timerHigh = this.ram.getPulse1High() & 0b111;
    this.pulse1.timer = (timerHigh << 8) | timerLow;

    if (this.pulse1.timer > 0) {
      const frequency = 1789773 / (16 * (this.pulse1.timer + 1));
      this.pulse1.oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
    }

    const control = this.ram.getPulse1Vol();
    this.pulse1.dutyCycle = (control >> 6) & 0b11;
    this.pulse1.envelope.loop = !!(control & 0b00100000);
    this.pulse1.envelope.enabled = !(control & 0b00010000);
    this.pulse1.envelope.decay = control & 0b00001111;

    // A simple way to handle volume for now
    if (this.ram.getAPUStatus() & 0x01) {
      // If Pulse 1 is enabled in the status register
      if (this.pulse1.envelope.enabled) {
        this.pulse1.gain.gain.value = this.pulse1.envelope.decay / 15;
      } else {
        this.pulse1.gain.gain.value = (control & 0x0f) / 15;
      }
    } else {
      this.pulse1.gain.gain.value = 0;
    }
  }

  private updatePulse2() {
    const timerLow = this.ram.getPulse2Low();
    const timerHigh = this.ram.getPulse2High() & 0b111;
    this.pulse2.timer = (timerHigh << 8) | timerLow;

    if (this.pulse2.timer > 0) {
      const frequency = 1789773 / (16 * (this.pulse2.timer + 1));
      this.pulse2.oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
    }

    const control = this.ram.getPulse2Vol();
    this.pulse2.dutyCycle = (control >> 6) & 0b11;
    this.pulse2.envelope.loop = !!(control & 0b00100000);
    this.pulse2.envelope.enabled = !(control & 0b00010000);
    this.pulse2.envelope.decay = control & 0b00001111;

    // A simple way to handle volume for now
    if (this.ram.getAPUStatus() & 0x02) {
      // If Pulse 1 is enabled in the status register
      if (this.pulse2.envelope.enabled) {
        this.pulse2.gain.gain.value = this.pulse2.envelope.decay / 15;
      } else {
        this.pulse2.gain.gain.value = (control & 0x0f) / 15;
      }
    } else {
      this.pulse2.gain.gain.value = 0;
    }
  }

  private updateTriangle() {
     const masterEnabled = (this.ram.getAPUStatus() & 0x04) !== 0;
    this.triangle.linearCounterReload = this.ram.getLinearCounterReload();
    // Read timer value from registers $400A (low) and $400B (high)
    const timerLow = this.ram.getTriangleLow();
    const timerHigh = this.ram.getTriangleHigh() & 0b111;
    const lengthCounterLoad = this.ram.getTriangleHigh() >> 3;
    this.triangle.timer = (timerHigh << 8) | timerLow;

    if(!masterEnabled) {
      this.triangle.lengthCounter = 0
    } else if (this.triangle.linearCounterReload) {
      // Length counter is only active if the control flag is OFF
      this.triangle.lengthCounter = APU.lengthCounterTable[lengthCounterLoad];
    }

    // The triangle channel is silenced if its timer value is less than 2
    if (this.triangle.timer > 1) {
      // Frequency is calculated differently for the triangle channel
      const frequency = 1789773 / (32 * (this.triangle.timer + 1));
      this.triangle.oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
    }

    // Read linear counter control from register $4008
    const linearControl = this.ram.getTriangleLinear();
    this.triangle.linearCounterControlFlag = !!(linearControl & 0b10000000);
    this.triangle.linearCounterReloadValue = linearControl & 0b01111111;


    const lengthCounterActive = this.triangle.lengthCounter > 0;
    const linearCounterActive = this.triangle.linearCounter > 0;

    if (
      masterEnabled &&
      lengthCounterActive &&
      linearCounterActive &&
      this.triangle.timer > 0
    ) {
      // If Triangle is enabled, set gain to max. It has no volume control.
      this.triangle.gain.gain.value = 0.5;
    } else {
      // Otherwise, silence it.
      this.triangle.gain.gain.value = 0;
    }
  }

  private updateNoise() {
    const masterEnabled = (this.ram.getAPUStatus() & 0x08) !== 0;

    // --- $400C (Volume / Envelope) ---
    const control = this.ram.getNoiseVol();
    this.noise.envelope.loop = !!(control & 0b00100000); // Also Length Counter Halt
    this.noise.envelope.enabled = !(control & 0b00010000); // 0 = envelope, 1 = constant
    this.noise.envelope.decay = control & 0b00001111; // Constant volume / envelope period

    // --- $400E (Period / Mode) ---
    const periodRegister = this.ram.getNoisePeriod();
    this.noise.mode = !!(periodRegister & 0b10000000);
    const periodIndex = periodRegister & 0b00001111;
    this.noise.timerPeriod = APU.noisePeriodTable[periodIndex];

    // We simulate the noise "pitch" by changing the playback rate
    // of our white noise buffer. A shorter period = faster playback = higher pitch.
    // We'll use index 7 (160) as our "base" 1.0 playback rate.
    const basePeriod = APU.noisePeriodTable[7]; // 160
    const playbackRate = basePeriod / this.noise.timerPeriod;

    this.noise.node.playbackRate.setValueAtTime(
      playbackRate,
      this.audioContext.currentTime
    );
    
    // TODO: Implement 7-bit "metallic" noise mode. This is much more
    // complex and requires a different audio generation approach.

    // --- $400F (Length Counter) ---
    if (!masterEnabled) {
      this.noise.lengthCounter = 0;
    } else if (this.ram.getNoiseLengthReload()) {
      // A write to $400F reloads the length counter
      const lengthCounterLoad = this.ram.getNoiseLength() >> 3;
      this.noise.lengthCounter = APU.lengthCounterTable[lengthCounterLoad];
      this.ram.clearNoiseLengthReload(); 
    }

    // --- Gating (Volume) ---
    const lengthCounterActive = this.noise.lengthCounter > 0;

    if (masterEnabled && lengthCounterActive) {
      if (this.noise.envelope.enabled) {
        // TODO: Implement envelope logic
        // For now, just use the decay as volume
        this.noise.gain.gain.value = this.noise.envelope.decay / 15;
      } else {
        // Use constant volume
        this.noise.gain.gain.value = this.noise.envelope.decay / 15;
      }
    } else {
      // Silence the channel
      this.noise.gain.gain.value = 0;
    }
  }
}

export default APU;
