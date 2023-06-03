import { BASE_NAMETABLE_ADDRESS } from "./enums";
import Palette from "./palette";
import RAM from "./ram";
import Tile, { SpriteOrientation } from "./tile";

interface SpriteData {
  orientation: SpriteOrientation;
  behindBackground: boolean;
  paletteIndex: number;
}

interface SpritePixel {
  value: number; // 0-3  Actual value of the sprite pixel
  // id: number; // 0-63 priority order in the sprite list, lower takes presidence
  hide: boolean; // whether to hide behind the background
  palette: number; // 0-3 which palette to use
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

  private spritePixels: Array<Array<SpritePixel | null>> =
    PPU.getNewSpritePixelTable();

  private bgTile: Tile | null = null;
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
      this.buildSpritePixels();
    }

    if (this.scanline >= 0 && this.scanline <= 239) {
      let bgPixel: number = 0;
      if (this.cycle < 256) {
        // Draw BG
        this.bgTile = this.cycle % 8 === 0 ? this.getBgTile() : this.bgTile;
        bgPixel = this.bgTile?.tile[this.scanline % 8][this.cycle % 8]!;
        this.renderPixel(bgPixel);

        // Draw Sprite
        const sprite = this.spritePixels[this.scanline][this.cycle];
        // only render anything if this sprite has priority or if sprite pixel is visible
        if (sprite && sprite.value && !(sprite.hide && bgPixel)) {
          this.renderPixel(sprite.value, sprite.palette);
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

  buildSpritePixels() {
    this.spritePixels = PPU.getNewSpritePixelTable();
    for (let i = 63; i >= 0; i--) {
      const tile = this.spriteTiles[this.oamData[i * 4 + 1]];
      const data = this.getSpriteData(this.oamData[i * 4 + 2]);
      const spriteX = this.oamData[i * 4];
      const spriteY = this.oamData[i * 4 + 3];
      this.buildSpritePixelsForSprite(tile, data, spriteX, spriteY, i === 63);
    }
  }

  static getNewSpritePixelTable() {
    return new Array(240).fill(null).map(() => new Array(256).fill(null));
  }

  buildSpritePixelsForSprite(
    tile: Tile,
    data: SpriteData,
    spriteY: number,
    spriteX: number,
    clear: boolean
  ) {
    for (let tileY = 0; tileY < 8; tileY++) {
      for (let tileX = 0; tileX < 8; tileX++) {
        const value = tile.getPixel(tileY, tileX, data.orientation);
        const screenY = spriteY + tileY;
        const screenX = spriteX + tileX;
        if (screenX < 255 && screenY < 240) {
          if (clear) this.spritePixels[screenY][screenX] = null;
          // implement the simple version first. no checks for any hiddens
          this.spritePixels[screenY][screenX] = {
            value,
            hide: data.behindBackground,
            palette: data.paletteIndex,
          };
        }
      }
    }
  }

  getSpriteData(byte: number): SpriteData {
    return {
      orientation: (byte & 0b1100_0000) >> 6,
      paletteIndex: byte & 0b0000_0011,
      behindBackground: !!(byte & 0b0001_0000),
    };
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
    return this.paletteTable.at(index * 4 + val + 0x10)!;
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

  // These should be owned by RAM
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
