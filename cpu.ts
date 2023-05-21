import { CPU_INSTRUCTION, CPU_INSTRUCTION_CYCLES } from "./enums";
import RAM from "./ram";
import Registers from "./registers";
import Execute from "./execute";

class CPU {
  // Debugging values
  private enableLogs: boolean = false;
  private skipCycles: boolean = false;

  // Initialized RAM and Registers
  private ram: RAM;
  private registers!: Registers;

  // NMI
  private NMIflipped : boolean = false;

  // Values for the current/last operation executed
  private opcode: number = 0x00;
  private instruction: CPU_INSTRUCTION = CPU_INSTRUCTION.NOP;
  private cyclesLeftForInstruction: number = 0;

  constructor(ram: RAM) {
    this.ram = ram;
    this.init();
  }

  init() {
    this.buildRegisters();
    this.resetVector();
  }

  buildRegisters() {
    this.registers = new Registers();
  }

  resetVector() {
    this.registers.setProgramCounter(
      this.ram.get16(this.registers.getProgramCounter())
    );
  }

  tick() {
    if (this.cyclesLeftForInstruction > 0) {
      this.cyclesLeftForInstruction--;
      return;
    }

    this.checkInterupts();

    this.fetch();
    this.decode();
    this.execute();
    !this.skipCycles && this.setCycles();
  }

  checkInterupts() {
    if (this.ram.getNMI() && !this.NMIflipped) {
      Execute.execute(CPU_INSTRUCTION.NMI, this.ram, this.registers);
    }
    this.NMIflipped = this.ram.getNMI();
  }

  fetch() {
    this.opcode = this.ram.get8(this.registers.getProgramCounter());
  }

  decode() {
    this.instruction = this.opcode;
  }

  execute() {
    Execute.execute(this.instruction, this.ram, this.registers);
  }

  setCycles() {
    this.cyclesLeftForInstruction =
      CPU_INSTRUCTION_CYCLES[
        CPU_INSTRUCTION[this.instruction] as keyof typeof CPU_INSTRUCTION
      ] - 1;
  }

  // FOR TESTING
  logRegisters() {
    return this.registers;
  }

  logDecode() {
    const log = {
      OP: CPU_INSTRUCTION[this.opcode],
      PC: this.registers.getProgramCounter(),
    };
    console.log(JSON.stringify(log) + "\n");
  }

  logExecute() {
    const log = {
      A: this.registers.getAccumulator(),
      X: this.registers.getX(),
      Y: this.registers.getY(),
      Z: this.registers.getZero(),
      N: this.registers.getNegative(),
      C: this.registers.getCarry(),
    };
    console.log(JSON.stringify(log) + "\n");
  }
}

export default CPU;
