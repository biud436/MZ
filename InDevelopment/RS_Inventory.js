/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
//================================================================
// RS_Inventory.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2024 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================
/*:
 * @target MZ
 * @plugindesc <RS_Inventory>
 * @author biud436
 *
 * @param variableId
 * @text variableId
 *
 * @param variableIdX
 * @text variableIdX
 * @parent variableId
 * @type variable
 * @desc Store x-position of inventory window to certain game variable.
 * @default 9
 *
 * @param variableIdY
 * @text y variable ID
 * @parent variableId
 * @type variable
 * @desc Store y-position of inventory window to specific game variable.
 * @default 10
 *
 * @param item-box
 *
 * @param item-width
 * @parent item-box
 * @type number
 * @desc the width of item slot.
 * @default 32
 *
 * @param item-height
 * @parent item-box
 * @type number
 * @desc the height of item slot.
 * @default 32
 *
 * @param divide-area-for-height
 * @type number
 * @desc the number of item slot in one row.
 * @default 8
 *
 * @help
 */

(() => {
    "use strict";

    /**
     * @type {Game_Inventory}
     */
    let $gameInventory = {};

    /**
     * Below parameters are used to change the style of the text.
     * in the future, it will be added to the plugin parameters.
     */
    const StyleSheet = {
        gold: {
            align: "right",
            breakWords: true,
            dropShadow: true,
            dropShadowBlur: 1,
            dropShadowColor: "#585858",
            dropShadowDistance: 0,
            fill: ["#af8f45", "#4b4943"],
            fontSize: 16,
            fontWeight: "bold",
            stroke: "#d3d3d3",
            strokeThickness: 2,
            wordWrap: true,
            wordWrapWidth: 300,
        },
        normalText: {
            breakWords: true,
            fillGradientStops: [0],
            fill: "white",
            stroke: "black",
            strokeThickness: 2,
            wordWrap: true,
        },
        redText: {
            breakWords: true,
            dropShadow: true,
            dropShadowBlur: 1,
            dropShadowColor: "#262626",
            dropShadowDistance: 0,
            fill: "#f20000",
            strokeThickness: 1,
            wordWrap: true,
        },
        yellowText: {
            breakWords: true,
            dropShadow: true,
            dropShadowBlur: 1,
            dropShadowColor: "#262626",
            dropShadowDistance: 0,
            fill: ["#eff2b7", "#e3e97e"],
            fillGradientStops: [0],
            strokeThickness: 1,
            wordWrap: true,
        },
        blueGlowText: {
            breakWords: true,
            dropShadow: true,
            dropShadowBlur: 6,
            dropShadowColor: "#71f4ca",
            dropShadowDistance: 0,
            fillGradientStops: [0],
            fontWeight: 600,
            stroke: "white",
            strokeThickness: 2,
            wordWrap: true,
        },
    };

    /**
     * @type {{parameters: {
     * [key in 'item-width' | 'item-height' | 'divide-area-for-height']: string;
     * } | Record<string, string>}}
     */
    const { parameters } = $plugins.filter(function (i) {
        return i.description.contains("<RS_Inventory>");
    })[0];

    /**
     * @type {Record<'MOUSE_OVER' | 'MOUSE_OUT' | 'DRAGGING', any>}
     */
    const MOUSE_STATE = {
        MOUSE_OVER: "MOUSE_OVER",
        MOUSE_OUT: "MOUSE_OUT",
        DRAGGING: "DRAGGING",
    };

    /**
     * Params
     *
     * @enum {{ id: Point, itemBox: {width: number, height: number}, maxRows: number}}
     */
    const Params = {};

    /**
     * @type {Point}
     */
    Params.id = new Point(
        Number(parameters.variableIdX),
        Number(parameters.variableIdY)
    );

    Params.itemBox = {
        width: Number(parameters["item-width"]),
        height: Number(parameters["item-height"]),
    };

    Params.maxRows = Number(parameters["divide-area-for-height"]);

    //==========================================================
    // Game_Temp
    //==========================================================

    Object.defineProperty(Game_System, "inventoryX", {
        get() {
            const variableId = Params.id.x;
            return $gameVariables.value(variableId);
        },
        set(value) {
            const variableId = Params.id.x;
            $gameVariables.setValue(variableId, value);
        },
        configurable: true,
    });

    Object.defineProperty(Game_System, "inventoryY", {
        get() {
            const variableId = Params.id.y;
            return $gameVariables.value(variableId);
        },
        set(value) {
            const variableId = Params.id.y;
            $gameVariables.setValue(variableId, value);
        },
        configurable: true,
    });

    //==========================================================
    // ItemCommand
    //==========================================================

    class ItemCommand {
        /**
         *
         * @param {Game_BattlerBase|Game_Battler|Game_Actor|Game_Enemy} user
         * @param {RPG.UsableItem} item
         */
        constructor(user, item) {
            this._user = user;
            this._item = new Game_Item(item);
        }

        itemTargetActors() {
            const action = new Game_Action($gameParty.leader());
            action.setItemObject(this._item.object());
            if (!action.isForFriend()) {
                return [];
                // eslint-disable-next-line no-else-return
            } else if (action.isForAll()) {
                return $gameParty.members();
            } else {
                return [$gameParty.members()[0]];
            }
        }

        run() {
            const item = this._item;
            const numOfItem = $gameParty.numItems(item.object());

            if (!item) {
                return;
            }

            if (numOfItem <= 0) {
                return;
            }

            const { _user: user } = this;
            const action = new Game_Action(user);

            if (item.isItem()) {
                action.setItemObject(item.object());

                this.itemTargetActors().forEach((target) => {
                    for (let i = 0; i < action.numRepeats(); i++) {
                        action.apply(target);
                    }
                });

                action.applyGlobal();

                $gameParty.gainItem(item.object(), -1);

                SoundManager.playUseItem();
            }
        }
    }

    //==========================================================
    // Observer
    //==========================================================

    /**
     * @class Observer
     */
    class Observer {
        value = 0;

        /**
         * lazy하게 값을 평가하기 위한 참조 값입니다.
         *
         * @type {() => number}
         */
        ref = () => 0;

        constructor() {
            this.value = 0;
            this.ref = () => 0;
        }

        set value(value) {
            this.value = value;
        }

        /**
         * lazy하게 값을 평가하기 위한 참조 값을 설정합니다.
         */
        set ref(ref) {
            this.ref = ref;
        }

        update() {
            if (!this.ref) return;
            if (typeof this.ref !== "function") return;
            if (this.value === this.ref()) return;

            $gameMap.requestRefresh();

            this.value = this.ref();
        }
    }

    //==========================================================
    // ItemObserver
    //==========================================================

    /**
     * @class ItemObserver
     */
    class ItemObserverContainer {
        constructor() {
            this.container = new WeakMap();
        }

        gainItem(item, amount) {
            const itemObserver = this.container.get(item);
            if (!itemObserver) {
                this.container.set(item, new Observer());
            }

            const observer = this.container.get(item);
            observer.ref = () => $gameParty.numItems(item);
            observer.value = $gameParty.numItems(item) + amount;

            observer.update();
        }

        update() {
            for (let [, observer] of this.container) {
                observer.update();
            }
        }
    }

    //==========================================================
    // Dispatcher
    //==========================================================

    class Dispatcher {
        constructor() {
            this.observers = [];
        }

        addObserver(observer) {
            this.observers.push(observer);
        }

        removeObserver(observer) {
            const observerIndex = this.observers.indexOf(observer);
            if (observerIndex > -1) {
                this.observers.splice(observerIndex, 1);
            }
        }

        notifyObservers() {
            for (let observer of this.observers) {
                observer.update();
            }
        }
    }

    const $dispatcher = new Dispatcher();

    //==========================================================
    // Logger
    //==========================================================

    /**
     *
     * @param {String} message
     */
    function logger(message) {
        console.log("Logger: ", message);
    }

    //==========================================================
    // DraggingableSprite
    //==========================================================

    class DraggingableSprite extends Sprite {
        constructor() {
            super();
            this.initMembers();
            this.initComponents();
            this.on("removed", this.dispose, this);
        }

        dispose() {
            this.removeComponents();
        }

        initMembers() {
            const { width: w, height: h } = Params.itemBox;

            this._size = new Rectangle(0, 0, w, h);
            this._divideAreaForHeight = Params.maxRows;
            this._startX = this.x;
            this._startY = this.y;
            this._draggingTime = 0;

            /**
             * @type {'MOUSE_OVER'|'MOUSE_OUT'|'DRAGGING'|'CLICKED'|'NONE'}
             */
            this._currentState = "";
        }

        /**
         * 이벤트 리스너를 생성합니다.
         * @method initComponents
         */
        initComponents() {
            this.on("onDragStart", this.onDragStart, this);
            this.on("onDragEnd", this.onDragEnd, this);
            this.on("onDragMove", this.onDragMove, this);
            this.on("onButtonTriggered", this.onButtonTriggered, this);
            this.on("onButtonReleased", this.onButtonReleased, this);
            this.on("onButtonEnter", this.onButtonEnter, this);
            this.on("onButtonExit", this.onButtonExit, this);
            console.log("initComponents");
        }

        /**
         * 이벤트 리스너를 제거합니다.
         * @method removeComponents
         */
        removeComponents() {
            this.off("onDragStart", this.onDragStart, this);
            this.off("onDragEnd", this.onDragEnd, this);
            this.off("onDragMove", this.onDragMove, this);
            this.off("onButtonTriggered", this.onButtonTriggered, this);
            this.off("onButtonReleased", this.onButtonReleased, this);
            this.off("onButtonEnter", this.onButtonEnter, this);
            this.off("onButtonExit", this.onButtonExit, this);
        }

        /**
         * 드래그 시작
         * @param {MouseEvent} event
         */
        emitOnDragStart(event) {
            if (this.children != null) {
                this.children.forEach((e) => {
                    e.emit("onDragStart", event);
                    e.emit("onButtonTriggered", event);
                });
            }
        }

        /**
         * 드래그 종료
         * @param {MouseEvent} event
         */
        emitOnDragEnd(event) {
            if (this.children != null) {
                this.children.forEach((e) => {
                    e.emit("onDragEnd", event);
                    e.emit("onButtonReleased", event);
                });
            }
        }

        /**
         * 드래그 중
         * @param {MouseEvent} event
         */
        emitOnDragMove(event) {
            if (this.children != null) {
                this.children.forEach((e) => {
                    e.emit("onDragMove", event);
                });
            }
        }

        emitOnButtonEnter(event) {
            if (this.children != null) {
                this.children.forEach((e) => {
                    e.emit("onButtonEnter", event);
                });
            }
        }

        emitOnButtonExit(event) {
            if (this.children != null) {
                this.children.forEach((e) => {
                    e.emit("onButtonExit", event);
                });
            }
        }

        isInside(data) {
            if (!this.parent) return false;

            const px = this.parent.x || 0;
            const py = this.parent.y || 0;
            const x = px + this.x;
            const y = py + this.y;
            const mx = data.x;
            const my = data.y;
            const tw = x + this._size.width;
            const th = y + this._size.height / this._divideAreaForHeight;
            let inside = false;

            if (mx > x && mx < tw) {
                if (my > y && my < th) {
                    inside = true;
                }
            }

            return inside;
        }

        /**
         * @param {MouseEvent} event 마우스 이벤트
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onDragStart(event, skipEmit) {
            this.data = new PIXI.Point(
                Graphics.pageToCanvasX(event.pageX),
                Graphics.pageToCanvasY(event.pageY)
            );
            const inside = this.isInside(this.data);
            if (inside && event.button === 0) {
                this.padding = new PIXI.Point(
                    this.data.x - this.x,
                    this.data.y - this.y
                );
                this.alpha = 0.5;
                this.dragging = true;
                this._draggingTime = 0;
            }

            if (!skipEmit) this.emitOnDragStart(event);
            this.onButtonExit(event);
        }

        /**
         * onDragEnd 이벤트 리스너
         * @param {MouseEvent} event 마우스 이벤트
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onDragEnd(event, skipEmit) {
            this.alpha = 1;
            this.dragging = false;
            this._draggingTime = 0;
            this.data = null;
            this.padding = null;

            if (!skipEmit) this.emitOnDragEnd(event);
        }

        /**
         * onDragMove 이벤트 리스너
         * @param {MouseEvent} event 마우스 이벤트
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onDragMove(event, skipEmit) {
            if (!this.dragging) {
                const data = new PIXI.Point(
                    Graphics.pageToCanvasX(event.pageX),
                    Graphics.pageToCanvasY(event.pageY)
                );

                if (this.isInside(data)) {
                    if (this._currentState !== MOUSE_STATE.MOUSE_OVER) {
                        this._currentState = MOUSE_STATE.MOUSE_OVER;
                    }
                    this.onButtonEnter(event);
                } else {
                    if (this._currentState === MOUSE_STATE.MOUSE_OVER) {
                        this.onButtonExit(event);
                    }
                    this._currentState = MOUSE_STATE.MOUSE_OUT;
                }
            }

            if (this.dragging) {
                this._currentState = MOUSE_STATE.DRAGGING;
                this.data = new PIXI.Point(
                    Graphics.pageToCanvasX(event.pageX),
                    Graphics.pageToCanvasY(event.pageY)
                );
                const newPosition = this.data;
                this.x = newPosition.x - this.padding.x;
                this.y = newPosition.y - this.padding.y;
                if (!this._draggingTime) this._draggingTime = 0;
                this._draggingTime++;
            }
            if (!skipEmit) this.emitOnDragMove(event);
        }

        /**
         * 부모에 대한 상대 좌표를 절대 좌표로 변경합니다.
         * @param {Number} x
         */
        canvasToLocalX(x) {
            let node = this;
            while (node) {
                x -= node.x;
                node = node.parent;
            }
            return x;
        }

        /**
         * 부모에 대한 상대 좌표를 절대 좌표로 변경합니다.
         * @param {Number} y
         */
        canvasToLocalY(y) {
            let node = this;
            while (node) {
                y -= node.y;
                node = node.parent;
            }
            return y;
        }

        /**
         * 버튼을 눌렀을 때
         * @param {MouseEvent} event
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onButtonTriggered(event, skipEmit) {
            console.log("event", event);
            console.log("skipEmit", skipEmit);
        }

        /**
         * 버튼을 똈을 때
         * @param {MouseEvent} event
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onButtonReleased(event, skipEmit) {}

        /**
         * onButtonEnter
         * @param {MouseEvent} event
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onButtonEnter(event, skipEmit) {}

        /**
         * onButtonExit
         * @param {MouseEvent} event
         * @param {Boolean} skipEmit true이면 자식에게 이벤트가 전파되지 않습니다.
         */
        onButtonExit(event, skipEmit) {}

        setAnchor(x, y) {
            this.pivot.set(x, y);
        }
    }

    //==========================================================
    // InventoryItem
    //==========================================================

    const assignValues = Symbol("assignValues");

    class InventoryItem extends DraggingableSprite {
        /**
         * @param {Number} index the index into an inventory.
         * @param {Object} item the object contains the information for the item.
         */
        constructor(index, slotIndex) {
            super();
            this._index = index;
            this._slotIndex = slotIndex;
            this.setAnchor(0.5, 0.5);
            this._item = null;
            this.initBitmaps();
        }

        initMembers() {
            super.initComponents();

            const { width: w, height: h } = Params.itemBox;

            /**
             * @type {{_size: Rectangle; }}
             */
            this._size = new PIXI.Rectangle(0, 0, w, h);
            this._divideAreaForHeight = 1;
            this._isOnTooltip = false;

            /**
             * @type {{_startX: number;}}
             */
            this._startX = this.x;

            /**
             * @type {{_startY: number;}}
             */
            this._startY = this.y;

            /**
             * @type {{_lastButton: number;}}
             */
            this._lastButton = 0;
        }

        getItem() {
            return this._item.item;
        }

        initBitmaps() {
            this._item = $gameInventory._slots[this._slotIndex];

            const { width: w, height: h } = this._size;

            const bitmap = ImageManager.loadSystem("IconSet");
            const { iconIndex } = this._item;
            const pw = ImageManager.iconWidth;
            const ph = ImageManager.iconHeight;
            const sx = (iconIndex % 16) * pw;
            const sy = Math.floor(iconIndex / 16) * ph;

            const num = $gameParty.numItems(this._item.item);

            this._background = new Sprite(new Bitmap(w, h));
            this._background.bitmap.fontSize = 12;
            this._background.bitmap.blt(bitmap, sx, sy, pw, ph, 0, 0);
            this._background.bitmap.textColor = "white";
            this._background.bitmap.drawText(
                num,
                0,
                (h - 2) / 6,
                w - 2,
                h,
                "right"
            );

            this.addChild(this._background);
        }

        update() {
            super.update();
        }

        /**
         * To call this method, you need to pass unique symbol to the method name.
         *
         * @param {(w: number, h: number, dw: number) => void} func
         */
        [assignValues](func) {
            const { width: w, height: h } = this._size;
            const dw = w * Params.maxRows;

            func(w, h, dw);
        }

        savePosition() {
            this[assignValues]((w, h, dw) => {
                this._startX = this.x.clamp(0, dw - w);
                this._startY = this.y.clamp(h, dw - h);
                this._startPX = this.x.clamp(0, dw - w);
                this._startPY = this.y.clamp(h, dw - h);
            });
        }

        updatePosition() {
            this[assignValues]((w, h, dw) => {
                this._startPX = this.x.clamp(0, dw - w);
                this._startPY = this.y.clamp(h, dw - h);
            });
        }

        checkRestorePosition() {
            if (!this.parent) return;

            const w = this._size.width;
            const h = this._size.height;
            const pw = this.parent._size.width;
            const ph = this.parent._size.height;
            const startY = this._startY;
            const { x, y } = this;

            if (x < 0 || x > pw - w) {
                this.x = this._startPX;
            }
            if (y < h || startY > ph - h) {
                this.y = this._startPY;
            }
        }

        setGrid() {
            const { parent } = this;
            if (!parent) return;

            const { width: w, height: h } = this._size;
            const { maxRows } = Params;

            // 그리드 좌표를 구함 (32등분)
            const gridX = Math.floor(this.x / w).clamp(0, maxRows - 1);
            const gridY = Math.floor(this.y / h).clamp(0, maxRows - 1);

            // 그리드에서의 인덱스를 찾는다 (0 ~ 63)
            const index = maxRows * gridY + gridX - maxRows;

            // 해당 슬롯에 아이템이 있는지 확인
            if (!$gameInventory.isExist(index)) {
                this.x = gridX * w;
                this.y = gridY * h;

                const prevIndex = this._index;
                this._index = index;

                $gameInventory.moveTo(prevIndex, index);
            } else {
                // 아이템이 있는 위치에는 옮길 수 없다.
                // 나중에 교환 처리로 바꾸자.
                this.x = this._startX;
                this.y = this._startY;
            }
        }

        onDragStart(event) {
            this._isDragEnd = false;
            this.savePosition();
            super.onDragStart(event, true);
        }

        onDragEnd(event) {
            super.onDragEnd(event, true);
            // 그리드에 정렬합니다.
            if (
                !this._isDragEnd &&
                event.button === 0 &&
                this._lastButton !== 2
            ) {
                this.setGrid();
            }
            // 이 플래그가 없으면 그리드 함수가 6번 연속으로 실행되면서 버그를 일으킨다.
            this._isDragEnd = true;
            this._lastButton = event.button;
        }

        onDragMove(event) {
            this.updatePosition();
            super.onDragMove(event, true);
            if (this.dragging && event.button === 0) {
                // 밖으로 드래그 못하게 합니다.
                this.checkRestorePosition();
            }
        }

        /**
         * @param {MouseEvent} event
         */
        onButtonTriggered(event, skipEmit) {
            if (this.dragging) {
                this.scale.x = 0.8;
                this.scale.y = 0.8;
                this._fire = true;
            }
        }

        onButtonEnter(event, skipEmit) {
            super.onButtonEnter(event, skipEmit);
            console.log("onButtonEnter");
            if (this.parent) {
                this.parent.openTooltip(this);
            }
        }

        onButtonExit(event, skipEmit) {
            super.onButtonExit(event, skipEmit);
            console.log("onButtonExit");
            if (this.parent) {
                this.parent.closeTooltip();
            }
        }

        /**
         * 드래깅 중인지 판단합니다.
         * @return {Boolean} ret 드래깅 중이면 true, 아니면 false
         */
        isValidDragging() {
            const x = this._startX;
            const px = this._startPX;
            const y = this._startY;
            const py = this._startPY;

            if (
                Math.abs(px - x) > this._size.width * 0.3 ||
                Math.abs(py - y) > this._size.height * 0.3
            ) {
                SoundManager.playEquip();
                return true;
            }

            return false;
        }

        /**
         * @param {MouseEvent} event
         */
        onButtonReleased(event, skipEmit) {
            if (this._fire) {
                this.scale.x = 1.0;
                this.scale.y = 1.0;
                this._fire = false;

                // 드래깅 중이라면 아이템 사용 처리를 하지 않는다.
                if (this.isValidDragging()) {
                    return;
                }

                const itemCommand = new ItemCommand(
                    $gameParty.leader(),
                    this._item.item
                );
                itemCommand.run();
            }
        }
    }

    //==========================================================
    // ToolTip
    //==========================================================

    Params.Tooltip = {
        fontFace: "나눔고딕",
        fontSize: 18,
        textColor: "white",
        outlineWidth: 1,
        outlineColor: "blue",
    };

    class Tooltip extends Sprite {
        constructor(bitmap) {
            super(bitmap);
            this.initMembers();
            this.createTextLayer();
        }

        initMembers() {
            this._size = new PIXI.Rectangle(0, 0, 128, 256);
        }

        /**
         * Init with text layer.
         */
        createTextLayer() {
            this._textLayer = new Sprite();
            this.addChild(this._textLayer);
        }

        #makeNormalColor(width, fontSize = 16) {
            const wordWrapWidth = width || this._size.width;
            const style = new PIXI.TextStyle({
                ...StyleSheet.normalText,
                fontSize,
                wordWrapWidth,
            });

            return style;
        }

        #makeRedColor(width, fontSize = 16) {
            const wordWrapWidth = width || this._size.width;
            const style = new PIXI.TextStyle({
                ...StyleSheet.redText,
                fontSize,
                wordWrapWidth,
            });

            return style;
        }

        #makeYellowColor(width, fontSize = 16) {
            const wordWrapWidth = width || this._size.width;
            const style = new PIXI.TextStyle({
                ...StyleSheet.yellowText,
                fontSize,
                wordWrapWidth,
            });

            return style;
        }

        #makeBlueGlowColor(width, fontSize = 16) {
            const wordWrapWidth = width || this._size.width;
            const style = new PIXI.TextStyle({
                ...StyleSheet.blueGlowText,
                fontSize,
                wordWrapWidth,
            });

            return style;
        }

        makeColor(color, fontSize = 16, width = 0) {
            width = width || this._size.width;

            switch (color) {
                // eslint-disable-next-line default-case-last
                default:
                case "normal":
                    return this.#makeNormalColor(width, fontSize);
                case "red":
                    return this.#makeRedColor(width, fontSize);
                case "yellow":
                    return this.#makeYellowColor(width, fontSize);
                case "blue":
                    return this.#makeBlueGlowColor(width, fontSize);
            }
        }

        addDescription(textObject) {
            if (!this._textLayer) {
                this.createTextLayer();
            }
            if (!(textObject instanceof PIXI.Text)) return;
            this._textLayer.addChild(textObject);
        }

        /**
         *
         * @param {*} x
         * @param {*} y
         * @param {*} text
         * @param {*} color
         *
         * @return {PIXI.Text}
         */
        makeText(x, y, text, color) {
            const textObj = new PIXI.Text(text, this.makeColor(color));
            textObj.x = x;
            textObj.y = y;

            return textObj;
        }

        clear() {
            this.removeChildren();
            this.createTextLayer();

            if (!this.bitmap) {
                this.bitmap = new Bitmap(128, 256);
            }

            this.bitmap.clear();
            this.bitmap.fillAll("rgba(0, 0, 0, 0.6)");
        }

        /**
         * @param {RPG.BaseItem} item
         */
        isValid(item) {
            return (
                DataManager.isItem(item) ||
                DataManager.isWeapon(item) ||
                DataManager.isArmor(item)
            );
        }

        /**
         * @param {RPG.BaseItem} item
         */
        refresh(item) {
            if (!this.isValid(item)) {
                return;
            }

            this.clear();

            // 누적 변수를 선언합니다.
            let lineHeight = 0;
            const pad = 2;

            // 아이템 이름 (빨강)
            const itemName = this.makeText(0, 0, item.name, "red");
            lineHeight += itemName.height;
            lineHeight += pad;

            this.addDescription(itemName);

            // 아이템 설명 (노랑)
            const itemDesc = this.makeText(
                0,
                lineHeight,
                item.description,
                "yellow"
            );
            lineHeight += itemDesc.height;
            lineHeight += pad;

            this.addDescription(itemDesc);
        }
    }

    //==========================================================
    // InventoryView
    //==========================================================

    class InventoryView extends DraggingableSprite {
        constructor() {
            super();
            this.initBitmaps();
            this.initBackground();
            this.initSlots();
            this.drawAllItems();
            this.initTooltip();
        }

        initComponents() {
            document.addEventListener("mousedown", this.onDragStart.bind(this));
            document.addEventListener("mouseup", this.onDragEnd.bind(this));
            document.addEventListener("mousemove", this.onDragMove.bind(this));
        }

        removeComponents() {
            document.removeEventListener(
                "mousedown",
                this.onDragStart.bind(this)
            );
            document.removeEventListener("mouseup", this.onDragEnd.bind(this));
            document.removeEventListener(
                "mousemove",
                this.onDragMove.bind(this)
            );
        }

        initMembers() {
            super.initMembers();

            const itemHeight = Params.itemBox.height;

            this._divideAreaForHeight = Params.maxRows;

            this._size = new PIXI.Rectangle(0, 0, 256, 256);
            this._backgroundBitmap = new Bitmap(
                this._size.width,
                this._size.height + itemHeight
            );
            this._background = new Sprite();
            this._data = $gameInventory.slots();
            this._itemLayer = [];
            this._itemIndex = 0;

            this._mousePos = new PIXI.Point(0, 0);
            this._currentState = "NONE";
            this._mouseButtonReleased = false;

            this._velocityX = 0;
            this._velocityY = 0;

            this._paddingX = 0;
            this._paddingY = 0;
        }

        refresh() {
            if (!this._backgroundBitmap) return;
            this._data = $gameInventory.slots(); // 인벤토리에서 슬롯을 가지고 온다.
            this._backgroundBitmap.clear();
            this.removeChild.call(this, ...this._itemLayer); // 아이템 스프라이트를 모두 제거한다.
            this.initBitmaps();
            this.initSlots();
            this._background.bitmap = this._backgroundBitmap;
        }

        initBitmaps() {
            this._backgroundBitmap.fillAll("black"); // 인벤토리를 검은색으로 채운다.
            this._backgroundBitmap.fontSize = 14;
        }

        initBackground() {
            this._background.bitmap = this._backgroundBitmap;
            this._background.opacity = 200;
            this.addChild(this._background);
        }

        initTooltip() {
            this._tooltip = new Tooltip();
            this._tooltip.visible = false;
            this.addChild(this._tooltip);
        }

        /**
         * @param {InventoryItem} item
         */
        openTooltip(item) {
            if (!this._tooltip) return;
            this._tooltip.visible = true;
            this._tooltip.x = item.x;
            this._tooltip.y = item.y + item._size.height;
            this._tooltip.refresh(item.getItem());
        }

        closeTooltip() {
            if (!this._tooltip) return;
            this._tooltip.visible = false;
        }

        resetIndex() {
            this._itemIndex = 0;
            this._itemLayer = [];
        }

        setInventoryTitle(titleValue) {
            // https://pixijs.io/pixi-text-style/#%7B%22style%22%3A%7B%22align%22%3A%22center%22%2C%22dropShadow%22%3Atrue%2C%22dropShadowBlur%22%3A1%2C%22dropShadowColor%22%3A%22%23585858%22%2C%22dropShadowDistance%22%3A0%2C%22fill%22%3A%5B%22%23dd863e%22%2C%22%23fef7da%22%5D%2C%22fontSize%22%3A16%2C%22strokeThickness%22%3A1%7D%2C%22text%22%3A%22text%22%2C%22background%22%3A%22%23252525%22%7D
            const style = new PIXI.TextStyle({
                dropShadow: true,
                dropShadowBlur: 1,
                dropShadowColor: "#585858",
                dropShadowDistance: 0,
                fill: ["#dd863e", "#fef7da"],
                fontSize: 16,
                fontWeight: "bold",
                strokeThickness: 1,
            });

            const text = new PIXI.Text(titleValue, style);
            text.x = 1;
            this._itemLayer.push(text);
            this.addChild(text);
        }

        drawGold() {
            const { currencyUnit } = TextManager;
            const goldValue = `${$gameParty.gold()} ${currencyUnit}`;

            const style = new PIXI.TextStyle(StyleSheet.gold);

            const text = new PIXI.Text(goldValue, style);
            const itemHeight = Params.itemBox.height;
            const { maxRows } = Params;
            text.x = this._size.width - text.width;
            text.y = itemHeight * maxRows;
            this._itemLayer.push(text);
            this.addChild(text);
        }

        createTable(itemWidth, itemHeight) {
            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 8; x++) {
                    const mx = itemWidth * x;
                    const my = itemHeight + itemHeight * y;
                    // 슬롯 색상 값을 램덤으로 한다. (다시 그려진다는 것을 효과적으로 확인하기 위해)
                    const color = "rgba(30,30,30,0.75)";
                    this._backgroundBitmap.fillRect(
                        mx,
                        my,
                        itemWidth - 2,
                        itemHeight - 2,
                        color
                    );

                    // 0부터
                    const data = $gameInventory.slots();
                    const item = data[this._itemIndex];

                    if (item) this.addItem(item, mx, my, itemWidth, itemHeight);
                }
            }
        }

        addItem(item, mx, my, itemWidth, itemHeight) {
            const itemSprite = new InventoryItem(item.slotId, this._itemIndex);

            const maxRows = this._divideAreaForHeight;

            mx = itemWidth * (item.slotId % maxRows);
            my = itemHeight + itemHeight * Math.floor(item.slotId / maxRows);

            itemSprite.x = mx;
            itemSprite.y = my;

            this._itemLayer.push(itemSprite);

            this.addChild(itemSprite);

            this._itemIndex += 1;
        }

        initSlots() {
            // 전체 테이블의 크기
            const { width, height } = this._size;

            const maxRows = this._divideAreaForHeight;

            // 아이템 슬롯의 크기
            const itemWidth = Math.floor(width / maxRows);
            const itemHeight = Math.floor(height / maxRows);

            this.resetIndex();

            // 타이틀 설정
            this.setInventoryTitle("Grid Inventory");

            // 테이블 생성
            this.createTable(itemWidth, itemHeight);

            // 골드 값 표시
            this.drawGold();
        }

        update() {
            super.update();
            this.updateState();
            // this.updateVelocity();
        }

        updateVelocity() {
            if (!this._mousePos) return;
            if (!this.isMouseClicked()) return;
            this._velocityX = this._mousePos.x - (this.x + this._paddingX);
            this._velocityY = this._mousePos.y - (this.y + this._paddingY);

            this._velocityX /= 50;
            this._velocityY /= 50;

            this.x += this._velocityX;
            this.y += this._velocityY;
        }

        #isMouseIn() {
            const itemHeight = Params.itemBox.height;
            const { width, height } = this._size;
            const { x, y } = this;
            const { x: mouseX, y: mouseY } = this._mousePos;

            return (
                mouseX < x + width &&
                mouseX > x &&
                mouseY < y + height + itemHeight &&
                mouseY > y
            );
        }

        updateState() {
            if (this.#isMouseIn()) {
                if (this.dragging && this._mouseButtonReleased) {
                    this._currentState = "CLICKED";
                    this._mouseButtonReleased = false;
                    if (this._background)
                        this._background.setColorTone([60, 60, 60, 60]);
                } else if (!this.dragging) {
                    this._mouseButtonReleased = true;
                    this._currentState = "MOUSE_OVER";
                    if (this._background)
                        this._background.setColorTone([30, 30, 30, 30]);
                }
            } else {
                this._currentState = "MOUSE_OUT";
                if (this._background)
                    this._background.setColorTone([0, 0, 0, 0]);
            }
        }

        isMouseOut() {
            return this._currentState === "MOUSE_OUT";
        }

        isMouseOver() {
            return this._currentState === "MOUSE_OVER";
        }

        isMouseClicked() {
            return this._currentState === "CLICKED";
        }

        drawAllItems() {
            const max = this._data.length;
        }

        /**
         * @param {MouseEvent} event
         */
        onDragStart(event) {
            super.onDragStart(event, false);
            if (this.isMouseOver()) {
                this._paddingX = this._mousePos.x - this.x;
                this._paddingY = this._mousePos.y - this.y;
            }
        }

        /**
         * @param {MouseEvent} event
         */
        onDragEnd(event) {
            super.onDragEnd(event, false);
            // 메뉴 진입 시 인벤토리 위치를 기억한다.
            $gameSystem.inventoryX = this.x;
            $gameSystem.inventoryY = this.y;
        }

        /**
         * @param {MouseEvent} event
         */
        onDragMove(event) {
            super.onDragMove(event, false);
            if (this._mousePos) {
                this._mousePos = new PIXI.Point(
                    Graphics.pageToCanvasX(event.pageX),
                    Graphics.pageToCanvasY(event.pageY)
                );
            }
        }
    }

    //==========================================================
    // Inventory
    //==========================================================

    class Inventory extends Sprite {
        constructor() {
            super();
            this.initMembers();
            this.initView();
            this.restorePosition();
            this.on("removed", this.dispose, this);
        }

        dispose() {
            if (this.children) {
                this.children.forEach((e) => {
                    this.removeChild(e);
                });
            }
        }

        initMembers() {
            const {
                itemBox: { width, height },
                maxRows,
            } = Params;
            this._size = new Rectangle(0, 0, width * maxRows, height * maxRows);
        }

        initView() {
            this._view = new InventoryView();
            this.addChild(this._view);
        }

        isTouched() {
            return this._view.isMouseOver();
        }

        isDragging() {
            return this._view.isMouseClicked() && this._view.dragging;
        }

        restorePosition() {
            if (!this._view) return;
            //TODO: $gameSystem이 아직 초기화되지 않은 경우에 해당한다.
            this._view.x = $gameSystem.inventoryX || 0;
            this._view.y = $gameSystem.inventoryY || 0;
        }

        refresh() {
            if (!this._view) return;
            this._view.refresh();
        }

        update() {
            super.update();

            $dispatcher.notifyObservers();
        }
    }

    //==========================================================
    // Game_Inventory
    //==========================================================

    class Game_Inventory {
        constructor() {
            this.initMembers();
        }

        initialize() {
            /**
             * 복구용 슬롯
             * @type {Array<number>}
             */
            this._restoreSlots = [];
            // 멤버 변수 생성
            this.initMembers();
            // 저장
            this.save();
            // 인벤토리 준비
            this.prepareInventory();

            logger("initialize");
        }

        initMembers() {
            // 최대 슬롯수
            this._maxSlots = 64;

            /**
             * 슬롯
             * @type {{item: rm.types.BaseItem; name: string; iconIndex: number; description: string; slotId: number; }[]}
             */
            this._slots = [];
            // 준비 여부
            this._prepared = false;
            /**
             * 슬롯 아이디
             * @type {number}
             */
            this._id = 0;

            logger("initMembers");
        }

        slots() {
            return this._slots;
        }

        /**
         * 인벤토리 시스템에 맞는 아이템 오브젝트를 생성한다.
         */
        prepareInventory() {
            // 모든 아이템을 가져온다
            const data = $gameParty.allItems();

            // 아이템 오브젝트를 차례대로 읽는다.
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                // 인벤토리 용 아이템을 생성한다.
                if (item) {
                    this.createItem(item);
                }
            }

            // 슬롯 복구
            this.restore();

            // 준비 완료
            this._prepared = true;

            logger("prepareInventory");
        }

        save() {
            // 슬롯의 인덱스만 추출한다.
            const newList = this._slots.map((i) => {
                return i.slotId;
            });
            // 해당 슬롯의 인덱스를 세이브 파일에 저장한다.
            $gameSystem.saveSlots(JsonEx.stringify(newList));

            logger("save");
        }

        restore() {
            if ($gameSystem._invSlots === "" || !$gameSystem._invSlots) {
                $gameSystem._invSlots = "[]";
            }

            // 인덱스 값이 배열로 저장되어있다.
            this._restoreSlots = JsonEx.parse($gameSystem._invSlots);
            if (!this._restoreSlots || !Array.isArray(this._restoreSlots)) {
                console.warn("인덱스 배열을 찾지 못했습니다");
                return;
            }
            this._restoreSlots.forEach((e, i) => {
                const item = this._slots[i];

                if (item && "slotId" in item) {
                    this._slots[i].slotId = e;
                }
            });
            this._id = this._restoreSlots.length;

            logger("restore");
        }

        removeAllSlots() {
            this.initMembers();

            logger("removeAllSlots");
        }

        updateInventory() {
            this.removeAllSlots();
            this.restore();
            this.prepareInventory();

            logger("updateInventory");
        }

        /**
         * 새로운 아이템을 생성합니다.
         *
         * @param {number} slotId
         * @param {rm.types.BaseItem} item
         * @returns
         */
        newItem(slotId, item) {
            /**
             * @type {{item: rm.types.BaseItem; name: string; iconIndex: number; description: string; slotId: number; }}
             */
            const newItem = {
                item: item,
                name: item.name || "",
                iconIndex: item.iconIndex || 0,
                description: item.description,
                slotId: slotId || 0,
            };

            logger("newItem");

            return newItem;
        }

        /**
         * 슬롯에 아이템이 존재하는지 확인합니다.
         *
         * @param {number} slotId
         * @returns {{item: rm.types.BaseItem; name: string; iconIndex: number; description: string; slotId: number; }}
         */
        isExist(slotId) {
            // 슬롯 목록에서 아이템을 찾는다.
            const item = this._slots.filter((i) => {
                return i && i.slotId === slotId;
            });
            return item[0];
        }

        nextId() {
            // 인덱스 값을 1 늘린다.
            this._id = (this._id + 1) % this._maxSlots;

            return this._id;
        }

        /**
         * 빈 슬롯에 새로운 아이템을 추가합니다.
         *
         * @param {rm.types.BaseItem} item
         */
        createItem(item) {
            // 아이템을 특정 슬롯에 설정한다.
            const newItem = this.newItem(this._id, item);

            // 슬롯에 아이템을 추가한다.
            this._slots.push(newItem);

            // ID 값을 1만큼 늘린다.
            this.nextId();

            logger("createItem");
        }

        /**
         * 아이템을 교체합니다.
         *
         * @param {number} slotId1
         * @param {number} slotId2
         */
        swapItem(slotId1, slotId2) {
            // 인덱스를 찾는다.
            const item1 = this._slots.indexOf(this.isExist(slotId1));
            const item2 = this._slots.indexOf(this.isExist(slotId2));
            // 인덱스를 못찾으면 -1이 나오므로, 0 이상을 조건으로 찾아낸다.
            if (item1 >= 0 && item2 >= 0) {
                this._slots[item1].slotId = slotId2;
                this._slots[item2].slotId = slotId1;
            }

            logger("swapItem");
        }

        /**
         * 슬롯을 이동합니다.
         *
         * @param {number} prev 기존 슬롯
         * @param {number} newTo 새로운 슬롯 (비어있어야 함)
         */
        moveTo(prev, newTo) {
            // 인덱스를 찾는다.
            const item1 = this._slots.indexOf(this.isExist(prev));
            const item2 = this._slots.indexOf(this.isExist(newTo));

            // 인덱스를 못찾으면 -1이 나오므로, 0 이상을 조건으로 찾아낸다.
            if (item1 >= 0 && item2 === -1) {
                // 스왑 코드
                const temp = this._slots[item1].slotId;
                this._slots[item1].slotId = newTo;
            }

            logger("moveTo");
        }

        /**
         * 슬롯에서 아이템을 삭제합니다.
         *
         * @param {number} slotId
         */
        removeItem(slotId) {
            const deleteItem = this.isExist(slotId);
            const deleteIndex = this._slots.indexOf(deleteItem);
            if (deleteIndex >= 0) {
                // 해당 인덱스의 원소를 삭제한다.
                $gameParty.loseItem(deleteItem.item, -1, true);
                this._slots.splice(deleteIndex, 1);
                this.save();
            }

            logger("removeItem");
        }

        refresh() {
            $gameMap.requestRefresh();
        }
    }

    //==========================================================
    // Game_Party
    //==========================================================

    const alias_Game_Party_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function () {
        alias_Game_Party_initialize.call(this);

        this.addGoldObserver();
    };

    Game_Party.prototype.addGoldObserver = function () {
        const observer = new Observer();

        observer.ref = () => this.gold();
        observer.value = this.gold();

        $dispatcher.addObserver(observer);
    };

    //==========================================================
    // DataManager
    //==========================================================

    const alias_DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        alias_DataManager_createGameObjects.call(this);
        $gameInventory = new Game_Inventory();
        if (!window.$gameInventory) {
            Object.assign(window, {
                $gameInventory,
            });
        }
    };

    //==========================================================
    // Game_System
    //==========================================================

    const alias_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function () {
        alias_Game_System_initialize.call(this);
        this._invSlots = "";
    };

    Game_System.prototype.saveSlots = function (data) {
        this._invSlots = data;
    };

    Game_System.prototype.restoreSlots = function () {
        return this._invSlots || "";
    };

    //==========================================================
    // Game_Map
    //==========================================================

    const alias_Game_Map_refresh = Game_Map.prototype.refresh;
    Game_Map.prototype.refresh = function () {
        alias_Game_Map_refresh.call(this);
        $gameInventory.updateInventory();
        SceneManager._scene.emit("refreshInventory");
    };

    //==========================================================
    // Spriteset_Map
    //==========================================================

    const alias_Spriteset_Map_createLowerLayer =
        Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function () {
        alias_Spriteset_Map_createLowerLayer.call(this);
        this._inventory = new Inventory();
        this.addChild(this._inventory);
    };

    //==========================================================
    // Scene_Map
    //==========================================================

    const alias_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        alias_Scene_Map_start.call(this);
        $gameInventory.updateInventory();
        this.on("refreshInventory", this.refreshInventory, this);
    };

    Scene_Map.prototype.saveInventory = function () {
        $gameInventory.save();
    };

    const alias_Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function () {
        alias_Scene_Map_terminate.call(this);
        this.saveInventory();
    };

    Scene_Map.prototype.refreshInventory = function () {
        if (!this._spriteset) return;
        const timeId = setTimeout(() => {
            $gameInventory.save();
            const inventory = this._spriteset._inventory;
            inventory.refresh();
        }, 5);

        // eslint-disable-next-line consistent-return
        return timeId;
    };

    const alias_Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function () {
        if (!this._spriteset) {
            return alias_Scene_Map_processMapTouch.call(this);
        }

        /**
         * @type {{ _inventory: Inventory }}
         */
        const { _inventory: inventory } = this._spriteset;
        if (inventory.isTouched() || inventory.isDragging()) {
            return false;
        }

        return alias_Scene_Map_processMapTouch.call(this);
    };
})();
