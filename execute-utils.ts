import { STATUS_FLAGS } from "./enums";
import RAM from "./ram";
import Registers from "./registers";

export enum ArithmeticType {
  Add,
  Subtract,
}

export enum StepDirection {
  Increment = 1,
  Decrement = -1,
}

export enum DataRegister {
  X,
  Y,
  A,
  STACK_POINTER,
}

export enum ShiftType {
  Shift,
  Rotate,
}

export enum ShiftDirection {
  Left,
  Right,
}

export enum AddressingMode {
  Accumulator,
  Immediate,
  Zero_Page,
  Zero_Page_Offset_X,
  Zero_Page_Offset_Y,
  Absolute,
  Absolute_X,
  Absolute_Y,
  Indirect_Offset_X,
  Indirect_Offset_Y,
  Relative,
}

export enum LogicalOperationType {
  AND,
  EXCLUSIVE_OR,
  INCLUSIVE_OR,
}

const POST_EXECUTION_PC_STEPS = {
  [AddressingMode.Accumulator]: 0,
  [AddressingMode.Immediate]: 1,
  [AddressingMode.Zero_Page]: 1,
  [AddressingMode.Zero_Page_Offset_X]: 1,
  [AddressingMode.Zero_Page_Offset_Y]: 1,
  [AddressingMode.Absolute]: 2,
  [AddressingMode.Absolute_X]: 2,
  [AddressingMode.Absolute_Y]: 2,
  [AddressingMode.Indirect_Offset_X]: 1,
  [AddressingMode.Indirect_Offset_Y]: 1,
  [AddressingMode.Relative]: 1,
} as const;

// Util Functions
class Utils {
  private ram: RAM;
  private registers: Registers;
  constructor(ram: RAM, registers: Registers) {
    this.ram = ram;
    this.registers = registers;
  }

  public pushStack(bit16Value: number) {
    const low = bit16Value & 0b11111111;
    const high = bit16Value >> 8;
    this.ram.set8(0x100 + this.registers.getStackPointer(), high);
    this.registers.decrementStackPointer();
    this.ram.set8(0x100 + this.registers.getStackPointer(), low);
    this.registers.decrementStackPointer();
  }

  public pushStackValue(bit8Value: number) {
    this.ram.set8(0x100 + this.registers.getStackPointer(), bit8Value);
    this.registers.decrementStackPointer();
  }

  public pullStack() {
    this.registers.incrementStackPointer();
    const low = this.ram.get8(0x100 + this.registers.getStackPointer());
    this.registers.incrementStackPointer();
    const high = this.ram.get8(0x100 + this.registers.getStackPointer());
    return (high << 8) + low;
  }

  public pullStackValue() {
    this.registers.incrementStackPointer();
    return this.ram.get8(0x100 + this.registers.getStackPointer());
  }

  public logicalOperation(type: LogicalOperationType, mode: AddressingMode) {
    this.incPC();
    const value = this.getValue(mode);
    const result = this.doLogic(
      value,
      this.getRegisterValue(DataRegister.A),
      type
    );
    this.setRegisterValue(DataRegister.A, result);
    this.setNZ(this.getRegisterValue(DataRegister.A));
    this.postOpIncPC(mode);
  }

  private doLogic(a: number, b: number, type: LogicalOperationType) {
    switch (type) {
      case LogicalOperationType.AND:
        return a & b;
      case LogicalOperationType.EXCLUSIVE_OR:
        return a ^ b;
      case LogicalOperationType.INCLUSIVE_OR:
        return a | b;
    }
  }

  public stepRegister(
    direction: StepDirection,
    reg: Exclude<DataRegister, DataRegister.A>
  ) {
    this.setRegisterValue(reg, this.getRegisterValue(reg) + direction);
    this.setNZ(this.getRegisterValue(reg));
    this.incPC();
  }

  public stepMemory(
    direction: StepDirection,
    mode: Extract<
      AddressingMode,
      | AddressingMode.Zero_Page
      | AddressingMode.Zero_Page_Offset_X
      | AddressingMode.Absolute
      | AddressingMode.Absolute_X
    >
  ) {
    this.incPC();
    this.setValue(mode, this.getValue(mode) + direction);
    this.setNZ(this.getValue(mode));
    this.postOpIncPC(mode);
  }

  public arithmetic(mode: AddressingMode, type: ArithmeticType) {
    this.incPC();
    const a = this.getRegisterValue(DataRegister.A);
    const m = this.getValue(mode);
    const mCompliment = new Uint8Array([~m])[0];
    const c = this.getFlagValue(STATUS_FLAGS.CARRY);
    const { result, carry, overflow } = Utils.bitAdd(
      a,
      type === ArithmeticType.Add ? m : mCompliment,
      c
    );
    this.setRegisterValue(DataRegister.A, result);
    this.setNZ(this.getRegisterValue(DataRegister.A));
    carry
      ? this.setFlagValue(STATUS_FLAGS.CARRY)
      : this.clearFlagValue(STATUS_FLAGS.CARRY);
    overflow
      ? this.setFlagValue(STATUS_FLAGS.OVERFLOW)
      : this.clearFlagValue(STATUS_FLAGS.OVERFLOW);
    this.postOpIncPC(mode);
  }

  public compare(mode: AddressingMode, reg: DataRegister) {
    this.incPC();
    const r = this.getRegisterValue(reg);
    const m = this.getValue(mode);
    const { result } = Utils.bitAdd(r, ~m + 1, false);
    this.setNZ(result);
    r >= m
      ? this.setFlagValue(STATUS_FLAGS.CARRY)
      : this.clearFlagValue(STATUS_FLAGS.CARRY);
    this.postOpIncPC(mode);
  }

  public branch(condition: boolean) {
    this.incPC();
    const rel = this.getValue(AddressingMode.Relative);
    this.postOpIncPC(AddressingMode.Relative);
    if (condition) {
      this.incPC(rel);
    }
  }

  public shift(
    mode: AddressingMode,
    type: ShiftType,
    direction: ShiftDirection
  ) {
    this.incPC();
    const value = this.getValue(mode);
    const carryIn = type === ShiftType.Rotate ? +this.registers.getCarry() : 0;
    let carryOut: boolean;
    let shiftedValue: number;
    switch (direction) {
      case ShiftDirection.Left:
        carryOut = !!(value & 0b1000_0000);
        shiftedValue = ((value << 1) & 0b1111_1111) | carryIn;
        break;
      case ShiftDirection.Right:
        carryOut = !!(value & 0b0000_0001);
        shiftedValue = (value >> 1) | (carryIn << 7);
        break;
    }

    carryOut ? this.registers.setCarry() : this.registers.clearCarry();

    this.setValue(mode, shiftedValue);
    this.setNZ(shiftedValue);
    this.postOpIncPC(mode);
  }

  public test(mode: AddressingMode) {
    this.incPC();
    const a = this.registers.getAccumulator();
    const m = this.getValue(mode);
    const overflow = !!(m & 0b0100_0000);
    overflow ? this.registers.setOverflow() : this.registers.clearOverflow();
    const negative = !!(m & 0b1000_0000);
    negative ? this.registers.setNegative() : this.registers.clearNegative();
    const zero = !(a & m);
    zero ? this.registers.setZero() : this.registers.clearZero();
    this.postOpIncPC(mode);
  }

  public loadDataRegister(reg: DataRegister, mode: AddressingMode) {
    this.incPC();
    this.setRegisterValue(reg, this.getValue(mode));
    this.registers.setZeroNegativeFlagsFromValue(this.getRegisterValue(reg));
    this.postOpIncPC(mode);
  }

  public storeDataRegister(reg: DataRegister, mode: AddressingMode) {
    this.incPC();
    this.setValue(mode, this.getRegisterValue(reg));
    this.postOpIncPC(mode);
  }

  public transferDataRegister(from: DataRegister, to: DataRegister) {
    this.incPC();
    this.setRegisterValue(to, this.getRegisterValue(from));
    to !== DataRegister.STACK_POINTER && this.setNZ(this.getRegisterValue(to));
  }

  // TODO: make private after refactor
  public getValue(addressingMode: AddressingMode) {
    switch (addressingMode) {
      case AddressingMode.Accumulator:
        return this.registers.getAccumulator();
      case AddressingMode.Immediate:
        return this.getImmediateValue();
      case AddressingMode.Zero_Page:
        return this.getZeroPageValue();
      case AddressingMode.Zero_Page_Offset_X:
        return this.getZeroPageOffsetValue(DataRegister.X);
      case AddressingMode.Zero_Page_Offset_Y:
        return this.getZeroPageOffsetValue(DataRegister.Y);
      case AddressingMode.Absolute:
        return this.getAbsoluteValue();
      case AddressingMode.Absolute_X:
        return this.getAbsoluteOffsetValue(DataRegister.X);
      case AddressingMode.Absolute_Y:
        return this.getAbsoluteOffsetValue(DataRegister.Y);
      case AddressingMode.Indirect_Offset_X:
        return this.getIndirectOffsetXValue();
      case AddressingMode.Indirect_Offset_Y:
        return this.getIndirectOffsetYValue();
      case AddressingMode.Relative:
        return this.getRelativeValue();
    }
  }

  // TODO: make private after refactor
  private setValue(addressingMode: AddressingMode, val: number) {
    switch (addressingMode) {
      case AddressingMode.Accumulator:
        return this.registers.setAccumulator(val);
      case AddressingMode.Zero_Page:
        return this.setZeroPageValue(val);
      case AddressingMode.Zero_Page_Offset_X:
        return this.setZeroPageOffsetValue(DataRegister.X, val);
      case AddressingMode.Zero_Page_Offset_Y:
        return this.setZeroPageOffsetValue(DataRegister.Y, val);
      case AddressingMode.Absolute:
        return this.setAbsoluteValue(val);
      case AddressingMode.Absolute_X:
        return this.setAbsoluteOffsetValue(DataRegister.X, val);
      case AddressingMode.Absolute_Y:
        return this.setAbsoluteOffsetValue(DataRegister.Y, val);
      case AddressingMode.Indirect_Offset_X:
        return this.setIndirectOffsetXValue(val);
      case AddressingMode.Indirect_Offset_Y:
        return this.setIndirectOffsetYValue(val);
      case AddressingMode.Relative:
        throw new Error("can not set Relative value");
    }
  }

  private getRegisterValue(register: DataRegister) {
    switch (register) {
      case DataRegister.X:
        return this.registers.getX();
      case DataRegister.Y:
        return this.registers.getY();
      case DataRegister.A:
        return this.registers.getAccumulator();
      case DataRegister.STACK_POINTER:
        return this.registers.getStackPointer();
    }
  }

  private setRegisterValue(register: DataRegister, val: number) {
    switch (register) {
      case DataRegister.X:
        return this.registers.setX(val);
      case DataRegister.Y:
        return this.registers.setY(val);
      case DataRegister.A:
        return this.registers.setAccumulator(val);
      case DataRegister.STACK_POINTER:
        return this.registers.setStackPointer(val);
    }
  }

  private getFlagValue(flag: STATUS_FLAGS) {
    switch (flag) {
      case STATUS_FLAGS.CARRY:
        return this.registers.getCarry();
      case STATUS_FLAGS.DECIMAL:
        return this.registers.getDecimal();
      case STATUS_FLAGS.INTERUPT_DISABLE:
        return this.registers.getInteruptDisable();
      case STATUS_FLAGS.NEGATIVE:
        return this.registers.getNegative();
      case STATUS_FLAGS.OVERFLOW:
        return this.registers.getOverflow();
      case STATUS_FLAGS.ZERO:
        return this.registers.getZero();
      default:
        throw new Error("can get no_effect flag");
    }
  }

  private setFlagValue(flag: STATUS_FLAGS) {
    switch (flag) {
      case STATUS_FLAGS.CARRY:
        return this.registers.setCarry();
      case STATUS_FLAGS.DECIMAL:
        return this.registers.setDecimal();
      case STATUS_FLAGS.INTERUPT_DISABLE:
        return this.registers.setInteruptDisable();
      case STATUS_FLAGS.NEGATIVE:
        return this.registers.setNegative();
      case STATUS_FLAGS.OVERFLOW:
        return this.registers.setOverflow();
      case STATUS_FLAGS.ZERO:
        return this.registers.setZero();
      default:
        throw new Error("can get no_effect flag");
    }
  }

  private clearFlagValue(flag: STATUS_FLAGS) {
    switch (flag) {
      case STATUS_FLAGS.CARRY:
        return this.registers.clearCarry();
      case STATUS_FLAGS.DECIMAL:
        return this.registers.clearDecimal();
      case STATUS_FLAGS.INTERUPT_DISABLE:
        return this.registers.clearInteruptDisable();
      case STATUS_FLAGS.NEGATIVE:
        return this.registers.clearNegative();
      case STATUS_FLAGS.OVERFLOW:
        return this.registers.clearOverflow();
      case STATUS_FLAGS.ZERO:
        return this.registers.clearZero();
      default:
        throw new Error("can get no_effect flag");
    }
  }

  private setNZ(val: number) {
    this.registers.setZeroNegativeFlagsFromValue(val);
  }

  private incPC(val?: number) {
    this.registers.incrementProgramCounter(val);
  }
  private postOpIncPC(mode: AddressingMode) {
    this.registers.incrementProgramCounter(POST_EXECUTION_PC_STEPS[mode]);
  }

  private getImmediateValue() {
    return this.ram.get8(this.registers.getProgramCounter());
  }

  private getZeroPageValue() {
    return this.ram.get8(this.ram.get8(this.registers.getProgramCounter()));
  }

  private setZeroPageValue(val: number) {
    return this.ram.set8(
      this.ram.get8(this.registers.getProgramCounter()),
      val
    );
  }

  private getZeroPageOffsetValue(
    register: Extract<DataRegister, DataRegister.X | DataRegister.Y>
  ) {
    return this.ram.get8(
      (this.ram.get8(this.registers.getProgramCounter()) +
        this.getRegisterValue(register)) %
        0x100
    );
  }

  private setZeroPageOffsetValue(
    register: Extract<DataRegister, DataRegister.X | DataRegister.Y>,
    val: number
  ) {
    return this.ram.set8(
      (this.ram.get8(this.registers.getProgramCounter()) +
        this.getRegisterValue(register)) %
        0x100,
      val
    );
  }

  private getAbsoluteValue() {
    return this.ram.get8(this.ram.get16(this.registers.getProgramCounter()));
  }

  private setAbsoluteValue(val: number) {
    return this.ram.set8(
      this.ram.get16(this.registers.getProgramCounter()),
      val
    );
  }

  private getAbsoluteOffsetValue(
    register: Extract<DataRegister, DataRegister.X | DataRegister.Y>
  ) {
    return this.ram.get8(
      this.ram.get16(this.registers.getProgramCounter()) +
        this.getRegisterValue(register)
    );
  }

  private setAbsoluteOffsetValue(
    register: Extract<DataRegister, DataRegister.X | DataRegister.Y>,
    val: number
  ) {
    return this.ram.set8(
      this.ram.get16(this.registers.getProgramCounter()) +
        this.getRegisterValue(register),
      val
    );
  }

  private getIndirectOffsetXValue() {
    const indirect = this.ram.get8(this.registers.getProgramCounter());
    const effective =
      (indirect + this.getRegisterValue(DataRegister.X)) % 0x100;
    return this.ram.get8(this.ram.get16(effective));
  }

  private setIndirectOffsetXValue(val: number) {
    const indirect = this.ram.get8(this.registers.getProgramCounter());
    const effective =
      (indirect + this.getRegisterValue(DataRegister.X)) % 0x100;
    return this.ram.set8(this.ram.get16(effective), val);
  }

  private getIndirectOffsetYValue() {
    const indirect = this.ram.get8(this.registers.getProgramCounter());
    const address = this.ram.get16(indirect);
    return this.ram.get8(address + this.getRegisterValue(DataRegister.Y));
  }

  private setIndirectOffsetYValue(val: number) {
    const indirect = this.ram.get8(this.registers.getProgramCounter());
    const address = this.ram.get16(indirect);
    return this.ram.set8(address + this.getRegisterValue(DataRegister.Y), val);
  }

  private getRelativeValue() {
    return this.ram.get8signed(this.registers.getProgramCounter());
  }

  static notImplemented(opcode: string) {
    throw new TypeError("Not implementation for " + opcode);
  }

  static bitAdd(a: number, b: number, c: boolean) {
    let result = 0;
    let carry = c ? 1 : 0;
    let carry6 = 0;
    for (let bit = 0; bit < 8; bit++) {
      const aBit = Utils.getBit(a, bit);
      const bBit = Utils.getBit(b, bit);
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

  private static getBit(a: number, bit: number) {
    return !!(a & (1 << bit)) ? 1 : 0;
  }
}

export default Utils;
