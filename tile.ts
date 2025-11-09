export enum SpriteOrientation {
  Normal,
  Flipped_Horizontally,
  Flipped_Vertically,
  Flipped_Diagonally,
}

class Tile {
  private raw: Uint8Array;
  public tile: Array<Array<number>> = new Array(8);
  constructor(raw: Uint8Array) {
    this.raw = raw;
    this.parse();
  }

  parse() {
    for(let y = 0; y < 8; y++) {
      const row = new Array<number>(8);

      const leftByte = this.raw[y];
      const rightByte = this.raw[y + 8];

      for (let x = 0; x < 8; x++) {
        const bitPosition = 1 << (7 - x);
        const low = (leftByte & bitPosition) ? 1 : 0;
        const high = (rightByte & bitPosition) ? 2 : 0;
        row[x] = high | low;
      }

      this.tile[y] = row;
    }
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
