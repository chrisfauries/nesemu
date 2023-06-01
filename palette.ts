interface RGBA {
    red: number;
    green: number;
    blue: number;
    opacity: 0 | 255;
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
    } as const;
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

  export default Palette