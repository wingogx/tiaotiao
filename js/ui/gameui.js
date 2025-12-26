import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render.js';

export default class GameUI {
  constructor() {
    this.score = 0;
    this.stepCount = 0; // 台阶计数器
    this.bestScore = this.loadBestScore();
    this.gameState = 'menu'; // menu, playing, gameOver
    
    // 倒计时器相关
    this.gameTime = 30; // 30秒游戏时间
    this.maxGameTime = 30; // 最大游戏时间
    this.gameStartTime = null; // 游戏开始时间
    
    // UI元素位置
    this.menuButton = {
      x: SCREEN_WIDTH / 2 - 80,
      y: SCREEN_HEIGHT / 2,
      width: 160,
      height: 50
    };
    
    this.restartButton = {
      x: SCREEN_WIDTH / 2 - 80,
      y: SCREEN_HEIGHT / 2 + 100,
      width: 160,
      height: 50
    };
  }

  loadBestScore() {
    try {
      const saved = wx.getStorageSync('bestScore');
      return saved || 0;
    } catch (e) {
      return 0;
    }
  }

  saveBestScore() {
    try {
      wx.setStorageSync('bestScore', this.bestScore);
    } catch (e) {
      console.log('保存最高分失败:', e);
    }
  }

  updateScore(points) {
    this.score += points;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }
  }

  addScore(points, skippedSteps = 1) {
    this.updateScore(points);
    this.stepCount += skippedSteps; // 根据实际跳过的台阶数量增加计数器
  }

  reset() {
    this.score = 0;
    this.stepCount = 0;
    this.gameTime = this.maxGameTime;
    this.gameStartTime = null;
  }

  setGameState(state) {
    this.gameState = state;
    if (state === 'playing' && this.gameStartTime === null) {
      this.gameStartTime = Date.now();
      this.gameTime = this.maxGameTime;
    }
  }

  // 更新倒计时器
  updateTimer() {
    if (this.gameState === 'playing' && this.gameStartTime !== null) {
      const elapsed = (Date.now() - this.gameStartTime) / 1000;
      this.gameTime = Math.max(0, this.maxGameTime - elapsed);
      return this.gameTime <= 0; // 返回是否时间到了
    }
    return false;
  }

  // 获取格式化的时间显示
  getFormattedTime() {
    const seconds = Math.ceil(this.gameTime);
    return seconds.toString().padStart(2, '0');
  }

  checkButtonClick(x, y) {
    if (this.gameState === 'menu') {
      if (this.isPointInButton(x, y, this.menuButton)) {
        return 'start';
      }
    } else if (this.gameState === 'gameOver') {
      if (this.isPointInButton(x, y, this.restartButton)) {
        return 'restart';
      }
    }
    return null;
  }

  isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }

  render(ctx) {
    switch (this.gameState) {
      case 'menu':
        this.renderMenu(ctx);
        break;
      case 'playing':
        this.renderGame(ctx);
        break;
      case 'gameOver':
        this.renderGameOver(ctx);
        break;
    }
  }

  renderMenu(ctx) {
    // 只在UI区域绘制半透明背景，不遮挡游戏场景
    const uiAreaY = SCREEN_HEIGHT / 2 - 150;
    const uiAreaHeight = 300;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, uiAreaY, SCREEN_WIDTH, uiAreaHeight);

    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('跳台阶', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);

    // 最高分
    ctx.font = '24px Arial';
    ctx.fillText(`最高分: ${this.bestScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50);

    // 开始按钮
    this.renderButton(ctx, this.menuButton, '开始游戏', '#4ECDC4');

    // 游戏说明（移到底部，使用白色背景）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, SCREEN_HEIGHT - 140, SCREEN_WIDTH, 140);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('长按蓄力向右跳跃', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 120);
    ctx.fillText('落在台阶上得分，落空则结束', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 95);
  }

  renderGame(ctx) {
    // 游戏标题显示（屏幕顶部中央）
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('快乐跳一跳', SCREEN_WIDTH / 2 + 50, 60);

    // 倒计时器显示（最顶部）
    console.log('正在渲染倒计时器...');

    // 倒计时器背景
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; // 红色半透明背景
    ctx.fillRect(20, 5, 160, 25); // 移到更顶部
    
    // 绘制边框
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 5, 160, 25);
    
    // 倒计时文字
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    const displayTime = this.gameTime !== null ? Math.ceil(this.gameTime) : 30;
    ctx.fillText(`剩余时间: ${displayTime}s`, 25, 23);

    // 台阶计数显示（增加更多间距）
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`台阶: ${this.stepCount}`, 20, 55); // 进一步调整位置

    // 分数显示
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#555555';
    ctx.fillText(`分数: ${this.score}`, 20, 80); // 增加间距

    // 最高分显示
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(`最高: ${this.bestScore}`, 20, 100); // 增加间距

    // 操作提示已移除，避免重复显示
  }

  renderGameOver(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 游戏结束标题
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 150);

    // 台阶和分数信息
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Arial';
    ctx.fillText(`跳过台阶: ${this.stepCount} 个`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 90);
    ctx.font = '24px Arial';
    ctx.fillText(`本次分数: ${this.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
    ctx.fillText(`最高分数: ${this.bestScore}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);

    // 重新开始按钮
    this.renderButton(ctx, this.restartButton, '重新开始', '#4ECDC4');

    // 分享提示
    ctx.font = '18px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('分享给好友一起挑战吧！', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 180);
  }

  renderButton(ctx, button, text, color) {
    // 按钮背景
    ctx.fillStyle = color;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    // 按钮边框
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.width, button.height);

    // 按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, button.x + button.width / 2, button.y + button.height / 2 + 8);
  }
}