KEY_A = 65;
KEY_W = 87;
KEY_D = 68;
KEY_S = 83;

ARROW_LEFT = 37;
ARROW_UP = 38;
ARROW_RIGHT = 39;
ARROW_DOWN = 40;

game = null;
food = null;
board = null;
snake = null;
snakeStartLen = 3;
keypressQueue = [];

var fps = 10;
var rows = 20;
var columns = 20;
var canvas = document.getElementById('canvas')
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
                var tile = board.grid[this.x][this.y]
                if (tile.isSnake && snake.direction) {lose()}
                else if (!tile.isSnake && tile.isFood) {
                    food = false;
                    snake.length += 1;
                    board.grid[this.x][this.y].setSnake()
                }
                else if (!tile.isSnake) {
                    board.grid[this.x][this.y].setSnake()
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
        this.generateBoard()
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
    keypressQueue.push(e.which);
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
    Object.keys(board.grid).forEach(row => {
        Object.keys(board.grid[row]).forEach(col => {
            tile = board.grid[row][col];
            tile.setEmpty();
        });
    });
}

function updateBoard() {
    Object.keys(board.grid).forEach(row => {
        Object.keys(board.grid[row]).forEach(col => {
            tile = board.grid[row][col];

            if (!food) {
                spawnFood();
            }
            if (tile.duration != null) {
                tile.duration += 1;
            }
            if (tile.isSnake) {
                if (tile.duration > (snake.length)) { tile.setEmpty(); }
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

    var tmp_x = snake.x;
    var tmp_y = snake.y;

    if (keypressQueue) {
        var keycode = keypressQueue[0];
        keypressQueue = [];

        
        // if (keypressQueue.length == 1) {
        //     var keycode = keypressQueue[0];
        //     keypressQueue = [];

        //     if (keycode == KEY_W || keycode == ARROW_UP) {
        //         if (snake.direction != 'N' && snake.direction != 'S') {
        //             snake.direction = 'N';
        //         }
        //     } else if (keycode == KEY_S || keycode == ARROW_DOWN) {
        //         if (snake.direction != 'S' && snake.direction != 'N') {
        //             snake.direction = 'S';
        //         }
        //     } else if (keycode == KEY_A || keycode == ARROW_LEFT) {
        //         if (snake.direction != 'E' && snake.direction != 'W') {
        //             snake.direction = 'E';
        //         }
        //     } else if (keycode == KEY_D || keycode == ARROW_RIGHT) {
        //         if (snake.direction != 'W' && snake.direction != 'E') {
        //             snake.direction = 'W';
        //         }
        //     }
        // } else if (keypressQueue > 1) {
        //     var keycode1 = keypressQueue[0];
        //     var keycode2 = keypressQueue[1];
        // }

        if (keycode == KEY_W || keycode == ARROW_UP) {
            if (snake.direction != 'N' && snake.direction != 'S') {
                snake.direction = 'N';
            }
        } else if (keycode == KEY_S || keycode == ARROW_DOWN) {
            if (snake.direction != 'S' && snake.direction != 'N') {
                snake.direction = 'S';
            }
        } else if (keycode == KEY_A || keycode == ARROW_LEFT) {
            if (snake.direction != 'E' && snake.direction != 'W') {
                snake.direction = 'E';
            }
        } else if (keycode == KEY_D || keycode == ARROW_RIGHT) {
            if (snake.direction != 'W' && snake.direction != 'E') {
                snake.direction = 'W';
            }
        }
    }

    if (snake.direction == 'N') { snake.y -= 1; }
    if (snake.direction == 'S') { snake.y += 1; }
    if (snake.direction == 'E') { snake.x -= 1; }
    if (snake.direction == 'W') { snake.x += 1; }

    snake.update(board);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnFood() {
    var possibleFootTiles = []

    Object.keys(board.grid).forEach(row => {
        Object.keys(board.grid[row]).forEach(col => {
            tile = board.grid[row][col];
            if (tile.isEmpty && !tile.isSnake && !tile.isFood) {
                possibleFootTiles.push(tile)
            }
        });
    });

    if (possibleFootTiles.length != 0) {
        console.log(possibleFootTiles);
        var chosenTile = possibleFootTiles[Math.floor(Math.random() * possibleFootTiles.length)];
        if (!chosenTile.isEmpty) {
            alert("ERROR");
        }
        chosenTile.setFood();
        food = true;
    } else { win() }
}

function win() {
    alert('You won! Congrats!');
    clearInterval(game);
    clearBoard();
    main();
}

function lose(name) {
    console.log(name);
    alert('You lose!');
    clearInterval(game);
    clearBoard();
    main();
}

function error() {
    alert('An unexpected error occurred :(');
    clearInterval(game);
    clearBoard();
    main();
}

function forceWin() {
    Object.keys(board.grid).forEach(row => {
        Object.keys(board.grid[row]).forEach(col => {
            tile = board.grid[row][col];
            tile.setSnake();
        });
    });
}

function gameLoop() {
    updateSnake();
    updateBoard();
}

async function main() {
    snake = new Snake(snakeStartLen);

    if (typeof (canvas.getContext) !== undefined) {
        cx = canvas.getContext('2d');
        snake.x = 0;
        snake.y = 0;
        snake.direction = 'W';
    }

    // Wait for keypress before starting
    board = new Board(rows, columns);

    spawnFood();
    updateSnake();
    updateBoard();
    const readKey = () => new Promise(resolve => window.addEventListener('keypress', resolve, { once: true }));

    (async function () {
        const x = await readKey();
        game = setInterval(gameLoop, 1000 / fps);
    }());
}

main();
