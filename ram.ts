import Cartridge from "./cartridge";
import { MAPPER } from "./enums";

enum Byte {
  LOW,
  HIGH,
}

// TODO: split vram out as dependency class
class RAM {
  private buffer: ArrayBuffer = new ArrayBuffer(0xffff + 1);
  private vRam: Uint8Array = new Uint8Array(new ArrayBuffer(0x3fff));
  public vRamAddress: number = 0x00;
  private vRamAddressByte: Byte = Byte.HIGH;
  private bytes: Uint8Array;
  private cartridge: Cartridge;

  constructor(cartridge: Cartridge) {
    this.cartridge = cartridge;
    this.bytes = new Uint8Array(this.buffer);
    this.init();
  }

  private init() {
    // There is more to this here
    this.bytes.set(
      this.cartridge.getPRGROM(),
      this.cartridge.getHeader().mapper == MAPPER.NROM ? 0xc000 : 0x8000
    );
  }

  public get8(bit16address: number) {
    if (bit16address === 0x2002) {
      console.log("reading PPU Status, clearing VBL flag");
      const value = this.bytes[bit16address]
      this.bytes[bit16address] = value & 0b0111_1111;
      return value;
    }
    if (bit16address === 0x2007) {
      console.log("reading data from PPU vRAM at: ", this.vRamAddress);
      return this.vRam[this.vRamAddress++]
    }

    return this.bytes[bit16address];
  }

  public get8signed(bit16address: number) {
    return new Int8Array([this.bytes[bit16address]])[0];
  }

  public get16(bit16address: number) {
    const low = this.bytes[bit16address];
    const high = this.bytes[bit16address + 1];
    return (high << 8) + low;
  }

  public set8(bit16address: number, value: number) {
    // Forward to PPU RAM
    if (bit16address === 0x2006) {
      console.log("setting PPU vRAM address to: ", value);
      if (this.vRamAddressByte === Byte.HIGH) {
        this.vRamAddress = value << 8;
        this.vRamAddressByte = Byte.LOW;
      } else {
        this.vRamAddress += value;
        this.vRamAddressByte = Byte.HIGH;
      }
      console.log("new vRam Value: ", this.vRamAddress);
    }
    if (bit16address === 0x2007) {
      console.log("sending data to PPU vRAM: ", value);
      this.vRam[this.vRamAddress++] = value;
    }

    this.bytes[bit16address] = value;
  }

  public set16(bit16address: number, value: number) {
    const low = value & 0x11111111;
    const high = value >> 8;
    this.bytes[bit16address] = low;
    this.bytes[bit16address + 1] = high;
  }

  public get8vRam(bit16address: number) {
    return this.vRam[bit16address];
  }

  public getCHRROM() {
    return this.cartridge.getCHRROM();
  }

  public getPPU_CTRL() {
    return new Uint8Array(this.buffer, 0x2000, 1);
  }

  public getPPU_MASK() {
    return new Uint8Array(this.buffer, 0x2001, 1);
  }

  public getPPU_STATUS() {
    return new Uint8Array(this.buffer, 0x2002, 1);
  }

  public getNMI() {
    return !!(
      this.getPPU_CTRL()[0] & 0b1000_0000 &&
      this.getPPU_STATUS()[0] & 0b1000_0000
    );
  }

  // TESTING
  public setvRam(address: number, val:number) {
    this.vRam[address] = val;
  }
}

export default RAM;
