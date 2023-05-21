import { STATUS_FLAGS } from "./enums";

class Registers {
  private programCounter: Uint16Array;
  private accumulator: Uint8Array;
  private x: Uint8Array;
  private y: Uint8Array;
  private stackPointer: Uint8Array;
  private status: Uint8Array;
  private SET_MASK: number = 0x01;

  constructor() {
    this.programCounter = new Uint16Array([0xfffc]);
    this.accumulator = new Uint8Array([0]);
    this.x = new Uint8Array([0]);
    this.y = new Uint8Array([0]);
    this.stackPointer = new Uint8Array([0]);
    this.status = new Uint8Array([0]);
  }

  getInteruptDisable() {
    return this.getStatus(STATUS_FLAGS.INTERUPT_DISABLE);
  }

  setInteruptDisable() {
    return this.setStatus(STATUS_FLAGS.INTERUPT_DISABLE);
  }

  clearInteruptDisable() {
    return this.clearStatus(STATUS_FLAGS.INTERUPT_DISABLE);
  }

  getDecimal() {
    return this.getStatus(STATUS_FLAGS.DECIMAL);
  }

  setDecimal() {
    return this.setStatus(STATUS_FLAGS.DECIMAL);
  }

  clearDecimal() {
    return this.clearStatus(STATUS_FLAGS.DECIMAL);
  }

  getZero() {
    return this.getStatus(STATUS_FLAGS.ZERO);
  }

  setZeroFromValue(val: number) {
    val === 0 ? this.setZero() : this.clearZero();
    return this;
  }

  setZero() {
    return this.setStatus(STATUS_FLAGS.ZERO);
  }

  clearZero() {
    return this.clearStatus(STATUS_FLAGS.ZERO);
  }

  getNegative() {
    return this.getStatus(STATUS_FLAGS.NEGATIVE);
  }

  setNegativeFromValue(val:number) {
    ((val & 0b10000000) >> 7) & 1 ? this.setNegative() : this.clearNegative();
  }

  setNegative() {
    return this.setStatus(STATUS_FLAGS.NEGATIVE);
  }

  clearNegative() {
    return this.clearStatus(STATUS_FLAGS.NEGATIVE);
  }

  getCarry() {
    return this.getStatus(STATUS_FLAGS.CARRY);
  }

  setCarry() {
    return this.setStatus(STATUS_FLAGS.CARRY);
  }

  clearCarry() {
    return this.clearStatus(STATUS_FLAGS.CARRY);
  }

  setZeroNegativeFlagsFromValue(val: number) {
    this.setZeroFromValue(val);
    this.setNegativeFromValue(val);
    return this;
  }

  getOverflow() {
    return this.getStatus(STATUS_FLAGS.OVERFLOW);
  }

  setOverflow() {
    return this.setStatus(STATUS_FLAGS.OVERFLOW);
  }

  clearOverflow() {
    return this.clearStatus(STATUS_FLAGS.OVERFLOW);
  }

  getProgramCounter() {
    return this.programCounter[0];
  }

  setProgramCounter(value: number) {
    this.programCounter[0] = value;
    return this;
  }

  incrementProgramCounter(steps: number = 1) {
    this.programCounter[0] = this.programCounter[0] + steps;
    return this;
  }

  getX() {
    return this.x[0];
  }

  setX(value: number) {
    this.x[0] = value;
    return this;
  }

  getY() {
    return this.y[0];
  }

  setY(value: number) {
    this.y[0] = value;
    return this;
  }

  getStackPointer() {
    return this.stackPointer[0];
  }

  setStackPointer(value: number) {
    this.stackPointer[0] = value;
    return this;
  }

  decrementStackPointer() {
    this.stackPointer[0] = this.stackPointer[0] - 1;
  }

  incrementStackPointer() {
    this.stackPointer[0] = this.stackPointer[0] + 1;
  }

  getAccumulator() {
    return this.accumulator[0];
  }

  setAccumulator(value: number) {
    this.accumulator[0] = value;
    return this;
  }

  getStatusRegister() {
    return this.status[0];
  }

  setStatusRegister(value: number) {
    this.status[0] = value;
  }

  private getStatus(flag: STATUS_FLAGS) {
    // TODO: bitwise not 0???
    return (this.status[0] & (this.SET_MASK << flag)) > 0;
  }

  private setStatus(flag: STATUS_FLAGS) {
    this.status[0] = this.status[0] | (this.SET_MASK << flag);
    return this;
  }

  private clearStatus(flag: STATUS_FLAGS) {
    this.status[0] = this.status[0] & ~(this.SET_MASK << flag);
    return this;
  }
}

export default Registers;
