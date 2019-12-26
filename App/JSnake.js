KEY_A = 65;
KEY_W = 87;
KEY_D = 68;
KEY_S = 83;

ARROW_LEFT = 37;
ARROW_UP = 38;
ARROW_RIGHT = 39;
ARROW_DOWN = 40;

GAME = null;
FOOD = null;
BOARD = null;
SNAKE = null;
SNAKESTARTLEN = 3;
KEYPRESSQUEUE = [];

var fps = 10;
var rows = 20;
var columns = 20;
var canvas = document.getElementById('canvas');
var square_side = Math.sqrt((canvas.width * canvas.height) / (rows * columns));

document.addEventListener('keydown', setKeyCode);

class Snake {
    constructor(length) {
        this.direction = null;
        this.length = length;
        this.x = 2;
        this.y = 2;
    }

    update(board) {
        if (board.grid[this.x]) {
            if (board.grid[this.x][this.y]) {
                var tile = board.grid[this.x][this.y];
                if (tile.isSnake && SNAKE.direction) {lose();}
                else if (!tile.isSnake && tile.isFood) {
                    FOOD = false;
                    SNAKE.length += 1;
                    board.grid[this.x][this.y].setSnake();
                }
                else if (!tile.isSnake) {
                    board.grid[this.x][this.y].setSnake();
                }
            } else {lose();}
        } else {lose();}
    }
}

class Board {
    constructor(row, col) {
        this.grid = {};
        this.row = row;
        this.col = col;
        this.generateBoard();
    }

    generateBoard() {
        for (var i = 0; i < this.row; i++) {
            this.grid[i] = {};
            for (var j = 0; j < this.col; j++) {
                var tile = new Tile();
                tile.xy = [i, j];
                tile.isEmpty = true;
                tile.isSnake = false;
                tile.isFood = false;
                this.grid[i][j] = tile;
            }
        }
    }
}

class Tile {
    constructor() {
        this.xy = null;
        this.isEmpty = null;
        this.isSnake = null;
        this.isFood = null;
        this.duration = null;
    }
    setEmpty() {
        this.isEmpty = true;
        this.isSnake = false;
        this.isFood = false;
        this.duration = null;
    }
    setSnake() {
        this.isEmpty = false;
        this.isSnake = true;
        this.isFood = false;
        this.duration = 0;
    }
    setFood() {
        this.isEmpty = false;
        this.isSnake = false;
        this.isFood = true;
        this.duration = null;
    }
}

function setKeyCode(e) {
    KEYPRESSQUEUE.push(e.which);
}

function fillBlock(row, column, color) {
    cx.fillStyle = color;
    cx.fillRect(square_side * row, square_side * column, square_side, square_side);
}

function clearBlock(row, column) {
    cx.fillStyle = 'black';
    cx.fillRect(square_side * row, square_side * column, square_side, square_side);
}

function clearBoard() {
    Object.keys(BOARD.grid).forEach(row => {
        Object.keys(BOARD.grid[row]).forEach(col => {
            tile = BOARD.grid[row][col];
            tile.setEmpty();
        });
    });
}

function updateBoard() {
    Object.keys(BOARD.grid).forEach(row => {
        Object.keys(BOARD.grid[row]).forEach(col => {
            tile = BOARD.grid[row][col];

            if (!FOOD) {
                spawnFood();
            }
            if (tile.duration != null) {
                tile.duration += 1;
            }
            if (tile.isSnake) {
                if (tile.duration > (SNAKE.length)) { tile.setEmpty(); }
            }

            if (tile.isEmpty && !tile.isSnake && !tile.isFood) { fillBlock(row, col, 'black'); }
            else if (!tile.isEmpty && tile.isSnake && !tile.isFood) { fillBlock(row, col, 'green'); }
            else if (!tile.isEmpty && !tile.isSnake && tile.isFood) { fillBlock(row, col, 'red'); }
            else {
                console.log(`ERROR: ${row}, ${col}`);
                console.log(tile);
                error();
            }
        });
    });
}

function updateSnake(e) {

    if (KEYPRESSQUEUE) {
        var keycode = KEYPRESSQUEUE[0];
        KEYPRESSQUEUE = [];

        if (keycode == KEY_W || keycode == ARROW_UP) {
            if (SNAKE.direction != 'N' && SNAKE.direction != 'S') {
                SNAKE.direction = 'N';
            }
        } else if (keycode == KEY_S || keycode == ARROW_DOWN) {
            if (SNAKE.direction != 'S' && SNAKE.direction != 'N') {
                SNAKE.direction = 'S';
            }
        } else if (keycode == KEY_A || keycode == ARROW_LEFT) {
            if (SNAKE.direction != 'E' && SNAKE.direction != 'W') {
                SNAKE.direction = 'E';
            }
        } else if (keycode == KEY_D || keycode == ARROW_RIGHT) {
            if (SNAKE.direction != 'W' && SNAKE.direction != 'E') {
                SNAKE.direction = 'W';
            }
        }
    }

    if (SNAKE.direction == 'N') { SNAKE.y -= 1; }
    if (SNAKE.direction == 'S') { SNAKE.y += 1; }
    if (SNAKE.direction == 'E') { SNAKE.x -= 1; }
    if (SNAKE.direction == 'W') { SNAKE.x += 1; }

    SNAKE.update(BOARD);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnFood() {
    var possibleFootTiles = [];

    Object.keys(BOARD.grid).forEach(row => {
        Object.keys(BOARD.grid[row]).forEach(col => {
            tile = BOARD.grid[row][col];
            if (tile.isEmpty && !tile.isSnake && !tile.isFood) {
                possibleFootTiles.push(tile);
            }
        });
    });

    if (possibleFootTiles.length != 0) {
        var chosenTile = possibleFootTiles[Math.floor(Math.random() * possibleFootTiles.length)];
        if (!chosenTile.isEmpty) {
            alert("ERROR");
        }
        chosenTile.setFood();
        FOOD = true;
    } else {win();}
}

function win() {
    alert('You won! Congrats!');
    clearInterval(GAME);
    clearBoard();
    main();
}

function lose() {
    alert('You lose!');
    clearInterval(GAME);
    clearBoard();
    main();
}

function error() {
    alert('An unexpected error occurred :(');
    clearInterval(GAME);
    clearBoard();
    main();
}

function forceWin() {
    Object.keys(BOARD.grid).forEach(row => {
        Object.keys(BOARD.grid[row]).forEach(col => {
            tile = BOARD.grid[row][col];
            tile.setSnake();
        });
    });
}

function gameLoop() {
    updateSnake();
    updateBoard();
}

async function main() {
    SNAKE = new Snake(SNAKESTARTLEN);

    if (typeof (canvas.getContext) !== undefined) {
        cx = canvas.getContext('2d');
        SNAKE.x = 0;
        SNAKE.y = 0;
        SNAKE.direction = 'W';
    }

    // Wait for keypress before starting
    BOARD = new Board(rows, columns);

    spawnFood();
    updateSnake();
    updateBoard();
    const readKey = () => new Promise(resolve => window.addEventListener('keypress', resolve, { once: true }));

    (async function () {
        const x = await readKey();
        GAME = setInterval(gameLoop, 1000 / fps);
    }());
}

main();
