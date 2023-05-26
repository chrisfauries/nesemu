import { CPU_INSTRUCTION, STATUS_FLAGS } from "./enums";
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

  // **************** TEST-BACKED INSTRUCTIONS ****************

  /**
   *  Increment Instructions - INX, INY, INC
   */

  private INX() {
    this.utils.stepRegister(StepDirection.Increment, DataRegister.X);
  }

  private INY() {
    this.utils.stepRegister(StepDirection.Increment, DataRegister.Y);
  }

  private INC_Z() {
    this.utils.stepMemory(StepDirection.Increment, AddressingMode.Zero_Page);
  }

  private INC_ZX() {
    this.utils.stepMemory(
      StepDirection.Increment,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private INC_A() {
    this.utils.stepMemory(StepDirection.Increment, AddressingMode.Absolute);
  }

  private INC_AX() {
    this.utils.stepMemory(StepDirection.Increment, AddressingMode.Absolute_X);
  }

  /**
   *  Decrement Instructions - DEX, DEY, DEC
   */

  private DEX() {
    this.utils.stepRegister(StepDirection.Decrement, DataRegister.X);
  }

  private DEY() {
    this.utils.stepRegister(StepDirection.Decrement, DataRegister.Y);
  }

  private DEC_Z() {
    this.utils.stepMemory(StepDirection.Decrement, AddressingMode.Zero_Page);
  }

  private DEC_ZX() {
    this.utils.stepMemory(
      StepDirection.Decrement,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private DEC_A() {
    this.utils.stepMemory(StepDirection.Decrement, AddressingMode.Absolute);
  }

  private DEC_AX() {
    this.utils.stepMemory(StepDirection.Decrement, AddressingMode.Absolute_X);
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
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Immediate
    );
  }

  private AND_Z() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Zero_Page
    );
  }

  private AND_ZX() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private AND_A() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Absolute
    );
  }

  private AND_AX() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Absolute_X
    );
  }

  private AND_AY() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Absolute_Y
    );
  }

  private AND_IX() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Indirect_Offset_X
    );
  }

  private AND_IY() {
    this.utils.logicalOperation(
      LogicalOperationType.AND,
      AddressingMode.Indirect_Offset_Y
    );
  }

  private EOR_I() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Immediate
    );
  }

  private EOR_Z() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Zero_Page
    );
  }

  private EOR_ZX() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private EOR_A() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Absolute
    );
  }

  private EOR_AX() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Absolute_X
    );
  }

  private EOR_AY() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Absolute_Y
    );
  }

  private EOR_IX() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Indirect_Offset_X
    );
  }

  private EOR_IY() {
    this.utils.logicalOperation(
      LogicalOperationType.EXCLUSIVE_OR,
      AddressingMode.Indirect_Offset_Y
    );
  }

  private ORA_I() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Immediate
    );
  }

  private ORA_Z() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Zero_Page
    );
  }

  private ORA_ZX() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private ORA_A() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Absolute
    );
  }

  private ORA_AX() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Absolute_X
    );
  }

  private ORA_AY() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Absolute_Y
    );
  }

  private ORA_IX() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Indirect_Offset_X
    );
  }

  private ORA_IY() {
    this.utils.logicalOperation(
      LogicalOperationType.INCLUSIVE_OR,
      AddressingMode.Indirect_Offset_Y
    );
  }

  /**
   *  Load Register Instructions
   */
  private LDA_I() {
    this.utils.loadDataRegister(DataRegister.A, AddressingMode.Immediate);
  }

  private LDA_Z() {
    this.utils.loadDataRegister(DataRegister.A, AddressingMode.Zero_Page);
  }

  private LDA_ZX() {
    this.utils.loadDataRegister(
      DataRegister.A,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private LDA_A() {
    this.utils.loadDataRegister(DataRegister.A, AddressingMode.Absolute);
  }

  private LDA_AX() {
    this.utils.loadDataRegister(DataRegister.A, AddressingMode.Absolute_X);
  }

  private LDA_AY() {
    this.utils.loadDataRegister(DataRegister.A, AddressingMode.Absolute_Y);
  }

  private LDA_IX() {
    this.utils.loadDataRegister(
      DataRegister.A,
      AddressingMode.Indirect_Offset_X
    );
  }

  private LDA_IY() {
    this.utils.loadDataRegister(
      DataRegister.A,
      AddressingMode.Indirect_Offset_Y
    );
  }

  private LDX_I() {
    this.utils.loadDataRegister(DataRegister.X, AddressingMode.Immediate);
  }

  private LDX_Z() {
    this.utils.loadDataRegister(DataRegister.X, AddressingMode.Zero_Page);
  }

  private LDX_ZY() {
    this.utils.loadDataRegister(
      DataRegister.X,
      AddressingMode.Zero_Page_Offset_Y
    );
  }

  private LDX_A() {
    this.utils.loadDataRegister(DataRegister.X, AddressingMode.Absolute);
  }

  private LDX_AY() {
    this.utils.loadDataRegister(DataRegister.X, AddressingMode.Absolute_Y);
  }

  private LDY_I() {
    this.utils.loadDataRegister(DataRegister.Y, AddressingMode.Immediate);
  }

  private LDY_Z() {
    this.utils.loadDataRegister(DataRegister.Y, AddressingMode.Zero_Page);
  }

  private LDY_ZX() {
    this.utils.loadDataRegister(
      DataRegister.Y,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private LDY_A() {
    this.utils.loadDataRegister(DataRegister.Y, AddressingMode.Absolute);
  }

  private LDY_AX() {
    this.utils.loadDataRegister(DataRegister.Y, AddressingMode.Absolute_X);
  }

  /**
   *  Store Register Instructions - STA, STX, STY
   */

  private STA_Z() {
    this.utils.storeDataRegister(DataRegister.A, AddressingMode.Zero_Page);
  }

  private STA_ZX() {
    this.utils.storeDataRegister(
      DataRegister.A,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private STA_A() {
    this.utils.storeDataRegister(DataRegister.A, AddressingMode.Absolute);
  }

  private STA_AX() {
    this.utils.storeDataRegister(DataRegister.A, AddressingMode.Absolute_X);
  }

  private STA_AY() {
    this.utils.storeDataRegister(DataRegister.A, AddressingMode.Absolute_Y);
  }

  private STA_IX() {
    this.utils.storeDataRegister(
      DataRegister.A,
      AddressingMode.Indirect_Offset_X
    );
  }

  private STA_IY() {
    this.utils.storeDataRegister(
      DataRegister.A,
      AddressingMode.Indirect_Offset_Y
    );
  }

  private STX_Z() {
    this.utils.storeDataRegister(DataRegister.X, AddressingMode.Zero_Page);
  }

  private STX_ZY() {
    this.utils.storeDataRegister(
      DataRegister.X,
      AddressingMode.Zero_Page_Offset_Y
    );
  }

  private STX_A() {
    this.utils.storeDataRegister(DataRegister.X, AddressingMode.Absolute);
  }

  private STY_Z() {
    this.utils.storeDataRegister(DataRegister.Y, AddressingMode.Zero_Page);
  }

  private STY_ZX() {
    this.utils.storeDataRegister(
      DataRegister.Y,
      AddressingMode.Zero_Page_Offset_X
    );
  }

  private STY_A() {
    this.utils.storeDataRegister(DataRegister.Y, AddressingMode.Absolute);
  }

  /**
   *  Transfer Register Instructions - TAX, TAY, TSX, TXA, TXS, TYA
   */

  private TAX() {
    this.utils.transferDataRegister(DataRegister.A, DataRegister.X);
  }

  private TAY() {
    this.utils.transferDataRegister(DataRegister.A, DataRegister.Y);
  }

  private TSX() {
    this.utils.transferDataRegister(DataRegister.STACK_POINTER, DataRegister.X);
  }

  private TXA() {
    this.utils.transferDataRegister(DataRegister.X, DataRegister.A);
  }

  private TXS() {
    this.utils.transferDataRegister(DataRegister.X, DataRegister.STACK_POINTER);
  }

  private TYA() {
    this.utils.transferDataRegister(DataRegister.Y, DataRegister.A);
  }

  // **************** UNTESTED INSTRUCTIONS ****************

  /**
   *  Arithmetic Operations Instructions - ADC, SBC
   */

  private ADC_I() {
    this.utils.arithmetic(AddressingMode.Immediate, ArithmeticType.Add);
  }

  private ADC_Z() {
    this.utils.arithmetic(AddressingMode.Zero_Page, ArithmeticType.Add);
  }

  private ADC_ZX() {
    this.utils.arithmetic(
      AddressingMode.Zero_Page_Offset_X,
      ArithmeticType.Add
    );
  }

  private ADC_A() {
    this.utils.arithmetic(AddressingMode.Absolute, ArithmeticType.Add);
  }

  private ADC_AX() {
    this.utils.arithmetic(AddressingMode.Absolute_X, ArithmeticType.Add);
  }

  private ADC_AY() {
    this.utils.arithmetic(AddressingMode.Absolute_Y, ArithmeticType.Add);
  }

  private ADC_IX() {
    this.utils.arithmetic(AddressingMode.Indirect_Offset_X, ArithmeticType.Add);
  }

  private ADC_IY() {
    this.utils.arithmetic(AddressingMode.Indirect_Offset_Y, ArithmeticType.Add);
  }

  private SBC_I() {
    this.utils.arithmetic(AddressingMode.Immediate, ArithmeticType.Subtract);
  }

  private SBC_Z() {
    this.utils.arithmetic(AddressingMode.Zero_Page, ArithmeticType.Subtract);
  }

  private SBC_ZX() {
    this.utils.arithmetic(
      AddressingMode.Zero_Page_Offset_X,
      ArithmeticType.Subtract
    );
  }

  private SBC_A() {
    this.utils.arithmetic(AddressingMode.Absolute, ArithmeticType.Subtract);
  }

  private SBC_AX() {
    this.utils.arithmetic(AddressingMode.Absolute_X, ArithmeticType.Subtract);
  }

  private SBC_AY() {
    this.utils.arithmetic(AddressingMode.Absolute_Y, ArithmeticType.Subtract);
  }

  private SBC_IX() {
    this.utils.arithmetic(
      AddressingMode.Indirect_Offset_X,
      ArithmeticType.Subtract
    );
  }

  private SBC_IY() {
    this.utils.arithmetic(
      AddressingMode.Indirect_Offset_Y,
      ArithmeticType.Subtract
    );
  }

  /**
   *  Comparison Operations Instructions - CMP, CPX, CPY
   */

  private CMP_I() {
    this.utils.compare(AddressingMode.Immediate, DataRegister.A);
  }

  private CMP_Z() {
    this.utils.compare(AddressingMode.Zero_Page, DataRegister.A);
  }

  private CMP_ZX() {
    this.utils.compare(AddressingMode.Zero_Page_Offset_X, DataRegister.A);
  }

  private CMP_A() {
    this.utils.compare(AddressingMode.Absolute, DataRegister.A);
  }

  private CMP_AX() {
    this.utils.compare(AddressingMode.Absolute_X, DataRegister.A);
  }

  private CMP_AY() {
    this.utils.compare(AddressingMode.Absolute_Y, DataRegister.A);
  }

  private CMP_IX() {
    this.utils.compare(AddressingMode.Indirect_Offset_X, DataRegister.A);
  }

  private CMP_IY() {
    this.utils.compare(AddressingMode.Indirect_Offset_Y, DataRegister.A);
  }

  private CPX_I() {
    this.utils.compare(AddressingMode.Immediate, DataRegister.X);
  }

  private CPX_Z() {
    this.utils.compare(AddressingMode.Zero_Page, DataRegister.X);
  }

  private CPX_A() {
    this.utils.compare(AddressingMode.Absolute, DataRegister.X);
  }

  private CPY_I() {
    this.utils.compare(AddressingMode.Immediate, DataRegister.Y);
  }

  private CPY_Z() {
    this.utils.compare(AddressingMode.Zero_Page, DataRegister.Y);
  }

  private CPY_A() {
    this.utils.compare(AddressingMode.Absolute, DataRegister.Y);
  }

  /**
   *  Stack Operations Instructions - PHA, PHP, PLA, PLP
   */

  private PHA() {
    this.utils.pushStackValue(this.registers.getAccumulator());
    this.registers.incrementProgramCounter();
  }

  private PHP() {
    this.utils.pushStackValue(this.registers.getStatusRegister());
    this.registers.incrementProgramCounter();
  }

  private PLA() {
    this.registers.setAccumulator(this.utils.pullStackValue());
    this.registers.setZeroNegativeFlagsFromValue(
      this.registers.getAccumulator()
    );
    this.registers.incrementProgramCounter();
  }

  private PLP() {
    this.registers.setStatusRegister(this.utils.pullStackValue());
    this.registers.incrementProgramCounter();
  }

  /**
   *  Branch Operations Instructions - BCC, BCS, BEQ, BMI, BNE, BPL, BVC, BVS
   */

  private BCS() {
    this.utils.branch(this.registers.getCarry());
  }

  private BCC() {
    this.utils.branch(!this.registers.getCarry());
  }

  private BEQ() {
    this.utils.branch(this.registers.getZero());
  }

  private BNE() {
    this.utils.branch(!this.registers.getZero());
  }

  private BMI() {
    this.utils.branch(this.registers.getNegative());
  }

  private BPL() {
    this.utils.branch(!this.registers.getNegative());
  }

  private BVS() {
    this.utils.branch(this.registers.getOverflow());
  }

  private BVC() {
    this.utils.branch(!this.registers.getOverflow());
  }

  // ******** NEEDS REFACTORING USING UTILS **********

  // private LSR_A() {
  //   this.registers.clearNegative();
  //   const a = this.registers.getAccumulator();
  //   a & 0b1 ? this.registers.setCarry() : this.registers.clearCarry();
  //   const result = a >> 1;
  //   this.registers.setZeroFromValue(result);
  //   this.registers.setAccumulator(result);
  //   this.registers.incrementProgramCounter();
  // }

  // private BIT() {
  //   this.registers.incrementProgramCounter();
  //   const memVal = this.utils.getValue(AddressingMode.Absolute);
  //   const and = this.registers.getAccumulator() & memVal;
  //   this.registers.setZeroFromValue(and);
  //   this.registers.setNegativeFromValue(memVal);
  //   ((memVal & 0b01000000) >> 6) & 1
  //     ? this.registers.setOverflow()
  //     : this.registers.clearOverflow();
  //   this.registers.incrementProgramCounter(2);
  // }

  // private ROL_Z() {
  //   // TODO: double check this for accuracy
  //   this.registers.incrementProgramCounter();
  //   const address = this.ram.get8(this.registers.getProgramCounter());
  //   const value = this.ram.get8(address);
  //   const newCarry = !!((value >> 7) & 1);
  //   const oldCarry = +this.registers.getCarry();
  //   const result = ((value & 0x01111111) << 1) | oldCarry;
  //   this.ram.set8(address, result);
  //   newCarry ? this.registers.setCarry() : this.registers.clearCarry();
  //   this.registers.setZeroNegativeFlagsFromValue(
  //     this.utils.getValue(AddressingMode.Absolute_X)
  //   );
  //   this.registers.incrementProgramCounter();
  // }

  // private ASL_A() {
  //   // TODO: double check this for accuracy
  //   const value = this.registers.getAccumulator();
  //   const newCarry = !!((value >> 7) & 1);
  //   const result = (value << 1) & 0x1111_1111;
  //   this.registers.setAccumulator(result);
  //   newCarry ? this.registers.setCarry() : this.registers.clearCarry();
  //   this.registers.setZeroNegativeFlagsFromValue(
  //     this.registers.getAccumulator()
  //   );
  //   this.registers.incrementProgramCounter();
  // }

  // private ROR_AX() {
  //   // TODO: double check this for accuracy
  //   this.registers.incrementProgramCounter();
  //   const value = this.utils.getValue(AddressingMode.Absolute_X);
  //   const newCarry = !!(value & 1);
  //   const oldCarry = +this.registers.getCarry();
  //   const result = ((value & 0x11111110) >> 1) | (oldCarry << 7);
  //   this.utils.setValue(AddressingMode.Absolute_X, result);
  //   newCarry ? this.registers.setCarry() : this.registers.clearCarry();
  //   this.registers.setZeroNegativeFlagsFromValue(
  //     this.utils.getValue(AddressingMode.Absolute_X)
  //   );
  //   this.registers.incrementProgramCounter(2);
  // }

  // private ROL_A() {
  //   // TODO: double check this for accuracy
  //   const a = this.registers.getAccumulator();
  //   const newCarry = !!((a >> 7) & 1);
  //   const oldCarry = +this.registers.getCarry();
  //   const result = ((a & 0x01111111) << 1) | oldCarry;
  //   this.registers.setAccumulator(result);
  //   newCarry ? this.registers.setCarry() : this.registers.clearCarry();
  //   this.registers.setZeroNegativeFlagsFromValue(
  //     this.registers.getAccumulator()
  //   );
  //   this.registers.incrementProgramCounter();
  // }

  private JSR() {
    const PC = this.registers.getProgramCounter() + 2;
    this.utils.pushStack(PC);
    this.registers.incrementProgramCounter();
    const jumpAddress = this.ram.get16(this.registers.getProgramCounter());
    this.registers.setProgramCounter(jumpAddress);
  }

  private JMP_A() {
    this.registers.incrementProgramCounter();
    const jumpAddress = this.ram.get16(this.registers.getProgramCounter());
    this.registers.setProgramCounter(jumpAddress);
  }

  private JMP_I() {
    this.registers.incrementProgramCounter();
    const indirect = this.ram.get16(this.registers.getProgramCounter());
    const jumpAddress = this.ram.get16(indirect);
    this.registers.setProgramCounter(jumpAddress);
  }

  private RTS() {
    const PC = this.utils.pullStack();
    this.registers.setProgramCounter(PC);
    this.registers.incrementProgramCounter();
  }

  private NMI() {
    this.utils.pushStack(this.registers.getProgramCounter());
    this.utils.pushStackValue(this.registers.getStatusRegister());
    this.registers.setInteruptDisable();
    this.registers.setProgramCounter(this.ram.get16(0xfffa));
  }

  private RTI() {
    const status = this.utils.pullStackValue();
    this.registers.setStatusRegister(status);
    const PC = this.utils.pullStack();
    this.registers.setProgramCounter(PC);
  }

  private NOP() {
    this.registers.incrementProgramCounter();
  }
}

enum ArithmeticType {
  Add,
  Subtract,
}

enum StepDirection {
  Increment = 1,
  Decrement = -1,
}

enum DataRegister {
  X,
  Y,
  A,
  STACK_POINTER,
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
  Relative,
}

enum LogicalOperationType {
  AND,
  EXCLUSIVE_OR,
  INCLUSIVE_OR,
}

const POST_EXECUTION_PC_STEPS = {
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
    const mCompliment = ~m + 1;
    const c = this.getFlagValue(STATUS_FLAGS.CARRY);
    const b = !c;
    const { result, carry, overflow } = Utils.bitAdd(
      a,
      type === ArithmeticType.Add ? m : mCompliment,
      type === ArithmeticType.Add ? c : b
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
    const m = ~this.getValue(mode) + 1;
    const { result, carry } = Utils.bitAdd(r, m, false);
    this.setNZ(result);
    carry
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

export default Execute;
