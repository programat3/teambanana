// Platanus Hack 25: Snake Game
// Navigate the snake around the "PLATANUS HACK ARCADE" title made of blocks!

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize game variables
let player;
let bullets;
let enemies;
let particles;
let score = 0;
let scoreText;
let gameOver = false;
let cursors;
let shootTime = 0;

// Create game instance - use a const to ensure it stays in scope
const game = new Phaser.Game(config);

function preload() {
    // Create simple graphics for ship, bullet and enemy
    const graphics = this.add.graphics();
    
    // Player ship (triangle)
    graphics.lineStyle(2, 0x00ff00);
    graphics.fillStyle(0x00ff00);
    graphics.beginPath();
    graphics.moveTo(0, -15);
    graphics.lineTo(10, 15);
    graphics.lineTo(-10, 15);
    graphics.closePath();
    graphics.fill();
    graphics.generateTexture('ship', 20, 30);
    graphics.clear();

    // Bullet (small rectangle)
    graphics.fillStyle(0x00ffff);
    graphics.fillRect(-2, -4, 4, 8);
    graphics.generateTexture('bullet', 4, 8);
    graphics.clear();

    // Enemy (red triangle)
    graphics.lineStyle(2, 0xff0000);
    graphics.fillStyle(0xff0000);
    graphics.beginPath();
    graphics.moveTo(0, -10);
    graphics.lineTo(10, 10);
    graphics.lineTo(-10, 10);
    graphics.closePath();
    graphics.fill();
    graphics.generateTexture('enemy', 20, 20);
    graphics.destroy();
}

function create() {
    // Create player
    player = this.physics.add.sprite(400, 550, 'ship');
    player.setCollideWorldBounds(true);

    // Create bullet group
    bullets = this.physics.add.group();

    // Create enemy group
    enemies = this.physics.add.group();

    // Create particles using new API
    particles = this.add.particles(0, 0, 'bullet', {
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        gravityY: 0,
        quantity: 10,
        emitting: false
    });

    // Setup input
    cursors = this.input.keyboard.createCursorKeys();

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#fff' 
    });

    // Enemy spawn timer
    this.time.addEvent({
        delay: 1000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    // Collision handlers
    this.physics.add.overlap(bullets, enemies, bulletHitEnemy, null, this);
    this.physics.add.overlap(player, enemies, enemyHitPlayer, null, this);
}

function update(time) {
    if (gameOver) return;

    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // Shooting
    if (cursors.space.isDown && time > shootTime) {
        const bullet = bullets.get();
        if (bullet) {
            bullet.setPosition(player.x, player.y - 20);
            bullet.setVelocityY(-300);
            shootTime = time + 250; // Shoot delay
        }
    }

    // Clean up bullets
    bullets.children.each(bullet => {
        if (bullet.active && bullet.y < -10) {
            bullet.destroy();
        }
    });

    // Move enemies
    enemies.children.each(enemy => {
        enemy.y += 2;
        if (enemy.y > 600) {
            enemy.destroy();
        }
    });
}

function spawnEnemy() {
    if (gameOver) return;
    const x = Phaser.Math.Between(20, 780);
    const enemy = enemies.create(x, -20, 'enemy');
    enemy.setVelocityY(100);
}

function bulletHitEnemy(bullet, enemy) {
    // Store position before destroying objects
    const pos = { x: enemy.x, y: enemy.y };
    
    // Update score
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Trigger explosion effect at position
    particles.emitParticleAt(pos.x, pos.y);
    
    // Destroy objects
    bullet.destroy();
    enemy.destroy();
}

function enemyHitPlayer(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;

    // Game over text
    this.add.text(400, 300, 'GAME OVER\nClick to restart', {
        fontSize: '64px',
        fill: '#fff',
        align: 'center'
    }).setOrigin(0.5);

    // Click to restart
    this.input.on('pointerdown', () => {
        score = 0;
        gameOver = false;
        this.scene.restart();
    });
}
