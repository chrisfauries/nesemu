import Cartridge from "../cartridge";
import { CPU_INSTRUCTION } from "../enums";
import Execute from "../execute";
import RAM from "../ram";
import Registers from "../registers";

const getCartridge = () => {
  return new Cartridge("./nesemu/nestest.nes");
};

export interface TestRegisters {
  x?: number;
  y?: number;
  a?: number;
  pc?: number;
  carry?: boolean;
  decimal?: boolean;
  overflow?: boolean;
  interrupt?: boolean;
  zero?: boolean;
  negative?: boolean;
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

export const getRegisters = (init?: TestRegisters) => {
  const reg = new Registers();
  reg.setProgramCounter(0x00);

  if (!init) {
    return reg;
  }

  "a" in init && init.a !== undefined && reg.setAccumulator(init.a);
  "x" in init && init.x !== undefined && reg.setX(init.x);
  "y" in init && init.y !== undefined && reg.setY(init.y);
  "pc" in init && init.pc !== undefined && reg.setProgramCounter(init.pc);
  "carry" in init && init.carry !== undefined && init.carry
    ? reg.setCarry()
    : reg.clearCarry();
  "decimal" in init && init.decimal !== undefined && init.decimal
    ? reg.setDecimal()
    : reg.clearDecimal();
  "overflow" in init && init.overflow !== undefined && init.overflow
    ? reg.setOverflow()
    : reg.clearOverflow();
  "interrupt" in init && init.interrupt !== undefined && init.interrupt
    ? reg.setInteruptDisable()
    : reg.clearInteruptDisable();
  "zero" in init && init.zero !== undefined && init.zero
    ? reg.setZero()
    : reg.clearZero();
  "negative" in init && init.negative !== undefined && !init.negative
    ? reg.setNegative()
    : reg.clearNegative();
  return reg;
};

interface Flags {
  carry?: boolean;
  zero?: boolean;
  negative?: boolean;
  overflow?: boolean;
}

export const checkFlags = (
  registers: Registers,
  flags: Pick<TestRegisters, "carry" | "overflow" | "zero" | "negative" | "decimal" | "interrupt">
) => {
  if ("carry" in flags) {
    expect(registers.getCarry()).toEqual(flags.carry);
  }

  if ("zero" in flags) {
    expect(registers.getZero()).toEqual(flags.zero);
  }

  if ("negative" in flags) {
    expect(registers.getNegative()).toEqual(flags.negative);
  }

  if ("overflow" in flags) {
    expect(registers.getOverflow()).toEqual(flags.overflow);
  }

  if ("decimal" in flags) {
    expect(registers.getDecimal()).toEqual(flags.decimal);
  }

  if ("interrupt" in flags) {
    expect(registers.getInteruptDisable()).toEqual(flags.interrupt);
  }
};

export const checkReg = (
  registers: Registers,
  testRegisters: Pick<TestRegisters, "a" | "y" | "x" | "pc">
) => {
  if ("x" in testRegisters) {
    expect(registers.getX()).toEqual(testRegisters.x);
  }

  if ("y" in testRegisters) {
    expect(registers.getY()).toEqual(testRegisters.y);
  }

  if ("a" in testRegisters) {
    expect(registers.getAccumulator()).toEqual(testRegisters.a);
  }

  if ("pc" in testRegisters) {
    expect(registers.getProgramCounter()).toEqual(testRegisters.pc);
  }
};

type INSTRUCTIONS = keyof typeof CPU_INSTRUCTION;
export const assertOpcode = (instruction: INSTRUCTIONS, opcode: number) => {
  expect(CPU_INSTRUCTION[instruction]).toEqual(opcode);
};

export const setup = (ram: RAM, reg: Registers) => {
  return new Execute(ram, reg);
};
