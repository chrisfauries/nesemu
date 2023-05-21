import RAM from "./ram";

class PPU {
  private scanline = 0;
  private cycle = 0;
  private ram: RAM;
  private PPU_CTRL: Uint8Array;
  private PPU_MASK: Uint8Array;
  private PPU_STATUS: Uint8Array;
  constructor(ram: RAM) {
    this.ram = ram;
    this.PPU_CTRL = this.ram.getPPU_CTRL();
    this.PPU_MASK = this.ram.getPPU_MASK();
    this.PPU_STATUS = this.ram.getPPU_STATUS();
  }

  tick() {
    if (this.cycle > 340) { 
        this.cycle = 0;
        this.scanline++;
    }
    if (this.scanline > 261) {
      this.scanline = 0;
    }

    if (this.scanline == 0) {
      console.log("Drawing...");
    }
    if (this.scanline === 240) {
      console.log("post-render line");
    }
    if (this.scanline == 241) {
      console.log("V Blank");
      this.setVBL_FLAG();
    }
    if (this.scanline === 261) {
      console.log("pre-render line");
      this.clearVBL_FLAG();
    }

    this.cycle++;
  }

  getPPU_STATUS() {
    return this.PPU_STATUS[0];
  }

  setVBL_FLAG() {
    const PPU_STATUS = this.getPPU_STATUS();
    this.setPPU_STATUS(PPU_STATUS | 0b10000000);
  }

  clearVBL_FLAG() {
    const PPU_STATUS = this.getPPU_STATUS();
    this.setPPU_STATUS(PPU_STATUS & 0b01111111);
  }

  setPPU_STATUS(value: number) {
    this.PPU_STATUS[0] = value;
  }
}

export default PPU;
