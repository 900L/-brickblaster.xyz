const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// 设置画布大小
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = canvas.width * 0.6;
}

// 游戏对象
const game = {
    score: 0,
    isRunning: false,
    paddle: {
        width: 100,
        height: 10,
        x: 0,
        y: 0,
        speed: 8
    },
    ball: {
        x: 0,
        y: 0,
        radius: 8,
        speed: 5,
        dx: 0,
        dy: 0
    },
    bricks: [],
    brickConfig: {
        rows: 5,
        cols: 8,
        width: 0,
        height: 20,
        padding: 10,
        offsetTop: 30,
        offsetLeft: 0
    }
};

// 初始化游戏
function initGame() {
    resizeCanvas();
    
    // 设置挡板初始位置
    game.paddle.x = (canvas.width - game.paddle.width) / 2;
    game.paddle.y = canvas.height - game.paddle.height - 10;
    
    // 设置球的初始位置
    game.ball.x = canvas.width / 2;
    game.ball.y = game.paddle.y - game.ball.radius;
    game.ball.dx = game.ball.speed;
    game.ball.dy = -game.ball.speed;
    
    // 计算砖块大小和位置
    game.brickConfig.width = (canvas.width - (game.brickConfig.cols + 1) * game.brickConfig.padding) / game.brickConfig.cols;
    game.brickConfig.offsetLeft = (canvas.width - (game.brickConfig.cols * (game.brickConfig.width + game.brickConfig.padding) - game.brickConfig.padding)) / 2;
    
    // 创建砖块
    createBricks();
    
    // 重置分数
    game.score = 0;
    scoreElement.textContent = game.score;
}

// 创建砖块
function createBricks() {
    game.bricks = [];
    for (let row = 0; row < game.brickConfig.rows; row++) {
        for (let col = 0; col < game.brickConfig.cols; col++) {
            game.bricks.push({
                x: col * (game.brickConfig.width + game.brickConfig.padding) + game.brickConfig.offsetLeft,
                y: row * (game.brickConfig.height + game.brickConfig.padding) + game.brickConfig.offsetTop,
                width: game.brickConfig.width,
                height: game.brickConfig.height,
                status: 1
            });
        }
    }
}

// 绘制游戏对象
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制挡板
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
    
    // 绘制球
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5722';
    ctx.fill();
    ctx.closePath();
    
    // 绘制砖块
    game.bricks.forEach(brick => {
        if (brick.status === 1) {
            ctx.fillStyle = '#2196F3';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}

// 更新游戏状态
function update() {
    // 移动球
    game.ball.x += game.ball.dx;
    game.ball.y += game.ball.dy;
    
    // 碰撞检测 - 墙壁
    if (game.ball.x + game.ball.radius > canvas.width || game.ball.x - game.ball.radius < 0) {
        game.ball.dx = -game.ball.dx;
    }
    if (game.ball.y - game.ball.radius < 0) {
        game.ball.dy = -game.ball.dy;
    }
    
    // 碰撞检测 - 挡板
    if (game.ball.y + game.ball.radius > game.paddle.y &&
        game.ball.x > game.paddle.x &&
        game.ball.x < game.paddle.x + game.paddle.width) {
        game.ball.dy = -game.ball.speed;
        // 根据击中挡板的位置改变反弹角度
        const hitPoint = (game.ball.x - game.paddle.x) / game.paddle.width;
        game.ball.dx = (hitPoint - 0.5) * game.ball.speed * 2;
    }
    
    // 碰撞检测 - 砖块
    game.bricks.forEach(brick => {
        if (brick.status === 1) {
            if (game.ball.x > brick.x &&
                game.ball.x < brick.x + brick.width &&
                game.ball.y > brick.y &&
                game.ball.y < brick.y + brick.height) {
                game.ball.dy = -game.ball.dy;
                brick.status = 0;
                game.score += 10;
                scoreElement.textContent = game.score;
            }
        }
    });
    
    // 游戏结束检测
    if (game.ball.y + game.ball.radius > canvas.height) {
        gameOver();
    }
    
    // 胜利检测
    if (game.bricks.every(brick => brick.status === 0)) {
        victory();
    }
}

// 游戏循环
function gameLoop() {
    if (!game.isRunning) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 游戏结束
function gameOver() {
    game.isRunning = false;
    startButton.textContent = '重新开始';
    alert('游戏结束！得分：' + game.score);
}

// 胜利
function victory() {
    game.isRunning = false;
    startButton.textContent = '再来一局';
    alert('恭喜你赢了！得分：' + game.score);
}

// 事件监听
startButton.addEventListener('click', () => {
    if (!game.isRunning) {
        initGame();
        game.isRunning = true;
        startButton.textContent = '游戏中...';
        gameLoop();
    }
});

// 触摸控制
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    if (!game.isRunning) return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    game.paddle.x += diff;
    
    // 限制挡板不超出画布
    if (game.paddle.x < 0) {
        game.paddle.x = 0;
    } else if (game.paddle.x + game.paddle.width > canvas.width) {
        game.paddle.x = canvas.width - game.paddle.width;
    }
    
    touchStartX = touchX;
});

// 鼠标控制
canvas.addEventListener('mousemove', (e) => {
    if (!game.isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    game.paddle.x = mouseX - game.paddle.width / 2;
    
    // 限制挡板不超出画布
    if (game.paddle.x < 0) {
        game.paddle.x = 0;
    } else if (game.paddle.x + game.paddle.width > canvas.width) {
        game.paddle.x = canvas.width - game.paddle.width;
    }
});

// 窗口大小改变时重新调整画布大小
window.addEventListener('resize', () => {
    if (game.isRunning) {
        initGame();
    } else {
        resizeCanvas();
    }
});

// 初始化
resizeCanvas(); 