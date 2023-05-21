export enum MIRRORING_TYPE {
  HORIZONTAL,
  VERTICAL,
}

export enum CARTRIDGE_TYPE {
  iNES,
  NES2_0,
}

export enum MAPPER {
  NROM = 0x00,
  MMC1 = 0x01,
}

export enum CPU_INSTRUCTION {
  /**  Set Interupt Flag - CPI Process Status (1 byte / 2 cycles) */
  SEI = 0x78,
  /**  Set Carry Flag - CPI Process Status (1 byte / 2 cycles) */
  SEC = 0x38,
  /** Clear Decimal - CPU Process Status (1 byte / 2 cycles) */
  CLD = 0xd8,
  /** Logical Shift Right - Accumulator (1 byte / 2 cycles) */
  LSR_A = 0x4a,
  /** Load Accumulator - Immediate (2 bytes / 2 cycles) */
  LDA_I = 0xa9,
  /** Load Accumulator - Zero Page (2 bytes / 3 cycles) */
  LDA_Z = 0xa5,
  /** Load Accumulator - Absolute (3 bytes / 4 cycles) */
  LDA_A = 0xad,
  /** Load Accumulator - Absolute X (3 bytes / 4-5 cycles) */
  LDA_AX = 0xbd,
  /** Load Accumulator - Indirect Y (2 bytes / 6 cycles) */
  LDA_IY = 0xb1,
  /** Store Accumulator - Absolute (3 bytes / 4 cycles) */
  STA_A = 0x8d,
  /** Store Accumulator - Absolute X (3 bytes / 5 cycles) */
  STA_AX = 0x9d,
  /** Store Accumulator - Absolute Y (3 bytes / 5 cycles) */
  STA_AY = 0x99,
  /** Store Accumulator - Indirect Y (2 bytes / 6 cycles) */
  STA_IY = 0x91,
  /** Store Accumulator - Zero Page (2 bytes / 3 cycles) */
  STA_Z = 0x85,
  /** Load X Register - Immediate (2 bytes / 2 cycles) */
  LDX_I = 0xa2,
  /** Load X Register - Absolute (2 bytes / 2 cycles) */
  LDX_A = 0xae,
  /** Load X Register - Absolute Y (3 bytes / 4 cycles) */
  LDX_AY = 0xbe,
  /** Transfer X to Stack Pointer - Implied (1 byte / 2 cycles) */
  TXS_I = 0x9a,
  /** Transfer X to Accumulator - Implied (1 byte / 2 cycles) */
  TXA_I = 0x8a,
  /** Transfer Accumulator to X - Implied (1 byte / 2 cycles) */
  TAX_I = 0xaa,
  /** BPL - Branch if Positive - Relative (2 bytes / 2-3 cycles) */
  BPL_R = 0x10,
  /** LDY - Load Y Register - Immediate (2 bytes / 2 cycles) */
  LDY_I = 0xa0,
  /** LDY - Load Y Register - Absolute (3 bytes / 4 cycles) */
  LDY_A = 0xac,
  /** Compare - Immediate (2 bytes / 2 cycles) */
  CMP_I = 0xc9,
  /** Branch If Carry Set - Relative (2 byte / 2-4 cycles) */
  BCS = 0xb0,
  /** Increment Memory - Zero Page (2 bytes / 5 cycles) */
  INC_Z = 0xe6,
  /** Increment Memory - Zero Page X (2 bytes / 6 cycles) */
  INC_ZX = 0xf6,
  /** Increment Memory - Absolute (3 byte / 6 cycles) */
  INC_A = 0xee,
  /** Increment Memory - Absolute X (3 byte / 7 cycles) */
  INC_AX = 0xfe,
  /** Increment X - Implied (1 byte / 2 cycles) */
  INX = 0xe8,
  /** Decrement X - Implied (1 byte / 2 cycles) */
  DEX = 0xca,
  /** Increment Y - Implied (1 byte / 2 cycles) */
  INY = 0xc8,
  /** Decrement Y - Implied (1 byte / 2 cycles) */
  DEY = 0x88,
  /** Branch if Equal - (2 bytes / 2-4 cycles) */
  BEQ = 0xf0,
  /** Branch if Not Equal - (2 bytes / 2-4 cycles) */
  BNE = 0xd0,
  /** Jump to Subroutine - (3 bytes / 6 cycles) */
  JSR = 0x20,
  /** Jump - Absolute (3 bytes / 3 cycles) */
  JMP_A = 0x4c,
  /** Return from Subroutine - (1 byte / 6 cycles) */
  RTS = 0x60,
  /** Store X Register - Zero Page (2 bytes / 3 cycles) */
  STX_Z = 0x86,
  /** Store X Register - Absolute (3 bytes / 4 cycles) */
  STX_A = 0x8e,
  /** Store Y Register - Absolute (3 bytes / 4 cycles) */
  STY_A = 0x8c,
  /** Compare X Register - Immediate (2 bytes / 2 cycles) */
  CPX_I = 0xe0,
  /** Compare Y Register - Immediate (2 bytes / 2 cycles) */
  CPY_I = 0xc0,
  /** Bit Test - (3 bytes / 4 cycles) */
  BIT = 0x2c,
  /** Logical Inclusive OR - Immediate (2 bytes / 2 cycles) */
  ORA_I = 0x09,
  /** Logical Inclusive OR - Zero Page (2 bytes / 3 cycles) */
  ORA_Z = 0x05,
  /** Logical AND - Immediate (2 bytes / 2 cycles) */
  AND_I = 0x29,
  /** Logical AND - Zero Page (2 bytes / 3 cycles) */
  AND_Z = 0x25,
  /** Logical AND - Absolute X (3 bytes / 4 cycles) */
  AND_AX = 0x3d,
  /** Push Accumulator - (1 byte / 3 cycles) */
  PHA = 0x48,
  /** Pull Accumulator - (1 byte / 4 cycles) */
  PLA = 0x68,
  /** Subtract with Carry - Absolute Y (1 byte / 2 cycles) */
  SBC = 0xf9,
  /** Rotate left - Zero Page (2 byte / 5 cycles) */
  ROL_Z = 0x26,
  /** Rotate left - Accumulator (1 byte / 2 cycles) */
  ROL_A = 0x2a,
  /** Exclusive OR - Zero Page (2 byte / 3 cycles) */
  EOR_Z = 0x45,
  /** No Operation - (1 byte / 2 cycles) */
  NOP = 0xea,
  /** Non-maskable Interrupt - (1 byte / 6? cycles) */
  NMI = 0xfffa,
  /** Return from Interrupt - (1 byte / 6? cycles) */
  RTI = 0x40,
}

export const CPU_INSTRUCTION_CYCLES: {
  [key in keyof typeof CPU_INSTRUCTION]: number;
} = {
  SEI: 2,
  SEC: 2,
  CLD: 2,
  LSR_A: 2,
  LDA_I: 2,
  LDA_A: 4,
  LDA_Z: 3,
  LDA_AX: 5,
  LDA_IY: 6,
  STA_A: 4,
  STA_AX: 5,
  STA_AY: 5,
  STA_IY: 6,
  LDX_I: 2,
  LDX_A: 4,
  LDX_AY: 4,
  TXS_I: 2,
  TXA_I: 2,
  TAX_I: 2,
  BPL_R: 3,
  LDY_I: 2,
  LDY_A: 4,
  CMP_I: 2,
  BCS: 4,
  INC_Z: 5,
  INC_ZX: 6,
  INC_A: 6,
  INC_AX: 7,
  INX: 2,
  DEX: 2,
  DEY: 2,
  BEQ: 4,
  BNE: 4,
  JSR: 6,
  JMP_A: 3,
  RTS: 6,
  STA_Z: 3,
  STX_Z: 3,
  STX_A: 4,
  STY_A: 4,
  CPX_I: 2,
  CPY_I: 2,
  INY: 2,
  BIT: 4,
  NOP: 2,
  ORA_I: 2,
  ORA_Z: 3,
  AND_I: 2,
  AND_Z: 3,
  AND_AX: 4,
  PHA: 3,
  PLA: 3,
  ROL_A: 2,
  ROL_Z: 5,
  SBC: 5,
  EOR_Z: 3,
  NMI: 6,
  RTI: 6,
} as const;

export enum STATUS_FLAGS {
  CARRY,
  ZERO,
  INTERUPT_DISABLE,
  DECIMAL,
  NO_EFFECT_1,
  NO_EFFECT_2,
  OVERFLOW,
  NEGATIVE,
}
