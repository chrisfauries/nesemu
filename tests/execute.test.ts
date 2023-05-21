import Execute from "../execute";
import { getRam, getRegisters, checkFlags, assertOpcode } from "./utils";

describe("Increment Instructions", () => {
  test("INX", () => {
    assertOpcode("INX", 0xe8);
    const ram = getRam();
    const reg = getRegisters({ x: 254 }); // -2 in 8bit signed
    Execute.INX(ram, reg);
    expect(reg.getX()).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    Execute.INX(ram, reg);
    expect(reg.getX()).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    Execute.INX(ram, reg);
    expect(reg.getX()).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INY", () => {
    assertOpcode("INY", 0xc8);
    const ram = getRam();
    const reg = getRegisters({ y: 254 }); // -2 in 8bit signed
    Execute.INY(ram, reg);
    expect(reg.getY()).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    Execute.INY(ram, reg);
    expect(reg.getY()).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    Execute.INY(ram, reg);
    expect(reg.getY()).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_Z", () => {
    const opcode = 0xe6;
    assertOpcode("INC_Z", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x02;
    const reg = getRegisters({ pc: 0x00 });
    Execute.INC_Z(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    Execute.INC_Z(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    Execute.INC_Z(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_ZX", () => {
    const opcode = 0xf6;
    assertOpcode("INC_ZX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x05: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x05;
    const reg = getRegisters({ pc: 0x00, x: 0x03 });
    Execute.INC_ZX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    Execute.INC_ZX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    Execute.INC_ZX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });

    // Test Wrap
    reg.setX(0xff);
    ram.set8(0x01, 0x06);
    reg.setProgramCounter(0x00);
    Execute.INC_ZX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(2);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_A", () => {
    const opcode = 0xee;
    assertOpcode("INC_A", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x07, 0x02: 0x00, 0x07: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00 });
    Execute.INC_A(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    Execute.INC_A(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    Execute.INC_A(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });
  });

  test("INC_AX", () => {
    const opcode = 0xfe;
    assertOpcode("INC_AX", opcode);
    const ram = getRam({ 0x00: opcode, 0x01: 0x02, 0x02: 0x00, 0x07: 0xfe }); // -2 in 8bit signed
    const valueLocation = 0x07;
    const reg = getRegisters({ pc: 0x00, x: 0x05 });
    Execute.INC_AX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(255); // -1
    checkFlags(reg, { zero: false, negative: true });
    reg.setProgramCounter(0x00);
    Execute.INC_AX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(0);
    checkFlags(reg, { zero: true, negative: false });
    reg.setProgramCounter(0x00);
    Execute.INC_AX(ram, reg);
    expect(ram.get8(valueLocation)).toEqual(1);
    checkFlags(reg, { zero: false, negative: false });

    // Extend past page
    reg.setX(0xff);
    ram.set8(0x101, 0x06);
    reg.setProgramCounter(0x00);
    Execute.INC_AX(ram, reg);
    expect(ram.get8(0x101)).toEqual(7);
    checkFlags(reg, { zero: false, negative: false });
  });
});

describe("Decrement Instructions", () => {});
