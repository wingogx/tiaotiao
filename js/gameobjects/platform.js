import Sprite from '../base/sprite.js';

export default class Platform extends Sprite {
  constructor(x, y, width, height, type = 'normal') {
    super('', width, height, x, y);
    this.type = type;
    this.isLanded = false;
  }

  render(ctx) {
    // 根据类型设置颜色（增强对比度）
    switch (this.type) {
      case 'start':
        ctx.fillStyle = '#4CAF50'; // 绿色起始平台
        break;
      case 'normal':
        ctx.fillStyle = '#2196F3'; // 蓝色普通平台（更明显）
        break;
      case 'special':
        ctx.fillStyle = '#FF5722'; // 橙红色特殊平台
        break;
      case 'bonus':
        ctx.fillStyle = '#FFD700'; // 金色奖励平台
        break;
      default:
        ctx.fillStyle = '#607D8B'; // 蓝灰色默认
    }
    
    // 绘制平台主体（台阶样式）
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制台阶顶部高光（更明显）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(this.x, this.y, this.width, 4);
    
    // 绘制台阶侧面阴影（更明显）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
    ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);
    
    // 绘制边框（更粗更明显）
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 特殊效果
    if (this.type === 'bonus') {
      // 奖励平台闪烁效果
      const time = Date.now() * 0.01;
      const alpha = 0.3 + 0.2 * Math.sin(time);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
      
      // 绘制星星装饰
      this.drawStar(ctx, this.x + this.width / 2, this.y + this.height / 2, 5, '#FFF');
    } else if (this.type === 'special') {
      // 特殊平台条纹效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < this.width; i += 8) {
        ctx.fillRect(this.x + i, this.y, 2, this.height);
      }
    }
  }

  drawStar(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x1 = x + Math.cos(angle) * size;
      const y1 = y + Math.sin(angle) * size;
      if (i === 0) {
        ctx.moveTo(x1, y1);
      } else {
        ctx.lineTo(x1, y1);
      }
      
      const innerAngle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
      const x2 = x + Math.cos(innerAngle) * (size * 0.4);
      const y2 = y + Math.sin(innerAngle) * (size * 0.4);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
  }

  getScore() {
    // 每个台阶统一5分
    return 5;
  }
}