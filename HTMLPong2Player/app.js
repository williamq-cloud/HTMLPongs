var canvas;
var canvasCtx;

var FPS = 30;

var PADDLE_WIDTH = 10;
var PADDLE_HEIGHT = 100;

var player1X;
var player1Y;
var playerSpeed = 10;
var player1Score = 0;

var player2X;
var player2Y;
var botSpeed = 10;
var player2Score = 0;

var ballSize = 10;
var ballX;
var ballY;
var ballSpeedX = 10;
var ballSpeedY = 4;
var maxBallSpeed = 25;
var speedIncrement = 0.5;

var keysPressed = {};

var winScore = 5;
var won = false;

window.onload = () => {
    canvas = document.getElementById("gameCanvas");
    canvasCtx = canvas.getContext("2d");
    player1X = 0;
    player2X = canvas.width - PADDLE_WIDTH;
    resetInitial();

    setInterval(() => {
        if (!won) {
            move();
        }
        draw();
    }, 1000 / FPS);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseClick);
}

function handleMouseClick() {
    if (won) {
        won = false;
        player1Score = 0;
        player2Score = 0;
        resetInitial();
    }
}

function handleKeyDown(event) {
    keysPressed[event.code] = true;
}
function handleKeyUp(event) {
    keysPressed[event.code] = false;
}

function resetInitial() {
    ballSpeedX = 0;
    ballSpeedY = 0;
    player1Y = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
    player2Y = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    setTimeout(() => {
        ballSpeedX = 10 * (Math.random() < 0.5 ? 1 : -1);
        ballSpeedY = 4 * (Math.random() < 0.5 ? 1 : -1);
    }, 1000);
}

function reset(ballSpX, ballSpY) {
    ballSpeedX = 0;
    ballSpeedY = 0;
    player1Y = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
    player2Y = (canvas.height / 2) - (PADDLE_HEIGHT / 2);
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    setTimeout(() => {
        ballSpeedX = Math.random() < 0.5 ? 10 : -10;
        ballSpeedY = (Math.random() * 4) - 2;
    }, 1000);
}

function calculateBounce(playerY) {
    var playerCenter = playerY + (PADDLE_HEIGHT / 2);
    var deltaY = ballY - playerCenter;
    ballSpeedY = deltaY * 0.35;
}

function getMicrosteps() {
    var maxSpeed = Math.max(Math.abs(ballSpeedX), Math.abs(ballSpeedY));
    return Math.ceil(maxSpeed);
}

function move() {
    var microSteps = getMicrosteps();

    var microStepX = ballSpeedX / microSteps;
    var microStepY = ballSpeedY / microSteps;

    for (var i = 0; i < microSteps; i++) {
        ballX += microStepX;
        ballY += microStepY;

        if (ballY - ballSize < 0) {
            ballY = ballSize;
            ballSpeedY = -ballSpeedY;
            ballY += ballSpeedY;
        }
        if (ballY + ballSize > canvas.height) {
            ballY = canvas.height - ballSize;
            ballSpeedY = -ballSpeedY;
            ballY += ballSpeedY;
        }
        if (ballX - ballSize < 0) {
            if (ballY > player1Y && ballY < (player1Y + PADDLE_HEIGHT)) {
                ballX = PADDLE_WIDTH + ballSize;
                ballY = Math.max(player1Y + ballSize, Math.min(ballY, player1Y + PADDLE_HEIGHT - ballSize));
                ballSpeedX = Math.sign(ballSpeedX) * Math.min(Math.abs(ballSpeedX), maxBallSpeed);
                ballSpeedX *= -1;
                if (Math.abs(ballSpeedX) < maxBallSpeed) {
                    ballSpeedX += Math.sign(ballSpeedX) * speedIncrement;
                }
                calculateBounce(player1Y);
            } else {
                player2Score++;
                if (player2Score >= winScore) {
                    won = true;
                }
                reset(ballSpeedX, ballSpeedY);
                break;
            }
        }
        if (ballX + ballSize > canvas.width) {
            if (ballY > player2Y && ballY < (player2Y + PADDLE_HEIGHT)) {
                ballX = canvas.width - PADDLE_WIDTH - ballSize;
                ballY = Math.max(player2Y + ballSize, Math.min(ballY, player2Y + PADDLE_HEIGHT - ballSize));
                ballSpeedX = Math.sign(ballSpeedX) * Math.min(Math.abs(ballSpeedX), maxBallSpeed);
                ballSpeedX *= -1;
                if (Math.abs(ballSpeedX) < maxBallSpeed) {
                    ballSpeedX += Math.sign(ballSpeedX) * speedIncrement;
                }
                calculateBounce(player2Y);
            } else {
                player1Score++;
                if (player1Score >= winScore) {
                    won = true;
                }
                reset(ballSpeedX, ballSpeedY);
                break;
            }
        }
    }

    if (keysPressed['KeyW']) {
        player1Y -= playerSpeed;
    }
    if (keysPressed['KeyS']) {
        player1Y += playerSpeed;
    }
    if (keysPressed['ArrowUp']) {
        player2Y -= playerSpeed;
    }
    if (keysPressed['ArrowDown']) {
        player2Y += playerSpeed;
    }

    if (player1Y < 0) {
        player1Y = 0;
    }
    if (player1Y > (canvas.height - PADDLE_HEIGHT)) {
        player1Y = canvas.height - PADDLE_HEIGHT;
    }
    if (player2Y < 0) {
        player2Y = 0;
    }
    if (player2Y > (canvas.height - PADDLE_HEIGHT)) {
        player2Y = canvas.height - PADDLE_HEIGHT;
    }
}

function draw() {
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    drawScore();

    if (won) {
        if (player1Score >= winScore) {
            drawWin("P1");
        } else {
            drawWin("P2");
        }
        return;
    }

    drawNet();
    drawRect(player1X, player1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(player2X, player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawCircle(ballX, ballY, ballSize, 'white');
}

function drawRect(xLeft, yTop, width, height, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(xLeft, yTop, width, height);
}

function drawCircle(xCent, yCent, radius, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.beginPath();
    canvasCtx.arc(xCent, yCent, radius, 0, Math.PI * 2, true);
    canvasCtx.fill();
}

function drawScore() {
    canvasCtx.fillStyle = 'white';
    canvasCtx.textAlign = 'center';
    canvasCtx.font = '100px monospace';
    canvasCtx.fillText(player1Score, (canvas.width / 4), 100);
    canvasCtx.fillText(player2Score, (canvas.width / 4) * 3, 100);

    canvasCtx.font = '50px monospace';
    canvasCtx.fillText("P1", (canvas.width / 4), 150);
    canvasCtx.fillText("P2", (canvas.width / 4) * 3, 150);
}

function drawNet() {
    for (var i = 0; i < canvas.height; i += 20) {
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillRect((canvas.width / 2) - 1, i, 2, 10);
    }
}

function drawWin(whoWon) {
    canvasCtx.fillStyle = 'white';
    canvasCtx.font = '50px monospace';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText(whoWon + " won!", canvas.width / 2, canvas.height / 2);
    canvasCtx.fillText("Click to play again", canvas.width / 2, (canvas.height / 2) + 75);
}
