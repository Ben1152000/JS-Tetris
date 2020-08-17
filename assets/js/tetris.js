
class Tile {

  constructor() {
    this.state = 0;
  }
  
  log() { return "" + this.state; }

  isEmpty() { return this.state === 0; }

  isInactive() { return this.state === 1; }

  deactivate() { this.state = 1; }
  
  isActive() { return this.state === 2; }

  activate() { this.state = 2; }

}

const PIECES = [
  [true, [[0, 1], [0, 0], [0, 2], [0, 3]]], // Long bar
  [true, [[1, 1], [1, 0], [1, 2], [0, 1]]], // T piece
  [true, [[0, 2], [0, 1], [0, 3], [1, 1]]], // L piece
  [true, [[0, 1], [0, 0], [0, 2], [1, 2]]], // J piece
  [false, [[0, 1], [0, 2], [1, 1], [1, 2]]], // Square piece
  [true, [[1, 1], [0, 0], [0, 1], [1, 2]]], // Z piece
  [true, [[1, 2], [0, 2], [0, 3], [1, 1]]], // S piece
]

function generateEmptyGrid(rows, columns) {
  let grid = []
  for (let row = 0; row < rows; row++) {
    grid.push([]);
    for (let column = 0; column < columns; column++) {
      grid[row].push(null);
    }
  }
  return grid;
}

export class Tetris {

  constructor(rows, columns, callback) {

    this.rows = rows;
    this.columns = columns;
    this.callback = callback;

    this.grid = generateEmptyGrid(this.rows, this.columns);

    this.numTicks = 0;
    this.numPieces = 0;
    this.score = 0;

    this.pivot = null;
    this.nextPiece = this.randomPiece();
    this.addPiece();

  }

  log() {

    let string = ""
    for (let i in this.grid) {
      for (let j in this.grid[i]) {
        string += (this.grid[i][j]? this.grid[i][j].log(): ".") + " ";
      }
      string += "\n";
    }
    console.log(string);

  }

  update(callback) {

    // Check if new tile needs to be generated:
    let onBottom = false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
          if (i == this.grid.length - 1 || (this.grid[i + 1][j] !== null && this.grid[i + 1][j].isInactive())) {
            onBottom = true;
          }
        }
      }
    }

    // Shift active tiles downwards:
    let clone = generateEmptyGrid(this.rows, this.columns);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
          if (onBottom) {
            clone[i][j] = this.grid[i][j];
            clone[i][j].deactivate();
          } else {
            clone[i + 1][j] = this.grid[i][j];
          }
        } else if (this.grid[i][j] !== null && this.grid[i][j].isInactive()) {
          clone[i][j] = this.grid[i][j];
        }
      }
    }
    this.grid = clone;
    
    // Shift pivot:
    if (this.pivot !== null)
      this.pivot = [this.pivot[0] + 1, this.pivot[1]];

    // Clear lines if necessary:
    let numClears = 0;
    for (let i = 0; i < this.rows; i++) {
      let full = true;
      for (let j = 0; j < this.columns; j++) {
        if (this.grid[i][j] === null || !this.grid[i][j].isInactive()) {
          full = false; break;
        }
      }
      if (full) {
        numClears++;
        for (let row = i; row > 0; row--) {
          for (let j = 0; j < this.columns; j++) {
            this.grid[row][j] = this.grid[row - 1][j];
          }
        }
        for (let j = 0; j < this.columns; j++) {
          this.grid[0][j] = null;
        }
      }
    }

    this.score += Math.round(numClears * (-40)
    + Math.pow(numClears, 2) * (455/3)
    + Math.pow(numClears, 3) * (-90)
    + Math.pow(numClears, 4) * (55/3));

    this.numTicks++;

    // Add new piece if necessary:
    if (onBottom) {
      this.addPiece();
    }

    callback();

  }

  // Update Helpers:

  randomPiece() {
    return Math.floor(Math.random() * 6);
  }

  addPiece() {

    this.pivot = null;

    let piece = this.nextPiece;
    this.nextPiece = this.randomPiece();

    let offset = Math.floor(this.grid[0].length / 2) - 2;
    
    let lost = false;
    let pivot = PIECES[piece][0];
    for (let index in PIECES[piece][1]) {

      let location = PIECES[piece][1][index];
      if (this.grid[location[0]][location[1] + offset] !== null && this.grid[location[0]][location[1] + offset].isInactive()) {
        lost = true;
      }
      this.grid[location[0]][location[1] + offset] = new Tile()
      this.grid[location[0]][location[1] + offset].activate();
      
      if (pivot && parseInt(index) === 0) {
        this.pivot = [location[0], location[1] + offset];
      }

    }
    this.numPieces += 1;
    
  }

  // Controls:

  rotateClockwise(callback) {

    if (this.pivot !== null) {

      let error = false;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
            if (this.pivot[0] + j - this.pivot[1] > this.rows - 1
                || this.pivot[1] + this.pivot[0] - i > this.columns - 1
                || this.pivot[0] + j - this.pivot[1] < 0
                || this.pivot[1] + this.pivot[0] - i < 0
                || (this.grid[this.pivot[0] + j - this.pivot[1]][this.pivot[1] + this.pivot[0] - i] !== null
                  && this.grid[this.pivot[0] + j - this.pivot[1]][this.pivot[1] + this.pivot[0] - i].isInactive()
            )) {
              error = true;
            }
          }
        }
      }

      if (!error) {
        let clone = generateEmptyGrid(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            if (this.grid[i][j] !== null && this.grid[i][j].isActive())
              clone[this.pivot[0] + j - this.pivot[1]][this.pivot[1] + this.pivot[0] - i] = this.grid[i][j];
            if (this.grid[i][j] !== null && this.grid[i][j].isInactive())
              clone[i][j] = this.grid[i][j];
          }
        }
        this.grid = clone;
        callback();
      }
      
    }
    
  }

  translateLeft(callback) {

    let onLeft = false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
          if (j == 0 || (this.grid[i][j - 1] !== null && this.grid[i][j - 1].isInactive())) {
            onLeft = true; break;
          }
        }
      }
    }

    if (!onLeft) {
      let clone = generateEmptyGrid(this.rows, this.columns);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
            clone[i][j - 1] = this.grid[i][j];
          } else if (this.grid[i][j] !== null && this.grid[i][j].isInactive()) {
            clone[i][j] = this.grid[i][j];
          }
        }
      }
      this.grid = clone;

      // Shift pivot:
      if (this.pivot !== null)
        this.pivot = [this.pivot[0], this.pivot[1] - 1];
      
      callback();
    }

  }

  translateRight(callback) {

    let onRight = false;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
          if (j == this.columns - 1 || (this.grid[i][j + 1] !== null && this.grid[i][j + 1].isInactive())) {
            onRight = true; break;
          }
        }
      }
    }

    if (!onRight) {
      let clone = generateEmptyGrid(this.rows, this.columns);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
            clone[i][j + 1] = this.grid[i][j];
          } else if (this.grid[i][j] !== null && this.grid[i][j].isInactive()) {
            clone[i][j] = this.grid[i][j];
          }
        }
      }
      this.grid = clone;

      // Shift pivot:
      if (this.pivot !== null)
        this.pivot = [this.pivot[0], this.pivot[1] + 1];
      
      callback();
    }

  }

  drop(callback) {
    let current = this.numPieces;
    while (current === this.numPieces)
      this.update(() => {});
    callback();
  }

  // Events:

  gameOver() {
    this.callback();
  }

  // Rendering:

  render() {

    let container = $('#tetris');
    container.empty();
    let grid = $('<div class="grid"></div>');
    
    let size = Math.min(
      0.8 * ($('#container').width() - 3) / this.columns,
      ($('#tetris').height() - 3) / this.rows
    ) + 'px';

    grid.css({
      'grid-template-rows': 'repeat(' + this.rows + ', ' + size + ')',
      'grid-template-columns': 'repeat(' + this.columns + ', ' + size + ')',
    });

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let tile = $('<div class="tile"></div>');
        if (this.grid[i][j] !== null && this.grid[i][j].isActive()) {
          tile.addClass("tile-active");
        }
        if (this.grid[i][j] !== null && this.grid[i][j].isInactive()) {
          tile.addClass("tile-inactive");
        }
        grid.append(tile);
      }
    }
    container.append(grid);

    $('#scoreboard-score').text(this.score);
    $('#scoreboard-piece').text(this.nextPiece);

    this.renderNextPiece();
 
  }

  renderNextPiece() {

    let container = $('#tetris-next');
    container.empty();
    let grid = $('<div class="grid"></div>');
    
    let size = Math.min(
      0.8 * ($('#container').width() - 3) / this.columns,
      ($('#tetris').height() - 3) / this.rows
    ) + 'px';

    grid.css({
      'grid-template-rows': 'repeat(4, ' + size + ')',
      'grid-template-columns': 'repeat(4, ' + size + ')',
    });

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let tile = $('<div class="tile"></div>');
        for (let index in PIECES[this.nextPiece][1]) {
          let location = PIECES[this.nextPiece][1][index];
          if (i === location[0] + 1 && j === location[1]) {
            tile.addClass("tile-active");
          }
        }
        grid.append(tile);
      }
    }

    container.append(grid);

  }
}