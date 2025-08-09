/**
 * 游戏基础的精灵类
 */
export default class Sprite {
  constructor(imgSrc = '', width = 0, height = 0, x = 0, y = 0) {
    this.img = wx.createImage();
    this.img.src = imgSrc;

    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.visible = true;
    this.isActive = true;
  }

  /**
   * 将精灵图绘制在canvas上
   */
  render(ctx) {
    if (!this.visible) return;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * 设置位置
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 简单的碰撞检测
   * @param{Sprite} sp: Sprite的实例
   */
  isCollideWith(sp) {
    if (!this.visible || !sp.visible) return false;
    if (!this.isActive || !sp.isActive) return false;

    return !!(
      this.x < sp.x + sp.width &&
      this.x + this.width > sp.x &&
      this.y < sp.y + sp.height &&
      this.y + this.height > sp.y
    );
  }

  /**
   * 检查点是否在精灵内
   */
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
}