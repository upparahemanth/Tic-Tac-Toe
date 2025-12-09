/* ============================================================
   DOM ELEMENTS
============================================================ */

// Popups
const modePopup = document.getElementById("modePopup");
const pvpNamePopup = document.getElementById("pvpNamePopup");
const pvcNamePopup = document.getElementById("pvcNamePopup");
const difficultyPopup = document.getElementById("difficultyPopup");
const winnerPopup = document.getElementById("winnerPopup");

// Buttons
const pvpBtn = document.getElementById("pvpBtn");
const pvcBtn = document.getElementById("pvcBtn");

const startPvpBtn = document.getElementById("startPvpBtn");
const nextToDifficultyBtn = document.getElementById("nextToDifficultyBtn");

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const closeWinnerBtn = document.getElementById("closeWinnerBtn");
const restartBtn = document.getElementById("restartBtn");
const modeToggle = document.getElementById("modeToggle");

// Player name inputs
const pvpPlayerXName = document.getElementById("pvpPlayerXName");
const pvpPlayerOName = document.getElementById("pvpPlayerOName");

const pvcPlayerXName = document.getElementById("pvcPlayerXName");
const pvcPlayerOName = document.getElementById("pvcPlayerOName");

// Game board
const cells = document.querySelectorAll(".cell");
const currentPlayerText = document.getElementById("currentPlayer");

// Scoreboard labels
const labelX = document.getElementById("labelX");
const labelO = document.getElementById("labelO");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");

// Winner message
const winnerMessage = document.getElementById("winnerMessage");

/* ============================================================
   GAME VARIABLES
============================================================ */

let playerX = "Player X";
let playerO = "Player O";
let aiName = "Bantii";

let currentPlayer = "X";
let gameMode = "";        // "PVP" or "PVC"
let difficulty = "EASY";  // AI difficulty

let board = ["", "", "", "", "", "", "", "", ""];
let scores = { X: 0, O: 0 };

/* ============================================================
   INITIAL LOAD → SHOW MODE POPUP
============================================================ */
window.onload = () => {
    modePopup.style.display = "flex";
};

/* ============================================================
   MODE SELECTION
============================================================ */

pvpBtn.onclick = () => {
    gameMode = "PVP";
    modePopup.style.display = "none";
    pvpNamePopup.style.display = "flex";
};

pvcBtn.onclick = () => {
    gameMode = "PVC";
    modePopup.style.display = "none";
    pvcNamePopup.style.display = "flex";

    pvcPlayerOName.value = "Bantii"; // Default AI name
};

/* ============================================================
   PvP NAME ENTRY
============================================================ */

startPvpBtn.onclick = () => {
    playerX = pvpPlayerXName.value.trim() || "Player X";
    playerO = pvpPlayerOName.value.trim() || "Player O";

    labelX.textContent = `X: ${playerX}`;
    labelO.textContent = `O: ${playerO}`;

    pvpNamePopup.style.display = "none";
};

/* ============================================================
   PvC NAME ENTRY → GO TO DIFFICULTY POPUP
============================================================ */

nextToDifficultyBtn.onclick = () => {
    playerX = pvcPlayerXName.value.trim() || "Player X";
    aiName = pvcPlayerOName.value.trim() || "Bantii";

    labelX.textContent = `X: ${playerX}`;
    labelO.textContent = `O: ${aiName}`;

    pvcNamePopup.style.display = "none";
    difficultyPopup.style.display = "flex";
};

/* ============================================================
   DIFFICULTY SELECTION
============================================================ */

easyBtn.onclick = () => selectDifficulty("EASY");
mediumBtn.onclick = () => selectDifficulty("MEDIUM");
hardBtn.onclick = () => selectDifficulty("HARD");

function selectDifficulty(level) {
    difficulty = level;
    difficultyPopup.style.display = "none";
}

/* ============================================================
   BOARD CLICK HANDLING
============================================================ */

cells.forEach(cell => {
    cell.addEventListener("click", () => handlePlayerMove(cell));
});

function handlePlayerMove(cell) {
    const index = cell.dataset.index;

    if (board[index] !== "" || winnerPopup.style.display === "flex") return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add("filled");

    // Click animation
    cell.classList.add("clicked");
    setTimeout(() => {
        cell.classList.remove("clicked");
        cell.classList.add("clicked-end");
    }, 150);

    const win = checkWinner();
    if (win) return endGame(win);

    if (board.every(c => c !== "")) return endGame(null);

    switchPlayer();

    if (gameMode === "PVC" && currentPlayer === "O") {
        setTimeout(aiMove, 400);
    }
}

/* ============================================================
   SWITCH PLAYER
============================================================ */

function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    currentPlayerText.textContent = currentPlayer;
}

/* ============================================================
   AI MOVE LOGIC
============================================================ */

function aiMove() {
    let move;

    if (difficulty === "EASY") move = getRandomMove();
    if (difficulty === "MEDIUM") move = getMediumMove();
    if (difficulty === "HARD") move = getBestMove();

    if (move == null) return;

    board[move] = "O";
    const cell = cells[move];

    cell.textContent = "O";
    cell.classList.add("filled");

    cell.classList.add("clicked");
    setTimeout(() => {
        cell.classList.remove("clicked");
        cell.classList.add("clicked-end");
    }, 150);

    const win = checkWinner();
    if (win) return endGame(win);

    if (board.every(c => c !== "")) return endGame(null);

    switchPlayer();
}

/* EASY = Random Move */
function getRandomMove() {
    let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
}

/* MEDIUM = Block Player + Random */
function getMediumMove() {
    for (let [a, b, c] of winningCombos) {
        if (board[a]==="X" && board[b]==="X" && board[c]==="") return c;
        if (board[a]==="X" && board[c]==="X" && board[b]==="") return b;
        if (board[b]==="X" && board[c]==="X" && board[a]==="") return a;
    }
    return getRandomMove();
}

/* HARD = Minimax */
function getBestMove() {
    return minimax(board.slice(), "O").index;
}

function minimax(newBoard, player) {
    let empty = newBoard.map((v,i)=>v===""?i:null).filter(v=>v!==null);

    if (checkWinFor("X", newBoard)) return { score: -10 };
    if (checkWinFor("O", newBoard)) return { score: 10 };
    if (empty.length === 0) return { score: 0 };

    let moves = [];

    for (let i of empty) {
        let move = { index: i };
        newBoard[i] = player;

        if (player === "O") move.score = minimax(newBoard, "X").score;
        else move.score = minimax(newBoard, "O").score;

        newBoard[i] = "";
        moves.push(move);
    }

    return player === "O"
        ? moves.reduce((best, m) => (m.score > best.score ? m : best))
        : moves.reduce((best, m) => (m.score < best.score ? m : best));
}

/* ============================================================
   WIN CHECK
============================================================ */

const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function checkWinner() {
    for (let combo of winningCombos) {
        let [a,b,c] = combo;
        if (board[a] && board[a]===board[b] && board[a]===board[c]) return combo;
    }
    return null;
}

function checkWinFor(player, arr) {
    return winningCombos.some(([a,b,c]) => arr[a]===player && arr[b]===player && arr[c]===player);
}

/* ============================================================
   END GAME
============================================================ */

function endGame(combo) {
    if (combo) {
        combo.forEach(i => cells[i].classList.add("winner"));

        let winnerName =
            currentPlayer === "X"
                ? playerX
                : gameMode === "PVC"
                ? aiName
                : playerO;

        winnerMessage.textContent = `${winnerName} Won!`;

        updateScore();
    } else {
        winnerMessage.textContent = "It's a Draw!";
    }

    winnerPopup.style.display = "flex";
}

function updateScore() {
    if (currentPlayer === "X") {
        scores.X++;
        scoreX.textContent = scores.X;
    } else {
        scores.O++;
        scoreO.textContent = scores.O;
    }
}

/* ============================================================
   RESET GAME
============================================================ */

restartBtn.onclick = resetGame;

function resetGame() {
    board = ["","","","","","","","",""];
    currentPlayer = "X";
    currentPlayerText.textContent = "X";

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("filled", "winner", "clicked-end");
    });
}

/* Close Winner Popup */
closeWinnerBtn.onclick = () => {
    winnerPopup.style.display = "none";
    resetGame();
};

/* ============================================================
   LIGHT / DARK MODE
============================================================ */

modeToggle.onclick = () => {
    document.body.classList.toggle("light-mode");
    modeToggle.textContent =
        document.body.classList.contains("light-mode")
            ? "Dark Mode"
            : "Light Mode";
};
