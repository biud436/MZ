//================================================================
// RS_TitleMoveLine.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2020 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================
/*:
 * @target MZ
 * @plugindesc This plugin that allows many white vertical lines to move dynamically on the title screen. <RS_TitleMoveLine>
 * @author biud436
 * @url https://biud436.tistory.com/
 *
 * @param Max Lines
 * @type number
 * @min 1
 * @desc Set the max lines that creates on the screen
 * @default 8
 * @max 30
 *
 * @param Line Width
 * @type string
 * @desc Specify the evaluate expression that gets the line width.
 * @default Math.floor(Graphics.boxWidth / 40)
 *
 * @param Bitmap Color
 * @type string
 * @desc Specify the color of the bitmap.
 * @default rgba(255, 255, 255, 1)
 *
 * @param Opacity
 * @type string
 * @desc Specify the evaluate expression that gets an opacity
 * @default 64 + Math.randomInt(64)
 *
 * @param Scale
 * @type string
 * @desc Specify the evaluate expression that gets the scale
 * @default 1.0 + Math.random()
 *
 * @param Move Speed
 * @type string
 * @desc Specify the evaluate expression that gets the move speed of line.
 * @default 2 + Math.random() * 4
 *
 * @param Replace Bitmap As Image
 * @require 1
 * @desc Choose the image file if you want to replace as image.
 * @default
 * @dir img/pictures/
 * @type file
 *
 * @help
 * =============================================================================
 * Introduction
 * =============================================================================
 * This plugin enhances your RPG Maker MV title screen by adding animated
 * vertical lines that move horizontally across the screen. These lines create
 * a dynamic, ambient background effect that can make your game's title screen
 * more visually interesting.
 * When a line reaches the edge of the screen, it automatically changes direction
 * and continues moving, creating a continuous animation effect.
 * =============================================================================
 * Features
 * =============================================================================
 * - Customizable number of lines (1-30)
 * - Adjustable line width, color, and opacity
 * - Random variation in line appearance and movement
 * - Option to use custom images instead of plain lines
 * - Performance-conscious implementation
 * =============================================================================
 * Usage Instructions
 * =============================================================================
 * 1. Install the plugin in your project's js/plugins folder
 * 2. Enable the plugin in the Plugin Manager
 * 3. Configure the parameters to achieve your desired visual effect
 * 4. For best results, consider using semi-transparent lines (opacity < 128)
 * 5. If using a custom image, select a vertically oriented image
 * =============================================================================
 * Advanced Customization
 * =============================================================================
 * Many parameters accept JavaScript expressions that are evaluated at runtime.
 * This allows for dynamic values and random elements in your line animations.
 * Examples:
 * - For varying line widths: Math.floor(5 + Math.random() * 10)
 * - For pulsing opacity: 128 + Math.sin(Graphics.frameCount * 0.1) * 64
 * - For size variation: 0.5 + Math.random() * 1.5
 * =============================================================================
 * Compatibility Notes
 * =============================================================================
 * - This plugin overrides the Scene_Title class
 * - May conflict with other plugins that modify the title screen
 * - For best compatibility, place this plugin lower in your plugin list
 * =============================================================================
 * Technical Details
 * =============================================================================
 * The plugin creates a specified number of Sprite_MoveLine instances, each with
 * its own movement pattern. These sprites are added to the title screen scene
 * behind other UI elements but in front of the background.
 * Each line has independent properties for:
 * - Position
 * - Movement speed and direction
 * - Scale/thickness
 * - Opacity
 * ================================================================
 * Version Log
 * ================================================================
 * 2020.02.29 (v1.0.0) - First Release.
 */

(() => {
  "use strict";

  const pluginParams = $plugins.filter(function (i) {
    return i.description.contains("<RS_TitleMoveLine>");
  });

  const pluginName = pluginParams.length > 0 && pluginParams[0].name;
  const parameters = pluginParams.length > 0 && pluginParams[0].parameters;

  const RS = window.RS || {};
  RS.TitleMoveLine = RS.TitleMoveLine || {};

  RS.TitleMoveLine.Params = {};
  RS.TitleMoveLine.Params.maxLines = Number(parameters["Max Lines"] || 8);
  RS.TitleMoveLine.Params.lineWidth = parameters["Line Width"];
  RS.TitleMoveLine.Params.bitmapColor = parameters["Bitmap Color"];

  RS.TitleMoveLine.Params.opacityEval = parameters["Opacity"];
  RS.TitleMoveLine.Params.scaleXEval = parameters["Scale"];
  RS.TitleMoveLine.Params.moveSpeedEval = parameters["Move Speed"];

  RS.TitleMoveLine.Params.imageName =
    parameters["Replace Bitmap As Image"] || "";

  //================================================================
  // Sprite_MoveLine
  //================================================================

  class Sprite_MoveLine extends Sprite {
    constructor(bitmap) {
      super(bitmap);
      this.initMembers();
    }

    initMembers() {
      this.opacity = eval(RS.TitleMoveLine.Params.opacityEval);
      this.scale.x = eval(RS.TitleMoveLine.Params.scaleXEval);
      this._power = eval(RS.TitleMoveLine.Params.moveSpeedEval);
    }

    update() {
      super.update();

      const width = Graphics.boxWidth;
      const bitmapWidth = this.width;

      this.x += this._power;

      if (this.x > width - bitmapWidth || this.x < 0) {
        this._power *= -1;
      }
    }
  }

  class Scene_TitleMoveLine extends Scene_Title {
    start() {
      super.start();

      this.createLineBitmap();
      this.initWithLines();
    }

    createLineBitmap() {
      const lineWidth = eval(RS.TitleMoveLine.Params.lineWidth);
      const lineHeight = Graphics.boxHeight;
      const imageName = RS.TitleMoveLine.Params.imageName;
      let bitmap = null;

      if (imageName !== "") {
        bitmap = ImageManager.loadPicture(imageName);
      }

      this._lineBitmap = bitmap ? bitmap : new Bitmap(lineWidth, lineHeight);
      if (!bitmap) {
        this._lineBitmap.fillAll(RS.TitleMoveLine.Params.bitmapColor);
      }
    }

    initWithLines() {
      this._lines = this.getLines();
      this.nextLines();
    }

    nextLines() {
      let line = this._lines.next();
      if (!line.done) {
        const child = line.value;
        const index = this.getChildIndex(this._windowLayer) - 1;
        this.addChildAt(child, index);
        this.nextLines();
      }
    }

    *getLines() {
      const maxLines = RS.TitleMoveLine.Params.maxLines;
      const boxWidth = Graphics.boxWidth;

      for (let i = 0; i < maxLines; i++) {
        const sprite = new Sprite_MoveLine();

        sprite.bitmap = this._lineBitmap;
        sprite.x = Math.random() * boxWidth;
        sprite.y = 0;

        yield sprite;
      }
    }
  }

  window.RS = RS;
  window.Scene_Title = Scene_TitleMoveLine;
})();
