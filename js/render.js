// 初始化Canvas
if (typeof GameGlobal !== 'undefined') {
  GameGlobal.canvas = wx.createCanvas();
}

// 确保canvas变量可用
if (typeof canvas === 'undefined') {
  window.canvas = wx.createCanvas();
}

let screenWidth, screenHeight;

// 检查是否在浏览器环境中
if (typeof window !== 'undefined' && window.canvas) {
  // 浏览器环境，使用canvas的实际尺寸
  screenWidth = window.canvas.width;
  screenHeight = window.canvas.height;
} else {
  // 微信小程序环境
  const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  screenWidth = windowInfo.screenWidth;
  screenHeight = windowInfo.screenHeight;
  
  // 如果是竖屏，交换宽高实现横屏
  if (screenHeight > screenWidth) {
    [screenWidth, screenHeight] = [screenHeight, screenWidth];
  }
  
  canvas.width = screenWidth;
  canvas.height = screenHeight;
}

export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;