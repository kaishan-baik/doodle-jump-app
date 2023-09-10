// board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

// doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = (boardHeight * 7) / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

// game physics
let velocityX = 0;
let velocityY = 0; // doodler jump speed
let initialVelocityY = -3; // starting velocity Y
let gravity = 0.06;

let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight,
};

// score
let score = 0;
let maxScore = 0;
let HIGHSCORE = "highscore";
let highscore;
let thisGameTopScore;
// let highScore = getHighScore();

// platforms
let platformArray = [];
let platformWidth = 60;
platformHeight = 18;
platformCount = 5;

// game start or end
let startingPage = true;
let gameStart = false;
let gameOver = false;

// game difficulty
let level = 0;
let threshold;

// touch controls
let buttonX = 110;
let buttonY = 380;
let buttonWidth = 130;
let buttonHeight = 45;
let buttonText = "Start Game!";

let endButtonX = 100;
let endButtonY = 450;
let endButtonWidth = 150;
let endButtonHeight = 45;
let endButtonText = "Restart Game!";

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  board.addEventListener("click", moveDoodlerWithMouse);

  context = board.getContext("2d");
  drawDoodler();
  drawPlatform();

  velocityY = initialVelocityY;

  if (startingPage) {
    loadStartPage();
    document.addEventListener("keydown", startGame);
    drawStartGameButton();

    document.addEventListener("click", startGameButton);
    requestAnimationFrame(startGame);
  }

  getHighScore();
  placePlatforms();
  requestAnimationFrame(update);
  document.addEventListener("keydown", moveDoodler);
  document.addEventListener("click", restartGameButton);
};

function drawDoodler() {
  doodlerRightImg = new Image();
  doodlerRightImg.src = "./images/doodler-right.png";
  doodler.img = doodlerRightImg;
  doodlerRightImg.onload = function () {
    context.drawImage(
      doodler.img,
      doodler.x,
      doodler.y,
      doodlerWidth,
      doodlerHeight
    );
  };

  doodlerLeftImg = new Image();
  doodlerLeftImg.src = "./images/doodler-left.png";
}

function drawPlatform() {
  platformImg = new Image();
  platformImg.src = "./images/platform.png";
}

function getHighScore() {
  maxScore = JSON.parse(localStorage.getItem(HIGHSCORE));
  return maxScore;
}

function loadStartPage() {
  context.fillStyle = "red";
  context.font = "40px Calibri";
  context.fillText("doodle jump!", 75, 120);

  context.fillStyle = "black";
  context.font = "20px sans-serif";
  context.fillText('Press "Enter" to start the game', 40, 280);

  context.fillStyle = "red";
  context.fillText("OR", 165, 320);

  context.fillStyle = "black";
  context.fillText("Click the button below!", 70, 355);
}

function startGame(e) {
  if (e.code === "Enter" && !gameOver) {
    startingPage = false;
    gameStart = true;
  }
}

function update() {
  requestAnimationFrame(update);
  //   getMouseCoordinates();

  if (gameStart) {
    // doodler
    context.clearRect(0, 0, board.width, board.height);

    doodler.x += velocityX;

    if (doodler.x > boardWidth) {
      doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
      doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
      gameStart = false;
      gameOver = true;
      updateScore();
      getHighScore();
    }

    context.drawImage(
      doodler.img,
      doodler.x,
      doodler.y,
      doodlerWidth,
      doodlerHeight
    );

    //   platforms
    for (let i = 0; i < platformArray.length; i++) {
      let platform = platformArray[i];
      if (velocityY < 0 && doodler.y < (boardHeight * 3) / 4) {
        // slide platform down
        platform.y -= initialVelocityY;
      }
      if (detectCollision(doodler, platform) && velocityY >= 0) {
        // jump off platform
        velocityY = initialVelocityY;
      }
      context.drawImage(
        platform.img,
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    }
    //   clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
      platformArray.shift(); // remove 1st element from array
      updateScore();
      increaseDifficulty();
      newPlatform();
    }

    showScore();
  }

  if (gameOver) {
    showScore();

    return;
  }
}

function showScore() {
  if (gameStart) {
    context.fillStyle = "black";
    context.font = "16px Arial";
    context.fillText("Score: " + score, 5, 20);
    context.fillText("Highscore: " + maxScore, 220, 20);
    context.fillText("Level: " + level, 110, 20);
  }
  if (gameOver) {
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText("Your Score", 50, 100);

    context.font = "30px Arial";
    context.fillText(score, boardWidth / 2 - 15, 150);

    context.font = "20px Arial";
    context.fillText("Highscore", 50, 220);

    context.font = "30px Arial";
    context.fillText(maxScore, boardWidth / 2 - 15, 270);

    context.font = "16px Arial";
    context.fillText(
      'Game Over: Press "Space" to Restart ',
      boardWidth / 7,
      (boardHeight * 5) / 8
    );

    context.fillText("OR", boardWidth / 2 - 5, (boardHeight * 5) / 8 + 50);
    drawRestartGameButton();
  }
}

function placePlatforms() {
  platformArray = [];
  let platform = {
    img: platformImg,
    x: boardWidth / 2,
    y: boardHeight - 50,
    width: platformWidth,
    height: platformHeight,
  };

  platformArray.push(platform);

  for (let i = 0; i < platformCount; i++) {
    let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);

    let platform = {
      img: platformImg,
      x: randomX,
      y: boardHeight - 75 * i - 150 - level * i,
      width: platformWidth,
      height: platformHeight,
    };
    platformArray.push(platform);
  }
}

function newPlatform() {
  let randomX = Math.floor((Math.random() * boardWidth * 3) / 4);
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight,
  };
  platformArray.push(platform);
}

function updateScore() {
  score += 1;

  if (maxScore < score) {
    maxScore = score;
  }

  if (!highscore) {
    localStorage.setItem(HIGHSCORE, JSON.stringify(maxScore));
  }
}

function moveDoodler(e) {
  if (e.code === "ArrowRight" || e.code === "KeyD") {
    velocityX = 2;
    doodler.img = doodlerRightImg;
  } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  } else if (e.code === "Space" && gameOver) {
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight,
    };
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    gameOver = false;
    gameStart = true;
    placePlatforms();
  }
}

function moveDoodlerWithMouse(e) {
  if (e.offsetX > boardWidth / 2) {
    velocityX = 2;
    doodler.img = doodlerRightImg;
    // console.log("This is the right side of the board. X=" + e.offsetX);
  } else {
    velocityX = -2;
    doodler.img = doodlerLeftImg;
    // console.log("This is the left side of the board. X=" + e.offsetX);
  }
}

function detectCollision(a, b) {
  return (
    // when a's top left doesn't reach b's top right corner
    a.x < b.x + b.width &&
    // when a's top right passes b's top left corner
    a.x + a.width > b.x &&
    // when a's top left doesn't reach b's bottom left corner
    a.y < b.y + b.height &&
    // when a's bottom left passes b's top left corner
    a.y + a.height > b.y
  );
}

function increaseDifficulty() {
  let threshold = Math.floor(score / 10);
  if (threshold > level) {
    level = threshold;
  }
}

function drawStartGameButton() {
  context.fillStyle = "rgb(107, 186, 76)";
  context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText(buttonText, buttonX + 12, buttonY + 30);
}

function startGameButton(e) {
  let mouseX = e.offsetX;
  let mouseY = e.offsetY;

  if (
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight
  ) {
    startingPage = false;
    gameStart = true;
  }
}

function drawRestartGameButton() {
  context.fillStyle = "red";
  context.fillRect(endButtonX, endButtonY, endButtonWidth, endButtonHeight);

  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText(endButtonText, endButtonX + 12, endButtonY + 30);
}

function restartGameButton(e) {
  let mouseX = e.offsetX;
  let mouseY = e.offsetY;

  if (
    mouseX >= endButtonX &&
    mouseX <= endButtonX + endButtonWidth &&
    mouseY >= endButtonY &&
    mouseY <= endButtonY + endButtonHeight &&
    gameOver
  ) {
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight,
    };
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    gameOver = false;
    gameStart = true;
    placePlatforms();
  }
}
