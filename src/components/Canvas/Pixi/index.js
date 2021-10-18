import * as PIXI from 'pixi.js';
import Box from '../Graphics/Box';

export default class Pixi {
  constructor(ref) {
    this.ref = ref;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: 0x000000,
    });
    this.boxes = [];
    this.init();
  }

  init() {
    for (let i = 0; i < 5; i++) {
      this.boxes.push(new Box(i * 100, i * 100));
    }
  }
  update() {
    this.boxes.forEach((box) => {
      box.draw();
    });
  }
  start() {
    this.boxes.forEach((box) => {
      this.app.stage.addChild(box.graphics);
    });

    this.ref.appendChild(this.app.view);
    this.app.ticker.add(() => {
      this.update();
    });
  }
}
