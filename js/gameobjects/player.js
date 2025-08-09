import Sprite from '../base/sprite.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render.js';

const PLAYER_SIZE = 30;
const GRAVITY = 0.6;
const GROUND_Y = SCREEN_HEIGHT - 100; // 地面高度

export default class Player extends Sprite {
  constructor() {
    super('', PLAYER_SIZE, PLAYER_SIZE, 0, 0);
    
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = true;
    this.jumpPower = 0;
    this.isCharging = false;
    this.maxJumpPower = 20;
    this.minJumpPower = 5;
    this.isJumping = false;
    this.isFlying = false; // 飞行状态
    
    // 初始位置
    this.reset();
  }

  reset() {
    this.x = 50; // 固定在左侧
    this.y = GROUND_Y - this.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = true;
    this.jumpPower = 0;
    this.isCharging = false;
    this.isJumping = false;
    this.isFlying = false;
  }

  startCharging() {
    if (this.isOnGround && !this.isJumping) {
      this.isCharging = true;
      this.jumpPower = this.minJumpPower;
      console.log('开始蓄力，初始力度:', this.jumpPower, '蓄力状态:', this.isCharging);
    } else {
      console.log('无法开始蓄力，在地面:', this.isOnGround, '正在跳跃:', this.isJumping);
    }
  }

  charge() {
    if (this.isCharging && this.jumpPower < this.maxJumpPower) {
      this.jumpPower += 0.5; // 增加蓄力速度
      console.log('蓄力中，当前力度:', this.jumpPower);
    }
  }

  jump(gameInstance = null) {
    console.log('jump()被调用，当前状态：');
    console.log('- isCharging:', this.isCharging);
    console.log('- isOnGround:', this.isOnGround);
    console.log('- jumpPower:', this.jumpPower);
    
    if (this.isCharging && this.isOnGround) {
      // 基础跳跃力度
      let horizontalPower = this.jumpPower * 0.8;
      let verticalPower = this.jumpPower * 0.7;
      
      // 应用道具增强效果
      if (gameInstance) {
        if (gameInstance.speedBoostActive) {
          horizontalPower *= gameInstance.speedMultiplier;
          console.log('🚀 速度增强生效！水平倍数:', gameInstance.speedMultiplier);
        }
        if (gameInstance.jumpBoostActive) {
          verticalPower *= gameInstance.jumpMultiplier;
          console.log('⬆️ 跳跃增强生效！垂直倍数:', gameInstance.jumpMultiplier);
        }
      }
      
      // 横向跳跃，只向右跳
      this.velocityX = horizontalPower;
      this.velocityY = -verticalPower;
      
      console.log('✅ 跳跃成功！水平速度:', this.velocityX, '垂直速度:', this.velocityY);
      
      this.isOnGround = false;
      this.isCharging = false;
      this.isJumping = true;
    } else {
      console.log('❌ 跳跃失败，蓄力状态:', this.isCharging, '在地面:', this.isOnGround);
    }
  }

  update() {
    // 应用重力（飞行状态下不应用重力）
    if (!this.isOnGround && !this.isFlying) {
      this.velocityY += GRAVITY;
    }

    // 更新位置
    this.x += this.velocityX;
    this.y += this.velocityY;

    // 检查是否落到地面
    if (this.y >= GROUND_Y - this.height && this.velocityY > 0) {
      this.y = GROUND_Y - this.height;
      this.velocityY = 0;
      this.velocityX = 0;
      this.isOnGround = true;
      this.isJumping = false;
      // 只有在不蓄力时才重置jumpPower
      if (!this.isCharging) {
        this.jumpPower = 0;
      }
      
      // 如果落在地面上（没有平台），游戏结束
      return 'checkPlatform';
    }

    return 'playing';
  }

  landOnPlatform(platform) {
    this.y = platform.y - this.height;
    this.velocityY = 0;
    this.velocityX = 0;
    this.isOnGround = true;
    this.isJumping = false;
    // 只有在不蓄力时才重置jumpPower
    if (!this.isCharging) {
      this.jumpPower = 0;
    }
  }

  // 开始飞行状态
  startFlying() {
    this.isFlying = true;
    this.isOnGround = false;
    this.isJumping = false;
    this.velocityX = 3; // 设置水平飞行速度
    this.velocityY = 0; // 停止垂直运动
    console.log('🚀 玩家开始飞行！');
  }

  // 结束飞行状态
  endFlying() {
    this.isFlying = false;
    this.velocityX = 0; // 停止水平运动
    console.log('🚀 玩家结束飞行！');
  }

  render(ctx, isInvincible = false, animationTime = 0) {
    // 保存当前状态
    ctx.save();
    
    // 如果处于无敌状态，添加闪烁效果
    if (isInvincible) {
      // 闪烁效果：每0.2秒切换一次透明度
      const flickerSpeed = 10; // 闪烁速度
      const alpha = Math.sin(animationTime * flickerSpeed) > 0 ? 1.0 : 0.6;
      ctx.globalAlpha = alpha;
      
      // 添加金色光晕效果
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // 如果处于飞行状态，添加蓝色光晕效果
    if (this.isFlying) {
      ctx.shadowColor = '#45B7D1';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 添加轻微的上下浮动效果
      const floatOffset = Math.sin(animationTime * 8) * 2;
      ctx.translate(0, floatOffset);
    }
    
    // 绘制超级玛丽角色
    this.renderMario(ctx);
    
    // 恢复状态
    ctx.restore();

    // 如果正在蓄力，绘制力度指示器
    if (this.isCharging) {
      this.renderPowerIndicator(ctx);
    }
  }

  renderMario(ctx) {
    const x = this.x;
    const y = this.y;
    
    // 根据当前尺寸计算缩放比例
    const baseSize = 30; // 基础尺寸
    const sizeScale = this.width / baseSize; // 根据width属性计算缩放比例
    const scale = 2 * sizeScale; // 像素放大倍数 * 尺寸缩放
    
    // 保存当前状态
    ctx.save();
    
    // 禁用抗锯齿，保持像素风格
    ctx.imageSmoothingEnabled = false;
    
    // 绘制帽子（红色）
    ctx.fillStyle = '#FF0000';
    this.drawPixel(ctx, x + 4*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 2*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 2*scale, scale);
    
    this.drawPixel(ctx, x + 3*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 4*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 3*scale, scale);
    this.drawPixel(ctx, x + 11*scale, y + 3*scale, scale);
    
    // 绘制脸部（肤色）
    ctx.fillStyle = '#FFDBAC';
    this.drawPixel(ctx, x + 4*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 4*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 4*scale, scale);
    
    this.drawPixel(ctx, x + 4*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 5*scale, scale);
    
    // 绘制眼睛（黑色）
    ctx.fillStyle = '#000000';
    this.drawPixel(ctx, x + 5*scale, y + 5*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 5*scale, scale);
    
    // 绘制鼻子（深肤色）
    ctx.fillStyle = '#D4AA7D';
    this.drawPixel(ctx, x + 7*scale, y + 6*scale, scale);
    
    // 绘制胡子（棕色）
    ctx.fillStyle = '#8B4513';
    this.drawPixel(ctx, x + 5*scale, y + 7*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 7*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 7*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 7*scale, scale);
    
    // 绘制衣服（蓝色）
    ctx.fillStyle = '#0066FF';
    this.drawPixel(ctx, x + 4*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 8*scale, scale);
    
    this.drawPixel(ctx, x + 4*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 9*scale, scale);
    
    // 绘制背带（红色）
    ctx.fillStyle = '#FF0000';
    this.drawPixel(ctx, x + 5*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 9*scale, scale);
    
    // 绘制纽扣（黄色）
    ctx.fillStyle = '#FFFF00';
    this.drawPixel(ctx, x + 6*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 8*scale, scale);
    
    // 绘制手臂（肤色）
    ctx.fillStyle = '#FFDBAC';
    this.drawPixel(ctx, x + 3*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 11*scale, y + 8*scale, scale);
    this.drawPixel(ctx, x + 3*scale, y + 9*scale, scale);
    this.drawPixel(ctx, x + 11*scale, y + 9*scale, scale);
    
    // 绘制裤子（蓝色）
    ctx.fillStyle = '#0066FF';
    this.drawPixel(ctx, x + 4*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 10*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 10*scale, scale);
    
    this.drawPixel(ctx, x + 4*scale, y + 11*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 11*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 11*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 11*scale, scale);
    
    // 绘制腿部（肤色）
    ctx.fillStyle = '#FFDBAC';
    this.drawPixel(ctx, x + 6*scale, y + 11*scale, scale);
    this.drawPixel(ctx, x + 7*scale, y + 11*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 11*scale, scale);
    
    // 绘制鞋子（棕色）
    ctx.fillStyle = '#8B4513';
    this.drawPixel(ctx, x + 4*scale, y + 12*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 12*scale, scale);
    this.drawPixel(ctx, x + 6*scale, y + 12*scale, scale);
    this.drawPixel(ctx, x + 8*scale, y + 12*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 12*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 12*scale, scale);
    
    this.drawPixel(ctx, x + 3*scale, y + 13*scale, scale);
    this.drawPixel(ctx, x + 4*scale, y + 13*scale, scale);
    this.drawPixel(ctx, x + 5*scale, y + 13*scale, scale);
    this.drawPixel(ctx, x + 9*scale, y + 13*scale, scale);
    this.drawPixel(ctx, x + 10*scale, y + 13*scale, scale);
    this.drawPixel(ctx, x + 11*scale, y + 13*scale, scale);
    
    // 恢复状态
    ctx.restore();
  }

  drawPixel(ctx, x, y, size) {
    ctx.fillRect(x, y, size, size);
  }

  renderPowerIndicator(ctx) {
    const barWidth = 100;
    const barHeight = 12;
    const barX = this.x - 15;
    const barY = this.y - 35;

    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(barX + 2, barY + 2, barWidth, barHeight);

    // 绘制背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 绘制当前力度
    const powerRatio = Math.max(0, Math.min(1, (this.jumpPower - this.minJumpPower) / (this.maxJumpPower - this.minJumpPower)));
    const color = powerRatio > 0.8 ? '#FF4444' : powerRatio > 0.5 ? '#FFAA44' : '#44FF44';
    ctx.fillStyle = color;
    const fillWidth = Math.max(2, (barWidth - 4) * powerRatio);
    ctx.fillRect(barX + 2, barY + 2, fillWidth, barHeight - 4);

    // 绘制边框
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 绘制力度文字
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`力度: ${Math.round(this.jumpPower)}`, barX + barWidth / 2, barY - 5);
    
    // 绘制预测轨迹
    this.renderTrajectory(ctx);
  }

  renderTrajectory(ctx) {
    const steps = 20;
    const stepSize = 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    let trajX = this.x + this.width / 2;
    let trajY = this.y;
    let velX = this.jumpPower * 0.8; // 与实际跳跃逻辑一致
    let velY = -this.jumpPower * 0.7; // 与实际跳跃逻辑一致
    
    ctx.moveTo(trajX, trajY);
    
    for (let i = 0; i < steps; i++) {
      velY += GRAVITY * stepSize;
      trajX += velX * stepSize;
      trajY += velY * stepSize;
      
      if (trajY >= GROUND_Y) {
        // 绘制落点
        ctx.lineTo(trajX, GROUND_Y);
        break;
      }
      
      ctx.lineTo(trajX, trajY);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制落点标记
    if (trajY >= GROUND_Y) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(trajX, GROUND_Y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}