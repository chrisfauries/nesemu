import Cartridge from "./cartridge";
import { MAPPER } from "./enums";

enum Byte {
  LOW,
  HIGH,
}

enum PPU_INCREMENT_MODE {
  HORIZONTAL = 1,
  VERTICAL = 32,
}

// TODO: split vram out as dependency class
class RAM {
  private cpuRam = new Uint8Array(new ArrayBuffer(0x0800));
  private buffer: ArrayBuffer = new ArrayBuffer(0xffff + 1);
  private vRam: Uint8Array = new Uint8Array(new ArrayBuffer(0x3fff));
  public vRamAddress: number = 0x00;
  private vRamAddressByte: Byte = Byte.HIGH;
  private oamAddress: number = 0x00;
  private oamData: Uint8Array = new Uint8Array(0x100);
  private bytes: Uint8Array;
  private cartridge: Cartridge;

  // Controller
  private controllerOneState: number = 0;
  private controllerOneStrobe: boolean = false;
  private controllerOneLatchedValue: number = 0;
  private controllerOneReadBit: number = 8;

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
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      return this.get8CPURAM(bit16address);
    }

    if (bit16address >= 0x2008 && bit16address < 0x3fff) {
      console.log("reading mirrored PPU range - NOT IMPLEMENTED");
    }

    if (bit16address === 0x2004) {
      console.log("reading from the OAM data reg - NOT IMPLEMENTED");
    }

    if (bit16address === 0x4016) {
      return this.controllerRead();
    }

    if (bit16address === 0x2002) {
      const value = this.bytes[bit16address];
      this.bytes[bit16address] = value & 0b0111_1111;
      return value;
    }
    if (bit16address === 0x2007) {
      const value = this.vRam[this.vRamAddress];
      this.vRamAddress += this.getPPU_CTRL_INCREMENT_MODE();
      return value;
    }

    return this.bytes[bit16address];
  }

  private get8CPURAM(bit16address: number) {
    return this.cpuRam[bit16address & 0x07ff];
  }

  public get8signed(bit16address: number) {
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      return new Int8Array([this.get8CPURAM(bit16address)])[0]; // TODO: slow
    } 
    return new Int8Array([this.bytes[bit16address]])[0]; // TODO: slow
  }

  public get16(bit16address: number) {
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      const low = this.get8CPURAM(bit16address);
      const high = this.get8CPURAM(bit16address + 1);
      return (high << 8) + low;
    }
    const low = this.bytes[bit16address];
    const high = this.bytes[bit16address + 1];
    return (high << 8) + low;
  }

  public set8(bit16address: number, value: number) {
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      // if (bit16address === 0x0000 && value === 0x93) { // Used for nestest.nes break points
      //   throw new Error('setting error code')
      // }
      return this.set8CPURAM(bit16address, value);
    }

    if (bit16address >= 0x2008 && bit16address < 0x3fff) {
      console.log("writing mirrored PPU range - NOT IMPLEMENTED");
    }

    if (bit16address === 0x2003) {
      this.oamAddress = value;
    }

    if (bit16address === 0x2004) {
      console.log("writing to the OAM data reg - NOT IMPLEMENTED");
    }

    if (bit16address === 0x4014) {
      const cpuData = this.cpuRam.subarray(value << 8, (value << 8) + 0xff);
      cpuData.forEach((byte) => {
        this.oamData[this.oamAddress++] = byte;
      });
    }

    if (bit16address === 0x4016) {
      this.controllerWrite(value);
    }

    // Forward to PPU RAM
    if (bit16address === 0x2006) {
      if (this.vRamAddressByte === Byte.HIGH) {
        this.vRamAddress = value << 8;
        this.vRamAddressByte = Byte.LOW;
      } else {
        this.vRamAddress += value;
        this.vRamAddressByte = Byte.HIGH;
      }
    }
    if (bit16address === 0x2007) {
      this.vRam[this.vRamAddress] = value;
      this.vRamAddress += this.getPPU_CTRL_INCREMENT_MODE();
    }

    this.bytes[bit16address] = value;
  }

  private set8CPURAM(bit16address: number, value: number) {
    this.cpuRam[bit16address & 0x7ff] = value;
  }

  public set16(bit16address: number, value: number) {
    const low = value & 0x11111111;
    const high = value >> 8;
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      this.set8CPURAM(bit16address, low);
      this.set8CPURAM(bit16address + 1, high);
      return;
    }
    this.bytes[bit16address] = low;
    this.bytes[bit16address + 1] = high;
  }

  public get8vRam(bit16address: number) {
    return this.vRam[bit16address];
  }

  public get8vRamRange(bit16addressStart: number, bit16addressEnd: number) {
    return this.vRam.subarray(bit16addressStart, bit16addressEnd);
  }

  public getOAMData() {
    return this.oamData;
  }

  public getCHRROM() {
    return this.cartridge.getCHRROM();
  }

  public getPPU_CTRL() { // TODO: slow
    return new Uint8Array(this.buffer, 0x2000, 1);
  }

  public getPPU_CTRL_INCREMENT_MODE() {
    return this.getPPU_CTRL()[0] & 0b0000_0100
      ? PPU_INCREMENT_MODE.VERTICAL
      : PPU_INCREMENT_MODE.HORIZONTAL;
  }

  public getPPU_MASK() { // TODO: slow
    return new Uint8Array(this.buffer, 0x2001, 1);
  }

  public getPPU_STATUS() { // TODO: slow
    return new Uint8Array(this.buffer, 0x2002, 1);
  }

  public getNMI() {
    return !!(
      this.getPPU_CTRL()[0] & 0b1000_0000 &&
      this.getPPU_STATUS()[0] & 0b1000_0000
    );
  }

  // TESTING
  public setvRam(address: number, val: number) {
    this.vRam[address] = val;
  }

  // Controller methods
  controllerRead() {
    if (this.controllerOneReadBit >= 8) {
      return 1;
    }

    return +!!(
      this.controllerOneLatchedValue &
      (1 << this.controllerOneReadBit++)
    );
  }

  controllerWrite(val: number) {
    if (val & 1) {
      this.controllerOneStrobe = true;
    }

    if (!(val & 1) && this.controllerOneStrobe) {
      this.controllerOneLatchedValue = this.controllerOneState;
      this.controllerOneReadBit = 0;
    }
  }

  getControllerOneState() {
    return this.controllerOneState;
  }

  setControllerOneState(val: number) {
    this.controllerOneState = val;
  }
}

export default RAM;
