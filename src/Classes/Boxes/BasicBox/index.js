import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Texture } from "@pixi/core";
import { Graphics } from "@pixi/graphics";
import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import { Text } from "@pixi/text";

export default class BasicBox {
  constructor(x, y, w, h, mediator, settings = {}) {
    // Object
    this.settings = settings;
    this.mediator = mediator;
    this.id = Math.random().toString(36).substr(2);
    this.position = { x, y };
    this.dimensions = { w, h };
    this.moving = false;
    this.connections = [];
    this.options = [];
    this.settings = settings;

    // Audio
    this.input;
    this.output;

    // Pixi
    this.container = new Container();
    this.container.interactive = true;
    this.container.width = this.dimensions.w;
    this.container.height = this.dimensions.h;
    this.container.filters = [
      new DropShadowFilter({
        color: 0xffffff,
        blur: 4,
        distance: 0,
        quality: 5,
      }),
    ];

    let nameOfBox = new Text(this.settings.name, {
      fontFamily: "Courier New",
      fontSize: 16,
      fill: 0x000000,
      align: "center",
    });
    nameOfBox.anchor.x = 0.5;
    nameOfBox.anchor.y = 0.5;
    nameOfBox.x = this.dimensions.w / 2;
    nameOfBox.y = this.dimensions.h / 2;
    this.graphics = {
      cube: new Sprite(),
      grabArea: new Sprite(),
      name: nameOfBox,
    };

    this.graphics.cube.interactive = true;
    this.graphics.cube.texture = Texture.WHITE;
    this.graphics.cube.width = this.dimensions.w;
    this.graphics.cube.height = this.dimensions.h;

    this.graphics.grabArea.interactive = true;
    this.graphics.grabArea.cursor = "grab";
    this.graphics.grabArea.texture = Texture.WHITE;
    this.graphics.grabArea.tint = 0x00ff00;
    this.graphics.grabArea.width = this.dimensions.w / 3;
    this.graphics.grabArea.height = this.dimensions.h / 3;

    this.connectionLine = new Graphics();

    this.proximityLine = new Graphics();
    this.proximityLine.interactive = true;
    this.proximityLine.cursor = "pointer";
  }

  // Init function
  init() {
    Object.keys(this.graphics).forEach((key) => {
      this.container.addChild(this.graphics[key]);
    });

    this.container.x = this.position.x;
    this.container.y = this.position.y;
    this.graphics.grabArea.x =
      this.container.width - this.graphics.grabArea.width;

    this.graphics.cube.on("pointerdown", () => {
      // Post settings
      this.mediator.post({
        boxSettings: { id: this.id, settings: this.settings },
      });
    });

    // Pick up
    this.graphics.grabArea.on("pointerdown", (e) => {
      this.graphics.grabArea.cursor = "grabbing";
      const { x, y } = e.data.global;
      this.moving = true;
      this.setPosition(x, y);
    });

    // Move
    this.graphics.grabArea.on("pointermove", (e) => {
      if (this.moving) {
        const { x, y } = e.data.global;
        this.setPosition(x, y);
      }
    });

    // Drop
    this.graphics.grabArea.on("pointerup", (e) => {
      this.graphics.grabArea.cursor = "grab";
      const { x, y } = e.data.global;
      this.setPosition(x, y);
      this.moving = false;
    });

    // Click to connect and disconnect
    this.proximityLine.on("pointerdown", (e) => {
      this.handleConnection(e.data.global);
    });

    if (this.input && this.output) {
      this.output.setVolume(this.settings.volume);
      this.input.connectTo(this.output);
    }
  }

  // Methods

  setPosition(x, y) {
    if (this.moving) {
      this.container.x =
        x - this.dimensions.w + this.graphics.grabArea.width / 2;
      this.container.y = y - this.graphics.grabArea.height / 2;
    } else {
      this.container.x = x;
      this.container.y = y;
    }

    this.position.x = this.container.x;
    this.position.y = this.container.y;
  }

  distanceTo(box) {
    let distance = Math.sqrt(
      Math.pow(this.position.x - box.position.x, 2) +
        Math.pow(this.position.y - box.position.y, 2)
    );
    return distance;
  }

  distanceBetweenPoints(positionA, positionB) {
    return Math.sqrt(
      Math.pow(positionA.x - positionB.x, 2) +
        Math.pow(positionA.y - positionB.y, 2)
    );
  }

  isConnectedTo(box) {
    return this.connections.find((item) => item.id === box.id) !== undefined;
  }

  addToConnectionList(box) {
    this.connections.push({
      id: box.id,
      position: box.position,
      dimensions: box.dimensions,
    });
  }

  handleConnection(event) {
    const { x, y } = event;
    const mousePos = { x, y };
    const list = [];

    this.options.forEach((option) => {
      if (this.distanceTo(option) < 200) {
        let distance = this.distanceBetweenPoints(mousePos, option.position);
        list.push({ id: option.id, distance });
      }
    });

    let closest;
    let box;

    if (list.length) {
      closest = list.reduce((a, b) => (a.distance < b.distance ? a : b));
      box = this.options.find((item) => item.id === closest.id);
    }

    const distanceToOption = this.distanceBetweenPoints(mousePos, box.position);
    const distanceToSelf = this.distanceBetweenPoints(mousePos, this.position);

    if (
      distanceToSelf > distanceToOption &&
      this.connectTo &&
      !this.isConnectedTo(box)
    ) {
      this.connectTo(box);
    }

    if (
      distanceToSelf < distanceToOption &&
      this.disconnectFrom &&
      this.isConnectedTo(box)
    ) {
      this.disconnectFrom(box);
    }
  }

  draw() {
    this.connectionLine.clear();
    this.proximityLine.clear();
    if (this.connections.length > 0) {
      this.connectionLine.clear();
      this.connections.forEach((connection) => {
        this.connectionLine
          .lineStyle(2, 0x00ff00, 1)
          .moveTo(this.container.x, this.container.y)
          .lineTo(connection.position.x, connection.position.y);
      });
    }
    if (this.options.length > 0) {
      this.proximityLine.clear();
      this.options.forEach((option) => {
        if (this.distanceTo(option) < 200) {
          this.proximityLine
            .lineStyle(2, 0x00fff0, 0.5)
            .moveTo(this.container.x, this.container.y)
            .lineTo(option.position.x, option.position.y);
          this.proximityLine.hitArea = this.proximityLine.getBounds();
        }
      });
    }
  }
}