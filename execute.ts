import { CPU_INSTRUCTION } from "./enums";
import RAM from "./ram";
import Registers from "./registers";

let instructionsExecuted = 0;

class Execute {
  private ram: RAM;
  private registers: Registers;
  private utils: Utils;
  constructor(ram: RAM, registers: Registers) {
    this.ram = ram;
    this.registers = registers;
    this.utils = new Utils(this.ram, this.registers);
  }

  public execute(instruction: CPU_INSTRUCTION) {
    // TODO: fix type here
    type methodName = Exclude<keyof Execute, "prototype" | "execute">;
    const fn: () => {} = this[CPU_INSTRUCTION[instruction] as methodName];
    if (fn === undefined) {
      throw Error(
        "no method implementation for code: " +
          instruction.toString(16) +
          "\n" +
          "Instructions executed: " +
          instructionsExecuted
      );
    }

    fn.bind(this)();
    instructionsExecuted++;
  }

  // TEST-BACKED INSTRUCTIONS

  /**
   *  Increment Instructions - INX, INY, INC
   */

  private INX() {
    this.utils.setRegisterValue(
      DataRegister.X,
      this.utils.getRegisterValue(DataRegister.X) + 1
    );
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.X));
    this.utils.incPC();
  }

  private INY() {
    this.utils.setRegisterValue(
      DataRegister.Y,
      this.utils.getRegisterValue(DataRegister.Y) + 1
    );
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.Y));
    this.utils.incPC();
  }

  private INC_Z() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Zero_Page,
      this.utils.getValue(AddressingMode.Zero_Page) + 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Zero_Page));
    this.utils.incPC();
  }

  private INC_ZX() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Zero_Page_Offset_X,
      this.utils.getValue(AddressingMode.Zero_Page_Offset_X) + 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Zero_Page_Offset_X));
    this.utils.incPC();
  }

  private INC_A() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Absolute,
      this.utils.getValue(AddressingMode.Absolute) + 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Absolute));
    this.utils.incPC(2);
  }

  private INC_AX() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Absolute_X,
      this.utils.getValue(AddressingMode.Absolute_X) + 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Absolute_X));
    this.utils.incPC(2);
  }

  /**
   *  Decrement Instructions - DEX, DEY, DEC
   */

  private DEX() {
    this.utils.setRegisterValue(
      DataRegister.X,
      this.utils.getRegisterValue(DataRegister.X) - 1
    );
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.X));
    this.utils.incPC();
  }

  private DEY() {
    this.utils.setRegisterValue(
      DataRegister.Y,
      this.utils.getRegisterValue(DataRegister.Y) - 1
    );
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.Y));
    this.utils.incPC();
  }

  private DEC_Z() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Zero_Page,
      this.utils.getValue(AddressingMode.Zero_Page) - 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Zero_Page));
    this.utils.incPC();
  }

  private DEC_ZX() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Zero_Page_Offset_X,
      this.utils.getValue(AddressingMode.Zero_Page_Offset_X) - 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Zero_Page_Offset_X));
    this.utils.incPC();
  }

  private DEC_A() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Absolute,
      this.utils.getValue(AddressingMode.Absolute) - 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Absolute));
    this.utils.incPC(2);
  }

  private DEC_AX() {
    this.utils.incPC();
    this.utils.setValue(
      AddressingMode.Absolute_X,
      this.utils.getValue(AddressingMode.Absolute_X) - 1
    );
    this.utils.setNZ(this.utils.getValue(AddressingMode.Absolute_X));
    this.utils.incPC(2);
  }

  /**
   *  Status Flag Instructions - SEC, SED, SEI, CLC, CLD, CLI, CLV
   */

  private SEC() {
    this.registers.setCarry().incrementProgramCounter();
  }

  private SED() {
    this.registers.setDecimal().incrementProgramCounter();
  }

  private SEI() {
    this.registers.setInteruptDisable().incrementProgramCounter();
  }

  private CLC() {
    this.registers.clearCarry().incrementProgramCounter();
  }

  private CLD() {
    this.registers.clearDecimal().incrementProgramCounter();
  }

  private CLI() {
    this.registers.clearInteruptDisable().incrementProgramCounter();
  }

  private CLV() {
    this.registers.clearOverflow().incrementProgramCounter();
  }

  /**
   *  Logical Instructions - AND, EOR, ORA
   */

  private AND_I() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Immediate);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private AND_Z() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private AND_ZX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page_Offset_X);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private AND_A() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private AND_AX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_X);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private AND_AY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_Y);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private AND_IX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_X);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private AND_IY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_Y);
    const result = value & this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private EOR_I() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Immediate);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private EOR_Z() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private EOR_ZX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page_Offset_X);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private EOR_A() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private EOR_AX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_X);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private EOR_AY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_Y);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private EOR_IX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_X);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private EOR_IY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_Y);
    const result = value ^ this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private ORA_I() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Immediate);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private ORA_Z() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private ORA_ZX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Zero_Page_Offset_X);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private ORA_A() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private ORA_AX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_X);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private ORA_AY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Absolute_Y);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC(2);
  }

  private ORA_IX() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_X);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

  private ORA_IY() {
    this.utils.incPC();
    const value = this.utils.getValue(AddressingMode.Indirect_Offset_Y);
    const result = value | this.utils.getRegisterValue(DataRegister.A);
    this.utils.setRegisterValue(DataRegister.A, result);
    this.utils.setNZ(this.utils.getRegisterValue(DataRegister.A));
    this.utils.incPC();
  }

    /**
   *  Load Register Instructions
   */
    /**
   *  Store Register Instructions
   */
    /**
   *  Transfer Register Instructions
   */


  // UNTESTED INSTRUCTIONS

  // private NOP() {
  //   registers.incrementProgramCounter();
  // }

  // private LSR_A() {
  //   registers.clearNegative();
  //   const a = registers.getAccumulator();
  //   a & 0b1 ? registers.setCarry() : registers.clearCarry();
  //   const result = a >> 1;
  //   registers.setZeroFromValue(result);
  //   registers.setAccumulator(result);
  //   registers.incrementProgramCounter();
  // }

  // private LDA_I() {
  //   registers
  //     .incrementProgramCounter()
  //     .setAccumulator(ram.get8(registers.getProgramCounter()))
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator())
  //     .incrementProgramCounter();
  // }

  // private LDA_Z() {
  //   registers
  //     .incrementProgramCounter()
  //     .setAccumulator(ram.get8(ram.get8(registers.getProgramCounter())))
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator())
  //     .incrementProgramCounter();
  // }

  // private LDA_A() {
  //   registers
  //     .incrementProgramCounter()
  //     .setAccumulator(Utils.getAbsoluteValue(ram, registers))
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator())
  //     .incrementProgramCounter(2);
  // }

  // private LDA_AX() {
  //   registers.incrementProgramCounter();
  //   const value = Utils.getAbsoluteOffsetValue(
  //     ram,
  //     registers,
  //     registers.getX()
  //   );
  //   registers
  //     .setAccumulator(value)
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator())
  //     .incrementProgramCounter(2);
  // }

  // private LDA_AY() {
  //   registers.incrementProgramCounter();
  //   const value = Utils.getAbsoluteOffsetValue(
  //     ram,
  //     registers,
  //     registers.getY()
  //   );
  //   registers
  //     .setAccumulator(value)
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator())
  //     .incrementProgramCounter(2);
  // }

  // private STA_A() {
  //   registers.incrementProgramCounter();
  //   Utils.setAbsoluteValue(ram, registers, registers.getAccumulator());
  //   registers.incrementProgramCounter(2);
  // }

  // private LDX_I() {
  //   registers
  //     .incrementProgramCounter()
  //     .setX(ram.get8(registers.getProgramCounter()))
  //     .setZeroNegativeFlagsFromValue(registers.getX())
  //     .incrementProgramCounter();
  // }

  // private LDX_A() {
  //   registers
  //     .incrementProgramCounter()
  //     .setX(Utils.getAbsoluteValue(ram, registers))
  //     .setZeroNegativeFlagsFromValue(registers.getX())
  //     .incrementProgramCounter(2);
  // }

  // private LDX_AY() {
  //   registers.incrementProgramCounter();
  //   const address = ram.get16(registers.getProgramCounter()) + registers.getY();
  //   registers
  //     .setX(ram.get8(address))
  //     .setZeroNegativeFlagsFromValue(registers.getX())
  //     .incrementProgramCounter(2);
  // }

  // private TXS_I() {
  //   registers.setStackPointer(registers.getX()).incrementProgramCounter();
  // }

  // private TXA_I() {
  //   registers
  //     .setAccumulator(registers.getX())
  //     .incrementProgramCounter()
  //     .setZeroNegativeFlagsFromValue(registers.getAccumulator());
  // }

  // private TAX_I() {
  //   registers
  //     .setX(registers.getAccumulator())
  //     .incrementProgramCounter()
  //     .setZeroNegativeFlagsFromValue(registers.getX());
  // }

  // private TAY_I() {
  //   registers
  //     .setY(registers.getAccumulator())
  //     .incrementProgramCounter()
  //     .setZeroNegativeFlagsFromValue(registers.getY());
  // }

  // private BPL_R() {
  //   registers.incrementProgramCounter();
  //   if (!registers.getNegative()) {
  //     const rel = ram.get8signed(registers.getProgramCounter());
  //     registers.incrementProgramCounter(rel);
  //   }
  //   registers.incrementProgramCounter();
  // }

  // private BCC_R() {
  //   registers.incrementProgramCounter();
  //   if (!registers.getCarry()) {
  //     const rel = ram.get8signed(registers.getProgramCounter());
  //     registers.incrementProgramCounter(rel);
  //   }
  //   registers.incrementProgramCounter();
  // }

  // private LDY_I() {
  //   registers
  //     .incrementProgramCounter()
  //     .setY(ram.get8(registers.getProgramCounter()))
  //     .setZeroNegativeFlagsFromValue(registers.getY())
  //     .incrementProgramCounter();
  // }

  // private LDY_A() {
  //   // Utils.loadDataRegister(ram, registers, DataRegister.Y, AddressingMode.Absolute)
  //   registers
  //     .incrementProgramCounter()
  //     .setY(Utils.getAbsoluteValue(ram, registers))
  //     .setZeroNegativeFlagsFromValue(registers.getY())
  //     .incrementProgramCounter(2);
  // }

  // private CMP_I() {
  //   registers.incrementProgramCounter();
  //   const imediate = ram.get8(registers.getProgramCounter());
  //   const acum = registers.getAccumulator();
  //   const result = acum - imediate;
  //   registers.setZeroNegativeFlagsFromValue(result);
  //   acum >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
  //   registers.incrementProgramCounter();
  // }

  // private BCS() {
  //   registers.incrementProgramCounter();
  //   if (registers.getCarry()) {
  //     const rel = ram.get8signed(registers.getProgramCounter());
  //     registers.incrementProgramCounter(rel);
  //   }
  //   registers.incrementProgramCounter();
  // }

  // private BEQ() {
  //   registers.incrementProgramCounter();
  //   if (registers.getZero()) {
  //     const rel = ram.get8signed(registers.getProgramCounter());
  //     registers.incrementProgramCounter(rel);
  //   }
  //   registers.incrementProgramCounter();
  // }

  // private BNE() {
  //   registers.incrementProgramCounter();
  //   if (!registers.getZero()) {
  //     const rel = ram.get8signed(registers.getProgramCounter());
  //     registers.incrementProgramCounter(rel);
  //   }
  //   registers.incrementProgramCounter();
  // }

  // private JSR() {
  //   registers.incrementProgramCounter();
  //   const jumpAddress = ram.get16(registers.getProgramCounter());
  //   registers.incrementProgramCounter(2);
  //   const PC = registers.getProgramCounter() - 1;
  //   Utils.pushStack(PC, ram, registers);
  //   registers.setProgramCounter(jumpAddress);
  // }

  // private JMP_A() {
  //   registers.incrementProgramCounter();
  //   const jumpAddress = ram.get16(registers.getProgramCounter());
  //   registers.setProgramCounter(jumpAddress);
  // }

  // private JMP_I() {
  //   registers.incrementProgramCounter();
  //   const indirect = ram.get16(registers.getProgramCounter());
  //   const jumpAddress = ram.get16(indirect);
  //   registers.setProgramCounter(jumpAddress);
  // }

  // private STA_Z() {
  //   registers.incrementProgramCounter();
  //   ram.set8(
  //     ram.get8(registers.getProgramCounter()),
  //     registers.getAccumulator()
  //   );
  //   registers.incrementProgramCounter();
  // }

  // private STX_Z() {
  //   registers.incrementProgramCounter();
  //   ram.set8(ram.get8(registers.getProgramCounter()), registers.getX());
  //   registers.incrementProgramCounter();
  // }

  // private STX_A() {
  //   registers.incrementProgramCounter();
  //   Utils.setAbsoluteValue(ram, registers, registers.getX());
  //   registers.incrementProgramCounter(2);
  // }

  // private STY_A() {
  //   registers.incrementProgramCounter();
  //   Utils.setAbsoluteValue(ram, registers, registers.getY());
  //   registers.incrementProgramCounter(2);
  // }

  // private CPX_I() {
  //   // TODO: Refactor with better understanding (This might be wrong)
  //   registers.incrementProgramCounter();
  //   const imediate = ram.get8(registers.getProgramCounter());
  //   const x = registers.getX();
  //   const result = x - imediate;
  //   registers.setZeroNegativeFlagsFromValue(result);
  //   x >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
  //   registers.incrementProgramCounter();
  // }

  // private CPY_I() {
  //   // TODO: Refactor with better understanding (This might be wrong)
  //   registers.incrementProgramCounter();
  //   const imediate = ram.get8(registers.getProgramCounter());
  //   const y = registers.getY();
  //   const result = y - imediate;
  //   registers.setZeroNegativeFlagsFromValue(result);
  //   y >= imediate ? registers.setCarry() : registers.clearCarry(); // Why?
  //   registers.incrementProgramCounter();
  // }

  // private STA_IY() {
  //   registers.incrementProgramCounter();
  //   const immediate = ram.get8(registers.getProgramCounter());
  //   const indirect = ram.get16(immediate);
  //   const y = registers.getY();
  //   const address = indirect + y;
  //   ram.set8(address, registers.getAccumulator());
  //   registers.incrementProgramCounter();
  // }

  // private LDA_IY() {
  //   registers.incrementProgramCounter();
  //   const immediate = ram.get8(registers.getProgramCounter());
  //   const indirect = ram.get16(immediate);
  //   const y = registers.getY();
  //   const address = indirect + y;
  //   registers.setAccumulator(ram.get8(address));
  //   registers.incrementProgramCounter();
  // }

  // private RTS() {
  //   const PC = Utils.pullStack(ram, registers);
  //   registers.setProgramCounter(PC);
  //   registers.incrementProgramCounter();
  // }

  // private BIT() {
  //   registers.incrementProgramCounter();
  //   const memVal = Utils.getAbsoluteValue(ram, registers);
  //   const and = registers.getAccumulator() & memVal;
  //   registers.setZeroFromValue(and);
  //   registers.setNegativeFromValue(memVal);
  //   ((memVal & 0b01000000) >> 6) & 1
  //     ? registers.setOverflow()
  //     : registers.clearOverflow();
  //   registers.incrementProgramCounter(2);
  // }

  // private STA_AX() {
  //   registers.incrementProgramCounter();
  //   const address = ram.get16(registers.getProgramCounter()) + registers.getX();
  //   ram.set8(address, registers.getAccumulator());
  //   registers.incrementProgramCounter(2);
  // }

  // private STA_AY() {
  //   registers.incrementProgramCounter();
  //   const address = ram.get16(registers.getProgramCounter()) + registers.getY();
  //   ram.set8(address, registers.getAccumulator());
  //   registers.incrementProgramCounter(2);
  // }

  // private PHA() {
  //   Utils.pushStackValue(registers.getAccumulator(), ram, registers);
  //   registers.incrementProgramCounter();
  // }

  // private PLA() {
  //   registers.setAccumulator(Utils.pullStackValue(ram, registers));
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   registers.incrementProgramCounter();
  // }

  // private ROL_Z() {
  //   // TODO: double check this for accuracy
  //   registers.incrementProgramCounter();
  //   const address = ram.get8(registers.getProgramCounter());
  //   const value = ram.get8(address);
  //   const newCarry = !!((value >> 7) & 1);
  //   const oldCarry = +registers.getCarry();
  //   const result = ((value & 0x01111111) << 1) | oldCarry;
  //   ram.set8(address, result);
  //   newCarry ? registers.setCarry() : registers.clearCarry();
  //   registers.setZeroNegativeFlagsFromValue(
  //     Utils.getAbsoluteOffsetValue(ram, registers, registers.getX())
  //   );
  //   registers.incrementProgramCounter();
  // }

  // private ASL_A() {
  //   // TODO: double check this for accuracy
  //   const value = registers.getAccumulator();
  //   const newCarry = !!((value >> 7) & 1);
  //   const result = (value << 1) & 0x1111_1111;
  //   registers.setAccumulator(result);
  //   newCarry ? registers.setCarry() : registers.clearCarry();
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   registers.incrementProgramCounter();
  // }

  // private ROR_AX() {
  //   // TODO: double check this for accuracy
  //   registers.incrementProgramCounter();
  //   const value = Utils.getAbsoluteOffsetValue(
  //     ram,
  //     registers,
  //     registers.getX()
  //   );
  //   const newCarry = !!(value & 1);
  //   const oldCarry = +registers.getCarry();
  //   const result = ((value & 0x11111110) >> 1) | (oldCarry << 7);
  //   Utils.setAbsoluteOffsetValue(ram, registers, registers.getX(), result);
  //   newCarry ? registers.setCarry() : registers.clearCarry();
  //   registers.setZeroNegativeFlagsFromValue(
  //     Utils.getAbsoluteOffsetValue(ram, registers, registers.getX())
  //   );
  //   registers.incrementProgramCounter(2);
  // }

  // private ROL_A() {
  //   // TODO: double check this for accuracy
  //   const a = registers.getAccumulator();
  //   const newCarry = !!((a >> 7) & 1);
  //   const oldCarry = +registers.getCarry();
  //   const result = ((a & 0x01111111) << 1) | oldCarry;
  //   registers.setAccumulator(result);
  //   newCarry ? registers.setCarry() : registers.clearCarry();
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   registers.incrementProgramCounter();
  // }

  // private SBC() {
  //   Utils.notImplemented("SBC");
  // }

  // private NMI() {
  //   Utils.pushStack(registers.getProgramCounter(), ram, registers);
  //   Utils.pushStackValue(registers.getStatusRegister(), ram, registers);
  //   registers.setInteruptDisable();
  //   registers.setProgramCounter(ram.get16(0xfffa));
  // }

  // private RTI() {
  //   const status = Utils.pullStackValue(ram, registers);
  //   registers.setStatusRegister(status);
  //   const PC = Utils.pullStack(ram, registers);
  //   registers.setProgramCounter(PC);
  // }

  // private ADC_I() {
  //   registers.incrementProgramCounter();
  //   const a = registers.getAccumulator();
  //   const b = Utils.getImmediate(ram, registers);
  //   const { result, hasCarry6bit, hasCarry7bit } = Utils.bitAdd(
  //     a,
  //     b,
  //     registers.getCarry()
  //   );
  //   registers.setAccumulator(result);
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   hasCarry7bit ? registers.setCarry() : registers.clearCarry();
  //   (hasCarry6bit && !hasCarry7bit) || (!hasCarry6bit && hasCarry7bit)
  //     ? registers.setOverflow()
  //     : registers.clearOverflow();
  //   registers.incrementProgramCounter();
  // }

  // private ADC_A() {
  //   registers.incrementProgramCounter();
  //   const a = registers.getAccumulator();
  //   const b = Utils.getAbsoluteValue(ram, registers);
  //   const { result, hasCarry6bit, hasCarry7bit } = Utils.bitAdd(
  //     a,
  //     b,
  //     registers.getCarry()
  //   );
  //   registers.setAccumulator(result);
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   hasCarry7bit ? registers.setCarry() : registers.clearCarry();
  //   (hasCarry6bit && !hasCarry7bit) || (!hasCarry6bit && hasCarry7bit)
  //     ? registers.setOverflow()
  //     : registers.clearOverflow();
  //   registers.incrementProgramCounter(2);
  // }

  // private ADC_AY() {
  //   registers.incrementProgramCounter();
  //   const a = registers.getAccumulator();
  //   const b = Utils.getAbsoluteOffsetValue(ram, registers, registers.getY());
  //   const { result, hasCarry6bit, hasCarry7bit } = Utils.bitAdd(
  //     a,
  //     b,
  //     registers.getCarry()
  //   );
  //   registers.setAccumulator(result);
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   hasCarry7bit ? registers.setCarry() : registers.clearCarry();
  //   (hasCarry6bit && !hasCarry7bit) || (!hasCarry6bit && hasCarry7bit)
  //     ? registers.setOverflow()
  //     : registers.clearOverflow();
  //   registers.incrementProgramCounter(2);
  // }

  // private SBC_AY() {
  //   // essentially a ADC_AY with ~b
  //   registers.incrementProgramCounter();
  //   const a = registers.getAccumulator();
  //   const b = Utils.getAbsoluteOffsetValue(ram, registers, registers.getY());
  //   const { result, hasCarry6bit, hasCarry7bit } = Utils.bitAdd(
  //     a,
  //     ~b,
  //     registers.getCarry()
  //   );
  //   registers.setAccumulator(result);
  //   registers.setZeroNegativeFlagsFromValue(registers.getAccumulator());
  //   hasCarry7bit ? registers.setCarry() : registers.clearCarry();
  //   (hasCarry6bit && !hasCarry7bit) || (!hasCarry6bit && hasCarry7bit)
  //     ? registers.setOverflow()
  //     : registers.clearOverflow();
  //   registers.incrementProgramCounter(2);
  // }
}

enum DataRegister {
  X,
  Y,
  A,
}

enum AddressingMode {
  Immediate,
  Zero_Page,
  Zero_Page_Offset_X,
  Zero_Page_Offset_Y,
  Absolute,
  Absolute_X,
  Absolute_Y,
  Indirect_Offset_X,
  Indirect_Offset_Y,
}

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
    this.ram.set8((0x10 << 8) + this.registers.getStackPointer(), high);
    this.registers.decrementStackPointer();
    this.ram.set8((0x10 << 8) + this.registers.getStackPointer(), low);
    this.registers.decrementStackPointer();
  }

  public pushStackValue(bit8Value: number) {
    this.ram.set8((0x10 << 8) + this.registers.getStackPointer(), bit8Value);
    this.registers.decrementStackPointer();
  }

  public pullStack() {
    this.registers.incrementStackPointer();
    const low = this.ram.get8((0x10 << 8) + this.registers.getStackPointer());
    this.registers.incrementStackPointer();
    const high = this.ram.get8((0x10 << 8) + this.registers.getStackPointer());
    return (high << 8) + low;
  }

  public pullStackValue() {
    this.registers.incrementStackPointer();
    return this.ram.get8((0x10 << 8) + this.registers.getStackPointer());
  }

  // Refactor to this
  public loadDataRegister(
    dataRegister: DataRegister,
    addressingMode: AddressingMode
  ) {
    this.registers.incrementProgramCounter();
    const value = this.getValue(addressingMode);
    this.loadRegister(dataRegister, value);
    this.registers.setZeroNegativeFlagsFromValue(value);
    const step = addressingMode === AddressingMode.Absolute ? 2 : 1;
    this.registers.incrementProgramCounter(step);
  }

  public getValue(addressingMode: AddressingMode) {
    switch (addressingMode) {
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
    }
  }

  public setValue(addressingMode: AddressingMode, val: number) {
    switch (addressingMode) {
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
    }
  }

  public getRegisterValue(register: DataRegister) {
    switch (register) {
      case DataRegister.X:
        return this.registers.getX();
      case DataRegister.Y:
        return this.registers.getY();
      case DataRegister.A:
        return this.registers.getAccumulator();
    }
  }

  public setRegisterValue(register: DataRegister, val: number) {
    switch (register) {
      case DataRegister.X:
        return this.registers.setX(val);
      case DataRegister.Y:
        return this.registers.setY(val);
      case DataRegister.A:
        return this.registers.setAccumulator(val);
    }
  }

  public setNZ(val: number) {
    this.registers.setZeroNegativeFlagsFromValue(val);
  }

  public incPC(val?: number) {
    this.registers.incrementProgramCounter(val);
  }

  private loadRegister(dataRegister: DataRegister, value: number) {
    switch (dataRegister) {
      case DataRegister.A:
        this.loadA(value);
      case DataRegister.X:
        this.loadX(value);
      case DataRegister.Y:
        this.loadY(value);
    }
  }

  private loadA(value: number) {
    this.registers.setAccumulator(value);
  }
  private loadX(value: number) {
    this.registers.setX(value);
  }
  private loadY(value: number) {
    this.registers.setY(value);
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

  static notImplemented(opcode: string) {
    throw new TypeError("Not implementation for " + opcode);
  }

  static bitAdd(a: number, b: number, c: boolean) {
    let result = 0;
    let hasCarry6bit = false;
    let hasCarry7bit = false;
    let carry = c ? 1 : 0;
    for (let bit = 0; bit < 8; bit++) {
      const aBit = Utils.getBit(a, bit);
      const bBit = Utils.getBit(b, bit);
      const bitResult = aBit + bBit + carry;
      carry = bitResult > 1 ? 1 : 0;
      if (carry && bit === 6) {
        hasCarry6bit = true;
      }
      if (carry && bit === 7) {
        hasCarry7bit = true;
      }
      result += bitResult % 2 << bit;
    }

    return { result, hasCarry6bit, hasCarry7bit };
  }

  private static getBit(a: number, bit: number) {
    return !!(a & (1 << bit)) ? 1 : 0;
  }
}

export default Execute;
