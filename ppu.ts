import { BASE_NAMETABLE_ADDRESS, CHRROM_SIDE } from "./enums";
import RAM from "./ram";
import Tile from "./tile";

class PPU {
  private ctx: CanvasRenderingContext2D;
  private scanline = 0;
  private cycle = 0;
  private ram: RAM;
  private PPU_CTRL: Uint8Array;
  private PPU_MASK: Uint8Array;
  private PPU_STATUS: Uint8Array;
  private CHRROM_LEFT!: Uint8Array;
  private CHRROM_RIGHT!: Uint8Array;

  private tile: Tile | null = null;
  constructor(ram: RAM) {
    const canvas = document.getElementById("emu") as HTMLCanvasElement;
    this.ctx = canvas.getContext("2d")!;
    this.ram = ram;
    this.PPU_CTRL = this.ram.getPPU_CTRL();
    this.PPU_MASK = this.ram.getPPU_MASK();
    this.PPU_STATUS = this.ram.getPPU_STATUS();
    this.setCHRROM();
    this.setFakevRamDEMO();
  }

  setFakevRamDEMO() {
    for (let i = 0; i < 960; i++) {
      this.ram.setvRam(0x2000 + i, 0x0b);
    }
  }

  tick() {
    if (this.cycle > 340) {
      this.cycle = 0;
      this.scanline++;
    }
    if (this.scanline > 261) {
      console.log("Drawing scanline...");
      this.scanline = 0;
    }

    if (this.scanline >= 0 && this.scanline <= 239) {
      // if (this.cycle === 0) {
      // } else
      if (this.cycle % 8 === 0) {
        const baseTableAddress = this.getBaseNameTableAddress();
        const tableEntryAddress =
          baseTableAddress +
          32 * Math.floor(this.scanline / 8) +
          Math.floor(this.cycle / 8);
          const tableValue = this.ram.get8vRam(tableEntryAddress);
        const bgSpite = this[
          this.getCHRROMbackgroundSideRight() ? "CHRROM_RIGHT" : "CHRROM_LEFT"
        ].subarray(16 * tableValue, 16 + 16 * tableValue);
        this.tile = new Tile(bgSpite);
        const pixel = this.tile.tile[this.scanline % 8][this.cycle % 8];
        this.renderPixel(pixel);
      } else {
        const pixel = this.tile?.tile[this.scanline % 8][this.cycle % 8];
        if (pixel === undefined) {
          throw new Error("no pixel data");
        }
        this.renderPixel(pixel);
      }
    }
    if (this.scanline === 240 && this.cycle === 0) {
      console.log("post-render line");
      // console.log("Control: ", this.ram.getPPU_CTRL());
      // console.log("Mask: ", this.ram.getPPU_MASK());
      // console.log("Status: ", this.ram.getPPU_STATUS());
    }
    if (this.scanline == 241 && this.cycle === 0) {
      console.log("V Blank");
      this.setVBL_FLAG();
    }
    if (this.scanline === 261 && this.cycle === 0) {
      console.log("pre-render line");
      this.clearVBL_FLAG();
      // console.log("vram address:", this.ram.vRamAddress);
    }

    this.cycle++;
  }

  renderPixel(val: number) {
    const data = new ImageData(1, 1);
    // Red
    data.data[0] = val & 1 ? 255 : 0;
    // Green
    data.data[1] = !(val & 2) ? 255 : 0;
    // Blue
    data.data[2] = val & 2 ? 255 : 0;
    // Opacity
    data.data[3] = !(val & 1) ? 255 : 0;

    this.ctx.putImageData(data,this.cycle, this.scanline);
  }

  getBaseNameTableAddress() {
    const ptr: 0 | 1 | 2 | 3 = (this.ram.getPPU_CTRL()[0] & 0b11) as
      | 0
      | 1
      | 2
      | 3;
    return BASE_NAMETABLE_ADDRESS[ptr];
  }

  getCHRROMbackgroundSideRight() {
    return !!(this.ram.getPPU_CTRL()[0] & 0b1_0000);
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

  setCHRROM() {
    const chrrom = this.ram.getCHRROM();
    this.CHRROM_LEFT = chrrom.subarray(0, 0x1000);
    this.CHRROM_RIGHT = chrrom.subarray(0x1000, 0x2000);
  }
}

export default PPU;
