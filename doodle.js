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
let gameOver = false;

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
let threshold = Math.floor(score / 10);
let maxThreshold = 0;
let HIGHSCORE = "highscore";
let highScore = getHighScore();

// platforms
let platformArray = [];
let platformWidth = 60;
platformHeight = 18;
platformCount = 5;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  //   get drawing on board
  context = board.getContext("2d");

  //   draw doodler
  //   context.fillStyle = "green";
  //   context.fillRect(doodler.x, doodler.y, doodlerWidth, doodlerHeight);

  //   load images
  //   doodler image
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

  // platform image
  platformImg = new Image();
  platformImg.src = "./images/platform.png";

  velocityY = initialVelocityY;
  placePlatforms();
  requestAnimationFrame(update);
  document.addEventListener("keydown", moveDoodler);
  //   highscore
  getHighScore();
  //   console.log(getHighScore());
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }

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
    increaseDifficulty();
    newPlatform();
    // score += 1;
  }
  //   score
  //   updateScore();
  context.fillStyle = "black";
  context.font = "16px sans-serif";
  context.fillText("Score: " + score, 5, 20);
  context.fillText("Highscore is: " + highScore, 220, 20);
  if (gameOver) {
    context.fillText(
      'Game Over: Press "Space" to Restart ',
      boardWidth / 7,
      (boardHeight * 7) / 8
    );
  }
}

function moveDoodler(e) {
  if (e.code == "ArrowRight" || e.code == "KeyD") {
    // move right
    velocityX = 2;
    doodler.img = doodlerRightImg;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    // move left
    velocityX = -2;
    doodler.img = doodlerLeftImg;
  } else if (e.code == "Space" && gameOver) {
    // reset
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
    placePlatforms();
  }
}

function placePlatforms() {
  platformArray = [];

  // starting platforms
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
      y: boardHeight - 75 * i - 150,
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
  score += 1;
}

function detectCollision(a, b) {
  // a & b are objects, e.g. a is the doodler, b is the platform
  return (
    // when a's top left doesn't reach b's top right corner
    a.x < b.x + b.width &&
    // when a's top right passes b's top left corner
    a.x + a.width > b.x &&
    // when a's top left doesn't reach b's bottom left corner
    a.y < b.y + b.height &&
    // when a's bottom right passes b's top left corner
    a.y + a.height > b.y
  );
}

function updateScore() {
  if (maxScore < score) {
    maxScore = score;
  }
  console.log(maxScore);
  if (highScore && maxScore > highScore) {
    localStorage.setItem(HIGHSCORE, JSON.stringify(maxScore));
  } else if (!highScore) {
    localStorage.setItem(HIGHSCORE, JSON.stringify(maxScore));
  }
}

function getHighScore() {
  return JSON.parse(localStorage.getItem(HIGHSCORE));
}

function increaseDifficulty() {
  //   if (threshold > maxThreshold) {
  //     platform.y -= 5;
  //     platform.height = platformHeight - 5;
  //     maxThreshold = threshold;
  //   }
}
