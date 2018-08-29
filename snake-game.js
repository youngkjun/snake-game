/***************************************
** Beginning of
** Definition
****************************************/
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const boxSize = 24; //px
const screenColor = '#FFFFFF';
const gameBoardColor = '#EFEFEF';
const foodMarkColor = '#FF6600';
const playAreaBorderColor = '#000000';
const addTailNumber = 4;

const BX = {
    width: boxSize, // px
    height: boxSize,  // px
    headColor: '#FF3300',
    tailColor: '#999999'
};

const marginOfPlayArea = {
	// All pixel size
	top: 12, 
	right: 12,
	bottom: 12,
	left: 12,
};

const scoreFontSize = 36; //px
const heightOfScoreArea = scoreFontSize + 6; //px

class Snake {
    constructor(_x, _y){
        this.x = _x;
        this.y = _y;
    }
}

var score = 0;
var hVel = 0; // Horizontal velocity: Left -1 , Right 1
var vVel = 0; // Vertical velocity: Down -1 , Up 1
var snake = new Array();

var playAreaColumns, 
    playAreaRows, 
    centerColumn, 
    centerRow,
    playAreaOriginX,
    playAreaOriginY,
    foodX,
    foodY;

var isGameOver = false;

function initGameBoard(){
	let screenWidth = document.documentElement.clientWidth;
    let screenHeight = document.documentElement.clientHeight;
    initPlayArea(screenWidth, screenHeight);
}

function initPlayArea(screenWidth, screenHeight){
	// init whole canvas area
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    
    ctx.fillStyle = screenColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

	// explicitly convert to integer: because decimal point number could be render pixel blur
    gameAreaColumns = Math.floor((screenWidth - marginOfPlayArea.right - marginOfPlayArea.left) / BX.width);
    gameAreaRows = Math.floor((screenHeight - heightOfScoreArea - marginOfPlayArea.top - marginOfPlayArea.bottom) / BX.height);
    playAreaColumns = gameAreaColumns - 2;
    playAreaRows = gameAreaRows - 2;
    centerColumn = Math.floor(playAreaColumns/2);
    centerRow = Math.floor(playAreaRows/2);
    
    let gameAreaWidth = gameAreaColumns * BX.width;
    let gameAreaHeight = gameAreaRows * BX.height;
    let gameAreaOriginX = Math.floor((screenWidth - gameAreaWidth) / 2);
    let gameAreaOriginY = Math.floor((screenHeight - heightOfScoreArea - gameAreaHeight) / 2) + heightOfScoreArea;

    // draw game area background
    ctx.fillStyle = playAreaBorderColor;
    ctx.fillRect(gameAreaOriginX, gameAreaOriginY, gameAreaWidth, gameAreaHeight);

    // draw play area : snake moveable area
    playAreaOriginX = gameAreaOriginX + BX.width;
    playAreaOriginY = gameAreaOriginY + BX.height;
    ctx.fillStyle = gameBoardColor;
    ctx.fillRect(playAreaOriginX, playAreaOriginY, playAreaColumns * BX.width, playAreaRows * BX.height);
    
    // Score
    drawScore(score);
}

function initSnake(){
    hVel = vVel = 0;
    let initX = centerColumn * BX.width + playAreaOriginX;
    let initY = centerRow * BX.height + playAreaOriginY;

    snake = new Array();
    snake[0] = new Snake(
        initX,
        initY
    );
    drawHead(initX, initY);
}

function handleCursorKey(e){
    switch(e.keyCode){
        case 37: // left
            if (hVel != 1){
                hVel = -1;
                vVel = 0;
            }
            break;
        case 38: // up
            if (vVel != 1){
                hVel = 0;
                vVel = -1;
            }
            break;
        case 39: // right
            if (hVel != -1){
                hVel = 1;
                vVel = 0;
            }
            break;
        case 40: // down
            if (vVel != -1){
                hVel = 0;
                vVel = 1;
            }
            break;
    }
}

function drawHead(x, y){
    drawBox(x, y, BX.headColor);
}

function drawTail(x, y){
    drawBox(x, y, BX.tailColor);
}

function drawBox(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BX.width, BX.height);
}

function removeBox(x, y){
    drawBox(x, y, gameBoardColor);
}

function addTail(){
    let snakeLength = snake.length;
    let tailX = snake[snakeLength - 1].x;
    let tailY = snake[snakeLength - 1].y;
    for (let i=1; i <= addTailNumber; i++){
        snake.push(new Snake(
            tailX,
            tailY
        ));
    }
}

function setFood(){
    removeBox(foodX, foodY);
    
    // find new food position
    let foodSnakeConflict = false;
    let tempX, tempY;
    do {
        tempX = playAreaOriginX + Math.floor(Math.random() * playAreaColumns) * BX.width;
        tempY = playAreaOriginY + Math.floor(Math.random() * playAreaRows) * BX.height;

        for (let idx in snake){
            if (snake[idx].x == tempX && snake[idx].y == tempY){
                foodSnakeConflict = true;
                break;
            }
        }
    } while (foodSnakeConflict);

    foodX = tempX;
    foodY = tempY;

    ctx.beginPath();
    ctx.moveTo(foodX,foodY);
    ctx.lineTo(foodX + BX.width, foodY + BX.height);
    ctx.moveTo(foodX + BX.width, foodY);
    ctx.lineTo(foodX, foodY + BX.height);
    ctx.closePath();
    ctx.strokeStyle=foodMarkColor;
    ctx.stroke();
}

function drawSnake(){
    if (!isGameOver){
        let prevHeadX = snake[0].x;
        let prevHeadY = snake[0].y;

        let newHeadX = prevHeadX + hVel * BX.width;
        let newHeadY = prevHeadY + vVel * BX.height;
        
        if (hVel != 0 || vVel != 0){
            // draw head in new place
            snake[0].x = newHeadX;
            snake[0].y = newHeadY;
            drawHead(newHeadX, newHeadY);
            removeBox(prevHeadX, prevHeadY);

            // draw tails
            let snakeLength = snake.length;
            if (snakeLength > 1){
                let lastTailX = snake[snakeLength-1].x;
                let lastTailY = snake[snakeLength-1].y;

                snake[snakeLength-1].x = prevHeadX;
                snake[snakeLength-1].y = prevHeadY;

                let head = snake.shift();
                if (snakeLength > 2){
                    snake.unshift(snake.pop());
                }
                snake.unshift(head);

                drawTail(prevHeadX, prevHeadY);
                if (!(snake[snakeLength - 1].x == lastTailX && snake[snakeLength - 1].y == lastTailY)){
                    removeBox(lastTailX, lastTailY);
                }
            }
        }
    }
}

function checkFoodCatch(){
    if (snake[0].x == foodX && snake[0].y == foodY){
        drawScore(++score);
        setFood();
        addTail();
    }
}

function drawScore(_score){
    ctx.fillStyle = screenColor;
    ctx.fillRect(playAreaOriginX, marginOfPlayArea.top, playAreaOriginX + playAreaColumns * BX.width, playAreaOriginY - BX.height - marginOfPlayArea.top);

    ctx.fillStyle = '#000000';
    ctx.font = scoreFontSize + 'px serif';
    ctx.fillText('Score:' + _score, marginOfPlayArea.left, marginOfPlayArea.top + scoreFontSize);
}

function checkCollision(){
    if (checkBorderCollision() || checkSnakeBodyCollision()){
        gameOver();
    }
}

function checkBorderCollision(){
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    if (snakeX < playAreaOriginX || snakeX >= playAreaOriginX + playAreaColumns * BX.width ||
        snakeY < playAreaOriginY || snakeY >= playAreaOriginY + playAreaRows * BX.height) {
        return true;
    }
}

function checkSnakeBodyCollision(){
    let headX = snake[0].x;
    let headY = snake[0].y;
    let snakeLength = snake.length;
    for (let i=1; i<snakeLength; i++){
        if (snake[i].x == headX && snake[i].y == headY){
            return true;
        }
    }
}

function gameOver(){
    isGameOver = true;
    clearInterval(gameTimer);
    alert("Game Over!!\nPlease reload/refresh to try again");
}

function setGameInterval(){
    return setInterval(() => {
        checkCollision();
        checkFoodCatch();
        drawSnake();
    }, 150);
}
/***************************************
** End of
** Definition
****************************************/


/***************************************
** Event Handler Registration
****************************************/
document.addEventListener('keyup', this.handleCursorKey);


/***************************************
** Run program
****************************************/
window.onload = function() {
	initGameBoard();
    initSnake();
    setFood();
}

window.onresize = function(){
    clearInterval(gameTimer);
    initGameBoard();
    initSnake();
    setFood();
    gameTimer = setGameInterval();
}

var gameTimer = setGameInterval();
