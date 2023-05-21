class BufferUtils {
  constructor() {}

  getAsASCII(buffer: Buffer, startOffset: number, endOffset: number) {
    let str = "";
    for (let i = startOffset; i < endOffset; i++) {
      str += String.fromCharCode(buffer[i]);
    }

    return str;
  }

  /** flags are represented in the array in the order of LSB to MSB 76543210 */
  getAsFlags(buffer: Buffer, offset: number) {
    const byte = buffer[offset];
    const flags: boolean[] = [];

    for (let i = 0; i < 8; i++) {
      flags[i] = (byte & (0b00000001 << i)) > 0;
    }

    return flags;
  }

  getUpperNibble(buffer: Buffer, offset: number) {
    return (buffer[offset] & 0b11110000) >> 4;
  }

  getLowerNibble(buffer: Buffer, offset: number) {
    return buffer[offset] & 0b00001111;
  }
}

export default new BufferUtils();
