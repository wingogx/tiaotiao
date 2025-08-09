import './render.js';
import Player from './gameobjects/player.js';
import PlatformManager from './managers/platformmanager.js';
import AudioManager from './managers/audiomanager.js';
import GameUI from './ui/gameui.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render.js';

const ctx = canvas.getContext('2d');

/**
 * 跳一跳游戏主类
 */
export default class Main {
  constructor() {
    this.ctx = ctx; // 初始化画布上下文
    this.gameState = 'playing'; // 直接开始游戏，简化流程
    this.aniId = 0;
    
    // 初始化游戏对象
    this.player = new Player();
    this.platformManager = new PlatformManager();
    this.audioManager = new AudioManager();
    this.gameUI = new GameUI();
    
    // 同步游戏状态
    this.gameUI.setGameState('playing');
    
    // 触摸控制
    this.touchStartTime = 0;
    this.isTouching = false;
    this.isCharging = false;
    
    // 摄像机跟随
    this.cameraX = 0;
    this.cameraY = 0;
    this.targetCameraX = 0;
    this.targetCameraY = 0;
    this.cameraSpeed = 0.1;
    
    // 落水动画相关
    this.fallingState = {
      active: false,
      startTime: 0,
      duration: 3000, // 3秒落水动画
      waterLevel: SCREEN_HEIGHT - 80, // 水面高度
      splashParticles: [],
      cameraShake: 0
    };
    
    // 小河和小鱼相关
    this.fish = [];
    this.animationTime = 0;
    this.initializeFish();
    
    // 重置道具系统
    this.powerUps = [];
    this.lastPowerUpTime = 0;
    
    // 重置道具增强效果
     this.speedBoostActive = false;
     this.speedMultiplier = 1.0;
     this.jumpBoostActive = false;
     this.jumpMultiplier = 1.0;
     this.growActive = false;
     this.growMultiplier = 1.0;
    
    // 清除所有道具效果定时器
    if (this.growTimer) {
      clearTimeout(this.growTimer);
      this.growTimer = null;
    }
    if (this.speedTimer) {
      clearTimeout(this.speedTimer);
      this.speedTimer = null;
    }
    if (this.jumpTimer) {
      clearTimeout(this.jumpTimer);
      this.jumpTimer = null;
    }
    this.powerUpSpawnInterval = 3000; // 3秒生成一个道具
    
    // 道具增强效果状态
    this.speedBoostActive = false;
    this.speedMultiplier = 1.0;
    this.jumpBoostActive = false;
    this.jumpMultiplier = 1.0;
    this.growActive = false;
    this.growMultiplier = 1.0;
    this.invincibleActive = false; // 无敌状态
    this.flyingActive = false; // 飞行状态
    
    // 道具效果定时器
    this.growTimer = null;
    this.speedTimer = null;
    this.jumpTimer = null;
    this.invincibleTimer = null;
    this.flyingTimer = null;
    
    // 鲨鱼系统
    this.sharks = [];
    this.lastSharkTime = Date.now();
    this.sharkSpawnInterval = 8000; // 8秒生成一条鲨鱼
    
    // 道具名称显示
    this.lastPowerUpName = "";
    this.powerUpNameTimer = 0;
    
    this.initEvents();
    this.start();
    
    console.log('游戏初始化完成');
    console.log('玩家位置:', this.player.x, this.player.y);
    console.log('平台数量:', this.platformManager.platforms.length);
  }

  // 初始化小鱼
  initializeFish() {
    this.fish = [];
    const GROUND_Y = SCREEN_HEIGHT - 100; // 地面高度
    const PLATFORM_HEIGHT = 20; // 台阶高度
    const riverY = GROUND_Y + PLATFORM_HEIGHT; // 河水起始位置
    const riverHeight = 80; // 河水高度
    
    // 创建多条小鱼
    for (let i = 0; i < 15; i++) {
      this.fish.push({
        x: Math.random() * 2000 - 500, // 随机分布在更大范围
        y: riverY + 10 + Math.random() * (riverHeight - 20), // 在河水范围内游泳
        size: 8 + Math.random() * 6, // 随机大小
        speed: 0.5 + Math.random() * 1.5, // 随机游泳速度
        direction: Math.random() > 0.5 ? 1 : -1, // 随机游泳方向
        color: this.getRandomFishColor(),
        animationOffset: Math.random() * Math.PI * 2, // 随机动画偏移
        verticalOffset: Math.random() * 20 - 10, // 垂直游泳偏移
        baseY: riverY + 10 + Math.random() * (riverHeight - 20) // 记录基础Y坐标
      });
    }
  }

  // 获取随机鱼的颜色
  getRandomFishColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 生成鲨鱼
  spawnShark() {
    const GROUND_Y = SCREEN_HEIGHT - 100;
    const PLATFORM_HEIGHT = 20;
    const riverY = GROUND_Y + PLATFORM_HEIGHT;
    const riverHeight = 80;
    
    // 20%概率生成跳跃型鲨鱼
    const isJumpingType = Math.random() < 0.2;
    
    const shark = {
      x: this.cameraX + SCREEN_WIDTH + 100, // 从屏幕右侧出现
      y: riverY + riverHeight * 0.7, // 在河水深处
      baseY: riverY + riverHeight * 0.7,
      size: 40, // 比普通鱼大
      speed: 1.5 + Math.random() * 1, // 游泳速度
      direction: -1, // 向左游
      animationOffset: Math.random() * Math.PI * 2,
      state: 'swimming', // swimming, surfacing, diving
      stateTimer: 0,
      surfaceY: riverY + 10, // 水面位置
      maxDepth: riverY + riverHeight - 15, // 最大深度
      isVisible: true,
      tailSwing: 0,
      jawOpen: false,
      jawTimer: 0,
      type: isJumpingType ? 'jumping' : 'normal', // 鲨鱼类型
      canJump: isJumpingType // 是否能跳跃
    };
    
    this.sharks.push(shark);
    console.log(`🦈 鲨鱼出现！类型: ${isJumpingType ? '跳跃型' : '普通型'}`);
  }

  // 生成道具
  spawnPowerUp() {
    const types = ['grow', 'speed', 'jump', 'score'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp = {
      type: type,
      x: this.cameraX + SCREEN_WIDTH + 50, // 从屏幕右侧出现
      y: 100 + Math.random() * 200, // 在空中随机高度
      size: 20,
      speed: 1 + Math.random() * 1, // 随机飞行速度（减半）
      collected: false,
      animationOffset: Math.random() * Math.PI * 2,
      color: this.getPowerUpColor(type),
      icon: this.getPowerUpIcon(type)
    };
    
    this.powerUps.push(powerUp);
  }

  // 获取道具颜色
  getPowerUpColor(type) {
    const colors = {
      'grow': '#FF6B6B',    // 红色 - 变大
      'speed': '#FFD700',   // 金色 - 无敌
      'jump': '#45B7D1',    // 蓝色 - 跳跃
      'score': '#FFD700'    // 金色 - 得分
    };
    return colors[type] || '#FFFFFF';
  }

  // 获取道具图标
  getPowerUpIcon(type) {
    const icons = {
      'grow': '⬆',    // 变大箭头
      'speed': '⚡',   // 闪电 - 无敌
      'jump': '🚀',   // 火箭
      'score': '⭐'    // 星星
    };
    return icons[type] || '?';
  }

  initEvents() {
    // 触摸开始
    wx.onTouchStart((e) => {
      console.log('触摸开始，游戏状态:', this.gameState);
      
      if (this.gameState === 'gameOver') {
        this.restartGame();
        return;
      }
      
      if (this.gameState === 'playing' && this.player.isOnGround && !this.player.isJumping) {
        this.isTouching = true;
        this.isCharging = true;
        this.player.startCharging();
        console.log('开始蓄力');
      }
    });

    // 触摸移动（持续蓄力）
    wx.onTouchMove((e) => {
      if (this.isCharging && this.isTouching) {
        this.player.charge();
      }
    });

    // 触摸结束
    wx.onTouchEnd((e) => {
      console.log('触摸结束');
      if (this.isCharging && this.isTouching) {
        this.isTouching = false;
        // 先执行跳跃，再重置状态
        this.player.jump(this);
        this.isCharging = false;
        console.log('执行跳跃');
      }
    });

    // 触摸取消
    wx.onTouchCancel((e) => {
      console.log('触摸取消');
      this.isTouching = false;
      this.isCharging = false;
      this.player.isCharging = false;
    });
  }

  startGame() {
    this.gameState = 'playing';
    this.gameUI.reset();
    this.gameUI.setGameState('playing');
    this.player.reset();
    this.platformManager.reset();
    this.audioManager.playBGM();
    
    // 重置摄像机位置
    this.cameraX = 0;
    this.cameraY = 0;
    this.targetCameraX = 0;
    this.targetCameraY = 0;
    
    // 重新初始化小鱼和动画时间
    this.initializeFish();
    this.animationTime = 0;
    
    // 重置道具系统
    this.powerUps = [];
    this.lastPowerUpTime = Date.now();
    
    // 重置鲨鱼系统
    this.sharks = [];
    this.lastSharkTime = Date.now();
    
    // 立即生成一条鲨鱼进行测试
    setTimeout(() => {
      this.spawnShark();
      console.log('🦈 测试：立即生成鲨鱼');
    }, 1000);
    
    // 重置道具名称显示
    this.lastPowerUpName = "";
    this.powerUpNameTimer = 0;
    
    // 重置无敌状态
    this.invincibleActive = false;
    if (this.invincibleTimer) {
      clearTimeout(this.invincibleTimer);
      this.invincibleTimer = null;
    }
    
    // 重置飞行状态
    this.flyingActive = false;
    if (this.flyingTimer) {
      clearTimeout(this.flyingTimer);
      this.flyingTimer = null;
    }
  }

  restartGame() {
    this.startGame();
  }

  gameOver() {
    // 如果已经在落水动画中，直接返回
    if (this.fallingState.active) return;
    
    console.log('🌊 开始落水动画...');
    
    // 启动落水动画
    this.fallingState.active = true;
    this.fallingState.startTime = Date.now();
    this.gameState = 'falling';
    
    // 停止背景音乐但不立即播放游戏结束音效
    this.audioManager.stopBGM();
    
    // 让玩家开始缓慢下落
    this.player.velocityY = 2; // 缓慢下落速度
    this.player.velocityX = 0; // 停止水平移动
    this.player.isJumping = true; // 设置为跳跃状态以允许下落
    this.player.isOnGround = false;
    
    // 创建水花粒子效果
    this.createSplashParticles();
    
    // 轻微震动反馈
    wx.vibrateShort({
      type: 'light'
    });
  }
  
  // 创建水花粒子效果
  createSplashParticles() {
    const playerCenterX = this.player.x + this.player.width / 2;
    const waterY = this.fallingState.waterLevel;
    
    // 创建多个水花粒子
    for (let i = 0; i < 15; i++) {
      this.fallingState.splashParticles.push({
        x: playerCenterX + (Math.random() - 0.5) * 60,
        y: waterY,
        velocityX: (Math.random() - 0.5) * 8,
        velocityY: -Math.random() * 12 - 5,
        life: 1.0,
        size: Math.random() * 6 + 3,
        color: `rgba(135, 206, 235, ${Math.random() * 0.8 + 0.2})`
      });
    }
  }
  
  // 完成游戏结束
  finishGameOver() {
    this.gameState = 'gameOver';
    this.gameUI.setGameState('gameOver');
    this.audioManager.playGameOver();
    
    // 强烈震动反馈
    wx.vibrateShort({
      type: 'heavy'
    });
    
    console.log('🎮 游戏正式结束');
  }
  
  // 更新落水动画
  updateFallingAnimation() {
    const currentTime = Date.now();
    const elapsed = currentTime - this.fallingState.startTime;
    const progress = Math.min(elapsed / this.fallingState.duration, 1);
    
    // 更新动画时间
    this.animationTime += 0.05;
    
    // 更新玩家位置 - 缓慢下落
    this.player.update();
    
    // 当玩家接触水面时，创建更多水花
    if (this.player.y + this.player.height >= this.fallingState.waterLevel && this.fallingState.splashParticles.length < 30) {
      this.createSplashParticles();
      
      // 添加摄像机震动效果
      this.fallingState.cameraShake = 10;
    }
    
    // 更新水花粒子
    for (let i = this.fallingState.splashParticles.length - 1; i >= 0; i--) {
      const particle = this.fallingState.splashParticles[i];
      
      // 更新粒子位置
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.5; // 重力
      particle.velocityX *= 0.98; // 阻力
      
      // 减少生命值
      particle.life -= 0.02;
      
      // 移除死亡的粒子
      if (particle.life <= 0) {
        this.fallingState.splashParticles.splice(i, 1);
      }
    }
    
    // 更新摄像机震动
    if (this.fallingState.cameraShake > 0) {
      this.fallingState.cameraShake *= 0.9;
      if (this.fallingState.cameraShake < 0.1) {
        this.fallingState.cameraShake = 0;
      }
    }
    
    // 摄像机跟随玩家下落
    this.updateCamera();
    
    // 动画结束后，正式进入游戏结束状态
    if (progress >= 1) {
      this.fallingState.active = false;
      this.finishGameOver();
    }
  }

  update() {
    // 处理落水动画状态
    if (this.gameState === 'falling') {
      this.updateFallingAnimation();
      return;
    }
    
    if (this.gameState !== 'playing') return;

    // 检查倒计时器
    if (this.gameUI.gameState === 'playing' && this.gameUI.gameStartTime !== null) {
      const elapsed = (Date.now() - this.gameUI.gameStartTime) / 1000;
      this.gameUI.gameTime = Math.max(0, this.gameUI.maxGameTime - elapsed);
      if (this.gameUI.gameTime <= 0) {
        console.log('⏰ 时间到！游戏结束');
        this.gameOver();
        return;
      }
    }

    // 更新动画时间
    this.animationTime += 0.05;

    // 如果正在蓄力，持续增加力度
    if (this.isCharging && this.isTouching) {
      this.player.charge();
    }

    const result = this.player.update();
    
    // 更新摄像机跟随
    this.updateCamera();
    
    // 更新小鱼位置
    this.updateFish();
    
    // 更新鲨鱼
    this.updateSharks();
    
    // 道具系统更新
    this.updatePowerUps();
    
    // 额外的台阶生成检查（在玩家跳跃过程中）
    this.platformManager.ensurePlatformsAhead(this.player);
    
    // 检查碰撞
    const collision = this.platformManager.checkCollision(this.player);
    if (collision.landed && collision.isNewPlatform) {
      this.gameUI.addScore(collision.score, collision.skippedSteps);
      console.log('跳过台阶数:', collision.skippedSteps, '得分:', collision.score);
    }
    
    // 检查鲨鱼与玩家的碰撞（无敌状态和飞行状态下跳过）
    if (!this.invincibleActive && !this.flyingActive && this.checkSharkCollision()) {
      this.gameOver();
      return;
    }
    
    // 检查是否落在空隙中（无敌状态和飞行状态下跳过）
    if (!this.invincibleActive && !this.flyingActive && this.platformManager.checkIfInGap(this.player)) {
      this.gameOver();
      return;
    }
    
    // 检查是否掉出屏幕（无敌状态和飞行状态下跳过）
    if (!this.invincibleActive && !this.flyingActive && this.player.y > SCREEN_HEIGHT + this.cameraY + 200) {
      this.gameOver();
      return;
    }
  }

  updateCamera() {
    // 设置摄像机目标位置：让角色保持在屏幕左侧1/3处
    this.targetCameraX = this.player.x - SCREEN_WIDTH / 3;
    this.targetCameraY = this.player.y - SCREEN_HEIGHT / 2;
    
    // 平滑跟随
    this.cameraX += (this.targetCameraX - this.cameraX) * this.cameraSpeed;
    this.cameraY += (this.targetCameraY - this.cameraY) * this.cameraSpeed;
    
    // 限制摄像机不要向左移动太多（保持游戏进度感）
    if (this.cameraX < 0) {
      this.cameraX = 0;
    }
  }

  // 更新小鱼位置
  updateFish() {
    const GROUND_Y = SCREEN_HEIGHT - 100; // 地面高度
    const PLATFORM_HEIGHT = 20; // 台阶高度
    const riverY = GROUND_Y + PLATFORM_HEIGHT; // 河水起始位置
    const riverHeight = 80; // 河水高度
    
    this.fish.forEach(fish => {
      // 水平游泳
      fish.x += fish.speed * fish.direction;
      
      // 垂直摆动（模拟游泳动作），基于baseY进行摆动
      fish.y = fish.baseY + Math.sin(this.animationTime + fish.animationOffset) * 3;
      
      // 如果鱼游出屏幕，重新从另一边出现
      const screenLeft = this.cameraX - 200;
      const screenRight = this.cameraX + SCREEN_WIDTH + 200;
      
      if (fish.direction > 0 && fish.x > screenRight + 100) {
        fish.x = screenLeft - 100;
        fish.baseY = riverY + 10 + Math.random() * (riverHeight - 20);
        fish.y = fish.baseY;
      } else if (fish.direction < 0 && fish.x < screenLeft - 100) {
        fish.x = screenRight + 100;
        fish.baseY = riverY + 10 + Math.random() * (riverHeight - 20);
        fish.y = fish.baseY;
      }
      
      // 偶尔改变方向
      if (Math.random() < 0.002) {
        fish.direction *= -1;
      }
    });
  }

  // 更新鲨鱼
  updateSharks() {
    const currentTime = Date.now();
    
    // 生成新鲨鱼
    if (currentTime - this.lastSharkTime > this.sharkSpawnInterval) {
      this.spawnShark();
      this.lastSharkTime = currentTime;
      console.log('🦈 鲨鱼系统：生成新鲨鱼，当前鲨鱼数量:', this.sharks.length);
    }
    
    // 调试信息：显示当前鲨鱼数量
    if (this.sharks.length > 0 && Math.random() < 0.01) {
      console.log('🦈 鲨鱼系统状态：', this.sharks.length, '条鲨鱼在游泳');
    }
    
    // 更新现有鲨鱼
    for (let i = this.sharks.length - 1; i >= 0; i--) {
      const shark = this.sharks[i];
      
      // 更新状态计时器
      shark.stateTimer += 1;
      shark.jawTimer += 1;
      
      // 尾巴摆动动画
      shark.tailSwing = Math.sin(this.animationTime * 4 + shark.animationOffset) * 0.3;
      
      // 偶尔张嘴
      if (shark.jawTimer > 60 && Math.random() < 0.02) {
        shark.jawOpen = !shark.jawOpen;
        shark.jawTimer = 0;
      }
      
      // 状态机
      switch (shark.state) {
        case 'swimming':
          // 正常游泳
          shark.x += shark.speed * shark.direction;
          shark.y = shark.baseY + Math.sin(this.animationTime + shark.animationOffset) * 5;
          
          // 只有跳跃型鲨鱼才能跳出水面
          if (shark.canJump && shark.stateTimer > 120 && Math.random() < 0.08) {
            shark.state = 'jumping';
            shark.stateTimer = 0;
            shark.jumpStartY = shark.y;
            shark.jumpVelocity = -8; // 向上的初始速度
            console.log('🦈 跳跃型鲨鱼开始跳出水面！位置:', shark.y, '基础位置:', shark.baseY, '水面:', shark.surfaceY);
          }
          break;
          
        case 'jumping':
          // 跳出水面
          shark.x += shark.speed * shark.direction * 0.8;
          shark.jumpVelocity += 0.4; // 重力加速度
          shark.y += shark.jumpVelocity;
          
          // 调试信息：显示跳跃过程
          if (shark.stateTimer % 10 === 0) {
            console.log('🦈 跳跃中 - Y位置:', Math.round(shark.y), '速度:', Math.round(shark.jumpVelocity * 10) / 10, '基础位置:', shark.baseY);
          }
          
          // 如果回到原来的深度以下，切换到游泳状态
          if (shark.y >= shark.baseY) {
            shark.state = 'swimming';
            shark.stateTimer = 0;
            shark.y = shark.baseY;
            console.log('🦈 鲨鱼重新入水！最终位置:', shark.y);
          }
          break;
          
        case 'surfacing':
          // 浮出水面
          shark.x += shark.speed * shark.direction * 0.5; // 减慢水平速度
          const surfaceProgress = Math.min(shark.stateTimer / 60, 1);
          shark.y = shark.baseY + (shark.surfaceY - shark.baseY) * surfaceProgress;
          
          if (surfaceProgress >= 1) {
            shark.state = 'surface';
            shark.stateTimer = 0;
          }
          break;
          
        case 'surface':
          // 在水面停留
          shark.x += shark.speed * shark.direction * 0.3; // 很慢的移动
          shark.y = shark.surfaceY + Math.sin(this.animationTime * 2) * 3; // 轻微浮动
          
          if (shark.stateTimer > 90) { // 停留1.5秒
            shark.state = 'diving';
            shark.stateTimer = 0;
            console.log('🦈 鲨鱼开始潜水！');
          }
          break;
          
        case 'diving':
          // 潜入水中
          shark.x += shark.speed * shark.direction * 0.7;
          const diveProgress = Math.min(shark.stateTimer / 60, 1);
          shark.y = shark.surfaceY + (shark.baseY - shark.surfaceY) * diveProgress;
          
          if (diveProgress >= 1) {
            shark.state = 'swimming';
            shark.stateTimer = 0;
          }
          break;
      }
      
      // 移除超出屏幕的鲨鱼
      if (shark.x < this.cameraX - 200) {
        this.sharks.splice(i, 1);
        console.log('🦈 鲨鱼游走了');
      }
    }
  }

  // 更新道具
  updatePowerUps() {
    const currentTime = Date.now();
    
    // 生成新道具
    if (currentTime - this.lastPowerUpTime > this.powerUpSpawnInterval) {
      this.spawnPowerUp();
      this.lastPowerUpTime = currentTime;
    }
    
    // 更新现有道具
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      // 移动道具
      powerUp.x -= powerUp.speed;
      
      // 上下浮动动画
      powerUp.y += Math.sin(this.animationTime + powerUp.animationOffset) * 0.5;
      
      // 检查与玩家碰撞
      if (!powerUp.collected && this.checkPowerUpCollision(powerUp)) {
        this.collectPowerUp(powerUp);
        powerUp.collected = true;
      }
      
      // 移除超出屏幕的道具
      if (powerUp.x < this.cameraX - 100 || powerUp.collected) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  // 检查道具碰撞
  checkPowerUpCollision(powerUp) {
    const dx = powerUp.x - this.player.x;
    const dy = powerUp.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (powerUp.size + this.player.width) / 2;
  }

  // 检查鲨鱼与玩家的碰撞
  checkSharkCollision() {
    for (let shark of this.sharks) {
      // 检查所有状态的鲨鱼，但跳跃状态的鲨鱼碰撞范围更大
      const dx = shark.x - this.player.x;
      const dy = shark.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 根据鲨鱼状态调整碰撞半径
      let sharkRadius;
      if (shark.state === 'jumping') {
        sharkRadius = shark.size * 0.8; // 跳跃状态碰撞范围更大
      } else if (shark.state === 'surface') {
        sharkRadius = shark.size * 0.7; // 水面状态也有碰撞
      } else {
        sharkRadius = shark.size * 0.5; // 其他状态碰撞范围较小
      }
      
      const playerRadius = Math.max(this.player.width, this.player.height) / 2.5;
      
      if (distance < sharkRadius + playerRadius) {
        console.log(`💥 ${shark.state}状态的鲨鱼撞到了玩家！`);
        console.log(`碰撞详情 - 鲨鱼位置: (${Math.round(shark.x)}, ${Math.round(shark.y)}), 玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}), 距离: ${Math.round(distance)}, 碰撞半径: ${Math.round(sharkRadius + playerRadius)}`);
        return true;
      }
      
      // 调试信息：显示接近的鲨鱼
      if (distance < (sharkRadius + playerRadius) * 2) {
        console.log(`🦈 鲨鱼接近玩家 - 状态: ${shark.state}, 距离: ${Math.round(distance)}, 需要距离: ${Math.round(sharkRadius + playerRadius)}`);
      }
    }
    return false;
  }

  // 无敌状态结束后的安全检查
  checkSafetyAfterInvincible() {
    console.log('🛡️ 无敌状态结束，检查玩家安全状态...');
    
    // 检查是否在台阶上
    const collision = this.platformManager.checkCollision(this.player);
    const isOnPlatform = collision.landed;
    
    // 检查是否在空隙中
    const isInGap = this.platformManager.checkIfInGap(this.player);
    
    // 检查是否掉出屏幕
    const isOffScreen = this.player.y > SCREEN_HEIGHT + this.cameraY + 200;
    
    console.log('🛡️ 安全检查结果:', {
      isOnPlatform,
      isInGap,
      isOffScreen,
      playerY: this.player.y,
      playerX: this.player.x
    });
    
    // 如果玩家不在安全位置，游戏结束
    if (isInGap || isOffScreen || (!isOnPlatform && !this.player.isJumping)) {
      console.log('🛡️ 无敌状态结束后玩家不在安全位置，游戏结束');
      this.gameOver();
    } else {
      console.log('🛡️ 玩家在安全位置，继续游戏');
    }
  }

  // 飞行状态结束后降落到最近的台阶
  landOnNearestPlatform() {
    console.log('🚀 飞行状态结束，寻找最近的台阶降落...');
    
    // 结束飞行状态
    this.player.endFlying();
    
    // 获取所有台阶
    const platforms = this.platformManager.platforms;
    let nearestPlatform = null;
    let minDistance = Infinity;
    
    // 寻找最近的台阶（扩大搜索范围）
    for (let platform of platforms) {
      const dx = platform.x - this.player.x;
      const dy = platform.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 扩大搜索范围，包括玩家后方的台阶
      if (dx >= -200 && distance < minDistance) {
        minDistance = distance;
        nearestPlatform = platform;
      }
    }
    
    if (nearestPlatform) {
      // 将玩家移动到最近台阶的中心位置
      this.player.x = nearestPlatform.x + nearestPlatform.width / 2;
      this.player.y = nearestPlatform.y - this.player.height;
      this.player.velocityY = 0;
      this.player.isOnGround = true;
      this.player.isJumping = false;
      
      console.log(`🚀 玩家降落到台阶: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
    } else {
      // 如果没有找到合适的台阶，激活临时无敌状态防止立即游戏结束
      console.log('🚀 未找到合适的台阶，激活临时保护状态');
      this.player.velocityY = 0; // 重置垂直速度，开始下落
      
      // 激活3秒临时无敌状态，给玩家时间降落到安全位置
      this.invincibleActive = true;
      if (this.invincibleTimer) clearTimeout(this.invincibleTimer);
      this.invincibleTimer = setTimeout(() => {
        this.invincibleActive = false;
        this.invincibleTimer = null;
        this.checkSafetyAfterInvincible();
      }, 3000); // 3秒保护时间
      
      console.log('🚀 激活3秒临时无敌保护');
    }
  }

  // 收集道具
  collectPowerUp(powerUp) {
    // 根据道具类型应用不同效果
    switch (powerUp.type) {
      case 'grow':
        // 玩家变大效果 - 更明显的变化
        const originalWidth = this.player.width;
        const originalHeight = this.player.height;
        this.growMultiplier = 1.5;
        this.player.width = Math.min(originalWidth * this.growMultiplier, 80);
        this.player.height = Math.min(originalHeight * this.growMultiplier, 80);
        this.growActive = true;
        this.lastPowerUpName = "角色变大";
        this.powerUpNameTimer = Date.now();
        
        // 清除之前的定时器
        if (this.growTimer) clearTimeout(this.growTimer);
        this.growTimer = setTimeout(() => {
          this.player.width = originalWidth;
          this.player.height = originalHeight;
          this.growActive = false;
          this.growMultiplier = 1.0;
          this.growTimer = null;
        }, 5000); // 5秒后恢复
        
        console.log(`玩家变大: ${originalWidth}x${originalHeight} -> ${this.player.width}x${this.player.height}`);
        break;
        
      case 'speed':
        // 无敌状态效果
        this.invincibleActive = true;
        this.lastPowerUpName = "无敌状态";
        this.powerUpNameTimer = Date.now();
        
        // 清除之前的定时器
        if (this.invincibleTimer) clearTimeout(this.invincibleTimer);
        this.invincibleTimer = setTimeout(() => {
          this.invincibleActive = false;
          this.invincibleTimer = null;
          
          // 无敌状态结束时检查玩家是否在安全位置
          this.checkSafetyAfterInvincible();
        }, 5000); // 5秒无敌时间
        
        console.log(`无敌状态激活: 持续5秒`);
        break;
        
      case 'jump':
        // 飞行状态效果
        this.flyingActive = true;
        this.lastPowerUpName = "飞行状态";
        this.powerUpNameTimer = Date.now();
        
        // 设置玩家为飞行状态
        this.player.startFlying();
        
        // 清除之前的定时器
        if (this.flyingTimer) clearTimeout(this.flyingTimer);
        this.flyingTimer = setTimeout(() => {
          this.flyingActive = false;
          this.flyingTimer = null;
          
          // 飞行状态结束时让玩家降落到最近的台阶
          this.landOnNearestPlatform();
        }, 2000); // 2秒飞行时间
        
        console.log(`飞行状态激活: 持续2秒`);
        break;
        
      case 'score':
        // 额外得分
        this.gameUI.addScore(50, 0); // 使用gameUI的addScore方法
        this.lastPowerUpName = "额外得分";
        this.powerUpNameTimer = Date.now();
        console.log(`获得额外分数: +50, 当前分数: ${this.gameUI.score}`);
        break;
    }
    
    // 播放收集音效（如果有的话）
    console.log(`收集到道具: ${powerUp.type}`);
  }

  render() {
    // 清空画布
    this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 保存当前变换状态
    this.ctx.save();
    
    // 应用摄像机变换（包括震动效果）
    let shakeX = 0, shakeY = 0;
    if (this.fallingState.cameraShake > 0) {
      shakeX = (Math.random() - 0.5) * this.fallingState.cameraShake;
      shakeY = (Math.random() - 0.5) * this.fallingState.cameraShake;
    }
    this.ctx.translate(-this.cameraX + shakeX, -this.cameraY + shakeY);

    // 绘制背景渐变
    this.renderBackground();
    
    // 绘制小河
    this.renderRiver();
    
    // 绘制小鱼
    this.renderFish();
    
    // 绘制鲨鱼
    this.renderSharks();

    // 绘制游戏对象
    this.platformManager.render(this.ctx);
    
    // 特殊处理落水动画中的玩家渲染
    if (this.gameState === 'falling') {
      this.renderFallingPlayer();
    } else {
      this.player.render(this.ctx, this.invincibleActive, this.animationTime);
    }
    
    // 绘制道具
    this.renderPowerUps();
    
    // 绘制落水动画效果
    if (this.fallingState.active) {
      this.renderFallingEffects();
    }

    // 恢复变换状态
    this.ctx.restore();

    // 绘制UI（不受摄像机影响）
    this.gameUI.render(this.ctx);
    this.renderSimpleUI();
    
    // 绘制落水动画的屏幕效果
    if (this.fallingState.active) {
      this.renderFallingScreenEffects();
    }
  }

  // 绘制道具
  renderPowerUps() {
    this.powerUps.forEach(powerUp => {
      this.drawPowerUp(this.ctx, powerUp);
    });
  }

  // 绘制单个道具
  drawPowerUp(ctx, powerUp) {
    ctx.save();
    
    // 移动到道具位置
    ctx.translate(powerUp.x, powerUp.y);
    
    // 缩放动画（呼吸效果）
    const scale = 1 + Math.sin(this.animationTime * 4 + powerUp.animationOffset) * 0.1;
    ctx.scale(scale, scale);
    
    // 绘制道具背景圆圈
    ctx.fillStyle = powerUp.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制道具边框
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制道具图标
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = `${powerUp.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(powerUp.icon, 0, 0);
    
    // 绘制光晕效果
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  renderSimpleUI() {
    // 道具名称显示（在GameUI信息下方）
    if (this.gameState === 'playing' && this.lastPowerUpName && Date.now() - this.powerUpNameTimer < 3000) {
      this.ctx.font = 'bold 20px Arial';
      this.ctx.fillStyle = '#FF6B6B';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`获得道具: ${this.lastPowerUpName}`, 20, 130); // 调整位置避免重叠
    }

    // 道具效果状态显示
    if (this.gameState === 'playing') {
      let effectY = 160;
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'left';
      
      if (this.growActive) {
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillText(`🔴 变大效果 x${this.growMultiplier}`, 20, effectY);
        effectY += 20;
      }
      
      if (this.invincibleActive) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`⚡ 无敌状态`, 20, effectY);
        effectY += 20;
      }
      
      if (this.flyingActive) {
        this.ctx.fillStyle = '#45B7D1';
        this.ctx.fillText(`🚀 飞行状态`, 20, effectY);
        effectY += 20;
      }
    }
  }

  renderBackground() {
    // 创建渐变背景，扩展范围以适应摄像机移动
    const bgWidth = SCREEN_WIDTH + Math.abs(this.cameraX) + 500;
    const bgHeight = SCREEN_HEIGHT + Math.abs(this.cameraY) + 500;
    const bgX = this.cameraX - 250;
    const bgY = this.cameraY - 250;
    
    const gradient = this.ctx.createLinearGradient(bgX, bgY, bgX, bgY + bgHeight);
    gradient.addColorStop(0, '#87CEEB'); // 天空蓝
    gradient.addColorStop(1, '#E0F6FF'); // 浅蓝
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

    // 添加一些装饰性的云朵
    this.renderClouds();
  }

  // 绘制小河
  renderRiver() {
    const riverWidth = SCREEN_WIDTH + Math.abs(this.cameraX) + 1000;
    const riverHeight = 80; // 减小河水高度
    const riverX = this.cameraX - 500;
    // 让河水从台阶底部开始，确保水面不超过台阶
    const GROUND_Y = SCREEN_HEIGHT - 100; // 地面高度
    const PLATFORM_HEIGHT = 20; // 台阶高度
    const riverY = GROUND_Y + PLATFORM_HEIGHT; // 河水从台阶底部开始
    
    // 河水渐变效果
    const riverGradient = this.ctx.createLinearGradient(riverX, riverY, riverX, riverY + riverHeight);
    riverGradient.addColorStop(0, '#4A90E2'); // 深蓝色
    riverGradient.addColorStop(0.3, '#5BA3F5'); // 中蓝色
    riverGradient.addColorStop(0.7, '#6BB6FF'); // 浅蓝色
    riverGradient.addColorStop(1, '#87CEEB'); // 天空蓝
    
    this.ctx.fillStyle = riverGradient;
    this.ctx.fillRect(riverX, riverY, riverWidth, riverHeight);
    
    // 添加水波纹效果
    this.renderWaterWaves(riverX, riverY, riverWidth, riverHeight);
  }

  // 绘制水波纹
  renderWaterWaves(x, y, width, height) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    
    // 绘制多层波浪
    for (let layer = 0; layer < 3; layer++) {
      this.ctx.beginPath();
      const waveY = y + 20 + layer * 15;
      const amplitude = 8 - layer * 2;
      const frequency = 0.02 + layer * 0.005;
      const phase = this.animationTime * (1 + layer * 0.3);
      
      for (let i = 0; i <= width; i += 5) {
        const waveHeight = Math.sin((i * frequency) + phase) * amplitude;
        if (i === 0) {
          this.ctx.moveTo(x + i, waveY + waveHeight);
        } else {
          this.ctx.lineTo(x + i, waveY + waveHeight);
        }
      }
      this.ctx.stroke();
    }
  }

  // 绘制小鱼
  renderFish() {
    this.fish.forEach(fish => {
      this.drawFish(this.ctx, fish);
    });
  }

  // 绘制单条鱼
  drawFish(ctx, fish) {
    ctx.save();
    
    // 移动到鱼的位置
    ctx.translate(fish.x, fish.y);
    
    // 如果鱼向左游，翻转画布
    if (fish.direction < 0) {
      ctx.scale(-1, 1);
    }
    
    // 鱼身体
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鱼尾巴
    ctx.beginPath();
    ctx.moveTo(-fish.size * 0.8, 0);
    ctx.lineTo(-fish.size * 1.3, -fish.size * 0.4);
    ctx.lineTo(-fish.size * 1.3, fish.size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // 鱼眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.3, -fish.size * 0.2, fish.size * 0.15, fish.size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(fish.size * 0.35, -fish.size * 0.2, fish.size * 0.08, fish.size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鱼鳍（上下摆动）
    const finOffset = Math.sin(this.animationTime * 3 + fish.animationOffset) * 0.3;
    ctx.fillStyle = fish.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, fish.size * 0.5 + finOffset, fish.size * 0.3, fish.size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -fish.size * 0.5 - finOffset, fish.size * 0.3, fish.size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  renderClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // 根据摄像机位置生成云朵，让云朵看起来无限延伸
    const cloudSpacing = 300;
    const startX = Math.floor((this.cameraX - SCREEN_WIDTH) / cloudSpacing) * cloudSpacing;
    const endX = this.cameraX + SCREEN_WIDTH * 2;
    
    for (let x = startX; x < endX; x += cloudSpacing) {
      // 使用位置作为种子生成伪随机云朵
      const seed = Math.abs(x / cloudSpacing);
      const cloudY = this.cameraY + 50 + (seed % 3) * 80;
      const cloudSize = 20 + (seed % 4) * 8;
      const offsetX = (seed % 7) * 30;
      
      const cloudX = x + offsetX;
      
      this.ctx.beginPath();
      this.ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      this.ctx.arc(cloudX + cloudSize * 0.6, cloudY, cloudSize * 0.8, 0, Math.PI * 2);
      this.ctx.arc(cloudX - cloudSize * 0.6, cloudY, cloudSize * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // 渲染落水动画中的玩家
  renderFallingPlayer() {
    this.ctx.save();
    
    // 添加下沉效果的透明度变化
    const elapsed = Date.now() - this.fallingState.startTime;
    const progress = Math.min(elapsed / this.fallingState.duration, 1);
    
    // 当玩家接近或进入水中时，逐渐变透明
    if (this.player.y + this.player.height >= this.fallingState.waterLevel) {
      const underwaterProgress = Math.min((this.player.y + this.player.height - this.fallingState.waterLevel) / 50, 1);
      this.ctx.globalAlpha = 1 - underwaterProgress * 0.7; // 最多变70%透明
    }
    
    // 添加轻微的旋转效果
    this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    this.ctx.rotate(Math.sin(this.animationTime * 2) * 0.1);
    this.ctx.translate(-this.player.width / 2, -this.player.height / 2);
    
    // 渲染玩家
    this.player.render(this.ctx, false, this.animationTime);
    
    this.ctx.restore();
  }
  
  // 渲染落水动画效果
  renderFallingEffects() {
    // 渲染水花粒子
    this.fallingState.splashParticles.forEach(particle => {
      this.ctx.save();
      
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
    
    // 渲染水面涟漪效果
    if (this.player.y + this.player.height >= this.fallingState.waterLevel - 20) {
      this.renderWaterRipples();
    }
  }
  
  // 渲染水面涟漪
  renderWaterRipples() {
    const playerCenterX = this.player.x + this.player.width / 2;
    const waterY = this.fallingState.waterLevel;
    const elapsed = Date.now() - this.fallingState.startTime;
    
    this.ctx.save();
    
    // 绘制多个涟漪圆圈
    for (let i = 0; i < 3; i++) {
      const rippleRadius = (elapsed / 20 + i * 30) % 150;
      const alpha = Math.max(0, 1 - rippleRadius / 150);
      
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(playerCenterX, waterY, rippleRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  // 渲染落水动画的屏幕效果
  renderFallingScreenEffects() {
    const elapsed = Date.now() - this.fallingState.startTime;
    const progress = Math.min(elapsed / this.fallingState.duration, 1);
    
    // 屏幕边缘暗化效果
    if (progress > 0.3) {
      const darkenAlpha = (progress - 0.3) / 0.7 * 0.4;
      this.ctx.fillStyle = `rgba(0, 0, 0, ${darkenAlpha})`;
      this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    
    // 显示"落水中..."文字
    if (progress > 0.1 && progress < 0.9) {
      this.ctx.save();
      
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(elapsed / 200) * 0.3 + 0.7})`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // 添加文字阴影
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      this.ctx.fillText('喂鱼中...', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);
      
      this.ctx.restore();
    }
  }

  loop() {
    this.update();
    this.render();
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  // 渲染鲨鱼
  renderSharks() {
    this.sharks.forEach(shark => {
      this.drawShark(this.ctx, shark);
    });
  }

  // 绘制单条鲨鱼
  drawShark(ctx, shark) {
    ctx.save();
    
    // 移动到鲨鱼位置
    ctx.translate(shark.x, shark.y);
    
    // 如果鲨鱼向左游，翻转画布
    if (shark.direction < 0) {
      ctx.scale(-1, 1);
    }
    
    // 鲨鱼身体颜色（统一外观，不区分类型）
    const bodyColor = '#708090'; // 统一为灰色
    const bellyColor = '#F5F5F5'; // 统一肚子颜色
    
    // 鲨鱼身体（流线型）
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, shark.size * 0.9, shark.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鲨鱼肚子（浅色）
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, shark.size * 0.1, shark.size * 0.7, shark.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鲨鱼尾巴（带摆动效果）
    ctx.fillStyle = bodyColor;
    ctx.save();
    ctx.translate(-shark.size * 0.9, 0);
    ctx.rotate(shark.tailSwing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-shark.size * 0.6, -shark.size * 0.4);
    ctx.lineTo(-shark.size * 0.4, 0);
    ctx.lineTo(-shark.size * 0.6, shark.size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 背鳍
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-shark.size * 0.2, -shark.size * 0.4);
    ctx.lineTo(shark.size * 0.1, -shark.size * 0.7);
    ctx.lineTo(shark.size * 0.3, -shark.size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // 移除特殊标记，所有鲨鱼外观统一
    
    // 胸鳍
    ctx.beginPath();
    ctx.ellipse(shark.size * 0.2, shark.size * 0.2, shark.size * 0.3, shark.size * 0.15, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 鲨鱼眼睛（更凶狠）
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(shark.size * 0.4, -shark.size * 0.1, shark.size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛反光
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(shark.size * 0.42, -shark.size * 0.12, shark.size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    
    // 鲨鱼嘴巴和牙齿
    ctx.fillStyle = '#2F2F2F';
    ctx.beginPath();
    if (shark.jawOpen) {
      // 张开的嘴
      ctx.ellipse(shark.size * 0.6, shark.size * 0.05, shark.size * 0.15, shark.size * 0.1, 0, 0, Math.PI * 2);
    } else {
      // 闭合的嘴
      ctx.ellipse(shark.size * 0.6, shark.size * 0.05, shark.size * 0.12, shark.size * 0.05, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // 牙齿
    if (shark.jawOpen) {
      ctx.fillStyle = 'white';
      for (let i = 0; i < 5; i++) {
        const toothX = shark.size * (0.55 + i * 0.03);
        const toothY = shark.size * 0.05;
        ctx.beginPath();
        ctx.moveTo(toothX, toothY - shark.size * 0.05);
        ctx.lineTo(toothX - shark.size * 0.02, toothY + shark.size * 0.05);
        ctx.lineTo(toothX + shark.size * 0.02, toothY + shark.size * 0.05);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // 鳃裂
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const gillX = shark.size * (0.1 + i * 0.1);
      ctx.beginPath();
      ctx.moveTo(gillX, -shark.size * 0.2);
      ctx.lineTo(gillX - shark.size * 0.05, shark.size * 0.1);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  start() {
    cancelAnimationFrame(this.aniId);
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}