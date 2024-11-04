/*:
 * @target MZ
 * @plugindesc This script is a plugin for RPG Maker MZ that enables a circular fade effect when moving around the map.
 * @author biud436
 * @url https://github.com/biud436/MZ
 *
 * @help
 * To enable the fade effect, you need to write the following note in the map properties.
 *
 * Map Note:
 * <fadeEffect>
 *
 * =============================================================================
 * Change Log
 * =============================================================================
 * 2024.11.04 (v1.0.0) - First Release.
 */
var Imported = Imported || {};
Imported.RS_MapFadeEffect2 = true;

(() => {
    const utils = {
        maxRadiusLimit: 300,
        /**
         * Starts linear interpolation
         *
         * @param {Number} t currentTime
         * @param {Number} b startValue
         * @param {Number} c changeInValue
         * @param {Number} d duration
         *
         * @returns
         */
        linearEase(t, b, c, d) {
            return (c * t) / d + b;
        },
        /**
         * Updates the mask effect with clockwise fill
         *
         * @param {PIXI.Graphics} mask
         * @param {Number} progress - progress from 0 to 1
         * @returns {PIXI.Graphics}
         */
        updateClockwiseMask(mask, progress) {
            progress = Math.min(1, Math.max(0, progress)) + 0.25;

            const centerX = Graphics.boxWidth / 2;
            const centerY = Graphics.boxHeight / 2;
            const radius = Graphics.boxWidth / 2 + this.maxRadiusLimit;

            mask.clear();
            mask.beginFill(0xffffff);

            mask.moveTo(centerX, centerY);

            mask.lineTo(centerX, centerY - radius);

            const endAngle = progress * Math.PI * 2;
            const segments = 120;
            for (let i = 0; i <= segments; i++) {
                const ratio = i / segments;
                const currentAngle = -Math.PI / 2 + endAngle * ratio;
                const x = centerX + Math.cos(currentAngle) * radius;
                const y = centerY + Math.sin(currentAngle) * radius;
                mask.lineTo(x, y);
            }

            if (progress >= 0.999) {
                mask.lineTo(centerX, centerY - radius);
            }

            mask.lineTo(centerX, centerY);
            mask.endFill();

            return mask;
        },
        /**
         * Read the map notes
         * @param {Number} mapId
         */
        readMapNotes() {
            const map = $dataMap;
            if (map && map.meta) {
                return map.meta;
            }
            return {};
        },
        /**
         * Checks whether the map has a fade effect.
         */
        hasFadeEffect() {
            const meta = utils.readMapNotes();
            return meta.fadeEffect;
        },
    };

    /**
     * =============================================================================
     * Game_Map
     * =============================================================================
     */
    const alias_Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function () {
        alias_Game_Map_initialize.call(this);

        this._fadeEffect = {
            radius: 0,
            currentDuration: 0,
            easing: utils.linearEase,
            isFadeIn: false,
            maxDuration: 24,
            progress: 0,
        };
        this._isFadeEffect = false;
    };

    const alias_Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        alias_Game_Map_setup.call(this, mapId);
        this._fadeEffect.radius = 0;
        this._fadeEffect.currentDuration = 0;
        this._isFadeEffect = false;
    };

    Game_Map.prototype.hasFadeEffect = function () {
        return utils.hasFadeEffect();
    };

    Game_Map.prototype.fadeEffect = function () {
        return this._fadeEffect;
    };

    Game_Map.prototype.isFadeEffect = function () {
        return $gamePlayer.isTransferring();
    };

    Game_Map.prototype.fadeIn = function () {
        this._fadeEffect.isFadeIn = true;
    };

    Game_Map.prototype.fadeOut = function () {
        this._fadeEffect.isFadeIn = false;
    };

    Game_Map.prototype.updateFadeEffect = function () {
        if (!this.hasFadeEffect()) {
            this._isFadeEffect = false;
            return;
        }

        const { currentDuration, maxDuration } = this._fadeEffect;

        this._fadeEffect.progress = currentDuration / maxDuration;

        if (currentDuration < maxDuration) {
            this._fadeEffect.currentDuration++;
        }

        this._isFadeEffect = true;
    };

    //============================================================================
    // Game_Player
    //============================================================================
    const alias_Game_Player_reserveTransfer =
        Game_Player.prototype.reserveTransfer;
    Game_Player.prototype.reserveTransfer = function (
        mapId,
        x,
        y,
        d,
        fadeType
    ) {
        alias_Game_Player_reserveTransfer.call(this, mapId, x, y, d, fadeType);
        const map = $gameMap;
        if (map.hasFadeEffect()) {
            map.fadeIn();
        }

        map.fadeEffect().currentDuration = 0;
    };

    /**
     * =============================================================================
     * Scene_Map
     * =============================================================================
     */

    const alias_Scene_Map_create = Scene_Map.prototype.create;
    Scene_Map.prototype.create = function () {
        alias_Scene_Map_create.call(this);
        this.initWithFadeEffect();
    };

    const alias_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        alias_Scene_Map_start.call(this);

        if (this._transfer) {
            $gameMap.fadeOut();
            $gameMap.fadeEffect().currentDuration = 0;
        }
    };

    Scene_Map.prototype.initWithFadeEffect = function () {
        this._fadeMask = new PIXI.Graphics();
        this.addChild(this._fadeMask);
    };

    const alias_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        alias_Scene_Map_update.call(this);
        this.updateFadeEffect();
    };

    Scene_Map.prototype.updateFadeEffect = function () {
        if (this._fadeDuration <= 0) {
            return;
        }

        const map = $gameMap;

        if (!map) {
            return;
        }

        if (map.isFadeEffect() || this._transfer) {
            map.updateFadeEffect();
            this._fadeMask = utils.updateClockwiseMask(
                this._fadeMask,
                map.fadeEffect().progress
            );

            this.mask = this._fadeMask;
        } else {
            this._fadeMask.clear();
            if (this.mask) {
                this.mask = null;
            }
        }
    };
})();
