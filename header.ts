import bufferUtils from "./buffer-utils";
import { MIRRORING_TYPE, CARTRIDGE_TYPE, MAPPER } from "./enums";

// TODO: this only supports iNES right now
class Header {
  private buffer: Buffer;
  private HEX_TO_TYPE_MAP: { [hex: number]: CARTRIDGE_TYPE } = {
    0x1a: CARTRIDGE_TYPE.iNES,
    0x0c: CARTRIDGE_TYPE.NES2_0,
  };

  public name!: string;
  public type!: CARTRIDGE_TYPE;
  public isINES!: boolean;
  public isNES20!: boolean;
  public PRGROMsize!: number;
  public CHRROMsize!: number;
  public mirroringType!: MIRRORING_TYPE;
  public hasPRGRAM!: boolean;
  public hasTrainer!: boolean;
  public ignoreMirroringControl!: boolean;
  public mapper!: MAPPER;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.parse();
  }

  parse() {
    this.name = this.setName();
    this.type = this.setType();
    this.PRGROMsize = this.setPRGROMsize();
    this.CHRROMsize = this.setCHRROMsize();
    this.setFlags6();
    // this.setFlags7();  TODO: add this
    this.mapper = this.setMapper();
  }

  private setName() {
    return bufferUtils.getAsASCII(this.buffer, 0, 3);
  }

  private setType() {
    return this.HEX_TO_TYPE_MAP[this.buffer[3]];
  }

  private setPRGROMsize() {
    return this.buffer[4] * 16 * 1024;
  }

  private setCHRROMsize() {
    return this.buffer[5] * 8 * 1024;
  }

  private setFlags6() {
    const flags6 = bufferUtils.getAsFlags(this.buffer, 6);
    this.mirroringType = flags6[0]
      ? MIRRORING_TYPE.VERTICAL
      : MIRRORING_TYPE.HORIZONTAL;
    this.hasPRGRAM = flags6[1];
    this.hasTrainer = flags6[2];
    this.ignoreMirroringControl = flags6[3];
  }

  private setMapper() {
    return (bufferUtils.getLowerNibble(this.buffer, 6) +
      (bufferUtils.getUpperNibble(this.buffer, 7) << 4)) as MAPPER;
  }
}

export default Header;
