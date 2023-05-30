import { BASE_NAMETABLE_ADDRESS, CHRROM_SIDE } from "./enums";
import RAM from "./ram";
import Tile from "./tile";

interface RGBA {
  red: number;
  green: number;
  blue: number;
  opacity: 0 | 255;
}

class Palette {
  private static palettes: { [code: number]: RGBA } = {
    // TODO: double check these values
    0x00: { red: 101, green: 101, blue: 101, opacity: 255 },
    0x01: { red: 0, green: 45, blue: 105, opacity: 255 },
    0x02: { red: 19, green: 31, blue: 127, opacity: 255 },
    0x03: { red: 60, green: 19, blue: 124, opacity: 255 },
    0x06: { red: 113, green: 15, blue: 7, opacity: 255 },
    // FILL THESE
    0x0f: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x12: { red: 64, green: 81, blue: 208, opacity: 255 },
    0x17: { red: 159, green: 74, blue: 0, opacity: 255 },
    0x1a: { red: 0, green: 121, blue: 61, opacity: 255 },
    0x24: { red: 247, green: 133, blue: 250, opacity: 255 },
    0x27: { red: 239, green: 154, blue: 73, opacity: 255 },
    0x2c: { red: 62, green: 194, blue: 205, opacity: 255 },
    // FILL THESE
    0x30: { red: 254, green: 254, blue: 255, opacity: 255 },
    0x33: { red: 232, green: 209, blue: 255, opacity: 255 },
    0x36: { red: 255, green: 207, blue: 202, opacity: 255 },
    0x38: { red: 228, green: 220, blue: 168, opacity: 255 },
  };
  constructor() {}

  static getPaletteFromCode(code: number): RGBA {
    const rgba = this.palettes[code];
    if (!rgba) {
      throw new Error("Unimplemented Palette: " + code.toString(16));
    }
    return rgba;
  }

  static loadData(data: Uint8ClampedArray, rgba: RGBA) {
    data[0] = rgba.red;
    data[1] = rgba.green;
    data[2] = rgba.blue;
    data[3] = rgba.opacity;
  }
}

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

  private bgPatternTable: Uint8Array = new Uint8Array(0x1000);
  private spitePatternTable: Uint8Array = new Uint8Array(0x1000);
  private nameTable: Uint8Array = new Uint8Array(0x03c0);
  private attributeTable: Uint8Array = new Uint8Array(0x40);
  private paletteTable: Uint8Array = new Uint8Array(0x20);
  private bgTiles: Array<Tile> = new Array(960).fill(null);
  private frameData: Uint8ClampedArray = new Uint8ClampedArray(245760);

  private tile: Tile | null = null;
  constructor(ram: RAM) {
    const canvas = document.getElementById("emu") as HTMLCanvasElement;
    this.ctx = canvas.getContext("2d")!;
    this.ram = ram;
    this.PPU_CTRL = this.ram.getPPU_CTRL();
    this.PPU_MASK = this.ram.getPPU_MASK();
    this.PPU_STATUS = this.ram.getPPU_STATUS();
    this.paletteTable = this.loadPaletteTable();
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
      this.scanline = 0;
    }

    if (this.scanline === 0 && this.cycle === 0) {
      // First cycle, first scanline, load the tables
      this.setupPatternTables();
      this.loadNameTable();
      this.loadAttributeTable();
      this.buildBgTiles();
    }

    if (this.scanline >= 0 && this.scanline <= 239) {
      if (this.cycle > 255) {
      } else if (this.cycle % 8 === 0) {
        this.tile = this.getBgTile();
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
      this.renderFrame();
    }
    if (this.scanline == 241 && this.cycle === 0) {
      this.setVBL_FLAG();
    }
    if (this.scanline === 261 && this.cycle === 0) {
      this.clearVBL_FLAG();
    }

    this.cycle++;
  }

  setupPatternTables() {
    this.bgPatternTable = this.getCHRROMbackgroundTable();
    this.spitePatternTable = this.getCHRROMSpiteTable();
  }

  loadNameTable() {
    const baseTableAddress = this.getBaseNameTableAddress();
    this.nameTable = this.ram.get8vRamRange(
      baseTableAddress,
      baseTableAddress + 960
    );
  }

  loadAttributeTable() {
    const baseTableAddress = this.getBaseNameTableAddress();
    this.attributeTable = this.ram.get8vRamRange(
      baseTableAddress + 960,
      baseTableAddress + 1024
    );
  }

  loadPaletteTable() {
    return (this.paletteTable = this.ram.get8vRamRange(0x3f00, 0x3f20));
  }

  buildBgTiles() {
    for (let i = 0; i < 256; i++) {
      const pattern = this.bgPatternTable.subarray(i * 16, 16 + 16 * i);
      this.bgTiles[i] = new Tile(pattern);
    }
  }

  getBgTile() {
    const nameTableEntryAddress =
      32 * Math.floor(this.scanline / 8) + Math.floor(this.cycle / 8);
    const patternTableEntryValue = this.nameTable.at(nameTableEntryAddress)!;
    return this.bgTiles[patternTableEntryValue];
  }

  renderPixel(val: number) {
    const start = (this.scanline * 256 + this.cycle) * 4;
    const data = this.frameData.subarray(start, start + 4);
    const paletteIndex = this.getBgAttributePalleteIndex(); // 0-3
    const paletteValue = this.paletteTable.at(
      !val ? 0 : 1 + paletteIndex * 4 + val
    );
    const palette = Palette.getPaletteFromCode(paletteValue || 0); // TODO: fix
    Palette.loadData(data, palette);
  }

  renderFrame() {
    const imageData = new ImageData(this.frameData, 256, 240);
    this.ctx.putImageData(imageData, 0, 0);
  }

  getBgAttributePalleteIndex() {
    const quadrantX = Math.floor(this.cycle / 16);
    const quadrantY = Math.floor(this.scanline / 16);
    const byteAddress =
      Math.floor(quadrantX / 2) + Math.floor(quadrantY / 2) * 8;
    const attributeValue = this.attributeTable.at(byteAddress) || 0; // TODO: Fix
    const quadrant = (quadrantX % 2) + (quadrantY % 2 ? 2 : 0);

    return (attributeValue >> (2 * quadrant)) & 0b11;
  }

  getBaseNameTableAddress() {
    const ptr: 0 | 1 | 2 | 3 = (this.ram.getPPU_CTRL()[0] & 0b11) as
      | 0
      | 1
      | 2
      | 3;
    return BASE_NAMETABLE_ADDRESS[ptr];
  }

  getCHRROMbackgroundTable() {
    return !!(this.ram.getPPU_CTRL()[0] & 0b1_0000)
      ? this.CHRROM_RIGHT
      : this.CHRROM_LEFT;
  }
  getCHRROMSpiteTable() {
    return !!(this.ram.getPPU_CTRL()[0] & 0b1_0000)
      ? this.CHRROM_LEFT
      : this.CHRROM_RIGHT;
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
