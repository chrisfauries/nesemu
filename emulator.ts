import Cartridge from "./cartridge";
import RAM from "./ram";
import CPU from "./cpu";
import PPU from "./ppu";
import Clock from "./clock";
import Controller from "./controller";
import fs from "fs";
import path from "path";

let cartridge:Cartridge;
let ram: RAM;
let cpu: CPU;
let ppu: PPU;
let clock: Clock;
let controller: Controller;

const container = document.getElementById("btnContainer");
const createButton = (name: string, fn?: (e: MouseEvent) => void) => {
  const button = document.createElement("button");
  button.innerText = name;
  fn && button.addEventListener("click", fn);
  container?.appendChild(button);
};

const fps = document.createElement('div');
fps.classList.add('fps')
fps.append(document.createElement('span'))
fps.append(document.createElement('span'))
container?.append(fps)
fps.children[1].innerHTML = ' : FPS';
const updateFPS = () => {
  fps.children[0].innerHTML = clock.getFrameRate().toFixed(2);
  window.requestAnimationFrame(() => {
    updateFPS();
  })
}

const select  = document.createElement("select");
const games = fs.readdirSync(path.join(__dirname,'../games'), {withFileTypes: true});
games.forEach((game) => {
  const option = document.createElement('option')
  option.innerHTML = game.name;
  option.value = game.name
  select.appendChild(option);
});
container?.appendChild(select)

createButton("load Game", () => {
  console.log("load game");
  cartridge = new Cartridge(games[select.selectedIndex].name);
  console.log("Header: ", cartridge.getHeader());
  ram = new RAM(cartridge);
  console.log("RAM: ", ram);
  cpu = new CPU(ram);
  ppu = new PPU(ram);
  clock = new Clock(cpu, ppu);
  controller = new Controller(ram);
});
createButton("step Clock", () => {
  console.log("clock step");
  clock.step();
  clock.step();
  clock.step();
  cpu.logDecode();
  cpu.logExecute();
});

createButton("start Clock", () => {
  console.log("starting clock");
  clock.start();
  updateFPS();
});

createButton("stop Clock", () => {
  console.log("stopping clock");
  clock.stop();
});

createButton("cycle frame", () => {
  console.log("cycle frame");
  clock.cycleFrame();
});

createButton("dump memory", () => {
  console.log("dumping memory:");
  console.log("ram: ", ram);
  console.log("CPU registers: ", cpu.logRegisters());
});

createButton("start controller", () => {
  console.log("starting controller");
  controller.start();
});

createButton("stop controller", () => {
  console.log("stopping controller");
  controller.stop();
});
