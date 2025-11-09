import Cartridge from "./cartridge";
import { MAPPER, MIRRORING_TYPE } from "./enums";

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
  private apuRegister: Uint8Array = new Uint8Array(new ArrayBuffer(0x17));
  private linearCounterReload = false;
  private noiseLengthReload = false;
  public vRamAddress: number = 0x00;
  private vRamAddressByte: Byte = Byte.HIGH;
  private oamAddress: number = 0x00;
  private ppuReadBuffer: number = 0;
  private oamData: Uint8Array = new Uint8Array(0x100);
  private bytes: Uint8Array;
  private cartridge: Cartridge;

  // MMC1 Registers
  private shiftRegister = 0x10;
  private controlRegister = 0x0c;
  private chrBank0Register = 0;
  private chrBank1Register = 0;
  private prgBankRegister = 0;

  // Controller
  private controllerOneState: number = 0;
  private controllerOneStrobe: boolean = false;
  private controllerOneLatchedValue: number = 0;
  private controllerOneReadBit: number = 8;

  // CPU info
  private extraCycles = 0;
  private newExtraCyclesValue = false;

  constructor(cartridge: Cartridge) {
    this.cartridge = cartridge;
    this.bytes = new Uint8Array(this.buffer);
    this.init();
  }

  private init() {
    // There is more to this here
    // this.bytes.set(
    //   this.cartridge.getPRGROM(),
    //   this.cartridge.getHeader().mapper == MAPPER.NROM ? 0xc000 : 0x8000
    // );

    const prgRom = this.cartridge.getPRGROM();
    const mapper = this.cartridge.getHeader().mapper;

    if (mapper == MAPPER.NROM) {
      this.bytes.set(prgRom, 0xc000);
      // If it's a 32K NROM, mirror the first 16K at $8000
      if (prgRom.length === 0x8000) {
        this.bytes.set(prgRom.subarray(0, 0x4000), 0x8000);
      }
    } else if (mapper == MAPPER.MMC1) {
      // On power-up, MMC1 maps first 16K bank to $8000
      this.bytes.set(prgRom.subarray(0, 0x4000), 0x8000);

      // AND it maps the *last* 16K bank to $C000
      const lastBank = prgRom.subarray(prgRom.length - 0x4000);
      this.bytes.set(lastBank, 0xc000);
    } else {
      console.warn("unsupporte mapper type");
    }
  }

  public get8(bit16address: number) {
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      return this.get8CPURAM(bit16address);
    }

    if (bit16address == 0x2000) {
      throw new Error("reads are not allowed to PPU_CTRL");
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
      const returnValue = this.ppuReadBuffer;
      this.ppuReadBuffer = this.vRam[this.vRamAddress];
      this.vRamAddress += this.getPPU_CTRL_INCREMENT_MODE();
      return returnValue;
    }

    return this.bytes[bit16address];
  }

  private get8CPURAM(bit16address: number) {
    return this.cpuRam[bit16address & 0x07ff];
  }

  public get8signed(bit16address: number): number {
    let unsignedByte: number;
    
    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      unsignedByte = this.get8CPURAM(bit16address);
    } else {
      unsignedByte = this.bytes[bit16address];
    }

    return (unsignedByte << 24) >> 24;
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
    if (bit16address >= 0x8000 && bit16address <= 0xffff) {
      this.handleMapperWrite(bit16address, value);
      return;
    }

    if (bit16address >= 0x0000 && bit16address < 0x2000) {
      // if (bit16address === 0x0000 && value === 0x93) { // Used for nestest.nes break points
      //   throw new Error('setting error code')
      // }
      return this.set8CPURAM(bit16address, value);
    }

    if (bit16address >= 0x2008 && bit16address < 0x3fff) {
      console.log("writing mirrored PPU range - NOT IMPLEMENTED");
    }

    if (
      (bit16address >= 0x4000 && bit16address <= 0x400f) ||
      bit16address === 0x4015
    ) {
      return this.setAPU(bit16address, value);
    }

    if (bit16address === 0x2003) {
      this.oamAddress = value;
    }

    if (bit16address === 0x2004) {
      console.log("writing to the OAM data reg - NOT IMPLEMENTED");
    }

    if (bit16address === 0x4014) {
      const oamStartAddr = value << 8;
      for (let i = 0; i < 0xff; i++) {
        const data = this.get8(oamStartAddr + i);
        this.oamData[i] = data;
      }
      this.extraCycles = 513;
      this.newExtraCyclesValue = true;
      // const cpuData = this.cpuRam.subarray(value << 8, (value << 8) + 0xff);
      // cpuData.forEach((byte) => {
      //   this.oamData[this.oamAddress++] = byte;
      // });
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

  public getExtraCycles() {
    var value = this.newExtraCyclesValue ? this.extraCycles : 0;
    this.newExtraCyclesValue = false;
    return value;
  }

  private set8CPURAM(bit16address: number, value: number) {
    this.cpuRam[bit16address & 0x7ff] = value;
  }

  private setAPU(bit16address: number, value: number) {
    this.apuRegister[bit16address - 0x4000] = value;
    if (bit16address === 0x400b) {
      this.linearCounterReload = true;
    }
    if (bit16address === 0x400f) {
      this.noiseLengthReload = true;
    }
  }

  public getLinearCounterReload() {
    return this.linearCounterReload;
  }

  public clearLinearCounterReload() {
    this.linearCounterReload = false;
  }

  public getNoiseLengthReload() {
    return this.noiseLengthReload;
  }

  public clearNoiseLengthReload() {
    this.noiseLengthReload = false;
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

  public get8vRam(bit16address: number): number {
    if (bit16address >= 0x2000 && bit16address < 0x3f00) {
      // Nametable mirroring
      const mappedAddress = this.mapNametableAddress(bit16address);
      return this.vRam[mappedAddress];
    }
    return this.vRam[bit16address];
  }

  private mapNametableAddress(address: number): number {
    const mirroring = this.getControlRegister() & 0b11;
    const relativeAddress = address & 0x0fff; // Address within the 4KB nametable space

    if (mirroring === MIRRORING_TYPE.HORIZONTAL) {
      // Horizontal: [A A] / [B B]
      if (relativeAddress >= 0x0000 && relativeAddress < 0x0800) {
        return relativeAddress & 0x03ff; // Maps $2000 and $2400 to first 1KB
      } else {
        return (relativeAddress & 0x03ff) + 0x0400; // Maps $2800 and $2C00 to second 1KB
      }
    } else if (mirroring === MIRRORING_TYPE.VERTICAL) {
      // Vertical: [A B] / [A B]
      return relativeAddress & 0x07ff; // Simple mirroring of the two 1KB banks
      // } else if (mirroring === MIRRORING_TYPE.SINGLE_SCREEN_LOWER) {
      //   // Single-Screen A: All point to the first 1KB
      //   return relativeAddress & 0x03FF;
    } else {
      // SINGLE_SCREEN_UPPER
      // Single-Screen B: All point to the second 1KB
      return (relativeAddress & 0x03ff) + 0x0400;
    }
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

  public getPPU_CTRL() {
    return this.bytes[0x2000];
  }

  public getPPU_CTRL_INCREMENT_MODE() {
    return this.getPPU_CTRL() & 0b0000_0100
      ? PPU_INCREMENT_MODE.VERTICAL
      : PPU_INCREMENT_MODE.HORIZONTAL;
  }

  public getPPU_MASK() {
    return this.bytes[0x2001];
  }

  public getPPU_STATUS() {
    return this.bytes[0x2002];
  }

  public setPPU_STATUS(value: number) {
    this.bytes[0x2002] = value;
  }

  public getControlRegister(): number {
    return this.controlRegister;
  }

  public getPulse1Vol() {
    return this.apuRegister[0x0];
  }

  public getPulse1Sweep() {
    return this.apuRegister[0x1];
  }

  public getPulse1Low() {
    return this.apuRegister[0x2];
  }

  public getPulse1High() {
    return this.apuRegister[0x3];
  }

  public getPulse2Vol() {
    return this.apuRegister[0x4];
  }

  public getPulse2Sweep() {
    return this.apuRegister[0x5];
  }

  public getPulse2Low() {
    return this.apuRegister[0x6];
  }

  public getPulse2High() {
    return this.apuRegister[0x7];
  }

  public getTriangleLinear() {
    return this.apuRegister[0x8];
  }

  public getTriangleLow() {
    return this.apuRegister[0xa];
  }

  public getTriangleHigh() {
    return this.apuRegister[0xb];
  }

  public getNoiseVol() {
    return this.apuRegister[0xc];
  }

  public getNoisePeriod() {
    return this.apuRegister[0xe];
  }

  public getNoiseLength() {
    return this.apuRegister[0xf];
  }

  public getAPUStatus() {
    return this.apuRegister[0x15];
  }

  public getNMI() {
    return !!(
      this.getPPU_CTRL() & 0b1000_0000 && this.getPPU_STATUS() & 0b1000_0000
    );
  }

  // TESTING
  public setvRam(bit16address: number, value: number) {
    if (bit16address >= 0x2000 && bit16address < 0x3f00) {
      // Nametable mirroring
      const mappedAddress = this.mapNametableAddress(bit16address);
      this.vRam[mappedAddress] = value;
    } else {
      this.vRam[bit16address] = value;
    }
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

  private handleMapperWrite(address: number, value: number) {
    if (value & 0x80) {
      // Bit 7 is set, reset the shift register
      this.shiftRegister = 0x10;
      this.controlRegister = this.controlRegister | 0x0c;
      return;
    }

    // Checks if this is the fifth write (bit 0 is 1) and shift everything right and value of the write into bit 4
    const fifthWrite = this.shiftRegister & 1;
    this.shiftRegister >>= 1;
    this.shiftRegister |= (value & 1) << 4;

    if (fifthWrite) {
      const targetRegister = (address >> 13) & 0b11; // 0, 1, 2, or 3 for registers
      switch (targetRegister) {
        case 0: // Control ($8000-$9FFF)
          // console.log("updating control register", this.shiftRegister);
          this.controlRegister = this.shiftRegister;
          // Update mirroring in PPU here
          break;
        case 1: // CHR bank 0 ($A000-$BFFF)
          // console.log("updating chr bank 0 register", this.shiftRegister);
          this.chrBank0Register = this.shiftRegister;
          break;
        case 2: // CHR bank 1 ($C000-$DFFF)
          // console.log("updating chr bank 1 register", this.shiftRegister);
          this.chrBank1Register = this.shiftRegister;
          break;
        case 3: // PRG bank ($E000-$FFFF)
          // console.log("updating prg bank register", this.shiftRegister);
          this.prgBankRegister = this.shiftRegister;
          break;
      }
      this.shiftRegister = 0x10; // Reset after 5th write
    }
  }

  public getChrBank0Register(): number {
    return this.chrBank0Register;
  }

  public getChrBank1Register(): number {
    return this.chrBank1Register;
  }
}

export default RAM;
