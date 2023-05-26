import Cartridge from "./cartridge";
import RAM from "./ram";
import CPU from "./cpu";
import PPU from "./ppu";
import Clock from "./clock";

const cartridge = new Cartridge("nestest.nes");
const ram = new RAM(cartridge);
const cpu = new CPU(ram);
const ppu = new PPU(ram);
const clock = new Clock(cpu, ppu);


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

