

    // --- SNAKE GAME LOGIC ---
    const canvas = document.getElementById('gameCanvas');

    
    document.body.style.overflow = 'hidden';

    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const gameOverScreen = document.getElementById('gameOver');
    const playAgainButton = document.getElementById('playAgain');

    const gridSize = 20;
    let snake = [{ x: 200, y: 200 }];
    let food = {};
    let score = 0;
    let dx = gridSize;
    let dy = 0;
    let changingDirection = false;
    let gameSpeed = 100; // Milliseconds per frame update
    let lastRenderTime = null;

    function startGame() {
        snake = [{ x: 200, y: 200 }];
        score = 0;
        dx = gridSize;
        dy = 0;
        scoreElement.textContent = score;
        gameOverScreen.classList.add('hidden');
        createFood();
        lastRenderTime = null; // Reset render time for new game
        requestAnimationFrame(main);
    }
    
    function main(timestamp) {
        if (didGameEnd()) {
            gameOverScreen.classList.remove('hidden');
            return;
        }

        requestAnimationFrame(main);

        if (lastRenderTime === null) {
            lastRenderTime = timestamp;
        }

        const secondsSinceLastRender = (timestamp - lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / (gameSpeed / 1000)) return; // Control game speed
        lastRenderTime = timestamp;

        changingDirection = false;
        
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
    }

    function clearCanvas() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const bgColor = isDarkMode ? "#1e1e1e" : "#f8f9fa";

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnakePart(part) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const snakeColor = isDarkMode ? '#61dafb' : '#0d6efd';
        const strokeColor = isDarkMode ? "#121212" : "#ffffff";

        ctx.fillStyle = snakeColor;
        ctx.strokeStyle = strokeColor;
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);
    }

    function drawSnake() {
        snake.forEach(drawSnakePart);
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        
        const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
        if (didEatFood) {
            score += 10;
            scoreElement.textContent = score;
            createFood();
        } else {
            snake.pop();
        }
    }

    function didGameEnd() {
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
        }
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x >= canvas.width;
        const hitTopWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y >= canvas.height;
        return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    }

    function randomPosition(min, max) {
        return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
    }

    function createFood() {
        food.x = randomPosition(0, canvas.width - gridSize);
        food.y = randomPosition(0, canvas.height - gridSize);
        snake.forEach(function isFoodOnSnake(part) {
            if (part.x == food.x && part.y == food.y) createFood();
        });
    }

    function drawFood() {
        ctx.fillStyle = '#90EE90';
        ctx.strokeStyle = '#006400';
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        ctx.strokeRect(food.x, food.y, gridSize, gridSize);
    }

    function changeDirection(event) {

        
        const validKeys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
        if (!validKeys.includes(event.key) || changingDirection) {
            return;
        }
        
        event.preventDefault();
        changingDirection = true;

        const GOING_UP = dy === -gridSize;
        const GOING_DOWN = dy === gridSize;
        const GOING_RIGHT = dx === gridSize;
        const GOING_LEFT = dx === -gridSize;

        if (event.key === "ArrowLeft" && !GOING_RIGHT) { dx = -gridSize; dy = 0; }
        if (event.key === "ArrowUp" && !GOING_DOWN) { dx = 0; dy = -gridSize; }
        if (event.key === "ArrowRight" && !GOING_LEFT) { dx = gridSize; dy = 0; }
        if (event.key === "ArrowDown" && !GOING_UP) { dx = 0; dy = gridSize; }
    }

    window.addEventListener("keydown", changeDirection, true); // Use capture to be first
    playAgainButton.addEventListener('click', startGame);

    startGame();
});