import { CPU_INSTRUCTION, STATUS_FLAGS } from "./enums";
import Utils, {
  StepDirection,
  DataRegister,
  AddressingMode,
  LogicalOperationType,
  ArithmeticType,
  ShiftType,
  ShiftDirection,
} from "./execute-utils";
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

  private readonly instructionMap: { [key in CPU_INSTRUCTION]: () => void } = {
    // Increment Instructions
    [0xe8]: this.INX.bind(this),
    [0xc8]: this.INY.bind(this),
    [0xe6]: this.INC_Z.bind(this),
    [0xf6]: this.INC_ZX.bind(this),
    [0xee]: this.INC_A.bind(this),
    [0xfe]: this.INC_AX.bind(this),

    // Decrement Instructions
    [0xca]: this.DEX.bind(this),
    [0x88]: this.DEY.bind(this),
    [0xc6]: this.DEC_Z.bind(this),
    [0xd6]: this.DEC_ZX.bind(this),
    [0xce]: this.DEC_A.bind(this),
    [0xde]: this.DEC_AX.bind(this),

    // Status Flag Instructions
    [0x38]: this.SEC.bind(this),
    [0xf8]: this.SED.bind(this),
    [0x78]: this.SEI.bind(this),
    [0x18]: this.CLC.bind(this),
    [0xd8]: this.CLD.bind(this),
    [0x58]: this.CLI.bind(this),
    [0xb8]: this.CLV.bind(this),

    // Logical Instructions
    [0x29]: this.AND_I.bind(this),
    [0x25]: this.AND_Z.bind(this),
    [0x35]: this.AND_ZX.bind(this),
    [0x2d]: this.AND_A.bind(this),
    [0x3d]: this.AND_AX.bind(this),
    [0x39]: this.AND_AY.bind(this),
    [0x21]: this.AND_IX.bind(this),
    [0x31]: this.AND_IY.bind(this),
    [0x49]: this.EOR_I.bind(this),
    [0x45]: this.EOR_Z.bind(this),
    [0x55]: this.EOR_ZX.bind(this),
    [0x4d]: this.EOR_A.bind(this),
    [0x5d]: this.EOR_AX.bind(this),
    [0x59]: this.EOR_AY.bind(this),
    [0x41]: this.EOR_IX.bind(this),
    [0x51]: this.EOR_IY.bind(this),
    [0x09]: this.ORA_I.bind(this),
    [0x05]: this.ORA_Z.bind(this),
    [0x15]: this.ORA_ZX.bind(this),
    [0x0d]: this.ORA_A.bind(this),
    [0x1d]: this.ORA_AX.bind(this),
    [0x19]: this.ORA_AY.bind(this),
    [0x01]: this.ORA_IX.bind(this),
    [0x11]: this.ORA_IY.bind(this),

    // Load Register Instructions
    [0xa9]: this.LDA_I.bind(this),
    [0xa5]: this.LDA_Z.bind(this),
    [0xb5]: this.LDA_ZX.bind(this),
    [0xad]: this.LDA_A.bind(this),
    [0xbd]: this.LDA_AX.bind(this),
    [0xb9]: this.LDA_AY.bind(this),
    [0xa1]: this.LDA_IX.bind(this),
    [0xb1]: this.LDA_IY.bind(this),
    [0xa2]: this.LDX_I.bind(this),
    [0xa6]: this.LDX_Z.bind(this),
    [0xb6]: this.LDX_ZY.bind(this),
    [0xae]: this.LDX_A.bind(this),
    [0xbe]: this.LDX_AY.bind(this),
    [0xa0]: this.LDY_I.bind(this),
    [0xa4]: this.LDY_Z.bind(this),
    [0xb4]: this.LDY_ZX.bind(this),
    [0xac]: this.LDY_A.bind(this),
    [0xbc]: this.LDY_AX.bind(this),

    // Store Register Instructions
    [0x85]: this.STA_Z.bind(this),
    [0x95]: this.STA_ZX.bind(this),
    [0x8d]: this.STA_A.bind(this),
    [0x9d]: this.STA_AX.bind(this),
    [0x99]: this.STA_AY.bind(this),
    [0x81]: this.STA_IX.bind(this),
    [0x91]: this.STA_IY.bind(this),
    [0x86]: this.STX_Z.bind(this),
    [0x96]: this.STX_ZY.bind(this),
    [0x8e]: this.STX_A.bind(this),
    [0x84]: this.STY_Z.bind(this),
    [0x94]: this.STY_ZX.bind(this),
    [0x8c]: this.STY_A.bind(this),

    // Transfer Register Instructions
    [0xaa]: this.TAX.bind(this),
    [0xa8]: this.TAY.bind(this),
    [0xba]: this.TSX.bind(this),
    [0x8a]: this.TXA.bind(this),
    [0x9a]: this.TXS.bind(this),
    [0x98]: this.TYA.bind(this),

    // Arithmetic Instructions
    [0x69]: this.ADC_I.bind(this),
    [0x65]: this.ADC_Z.bind(this),
    [0x75]: this.ADC_ZX.bind(this),
    [0x6d]: this.ADC_A.bind(this),
    [0x7d]: this.ADC_AX.bind(this),
    [0x79]: this.ADC_AY.bind(this),
    [0x61]: this.ADC_IX.bind(this),
    [0x71]: this.ADC_IY.bind(this),
    [0xe9]: this.SBC_I.bind(this),
    [0xe5]: this.SBC_Z.bind(this),
    [0xf5]: this.SBC_ZX.bind(this),
    [0xed]: this.SBC_A.bind(this),
    [0xfd]: this.SBC_AX.bind(this),
    [0xf9]: this.SBC_AY.bind(this),
    [0xe1]: this.SBC_IX.bind(this),
    [0xf1]: this.SBC_IY.bind(this),

    // Comparison Instructions
    [0xc9]: this.CMP_I.bind(this),
    [0xc5]: this.CMP_Z.bind(this),
    [0xd5]: this.CMP_ZX.bind(this),
    [0xcd]: this.CMP_A.bind(this),
    [0xdd]: this.CMP_AX.bind(this),
    [0xd9]: this.CMP_AY.bind(this),
    [0xc1]: this.CMP_IX.bind(this),
    [0xd1]: this.CMP_IY.bind(this),
    [0xe0]: this.CPX_I.bind(this),
    [0xe4]: this.CPX_Z.bind(this),
    [0xec]: this.CPX_A.bind(this),
    [0xc0]: this.CPY_I.bind(this),
    [0xc4]: this.CPY_Z.bind(this),
    [0xcc]: this.CPY_A.bind(this),

    // Stack Register Instructions
    [0x48]: this.PHA.bind(this),
    [0x08]: this.PHP.bind(this),
    [0x68]: this.PLA.bind(this),
    [0x28]: this.PLP.bind(this),

    // Branch Register Instructions
    [0x90]: this.BCC.bind(this),
    [0xb0]: this.BCS.bind(this),
    [0xf0]: this.BEQ.bind(this),
    [0xd0]: this.BNE.bind(this),
    [0x30]: this.BMI.bind(this),
    [0x10]: this.BPL.bind(this),
    [0x50]: this.BVC.bind(this),
    [0x70]: this.BVS.bind(this),

    // Shift & Rotate Instructions
    [0x0a]: this.ASL_ACC.bind(this),
    [0x06]: this.ASL_Z.bind(this),
    [0x16]: this.ASL_ZX.bind(this),
    [0x0e]: this.ASL_A.bind(this),
    [0x1e]: this.ASL_AX.bind(this),
    [0x4a]: this.LSR_ACC.bind(this),
    [0x46]: this.LSR_Z.bind(this),
    [0x56]: this.LSR_ZX.bind(this),
    [0x4e]: this.LSR_A.bind(this),
    [0x5e]: this.LSR_AX.bind(this),
    [0x2a]: this.ROL_ACC.bind(this),
    [0x26]: this.ROL_Z.bind(this),
    [0x36]: this.ROL_ZX.bind(this),
    [0x2e]: this.ROL_A.bind(this),
    [0x3e]: this.ROL_AX.bind(this),
    [0x6a]: this.ROR_ACC.bind(this),
    [0x66]: this.ROR_Z.bind(this),
    [0x76]: this.ROR_ZX.bind(this),
    [0x6e]: this.ROR_A.bind(this),
    [0x7e]: this.ROR_AX.bind(this),

    // Jump Instructions
    [0x20]: this.JSR.bind(this),
    [0x4c]: this.JMP_A.bind(this),
    [0x6c]: this.JMP_I.bind(this),
    [0x60]: this.RTS.bind(this),

    // Interrupt Instructions
    [0xfffa]: this.NMI.bind(this),
    [0x40]: this.RTI.bind(this),

    // Other Instructions
    [0x24]: this.BIT_Z.bind(this),
    [0x2c]: this.BIT_A.bind(this),
    [0xea]: this.NOP.bind(this),

    // Illegal Instructions
    [0x04]: this.NOP_Ill1.bind(this),
    [0x44]: this.NOP_Ill2.bind(this),
    [0x64]: this.NOP_Ill3.bind(this),
    [0x0c]: this.NOP_Ill4.bind(this),
    [0x14]: this.NOP_Ill5.bind(this),
    [0x34]: this.NOP_Ill6.bind(this),
    [0x54]: this.NOP_Ill7.bind(this),
    [0x74]: this.NOP_Ill8.bind(this),
    [0xd4]: this.NOP_Ill9.bind(this),
    [0xf4]: this.NOP_Ill10.bind(this),
    [0x1a]: this.NOP_Ill11.bind(this),
    [0x3a]: this.NOP_Ill12.bind(this),
    [0x5a]: this.NOP_Ill13.bind(this),
    [0x7a]: this.NOP_Ill14.bind(this),
    [0xda]: this.NOP_Ill15.bind(this),
    [0xfa]: this.NOP_Ill16.bind(this),
    [0x80]: this.NOP_Ill17.bind(this),
    [0x1c]: this.NOP_Ill18.bind(this),
    [0x3c]: this.NOP_Ill19.bind(this),
    [0x5c]: this.NOP_Ill20.bind(this),
    [0x7c]: this.NOP_Ill21.bind(this),
    [0xdc]: this.NOP_Ill22.bind(this),
    [0xfc]: this.NOP_Ill23.bind(this),
    [0xa3]: this.LAX_IX.bind(this),
    [0xa7]: this.LAX_Z.bind(this),
    [0xaf]: this.LAX_A.bind(this),
  };

  public execute(instruction: CPU_INSTRUCTION) {
    // TODO: fix type here
    // type methodName = Exclude<keyof Execute, "prototype" | "execute">;
    // const fn: () => {} = this[CPU_INSTRUCTION[instruction] as methodName]; // TODO: slow
    const fn: (() => void) | undefined = this.instructionMap[instruction];
    if (fn === undefined) {
      throw Error(
        "no method implementation for code: " +
          instruction.toString(16) +
          "\n" +
          "Instructions executed: " +
          instructionsExecuted
      );
    }

    fn();
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
    this.utils.pushStackValue(this.registers.getStatusRegister() | 0b0011_0000); // setting bit 5 and 4 on always
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

  /**
   *  Shift/Rotate Operations Instructions -
   */

  private ASL_ACC() {
    this.utils.shift(
      AddressingMode.Accumulator,
      ShiftType.Shift,
      ShiftDirection.Left
    );
  }

  private ASL_Z() {
    this.utils.shift(
      AddressingMode.Zero_Page,
      ShiftType.Shift,
      ShiftDirection.Left
    );
  }

  private ASL_ZX() {
    this.utils.shift(
      AddressingMode.Zero_Page_Offset_X,
      ShiftType.Shift,
      ShiftDirection.Left
    );
  }

  private ASL_A() {
    this.utils.shift(
      AddressingMode.Absolute,
      ShiftType.Shift,
      ShiftDirection.Left
    );
  }

  private ASL_AX() {
    this.utils.shift(
      AddressingMode.Absolute_X,
      ShiftType.Shift,
      ShiftDirection.Left
    );
  }

  private LSR_ACC() {
    this.utils.shift(
      AddressingMode.Accumulator,
      ShiftType.Shift,
      ShiftDirection.Right
    );
  }

  private LSR_Z() {
    this.utils.shift(
      AddressingMode.Zero_Page,
      ShiftType.Shift,
      ShiftDirection.Right
    );
  }

  private LSR_ZX() {
    this.utils.shift(
      AddressingMode.Zero_Page_Offset_X,
      ShiftType.Shift,
      ShiftDirection.Right
    );
  }

  private LSR_A() {
    this.utils.shift(
      AddressingMode.Absolute,
      ShiftType.Shift,
      ShiftDirection.Right
    );
  }

  private LSR_AX() {
    this.utils.shift(
      AddressingMode.Absolute_X,
      ShiftType.Shift,
      ShiftDirection.Right
    );
  }

  private ROL_ACC() {
    this.utils.shift(
      AddressingMode.Accumulator,
      ShiftType.Rotate,
      ShiftDirection.Left
    );
  }

  private ROL_Z() {
    this.utils.shift(
      AddressingMode.Zero_Page,
      ShiftType.Rotate,
      ShiftDirection.Left
    );
  }

  private ROL_ZX() {
    this.utils.shift(
      AddressingMode.Zero_Page_Offset_X,
      ShiftType.Rotate,
      ShiftDirection.Left
    );
  }

  private ROL_A() {
    this.utils.shift(
      AddressingMode.Absolute,
      ShiftType.Rotate,
      ShiftDirection.Left
    );
  }

  private ROL_AX() {
    this.utils.shift(
      AddressingMode.Absolute_X,
      ShiftType.Rotate,
      ShiftDirection.Left
    );
  }

  private ROR_ACC() {
    this.utils.shift(
      AddressingMode.Accumulator,
      ShiftType.Rotate,
      ShiftDirection.Right
    );
  }

  private ROR_Z() {
    this.utils.shift(
      AddressingMode.Zero_Page,
      ShiftType.Rotate,
      ShiftDirection.Right
    );
  }

  private ROR_ZX() {
    this.utils.shift(
      AddressingMode.Zero_Page_Offset_X,
      ShiftType.Rotate,
      ShiftDirection.Right
    );
  }

  private ROR_A() {
    this.utils.shift(
      AddressingMode.Absolute,
      ShiftType.Rotate,
      ShiftDirection.Right
    );
  }

  private ROR_AX() {
    this.utils.shift(
      AddressingMode.Absolute_X,
      ShiftType.Rotate,
      ShiftDirection.Right
    );
  }

  // Other Instructions

  private BIT_Z() {
    this.utils.test(AddressingMode.Zero_Page);
  }

  private BIT_A() {
    this.utils.test(AddressingMode.Absolute);
  }

  // ******** NEEDS REFACTORING USING UTILS **********

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
    const jumpAddressLow = this.ram.get8(indirect);
    let jumpAddressHigh;
    if (!(0xff ^ (indirect & 0xff))) {
      jumpAddressHigh = this.ram.get8(indirect ^ 0x00ff);
    } else {
      jumpAddressHigh = this.ram.get8(indirect + 1);
    }
    const jumpAddress = (jumpAddressHigh << 8) + jumpAddressLow;
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

  /**
   *  Illegal Operations Instructions -
   */

  private NOP_Ill1() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill2() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill3() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill4() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill5() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill6() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill7() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill8() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill9() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill10() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill11() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill12() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill13() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill14() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill15() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill16() {
    this.registers.incrementProgramCounter();
  }

  private NOP_Ill17() {
    this.registers.incrementProgramCounter(2);
  }

  private NOP_Ill18() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill19() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill20() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill21() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill22() {
    this.registers.incrementProgramCounter(3);
  }

  private NOP_Ill23() {
    this.registers.incrementProgramCounter(3);
  }

  private LAX_IX() {
    this.LDA_IX();
    this.TAX();
    this.registers.incrementProgramCounter(-1);
  }

  private LAX_Z() {
    this.LDA_Z();
    this.TAX();
    this.registers.incrementProgramCounter(-1);
  }

  private LAX_A() {
    this.LDA_A();
    this.TAX();
    this.registers.incrementProgramCounter(-1);
  }
}

export default Execute;
