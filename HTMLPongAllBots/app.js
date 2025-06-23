var canvas;
var canvasContext;

var ballX = 400;
var ballY = 600;
var ballSize = 10;
var ballSpeedX = 10;
var ballSpeedY = 10;
var deltaY = 0;
var amtSteps;
const maxBallSpeed = 40;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
var paddle1Y;
var paddle2Y;

var bot1Speed = 13;
var bot2Speed = 10;

var bot2TargetY = 0;

var player1Score = 0;
var player2Score = 0;
const winScore = 5;
var showWinScreen = false;

function handleMouseClick(event) {
    if (showWinScreen) {
        player1Score = 0;
        player2Score = 0;
        showWinScreen = false;
    }
}

window.onload = () => {
    console.log("Game loaded!");
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    paddle1Y = (canvas.height / 2) - 50;
    paddle2Y = (canvas.height / 2) - 50;

    ballX = canvas.width / 2;
    ballY = canvas.height / 2;

    var FPS = 30;
    setInterval(() => {
        move();
        draw();
    }, 1000 / FPS);

    canvas.addEventListener('mousedown', handleMouseClick);
};

function calcMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = event.clientX - rect.left - root.scrollLeft;
    var mouseY = event.clientY - rect.top - root.scrollTop;

    return {
        x: mouseX,
        y: mouseY
    };
}

function ballReset() {
    if (player1Score >= winScore || player2Score >= winScore) {
        showWinScreen = true;
    }
    ballSpeedX = 10;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 4; // consistent start angle
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function bot1Move() {
    var paddle1YCenter = paddle1Y + (PADDLE_HEIGHT / 2);
    let distance = Math.abs(ballX - 0);
    let jitterStrength = distance > canvas.width * 0.3 ? 10 : 2;
    let jitter = Math.sin(Date.now() / 150) * jitterStrength;
    let targetY = ballY + jitter;

    if (paddle1YCenter < targetY - 10) {
        paddle1Y += bot1Speed;
    } else if (paddle1YCenter > targetY + 10) {
        paddle1Y -= bot1Speed;
    }
}

function bot2Move() {
    var paddle2YCenter = paddle2Y + (PADDLE_HEIGHT / 2);

    if (ballSpeedX > 0) {
        let framesAhead = (canvas.width - ballX) / Math.abs(ballSpeedX);
        let predictedY = ballY + ballSpeedY * framesAhead;

        while (predictedY < 0 || predictedY > canvas.height) {
            if (predictedY < 0) predictedY = -predictedY;
            else if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY;
        }

        predictedY = Math.max(Math.min(predictedY, canvas.height - 35), 35);

        let relativeHitPos = predictedY - paddle2Y;
        let targetY;

        if (relativeHitPos < PADDLE_HEIGHT / 2) {
            targetY = predictedY - (PADDLE_HEIGHT / 3);
        } else {
            targetY = predictedY + (PADDLE_HEIGHT / 3);
        }

        targetY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, targetY));
        bot2TargetY += (targetY - bot2TargetY) * 0.1;

        let diff = bot2TargetY - paddle2YCenter;
        if (Math.abs(diff) > 5) {
            let moveAmount = Math.min(bot2Speed, Math.abs(diff));
            if (diff > 0) paddle2Y += moveAmount;
            else paddle2Y -= moveAmount;
        }

        if (paddle2Y < 0) paddle2Y = 0;
        if (paddle2Y > canvas.height - PADDLE_HEIGHT) paddle2Y = canvas.height - PADDLE_HEIGHT;
    }
}

function speedUpBall() {
    ballSpeedX *= 1.1;
    ballSpeedY *= 1.1;

    ballSpeedX = Math.max(Math.min(ballSpeedX, maxBallSpeed), -maxBallSpeed);
    ballSpeedY = Math.max(Math.min(ballSpeedY, maxBallSpeed), -maxBallSpeed);
}

function move() {
    if (showWinScreen) return;

    bot1Move();
    bot2Move();

    amtSteps = Math.ceil(Math.max(Math.abs(ballSpeedX), Math.abs(ballSpeedY)));
    for (let step = 0; step < amtSteps; step++) {
        ballX += ballSpeedX / amtSteps;
        ballY += ballSpeedY / amtSteps;

        if (ballX < 0) {
            if (ballY > paddle1Y && ballY < (paddle1Y + PADDLE_HEIGHT)) {
                speedUpBall();
                ballSpeedX = -ballSpeedX;

                deltaY = ballY - (paddle1Y + (PADDLE_HEIGHT / 2));
                ballSpeedY = deltaY * 0.35 + (Math.random() - 0.5) * 6;
            } else {
                player2Score += 1;
                ballReset();
            }
        }

        if (ballX > canvas.width) {
            if (ballY > paddle2Y && ballY < (paddle2Y + PADDLE_HEIGHT)) {
                speedUpBall();
                ballSpeedX = -ballSpeedX;

                deltaY = ballY - (paddle2Y + (PADDLE_HEIGHT / 2));
                ballSpeedY = deltaY * 0.35 + (Math.random() - 0.5) * 6;
            } else {
                player1Score += 1;
                ballReset();
            }
        }

        if (ballY > canvas.height || ballY < 0) {
            ballSpeedY = -ballSpeedY;
        }
    }
}

function drawNet() {
    for (var i = 0; i < canvas.height; i += 20) {
        drawRect(((canvas.width / 2) - 1), i, 2, 10, 'white');
    }
}

function draw() {
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    if (showWinScreen) {
        canvasContext.fillStyle = 'white';
        canvasContext.font = "60px monospace";
        canvasContext.textAlign = "center";
        canvasContext.fillText(
            player1Score >= winScore ? "Bot1 Won!" : "Bot2 Won!",
            canvas.width / 2,
            (canvas.height / 2) - 50
        );

        canvasContext.font = "45px monospace";
        canvasContext.fillText("Click to play again", canvas.width / 2, (canvas.height / 2) + 50);
        return;
    }

    drawNet();

    drawRect(0, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(canvas.width - PADDLE_WIDTH, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');

    drawCircle(ballX, ballY, ballSize, 'white');

    canvasContext.font = "75px monospace";
    canvasContext.textAlign = "center";
    canvasContext.fillText(player1Score, canvas.width / 4, 100);
    canvasContext.fillText(player2Score, (canvas.width * 3) / 4, 100);

    canvasContext.font = "25px monospace";
    canvasContext.fillText("Bot1", canvas.width / 4, 130);
    canvasContext.fillText("Bot2", (canvas.width * 3) / 4, 130);
}

function drawRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}

function drawCircle(x, y, radius, color) {
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}
