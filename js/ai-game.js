// ============================================
// SURVIVE THE AI TRANSFORMATION - GAME ENGINE
// ============================================

class AITransformationGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gameWidth = 800;
        this.gameHeight = 600;
        
        // Detect mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Set canvas size based on device
        this.setupCanvas();
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameover
        this.score = 0;
        this.timeLeft = 60;
        this.gameStartTime = 0;
        
        // Player (CTO)
        this.player = {
            x: this.gameWidth / 2 - 25,
            y: this.gameHeight - 100,
            width: 50,
            height: 60,
            speed: 8,
            moveLeft: false,
            moveRight: false
        };
        
        // Falling items
        this.items = [];
        this.itemSpawnRate = 1000; // milliseconds
        this.lastItemSpawn = 0;
        
        // Item definitions
        this.chaosItems = [
            { name: 'Compliance Issue', emoji: '⚠️', points: -15, color: '#E74C3C' },
            { name: 'Scope Creep', emoji: '📄', points: -20, color: '#E67E22' },
            { name: 'Hallucination', emoji: '👻', points: -25, color: '#C0392B' },
            { name: 'Budget Cut', emoji: '✂️', points: -30, color: '#8E44AD' }
        ];
        
        this.winItems = [
            { name: 'Clean Dataset', emoji: '💾', points: 20, color: '#27AE60' },
            { name: 'AI Talent', emoji: '👨‍💻', points: 25, color: '#3498DB' },
            { name: 'Executive Buy-In', emoji: '⭐', points: 30, color: '#F39C12' },
            { name: 'GPU Cluster', emoji: '🖥️', points: 35, color: '#16A085' }
        ];
        
        // Touch controls
        this.touchStartX = 0;
        this.touchCurrentX = 0;
        this.isTouching = false;
        
        // Input handling
        this.setupControls();
        
        // Animation frame
        this.animationId = null;
    }
    
    setupCanvas() {
        if (this.isMobile) {
            // Mobile: make canvas responsive
            const maxWidth = Math.min(window.innerWidth - 40, 600);
            const scale = maxWidth / this.gameWidth;
            this.canvas.width = this.gameWidth;
            this.canvas.height = this.gameHeight;
            this.canvas.style.width = maxWidth + 'px';
            this.canvas.style.height = (this.gameHeight * scale) + 'px';
        } else {
            // Desktop: fixed size
            this.canvas.width = this.gameWidth;
            this.canvas.height = this.gameHeight;
        }
    }
    
    setupControls() {
        // Keyboard controls (desktop)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.player.moveLeft = true;
            if (e.key === 'ArrowRight') this.player.moveRight = true;
            if (e.key === ' ' && this.gameState === 'menu') this.startGame();
            if (e.key === 'r' && this.gameState === 'gameover') this.resetGame();
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.player.moveLeft = false;
            if (e.key === 'ArrowRight') this.player.moveRight = false;
        });
        
        // Touch controls (mobile)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.gameWidth / rect.width;
            this.touchStartX = (touch.clientX - rect.left) * scaleX;
            this.touchCurrentX = this.touchStartX;
            this.isTouching = true;
            
            // Start game on touch in menu
            if (this.gameState === 'menu') {
                this.startGame();
            }
            
            // Restart on touch in gameover
            if (this.gameState === 'gameover') {
                this.resetGame();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isTouching) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.gameWidth / rect.width;
            this.touchCurrentX = (touch.clientX - rect.left) * scaleX;
            
            // Determine direction based on touch position
            const playerCenterX = this.player.x + this.player.width / 2;
            
            if (this.touchCurrentX < playerCenterX - 20) {
                this.player.moveLeft = true;
                this.player.moveRight = false;
            } else if (this.touchCurrentX > playerCenterX + 20) {
                this.player.moveRight = true;
                this.player.moveLeft = false;
            } else {
                this.player.moveLeft = false;
                this.player.moveRight = false;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
            this.player.moveLeft = false;
            this.player.moveRight = false;
        });
        
        // Mouse controls (alternative for desktop)
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.gameWidth / rect.width;
            const clickX = (e.clientX - rect.left) * scaleX;
            
            // Start game on click in menu
            if (this.gameState === 'menu') {
                this.startGame();
            }
            
            // Restart on click in gameover
            if (this.gameState === 'gameover') {
                this.resetGame();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = 60;
        this.items = [];
        this.gameStartTime = Date.now();
        this.player.x = this.gameWidth / 2 - 25;
        this.gameLoop();
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.score = 0;
        this.timeLeft = 60;
        this.items = [];
        this.draw();
    }
    
    spawnItem() {
        const allItems = [...this.chaosItems, ...this.winItems];
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        
        this.items.push({
            x: Math.random() * (this.gameWidth - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 2,
            ...randomItem
        });
    }
    
    updatePlayer() {
        if (this.player.moveLeft && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.player.moveRight && this.player.x < this.gameWidth - this.player.width) {
            this.player.x += this.player.speed;
        }
    }
    
    updateItems() {
        // Update item positions
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].y += this.items[i].speed;
            
            // Check collision with player
            if (this.checkCollision(this.player, this.items[i])) {
                this.score += this.items[i].points;
                this.items.splice(i, 1);
                continue;
            }
            
            // Remove items that are off screen
            if (this.items[i].y > this.gameHeight) {
                this.items.splice(i, 1);
            }
        }
        
        // Spawn new items
        const currentTime = Date.now();
        if (currentTime - this.lastItemSpawn > this.itemSpawnRate) {
            this.spawnItem();
            this.lastItemSpawn = currentTime;
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateTimer() {
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        this.timeLeft = Math.max(0, 60 - Math.floor(elapsed));
        
        if (this.timeLeft === 0) {
            this.gameState = 'gameover';
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        if (this.gameState === 'menu') {
            this.drawMenu();
        } else if (this.gameState === 'playing') {
            this.drawGame();
        } else if (this.gameState === 'gameover') {
            this.drawGameOver();
        }
    }
    
    drawMenu() {
        // Title
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SURVIVE THE', this.gameWidth / 2, 150);
        
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.fillText('AI TRANSFORMATION', this.gameWidth / 2, 210);
        
        // Subtitle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillText('DODGE THE CHAOS', this.gameWidth / 2, 280);
        this.ctx.fillText('COLLECT THE WINS', this.gameWidth / 2, 310);
        this.ctx.fillText('SURVIVE THE TRANSFORMATION', this.gameWidth / 2, 340);
        
        // Instructions
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#00FF00';
        if (this.isMobile) {
            this.ctx.fillText('TAP to Start', this.gameWidth / 2, 420);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px "Press Start 2P", monospace';
            this.ctx.fillText('Touch & Drag to Move CTO', this.gameWidth / 2, 460);
        } else {
            this.ctx.fillText('Press SPACE to Start', this.gameWidth / 2, 420);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px "Press Start 2P", monospace';
            this.ctx.fillText('Use ← → Arrow Keys to Move', this.gameWidth / 2, 460);
        }
        
        // Credits
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillText('AI ENTERTAINMENT SYSTEM™', this.gameWidth / 2, 550);
    }
    
    drawGame() {
        // Draw city background
        this.drawCityBackground();
        
        // Draw rooftop platform
        this.ctx.fillStyle = '#4A90E2';
        this.ctx.fillRect(0, this.gameHeight - 80, this.gameWidth, 80);
        
        // Draw platform grid
        this.ctx.strokeStyle = '#3A7BC8';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.gameWidth; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.gameHeight - 80);
            this.ctx.lineTo(i, this.gameHeight);
            this.ctx.stroke();
        }
        
        // Draw player (CTO)
        this.drawPlayer();
        
        // Draw falling items
        this.items.forEach(item => this.drawItem(item));
        
        // Draw HUD
        this.drawHUD();
        
        // Draw touch indicator for mobile
        if (this.isMobile && this.isTouching) {
            this.drawTouchIndicator();
        }
    }
    
    drawTouchIndicator() {
        // Draw touch position indicator
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.touchCurrentX, this.gameHeight - 40, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw line from player to touch point
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.ctx.lineTo(this.touchCurrentX, this.gameHeight - 40);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawCityBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight - 80);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight - 80);
        
        // Buildings
        const buildings = [
            { x: 50, width: 80, height: 200 },
            { x: 150, width: 60, height: 250 },
            { x: 230, width: 90, height: 180 },
            { x: 340, width: 70, height: 220 },
            { x: 430, width: 100, height: 190 },
            { x: 550, width: 80, height: 240 },
            { x: 650, width: 90, height: 200 }
        ];
        
        buildings.forEach(building => {
            this.ctx.fillStyle = '#0f3460';
            this.ctx.fillRect(
                building.x,
                this.gameHeight - 80 - building.height,
                building.width,
                building.height
            );
            
            // Windows
            this.ctx.fillStyle = '#FFD700';
            for (let y = 0; y < building.height - 20; y += 30) {
                for (let x = 10; x < building.width - 10; x += 20) {
                    if (Math.random() > 0.3) {
                        this.ctx.fillRect(
                            building.x + x,
                            this.gameHeight - 80 - building.height + y + 10,
                            8,
                            12
                        );
                    }
                }
            }
        });
    }
    
    drawPlayer() {
        // CTO character (pixel art style)
        const x = this.player.x;
        const y = this.player.y;
        
        // Head
        this.ctx.fillStyle = '#FFD1A4';
        this.ctx.fillRect(x + 15, y, 20, 20);
        
        // Hair
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(x + 15, y, 20, 8);
        
        // Body (suit)
        this.ctx.fillStyle = '#34495E';
        this.ctx.fillRect(x + 10, y + 20, 30, 25);
        
        // Tie
        this.ctx.fillStyle = '#E74C3C';
        this.ctx.fillRect(x + 22, y + 20, 6, 15);
        
        // Arms
        this.ctx.fillStyle = '#34495E';
        this.ctx.fillRect(x + 5, y + 25, 8, 15);
        this.ctx.fillRect(x + 37, y + 25, 8, 15);
        
        // Legs
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(x + 15, y + 45, 8, 15);
        this.ctx.fillRect(x + 27, y + 45, 8, 15);
    }
    
    drawItem(item) {
        // Item background
        this.ctx.fillStyle = item.color;
        this.ctx.fillRect(item.x, item.y, item.width, item.height);
        
        // Item border (pixel art style)
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(item.x, item.y, item.width, item.height);
        
        // Item emoji
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height / 2);
    }
    
    drawHUD() {
        // HUD background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.gameWidth, 60);
        
        // Time
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.font = 'bold 20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`TIME: ${this.timeLeft}s`, 20, 35);
        
        // Score
        const scoreColor = this.score >= 0 ? '#00FF00' : '#FF0000';
        this.ctx.fillStyle = scoreColor;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`SCORE: ${this.score}`, this.gameWidth / 2, 35);
        
        // AI Maturity indicator
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('AI MATURITY', this.gameWidth - 20, 35);
        
        // Maturity bar
        const maturityPercent = Math.max(0, Math.min(100, (this.score + 200) / 4));
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(this.gameWidth - 220, 45, 200, 10);
        
        const barColor = maturityPercent > 70 ? '#00FF00' : maturityPercent > 40 ? '#FFD700' : '#FF0000';
        this.ctx.fillStyle = barColor;
        this.ctx.fillRect(this.gameWidth - 220, 45, maturityPercent * 2, 10);
    }
    
    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Determine result
        const passed = this.score >= 100;
        
        // Title
        this.ctx.fillStyle = passed ? '#00FF00' : '#FF0000';
        this.ctx.font = 'bold 36px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.gameWidth / 2, 150);
        
        // Result message
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px "Press Start 2P", monospace';
        if (passed) {
            this.ctx.fillText('CONGRATS!', this.gameWidth / 2, 220);
            this.ctx.font = '16px "Press Start 2P", monospace';
            this.ctx.fillText("YOU'RE SURVIVE FOR", this.gameWidth / 2, 260);
            this.ctx.fillText('AI TRANSFORMATION!', this.gameWidth / 2, 290);
        } else {
            this.ctx.fillText('SORRY!', this.gameWidth / 2, 220);
            this.ctx.font = '16px "Press Start 2P", monospace';
            this.ctx.fillText('PLEASE RE-TAKE', this.gameWidth / 2, 260);
            this.ctx.fillText('YOUR L3', this.gameWidth / 2, 290);
        }
        
        // Final score
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px "Press Start 2P", monospace';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.gameWidth / 2, 360);
        
        // Rating
        let rating = '';
        if (this.score >= 200) rating = 'AI MASTER';
        else if (this.score >= 150) rating = 'AI EXPERT';
        else if (this.score >= 100) rating = 'AI PRACTITIONER';
        else if (this.score >= 50) rating = 'AI BEGINNER';
        else rating = 'AI NOVICE';
        
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.font = '18px "Press Start 2P", monospace';
        this.ctx.fillText(`RATING: ${rating}`, this.gameWidth / 2, 410);
        
        // Restart instruction
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '14px "Press Start 2P", monospace';
        if (this.isMobile) {
            this.ctx.fillText('TAP to Restart', this.gameWidth / 2, 480);
        } else {
            this.ctx.fillText('Press R to Restart', this.gameWidth / 2, 480);
        }
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updateItems();
        this.updateTimer();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    init() {
        this.draw();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new AITransformationGame('aiGameCanvas');
    game.init();
});

// Made with Bob
