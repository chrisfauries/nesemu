class Tile {
    private raw: Uint8Array;
    public tile: Array<Array<number>> = new Array(8)
      .fill(null)
      .map(() => new Array(8).fill(0));
    constructor(raw: Uint8Array) {
      this.raw = raw;
      this.parse();
    }
  
    parse() {
      const left = this.raw.subarray(0, 8);
      left.forEach((byte, index) => {
        const row = this.tile[index];
  
        for (let j = 0; j < row.length; j++) {
          row[j] += !!(byte & (1 << (7 - j))) ? 1 : 0;
        }
      });
  
      const right = this.raw.subarray(8, 16);
      right.forEach((byte, index) => {
        const row = this.tile[index];
  
        for (let j = 0; j < row.length; j++) {
          row[j] += !!(byte & (1 << (7 - j))) ? 2 : 0;
        }
      });
    }
  }

  export default Tile;