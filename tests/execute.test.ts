import { CPU_INSTRUCTION } from "../enums";
import {
  getRam,
  getRegisters,
  checkFlags,
  checkReg,
  assertOpcode,
  setup,
  checkRam,
} from "./utils";

describe("Increment Instructions", () => {
  test("INX", () => {
    assertOpcode("INX", 0xe8);
    const ram = getRam();
    const reg = getRegisters({ x: 254 }); // -2 in 8bit signed
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INX);
    checkReg(reg, { x: 255, pc: 1 }); // -1
    checkFlags(reg, { zero: false, negative: true });
    run.execute(CPU_INSTRUCTION.INX);
    checkReg(reg, { x: 0, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });
    run.execute(CPU_INSTRUCTION.INX);
    checkReg(reg, { x: 1, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INY", () => {
    assertOpcode("INY", 0xc8);
    const ram = getRam();
    const reg = getRegisters({ y: 254 }); // -2 in 8bit signed
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INY);
    checkReg(reg, { y: 255, pc: 1 }); // -1
    checkFlags(reg, { zero: false, negative: true });
    run.execute(CPU_INSTRUCTION.INY);
    checkReg(reg, { y: 0, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });
    run.execute(CPU_INSTRUCTION.INY);
    checkReg(reg, { y: 1, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_Z", () => {
    const opcode = 0xe6;
    assertOpcode("INC_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x02;
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INC_Z);
    checkReg(reg, { pc: 2 });
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_Z);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_Z);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_ZX", () => {
    const opcode = 0xf6;
    assertOpcode("INC_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x05: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x05;
    const reg = getRegisters({ pc: 0x00, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INC_ZX);
    checkReg(reg, { pc: 2 });
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_ZX);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_ZX);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });

    // Test Wrap
    reg.setX(0xff);
    ram.set8(0x01, 0x06);
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_ZX);
    expect(ram.get8(valueLocation)).toEqual(2);
    checkFlags(reg, { zero: false, negative: false });
    checkReg(reg, { pc: 2 });
  });

  test("INC_A", () => {
    const opcode = 0xee;
    assertOpcode("INC_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x07, 0x02: 0x00, 0x07: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INC_A);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_A);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_A);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_AX", () => {
    const opcode = 0xfe;
    assertOpcode("INC_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0x00, 0x07: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00, x: 0x05 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.INC_AX);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_AX);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_AX);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });

    // Extend past page
    reg.setX(0xff);
    ram.set8(0x101, 0x06);
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.INC_AX);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(0x101)).toEqual(7);
    checkFlags(reg, { zero: false, negative: false });
  });
});

// TODO: refactor everything below to use "checkReg" for PC

describe("Decrement Instructions", () => {
  test("DEX", () => {
    const opcode = 0xca;
    assertOpcode("DEX", opcode);
    const ram = getRam();
    const reg = getRegisters({ x: 2 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEX);
    checkReg(reg, { x: 1, pc: 1 });
    checkFlags(reg, { zero: false, negative: false });
    run.execute(CPU_INSTRUCTION.DEX);
    checkReg(reg, { x: 0, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });
    run.execute(CPU_INSTRUCTION.DEX);
    checkReg(reg, { x: 255, pc: 3 });
    expect(reg.getX()).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
  });

  test("DEY", () => {
    const opcode = 0x88;
    assertOpcode("DEY", opcode);
    const ram = getRam();
    const reg = getRegisters({ y: 2 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEY);
    checkReg(reg, { y: 1, pc: 1 });
    expect(reg.getY()).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
    run.execute(CPU_INSTRUCTION.DEY);
    checkReg(reg, { y: 0, pc: 2 });
    expect(reg.getY()).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    run.execute(CPU_INSTRUCTION.DEY);
    checkReg(reg, { y: 255, pc: 3 });
    expect(reg.getY()).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
  });

  test("DEC_Z", () => {
    const opcode = 0xc6;
    assertOpcode("DEC_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0x02 });
    const valueLocation = 0x02;
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEC_Z);
    checkReg(reg, { pc: 2 });
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_Z);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_Z);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
  });

  test("DEC_ZX", () => {
    const opcode = 0xd6;
    assertOpcode("DEC_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x05: 0x02 });
    const valueLocation = 0x05;
    const reg = getRegisters({ pc: 0x00, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEC_ZX);
    checkReg(reg, { pc: 2 });
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_ZX);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_ZX);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });

    // Test Wrap
    reg.setX(0xff);
    ram.set8(0x01, 0x06);
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_ZX);
    checkReg(reg, { pc: 2 });
    expect(ram.get8(valueLocation)).toEqual(254); // -2
    checkFlags(reg, { zero: false, negative: true });
  });

  test("DEC_A", () => {
    const opcode = 0xce;
    assertOpcode("DEC_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x07, 0x02: 0x00, 0x07: 0x02 });
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEC_A);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_A);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_A);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
  });

  test("DEC_AX", () => {
    const opcode = 0xde;
    assertOpcode("DEC_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0x00, 0x07: 0x02 });
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00, x: 0x05 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.DEC_AX);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_AX);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_AX);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });

    // Extend past page
    reg.setX(0xff);
    ram.set8(0x101, 0x06);
    reg.setProgramCounter(0x00);
    run.execute(CPU_INSTRUCTION.DEC_AX);
    checkReg(reg, { pc: 3 });
    expect(ram.get8(0x101)).toEqual(5);
    checkFlags(reg, { zero: false, negative: false });
  });
});

describe("Status Flag Instructions", () => {
  test("SEC", () => {
    const opcode = 0x38;
    assertOpcode("SEC", opcode);
    const ram = getRam();
    const reg = getRegisters({ carry: false });
    const run = setup(ram, reg);
    checkFlags(reg, { carry: false });
    run.execute(CPU_INSTRUCTION.SEC);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { carry: true });
    run.execute(CPU_INSTRUCTION.SEC);
    checkFlags(reg, { carry: true });
  });

  test("CLC", () => {
    const opcode = 0x18;
    assertOpcode("CLC", opcode);
    const ram = getRam();
    const reg = getRegisters({ carry: true });
    const run = setup(ram, reg);
    checkFlags(reg, { carry: true });
    run.execute(CPU_INSTRUCTION.CLC);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { carry: false });
    run.execute(CPU_INSTRUCTION.CLC);
    checkFlags(reg, { carry: false });
  });

  test("SED", () => {
    const opcode = 0xf8;
    assertOpcode("SED", opcode);
    const ram = getRam();
    const reg = getRegisters({ decimal: false });
    const run = setup(ram, reg);
    checkFlags(reg, { decimal: false });
    run.execute(CPU_INSTRUCTION.SED);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { decimal: true });
    run.execute(CPU_INSTRUCTION.SED);
    checkFlags(reg, { decimal: true });
  });

  test("CLD", () => {
    const opcode = 0xd8;
    assertOpcode("CLD", opcode);
    const ram = getRam();
    const reg = getRegisters({ decimal: true });
    const run = setup(ram, reg);
    checkFlags(reg, { decimal: true });
    run.execute(CPU_INSTRUCTION.CLD);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { decimal: false });
    run.execute(CPU_INSTRUCTION.CLD);
    checkFlags(reg, { decimal: false });
  });

  test("SEI", () => {
    const opcode = 0x78;
    assertOpcode("SEI", opcode);
    const ram = getRam();
    const reg = getRegisters({ interrupt: false });
    const run = setup(ram, reg);
    checkFlags(reg, { interrupt: false });
    run.execute(CPU_INSTRUCTION.SEI);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { interrupt: true });
    run.execute(CPU_INSTRUCTION.SEI);
    checkFlags(reg, { interrupt: true });
  });

  test("CLI", () => {
    const opcode = 0x58;
    assertOpcode("CLI", opcode);
    const ram = getRam();
    const reg = getRegisters({ interrupt: true });
    const run = setup(ram, reg);
    checkFlags(reg, { interrupt: true });
    run.execute(CPU_INSTRUCTION.CLI);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { interrupt: false });
    run.execute(CPU_INSTRUCTION.CLI);
    checkFlags(reg, { interrupt: false });
  });

  test("CLV", () => {
    const opcode = 0xb8;
    assertOpcode("CLV", opcode);
    const ram = getRam();
    const reg = getRegisters({ overflow: true });
    const run = setup(ram, reg);
    checkFlags(reg, { overflow: true });
    run.execute(CPU_INSTRUCTION.CLV);
    checkReg(reg, { pc: 1 });
    checkFlags(reg, { overflow: false });
    run.execute(CPU_INSTRUCTION.CLV);
    checkFlags(reg, { overflow: false });
  });
});

// TODO: for all logical operations, use describe.each()

describe("Logical AND Instructions", () => {
  test("AND_I", () => {
    const opcode = 0x29;
    assertOpcode("AND_I", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x01 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_I);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_I);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_I);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_Z", () => {
    const opcode = 0x25;
    assertOpcode("AND_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x05: 0x01 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_Z);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_Z);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_Z);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_ZX", () => {
    const opcode = 0x35;
    assertOpcode("AND_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: 0x01 });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_ZX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_ZX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_ZX);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wraps
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_ZX);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_A", () => {
    const opcode = 0x2d;
    assertOpcode("AND_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x05: 0x01 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_A);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_A);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_A);
    checkReg(reg, { a: 0x06, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_AX", () => {
    const opcode = 0x3d;
    assertOpcode("AND_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x01 });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_AX);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_AX);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_AX);
    checkReg(reg, { a: 0x06, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_AX);
    checkReg(reg, { a: 0x06, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_AY", () => {
    const opcode = 0x39;
    assertOpcode("AND_AY", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x01 });
    const reg = getRegisters({ a: 0x02, y: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_AY);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_AY);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_AY);
    checkReg(reg, { a: 0x06, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setY(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_AY);
    checkReg(reg, { a: 0x06, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_IX", () => {
    const opcode = 0x21;
    assertOpcode("AND_IX", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x02: 0x01, // value
      0x08: 0x02, // address (indirect + x)
      0x09: 0x00,
    });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_IX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_IX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_IX);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wrap
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xfe);
    ram.set8(0xfe, 0x02);
    ram.set8(0xff, 0x00);
    reg.setX(0x0a);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_IX);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("AND_IY", () => {
    const opcode = 0x31;
    assertOpcode("AND_IY", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x05: 0x08, // address (indirect) + y
      0x06: 0x00,
      0x0a: 0x01, // value
    });
    const reg = getRegisters({ a: 0x02, y: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.AND_IY);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0xff);
    reg.setAccumulator(0xff);
    run.execute(CPU_INSTRUCTION.AND_IY);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_IY);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x05, 0x0b);
    ram.set8(0x10a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.AND_IY);
    checkReg(reg, { a: 0x06, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
});

describe("Logical Exclusive OR Instructions", () => {
  test("EOR_I", () => {
    const opcode = 0x49;
    assertOpcode("EOR_I", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_I);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_I);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_I);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_Z", () => {
    const opcode = 0x45;
    assertOpcode("EOR_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x05: 0x02 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_Z);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_Z);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_Z);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_ZX", () => {
    const opcode = 0x55;
    assertOpcode("EOR_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: 0x02 });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_ZX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_ZX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_ZX);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wraps
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_ZX);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_A", () => {
    const opcode = 0x4d;
    assertOpcode("EOR_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x05: 0x02 });
    const reg = getRegisters({ a: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_A);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_A);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_A);
    checkReg(reg, { a: 0x09, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_AX", () => {
    const opcode = 0x5d;
    assertOpcode("EOR_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x02 });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_AX);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_AX);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_AX);
    checkReg(reg, { a: 0x09, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_AX);
    checkReg(reg, { a: 0x09, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_AY", () => {
    const opcode = 0x59;
    assertOpcode("EOR_AY", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x02 });
    const reg = getRegisters({ a: 0x02, y: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_AY);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_AY);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_AY);
    checkReg(reg, { a: 0x09, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setY(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_AY);
    checkReg(reg, { a: 0x09, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_IX", () => {
    const opcode = 0x41;
    assertOpcode("EOR_IX", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x02: 0x02, // value
      0x08: 0x02, // address (indirect + x)
      0x09: 0x00,
    });
    const reg = getRegisters({ a: 0x02, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_IX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_IX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_IX);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wrap
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xfe);
    ram.set8(0xfe, 0x02);
    ram.set8(0xff, 0x00);
    reg.setX(0x0a);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_IX);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("EOR_IY", () => {
    const opcode = 0x51;
    assertOpcode("EOR_IY", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x05: 0x08, // address (indirect) + y
      0x06: 0x00,
      0x0a: 0x02, // value
    });
    const reg = getRegisters({ a: 0x02, y: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.EOR_IY);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0xff);
    reg.setAccumulator(0x00);
    run.execute(CPU_INSTRUCTION.EOR_IY);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_IY);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x05, 0x0b);
    ram.set8(0x10a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.EOR_IY);
    checkReg(reg, { a: 0x09, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
});

describe("Logical Inclusive OR Instructions", () => {
  test("ORA_I", () => {
    const opcode = 0x09;
    assertOpcode("ORA_I", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x00 });
    const reg = getRegisters({ a: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_I);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_I);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_I);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_Z", () => {
    const opcode = 0x05;
    assertOpcode("ORA_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x05: 0x00 });
    const reg = getRegisters({ a: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_Z);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x0f);
    reg.setAccumulator(0xf0);
    run.execute(CPU_INSTRUCTION.ORA_Z);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_Z);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_ZX", () => {
    const opcode = 0x15;
    assertOpcode("ORA_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: 0x00 });
    const reg = getRegisters({ a: 0x00, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_ZX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_ZX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_ZX);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wraps
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_ZX);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_A", () => {
    const opcode = 0x0d;
    assertOpcode("ORA_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x05: 0x00 });
    const reg = getRegisters({ a: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_A);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_A);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x05, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_A);
    checkReg(reg, { a: 0x0f, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_AX", () => {
    const opcode = 0x1d;
    assertOpcode("ORA_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x00 });
    const reg = getRegisters({ a: 0x00, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_AX);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_AX);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_AX);
    checkReg(reg, { a: 0x0f, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setX(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_AX);
    checkReg(reg, { a: 0x0f, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_AY", () => {
    const opcode = 0x19;
    assertOpcode("ORA_AY", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x08: 0x00 });
    const reg = getRegisters({ a: 0x00, y: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_AY);
    checkReg(reg, { a: 0x00, pc: 3 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_AY);
    checkReg(reg, { a: 0xff, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x08, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_AY);
    checkReg(reg, { a: 0x0f, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xff);
    ram.set8(0x108, 0x07);
    reg.setY(0x09);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_AY);
    checkReg(reg, { a: 0x0f, pc: 3 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_IX", () => {
    const opcode = 0x01;
    assertOpcode("ORA_IX", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x02: 0x00, // value
      0x08: 0x02, // address (indirect + x)
      0x09: 0x00,
    });
    const reg = getRegisters({ a: 0x00, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_IX);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_IX);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x02, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_IX);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Wrap
    reg.setProgramCounter(0x00);
    ram.set8(0x01, 0xfe);
    ram.set8(0xfe, 0x02);
    ram.set8(0xff, 0x00);
    reg.setX(0x0a);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_IX);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
  test("ORA_IY", () => {
    const opcode = 0x11;
    assertOpcode("ORA_IY", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05, // indirect
      0x05: 0x08, // address (indirect) + y
      0x06: 0x00,
      0x0a: 0x00, // value
    });
    const reg = getRegisters({ a: 0x00, y: 0x02 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.ORA_IY);
    checkReg(reg, { a: 0x00, pc: 2 });
    checkFlags(reg, { zero: true, negative: false });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0xf0);
    reg.setAccumulator(0x0f);
    run.execute(CPU_INSTRUCTION.ORA_IY);
    checkReg(reg, { a: 0xff, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });

    reg.setProgramCounter(0x00);
    ram.set8(0x0a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_IY);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });

    // Next Page
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x05, 0x0b);
    ram.set8(0x10a, 0x07);
    reg.setAccumulator(0x0e);
    run.execute(CPU_INSTRUCTION.ORA_IY);
    checkReg(reg, { a: 0x0f, pc: 2 });
    checkFlags(reg, { zero: false, negative: false });
  });
});

interface LoadRegisterInputs {
  memVal: number;
  regVal: number;
  result: number;
  zero: boolean;
  negative: boolean;
}

describe.each<[LoadRegisterInputs]>([
  [{ memVal: 0x05, regVal: 0x00, result: 0x05, zero: false, negative: false }],
  [{ memVal: 0xff, regVal: 0x00, result: 0xff, zero: false, negative: true }],
  [{ memVal: 0x00, regVal: 0x00, result: 0x00, zero: true, negative: false }],
])(
  "Load Register Instructions",
  ({ memVal, regVal, result, zero, negative }) => {
    test("LDA_I" + `: ${result}`, () => {
      const opcode = 0xa9;
      assertOpcode("LDA_I", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: memVal });
      const reg = getRegisters({ a: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_I);
      checkReg(reg, { a: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDA_Z" + `: ${result}`, () => {
      const opcode = 0xa5;
      assertOpcode("LDA_Z", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
      const reg = getRegisters({ a: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_Z);
      checkReg(reg, { a: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDA_ZX" + `: ${result}`, () => {
      const opcode = 0xb5;
      assertOpcode("LDA_ZX", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
      const reg = getRegisters({ a: regVal, x: 0x03 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_ZX);
      checkReg(reg, { a: result, pc: 2 });
      checkFlags(reg, { zero, negative });

      // Wrap (TODO: move this)
      reg.setProgramCounter(0x00);
      reg.setX(0xff);
      ram.set8(0x04, 0x10);
      reg.setAccumulator(0x00);
      run.execute(CPU_INSTRUCTION.LDA_ZX);
      checkReg(reg, { a: 0x10, pc: 2 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDA_A" + `: ${result}`, () => {
      const opcode = 0xad;
      assertOpcode("LDA_A", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e05: memVal,
      });
      const reg = getRegisters({ a: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_A);
      checkReg(reg, { a: result, pc: 3 });
      checkFlags(reg, { zero, negative });
    });
    test("LDA_AX" + `: ${result}`, () => {
      const opcode = 0xbd;
      assertOpcode("LDA_AX", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e15: memVal,
      });
      const reg = getRegisters({ a: regVal, x: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_AX);
      checkReg(reg, { a: result, pc: 3 });
      checkFlags(reg, { zero, negative });

      // Next Page (TODO: move this)
      reg.setProgramCounter(0x00);
      reg.setX(0xff);
      ram.set8(0x2f04, 0x10);
      reg.setAccumulator(0x00);
      run.execute(CPU_INSTRUCTION.LDA_AX);
      checkReg(reg, { a: 0x10, pc: 3 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDA_AY" + `: ${result}`, () => {
      const opcode = 0xb9;
      assertOpcode("LDA_AY", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e15: memVal,
      });
      const reg = getRegisters({ a: regVal, y: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_AY);
      checkReg(reg, { a: result, pc: 3 });
      checkFlags(reg, { zero, negative });

      // Next Page (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setY(0xff);
      ram.set8(0x2f04, 0x10);
      reg.setAccumulator(0x00);
      run.execute(CPU_INSTRUCTION.LDA_AY);
      checkReg(reg, { a: 0x10, pc: 3 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDA_IX" + `: ${result}`, () => {
      const opcode = 0xa1;
      assertOpcode("LDA_IX", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x15: 0x02,
        0x16: 0x1d,
        0x1d02: memVal,
      });
      const reg = getRegisters({ a: regVal, x: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_IX);
      checkReg(reg, { a: result, pc: 2 });
      checkFlags(reg, { zero, negative });

      // Wrap (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setX(0xff);
      ram.set8(0x04, 0x02);
      ram.set8(0x05, 0x1d);
      ram.set8(0x1d02, 0x10);
      reg.setAccumulator(0x00);
      run.execute(CPU_INSTRUCTION.LDA_IX);
      checkReg(reg, { a: 0x10, pc: 2 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDA_IY" + `: ${result}`, () => {
      const opcode = 0xb1;
      assertOpcode("LDA_IY", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x05: 0x15,
        0x06: 0x2e,
        0x2e25: memVal,
      });
      const reg = getRegisters({ a: regVal, y: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDA_IY);
      checkReg(reg, { a: result, pc: 2 });
      checkFlags(reg, { zero, negative });

      // Next Page (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setY(0xff);
      ram.set8(0x2f14, 0x10);
      reg.setAccumulator(0x00);
      run.execute(CPU_INSTRUCTION.LDA_IY);
      checkReg(reg, { a: 0x10, pc: 2 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDX_I" + `: ${result}`, () => {
      const opcode = 0xa2;
      assertOpcode("LDX_I", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: memVal });
      const reg = getRegisters({ x: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDX_I);
      checkReg(reg, { x: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDX_Z" + `: ${result}`, () => {
      const opcode = 0xa6;
      assertOpcode("LDX_Z", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
      const reg = getRegisters({ x: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDX_Z);
      checkReg(reg, { x: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDX_ZY" + `: ${result}`, () => {
      const opcode = 0xb6;
      assertOpcode("LDX_ZY", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
      const reg = getRegisters({ x: regVal, y: 0x03 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDX_ZY);
      checkReg(reg, { x: result, pc: 2 });
      checkFlags(reg, { zero, negative });

      // Wrap (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setY(0xff);
      ram.set8(0x04, 0x10);
      reg.setX(0x00);
      run.execute(CPU_INSTRUCTION.LDX_ZY);
      checkReg(reg, { x: 0x10, pc: 2 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDX_A" + `: ${result}`, () => {
      const opcode = 0xae;
      assertOpcode("LDX_A", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e05: memVal,
      });
      const reg = getRegisters({ x: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDX_A);
      checkReg(reg, { x: result, pc: 3 });
      checkFlags(reg, { zero, negative });
    });
    test("LDX_AY" + `: ${result}`, () => {
      const opcode = 0xbe;
      assertOpcode("LDX_AY", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e15: memVal,
      });
      const reg = getRegisters({ x: regVal, y: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDX_AY);
      checkReg(reg, { x: result, pc: 3 });
      checkFlags(reg, { zero, negative });

      // Next Page (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setY(0xff);
      ram.set8(0x2f04, 0x10);
      reg.setX(0x00);
      run.execute(CPU_INSTRUCTION.LDX_AY);
      checkReg(reg, { x: 0x10, pc: 3 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDY_I" + `: ${result}`, () => {
      const opcode = 0xa0;
      assertOpcode("LDY_I", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: memVal });
      const reg = getRegisters({ y: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDY_I);
      checkReg(reg, { y: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDY_Z" + `: ${result}`, () => {
      const opcode = 0xa4;
      assertOpcode("LDY_Z", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
      const reg = getRegisters({ y: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDY_Z);
      checkReg(reg, { y: result, pc: 2 });
      checkFlags(reg, { zero, negative });
    });
    test("LDY_ZX" + `: ${result}`, () => {
      const opcode = 0xb4;
      assertOpcode("LDY_ZX", opcode);
      const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
      const reg = getRegisters({ y: regVal, x: 0x03 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDY_ZX);
      checkReg(reg, { y: result, pc: 2 });
      checkFlags(reg, { zero, negative });

      // Wrap (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setX(0xff);
      ram.set8(0x04, 0x10);
      reg.setY(0x00);
      run.execute(CPU_INSTRUCTION.LDY_ZX);
      checkReg(reg, { y: 0x10, pc: 2 });
      checkFlags(reg, { zero: false, negative: false });
    });
    test("LDY_A" + `: ${result}`, () => {
      const opcode = 0xac;
      assertOpcode("LDY_A", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e05: memVal,
      });
      const reg = getRegisters({ y: regVal });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDY_A);
      checkReg(reg, { y: result, pc: 3 });
      checkFlags(reg, { zero, negative });
    });
    test("LDY_AX" + `: ${result}`, () => {
      const opcode = 0xbc;
      assertOpcode("LDY_AX", opcode);
      const ram = getRam({
        0x00: opcode,
        0x01: 0x05,
        0x02: 0x2e,
        0x2e15: memVal,
      });
      const reg = getRegisters({ y: regVal, x: 0x10 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LDY_AX);
      checkReg(reg, { y: result, pc: 3 });
      checkFlags(reg, { zero, negative });

      // Next Page (TODO: Move this)
      reg.setProgramCounter(0x00);
      reg.setX(0xff);
      ram.set8(0x2f04, 0x10);
      reg.setY(0x00);
      run.execute(CPU_INSTRUCTION.LDY_AX);
      checkReg(reg, { y: 0x10, pc: 3 });
      checkFlags(reg, { zero: false, negative: false });
    });
  }
);

interface StoreRegisterInputs {
  memVal: number;
  regVal: number;
  result: number;
}

describe.each<[StoreRegisterInputs]>([
  [{ memVal: 0x00, regVal: 0x05, result: 0x05 }],
  [{ memVal: 0x00, regVal: 0xff, result: 0xff }],
  [{ memVal: 0x00, regVal: 0x00, result: 0x00 }],
])("Store Register Instructions", ({ memVal, regVal, result }) => {
  test("STA_Z" + `: ${result}`, () => {
    const opcode = 0x85;
    assertOpcode("STA_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
    const reg = getRegisters({ a: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_Z);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x08: result });
  });
  test("STA_ZX" + `: ${result}`, () => {
    const opcode = 0x95;
    assertOpcode("STA_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
    const reg = getRegisters({ a: regVal, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_ZX);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x08: result });

    // Wrap (TODO: move this)
    reg.setProgramCounter(0x00);
    reg.setX(0xff);
    ram.set8(0x04, 0x00);
    reg.setAccumulator(0x10);
    run.execute(CPU_INSTRUCTION.STA_ZX);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x04: 0x10 });
  });
  test("STA_A" + `: ${result}`, () => {
    const opcode = 0x8d;
    assertOpcode("STA_A", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e05: memVal,
    });
    const reg = getRegisters({ a: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_A);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2e05: result });
  });
  test("STA_AX" + `: ${result}`, () => {
    // Start here
    const opcode = 0x9d;
    assertOpcode("STA_AX", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e15: memVal,
    });
    const reg = getRegisters({ a: regVal, x: 0x10 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_AX);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2e15: result });

    // Next Page (TODO: move this)
    reg.setProgramCounter(0x00);
    reg.setX(0xff);
    ram.set8(0x2f04, 0x00);
    reg.setAccumulator(0x10);
    run.execute(CPU_INSTRUCTION.STA_AX);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2f04: 0x10 });
  });
  test("STA_AY" + `: ${result}`, () => {
    const opcode = 0x99;
    assertOpcode("STA_AY", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e15: memVal,
    });
    const reg = getRegisters({ a: regVal, y: 0x10 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_AY);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2e15: result });

    // Next Page (TODO: Move this)
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x2f04, 0x00);
    reg.setAccumulator(0x10);
    run.execute(CPU_INSTRUCTION.STA_AY);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2f04: 0x10 });
  });
  test("STA_IX" + `: ${result}`, () => {
    const opcode = 0x81;
    assertOpcode("STA_IX", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x15: 0x02,
      0x16: 0x1d,
      0x1d02: memVal,
    });
    const reg = getRegisters({ a: regVal, x: 0x10 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_IX);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x1d02: result });

    // Wrap (TODO: Move this)
    reg.setProgramCounter(0x00);
    reg.setX(0xff);
    ram.set8(0x04, 0x02);
    ram.set8(0x05, 0x1d);
    ram.set8(0x1d02, 0x00);
    reg.setAccumulator(0x10);
    run.execute(CPU_INSTRUCTION.STA_IX);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x1d02: 0x10 });
  });
  test("STA_IY" + `: ${result}`, () => {
    const opcode = 0x91;
    assertOpcode("STA_IY", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x05: 0x15,
      0x06: 0x2e,
      0x2e25: memVal,
    });
    const reg = getRegisters({ a: regVal, y: 0x10 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STA_IY);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x2e25: result });

    // Next Page (TODO: Move this)
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x2f14, 0x00);
    reg.setAccumulator(0x10);
    run.execute(CPU_INSTRUCTION.STA_IY);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x2f14: 0x10 });
  });

  test("STX_Z" + `: ${result}`, () => {
    const opcode = 0x86;
    assertOpcode("STX_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
    const reg = getRegisters({ x: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STX_Z);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x08: result });
  });
  test("STX_ZY" + `: ${result}`, () => {
    const opcode = 0x96;
    assertOpcode("STX_ZY", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
    const reg = getRegisters({ x: regVal, y: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STX_ZY);
    checkReg(reg, { x: result, pc: 2 });
    checkRam(ram, { 0x08: result });

    // Wrap (TODO: Move this)
    reg.setProgramCounter(0x00);
    reg.setY(0xff);
    ram.set8(0x04, 0x00);
    reg.setX(0x10);
    run.execute(CPU_INSTRUCTION.STX_ZY);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x04: 0x10 });
  });
  test("STX_A" + `: ${result}`, () => {
    const opcode = 0x8e;
    assertOpcode("STX_A", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e05: memVal,
    });
    const reg = getRegisters({ x: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STX_A);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2e05: result });
  });

  test("STY_Z" + `: ${result}`, () => {
    const opcode = 0x84;
    assertOpcode("STY_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x08, 0x08: memVal });
    const reg = getRegisters({ y: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STY_Z);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x08: result });
  });
  test("STY_ZX" + `: ${result}`, () => {
    const opcode = 0x94;
    assertOpcode("STY_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x08: memVal });
    const reg = getRegisters({ y: regVal, x: 0x03 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STY_ZX);
    checkReg(reg, { pc: 2 });
    checkRam(ram, { 0x08: result });

    // Wrap (TODO: Move this)
    reg.setProgramCounter(0x00);
    reg.setX(0xff);
    ram.set8(0x04, 0x00);
    reg.setY(0x10);
    run.execute(CPU_INSTRUCTION.STY_ZX);
    checkReg(reg, { y: 0x10, pc: 2 });
    checkRam(ram, { 0x04: 0x10 });
  });
  test("STY_A" + `: ${result}`, () => {
    const opcode = 0x8c;
    assertOpcode("STY_A", opcode);
    const ram = getRam({
      0x00: opcode,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e05: memVal,
    });
    const reg = getRegisters({ y: regVal });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.STY_A);
    checkReg(reg, { pc: 3 });
    checkRam(ram, { 0x2e05: result });
  });
});

interface TransferRegisterInputs {
  regOut: number;
  regIn: number;
  zero: boolean;
  negative: boolean;
}

describe.each<[TransferRegisterInputs]>([
  [{ regOut: 0x05, regIn: 0x00, zero: false, negative: false }],
  [{ regOut: 0xff, regIn: 0x00, zero: false, negative: true }],
  [{ regOut: 0x00, regIn: 0x00, zero: true, negative: false }],
])("Transfer Register Instructions", ({ regOut, regIn, zero, negative }) => {
  test("TAX", () => {
    const opcode = 0xaa;
    assertOpcode("TAX", opcode);
    const ram = getRam();
    const reg = getRegisters({ a: regOut, x: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TAX);
    checkReg(reg, { a: regOut, x: regOut });
    checkFlags(reg, { zero, negative });
  });
  test("TAY", () => {
    const opcode = 0xa8;
    assertOpcode("TAY", opcode);
    const ram = getRam();
    const reg = getRegisters({ a: regOut, y: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TAY);
    checkReg(reg, { a: regOut, y: regOut });
    checkFlags(reg, { zero, negative });
  });
  test("TSX", () => {
    const opcode = 0xba;
    assertOpcode("TSX", opcode);
    const ram = getRam();
    const reg = getRegisters({ stackPointer: regOut, x: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TSX);
    checkReg(reg, { stackPointer: regOut, x: regOut });
    checkFlags(reg, { zero, negative });
  });
  test("TXA", () => {
    const opcode = 0x8a;
    assertOpcode("TXA", opcode);
    const ram = getRam();
    const reg = getRegisters({ x: regOut, a: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TXA);
    checkReg(reg, { x: regOut, a: regOut });
    checkFlags(reg, { zero, negative });
  });
  test("TXS", () => {
    const opcode = 0x9a;
    assertOpcode("TXS", opcode);
    const ram = getRam();
    const reg = getRegisters({ x: regOut, stackPointer: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TXS);
    checkReg(reg, { x: regOut, stackPointer: regOut });
  });
  test("TYA", () => {
    const opcode = 0x98;
    assertOpcode("TYA", opcode);
    const ram = getRam();
    const reg = getRegisters({ y: regOut, a: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TYA);
    checkReg(reg, { y: regOut, a: regOut });
    checkFlags(reg, { zero, negative });
  });
});

describe("Comparison Instructions", () => {});
describe("Branch Register Instructions", () => {});

function getBit(a: number, bit: number) {
  return !!(a & (1 << bit)) ? 1 : 0;
}

function bitAdd(a: number, b: number, c: boolean) {
  let result = 0;
  let carry = c ? 1 : 0;
  let carry6 = 0;
  for (let bit = 0; bit < 8; bit++) {
    const aBit = getBit(a, bit);
    const bBit = getBit(b, bit);
    const bitResult = aBit + bBit + carry;
    carry = bitResult > 1 ? 1 : 0;
    result += bitResult % 2 << bit;
    if (bit === 6) {
      carry6 = carry;
    }
  }
  
  
  return {
    result,
    carry: !!carry,
    overflow: !!(carry ^ carry6),
  };
}

describe("Arithmetic Instructions", () => {
  test.only("SBC", () => {
    const a = 128;
    const b = 0;
    const c = false
    const compB = new Uint8Array([~b])[0];
    const actual = bitAdd(128, compB, c);
    expect(actual.carry).toBeTruthy();
    expect(actual.result).toEqual(127);
  });

  // test("ADC_AY", () => {
  //   const opcode = 0x79;
  //   assertOpcode("ADC_AY", opcode);

  //   // simple add (no flags, no carry)
  //   const ram = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x10 });
  //   const reg = getRegisters({ pc: 0x00, a: 0x10, y: 0x05, carry: false });
  //   Execute.ADC_AY(ram, reg);
  //   expect(reg.getAccumulator()).toEqual(0x20);
  //   checkFlags(reg, {
  //     carry: false,
  //     zero: false,
  //     negative: false,
  //     overflow: false,
  //   });

  //   // simple add with carry in (no flags)
  //   const ram2 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x10 });
  //   const reg2 = getRegisters({ pc: 0x00, a: 0x10, y: 0x05, carry: true });
  //   Execute.ADC_AY(ram2, reg2);
  //   expect(reg2.getAccumulator()).toEqual(0x21);
  //   checkFlags(reg2, {
  //     carry: false,
  //     zero: false,
  //     negative: false,
  //     overflow: false,
  //   });

  //   // add - 6 bit carry only (sets overflow and negative)
  //   const ram3 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x40 });
  //   const reg3 = getRegisters({ pc: 0x00, a: 0x40, y: 0x05, carry: false });
  //   Execute.ADC_AY(ram3, reg3);
  //   expect(reg3.getAccumulator()).toEqual(0x80);
  //   checkFlags(reg3, {
  //     carry: false,
  //     zero: false,
  //     negative: true,
  //     overflow: true,
  //   });

  //   // add with carry in - 6 bit carry only (sets overflow and negative)
  //   const ram4 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x3f });
  //   const reg4 = getRegisters({ pc: 0x00, a: 0x40, y: 0x05, carry: true });
  //   Execute.ADC_AY(ram4, reg4);
  //   expect(reg4.getAccumulator()).toEqual(0x80);
  //   checkFlags(reg4, {
  //     carry: false,
  //     zero: false,
  //     negative: true,
  //     overflow: true,
  //   });

  //   // add - 7 bit carry only (sets carry, overflow)
  //   const ram5 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x81 });
  //   const reg5 = getRegisters({ pc: 0x00, a: 0x81, y: 0x05, carry: false });
  //   Execute.ADC_AY(ram5, reg5);
  //   expect(reg5.getAccumulator()).toEqual(0x02);
  //   checkFlags(reg5, {
  //     carry: true,
  //     zero: false,
  //     negative: false,
  //     overflow: true,
  //   });

  //   // add with carry in - 7 bit carry only (sets carry, overflow)
  //   const ram6 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0x80 });
  //   const reg6 = getRegisters({ pc: 0x00, a: 0x80, y: 0x05, carry: true });
  //   Execute.ADC_AY(ram6, reg6);
  //   expect(reg6.getAccumulator()).toEqual(0x01);
  //   // TODO: fix this
  //   checkFlags(reg6, {
  //     carry: true,
  //     zero: false,
  //     negative: false,
  //     overflow: true,
  //   });

  //   // add - 6&7 bit carry (sets carry, negative)
  //   const ram7 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0xff });
  //   const reg7 = getRegisters({ pc: 0x00, a: 0xff, y: 0x05, carry: false });
  //   Execute.ADC_AY(ram7, reg7);
  //   expect(reg7.getAccumulator()).toEqual(0xfe);
  //   checkFlags(reg7, {
  //     carry: true,
  //     zero: false,
  //     negative: true,
  //     overflow: false,
  //   });

  //   // add with carry in - 6&7 bit carry (sets carry, negative)
  //   const ram8 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0xfe });
  //   const reg8 = getRegisters({ pc: 0x00, a: 0xff, y: 0x05, carry: true });
  //   Execute.ADC_AY(ram8, reg8);
  //   expect(reg8.getAccumulator()).toEqual(0xfe);
  //   checkFlags(reg8, {
  //     carry: true,
  //     zero: false,
  //     negative: true,
  //     overflow: false,
  //   });

  //   // overflow add - zero (sets carry and zero)
  //   const ram9 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0xff });
  //   const reg9 = getRegisters({ pc: 0x00, a: 0x01, y: 0x05, carry: false });
  //   Execute.ADC_AY(ram9, reg9);
  //   expect(reg9.getAccumulator()).toEqual(0x00);
  //   checkFlags(reg9, {
  //     carry: true,
  //     zero: true,
  //     negative: false,
  //     overflow: false,
  //   });

  //   // overflow add with carry - zero (sets carry and zero)
  //   const ram10 = getRam({ 0x00: opcode, 0x01: 0x05, 0x02: 0x00, 0x0a: 0xff });
  //   const reg10 = getRegisters({ pc: 0x00, a: 0x00, y: 0x05, carry: true });
  //   Execute.ADC_AY(ram10, reg10);
  //   expect(reg10.getAccumulator()).toEqual(0x00);
  //   checkFlags(reg10, {
  //     carry: true,
  //     zero: true,
  //     negative: false,
  //     overflow: false,
  //   });
  // });

  // test("SBC_AY", () => {
  //   // Write tests for this
  // });
});
