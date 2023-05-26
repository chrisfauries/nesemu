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

export const BASE_NAMETABLE_ADDRESS = {
  0: 0x2000,
  1: 0x2400,
  2: 0x2800,
  3: 0x2c00,
} as const;

export enum CHRROM_SIDE {
  LEFT,
  RIGHT,
}

export enum CPU_INSTRUCTION {
  // Increment Instructions - INX, INY, INC

  /** Increment X - Implied (1 byte / 2 cycles) */
  INX = 0xe8,
  /** Increment Y - Implied (1 byte / 2 cycles) */
  INY = 0xc8,
  /** Increment Memory - Zero Page (2 bytes / 5 cycles) */
  INC_Z = 0xe6,
  /** Increment Memory - Zero Page X (2 bytes / 6 cycles) */
  INC_ZX = 0xf6,
  /** Increment Memory - Absolute (3 byte / 6 cycles) */
  INC_A = 0xee,
  /** Increment Memory - Absolute X (3 byte / 7 cycles) */
  INC_AX = 0xfe,

  // Decrement Instructions - DEX, DEY, DEC

  /** Decrement X - Implied (1 byte / 2 cycles) */
  DEX = 0xca,
  /** Decrement Y - Implied (1 byte / 2 cycles) */
  DEY = 0x88,
  /** Decrement Memory - Zero Page (2 bytes / 5 cycles) */
  DEC_Z = 0xc6,
  /** Decrement Memory - Zero Page X (2 bytes / 6 cycles) */
  DEC_ZX = 0xd6,
  /** Decrement Memory - Absolute (3 bytes / 6 cycles) */
  DEC_A = 0xce,
  /** Decrement Memory - Absolute X (3 bytes / 7 cycles) */
  DEC_AX = 0xde,

  // Status Flag Instructions - SEC, SED, SEI, CLC, CLD, CLI, CLV

  /**  Set Carry Flag - CPI Process Status (1 byte / 2 cycles) */
  SEC = 0x38,
  /**  Set Decimal Flag - CPI Process Status (1 byte / 2 cycles) */
  SED = 0xf8,
  /**  Set Interupt Flag - CPI Process Status (1 byte / 2 cycles) */
  SEI = 0x78,
  /**  Clear Carry Flag - CPI Process Status (1 byte / 2 cycles) */
  CLC = 0x18,
  /** Clear Decimal - CPU Process Status (1 byte / 2 cycles) */
  CLD = 0xd8,
  /**  Clear Interupt Flag - CPI Process Status (1 byte / 2 cycles) */
  CLI = 0x58,
  /** Clear Overflow - CPU Process Status (1 byte / 2 cycles) */
  CLV = 0xb8,

  // Logical Instructions - AND, EOR, ORA

  /** Logical AND - Immediate (2 bytes / 2 cycles) */
  AND_I = 0x29,
  /** Logical AND - Zero Page (2 bytes / 3 cycles) */
  AND_Z = 0x25,
  /** Logical AND - Zero Page X (2 bytes / 4 cycles) */
  AND_ZX = 0x35,
  /** Logical AND - Absolute (3 bytes / 4 cycles) */
  AND_A = 0x2d,
  /** Logical AND - Absolute X (3 bytes / 4-5 cycles) */
  AND_AX = 0x3d,
  /** Logical AND - Absolute X (3 bytes / 4-5 cycles) */
  AND_AY = 0x39,
  /** Logical AND - Indirect X (2 bytes / 6 cycles) */
  AND_IX = 0x21,
  /** Logical AND - Indirect Y (2 bytes / 5-6 cycles) */
  AND_IY = 0x31,
  /** Logical Exclusive OR - Immediate (2 bytes / 2 cycles) */
  EOR_I = 0x49,
  /** Logical Exclusive OR - Zero Page (2 bytes / 3 cycles) */
  EOR_Z = 0x45,
  /** Logical Exclusive OR - Zero Page X (2 bytes / 4 cycles) */
  EOR_ZX = 0x55,
  /** Logical Exclusive OR - Absolute (3 bytes / 4 cycles) */
  EOR_A = 0x4d,
  /** Logical Exclusive OR - Absolute X (3 bytes / 4-5 cycles) */
  EOR_AX = 0x5d,
  /** Logical Exclusive OR - Absolute X (3 bytes / 4-5 cycles) */
  EOR_AY = 0x59,
  /** Logical Exclusive OR - Indirect X (2 bytes / 6 cycles) */
  EOR_IX = 0x41,
  /** Logical Exclusive OR - Indirect Y (2 bytes / 5-6 cycles) */
  EOR_IY = 0x51,
  /** Logical Inclusive OR - Immediate (2 bytes / 2 cycles) */
  ORA_I = 0x09,
  /** Logical Inclusive OR - Zero Page (2 bytes / 3 cycles) */
  ORA_Z = 0x05,
  /** Logical Inclusive OR - Zero Page X (2 bytes / 4 cycles) */
  ORA_ZX = 0x15,
  /** Logical Inclusive OR - Absolute (3 bytes / 4 cycles) */
  ORA_A = 0x0d,
  /** Logical Inclusive OR - Absolute X (3 bytes / 4-5 cycles) */
  ORA_AX = 0x1d,
  /** Logical Inclusive OR - Absolute X (3 bytes / 4-5 cycles) */
  ORA_AY = 0x19,
  /** Logical Inclusive OR - Indirect X (2 bytes / 6 cycles) */
  ORA_IX = 0x01,
  /** Logical Inclusive OR - Indirect Y (2 bytes / 5-6 cycles) */
  ORA_IY = 0x11,

  // Load Register Instructions - LDA, LDX, LDY

  /** Load Accumulator - Immediate (2 bytes / 2 cycles) */
  LDA_I = 0xa9,
  /** Load Accumulator - Zero Page (2 bytes / 3 cycles) */
  LDA_Z = 0xa5,
  /** Load Accumulator - Zero Page X (2 bytes / 3 cycles) */
  LDA_ZX = 0xb5,
  /** Load Accumulator - Absolute (3 bytes / 4 cycles) */
  LDA_A = 0xad,
  /** Load Accumulator - Absolute X (3 bytes / 4-5 cycles) */
  LDA_AX = 0xbd,
  /** Load Accumulator - Absolute Y (3 bytes / 4-5 cycles) */
  LDA_AY = 0xb9,
  /** Load Accumulator - Indirect X (2 bytes / 6 cycles) */
  LDA_IX = 0xa1,
  /** Load Accumulator - Indirect Y (2 bytes / 5-6 cycles) */
  LDA_IY = 0xb1,
  /** Load X Register - Immediate (2 bytes / 2 cycles) */
  LDX_I = 0xa2,
  /** Load X Register - Zero Page (2 bytes / 3 cycles) */
  LDX_Z = 0xa6,
  /** Load X Register - Zero Page Y (2 bytes / 4 cycles) */
  LDX_ZY = 0xb6,
  /** Load X Register - Absolute (2 bytes / 2 cycles) */
  LDX_A = 0xae,
  /** Load X Register - Absolute Y (3 bytes / 4 cycles) */
  LDX_AY = 0xbe,
  /** LDY - Load Y Register - Immediate (2 bytes / 2 cycles) */
  LDY_I = 0xa0,
  /** LDY - Load Y Register - Zero Page (2 bytes / 3 cycles) */
  LDY_Z = 0xa4,
  /** LDY - Load Y Register - Zero Page X (2 bytes / 4 cycles) */
  LDY_ZX = 0xb4,
  /** LDY - Load Y Register - Absolute (3 bytes / 4 cycles) */
  LDY_A = 0xac,
  /** LDY - Load Y Register - Absolute X (3 bytes / 4-5 cycles) */
  LDY_AX = 0xbc,

  // Store Register Instructions

  /** Store Accumulator - Zero Page (2 bytes / 3 cycles) */
  STA_Z = 0x85,
  /** Store Accumulator - Zero Page X (2 bytes / 4 cycles) */
  STA_ZX = 0x95,
  /** Store Accumulator - Absolute (3 bytes / 4 cycles) */
  STA_A = 0x8d,
  /** Store Accumulator - Absolute X (3 bytes / 5 cycles) */
  STA_AX = 0x9d,
  /** Store Accumulator - Absolute Y (3 bytes / 5 cycles) */
  STA_AY = 0x99,
  /** Store Accumulator - Indirect X (2 bytes / 6 cycles) */
  STA_IX = 0x81,
  /** Store Accumulator - Indirect Y (2 bytes / 6 cycles) */
  STA_IY = 0x91,
  /** Store X Register - Zero Page (2 bytes / 3 cycles) */
  STX_Z = 0x86,
  /** Store X Register - Zero Page Y (2 bytes / 4 cycles) */
  STX_ZY = 0x96,
  /** Store X Register - Absolute (3 bytes / 4 cycles) */
  STX_A = 0x8e,
  /** Store Y Register - Absolute (2 bytes / 3 cycles) */
  STY_Z = 0x84,
  /** Store Y Register - Absolute (2 bytes / 4 cycles) */
  STY_ZX = 0x94,
  /** Store Y Register - Absolute (3 bytes / 4 cycles) */
  STY_A = 0x8c,

  // Transfer Register Instructions

  /** Transfer Accumulator to X - Implied (1 byte / 2 cycles) */
  TAX = 0xaa,
  /** Transfer Accumulator to Y - Implied (1 byte / 2 cycles) */
  TAY = 0xa8,
  /** Transfer Stack Pointer to X - Implied (1 byte / 2 cycles) */
  TSX = 0xba,
  /** Transfer X to Accumulator - Implied (1 byte / 2 cycles) */
  TXA = 0x8a,
  /** Transfer X to Stack Pointer - Implied (1 byte / 2 cycles) */
  TXS = 0x9a,
  /** Transfer Y to Accumulator - Implied (1 byte / 2 cycles) */
  TYA = 0x98,

  // Arithmetic Instructions

  /** Add With Carry - Immediate (2 bytes / 2 cycles) */
  ADC_I = 0x69,
  /** Add With Carry - Zero Page (2 bytes / 3 cycles) */
  ADC_Z = 0x65,
  /** Add With Carry - Zero Page X (2 bytes / 4 cycles) */
  ADC_ZX = 0x75,
  /** Add With Carry - Absolute (3 bytes / 4 cycles) */
  ADC_A = 0x6d,
  /** Add With Carry - Absolute X (3 bytes / 4-5 cycles) */
  ADC_AX = 0x7d,
  /** Add With Carry - Absolute Y (3 bytes / 4-5 cycles) */
  ADC_AY = 0x79,
  /** Add With Carry - Indirect X (2 bytes / 6 cycles) */
  ADC_IX = 0x61,
  /** Add With Carry - Indirect Y (2 bytes / 5-6 cycles) */
  ADC_IY = 0x71,
  /** Subtract With Carry - Immediate (2 bytes / 2 cycles) */
  SBC_I = 0xe9,
  /** Subtract With Carry - Zero Page (2 bytes / 3 cycles) */
  SBC_Z = 0xe5,
  /** Subtract With Carry - Zero Page X (2 bytes / 4 cycles) */
  SBC_ZX = 0xf5,
  /** Subtract With Carry - Absolute (3 bytes / 4 cycles) */
  SBC_A = 0xed,
  /** Subtract With Carry - Absolute X (3 bytes / 4-5 cycles) */
  SBC_AX = 0xfd,
  /** Subtract With Carry - Absolute Y (3 bytes / 4-5 cycles) */
  SBC_AY = 0xf9,
  /** Subtract With Carry - Indirect X (2 bytes / 6 cycles) */
  SBC_IX = 0xe1,
  /** Subtract With Carry - Indirect Y (2 bytes / 5-6 cycles) */
  SBC_IY = 0xf1,

  // Comparison Instructions

  /** Compare - Immediate (2 bytes / 2 cycles) */
  CMP_I = 0xc9,
  /** Compare - Zero Page (2 bytes / 3 cycles) */
  CMP_Z = 0xc5,
  /** Compare - Zero Page X (2 bytes / 4 cycles) */
  CMP_ZX = 0xd5,
  /** Compare - Absolute (3 bytes / 4 cycles) */
  CMP_A = 0xcd,
  /** Compare - Absolute X (3 bytes / 5 cycles) */
  CMP_AX = 0xdd,
  /** Compare - Absolute Y (3 bytes / 5 cycles) */
  CMP_AY = 0xd9,
  /** Compare - Indirect X (2 bytes / 6 cycles) */
  CMP_IX = 0xc1,
  /** Compare - Indirect Y (2 bytes / 6 cycles) */
  CMP_IY = 0xd1,
  /** Compare X - Immediate (2 bytes / 2 cycles) */
  CPX_I = 0xe0,
  /** Compare X - Zero Page (2 bytes / 3 cycles) */
  CPX_Z = 0xe4,
  /** Compare X - Absolute (3 bytes / 4 cycles) */
  CPX_A = 0xec,
  /** Compare Y - Immediate (2 bytes / 2 cycles) */
  CPY_I = 0xc0,
  /** Compare Y - Zero Page (2 bytes / 3 cycles) */
  CPY_Z = 0xc4,
  /** Compare Y - Absolute (3 bytes / 4 cycles) */
  CPY_A = 0xcc,

  // Stack Register Instructions

  /** Push Accumulator (1 byte / 3 cycles) */
  PHA = 0x48,
  /** Push Status Register (1 byte / 3 cycles) */
  PHP = 0x08,
  /** Pull Accumulator (1 byte / 4 cycles) */
  PLA = 0x68,
  /** Pull Status Register (1 byte / 4 cycles) */
  PLP = 0x28,

  // Branch Register Instructions

  /** Branch if Carry Clear  (2 bytes / 2-4 cycles) */
  BCC = 0x90,
  /** Branch if Carry Set (2 bytes / 2-4 cycles) */
  BCS = 0xb0,
  /** Branch if Equal (2 bytes / 2-4 cycles) */
  BEQ = 0xf0,
  /** Branch if Not Equal (2 bytes / 2-4 cycles) */
  BNE = 0xd0,
  /** Branch if Minus (2 bytes / 2-4 cycles) */
  BMI = 0x30,
  /** Branch if Positive (2 bytes / 2-4 cycles) */
  BPL = 0x10,
  /** Branch if Overflow Clear (2 bytes / 2-4 cycles) */
  BVC = 0x50,
  /** Branch if Positive (2 bytes / 2-4 cycles) */
  BVS = 0x70,

  // Shift & Rotate Instructions

  // Jump Instructions

  // Interrupt Instructions

  // Other Instructions

  /** Logical Shift Right - Accumulator (1 byte / 2 cycles) */
  LSR_A = 0x4a,
  /** Jump to Subroutine - (3 bytes / 6 cycles) */
  JSR = 0x20,
  /** Jump - Absolute (3 bytes / 3 cycles) */
  JMP_A = 0x4c,
  /** Jump - Absolute (3 bytes / 5 cycles) */
  JMP_I = 0x6c,
  /** Return from Subroutine - (1 byte / 6 cycles) */
  RTS = 0x60,
  /** Bit Test - (3 bytes / 4 cycles) */
  BIT = 0x2c,
  /** Arithmetic Shift Left - Accumulator (1 byte / 2 cycles) */
  ASL_A = 0x0a,
  /** Rotate left - Zero Page (2 byte / 5 cycles) */
  ROL_Z = 0x26,
  /** Rotate left - Accumulator (1 byte / 2 cycles) */
  ROL_A = 0x2a,
  /** Rotate right - Absolute X (3 byte / 7 cycles) */
  ROR_AX = 0x7e,
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
  // Increment Instructions:
  INX: 2,
  INY: 2,
  INC_Z: 5,
  INC_ZX: 6,
  INC_A: 6,
  INC_AX: 7,
  // Decrement Instructions:
  DEX: 2,
  DEY: 2,
  DEC_Z: 5,
  DEC_ZX: 6,
  DEC_A: 6,
  DEC_AX: 7,
  // Status Flag Instructions:
  SEC: 2,
  SED: 2,
  SEI: 2,
  CLC: 2,
  CLD: 2,
  CLI: 2,
  CLV: 2,
  // Logical Instructions
  AND_I: 2,
  AND_Z: 3,
  AND_ZX: 4,
  AND_A: 4,
  AND_AX: 5,
  AND_AY: 5,
  AND_IX: 6,
  AND_IY: 6,
  EOR_I: 2,
  EOR_Z: 3,
  EOR_ZX: 4,
  EOR_A: 4,
  EOR_AX: 5,
  EOR_AY: 5,
  EOR_IX: 6,
  EOR_IY: 6,
  ORA_I: 2,
  ORA_Z: 3,
  ORA_ZX: 4,
  ORA_A: 4,
  ORA_AX: 5,
  ORA_AY: 5,
  ORA_IX: 6,
  ORA_IY: 6,
  // Load Register Instructions
  LDA_I: 2,
  LDA_Z: 3,
  LDA_ZX: 4,
  LDA_A: 4,
  LDA_AX: 5,
  LDA_AY: 5,
  LDA_IX: 6,
  LDA_IY: 6,
  LDX_I: 2,
  LDX_Z: 3,
  LDX_ZY: 4,
  LDX_A: 4,
  LDX_AY: 4,
  LDY_I: 2,
  LDY_Z: 3,
  LDY_ZX: 4,
  LDY_A: 4,
  LDY_AX: 5,
  // Store Register Instructions
  STA_Z: 3,
  STA_ZX: 4,
  STA_A: 4,
  STA_AX: 5,
  STA_AY: 5,
  STA_IX: 6,
  STA_IY: 6,
  STX_Z: 3,
  STX_ZY: 4,
  STX_A: 4,
  STY_Z: 3,
  STY_ZX: 4,
  STY_A: 4,
  // Transfer Register Instructions
  TAX: 2,
  TAY: 2,
  TSX: 2,
  TXA: 2,
  TXS: 2,
  TYA: 2,
  // Arithmetic Register Instructions
  ADC_I: 2,
  ADC_Z: 3,
  ADC_ZX: 4,
  ADC_A: 4,
  ADC_AX: 5,
  ADC_AY: 5,
  ADC_IX: 6,
  ADC_IY: 6,
  SBC_I: 2,
  SBC_Z: 3,
  SBC_ZX: 4,
  SBC_A: 4,
  SBC_AX: 5,
  SBC_AY: 5,
  SBC_IX: 6,
  SBC_IY: 6,
  // Comparison Instructions
  CMP_I: 2,
  CMP_Z: 2,
  CMP_ZX: 2,
  CMP_A: 3,
  CMP_AX: 3,
  CMP_AY: 3,
  CMP_IX: 2,
  CMP_IY: 2,
  CPX_I: 2,
  CPX_Z: 3,
  CPX_A: 4,
  CPY_I: 2,
  CPY_Z: 3,
  CPY_A: 4,
  // Stack Register Instructions
  PHA: 3,
  PHP: 4,
  PLA: 3,
  PLP: 4,
  // Branch Instructions
  BCC: 4,
  BCS: 4,
  BEQ: 4,
  BNE: 4,
  BMI: 4,
  BPL: 4,
  BVC: 4,
  BVS: 4,

  LSR_A: 2,
  JSR: 6,
  JMP_A: 3,
  JMP_I: 5,
  RTS: 6,
  BIT: 4,
  NOP: 2,
  ROL_A: 2,
  ROL_Z: 5,
  ROR_AX: 7,
  ASL_A: 2,
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
