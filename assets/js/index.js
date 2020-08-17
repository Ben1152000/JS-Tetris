import { Tetris } from '/assets/js/tetris.js';

export function main() {

  let keysdown = {};

  function handleInput(delta) {
    for (var key in keysdown) {
      switch (parseInt(key)) {
        case 32:
          if (keysdown[key] === 0) {
            tetris.drop(() => { tetris.render(); });
            timeSinceLastUpdate = 0;
          }
          break;
        case 37:
        case 65:
          if (keysdown[key] === 0 || (keysdown[key] + delta > 250 && Math.floor(keysdown[key] / 75) < Math.floor((keysdown[key] + delta) / 75))) {
            tetris.translateLeft(() => { tetris.render(); });
          }
          break;
        case 38:
        case 87:
          if (keysdown[key] === 0 || (keysdown[key] + delta > 250 && Math.floor(keysdown[key] / 75) < Math.floor((keysdown[key] + delta) / 75))) {
            tetris.rotateClockwise(() => { tetris.render(); });
          }
          break;
        case 39:
        case 68:
          if (keysdown[key] === 0 || (keysdown[key] + delta > 250 && Math.floor(keysdown[key] / 75) < Math.floor((keysdown[key] + delta) / 75))) {
            tetris.translateRight(() => { tetris.render(); });
          }
          break;
        case 40:
        case 83:
          if (keysdown[key] === 0 || (keysdown[key] + delta > 250 && Math.floor(keysdown[key] / 75) < Math.floor((keysdown[key] + delta) / 75))) {
            tetris.update(() => { tetris.render(); });
            timeSinceLastUpdate = 0;
          }
          break;
        
      }
      keysdown[key] += delta;
    }
  }

  let tetris = new Tetris(20, 10);
  tetris.render();

  let lastTimestamp = 0;
  let timeSinceLastUpdate = 0; // The last time the loop was run

  function mainLoop(timestamp) {

    let delta = timestamp - lastTimestamp;

    handleInput(delta);
    if (timeSinceLastUpdate > tetris.tickDuration()) {
      tetris.update(() => { tetris.render(); });
      timeSinceLastUpdate = 0;
    } else {
      timeSinceLastUpdate += delta;
    }
    
    lastTimestamp = timestamp;
    requestAnimationFrame(mainLoop);
  }

  $(document).keydown((event) => {
    if (!(event.which in keysdown))
      keysdown[event.which] = 0;
  });

  $(document).keyup((event) => {
    delete keysdown[event.which];
  });

  $(window).resize(() => {
    tetris.render();
  });

  $('#button-tetris-reset').on('click', (event) => {
    event.preventDefault();
    tetris = new Tetris(20, 10);
    tetris.render();
    timeSinceLastUpdate = 0;
  });

  requestAnimationFrame(mainLoop);

}