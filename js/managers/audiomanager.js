let instance;

/**
 * 音效管理器
 */
export default class AudioManager {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.bgmAudio = wx.createInnerAudioContext();
    this.jumpAudio = wx.createInnerAudioContext();
    this.landAudio = wx.createInnerAudioContext();
    this.scoreAudio = wx.createInnerAudioContext();
    this.gameOverAudio = wx.createInnerAudioContext();

    this.initAudio();
  }

  initAudio() {
    // 背景音乐
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.3;
    // 注意：实际项目中需要添加音频文件
    // this.bgmAudio.src = 'audio/bgm.mp3';

    // 音效
    // this.jumpAudio.src = 'audio/jump.mp3';
    // this.landAudio.src = 'audio/land.mp3';
    // this.scoreAudio.src = 'audio/score.mp3';
    // this.gameOverAudio.src = 'audio/gameover.mp3';
  }

  playBGM() {
    try {
      this.bgmAudio.play();
    } catch (e) {
      console.log('背景音乐播放失败:', e);
    }
  }

  stopBGM() {
    try {
      this.bgmAudio.stop();
    } catch (e) {
      console.log('背景音乐停止失败:', e);
    }
  }

  playJump() {
    try {
      this.jumpAudio.currentTime = 0;
      this.jumpAudio.play();
    } catch (e) {
      console.log('跳跃音效播放失败:', e);
    }
  }

  playLand() {
    try {
      this.landAudio.currentTime = 0;
      this.landAudio.play();
    } catch (e) {
      console.log('着陆音效播放失败:', e);
    }
  }

  playScore() {
    try {
      this.scoreAudio.currentTime = 0;
      this.scoreAudio.play();
    } catch (e) {
      console.log('得分音效播放失败:', e);
    }
  }

  playGameOver() {
    try {
      this.gameOverAudio.currentTime = 0;
      this.gameOverAudio.play();
    } catch (e) {
      console.log('游戏结束音效播放失败:', e);
    }
  }
}