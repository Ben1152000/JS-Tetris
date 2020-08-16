import { Tetris } from '/assets/js/tetris.js';

/*
export class Game {

  constructor() {
    this.tetris = new Tetris(20, 10);
    requestAnimationFrame(() => { this.mainLoop });
  }

  mainLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => { this.mainLoop });
  }

  update() {
    this.tetris.update();
  }
  
  draw() {
    this.tetris.log();
  }

}
*/
export function main() {

  //let game = new Game();
  
  let tetris = new Tetris(20, 10);
  let lastTick = 0; // The last time the loop was run
  let duration = 500; // The maximum FPS we want to allow

  function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastTick + duration) {
      requestAnimationFrame(mainLoop);
      return;
    }
    lastTick = timestamp;
    tetris.update();
    //tetris.log();
    tetris.render();
    requestAnimationFrame(mainLoop);
  }

  $(document).keypress((event) => {
    console.log('Key:', event.which);
    if (event.which === 97) {
      event.preventDefault();
      tetris.translateLeft(() => { tetris.render(); });
    } else if (event.which === 100) {
      event.preventDefault();
      tetris.translateRight(() => { tetris.render(); });
    } else if (event.which === 32) {
      event.preventDefault();
      tetris.drop(() => { tetris.render(); });
    } else if (event.which === 119) {
      event.preventDefault();
      tetris.rotateClockwise(() => { tetris.render(); });
    }
  });

  $(window).resize(() => {
    tetris.render();
  });

  requestAnimationFrame(mainLoop);
  

}