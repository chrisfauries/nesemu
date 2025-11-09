import fs from "fs";
import path from "path";
import Header from "./header";

class Cartridge {
  private gameBuffer: Buffer;
  private header: Header;
  private PRGROM: Buffer;
  private CHRROM: Buffer;

  constructor(file: string | Buffer) {
    if(typeof file === 'string') {
      this.gameBuffer = fs.readFileSync(path.join(__dirname, "../games/" + file));
    } else {
      this.gameBuffer = file
    }
    this.header = this.setHeader();
    this.PRGROM = this.setPRGROM();
    this.CHRROM = this.setCHRROM();
  }


  getHeader() {
    return this.header;
  }

  getPRGROM() {
    return this.PRGROM;
  }

  getCHRROM() {
    return this.CHRROM;
  }

  setHeader() {
    return new Header(this.gameBuffer.subarray(0, 16));
  }

  setPRGROM() {
    return this.gameBuffer.subarray(16, 16 + this.header.PRGROMsize);
  }

  setCHRROM() {
    return this.gameBuffer.subarray(
      16 + this.header.PRGROMsize,
      16 + this.header.PRGROMsize + this.header.CHRROMsize
    );
  }
}

export default Cartridge;
