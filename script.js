const SHAPES = [
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    [
        [0,1,0],  
        [0,1,0],  
        [1,1,0]   
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [1,1],
        [1,1],
    ]
];

const COLORS = [
    "#9b5fe0", "#16a4d8", "#60dbe8", "#8bd346", 
    "#efdf48", "#f9a52c", "#d64e12"
];

const ROWS = 20;
const COLS = 10;

let canvas = document.querySelector("#tetris");
let ctx = canvas.getContext("2d");
ctx.scale(30,30);

let pieceOBj = null;
let grid = generateGrid();

// Track touch start coordinates
let startX = 0;
let startY = 0;

function generateRandomPiece() {
    let ran = Math.floor(Math.random()*7);
    let piece = SHAPES[ran];
    let colorIndex = ran + 1;
    let x = 4;
    let y = 0;
    return { piece, x, y, colorIndex };
}

setInterval(newGameState, 500);

function newGameState() {
    checkGrid();
    if (pieceOBj == null) {
        pieceOBj = generateRandomPiece();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let filledRows = [];
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].every(cell => cell > 0)) {
            filledRows.push(i);
        }
    }
    filledRows.forEach(rowIndex => {
        grid.splice(rowIndex, 1);
        grid.unshift(new Array(COLS).fill(0));
    });
}

function renderPiece() {
    let piece = pieceOBj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                ctx.fillStyle = COLORS[pieceOBj.colorIndex];
                ctx.fillRect(pieceOBj.x + j, pieceOBj.y + i, 1, 1);
            }
        }
    }
}

function moveDown() {
    if (!collision(pieceOBj.x, pieceOBj.y + 1))
        pieceOBj.y += 1;
    else {
        for (let i = 0; i < pieceOBj.piece.length; i++) {
            for (let j = 0; j < pieceOBj.piece[i].length; j++) {
                if (pieceOBj.piece[i][j] == 1) {
                    let p = pieceOBj.x + j;
                    let q = pieceOBj.y + i;
                    if (q >= 0 && q < ROWS && p >= 0 && p < COLS) {
                        grid[q][p] = pieceOBj.colorIndex;
                    }
                }
            }
        }
        if (grid[0].some(cell => cell > 0)) {
            alert("Game Over!!!");
            grid = generateGrid();
            pieceOBj = null;
        }
        pieceOBj = null;
    }
    renderGrid();
}

function moveLeft() {
    if (!collision(pieceOBj.x - 1, pieceOBj.y))
        pieceOBj.x -= 1;
    renderGrid();
}

function moveRight() {
    if (!collision(pieceOBj.x + 1, pieceOBj.y))
        pieceOBj.x += 1;
    renderGrid();
}

function rotate() {
    let rotatedPiece = [];
    let piece = pieceOBj.piece;

    // Create an empty matrix to hold the rotated piece
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }

    // Rotate piece 90 degrees clockwise
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }

    // Reverse each row to complete the rotation
    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }

    // Check for collision before applying rotation
    if (!collision(pieceOBj.x, pieceOBj.y, rotatedPiece)) {
        pieceOBj.piece = rotatedPiece;
    }
    renderGrid();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || pieceOBj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    if (grid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push([]);
        for (let j = 0; j < COLS; j++) {
            grid[i].push(0);
        }
    }
    return grid;
}

function renderGrid() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    renderPiece();
}

document.addEventListener("keydown", function (e) {
    let key = e.code;
    if (key == "ArrowDown") {
        moveDown();
    } else if (key == "ArrowLeft") {
        moveLeft();
    } else if (key == "ArrowRight") {
        moveRight();
    } else if (key == "ArrowUp") {
        rotate();
    }
});

// Detect touch start
document.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

// Detect touch end and calculate swipe direction
document.addEventListener("touchend", function (e) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Determine swipe direction based on the difference
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 30) {
            moveRight(); // Swipe right
        } else if (diffX < -30) {
            moveLeft(); // Swipe left
        }
    } else {
        // Vertical swipe
        if (diffY > 30) {
            moveDown(); // Swipe down
        } else if (diffY < -30) {
            rotate(); // Swipe up
        }
    }
});
