import { CPU_INSTRUCTION, CPU_INSTRUCTION_CYCLES } from "./enums";
import RAM from "./ram";
import Registers from "./registers";
import Execute from "./execute";
import fs from "fs";

class CPU {
  // Debugging values
  private enableLogs: boolean = false;
  private skipCycles: boolean = false;
  private stream = fs.createWriteStream("./log.txt");

  // Initialized RAM and Registers
  private ram: RAM;
  private registers!: Registers;
  private executor: (instruction: CPU_INSTRUCTION) => void;

  // NMI
  private NMIflipped: boolean = false;

  // Values for the current/last operation executed
  private opcode: number = 0x00;
  private instruction: CPU_INSTRUCTION = CPU_INSTRUCTION.NOP;
  private cyclesLeftForInstruction: number = 0;

  constructor(ram: RAM) {
    this.ram = ram;
    this.init();
    const e = new Execute(this.ram, this.registers);
    this.executor = new Execute(this.ram, this.registers).execute.bind(e);
  }

  init() {
    this.buildRegisters();
    // this.registers.setProgramCounter(0xc000); // TESTING
    this.resetVector();
  }

  buildRegisters() {
    this.registers = new Registers();
  }

  resetVector() {
    this.registers.setProgramCounter(
      this.ram.get16(0xfffc));
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
      this.executor(CPU_INSTRUCTION.NMI);
    }
    this.NMIflipped = this.ram.getNMI();
  }

  fetch() {
    this.opcode = this.ram.get8(this.registers.getProgramCounter());
  }

  decode() {
    this.instruction = this.opcode;
    this.enableLogs && this.logDecode(true);
  }

  execute() {
    this.executor(this.instruction);
    this.enableLogs && this.logExecute(true);
  }

  setCycles() {
    this.cyclesLeftForInstruction =
      CPU_INSTRUCTION_CYCLES[
        CPU_INSTRUCTION[this.instruction] as keyof typeof CPU_INSTRUCTION
      ] - 1  + this.ram.getExtraCycles();
  }

  // FOR TESTING
  logRegisters() {
    return this.registers;
  }

  logDecode(logFile?: boolean) {
    const log = {
      OP: CPU_INSTRUCTION[this.opcode],
      PC: this.registers.getProgramCounter().toString(16),
    };
    // console.log(JSON.stringify(log) + "\n");
    logFile && this.stream.write(JSON.stringify(log));
  }

  logExecute(logFile?: boolean) {
    const log = {
      A: this.registers.getAccumulator(),
      X: this.registers.getX(),
      Y: this.registers.getY(),
      SP: this.registers.getStatusRegister().toString(2),
      Z: this.registers.getZero(),
      N: this.registers.getNegative(),
      C: this.registers.getCarry(),
    };
    // console.log(JSON.stringify(log) + "\n");
    logFile && this.stream.write(JSON.stringify(log) + "\n");
  }
}

export default CPU;
