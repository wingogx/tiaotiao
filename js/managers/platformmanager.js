import Platform from '../gameobjects/platform.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render.js';

const GROUND_Y = SCREEN_HEIGHT - 100;
const PLATFORM_HEIGHT = 20;

export default class PlatformManager {
  constructor() {
    this.platforms = [];
    this.currentPlatformIndex = 0;
    this.nextPlatformX = 150; // 第一个平台的位置
    this.difficultyLevel = 1; // 难度等级，影响台阶间距
    this.generateInitialPlatforms();
  }

  generateInitialPlatforms() {
    // 起始平台（玩家站立的地方）
    const startPlatform = new Platform(
      20,
      GROUND_Y,
      80,
      PLATFORM_HEIGHT,
      'start'
    );
    this.platforms.push(startPlatform);

    // 生成后续平台
    this.generateNextPlatforms();
  }

  generateNextPlatforms() {
    // 确保从最后一个台阶的位置开始生成新台阶
    if (this.platforms.length > 0) {
      const lastPlatform = this.platforms[this.platforms.length - 1];
      this.nextPlatformX = lastPlatform.x + lastPlatform.width;
      console.log(`从最后台阶位置开始生成: ${this.nextPlatformX}`);
    }
    
    // 根据难度等级调整台阶生成
    const platformCount = 12;
    
    for (let i = 0; i < platformCount; i++) {
      // 创建不同的间距模式
      let gap;
      const patternRand = Math.random();
      
      if (patternRand < 0.3) {
        // 短距离跳跃：30-70像素
        gap = 30 + Math.random() * 40;
      } else if (patternRand < 0.6) {
        // 中等距离跳跃：60-110像素
        gap = 60 + Math.random() * 50;
      } else if (patternRand < 0.85) {
        // 长距离跳跃：100-160像素
        gap = 100 + Math.random() * 60;
      } else {
        // 超长距离跳跃：150-200像素（挑战性）
        gap = 150 + Math.random() * 50;
      }
      
      // 根据难度等级调整间距
      const difficultyMultiplier = 1 + (this.difficultyLevel - 1) * 0.1;
      gap *= difficultyMultiplier;
      
      this.nextPlatformX += gap;
      
      // 台阶宽度也要有变化
      let width;
      const widthRand = Math.random();
      if (widthRand < 0.2) {
        // 窄台阶：35-55像素
        width = 35 + Math.random() * 20;
      } else if (widthRand < 0.7) {
        // 普通台阶：50-80像素
        width = 50 + Math.random() * 30;
      } else {
        // 宽台阶：75-110像素
        width = 75 + Math.random() * 35;
      }
      
      // 随机平台类型
      let type = 'normal';
      const rand = Math.random();
      if (rand < 0.08) {
        type = 'bonus';
      } else if (rand < 0.18) {
        type = 'special';
      }
      
      const platform = new Platform(
        this.nextPlatformX,
        GROUND_Y,
        width,
        PLATFORM_HEIGHT,
        type
      );
      this.platforms.push(platform);
      
      this.nextPlatformX += width;
    }
    
    // 每生成一批台阶，难度稍微增加
    this.difficultyLevel += 0.1;
    
    console.log(`生成了${platformCount}个新台阶，当前总台阶数: ${this.platforms.length}, 难度等级: ${this.difficultyLevel.toFixed(1)}`);
  }

  checkCollision(player) {
    // 主动检查是否需要生成更多台阶（基于玩家位置）
    this.ensurePlatformsAhead(player);
    
    // 检查玩家是否落在任何平台上
    for (let i = 0; i < this.platforms.length; i++) {
      const platform = this.platforms[i];
      
      // 检查玩家是否落在平台上
      if (player.velocityY >= 0 && // 玩家正在下降或静止
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height >= platform.y &&
          player.y + player.height <= platform.y + PLATFORM_HEIGHT + 5) {
        
        // 玩家成功着陆
        player.landOnPlatform(platform);
        
        // 如果是新平台，计算跳过的台阶数量
        if (i > this.currentPlatformIndex) {
          const skippedSteps = i - this.currentPlatformIndex; // 计算跳过的台阶数量（包括飞过的）
          this.currentPlatformIndex = i;
          
          // 生成更多平台（当剩余台阶少于8个时就开始生成，确保足够的缓冲）
          if (i >= this.platforms.length - 8) {
            console.log(`触发台阶生成，当前台阶索引: ${i}, 总台阶数: ${this.platforms.length}`);
            this.generateNextPlatforms();
            console.log(`台阶生成完成，新的总台阶数: ${this.platforms.length}`);
          }
          
          return {
            landed: true,
            platform: platform,
            isNewPlatform: true,
            skippedSteps: skippedSteps, // 返回跳过的台阶数量
            score: skippedSteps * 5 // 每个台阶5分
          };
        }
        
        return {
          landed: true,
          platform: platform,
          isNewPlatform: false,
          skippedSteps: 0,
          score: 0
        };
      }
    }
    
    return {
      landed: false,
      platform: null,
      isNewPlatform: false,
      skippedSteps: 0,
      score: 0
    };
  }

  // 确保玩家前方有足够的台阶
  ensurePlatformsAhead(player) {
    if (this.platforms.length === 0) return;
    
    // 找到玩家前方最远的台阶
    const lastPlatform = this.platforms[this.platforms.length - 1];
    const playerMaxReach = player.x + 500; // 玩家可能跳跃的最大距离
    
    // 如果最后一个台阶距离玩家太近，立即生成新台阶
    if (lastPlatform.x + lastPlatform.width < playerMaxReach) {
      console.log(`玩家位置: ${player.x}, 最后台阶位置: ${lastPlatform.x + lastPlatform.width}, 需要生成新台阶`);
      this.generateNextPlatforms();
    }
  }

  // 检查玩家是否落在空隙中
  checkIfInGap(player) {
    // 如果玩家落到地面高度，检查是否在平台上
    if (player.y + player.height >= GROUND_Y) {
      for (let platform of this.platforms) {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
          return false; // 在平台上，不是空隙
        }
      }
      return true; // 在空隙中
    }
    return false;
  }

  render(ctx) {
    // 绘制地面（改为更深的颜色以增强对比）
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(0, GROUND_Y + PLATFORM_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT - GROUND_Y - PLATFORM_HEIGHT);
    
    // 绘制地面装饰
    ctx.fillStyle = '#388E3C';
    for (let x = 0; x < SCREEN_WIDTH; x += 20) {
      ctx.fillRect(x, GROUND_Y + PLATFORM_HEIGHT - 5, 10, 5);
    }
    
    // 绘制平台（确保在地面之上）
    this.platforms.forEach(platform => {
      platform.render(ctx);
    });
  }

  reset() {
    this.platforms = [];
    this.currentPlatformIndex = 0;
    this.nextPlatformX = 150;
    this.difficultyLevel = 1; // 重置难度等级
    this.generateInitialPlatforms();
    console.log('台阶管理器已重置，难度等级重置为1');
  }
}