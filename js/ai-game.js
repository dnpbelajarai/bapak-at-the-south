// Survive The AI Transformation - Retro Arcade Game with City Background
// A game about navigating the challenges of AI transformation

class AITransformationGame {
    constructor() {
        this.canvas = document.getElementById('aiGameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameover
        this.score = 0;
        this.timeLeft = 60;
        this.lastTime = 0;
        this.windowBlinkTimer = 0;
        
        // Player
        this.player = {
            x: 375,
            y: 520,
            width: 50,
            height: 50,
            speed: 5,
            moveLeft: false,
            moveRight: false
        };
        
        // Items
        this.items = [];
        this.itemSpawnTimer = 0;
        this.itemSpawnInterval = 400; // milliseconds
        
        // Item definitions with emojis, names, and scores
        this.chaosItems = [
            { emoji: '📋', name: 'Compliance Issue', score: -100, color: '#FF6B6B' },
            { emoji: '😩', name: 'Scope Creep', score: -30, color: '#FF8787' },
            { emoji: '🤖', name: 'Hallucination', score: -40, color: '#FFA07A' },
            { emoji: '✂️', name: 'Budget Cut', score: -50, color: '#FF4444' }
        ];
        
        this.winItems = [
            { emoji: '📁', name: 'Clean Dataset', score: 20, color: '#51CF66' },
            { emoji: '👨‍💼', name: 'AI Talent', score: 10, color: '#69DB7C' },
            { emoji: '💼', name: 'Executive Buy-In', score: 40, color: '#8CE99A' },
            { emoji: '🖥️', name: 'GPU Cluster', score: 30, color: '#51CF66' }
        ];
        
        // City buildings for background
        this.buildings = this.generateBuildings();
        
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Touch controls
        this.touchStartX = 0;
        this.touchCurrentX = 0;
        this.isTouching = false;
        
        // Setup controls
        this.setupControls();
        
        // Start game loop
        this.gameLoop();
    }
    
    generateBuildings() {
        const buildings = [];
        const buildingCount = 8;
        const buildingWidth = this.canvas.width / buildingCount;
        
        for (let i = 0; i < buildingCount; i++) {
            const height = 150 + Math.random() * 200;
            const windows = [];
            
            // Generate windows for this building
            const windowRows = Math.floor(height / 25);
            const windowCols = Math.floor(buildingWidth / 20) - 1;
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    // Randomly light some windows
                    if (Math.random() > 0.3) {
                        windows.push({
                            x: i * buildingWidth + 10 + col * 20,
                            y: this.canvas.height - 80 - height + row * 25 + 10,
                            lit: Math.random() > 0.5,
                            blinkSpeed: 2000 + Math.random() * 3000 // Random blink interval
                        });
                    }
                }
            }
            
            buildings.push({
                x: i * buildingWidth,
                width: buildingWidth,
                height: height,
                windows: windows
            });
        }
        
        return buildings;
    }
    
    setupControls() {
        // Click/Tap to start game
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'menu') {
                this.startGame();
            } else if (this.gameState === 'gameover') {
                this.resetGame();
            }
        });
        
        // Keyboard controls for gameplay only
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {
                this.player.moveLeft = true;
            }
            if (e.code === 'ArrowRight') {
                this.player.moveRight = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') {
                this.player.moveLeft = false;
            }
            if (e.code === 'ArrowRight') {
                this.player.moveRight = false;
            }
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const touchX = (touch.clientX - rect.left) * scaleX;
            
            if (this.gameState === 'menu' || this.gameState === 'gameover') {
                if (this.gameState === 'menu') {
                    this.startGame();
                } else {
                    this.resetGame();
                }
            } else if (this.gameState === 'playing') {
                this.isTouching = true;
                this.touchStartX = touchX;
                this.touchCurrentX = touchX;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing' && this.isTouching) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                this.touchCurrentX = (touch.clientX - rect.left) * scaleX;
                
                // Move player based on touch position
                const playerCenterX = this.player.x + this.player.width / 2;
                
                // Reset movement
                this.player.moveLeft = false;
                this.player.moveRight = false;
                
                // Set movement direction based on touch position
                if (this.touchCurrentX < playerCenterX - 20) {
                    this.player.moveLeft = true;
                } else if (this.touchCurrentX > playerCenterX + 20) {
                    this.player.moveRight = true;
                }
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
            this.player.moveLeft = false;
            this.player.moveRight = false;
        });
        
        // Update mobile/desktop instructions
        this.updateInstructions();
    }
    
    updateInstructions() {
        const mobileInstructions = document.querySelector('.mobile-instructions');
        const desktopInstructions = document.querySelector('.desktop-instructions');
        
        if (this.isMobile) {
            if (mobileInstructions) mobileInstructions.style.display = 'block';
            if (desktopInstructions) desktopInstructions.style.display = 'none';
        } else {
            if (mobileInstructions) mobileInstructions.style.display = 'none';
            if (desktopInstructions) desktopInstructions.style.display = 'block';
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = 60;
        this.items = [];
        this.itemSpawnTimer = 0;
        this.lastTime = performance.now();
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.score = 0;
        this.timeLeft = 60;
        this.items = [];
        this.player.x = 375;
    }
    
    spawnItem() {
        const isChaos = Math.random() < 0.5;
        const itemArray = isChaos ? this.chaosItems : this.winItems;
        const itemData = itemArray[Math.floor(Math.random() * itemArray.length)];
        
        this.items.push({
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 2,
            emoji: itemData.emoji,
            name: itemData.name,
            score: itemData.score,
            color: itemData.color
        });
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update window blink timer
        this.windowBlinkTimer += deltaTime;
        if (this.windowBlinkTimer >= 500) { // Update every 500ms
            this.buildings.forEach(building => {
                building.windows.forEach(window => {
                    // Random chance to toggle window light
                    if (Math.random() < 0.1) { // 10% chance per update
                        window.lit = !window.lit;
                    }
                });
            });
            this.windowBlinkTimer = 0;
        }
        
        // Update timer
        this.timeLeft -= deltaTime / 1000;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameState = 'gameover';
        }
        
        // Update player position
        if (this.player.moveLeft) {
            this.player.x -= this.player.speed;
        }
        if (this.player.moveRight) {
            this.player.x += this.player.speed;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        
        // Spawn items
        this.itemSpawnTimer += deltaTime;
        if (this.itemSpawnTimer >= this.itemSpawnInterval) {
            this.spawnItem();
            this.itemSpawnTimer = 0;
        }
        
        // Update items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed;
            
            // Check collision with player
            if (this.checkCollision(this.player, item)) {
                this.score += item.score;
                this.items.splice(i, 1);
                continue;
            }
            
            // Remove items that are off screen
            if (item.y > this.canvas.height) {
                this.items.splice(i, 1);
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawCityBackground() {
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height - 80);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - 80);
        
        // Draw buildings
        this.buildings.forEach(building => {
            // Building body
            this.ctx.fillStyle = '#0f3460';
            this.ctx.fillRect(
                building.x,
                this.canvas.height - 80 - building.height,
                building.width - 2,
                building.height
            );
            
            // Building outline
            this.ctx.strokeStyle = '#1a5490';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                building.x,
                this.canvas.height - 80 - building.height,
                building.width - 2,
                building.height
            );
            
            // Windows
            building.windows.forEach(window => {
                this.ctx.fillStyle = window.lit ? '#FFD700' : '#2a4a6a';
                this.ctx.fillRect(window.x, window.y, 8, 12);
            });
        });
    }
    
    drawRooftop() {
        // Rooftop surface
        this.ctx.fillStyle = '#4a90a4';
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
        
        // Rooftop edge
        this.ctx.fillStyle = '#5aa4b8';
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 5);
        
        // Grid pattern on rooftop
        this.ctx.strokeStyle = '#3a7a8a';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height - 80);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = this.canvas.height - 80; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'menu') {
            this.drawMenu();
        } else if (this.gameState === 'playing') {
            this.drawGame();
        } else if (this.gameState === 'gameover') {
            this.drawGameOver();
        }
    }
    
    drawMenu() {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 32px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SURVIVE THE AI', this.canvas.width / 2, 150);
        this.ctx.fillText('TRANSFORMATION', this.canvas.width / 2, 200);
        
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillText('Dodge the chaos', this.canvas.width / 2, 280);
        this.ctx.fillText('Collect the wins', this.canvas.width / 2, 320);
        this.ctx.fillText('Survive 60 seconds', this.canvas.width / 2, 360);
        
        // Blinking start text
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.fillStyle = '#51CF66';
            this.ctx.font = 'bold 20px "Press Start 2P", monospace';
            this.ctx.fillText('CLICK TO START', this.canvas.width / 2, 480);
        }
        
        // Draw controls hint
        this.ctx.fillStyle = '#888';
        this.ctx.font = '12px "Press Start 2P", monospace';
        if (this.isMobile) {
            this.ctx.fillText('Touch & drag to move', this.canvas.width / 2, 540);
        } else {
            this.ctx.fillText('Arrow keys to move', this.canvas.width / 2, 540);
        }
    }
    
    drawGame() {
        // Draw city background
        this.drawCityBackground();
        
        // Draw rooftop
        this.drawRooftop();
        
        // Draw player (CTO character) - pixel art style
        this.drawCTOCharacter(this.player.x, this.player.y);
        
        // Draw items with labels
        this.items.forEach(item => {
            // Draw emoji
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height - 5);
            
            // Draw label background
            const labelText = `${item.name} ${item.score > 0 ? '+' : ''}${item.score}`;
            this.ctx.font = 'bold 10px "Press Start 2P", monospace';
            const textWidth = this.ctx.measureText(labelText).width;
            const padding = 6;
            const labelX = item.x + item.width / 2 - textWidth / 2 - padding;
            const labelY = item.y + item.height + 5;
            const labelWidth = textWidth + padding * 2;
            const labelHeight = 20;
            
            // Draw rounded rectangle background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 4);
            this.ctx.fill();
            
            // Draw label text
            this.ctx.fillStyle = item.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labelText, item.x + item.width / 2, labelY + 14);
        });
        
        // Draw touch indicator for mobile
        if (this.isMobile && this.isTouching) {
            // Draw line from touch to player
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.touchCurrentX, 0);
            this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw touch point
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(this.touchCurrentX, 30, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.touchCurrentX, 30, 15, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw HUD
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.font = 'bold 20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`TIME: ${Math.ceil(this.timeLeft)}s`, 20, 40);
        
        this.ctx.fillStyle = this.score >= 100 ? '#51CF66' : this.score >= 0 ? '#FFD700' : '#FF6B6B';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 40);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'right';
        const maturity = this.score >= 200 ? 'AI MASTER' : 
                        this.score >= 150 ? 'AI EXPERT' :
                        this.score >= 100 ? 'AI PRACTITIONER' :
                        this.score >= 50 ? 'AI ENTHUSIAST' : 'AI MATURITY';
        this.ctx.fillText(maturity, this.canvas.width - 20, 40);
    }
    
    drawCTOCharacter(x, y) {
        const ctx = this.ctx;
        const pixelSize = 5; // Size of each pixel block
        
        // CTO character pixel art (10x10 grid)
        // 0 = transparent, 1 = skin, 2 = hair, 3 = suit, 4 = shirt, 5 = tie
        const pixels = [
            [0,0,2,2,2,2,2,2,0,0],
            [0,2,2,2,2,2,2,2,2,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,0,1,1,1,1,0,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,1,4,4,4,4,1,1,0],
            [0,0,3,4,5,5,4,3,0,0],
            [0,0,3,3,3,3,3,3,0,0],
            [0,0,3,3,0,0,3,3,0,0],
            [0,0,3,3,0,0,3,3,0,0]
        ];
        
        const colors = {
            0: 'transparent',
            1: '#FFD1A3', // Skin
            2: '#4A3728', // Hair (dark brown)
            3: '#2C3E50', // Suit (dark blue/gray)
            4: '#FFFFFF', // Shirt (white)
            5: '#E74C3C'  // Tie (red)
        };
        
        // Draw each pixel
        for (let row = 0; row < pixels.length; row++) {
            for (let col = 0; col < pixels[row].length; col++) {
                const colorKey = pixels[row][col];
                if (colorKey !== 0) {
                    ctx.fillStyle = colors[colorKey];
                    ctx.fillRect(
                        x + col * pixelSize,
                        y + row * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }
    
    drawGameOver() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game over text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 40px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TIME\'S UP!', this.canvas.width / 2, 150);
        
        // Draw final score
        this.ctx.fillStyle = '#00D9FF';
        this.ctx.font = 'bold 32px "Press Start 2P", monospace';
        this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, 220);
        
        // Draw rating
        let rating = '';
        let ratingColor = '';
        if (this.score >= 200) {
            rating = 'AI MASTER';
            ratingColor = '#FFD700';
        } else if (this.score >= 150) {
            rating = 'AI EXPERT';
            ratingColor = '#51CF66';
        } else if (this.score >= 100) {
            rating = 'AI PRACTITIONER';
            ratingColor = '#69DB7C';
        } else if (this.score >= 50) {
            rating = 'AI ENTHUSIAST';
            ratingColor = '#FFA07A';
        } else {
            rating = 'AI NOVICE';
            ratingColor = '#FF6B6B';
        }
        
        this.ctx.fillStyle = ratingColor;
        this.ctx.font = 'bold 24px "Press Start 2P", monospace';
        this.ctx.fillText(rating, this.canvas.width / 2, 280);
        
        // Draw pass/fail message
        if (this.score >= 100) {
            this.ctx.fillStyle = '#51CF66';
            this.ctx.font = '20px "Press Start 2P", monospace';
            this.ctx.fillText('YOU SURVIVED!', this.canvas.width / 2, 340);
        } else {
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.font = '20px "Press Start 2P", monospace';
            this.ctx.fillText('TRANSFORMATION', this.canvas.width / 2, 340);
            this.ctx.fillText('INCOMPLETE', this.canvas.width / 2, 380);
        }
        
        // Blinking restart text
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 18px "Press Start 2P", monospace';
            this.ctx.fillText('CLICK TO RESTART', this.canvas.width / 2, 480);
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new AITransformationGame();
});

// Made with Bob
