export enum SpriteOrientation {
  Normal,
  Flipped_Horizontally,
  Flipped_Vertically,
  Flipped_Diagonally,
}

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

  getPixel(y: number, x: number, orientation: SpriteOrientation) {
    switch (orientation) {
      case SpriteOrientation.Normal:
        return this.tile[y][x];
      case SpriteOrientation.Flipped_Horizontally:
        return this.tile[y][7 - x];
      case SpriteOrientation.Flipped_Vertically:
        return this.tile[7 - y][x];
      case SpriteOrientation.Flipped_Diagonally:
        return this.tile[7 - y][7 - x];
    }
  }
}

export default Tile;
