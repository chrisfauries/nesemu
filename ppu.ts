import { BASE_NAMETABLE_ADDRESS, CHRROM_SIDE } from "./enums";
import RAM from "./ram";
import Tile, { SpriteOrientation } from "./tile";

interface RGBA {
  red: number;
  green: number;
  blue: number;
  opacity: 0 | 255;
}

interface SpriteData {
  orientation: SpriteOrientation;
  behindBackground: boolean;
  paletteIndex: number;
}

class Palette {
  private static palettes: { [code: number]: RGBA } = {
    0x00: { red: 101, green: 101, blue: 101, opacity: 255 },
    0x01: { red: 0, green: 45, blue: 105, opacity: 255 },
    0x02: { red: 19, green: 31, blue: 127, opacity: 255 },
    0x03: { red: 60, green: 19, blue: 124, opacity: 255 },
    0x04: { red: 96, green: 11, blue: 98, opacity: 255 },
    0x05: { red: 115, green: 10, blue: 55, opacity: 255 },
    0x06: { red: 113, green: 15, blue: 7, opacity: 255 },
    0x07: { red: 90, green: 26, blue: 0, opacity: 255 },
    0x08: { red: 52, green: 40, blue: 0, opacity: 255 },
    0x09: { red: 11, green: 52, blue: 0, opacity: 255 },
    0x0a: { red: 0, green: 60, blue: 0, opacity: 255 },
    0x0b: { red: 0, green: 61, blue: 16, opacity: 255 },
    0x0c: { red: 0, green: 56, blue: 64, opacity: 255 },
    0x0d: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x0e: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x0f: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x10: { red: 174, green: 174, blue: 174, opacity: 255 },
    0x11: { red: 15, green: 99, blue: 179, opacity: 255 },
    0x12: { red: 64, green: 81, blue: 208, opacity: 255 },
    0x13: { red: 120, green: 65, blue: 204, opacity: 255 },
    0x14: { red: 167, green: 54, blue: 169, opacity: 255 },
    0x15: { red: 192, green: 52, blue: 112, opacity: 255 },
    0x16: { red: 189, green: 60, blue: 48, opacity: 255 },
    0x17: { red: 159, green: 74, blue: 0, opacity: 255 },
    0x18: { red: 109, green: 92, blue: 0, opacity: 255 },
    0x19: { red: 54, green: 109, blue: 0, opacity: 255 },
    0x1a: { red: 7, green: 119, blue: 4, opacity: 255 },
    0x1b: { red: 0, green: 121, blue: 61, opacity: 255 },
    0x1c: { red: 0, green: 114, blue: 125, opacity: 255 },
    0x1d: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x1e: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x1f: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x20: { red: 254, green: 254, blue: 255, opacity: 255 },
    0x21: { red: 93, green: 179, blue: 255, opacity: 255 },
    0x22: { red: 143, green: 161, blue: 255, opacity: 255 },
    0x23: { red: 200, green: 144, blue: 255, opacity: 255 },
    0x24: { red: 247, green: 133, blue: 250, opacity: 255 },
    0x25: { red: 255, green: 131, blue: 192, opacity: 255 },
    0x26: { red: 255, green: 139, blue: 127, opacity: 255 },
    0x27: { red: 239, green: 154, blue: 73, opacity: 255 },
    0x28: { red: 189, green: 172, blue: 44, opacity: 255 },
    0x29: { red: 133, green: 188, blue: 47, opacity: 255 },
    0x2a: { red: 85, green: 199, blue: 83, opacity: 255 },
    0x2b: { red: 60, green: 201, blue: 140, opacity: 255 },
    0x2c: { red: 62, green: 194, blue: 205, opacity: 255 },
    0x2d: { red: 78, green: 78, blue: 78, opacity: 255 },
    0x2e: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x2f: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x30: { red: 254, green: 254, blue: 255, opacity: 255 },
    0x31: { red: 188, green: 223, blue: 255, opacity: 255 },
    0x32: { red: 209, green: 216, blue: 255, opacity: 255 },
    0x33: { red: 232, green: 209, blue: 255, opacity: 255 },
    0x34: { red: 251, green: 205, blue: 253, opacity: 255 },
    0x35: { red: 255, green: 204, blue: 229, opacity: 255 },
    0x36: { red: 255, green: 207, blue: 202, opacity: 255 },
    0x37: { red: 248, green: 213, blue: 180, opacity: 255 },
    0x38: { red: 228, green: 220, blue: 168, opacity: 255 },
    0x39: { red: 204, green: 227, blue: 169, opacity: 255 },
    0x3a: { red: 185, green: 232, blue: 184, opacity: 255 },
    0x3b: { red: 174, green: 232, blue: 208, opacity: 255 },
    0x3c: { red: 175, green: 229, blue: 234, opacity: 255 },
    0x3d: { red: 182, green: 182, blue: 182, opacity: 255 },
    0x3e: { red: 0, green: 0, blue: 0, opacity: 255 },
    0x3f: { red: 0, green: 0, blue: 0, opacity: 255 },
  };
  constructor() {}

  static getPaletteFromCode(code: number): RGBA {
    return this.palettes[code];
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
  private spritePatternTable: Uint8Array = new Uint8Array(0x1000);
  private nameTable: Uint8Array = new Uint8Array(0x03c0);
  private attributeTable: Uint8Array = new Uint8Array(0x40);
  private paletteTable: Uint8Array = new Uint8Array(0x20);
  private bgTiles: Array<Tile> = new Array(960).fill(null);
  private spriteTiles: Array<Tile> = new Array(960).fill(null);
  private frameData: Uint8ClampedArray = new Uint8ClampedArray(245760);

  private oamData: Uint8Array = new Uint8Array(0x100);

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
      this.buildSpriteTiles();
      this.loadOamData();
    }

    if (this.scanline >= 0 && this.scanline <= 239) {
      let bgPixel: number = 0;
      // Draw BG Spite
      if (this.cycle > 255) {
      } else if (this.cycle % 8 === 0) {
        this.tile = this.getBgTile();
        bgPixel = this.tile.tile[this.scanline % 8][this.cycle % 8];
        this.renderPixel(bgPixel);
      } else {
        bgPixel = this.tile?.tile[this.scanline % 8][this.cycle % 8]!;
        this.renderPixel(bgPixel);
      }

      if (this.cycle < 256) {
        // Draw Sprite

        // Idea: instead of calling this loop for each pixel of the frame
        // at the top of the frame, 'draw' all sprite in reverse order to a data structure
        // then just do look ups to determine whether to draw the sprite pixel at this point
        const sprite = this.findSprite();
        if (sprite) {
          const spritePixel = sprite.tile.getPixel(
            sprite.y,
            sprite.x,
            sprite.data.orientation
          );
          // only render anything if this sprite has priority or if sprite pixel is visible
          if (spritePixel && !(sprite.data.behindBackground && bgPixel)) {
            this.renderPixel(spritePixel, sprite.data.paletteIndex);
          }
        }
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

  loadOamData() {
    this.oamData = this.ram.getOAMData();
  }

  findSprite() {
    const screenX = this.cycle;
    const screenY = this.scanline;
    for (let i = 0; i < 64; i++) {
      const spriteY = this.oamData[i * 4];
      const spriteX = this.oamData[i * 4 + 3];
      if (
        this.isInRange(screenX, spriteX) &&
        this.isInRange(screenY, spriteY)
      ) {
        return {
          data: this.getSpriteData(this.oamData[i * 4 + 2]),
          tile: this.spriteTiles[this.oamData[i * 4 + 1]],
          x: screenX - spriteX,
          y: screenY - spriteY,
        };
      }
    }
    return null;
  }

  getSpriteData(byte: number): SpriteData {
    return {
      orientation: (byte & 0b1100_0000) >> 6,
      paletteIndex: byte & 0b0000_0011,
      behindBackground: !!(byte & 0b0001_0000),
    };
  }

  isInRange(screen: number, sprite: number) {
    return screen >= sprite && screen <= sprite + 7;
  }

  setupPatternTables() {
    this.bgPatternTable = this.getCHRROMbackgroundTable();
    this.spritePatternTable = this.getCHRROMSpiteTable();
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

  buildSpriteTiles() {
    for (let i = 0; i < 256; i++) {
      const pattern = this.spritePatternTable.subarray(i * 16, 16 + 16 * i);
      this.spriteTiles[i] = new Tile(pattern);
    }
  }

  getBgTile() {
    const nameTableEntryAddress =
      32 * Math.floor(this.scanline / 8) + Math.floor(this.cycle / 8);
    const patternTableEntryValue = this.nameTable.at(nameTableEntryAddress)!;
    return this.bgTiles[patternTableEntryValue];
  }

  renderPixel(val: number, paletteIndex: number | null = null) {
    const start = (this.scanline * 256 + this.cycle) * 4;
    const data = this.frameData.subarray(start, start + 4);
    const paletteValue =
      paletteIndex === null
        ? this.getBgPaletteValue(val)
        : this.getSpritePaletteValue(val, paletteIndex);
    const palette = Palette.getPaletteFromCode(paletteValue);
    Palette.loadData(data, palette);
  }

  getBgPaletteValue(val: number) {
    const index = this.getBgAttributePalleteIndex();
    return this.paletteTable.at(index * 4 + val)!;
  }

  getSpritePaletteValue(val: number, index: number) {
    return this.paletteTable.at((index * 4 + val) + 0x10)!;
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
