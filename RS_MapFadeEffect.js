/*:
 * @target MZ
 * @plugindesc This plugin allows you to use a circular fade effect when moving around the map.
 * @author biud436
 * @url https://github.com/biud436/MZ
 *
 * @help
 * To enable the circular fade effect, you need to add the following note tag to the map.
 *
 * Map Note:
 * <fadeEffect>
 *
 * =============================================================================
 * Change Log
 * =============================================================================
 * 2024.06.16 (v1.0.0) - First Release.
 */
var Imported = Imported || {};
Imported.RS_MapFadeEffect = true;

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
         * Updates the mask effect
         *
         * @param {PIXI.Graphics}
         * @param {Number} radius
         *
         * @returns {PIXI.Graphics}
         */
        updateMask(mask, radius) {
            const maxRadius = Graphics.boxWidth / 2 + this.maxRadiusLimit;
            if (radius < 0) {
                radius = 0;
            }
            if (radius > maxRadius) {
                radius = maxRadius;
            }

            mask.clear();
            mask.beginFill(0xffffff);
            mask.drawCircle(
                Graphics.boxWidth / 2,
                Graphics.boxHeight / 2,
                radius
            );
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
        };
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

        if (this._fadeEffect.isFadeIn) {
            this._fadeEffect.radius = this._fadeEffect.easing(
                this._fadeEffect.currentDuration,
                Graphics.boxWidth / 2 + utils.maxRadiusLimit,
                -Graphics.boxWidth / 2 - utils.maxRadiusLimit,
                this._fadeEffect.maxDuration
            );
        } else {
            this._fadeEffect.radius = this._fadeEffect.easing(
                this._fadeEffect.currentDuration,
                0,
                Graphics.boxWidth / 2 + utils.maxRadiusLimit,
                this._fadeEffect.maxDuration
            );
        }

        if (this._fadeEffect.currentDuration < this._fadeEffect.maxDuration) {
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
            console.log(map.fadeEffect().radius);
            map.updateFadeEffect();
            this._fadeMask = utils.updateMask(
                this._fadeMask,
                map.fadeEffect().radius
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
