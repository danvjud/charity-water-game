// # is a wall, . is a path, S is the start, G is the goal, and D is a water drop.
const levels = [
  {
    map: [
      '#########',
      '#S..#...#',
      '#.#.#.#.#',
      '#.#...#.#',
      '#...#...#',
      '###.#.###',
      '#.....#G#',
      '#.D#....#',
      '#########'
    ]
  },
  {
    map: [
      '#########',
      '#S...#.D#',
      '#.##.#..#',
      '#.#.....#',
      '#...###.#',
      '###.....#',
      '#.#.#.#G#',
      '#.D.#...#',
      '#########'
    ]
  },
  {
    map: [
      '#########',
      '#S#....D#',
      '#.#.#.#.#',
      '#.#D..#.#',
      '#...#...#',
      '###.#.###',
      '#D#.#.#G#',
      '#.......#',
      '#########'
    ]
  }
];

const mazeElement = document.getElementById('maze');
const levelNumber = document.getElementById('level-number');
const scoreNumber = document.getElementById('score-number');
const gameStatus = document.getElementById('game-status');
const restartButton = document.getElementById('restart-button');
const directionButtons = document.querySelectorAll('[data-direction]');

let currentLevel = 0;
let score = 0;
let maze = [];
let playerPosition = { x: 1, y: 1 };
let gameIsComplete = false;

// Turn the level's text map into rows that can change during the game.
function loadLevel() {
  maze = levels[currentLevel].map.map(row => row.split(''));

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 'S') {
        playerPosition = { x: x, y: y };
        maze[y][x] = '.';
      }
    }
  }

  drawMaze();
}

// Build the visible maze from its current map and the player's position.
function drawMaze() {
  mazeElement.innerHTML = '';
  mazeElement.setAttribute('aria-label', `Maze route ${currentLevel + 1} of ${levels.length}`);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const cell = document.createElement('div');
      const cellType = maze[y][x];

      cell.classList.add('maze-cell');

      if (cellType === '#') {
        cell.classList.add('wall');
      } else {
        cell.classList.add('path');
      }

      if (cellType === 'D') {
        cell.classList.add('water-drop');
      }

      if (cellType === 'G') {
        cell.classList.add('goal');
      }

      if (x === playerPosition.x && y === playerPosition.y) {
        cell.classList.add('player-cell');
        const playerImage = document.createElement('img');
        playerImage.src = 'img/water-can-transparent.png';
        playerImage.alt = '';
        playerImage.classList.add('player-image');
        cell.appendChild(playerImage);
      }

      mazeElement.appendChild(cell);
    }
  }

  levelNumber.textContent = currentLevel + 1;
  scoreNumber.textContent = score;
  restartButton.lastElementChild.textContent = gameIsComplete ? 'PLAY AGAIN' : 'RESTART';
  restartButton.setAttribute('aria-label', gameIsComplete ? 'Play again' : 'Restart game');
}

// Move one tile, but only if it is inside the maze and is not a wall.
function movePlayer(changeX, changeY) {
  if (gameIsComplete) {
    return;
  }

  const nextX = playerPosition.x + changeX;
  const nextY = playerPosition.y + changeY;

  if (nextY < 0 || nextY >= maze.length || nextX < 0 || nextX >= maze[nextY].length) {
    return;
  }

  const nextCell = maze[nextY][nextX];

  if (nextCell === '#') {
    return;
  }

  playerPosition = { x: nextX, y: nextY };

  if (nextCell === 'D') {
    maze[nextY][nextX] = '.';
    score += 10;
    gameStatus.textContent = 'Water drop found! 10 points added.';
  } else if (nextCell === 'G') {
    if (currentLevel === levels.length - 1) {
      gameIsComplete = true;
      gameStatus.textContent = `All three routes complete! Final score: ${score} points.`;
    } else {
      currentLevel++;
      gameStatus.textContent = `Route ${currentLevel} complete. On to the next community!`;
      loadLevel();
      return;
    }
  } else {
    gameStatus.textContent = 'Find the way through the maze.';
  }

  drawMaze();
}

// Use the same movement function for the keyboard and the on-screen buttons.
function moveInDirection(direction) {
  if (direction === 'up') {
    movePlayer(0, -1);
  } else if (direction === 'down') {
    movePlayer(0, 1);
  } else if (direction === 'left') {
    movePlayer(-1, 0);
  } else if (direction === 'right') {
    movePlayer(1, 0);
  }
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveInDirection(event.key.replace('Arrow', '').toLowerCase());
  }
});

directionButtons.forEach(button => {
  button.addEventListener('click', () => {
    moveInDirection(button.dataset.direction);
  });
});

restartButton.addEventListener('click', () => {
  currentLevel = 0;
  score = 0;
  gameIsComplete = false;
  gameStatus.textContent = 'Find the way through the maze.';
  loadLevel();
});

loadLevel();
