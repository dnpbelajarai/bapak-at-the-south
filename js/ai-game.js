// Survive The AI Transformation - Retro Arcade Game
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
        
        // Player
        this.player = {
            x: 375,
            y: 500,
            width: 50,
            height: 50,
            speed: 5,
            moveLeft: false,
            moveRight: false
        };
        
        // Items
        this.items = [];
        this.itemSpawnTimer = 0;
        this.itemSpawnInterval = 1500; // milliseconds
        
        // Audio
        this.sounds = {
            bgMusic: null,
            gameOverMusic: null,
            chaosHit: null,
            winHit: null
        };
        
        // Initialize audio
        this.initAudio();
        
        // Item definitions with emojis and scores
        this.chaosItems = [
            { emoji: '📋', name: 'Compliance Issue', score: -15, color: '#FF6B6B' },
            { emoji: '📊', name: 'Scope Creep', score: -20, color: '#FF8787' },
            { emoji: '🤖', name: 'Hallucination', score: -25, color: '#FFA07A' },
            { emoji: '✂️', name: 'Budget Cut', score: -30, color: '#FF4444' }
        ];
        
        this.winItems = [
            { emoji: '📁', name: 'Clean Dataset', score: 20, color: '#51CF66' },
            { emoji: '👨‍💼', name: 'AI Talent', score: 25, color: '#69DB7C' },
            { emoji: '💼', name: 'Executive Buy-In', score: 30, color: '#8CE99A' },
            { emoji: '🖥️', name: 'GPU Cluster', score: 35, color: '#51CF66' }
        ];
        
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
    
    initAudio() {
        // Create audio context for Web Audio API
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Background music (upbeat retro game music)
        this.sounds.bgMusic = this.createBackgroundMusic();
        
        // Game over music (victory fanfare)
        this.sounds.gameOverMusic = this.createGameOverMusic();
        
        // Chaos hit sound (negative beep)
        this.sounds.chaosHit = this.createChaosSound();
        
        // Win hit sound (positive chime)
        this.sounds.winHit = this.createWinSound();
    }
    
    createBackgroundMusic() {
        // Create a simple upbeat melody using oscillators
        return () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const notes = [
                { freq: 523.25, time: 0.0, duration: 0.2 },   // C5
                { freq: 659.25, time: 0.2, duration: 0.2 },   // E5
                { freq: 783.99, time: 0.4, duration: 0.2 },   // G5
                { freq: 659.25, time: 0.6, duration: 0.2 },   // E5
                { freq: 523.25, time: 0.8, duration: 0.2 },   // C5
                { freq: 587.33, time: 1.0, duration: 0.2 },   // D5
                { freq: 659.25, time: 1.2, duration: 0.4 }    // E5
            ];
            
            const now = this.audioContext.currentTime;
            
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = note.freq;
                osc.type = 'square';
                
                gain.gain.setValueAtTime(0.1, now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
            });
            
            // Loop the music
            if (this.gameState === 'playing') {
                setTimeout(() => this.sounds.bgMusic(), 1600);
            }
        };
    }
    
    createGameOverMusic() {
        return () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const notes = [
                { freq: 523.25, time: 0.0, duration: 0.15 },   // C5
                { freq: 659.25, time: 0.15, duration: 0.15 },  // E5
                { freq: 783.99, time: 0.3, duration: 0.15 },   // G5
                { freq: 1046.50, time: 0.45, duration: 0.4 }   // C6
            ];
            
            const now = this.audioContext.currentTime;
            
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = note.freq;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0.2, now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
            });
        };
    }
    
    createChaosSound() {
        return () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = 200;
            osc.type = 'sawtooth';
            
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        };
    }
    
    createWinSound() {
        return () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const notes = [
                { freq: 659.25, time: 0.0 },   // E5
                { freq: 783.99, time: 0.05 }   // G5
            ];
            
            const now = this.audioContext.currentTime;
            
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = note.freq;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0.2, now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + 0.15);
            });
        };
    }
    
    setupControls() {
        // Click/Tap to start game (prevents page scroll issue with Space key)
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
        
        // Start background music
        if (this.sounds.bgMusic) {
            this.sounds.bgMusic();
        }
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
            color: itemData.color,
            isChaos: isChaos
        });
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update timer
        this.timeLeft -= deltaTime / 1000;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.gameState = 'gameover';
            // Play game over music
            if (this.sounds.gameOverMusic) {
                this.sounds.gameOverMusic();
            }
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
                
                // Play appropriate sound
                if (item.isChaos && this.sounds.chaosHit) {
                    this.sounds.chaosHit();
                } else if (!item.isChaos && this.sounds.winHit) {
                    this.sounds.winHit();
                }
                
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
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw scanlines effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < this.canvas.height; i += 4) {
            this.ctx.fillRect(0, i, this.canvas.width, 2);
        }
        
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
        // Draw rooftop
        this.ctx.fillStyle = '#2a2a3e';
        this.ctx.fillRect(0, 520, this.canvas.width, 80);
        
        // Draw rooftop edge
        this.ctx.fillStyle = '#3a3a4e';
        this.ctx.fillRect(0, 520, this.canvas.width, 10);
        
        // Draw player (CTO character)
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('👨‍💼', this.player.x + this.player.width / 2, this.player.y + this.player.height);
        
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
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 40);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`TIME: ${Math.ceil(this.timeLeft)}s`, this.canvas.width - 20, 40);
        
        // Draw score indicator
        const scoreColor = this.score >= 100 ? '#51CF66' : this.score >= 0 ? '#FFD700' : '#FF6B6B';
        this.ctx.fillStyle = scoreColor;
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        const status = this.score >= 100 ? 'PASSING!' : this.score >= 0 ? 'KEEP GOING' : 'DANGER!';
        this.ctx.fillText(status, this.canvas.width / 2, 40);
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
