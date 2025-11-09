import { CPU_INSTRUCTION } from "../enums";
import {
  getRam,
  getRegisters,
  checkFlags,
  checkReg,
  assertOpcode,
  setup,
  checkRam,
  TestRegisters,
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
    checkReg(reg, { x: regVal, pc: 2 }); // STX_ZY doesn't modify X
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
    checkReg(reg, { a: regOut, x: regOut, pc: 1 });
    checkFlags(reg, { zero, negative });
  });
  test("TAY", () => {
    const opcode = 0xa8;
    assertOpcode("TAY", opcode);
    const ram = getRam();
    const reg = getRegisters({ a: regOut, y: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TAY);
    checkReg(reg, { a: regOut, y: regOut, pc: 1 });
    checkFlags(reg, { zero, negative });
  });
  test("TSX", () => {
    const opcode = 0xba;
    assertOpcode("TSX", opcode);
    const ram = getRam();
    const reg = getRegisters({ stackPointer: regOut, x: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TSX);
    checkReg(reg, { stackPointer: regOut, x: regOut, pc: 1 });
    checkFlags(reg, { zero, negative });
  });
  test("TXA", () => {
    const opcode = 0x8a;
    assertOpcode("TXA", opcode);
    const ram = getRam();
    const reg = getRegisters({ x: regOut, a: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TXA);
    checkReg(reg, { x: regOut, a: regOut, pc: 1 });
    checkFlags(reg, { zero, negative });
  });
  test("TXS", () => {
    const opcode = 0x9a;
    assertOpcode("TXS", opcode);
    const ram = getRam();
    const reg = getRegisters({ x: regOut, stackPointer: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TXS);
    checkReg(reg, { x: regOut, stackPointer: regOut, pc: 1 });
    // TXS does not update flags
    checkFlags(reg, { zero, negative });
  });
  test("TYA", () => {
    const opcode = 0x98;
    assertOpcode("TYA", opcode);
    const ram = getRam();
    const reg = getRegisters({ y: regOut, a: regIn });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.TYA);
    checkReg(reg, { y: regOut, a: regOut, pc: 1 });
    checkFlags(reg, { zero, negative });
  });
});

interface ArithmeticTestCases {
  a: number;
  m: number;
  cIn: boolean;
  result: number;
  cOut: boolean;
  v: boolean;
  z: boolean;
  n: boolean;
}

describe("Arithmetic Instructions", () => {
  describe.each<[ArithmeticTestCases]>([
    // ADC Cases
    // Simple add
    [
      {
        a: 0x10,
        m: 0x10,
        cIn: false,
        result: 0x20,
        cOut: false,
        v: false,
        z: false,
        n: false,
      },
    ],
    // Simple add with carry in
    [
      {
        a: 0x10,
        m: 0x10,
        cIn: true,
        result: 0x21,
        cOut: false,
        v: false,
        z: false,
        n: false,
      },
    ],
    // 6th bit carry (overflow)
    [
      {
        a: 0x40,
        m: 0x40,
        cIn: false,
        result: 0x80,
        cOut: false,
        v: false,
        z: false,
        n: true,
      },
    ],
    // 6th bit carry (overflow) with carry in
    [
      {
        a: 0x40,
        m: 0x3f,
        cIn: true,
        result: 0x80,
        cOut: false,
        v: false,
        z: false,
        n: true,
      },
    ],
    // 7th bit carry (carry out)
    [
      {
        a: 0x80,
        m: 0x80,
        cIn: false,
        result: 0x00,
        cOut: true,
        v: false,
        z: true,
        n: false,
      },
    ],
    // 7th bit carry (carry out) with carry in
    [
      {
        a: 0x80,
        m: 0x7f,
        cIn: true,
        result: 0x00,
        cOut: true,
        v: false,
        z: true,
        n: false,
      },
    ],
    // 6 & 7 bit carry
    [
      {
        a: 0xc0,
        m: 0xc0,
        cIn: false,
        result: 0x80,
        cOut: true,
        v: false,
        z: false,
        n: true,
      },
    ],
    // 6 & 7 bit carry with carry in
    [
      {
        a: 0xc0,
        m: 0xbf,
        cIn: true,
        result: 0x80,
        cOut: true,
        v: false,
        z: false,
        n: true,
      },
    ],
  ])(
    "ADC",
    ({ a, m, cIn, result, cOut, v, z, n }) => {
      test(`ADC_I: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_I", 0x69);
        const ram = getRam({ 0x00: 0x69, 0x01: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_I);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_Z: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_Z", 0x65);
        const ram = getRam({ 0x00: 0x65, 0x01: 0x10, 0x10: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_Z);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_ZX: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_ZX", 0x75);
        const ram = getRam({ 0x00: 0x75, 0x01: 0x10, 0x12: m });
        const reg = getRegisters({ a: a, x: 0x02, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_ZX);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_A: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_A", 0x6d);
        const ram = getRam({ 0x00: 0x6d, 0x01: 0x34, 0x02: 0x12, 0x1234: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_A);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_AX: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_AX", 0x7d);
        const ram = getRam({ 0x00: 0x7d, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
        const reg = getRegisters({ a: a, x: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_AX);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_AY: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_AY", 0x79);
        const ram = getRam({ 0x00: 0x79, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
        const reg = getRegisters({ a: a, y: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_AY);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_IX: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_IX", 0x61);
        const ram = getRam({
          0x00: 0x61,
          0x01: 0x10,
          0x12: 0x34,
          0x13: 0x12,
          0x1234: m,
        });
        const reg = getRegisters({ a: a, x: 0x02, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_IX);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`ADC_IY: ${a.toString(16)}+${m.toString(16)}+${
        cIn ? 1 : 0
      }`, () => {
        assertOpcode("ADC_IY", 0x71);
        const ram = getRam({
          0x00: 0x71,
          0x01: 0x10,
          0x10: 0x34,
          0x11: 0x12,
          0x1239: m,
        });
        const reg = getRegisters({ a: a, y: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.ADC_IY);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });
    }
  );

  describe.each<[ArithmeticTestCases]>([
    // SBC Cases (A + ~M + C)
    // 0x10 - 0x10, C=1 (0x10 + 0xEF + 1)
    [
      {
        a: 0x10,
        m: 0x10,
        cIn: true,
        result: 0x00,
        cOut: true,
        v: false,
        z: true,
        n: false,
      },
    ],
    // 0x10 - 0x10, C=0 (0x10 + 0xEF + 0)
    [
      {
        a: 0x10,
        m: 0x10,
        cIn: false,
        result: 0xff,
        cOut: false,
        v: false,
        z: false,
        n: true,
      },
    ],
    // 0x80 - 0x01, C=1 (0x80 + 0xFE + 1) -> 0x7F, V=1
    [
      {
        a: 0x80,
        m: 0x01,
        cIn: true,
        result: 0x7f,
        cOut: true,
        v: true,
        z: false,
        n: false,
      },
    ],
    // 0x01 - 0x80, C=1 (0x01 + 0x7F + 1) -> 0x81, V=1
    [
      {
        a: 0x01,
        m: 0x80,
        cIn: true,
        result: 0x81,
        cOut: false,
        v: true,
        z: false,
        n: true,
      },
    ],
    // 0x00 - 0x01, C=0 (0x00 + 0xFE + 0)
    [
      {
        a: 0x00,
        m: 0x01,
        cIn: false,
        result: 0xfe,
        cOut: false,
        v: false,
        z: false,
        n: true,
      },
    ],
  ])(
    "SBC",
    ({ a, m, cIn, result, cOut, v, z, n }) => {
      test(`SBC_I: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_I", 0xe9);
        const ram = getRam({ 0x00: 0xe9, 0x01: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_I);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_Z: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_Z", 0xe5);
        const ram = getRam({ 0x00: 0xe5, 0x01: 0x10, 0x10: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_Z);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_ZX: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_ZX", 0xf5);
        const ram = getRam({ 0x00: 0xf5, 0x01: 0x10, 0x12: m });
        const reg = getRegisters({ a: a, x: 0x02, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_ZX);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_A: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_A", 0xed);
        const ram = getRam({ 0x00: 0xed, 0x01: 0x34, 0x02: 0x12, 0x1234: m });
        const reg = getRegisters({ a: a, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_A);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_AX: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_AX", 0xfd);
        const ram = getRam({ 0x00: 0xfd, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
        const reg = getRegisters({ a: a, x: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_AX);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_AY: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_AY", 0xf9);
        const ram = getRam({ 0x00: 0xf9, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
        const reg = getRegisters({ a: a, y: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_AY);
        checkReg(reg, { a: result, pc: 3 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_IX: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_IX", 0xe1);
        const ram = getRam({
          0x00: 0xe1,
          0x01: 0x10,
          0x12: 0x34,
          0x13: 0x12,
          0x1234: m,
        });
        const reg = getRegisters({ a: a, x: 0x02, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_IX);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });

      test(`SBC_IY: ${a.toString(16)}-${m.toString(16)}-${
        cIn ? 0 : 1
      }`, () => {
        assertOpcode("SBC_IY", 0xf1);
        const ram = getRam({
          0x00: 0xf1,
          0x01: 0x10,
          0x10: 0x34,
          0x11: 0x12,
          0x1239: m,
        });
        const reg = getRegisters({ a: a, y: 0x05, carry: cIn });
        const run = setup(ram, reg);
        run.execute(CPU_INSTRUCTION.SBC_IY);
        checkReg(reg, { a: result, pc: 2 });
        checkFlags(reg, { carry: cOut, overflow: v, zero: z, negative: n });
      });
    }
  );
});

interface CompareTestCases {
  r: number;
  m: number;
  c: boolean;
  z: boolean;
  n: boolean;
}

describe("Comparison Instructions", () => {
  describe.each<[CompareTestCases]>([
    // R > M
    [{ r: 0x10, m: 0x05, c: true, z: false, n: false }],
    // R == M
    [{ r: 0x10, m: 0x10, c: true, z: true, n: false }],
    // R < M
    [{ r: 0x10, m: 0x20, c: false, z: false, n: true }],
    // R < M (negative wrap)
    [{ r: 0x00, m: 0x01, c: false, z: false, n: true }],
  ])("CMP", ({ r, m, c, z, n }) => {
    test(`CMP_I: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_I", 0xc9);
      const ram = getRam({ 0x00: 0xc9, 0x01: m });
      const reg = getRegisters({ a: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_I);
      checkReg(reg, { a: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_Z: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_Z", 0xc5);
      const ram = getRam({ 0x00: 0xc5, 0x01: 0x10, 0x10: m });
      const reg = getRegisters({ a: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_Z);
      checkReg(reg, { a: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_ZX: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_ZX", 0xd5);
      const ram = getRam({ 0x00: 0xd5, 0x01: 0x10, 0x12: m });
      const reg = getRegisters({ a: r, x: 0x02 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_ZX);
      checkReg(reg, { a: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_A: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_A", 0xcd);
      const ram = getRam({ 0x00: 0xcd, 0x01: 0x34, 0x02: 0x12, 0x1234: m });
      const reg = getRegisters({ a: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_A);
      checkReg(reg, { a: r, pc: 3 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_AX: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_AX", 0xdd);
      const ram = getRam({ 0x00: 0xdd, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
      const reg = getRegisters({ a: r, x: 0x05 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_AX);
      checkReg(reg, { a: r, pc: 3 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_AY: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_AY", 0xd9);
      const ram = getRam({ 0x00: 0xd9, 0x01: 0x34, 0x02: 0x12, 0x1239: m });
      const reg = getRegisters({ a: r, y: 0x05 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_AY);
      checkReg(reg, { a: r, pc: 3 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_IX: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_IX", 0xc1);
      const ram = getRam({
        0x00: 0xc1,
        0x01: 0x10,
        0x12: 0x34,
        0x13: 0x12,
        0x1234: m,
      });
      const reg = getRegisters({ a: r, x: 0x02 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_IX);
      checkReg(reg, { a: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CMP_IY: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CMP_IY", 0xd1);
      const ram = getRam({
        0x00: 0xd1,
        0x01: 0x10,
        0x10: 0x34,
        0x11: 0x12,
        0x1239: m,
      });
      const reg = getRegisters({ a: r, y: 0x05 });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CMP_IY);
      checkReg(reg, { a: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });
  });

  describe.each<[CompareTestCases]>([
    // R > M
    [{ r: 0x10, m: 0x05, c: true, z: false, n: false }],
    // R == M
    [{ r: 0x10, m: 0x10, c: true, z: true, n: false }],
    // R < M
    [{ r: 0x10, m: 0x20, c: false, z: false, n: true }],
  ])("CPX", ({ r, m, c, z, n }) => {
    test(`CPX_I: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPX_I", 0xe0);
      const ram = getRam({ 0x00: 0xe0, 0x01: m });
      const reg = getRegisters({ x: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPX_I);
      checkReg(reg, { x: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CPX_Z: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPX_Z", 0xe4);
      const ram = getRam({ 0x00: 0xe4, 0x01: 0x10, 0x10: m });
      const reg = getRegisters({ x: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPX_Z);
      checkReg(reg, { x: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CPX_A: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPX_A", 0xec);
      const ram = getRam({ 0x00: 0xec, 0x01: 0x34, 0x02: 0x12, 0x1234: m });
      const reg = getRegisters({ x: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPX_A);
      checkReg(reg, { x: r, pc: 3 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });
  });

  describe.each<[CompareTestCases]>([
    // R > M
    [{ r: 0x10, m: 0x05, c: true, z: false, n: false }],
    // R == M
    [{ r: 0x10, m: 0x10, c: true, z: true, n: false }],
    // R < M
    [{ r: 0x10, m: 0x20, c: false, z: false, n: true }],
  ])("CPY", ({ r, m, c, z, n }) => {
    test(`CPY_I: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPY_I", 0xc0);
      const ram = getRam({ 0x00: 0xc0, 0x01: m });
      const reg = getRegisters({ y: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPY_I);
      checkReg(reg, { y: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CPY_Z: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPY_Z", 0xc4);
      const ram = getRam({ 0x00: 0xc4, 0x01: 0x10, 0x10: m });
      const reg = getRegisters({ y: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPY_Z);
      checkReg(reg, { y: r, pc: 2 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });

    test(`CPY_A: ${r.toString(16)} vs ${m.toString(16)}`, () => {
      assertOpcode("CPY_A", 0xcc);
      const ram = getRam({ 0x00: 0xcc, 0x01: 0x34, 0x02: 0x12, 0x1234: m });
      const reg = getRegisters({ y: r });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.CPY_A);
      checkReg(reg, { y: r, pc: 3 });
      checkFlags(reg, { carry: c, zero: z, negative: n });
    });
  });
});

describe("Stack Register Instructions", () => {
  test("PHA", () => {
    assertOpcode("PHA", 0x48);
    const ram = getRam();
    const reg = getRegisters({ a: 0xab, stackPointer: 0xff });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.PHA);
    checkReg(reg, { pc: 1, stackPointer: 0xfe });
    checkRam(ram, { 0x01ff: 0xab });
  });

  test("PHP", () => {
    assertOpcode("PHP", 0x08);
    const ram = getRam();
    // P = 10001101 (N=1, V=0, D=0, I=0, Z=1, C=1)
    const reg = getRegisters({
      stackPointer: 0xff,
      negative: true,
      overflow: false,
      decimal: false,
      interrupt: false,
      zero: true,
      carry: true,
    });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.PHP);
    checkReg(reg, { pc: 1, stackPointer: 0xfe });
    // Pushes 10111101 (Bits 4 and 5 are set)
    checkRam(ram, { 0x01ff: 0xbd });
  });

  test("PLA", () => {
    assertOpcode("PLA", 0x68);
    const ram = getRam({ 0x01ff: 0xab });
    const reg = getRegisters({ a: 0x00, stackPointer: 0xfe });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.PLA);
    checkReg(reg, { a: 0xab, pc: 1, stackPointer: 0xff });
    checkFlags(reg, { zero: false, negative: true });

    // Check zero flag
    ram.set8(0x01ff, 0x00);
    reg.setStackPointer(0xfe);
    run.execute(CPU_INSTRUCTION.PLA);
    checkReg(reg, { a: 0x00, pc: 2, stackPointer: 0xff });
    checkFlags(reg, { zero: true, negative: false });
  });

  test("PLP", () => {
    assertOpcode("PLP", 0x28);
    // 10101101 (N=1, V=0, D=0, I=0, Z=1, C=1)
    // Bits 4 and 5 should be ignored
    const ram = getRam({ 0x01ff: 0xad });
    const reg = getRegisters({ stackPointer: 0xfe });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.PLP);
    checkReg(reg, { pc: 1, stackPointer: 0xff });
    checkFlags(reg, {
      negative: true,
      overflow: false,
      decimal: false,
      interrupt: false,
      zero: true,
      carry: true,
    });
  });
});

describe("Branch Register Instructions", () => {
  // offset 0x0A (10)
  test("BCC - Branch", () => {
    assertOpcode("BCC", 0x90);
    const ram = getRam({ 0x00: 0x90, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, carry: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BCC);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BCC - No Branch", () => {
    assertOpcode("BCC", 0x90);
    const ram = getRam({ 0x00: 0x90, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, carry: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BCC);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  // offset 0xF6 (-10)
  test("BCS - Branch", () => {
    assertOpcode("BCS", 0xb0);
    const ram = getRam({ 0x00: 0xb0, 0x01: 0xf6 });
    const reg = getRegisters({ pc: 0x00, carry: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BCS);
    checkReg(reg, { pc: 0xf8 }); // 0x00 + 2 - 10
  });

  test("BCS - No Branch", () => {
    assertOpcode("BCS", 0xb0);
    const ram = getRam({ 0x00: 0xb0, 0x01: 0xf6 });
    const reg = getRegisters({ pc: 0x00, carry: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BCS);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BEQ - Branch", () => {
    assertOpcode("BEQ", 0xf0);
    const ram = getRam({ 0x00: 0xf0, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, zero: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BEQ);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BEQ - No Branch", () => {
    assertOpcode("BEQ", 0xf0);
    const ram = getRam({ 0x00: 0xf0, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, zero: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BEQ);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BNE - Branch", () => {
    assertOpcode("BNE", 0xd0);
    const ram = getRam({ 0x00: 0xd0, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, zero: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BNE);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BNE - No Branch", () => {
    assertOpcode("BNE", 0xd0);
    const ram = getRam({ 0x00: 0xd0, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, zero: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BNE);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BMI - Branch", () => {
    assertOpcode("BMI", 0x30);
    const ram = getRam({ 0x00: 0x30, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, negative: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BMI);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BMI - No Branch", () => {
    assertOpcode("BMI", 0x30);
    const ram = getRam({ 0x00: 0x30, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, negative: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BMI);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BPL - Branch", () => {
    assertOpcode("BPL", 0x10);
    const ram = getRam({ 0x00: 0x10, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, negative: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BPL);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BPL - No Branch", () => {
    assertOpcode("BPL", 0x10);
    const ram = getRam({ 0x00: 0x10, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, negative: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BPL);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BVC - Branch", () => {
    assertOpcode("BVC", 0x50);
    const ram = getRam({ 0x00: 0x50, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, overflow: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BVC);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BVC - No Branch", () => {
    assertOpcode("BVC", 0x50);
    const ram = getRam({ 0x00: 0x50, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, overflow: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BVC);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });

  test("BVS - Branch", () => {
    assertOpcode("BVS", 0x70);
    const ram = getRam({ 0x00: 0x70, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, overflow: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BVS);
    checkReg(reg, { pc: 0x0c }); // 0x00 + 2 + 0x0a
  });

  test("BVS - No Branch", () => {
    assertOpcode("BVS", 0x70);
    const ram = getRam({ 0x00: 0x70, 0x01: 0x0a });
    const reg = getRegisters({ pc: 0x00, overflow: false });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BVS);
    checkReg(reg, { pc: 0x02 }); // 0x00 + 2
  });
});

interface ShiftTestCases {
  in: number;
  cIn: boolean;
  out: number;
  cOut: boolean;
  z: boolean;
  n: boolean;
}

describe("Shift & Rotate Instructions", () => {
  describe.each<[ShiftTestCases]>([
    // 01010101 -> 10101010, C=0
    [
      {
        in: 0x55,
        cIn: false,
        out: 0xaa,
        cOut: false,
        z: false,
        n: true,
      },
    ],
    // 10101010 -> 01010100, C=1
    [
      {
        in: 0xaa,
        cIn: false,
        out: 0x54,
        cOut: true,
        z: false,
        n: false,
      },
    ],
    // 00000000 -> 00000000, C=0
    [{ in: 0x00, cIn: false, out: 0x00, cOut: false, z: true, n: false }],
    // 10000000 -> 00000000, C=1
    [{ in: 0x80, cIn: false, out: 0x00, cOut: true, z: true, n: false }],
  ])("ASL", ({ in: valIn, cIn, out, cOut, z, n }) => {
    test(`ASL_ACC: ${valIn.toString(16)}`, () => {
      assertOpcode("ASL_ACC", 0x0a);
      const ram = getRam({ 0x00: 0x0a });
      const reg = getRegisters({ a: valIn, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ASL_ACC);
      checkReg(reg, { a: out, pc: 1 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ASL_Z: ${valIn.toString(16)}`, () => {
      assertOpcode("ASL_Z", 0x06);
      const ram = getRam({ 0x00: 0x06, 0x01: 0x10, 0x10: valIn });
      const reg = getRegisters({ carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ASL_Z);
      checkRam(ram, { 0x10: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ASL_ZX: ${valIn.toString(16)}`, () => {
      assertOpcode("ASL_ZX", 0x16);
      const ram = getRam({ 0x00: 0x16, 0x01: 0x10, 0x12: valIn });
      const reg = getRegisters({ x: 0x02, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ASL_ZX);
      checkRam(ram, { 0x12: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ASL_A: ${valIn.toString(16)}`, () => {
      assertOpcode("ASL_A", 0x0e);
      const ram = getRam({ 0x00: 0x0e, 0x01: 0x34, 0x02: 0x12, 0x1234: valIn });
      const reg = getRegisters({ carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ASL_A);
      checkRam(ram, { 0x1234: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ASL_AX: ${valIn.toString(16)}`, () => {
      assertOpcode("ASL_AX", 0x1e);
      const ram = getRam({ 0x00: 0x1e, 0x01: 0x34, 0x02: 0x12, 0x1239: valIn });
      const reg = getRegisters({ x: 0x05, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ASL_AX);
      checkRam(ram, { 0x1239: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });
  });

  describe.each<[ShiftTestCases]>([
    // 01010101 -> 00101010, C=1
    [
      {
        in: 0x55,
        cIn: false,
        out: 0x2a,
        cOut: true,
        z: false,
        n: false,
      },
    ],
    // 10101010 -> 01010101, C=0
    [
      {
        in: 0xaa,
        cIn: false,
        out: 0x55,
        cOut: false,
        z: false,
        n: false,
      },
    ],
    // 00000000 -> 00000000, C=0
    [{ in: 0x00, cIn: false, out: 0x00, cOut: false, z: true, n: false }],
    // 00000001 -> 00000000, C=1
    [{ in: 0x01, cIn: false, out: 0x00, cOut: true, z: true, n: false }],
  ])("LSR", ({ in: valIn, cIn, out, cOut, z, n }) => {
    test(`LSR_ACC: ${valIn.toString(16)}`, () => {
      assertOpcode("LSR_ACC", 0x4a);
      const ram = getRam({ 0x00: 0x4a });
      const reg = getRegisters({ a: valIn, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LSR_ACC);
      checkReg(reg, { a: out, pc: 1 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`LSR_Z: ${valIn.toString(16)}`, () => {
      assertOpcode("LSR_Z", 0x46);
      const ram = getRam({ 0x00: 0x46, 0x01: 0x10, 0x10: valIn });
      const reg = getRegisters({ carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LSR_Z);
      checkRam(ram, { 0x10: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`LSR_ZX: ${valIn.toString(16)}`, () => {
      assertOpcode("LSR_ZX", 0x56);
      const ram = getRam({ 0x00: 0x56, 0x01: 0x10, 0x12: valIn });
      const reg = getRegisters({ x: 0x02, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LSR_ZX);
      checkRam(ram, { 0x12: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`LSR_A: ${valIn.toString(16)}`, () => {
      assertOpcode("LSR_A", 0x4e);
      const ram = getRam({ 0x00: 0x4e, 0x01: 0x34, 0x02: 0x12, 0x1234: valIn });
      const reg = getRegisters({ carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LSR_A);
      checkRam(ram, { 0x1234: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`LSR_AX: ${valIn.toString(16)}`, () => {
      assertOpcode("LSR_AX", 0x5e);
      const ram = getRam({ 0x00: 0x5e, 0x01: 0x34, 0x02: 0x12, 0x1239: valIn });
      const reg = getRegisters({ x: 0x05, carry: cIn }); // cIn has no effect
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.LSR_AX);
      checkRam(ram, { 0x1239: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });
  });

  describe.each<[ShiftTestCases]>([
    // 01010101, C=0 -> 10101010, C=0
    [
      {
        in: 0x55,
        cIn: false,
        out: 0xaa,
        cOut: false,
        z: false,
        n: true,
      },
    ],
    // 01010101, C=1 -> 10101011, C=0
    [
      {
        in: 0x55,
        cIn: true,
        out: 0xab,
        cOut: false,
        z: false,
        n: true,
      },
    ],
    // 10101010, C=0 -> 01010100, C=1
    [
      {
        in: 0xaa,
        cIn: false,
        out: 0x54,
        cOut: true,
        z: false,
        n: false,
      },
    ],
    // 10101010, C=1 -> 01010101, C=1
    [
      {
        in: 0xaa,
        cIn: true,
        out: 0x55,
        cOut: true,
        z: false,
        n: false,
      },
    ],
    // 10000000, C=1 -> 00000001, C=1
    [{ in: 0x80, cIn: true, out: 0x01, cOut: true, z: false, n: false }],
  ])("ROL", ({ in: valIn, cIn, out, cOut, z, n }) => {
    test(`ROL_ACC: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROL_ACC", 0x2a);
      const ram = getRam({ 0x00: 0x2a });
      const reg = getRegisters({ a: valIn, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROL_ACC);
      checkReg(reg, { a: out, pc: 1 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROL_Z: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROL_Z", 0x26);
      const ram = getRam({ 0x00: 0x26, 0x01: 0x10, 0x10: valIn });
      const reg = getRegisters({ carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROL_Z);
      checkRam(ram, { 0x10: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROL_ZX: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROL_ZX", 0x36);
      const ram = getRam({ 0x00: 0x36, 0x01: 0x10, 0x12: valIn });
      const reg = getRegisters({ x: 0x02, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROL_ZX);
      checkRam(ram, { 0x12: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROL_A: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROL_A", 0x2e);
      const ram = getRam({ 0x00: 0x2e, 0x01: 0x34, 0x02: 0x12, 0x1234: valIn });
      const reg = getRegisters({ carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROL_A);
      checkRam(ram, { 0x1234: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROL_AX: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROL_AX", 0x3e);
      const ram = getRam({ 0x00: 0x3e, 0x01: 0x34, 0x02: 0x12, 0x1239: valIn });
      const reg = getRegisters({ x: 0x05, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROL_AX);
      checkRam(ram, { 0x1239: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });
  });

  describe.each<[ShiftTestCases]>([
    // 01010101, C=0 -> 00101010, C=1
    [
      {
        in: 0x55,
        cIn: false,
        out: 0x2a,
        cOut: true,
        z: false,
        n: false,
      },
    ],
    // 01010101, C=1 -> 10101010, C=1
    [
      {
        in: 0x55,
        cIn: true,
        out: 0xaa,
        cOut: true,
        z: false,
        n: true,
      },
    ],
    // 10101010, C=0 -> 01010101, C=0
    [
      {
        in: 0xaa,
        cIn: false,
        out: 0x55,
        cOut: false,
        z: false,
        n: false,
      },
    ],
    // 10101010, C=1 -> 11010101, C=0
    [
      {
        in: 0xaa,
        cIn: true,
        out: 0xd5,
        cOut: false,
        z: false,
        n: true,
      },
    ],
    // 00000001, C=1 -> 10000000, C=1
    [{ in: 0x01, cIn: true, out: 0x80, cOut: true, z: false, n: true }],
  ])("ROR", ({ in: valIn, cIn, out, cOut, z, n }) => {
    test(`ROR_ACC: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROR_ACC", 0x6a);
      const ram = getRam({ 0x00: 0x6a });
      const reg = getRegisters({ a: valIn, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROR_ACC);
      checkReg(reg, { a: out, pc: 1 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROR_Z: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROR_Z", 0x66);
      const ram = getRam({ 0x00: 0x66, 0x01: 0x10, 0x10: valIn });
      const reg = getRegisters({ carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROR_Z);
      checkRam(ram, { 0x10: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROR_ZX: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROR_ZX", 0x76);
      const ram = getRam({ 0x00: 0x76, 0x01: 0x10, 0x12: valIn });
      const reg = getRegisters({ x: 0x02, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROR_ZX);
      checkRam(ram, { 0x12: out });
      checkReg(reg, { pc: 2 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROR_A: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROR_A", 0x6e);
      const ram = getRam({ 0x00: 0x6e, 0x01: 0x34, 0x02: 0x12, 0x1234: valIn });
      const reg = getRegisters({ carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROR_A);
      checkRam(ram, { 0x1234: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });

    test(`ROR_AX: ${valIn.toString(16)}, C_in=${cIn}`, () => {
      assertOpcode("ROR_AX", 0x7e);
      const ram = getRam({ 0x00: 0x7e, 0x01: 0x34, 0x02: 0x12, 0x1239: valIn });
      const reg = getRegisters({ x: 0x05, carry: cIn });
      const run = setup(ram, reg);
      run.execute(CPU_INSTRUCTION.ROR_AX);
      checkRam(ram, { 0x1239: out });
      checkReg(reg, { pc: 3 });
      checkFlags(reg, { carry: cOut, zero: z, negative: n });
    });
  });
});

describe("Jump Instructions", () => {
  test("JMP_A", () => {
    assertOpcode("JMP_A", 0x4c);
    const ram = getRam({ 0x00: 0x4c, 0x01: 0x34, 0x02: 0x12 });
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.JMP_A);
    checkReg(reg, { pc: 0x1234 });
  });

  test("JMP_I", () => {
    assertOpcode("JMP_I", 0x6c);
    const ram = getRam({
      0x00: 0x6c,
      0x01: 0x34,
      0x02: 0x12,
      0x1234: 0xcd,
      0x1235: 0xab,
    });
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.JMP_I);
    checkReg(reg, { pc: 0xabcd });
  });

  test("JMP_I - Page Wrap Bug", () => {
    assertOpcode("JMP_I", 0x6c);
    const ram = getRam({
      0x00: 0x6c,
      0x01: 0xff,
      0x02: 0x12, // Indirect vector at $12FF
      0x12ff: 0xcd, // Low byte
      0x1200: 0xab, // High byte (from $1200, not $1300)
    });
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.JMP_I);
    checkReg(reg, { pc: 0xabcd });
  });

  test("JSR", () => {
    assertOpcode("JSR", 0x20);
    const ram = getRam({ 0x00: 0x20, 0x01: 0x34, 0x02: 0x12 });
    const reg = getRegisters({ pc: 0x00, stackPointer: 0xff });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.JSR);
    checkReg(reg, { pc: 0x1234, stackPointer: 0xfd });
    // PC is $0000, JSR is at $0000, $0001, $0002. It pushes PC+2 ($0002)
    checkRam(ram, { 0x01ff: 0x00, 0x01fe: 0x02 });
  });

  test("RTS", () => {
    assertOpcode("RTS", 0x60);
    const ram = getRam({ 0x00: 0x60, 0x01ff: 0x12, 0x01fe: 0x33 }); // Pushed $1233
    const reg = getRegisters({ pc: 0x00, stackPointer: 0xfd });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.RTS);
    checkReg(reg, { pc: 0x1234, stackPointer: 0xff }); // Pulls $1233, adds 1
  });
});

describe("Interrupt Instructions", () => {
  test("NMI", () => {
    assertOpcode("NMI", 0xfffa); // This is the vector, not an opcode
    const ram = getRam({ 0xfffa: 0x34, 0xfffb: 0x12 }); // NMI vector -> $1234
    const reg = getRegisters({
      pc: 0xabcd,
      stackPointer: 0xff,
      interrupt: false,
    });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.NMI);
    checkReg(reg, { pc: 0xc60f, stackPointer: 0xfc });
    checkFlags(reg, { interrupt: true });
    // Pushes PC (ABCD) and Status
    checkRam(ram, { 0x01ff: 0xab, 0x01fe: 0xcd });
    // Status (bits 4&5 set, I=1)
    expect(ram.get8(0x01fd)).toBe(reg.getStatusRegister());
  });

  test("RTI", () => {
    assertOpcode("RTI", 0x40);
    // Pushes 10101101 (N=1, V=0, D=0, I=0, Z=1, C=1)
    // Pushes PC $ABCD
    const ram = getRam({ 0x00: 0x40, 0x01ff: 0xab, 0x01fe: 0xcd, 0x01fd: 0xad });
    const reg = getRegisters({ pc: 0x00, stackPointer: 0xfc, interrupt: true });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.RTI);
    checkReg(reg, { pc: 0xabcd, stackPointer: 0xff });
    checkFlags(reg, {
      negative: true,
      overflow: false,
      decimal: false,
      interrupt: true, zero: false, carry: true,
    });
  });
});

describe("Other Instructions", () => {
  test("BIT_Z", () => {
    assertOpcode("BIT_Z", 0x24);
    // M = 11000001
    // A = 01000001
    // A & M = 01000001 (Z=0, V=0, N=1)
    let ram = getRam({ 0x00: 0x24, 0x01: 0x10, 0x10: 0xc1 });
    let reg = getRegisters({ a: 0x41 });
    let run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_Z);
    checkReg(reg, { pc: 2 });
    checkFlags(reg, { zero: false, overflow: false, negative: true });

    // M = 01000001
    // A = 10000001
    // A & M = 00000001 (Z=0, V=1, N=0)
    ram = getRam({ 0x00: 0x24, 0x01: 0x10, 0x10: 0x41 });
    reg = getRegisters({ a: 0x81 });
    run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_Z);
    checkReg(reg, { pc: 2 });
    checkFlags(reg, { zero: false, overflow: true, negative: false });

    // M = 00000001
    // A = 00000010
    // A & M = 00000000 (Z=1, V=0, N=0)
    ram = getRam({ 0x00: 0x24, 0x01: 0x10, 0x10: 0x01 });
    reg = getRegisters({ a: 0x02 });
    run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_Z);
    checkReg(reg, { pc: 2 });
    checkFlags(reg, { zero: true, overflow: false, negative: false });
  });

  test("BIT_A", () => {
    assertOpcode("BIT_A", 0x2c);
    // M = 11000001
    // A = 01000001
    // A & M = 01000001 (Z=0, V=0, N=1)
    let ram = getRam({ 0x00: 0x2c, 0x01: 0x34, 0x02: 0x12, 0x1234: 0xc1 });
    let reg = getRegisters({ a: 0x41 });
    let run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_A);
    checkReg(reg, { pc: 3 });
    checkFlags(reg, { zero: false, overflow: false, negative: true });

    // M = 01000001
    // A = 10000001
    // A & M = 00000001 (Z=0, V=1, N=0)
    ram = getRam({ 0x00: 0x2c, 0x01: 0x34, 0x02: 0x12, 0x1234: 0x41 });
    reg = getRegisters({ a: 0x81 });
    run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_A);
    checkReg(reg, { pc: 3 });
    checkFlags(reg, { zero: false, overflow: true, negative: false });

    // M = 00000001
    // A = 00000010
    // A & M = 00000000 (Z=1, V=0, N=0)
    ram = getRam({ 0x00: 0x2c, 0x01: 0x34, 0x02: 0x12, 0x1234: 0x01 });
    reg = getRegisters({ a: 0x02 });
    run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.BIT_A);
    checkReg(reg, { pc: 3 });
    checkFlags(reg, { zero: true, overflow: false, negative: false });
  });

  test("NOP", () => {
    assertOpcode("NOP", 0xea);
    const ram = getRam({ 0x00: 0xea });
    const reg = getRegisters({ pc: 0x00 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.NOP);
    checkReg(reg, { pc: 1 });
  });
});

describe("Illegal Instructions", () => {
  test("NOP (Illegal - 1 byte)", () => {
    const opcodes = [0x1a, 0x3a, 0x5a, 0x7a, 0xda, 0xfa];
    opcodes.forEach((op, i) => {
      const ram = getRam({ 0x00: op });
      const reg = getRegisters({ pc: 0x00 });
      const run = setup(ram, reg);
      run.execute(op as CPU_INSTRUCTION);
      checkReg(reg, { pc: 1 });
    });
  });

  test("NOP (Illegal - 2 bytes)", () => {
    const opcodes = [
      0x80, 0x04, 0x44, 0x64, 0x14, 0x34, 0x54, 0x74, 0xd4, 0xf4,
    ];
    opcodes.forEach((op, i) => {
      const ram = getRam({ 0x00: op, 0x01: 0xff });
      const reg = getRegisters({ pc: 0x00 });
      const run = setup(ram, reg);
      run.execute(op as CPU_INSTRUCTION);
      checkReg(reg, { pc: 2 });
    });
  });

  test("NOP (Illegal - 3 bytes)", () => {
    const opcodes = [0x0c, 0x1c, 0x3c, 0x5c, 0x7c, 0xdc, 0xfc];
    opcodes.forEach((op, i) => {
      const ram = getRam({ 0x00: op, 0x01: 0xff, 0x02: 0xff });
      const reg = getRegisters({ pc: 0x00 });
      const run = setup(ram, reg);
      run.execute(op as CPU_INSTRUCTION);
      checkReg(reg, { pc: 3 });
    });
  });

  test("LAX_IX", () => {
    assertOpcode("LAX_IX", 0xa3);
    const ram = getRam({
      0x00: 0xa3,
      0x01: 0x05,
      0x15: 0x02,
      0x16: 0x1d,
      0x1d02: 0xab,
    });
    const reg = getRegisters({ x: 0x10 });
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.LAX_IX);
    checkReg(reg, { a: 0xab, x: 0xab, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });
  });

  test("LAX_Z", () => {
    assertOpcode("LAX_Z", 0xa7);
    const ram = getRam({ 0x00: 0xa7, 0x01: 0x08, 0x08: 0xab });
    const reg = getRegisters({});
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.LAX_Z);
    checkReg(reg, { a: 0xab, x: 0xab, pc: 2 });
    checkFlags(reg, { zero: false, negative: true });
  });

  test("LAX_A", () => {
    assertOpcode("LAX_A", 0xaf);
    const ram = getRam({
      0x00: 0xaf,
      0x01: 0x05,
      0x02: 0x2e,
      0x2e05: 0xab,
    });
    const reg = getRegisters({});
    const run = setup(ram, reg);
    run.execute(CPU_INSTRUCTION.LAX_A);
    checkReg(reg, { a: 0xab, x: 0xab, pc: 3 });
    checkFlags(reg, { zero: false, negative: true });
  });
});

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
    result += (bitResult % 2) << bit;
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