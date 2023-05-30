import RAM from "./ram";

export enum Button {
    A,
    B,
    Select,
    Start,
    Up,
    Down,
    Left,
    Right,
  Unknown,
}

class Controller {
  private ram: RAM;
  //   private JOYPAD1: number = 0x4016;
  //   private JOYPAD2: number = 0x4017;
  private handleKeyUpBound;
  private handleKeyDownBound;
  //   private latchedJoyPad1State;

  constructor(ram: RAM) {
    this.ram = ram;
    this.handleKeyUpBound = this.handleKeyUp.bind(this);
    this.handleKeyDownBound = this.handleKeyDown.bind(this);
  }

  start() {
    window.addEventListener("keydown", this.handleKeyDownBound);
    window.addEventListener("keyup", this.handleKeyUpBound);
  }

  stop() {
    window.removeEventListener("keydown", this.handleKeyDownBound);
    window.removeEventListener("keyup", this.handleKeyUpBound);
  }

  handleKeyDown(e: KeyboardEvent) {
    const button = this.getButton(e.code);
    if (button === Button.Unknown) {
      return;
    }

    this.pushButton(button);
  }

  handleKeyUp(e: KeyboardEvent) {
    const button = this.getButton(e.code);
    if (button === Button.Unknown) {
      return;
    }

    this.releaseButton(button);
  }

  pushButton(button: Button) {
    this.ram.setControllerOneState(
      this.ram.getControllerOneState() | (1 << button)
    );
  }

  releaseButton(button: Button) {
    this.ram.setControllerOneState(
      this.ram.getControllerOneState() ^ (1 << button)
    );
  }

  getButton(code: string) {
    switch (code) {
      case "ArrowUp":
        return Button.Up;
      case "ArrowDown":
        return Button.Down;
      case "ArrowLeft":
        return Button.Left;
      case "ArrowRight":
        return Button.Right;
      case "Enter":
        return Button.Start;
      case "Backspace":
        return Button.Select;
      case "Space":
        return Button.A;
      case "ShiftLeft":
        return Button.B;
      default:
        return Button.Unknown;
    }
  }
}

export default Controller;
