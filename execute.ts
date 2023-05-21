import { CPU_INSTRUCTION } from "./enums";
import RAM from "./ram";
import Registers from "./registers";

let instructionsExecuted = 0;
type methodName = Exclude<keyof typeof Execute, "prototype" | "execute">;

abstract class Execute {
  constructor() {}

  static execute(instruction: CPU_INSTRUCTION, ram: RAM, registers: Registers) {
    const fn = Execute[CPU_INSTRUCTION[instruction] as methodName];
    if (fn === undefined) {
      console.log("RAM dump: ", ram);
      console.log("reg dump: ", registers);
      console.log("vRam dump: ", ram.getVRAMdump());
      throw Error(
        "no method implementation for code: " +
          instruction.toString(16) +
          "\n" +
          "Instructions executed: " +
          instructionsExecuted
      );
    }

    fn(ram, registers);
    instructionsExecuted++;
  }

  // TEST-BACKED INSTRUCTIONS

  // Increment Instructions

  static INX(ram: RAM, registers: Registers) {
    registers.setX(registers.getX() + 1);
    registers.setZeroNegativeFlagsFromValue(registers.getX());
    registers.incrementProgramCounter();
  }

  static INY(ram: RAM, registers: Registers) {
    registers.setY(registers.getY() + 1);
    registers.setZeroNegativeFlagsFromValue(registers.getY());
    registers.incrementProgramCounter();
  }

  static INC_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address = Utils.getImmediate(ram, registers);
    const result = ram.get8(address) + 1;
    ram.set8(address, result);
    registers.setZeroNegativeFlagsFromValue(ram.get8(address));
    registers.incrementProgramCounter();
  }

  static INC_ZX(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address =
      (Utils.getImmediate(ram, registers) + registers.getX()) % 0x100; // Wraps
    const result = ram.get8(address) + 1;
    ram.set8(address, result);
    registers.setZeroNegativeFlagsFromValue(ram.get8(address));
    registers.incrementProgramCounter();
  }

  static INC_A(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const result = Utils.getAbsoluteValue(ram, registers) + 1;
    Utils.setAbsoluteValue(ram, registers, result);
    registers.setZeroNegativeFlagsFromValue(
      Utils.getAbsoluteValue(ram, registers)
    );
    registers.incrementProgramCounter(2);
  }

  static INC_AX(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const result =
      Utils.getAbsoluteOffsetValue(ram, registers, registers.getX()) + 1;
    Utils.setAbsoluteOffsetValue(ram, registers, registers.getX(), result);
    registers.setZeroNegativeFlagsFromValue(
      Utils.getAbsoluteOffsetValue(ram, registers, registers.getX())
    );
    registers.incrementProgramCounter(2);
  }

  // UNTESTED INSTRUCTIONS

  static NOP(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
  }

  static SEI(ram: RAM, registers: Registers) {
    registers.setInteruptDisable().incrementProgramCounter();
  }

  static SEC(ram: RAM, registers: Registers) {
    registers.setCarry().incrementProgramCounter();
  }

  static CLD(ram: RAM, registers: Registers) {
    registers.clearDecimal().incrementProgramCounter();
  }

  static LSR_A(ram: RAM, registers: Registers) {
    registers.clearNegative();
    const a = registers.getAccumulator();
    a & 0b1 ? registers.setCarry() : registers.clearCarry();
    const result = a >> 1;
    registers.setZeroFromValue(result);
    registers.setAccumulator(result);
    registers.incrementProgramCounter();
  }

  static LDA_I(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setAccumulator(ram.get8(registers.getProgramCounter()))
      .setZeroNegativeFlagsFromValue(registers.getAccumulator())
      .incrementProgramCounter();
  }

  static LDA_Z(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setAccumulator(ram.get8(ram.get8(registers.getProgramCounter())))
      .setZeroNegativeFlagsFromValue(registers.getAccumulator())
      .incrementProgramCounter();
  }

  static LDA_A(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setAccumulator(Utils.getAbsoluteValue(ram, registers))
      .setZeroNegativeFlagsFromValue(registers.getAccumulator())
      .incrementProgramCounter(2);
  }

  static LDA_AX(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address = ram.get16(registers.getProgramCounter()) + registers.getX();
    registers
      .setAccumulator(ram.get8(address))
      .setZeroNegativeFlagsFromValue(registers.getAccumulator())
      .incrementProgramCounter(2);
  }

  static STA_A(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    Utils.setAbsoluteValue(ram, registers, registers.getAccumulator());
    registers.incrementProgramCounter(2);
  }

  static LDX_I(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setX(ram.get8(registers.getProgramCounter()))
      .setZeroNegativeFlagsFromValue(registers.getX())
      .incrementProgramCounter();
  }

  static LDX_A(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setX(Utils.getAbsoluteValue(ram, registers))
      .setZeroNegativeFlagsFromValue(registers.getX())
      .incrementProgramCounter(2);
  }

  static LDX_AY(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address = ram.get16(registers.getProgramCounter()) + registers.getY();
    registers
      .setX(ram.get8(address))
      .setZeroNegativeFlagsFromValue(registers.getX())
      .incrementProgramCounter(2);
  }

  static TXS_I(ram: RAM, registers: Registers) {
    registers.setStackPointer(registers.getX()).incrementProgramCounter();
  }

  static TXA_I(ram: RAM, registers: Registers) {
    registers
      .setAccumulator(registers.getX())
      .incrementProgramCounter()
      .setZeroNegativeFlagsFromValue(registers.getAccumulator());
  }

  static TAX_I(ram: RAM, registers: Registers) {
    registers
      .setX(registers.getAccumulator())
      .incrementProgramCounter()
      .setZeroNegativeFlagsFromValue(registers.getX());
  }

  static BPL_R(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    if (!registers.getNegative()) {
      const rel = ram.get8signed(registers.getProgramCounter());
      registers.incrementProgramCounter(rel);
    }
    registers.incrementProgramCounter();
  }

  static LDY_I(ram: RAM, registers: Registers) {
    registers
      .incrementProgramCounter()
      .setY(ram.get8(registers.getProgramCounter()))
      .setZeroNegativeFlagsFromValue(registers.getY())
      .incrementProgramCounter();
  }

  static LDY_A(ram: RAM, registers: Registers) {
    // Utils.loadDataRegister(ram, registers, DataRegister.Y, AddressingMode.Absolute)
    registers
      .incrementProgramCounter()
      .setY(Utils.getAbsoluteValue(ram, registers))
      .setZeroNegativeFlagsFromValue(registers.getY())
      .incrementProgramCounter(2);
  }

  static CMP_I(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const imediate = ram.get8(registers.getProgramCounter());
    const acum = registers.getAccumulator();
    const result = acum - imediate;
    registers.setZeroNegativeFlagsFromValue(result);
    acum >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
    registers.incrementProgramCounter();
  }

  static BCS(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    if (registers.getCarry()) {
      const rel = ram.get8signed(registers.getProgramCounter());
      registers.incrementProgramCounter(rel);
    }
    registers.incrementProgramCounter();
  }

  static DEX(ram: RAM, registers: Registers) {
    registers.setX(registers.getX() - 1);
    registers.setZeroNegativeFlagsFromValue(registers.getX());
    registers.incrementProgramCounter();
  }

  static DEY(ram: RAM, registers: Registers) {
    registers.setY(registers.getY() - 1);
    registers.setZeroNegativeFlagsFromValue(registers.getY());
    registers.incrementProgramCounter();
  }

  static BEQ(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    if (registers.getZero()) {
      const rel = ram.get8signed(registers.getProgramCounter());
      registers.incrementProgramCounter(rel);
    }
    registers.incrementProgramCounter();
  }

  static BNE(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    if (!registers.getZero()) {
      const rel = ram.get8signed(registers.getProgramCounter());
      registers.incrementProgramCounter(rel);
    }
    registers.incrementProgramCounter();
  }

  static JSR(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const jumpAddress = ram.get16(registers.getProgramCounter());
    registers.incrementProgramCounter(2);
    const PC = registers.getProgramCounter() - 1;
    Utils.pushStack(PC, ram, registers);
    registers.setProgramCounter(jumpAddress);
  }

  static JMP_A(ram: RAM, registers: Registers) {
    // if (registers.getProgramCounter() == 32855) {
    //     console.log('ram:' , ram)
    //     console.log('registers:' , registers)
    //     console.log('ppu cntrl:' , ram.getPPU_CTRL()[0].toString(2))
    //     console.log('ppu mask:' , ram.getPPU_MASK()[0].toString(2))
    //     console.log('ppu status:' , ram.getPPU_STATUS()[0].toString(2))
    //     console.log('registers:' , registers)
    //   throw Error("This is the endless loop");
    // }
    registers.incrementProgramCounter();
    const jumpAddress = ram.get16(registers.getProgramCounter());
    registers.setProgramCounter(jumpAddress);
  }

  static STA_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    ram.set8(
      ram.get8(registers.getProgramCounter()),
      registers.getAccumulator()
    );
    registers.incrementProgramCounter();
  }

  static STX_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    ram.set8(ram.get8(registers.getProgramCounter()), registers.getX());
    registers.incrementProgramCounter();
  }

  static STX_A(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    Utils.setAbsoluteValue(ram, registers, registers.getX());
    registers.incrementProgramCounter(2);
  }

  static STY_A(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    Utils.setAbsoluteValue(ram, registers, registers.getY());
    registers.incrementProgramCounter(2);
  }

  static CPX_I(ram: RAM, registers: Registers) {
    // TODO: Refactor with better understanding (This might be wrong)
    registers.incrementProgramCounter();
    const imediate = ram.get8(registers.getProgramCounter());
    const x = registers.getX();
    const result = x - imediate;
    registers.setZeroNegativeFlagsFromValue(result);
    x >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
    registers.incrementProgramCounter();
  }

  static CPY_I(ram: RAM, registers: Registers) {
    // TODO: Refactor with better understanding (This might be wrong)
    registers.incrementProgramCounter();
    const imediate = ram.get8(registers.getProgramCounter());
    const y = registers.getY();
    const result = y - imediate;
    registers.setZeroNegativeFlagsFromValue(result);
    y >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
    registers.incrementProgramCounter();
  }

  static STA_IY(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const immediate = ram.get8(registers.getProgramCounter());
    const indirect = ram.get16(immediate);
    const y = registers.getY();
    const address = indirect + y;
    ram.set8(address, registers.getAccumulator());
    registers.incrementProgramCounter();
  }

  static LDA_IY(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const immediate = ram.get8(registers.getProgramCounter());
    const indirect = ram.get16(immediate);
    const y = registers.getY();
    const address = indirect + y;
    registers.setAccumulator(ram.get8(address));
    registers.incrementProgramCounter();
  }

  static RTS(ram: RAM, registers: Registers) {
    const PC = Utils.pullStack(ram, registers);
    registers.setProgramCounter(PC);
    registers.incrementProgramCounter();
  }

  static BIT(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const memVal = Utils.getAbsoluteValue(ram, registers);
    const and = registers.getAccumulator() & memVal;
    registers.setZeroFromValue(and);
    registers.setNegativeFromValue(memVal);
    ((memVal & 0b01000000) >> 6) & 1
      ? registers.setOverflow()
      : registers.clearOverflow();
    registers.incrementProgramCounter(2);
  }

  static STA_AX(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address = ram.get16(registers.getProgramCounter()) + registers.getX();
    ram.set8(address, registers.getAccumulator());
    registers.incrementProgramCounter(2);
  }

  static STA_AY(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const address = ram.get16(registers.getProgramCounter()) + registers.getY();
    ram.set8(address, registers.getAccumulator());
    registers.incrementProgramCounter(2);
  }

  static ORA_I(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const immediate = Utils.getImmediate(ram, registers);
    const result = immediate | registers.getAccumulator();
    registers.setAccumulator(result).setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter();
  }

  static ORA_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const value = ram.get8(ram.get8(registers.getProgramCounter()));
    const result = value | registers.getAccumulator();
    registers.setAccumulator(result).setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter();
  }

  static AND_I(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const immediate = Utils.getImmediate(ram, registers);
    const result = immediate & registers.getAccumulator();
    registers.setAccumulator(result).setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter();
  }

  static AND_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const value = Utils.getZeroPageValue(ram, registers);
    const result = value & registers.getAccumulator();
    registers.setAccumulator(result).setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter();
  }

  static AND_AX(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const value = Utils.getAbsoluteValue(ram, registers) + registers.getX();
    const result = value & registers.getAccumulator();
    registers.setAccumulator(result).setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter(2);
  }

  static PHA(ram: RAM, registers: Registers) {
    Utils.pushStackValue(registers.getAccumulator(), ram, registers);
    registers.incrementProgramCounter();
  }

  static PLA(ram: RAM, registers: Registers) {
    registers.setAccumulator(Utils.pullStackValue(ram, registers));
    registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
    registers.incrementProgramCounter();
  }

  static ROL_Z(ram: RAM, registers: Registers) {
    // TODO: double check this for accuracy
    registers.incrementProgramCounter();
    const address = ram.get8(registers.getProgramCounter());
    const value = ram.get8(address);
    const newCarry = !!((value >> 7) & 1);
    const oldCarry = +registers.getCarry();
    const result = ((value & 0x01111111) << 1) | oldCarry;
    ram.set8(address, result);
    newCarry ? registers.setCarry() : registers.clearCarry();
    registers.setZeroNegativeFlagsFromValue(value);
    registers.incrementProgramCounter();
  }

  static ROL_A(ram: RAM, registers: Registers) {
    // TODO: double check this for accuracy
    const a = registers.getAccumulator();
    const newCarry = !!((a >> 7) & 1);
    const oldCarry = +registers.getCarry();
    const result = ((a & 0x01111111) << 1) | oldCarry;
    registers.setAccumulator(result);
    newCarry ? registers.setCarry() : registers.clearCarry();
    registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
    registers.incrementProgramCounter();
  }

  static EOR_Z(ram: RAM, registers: Registers) {
    registers.incrementProgramCounter();
    const a = registers.getAccumulator();
    const value = Utils.getZeroPageValue(ram, registers);
    const result = a ^ value;
    registers.setAccumulator(result);
    registers.setZeroNegativeFlagsFromValue(result);
    registers.incrementProgramCounter();
  }

  static SBC(ram: RAM, registers: Registers) {
    Utils.notImplemented("SBC");
  }

  static NMI(ram: RAM, registers: Registers) {
    Utils.pushStack(registers.getProgramCounter(), ram, registers);
    Utils.pushStackValue(registers.getStatusRegister(), ram, registers);
    registers.setInteruptDisable();
    registers.setProgramCounter(ram.get16(0xfffa));
  }

  static RTI(ram: RAM, registers: Registers) {
    const status = Utils.pullStackValue(ram, registers);
    registers.setStatusRegister(status);
    const PC = Utils.pullStack(ram, registers);
    registers.setProgramCounter(PC);
  }
}

enum DataRegister {
  X,
  Y,
  A,
}

enum AddressingMode {
  Immediate,
  Zero_Page,
  Absolute,
}

// Util Functions
abstract class Utils {
  constructor() {}

  static pushStack(bit16Value: number, ram: RAM, registers: Registers) {
    const low = bit16Value & 0b11111111;
    const high = bit16Value >> 8;
    ram.set8((0x10 << 8) + registers.getStackPointer(), high);
    registers.decrementStackPointer();
    ram.set8((0x10 << 8) + registers.getStackPointer(), low);
    registers.decrementStackPointer();
  }

  static pushStackValue(bit8Value: number, ram: RAM, registers: Registers) {
    ram.set8((0x10 << 8) + registers.getStackPointer(), bit8Value);
    registers.decrementStackPointer();
  }

  static pullStack(ram: RAM, registers: Registers) {
    registers.incrementStackPointer();
    const low = ram.get8((0x10 << 8) + registers.getStackPointer());
    registers.incrementStackPointer();
    const high = ram.get8((0x10 << 8) + registers.getStackPointer());
    return (high << 8) + low;
  }

  static pullStackValue(ram: RAM, registers: Registers) {
    registers.incrementStackPointer();
    return ram.get8((0x10 << 8) + registers.getStackPointer());
  }

  // Refactor to this
  static loadDataRegister(
    ram: RAM,
    registers: Registers,
    dataRegister: DataRegister,
    addressingMode: AddressingMode
  ) {
    registers.incrementProgramCounter();
    const value = Utils.getValue(ram, registers, addressingMode);
    Utils.loadRegister(registers, dataRegister, value);
    registers.setZeroNegativeFlagsFromValue(value);
    const step = addressingMode === AddressingMode.Absolute ? 2 : 1;
    registers.incrementProgramCounter(step);
  }

  private static getValue(
    ram: RAM,
    registers: Registers,
    addressingMode: AddressingMode
  ) {
    switch (addressingMode) {
      case AddressingMode.Immediate:
        return Utils.getImmediate(ram, registers);
      case AddressingMode.Zero_Page:
        return Utils.getZeroPageValue(ram, registers);
      case AddressingMode.Absolute:
        return Utils.getAbsoluteValue(ram, registers);
    }
  }

  private static loadRegister(
    registers: Registers,
    dataRegister: DataRegister,
    value: number
  ) {
    switch (dataRegister) {
      case DataRegister.A:
        Utils.loadA(registers, value);
      case DataRegister.X:
        Utils.loadX(registers, value);
      case DataRegister.Y:
        Utils.loadY(registers, value);
    }
  }

  private static loadA(registers: Registers, value: number) {
    registers.setAccumulator(value);
  }
  private static loadX(registers: Registers, value: number) {
    registers.setX(value);
  }
  private static loadY(registers: Registers, value: number) {
    registers.setY(value);
  }

  static getImmediate(ram: RAM, registers: Registers) {
    return ram.get8(registers.getProgramCounter());
  }

  static getZeroPageValue(ram: RAM, registers: Registers) {
    return ram.get8(ram.get8(registers.getProgramCounter()));
  }

  static getAbsoluteOffsetValue(
    ram: RAM,
    registers: Registers,
    offset: number
  ) {
    return ram.get8(ram.get16(registers.getProgramCounter()) + offset);
  }

  static getAbsoluteValue(ram: RAM, registers: Registers) {
    return ram.get8(ram.get16(registers.getProgramCounter()));
  }

  static setAbsoluteOffsetValue(
    ram: RAM,
    registers: Registers,
    offset: number,
    val: number
  ) {
    return ram.set8(ram.get16(registers.getProgramCounter()) + offset, val);
  }

  static setAbsoluteValue(ram: RAM, registers: Registers, val: number) {
    return ram.set8(ram.get16(registers.getProgramCounter()), val);
  }

  static notImplemented(opcode: string) {
    throw new TypeError("Not implementation for " + opcode);
  }
}

export default Execute;
