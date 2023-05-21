import Cartridge from "./cartridge";
import RAM from "./ram";
import CPU from "./cpu";
import PPU from "./ppu";
import Clock from "./clock";

const cartridge = new Cartridge("Super Mario Bros.nes");
const ram = new RAM(cartridge);
const cpu = new CPU(ram);
const ppu = new PPU(ram);
const clock = new Clock(cpu, ppu);

// TESTING CHR_ROM pattern table

const chrrom = cartridge.getCHRROM();

class Tile {
  private raw: Buffer;
  public tile: Array<Array<number>> = new Array(8)
    .fill(null)
    .map(() => new Array(8).fill(0));
  constructor(raw: Buffer) {
    this.raw = raw;
    this.parse();
  }

  parse() {
    const left = this.raw.subarray(0, 8);
    left.forEach((byte, index) => {
      const row = this.tile[index];

      for (let j = 0; j < row.length; j++) {
        row[j] += !!(byte & (1 << (7 - j))) ? 1 : 0;
      }
    });

    const right = this.raw.subarray(8, 16);
    right.forEach((byte, index) => {
      const row = this.tile[index];

      for (let j = 0; j < row.length; j++) {
        row[j] += !!(byte & (1 << (7 - j))) ? 2 : 0;
      }
    });
  }
}

const canvas = document.getElementById("emu") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 240);

enum POSITION {
  RED = 1,
  GREEN = 2,
  BLUE = 3,
  OPACITY = 4,
}

for (let x = 0; x < 16; x++) {
  for (let y = 0; y < 16; y++) {
    const shift = (x * 16 + y) * 16;
    const tile = new Tile(chrrom.subarray(0 + shift, 16 + shift)).tile.flatMap(
      (x) => x
    );
    const tileData = ctx.getImageData(y * 8, x * 8, 8, 8);
    const pixels = tileData.data;

    pixels.forEach((value, index) => {
      const tilePixel = tile[Math.floor(index / 4)];
      const pos = (index + 1) % 4 || 4;
      if (pos === POSITION.RED) pixels[index] = tilePixel & 1 ? 255 : 0;
      if (pos === POSITION.GREEN) pixels[index] = !(tilePixel & 2) ? 255 : 0;
      if (pos === POSITION.BLUE) pixels[index] = tilePixel & 2 ? 255 : 0;
      if (pos === POSITION.OPACITY) pixels[index] = !(tilePixel & 1) ? 255 : 0;
    });

    ctx.putImageData(tileData, y * 8, x * 8);
  }
}

const createButton = (name: string, fn?: (e: MouseEvent) => void) => {
  const button = document.createElement("button");
  button.innerText = name;
  fn && button.addEventListener("click", fn);
  const container = document.getElementById("btnContainer");
  container?.appendChild(button);
};


createButton("step Clock", () => {
  console.log('clock step')
  clock.step();
  cpu.logDecode();
  cpu.logExecute();
})

createButton("start Clock", () => {
  console.log("starting clock");
  clock.start()
})

createButton("stop Clock", () => {
  console.log("stopping clock");
  clock.stop()
})

createButton("cycle frame", () => {
  console.log('cycle frame')
  clock.cycleFrame();
})

createButton("dump memory", () => {
  console.log('dumping memory:')
  console.log("ram: ", ram);
  console.log("CPU registers: ", cpu.logRegisters())
})

