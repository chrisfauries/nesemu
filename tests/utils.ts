import Cartridge from "../cartridge";
import { CPU_INSTRUCTION } from "../enums";
import RAM from "../ram";
import Registers from "../registers";

const getCartridge = () => {
  return new Cartridge("./nesemu/nestest.nes");
};

export interface InitRegisters {
  x?: number;
  y?: number;
  a?: number;
  pc?: number;
}

interface InitRAM {
  [address: number]: number;
}

export const getRam = (initRam?: InitRAM) => {
  const ram = new RAM(getCartridge());

  if (!initRam) {
    return ram;
  }

  for (let address in initRam) {
    const value = initRam[address];
    ram.set8(parseInt(address), value);
  }

  return ram;
};

export const getRegisters = (init?: InitRegisters) => {
  const reg = new Registers();

  if (!init) {
    return reg;
  }

  "a" in init && init.a !== undefined && reg.setAccumulator(init.a);
  "x" in init && init.x !== undefined && reg.setX(init.x);
  "y" in init && init.y !== undefined && reg.setY(init.y);
  "pc" in init && init.pc !== undefined && reg.setProgramCounter(init.pc);
  return reg;
};

interface Flags {
  carry?: boolean;
  zero?: boolean;
  negative?: boolean;
}

export const checkFlags = (registers: Registers, flags: Flags) => {
  if ("carry" in flags) {
    expect(registers.getCarry()).toEqual(flags.carry);
  }

  if ("zero" in flags) {
    expect(registers.getZero()).toEqual(flags.zero);
  }

  if ("negative" in flags) {
    expect(registers.getNegative()).toEqual(flags.negative);
  }
};

type INSTRUCTIONS = keyof typeof CPU_INSTRUCTION
export const assertOpcode = (instruction: INSTRUCTIONS, opcode: number) => {
    expect(CPU_INSTRUCTION[instruction]).toEqual(opcode);
}