// # is a wall, . is a path, S is the start, G is the goal, and D is a water drop.
const levels = [
  {
    easyOpen: [{ x: 4, y: 1 }, { x: 7, y: 5 }],
    hardClose: [{ x: 2, y: 1 }, { x: 3, y: 5 }],
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
    easyOpen: [{ x: 5, y: 1 }, { x: 2, y: 2 }],
    hardClose: [{ x: 1, y: 2 }, { x: 7, y: 5 }],
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
    easyOpen: [{ x: 2, y: 1 }, { x: 7, y: 5 }],
    hardClose: [{ x: 5, y: 3 }, { x: 3, y: 5 }],
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
const startScreen = document.getElementById('start-screen');
const gameView = document.getElementById('game-view');
const impactScreen = document.getElementById('impact-screen');
const impactTitle = document.getElementById('impact-title');
const impactMessage = document.getElementById('impact-message');
const impactSource = document.getElementById('impact-source');
const startButton = document.getElementById('start-button');
const continueButton = document.getElementById('continue-button');
const finalDonationLink = document.getElementById('final-donation-link');
const difficultySelect = document.getElementById('difficulty-select');
const difficultyName = document.getElementById('difficulty-name');

const impactMessages = [
  {
    message: 'In 2022, 2.2 billion people lacked safely managed drinking water. Reliable access closer to home can reduce the time families spend collecting water.',
    source: 'Source: WHO/UNICEF Joint Monitoring Programme, 2023.'
  },
  {
    message: 'Women and girls are often responsible for collecting water. When water is nearby, that time can go toward school, work, rest, and family.',
    source: 'Source: WHO/UNICEF Joint Monitoring Programme, Progress on household drinking water, sanitation and hygiene 2000–2022.'
  },
  {
    message: 'Reliable access to safe water supports health, learning, and daily life. A lasting solution must keep water services available and safe over time.',
    source: 'Source: WHO/UNICEF Joint Monitoring Programme.'
  }
];

let currentLevel = 0;
let score = 0;
let maze = [];
let playerPosition = { x: 1, y: 1 };
let gameIsComplete = false;
let gameIsStarted = false;
let selectedDifficulty = 'normal';

// Turn the level's text map into rows that can change during the game.
function loadLevel() {
  maze = levels[currentLevel].map.map(row => row.split(''));
  const level = levels[currentLevel];

  if (selectedDifficulty === 'easy') {
    level.easyOpen.forEach(({ x, y }) => {
      maze[y][x] = '.';
    });
  } else if (selectedDifficulty === 'hard') {
    level.hardClose.forEach(({ x, y }) => {
      maze[y][x] = '#';
    });
  }

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
  difficultyName.textContent = difficultySelect.options[difficultySelect.selectedIndex].textContent;

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
  if (!gameIsStarted || gameIsComplete) {
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
    showImpactScreen();
    return;
  } else {
    gameStatus.textContent = 'Find the way through the maze.';
  }

  drawMaze();
}

// Show one impact message after each route, before the next maze begins.
function showImpactScreen() {
  const isFinalLevel = currentLevel === levels.length - 1;
  const impact = impactMessages[currentLevel];

  gameIsStarted = false;
  gameIsComplete = isFinalLevel;
  impactTitle.textContent = isFinalLevel
    ? `All ${levels.length} routes complete!`
    : `Route ${currentLevel + 1} complete`;
  impactMessage.textContent = impact.message;
  impactSource.textContent = impact.source;
  finalDonationLink.hidden = !isFinalLevel;
  continueButton.textContent = isFinalLevel ? 'PLAY AGAIN' : `CONTINUE TO ROUTE ${currentLevel + 2}`;
  gameView.hidden = true;
  impactScreen.hidden = false;
  impactTitle.focus();

  if (isFinalLevel) {
    impactMessage.textContent += ` Your final score is ${score} points.`;
  }
}

function startGame() {
  selectedDifficulty = difficultySelect.value;
  gameIsStarted = true;
  gameIsComplete = false;
  gameStatus.textContent = 'Find the way through the maze.';
  startScreen.hidden = true;
  impactScreen.hidden = true;
  gameView.hidden = false;
  loadLevel();
  gameStatus.focus();
}

function restartGame() {
  currentLevel = 0;
  score = 0;
  gameIsComplete = false;
  gameIsStarted = true;
  gameStatus.textContent = 'Find the way through the maze.';
  impactScreen.hidden = true;
  startScreen.hidden = true;
  gameView.hidden = false;
  loadLevel();
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

startButton.addEventListener('click', startGame);

continueButton.addEventListener('click', () => {
  if (gameIsComplete) {
    currentLevel = 0;
    score = 0;
    gameIsComplete = false;
    impactScreen.hidden = true;
    startScreen.hidden = false;
    startButton.focus();
    return;
  }

  currentLevel++;
  gameIsStarted = true;
  gameStatus.textContent = `Route ${currentLevel + 1}: find the way through the maze.`;
  impactScreen.hidden = true;
  gameView.hidden = false;
  loadLevel();
  gameStatus.focus();
});

restartButton.addEventListener('click', restartGame);
