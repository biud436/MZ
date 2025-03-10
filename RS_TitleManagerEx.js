//================================================================
// RS_TitleManagerEx.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2022 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================

/*:
 * @target MZ
 * @plugindesc <RS_TitleManagerEx>
 * @author biud436
 * @url https://github.com/biud436
 *
 * @param Epilogue 1
 *
 * @param ep1 Title1
 * @text Title 1
 * @parent Epilogue 1
 * @desc Specify the title 1 image.
 * @default Beach
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param ep1 Title2
 * @text Title 2
 * @parent Epilogue 1
 * @desc Specify the title 2 image.
 * @default
 * @require 1
 * @dir img/titles2/
 * @type file
 *
 * @param ep1 BGM
 * @text BGM
 * @parent Epilogue 1
 * @desc Specify the BGM file
 * @default Theme1
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param Epilogue 2
 *
 * @param ep2 Title1
 * @text Title 1
 * @parent Epilogue 2
 * @desc Specify the title 1 image.
 * @default Sky
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param ep2 Title2
 * @text Title 2
 * @parent Epilogue 2
 * @desc Specify the title 2 image.
 * @default
 * @require 1
 * @dir img/titles2/
 * @type file
 *
 * @param ep2 BGM
 * @text BGM
 * @parent Epilogue 2
 * @desc Specify the BGM file.
 * @default Field2
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param Epilogue 3
 *
 * @param ep3 Title1
 * @text Title 1
 * @parent Epilogue 3
 * @desc Specify the title 1 image.
 * @default Sky
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param ep3 Title2
 * @text Title 2
 * @parent Epilogue 3
 * @desc Specify the title 2 image.
 * @default
 * @require 1
 * @dir img/titles2/
 * @type file
 *
 * @param ep3 BGM
 * @text BGM
 * @parent Epilogue 3
 * @desc Specify the BGM file.
 * @default Theme1
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param Epilogue 4
 *
 * @param ep4 Title1
 * @text Title 1
 * @parent Epilogue 4
 * @desc Specify the title 1 image.
 * @default Sky
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param ep4 Title2
 * @text Title 2
 * @parent Epilogue 4
 * @desc Specify the title 2 image.
 * @default
 * @require 1
 * @dir img/titles2/
 * @type file
 *
 * @param ep4 BGM
 * @text BGM
 * @parent Epilogue 4
 * @desc Specify the BGM file.
 * @default Theme1
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param Location
 *
 * @param Map ID
 * @parent Location
 * @desc Specify the id of hidden map. This can move to a hidden map through a newly created command
 * @type number
 * @default 1
 *
 * @param Map X
 * @parent Location
 * @desc Specify the starting point of hidden map. This can move to a hidden map through a newly created command
 * @type number
 * @min 0
 * @default 0
 *
 * @param Map Y
 * @parent Location
 * @desc Specify the starting point of hidden map. This can move to a hidden map through a newly created command
 * @type number
 * @min 0
 * @default 0
 *
 * @param Additional Command
 *
 * @param Specific Command
 * @parent Additional Command
 * @desc Specify the command name. This can move to a hidden map through this command
 * @type text
 * @default Specific Command
 *
 * @param Show Specific Command
 * @text Show
 * @parent Additional Command
 * @desc Decide whether the command window is visible.
 * @type boolean
 * @default false
 * @on visible
 * @off hide
 *
 * @help
 * =============================================================================
 * Plugin Features
 * =============================================================================
 *
 * The RS_TitleManagerEx plugin allows you to dynamically change the title screen
 * resources (background images and music) after players complete specific epilogues
 * or endings in your game.
 *
 * Key Features:
 *
 * 1. Dynamic Title Screen:
 *    - Configure up to 4 different title screen variations (epilogues)
 *    - Each epilogue can have unique background images and BGM
 *
 * 2. Epilogue Tracking:
 *    - The plugin automatically tracks which endings the player has seen
 *    - Use this information to unlock content or provide bonuses
 *
 * 3. Special Menu Command:
 *    - Add a special command to the title menu after completing an ending
 *    - This command can transfer players to a hidden/bonus map
 *
 * 4. Hidden Content Access:
 *    - Allow access to post-game content through the special command
 *    - Create New Game+ or gallery features
 *
 * =============================================================================
 * Usage - Setting Epilogues
 * =============================================================================
 *
 * To change the title screen, you have two methods:
 *
 * 1. Using Script Command:
 *    Place this in a script event command:
 *
 *    EndingService.setEnding("Epilogue X");
 *
 *    Replace X with a number between 1 and 4.
 *
 * 2. Using Plugin Command:
 *    Use the built-in plugin command "RS_TitleManagerEx: Set Ending"
 *    and select which epilogue (1-4) you want to activate.
 *
 * =============================================================================
 * Removing Epilogues
 * =============================================================================
 *
 * To remove all epilogue settings and reset to the default title screen:
 *
 *    EndingService.remove();
 *
 * Note: This can only be done through a script command, as there is no
 * plugin command for removal.
 *
 * =============================================================================
 * Technical Details
 * =============================================================================
 *
 * === Epilogue and Ending Tracking ===
 *
 * The plugin provides a comprehensive system to track which epilogues the player has completed:
 *
 * - EndingService.data.epilogue: An array containing the numbers of all completed epilogues
 * - New tracking functions (isClearedEnding, getCompletedEpilogues, etc.) make it easy
 *   to check completion status
 * - Completion status can be used to unlock content, enable features, or modify game behavior
 *
 * === Storage Mechanism ===
 *
 * - The plugin stores epilogue data persistently in a file named "ending"
 * - This ensures players continue to see the updated title screen even after
 *   closing and reopening the game
 * - The epilogue data is saved separately from normal save files
 * - Epilogue status persists across different save files, useful for unlocking content
 *   in New Game+ or subsequent playthroughs
 *
 * === Title Screen Changes ===
 *
 * - The plugin modifies Scene_Title to change background images and music
 * - When multiple epilogues are set, the most recent one is displayed
 * - The "Specific Command" feature adds a new option to the title menu that can be used
 *   to access bonus content or galleries
 *
 * =============================================================================
 * Script Call API
 * =============================================================================
 *
 * === Setting and Removing Epilogues ===
 *
 * 1. Set an Epilogue:
 * ```javascript
 * EndingService.setEnding("Epilogue 1"); // Set Epilogue 1 as completed
 * ```
 *
 * 2. Remove All Epilogues (Reset to Default Title):
 * ```javascript
 * EndingService.remove();
 * ```
 *
 * === Checking Epilogue Status ===
 *
 * 3. Check if Any Epilogue is Active:
 * ```javascript
 * if (EndingService.isAnyEnding()) {
 *     // Do something if player has achieved any ending
 * }
 * ```
 *
 * 4. Get the Last Epilogue Number:
 * ```javascript
 * const lastEndingNumber = EndingService.lastEnding;
 * $gameVariables.setValue(10, lastEndingNumber); // Store in variable #10
 * ```
 *
 * 5. Check if Specific Epilogue is Completed (by Number):
 * ```javascript
 * // Check if Epilogue 2 has been completed
 * if (EndingService.isClearedEnding(2)) {
 *     // Epilogue 2 has been completed
 *     $gameSwitches.setValue(15, true);
 * }
 * ```
 *
 * 6. Check if Specific Epilogue is Completed (by Name):
 * ```javascript
 * // Alternative way using epilogue name
 * if (EndingService.hasEpilogue("Epilogue 3")) {
 *     // Epilogue 3 has been completed
 *     $gameMessage.add("You've already seen the Secret Ending!");
 * }
 * ```
 *
 * 7. Get All Completed Epilogues:
 * ```javascript
 * const completedEpilogues = EndingService.getCompletedEpilogues();
 * $gameVariables.setValue(11, completedEpilogues.length); // Store total count
 * console.log("Completed epilogues:", completedEpilogues); // [1, 3] for example
 * ```
 *
 * 8. Check if All Epilogues are Completed:
 * ```javascript
 * if (EndingService.isAllEpiloguesCompleted()) {
 *     // Player has seen all 4 epilogues
 *     $gameSwitches.setValue(20, true); // Enable true ending or bonus
 *     $gameMessage.add("You've experienced every possible ending!");
 * }
 * ```
 *
 * 9. Get Completion Percentage:
 * ```javascript
 * const percentage = EndingService.getCompletionPercentage();
 * $gameVariables.setValue(12, percentage); // Store completion percentage
 * $gameMessage.add(`Completion: ${percentage}% of all endings discovered.`);
 * ```
 *
 * === Advanced Usage Examples ===
 *
 * 10. Set Epilogue Based on Variable:
 * ```javascript
 * // Assuming variable #5 contains a number between 1-4
 * const endingNumber = $gameVariables.value(5);
 * EndingService.setEnding("Epilogue " + endingNumber);
 * ```
 *
 * 11. Set Epilogue in Conditional Branch:
 * ```javascript
 * // In a conditional branch script call
 * if ($gameSwitches.value(10)) { // If switch #10 is ON (True Ending)
 *     EndingService.setEnding("Epilogue 2");
 * } else if ($gameSwitches.value(11)) { // If switch #11 is ON (Neutral Ending)
 *     EndingService.setEnding("Epilogue 3");
 * } else { // Default/Bad Ending
 *     EndingService.setEnding("Epilogue 1");
 * }
 * ```
 *
 * 12. Conditional Activation After Game Completion:
 * ```javascript
 * // In a post-credits event
 * if (!EndingService.isAnyEnding()) { // Only set if no ending has been set before
 *     EndingService.setEnding("Epilogue 1");
 *     // Show message informing player they can now see a new title screen
 *     $gameMessage.add("The title screen has changed! Check it out when you return to the title.");
 * }
 * ```
 *
 * 13. Create a Custom Title Menu Command:
 * ```javascript
 * // This setup should be done in your game's initialization
 * // First, make sure to set "Show Specific Command" to true in plugin parameters
 *
 * // Then you can customize what happens when that command is selected
 * // by modifying the map and events at the specified location
 * ```
 *
 * 14. Gallery System - Show Art Based on Completed Epilogues:
 * ```javascript
 * // Show different content based on completed epilogues
 * let galleryText = "Art Gallery\n\n";
 *
 * if (EndingService.isClearedEnding(1)) {
 *     galleryText += "- The Hero's Journey (Good Ending)\n";
 *     // Show picture for ending 1
 * }
 *
 * if (EndingService.isClearedEnding(2)) {
 *     galleryText += "- Path of Darkness (Bad Ending)\n";
 *     // Show picture for ending 2
 * }
 *
 * if (EndingService.isClearedEnding(3)) {
 *     galleryText += "- The Secret Truth (Secret Ending)\n";
 *     // Show picture for ending 3
 * }
 *
 * if (EndingService.isClearedEnding(4)) {
 *     galleryText += "- The True Finale (True Ending)\n";
 *     // Show picture for ending 4
 * }
 *
 * if (EndingService.isAllEpiloguesCompleted()) {
 *     galleryText += "\n[SPECIAL] Developer Commentary Unlocked!";
 *     // Unlock special content
 * }
 *
 * $gameMessage.add(galleryText);
 * ```
 *
 * =============================================================================
 * Implementation Examples
 * =============================================================================
 *
 * Example 1: Multi-Ending System with Title Screen Changes
 * -----------------------------------------------------------------------------
 *
 * // Place this at the end of your different ending paths
 * // For the Good Ending:
 * $gameMessage.add("Congratulations on achieving the Good Ending!");
 * $gameMessage.add("Return to the title screen to see it changed!");
 * EndingService.setEnding("Epilogue 1");
 *
 * // For the Bad Ending:
 * $gameMessage.add("You've reached the Dark Ending...");
 * $gameMessage.add("The title screen will reflect your choices.");
 * EndingService.setEnding("Epilogue 2");
 *
 * // For the Secret Ending:
 * $gameMessage.add("You've discovered the Secret Ending!");
 * $gameMessage.add("A special title screen and bonus content await.");
 * EndingService.setEnding("Epilogue 3");
 *
 * Example 2: New Game+ Implementation
 * -----------------------------------------------------------------------------
 *
 * // Create a common event for New Game+ initialization
 * // This would be called when starting a new game from your custom title command
 *
 * // First, set up a new game
 * DataManager.setupNewGame();
 *
 * // Then add bonuses based on which epilogue is active
 * const activeEpilogue = EndingService.lastEnding;
 *
 * // Give rewards based on which ending was achieved
 * switch (activeEpilogue) {
 *     case 1: // Good Ending Rewards
 *         $gameParty.gainGold(1000);
 *         $gameParty.gainItem($dataItems[5], 3);
 *         break;
 *     case 2: // Bad Ending Rewards
 *         $gameParty.members()[0].addParam(2, 5); // +5 ATK to leader
 *         break;
 *     case 3: // Secret Ending Rewards
 *         $gameParty.gainItem($dataWeapons[15], 1); // Special weapon
 *         break;
 *     case 4: // True Ending Rewards
 *         $gameParty.gainGold(5000);
 *         $gameParty.gainItem($dataItems[10], 5);
 *         $gameParty.members().forEach(actor => {
 *             actor.addParam(0, 10); // +10 Max HP to all party members
 *         });
 *         break;
 * }
 *
 * // Set a switch to indicate this is a New Game+
 * $gameSwitches.setValue(10, true);
 *
 * Example 3: Unlockable Gallery System
 * -----------------------------------------------------------------------------
 *
 * // Create a map with artwork/scenes from your game
 * // Use this script in conditional branches to show/hide content based on endings
 *
 * // For showing content from the good ending:
 * if (EndingService.isClearedEnding(1) || EndingService.isClearedEnding(4)) {
 *     // Show good ending gallery items
 *     this.showPicture(1, "GoodEndingArt", 0, 0, 0, 100, 100, 255, 0);
 * } else {
 *     // Show locked content placeholder
 *     this.showPicture(1, "LockedContent", 0, 0, 0, 100, 100, 255, 0);
 * }
 *
 * // For showing content from the bad ending:
 * if (EndingService.isClearedEnding(2)) {
 *     // Show bad ending gallery items
 *     this.showPicture(2, "BadEndingArt", 0, 100, 0, 100, 100, 255, 0);
 * } else {
 *     // Show locked content placeholder
 *     this.showPicture(2, "LockedContent", 0, 100, 0, 100, 100, 255, 0);
 * }
 *
 * // Show special content only if all epilogues are completed
 * if (EndingService.isAllEpiloguesCompleted()) {
 *     this.showPicture(3, "SecretArtwork", 0, 200, 0, 100, 100, 255, 0);
 *     this.showText("You've unlocked all secret artwork by completing all endings!");
 * }
 *
 * =============================================================================
 * Configuration Tips
 * =============================================================================
 *
 * 1. Title Screen Assets:
 *    - For best results, prepare unique and thematically appropriate title
 *      images for each ending
 *    - Test how Title1 and Title2 layers combine visually
 *    - Choose BGM that reflects the tone of each ending
 *
 * 2. Special Command Feature:
 *    - Create a dedicated map for your bonus content
 *    - Use conditional branches to show different content based on which
 *      endings the player has achieved
 *    - Consider including galleries, sound tests, developer commentary,
 *      or bonus battles
 *
 * 3. Persistence Considerations:
 *    - The epilogue data persists across game sessions and save files
 *    - Players can see the changed title screen even when starting a new game
 *    - Use EndingService.remove() at the start of a new game if you want
 *      to reset the title for new playthroughs
 *
 * =============================================================================
 * Compatibility Notes
 * =============================================================================
 *
 * This plugin is written for RPG Maker MZ using modern JavaScript. If you use
 * other plugins that modify the title screen, place this plugin lower in the
 * plugin manager list to ensure it takes priority.
 *
 * The plugin modifies:
 * - Scene_Title (background creation and music playback)
 * - Window_TitleCommand (for the special command)
 * - DataManager (for special game setup)
 *
 * ============================================================================
 * Version Log
 * ============================================================================
 * 2022.04.19 (v1.0.0) :
 *  - First Release
 * 2022.04.19 (v1.0.1) :
 *  - Added a new plugin command that can set epilogue.
 *
 * @command setEnding
 * @text Set Ending
 * @desc Set the ending of the game.
 *
 * @arg epilogue
 * @text Epilogue 1
 * @type select
 * @desc Set the epilogue.
 * @default Epilogue 1
 * @option Epilogue 1
 * @option Epilogue 2
 * @option Epilogue 3
 * @option Epilogue 4
 *
 */

(() => {
  "use strict";

  /**
   * @type {Record<string, any>}
   */
  const pluginParams = $plugins.filter(function (i) {
    return i.description.contains("<RS_TitleManagerEx>");
  });

  /**
   * @type {string}
   */
  const pluginName = pluginParams.length > 0 && pluginParams[0].name;

  /**
   * @type {Record<string, any>}
   */
  const parameters = pluginParams.length > 0 && pluginParams[0].parameters;

  /**
   * @class JsonServiceImpl
   */
  class JsonServiceImpl {
    constructor(injectJsonEx) {
      this.jsonEx = injectJsonEx;
    }

    /**
     * @param {Object} object
     * @returns {string}
     */
    stringify(object) {
      return this.jsonEx.stringify(object);
    }

    /**
     * @param {string} json
     * @returns {Record<string, any> | []}
     */
    parse(json) {
      return this.jsonEx.parse(json);
    }
  }

  /**
   * @class DataServiceImpl
   */
  class DataServiceImpl {
    /**
     *
     * @param {string} saveName
     * @param {string} contents
     * @returns {Promise<void>}
     */
    save(saveName, contents) {
      return StorageManager.saveObject(saveName, contents);
    }

    /**
     * @param {string} saveName
     * @returns {Promise<Record<string, any>>}
     */
    load(saveName) {
      if (!StorageManager.exists(saveName)) {
        throw new Error(`${saveName} is not found.`);
      }
      return StorageManager.loadObject(saveName);
    }

    /**
     * @param {string} saveName
     * @returns {void}
     */
    remove(saveName) {
      if (StorageManager.exists(saveName)) {
        StorageManager.remove(saveName);
      }
    }
  }

  class DataStructure {
    constructor() {
      /**
       * @type {number[]}
       */
      this.epilogue = [];
    }
  }

  class EndingServiceImpl {
    /**
     * @param {{jsonService: JsonServiceImpl, dataService: DataServiceImpl}} inject
     */
    constructor({ jsonService, dataService }) {
      this.jsonService = jsonService;
      this.dataService = dataService;

      /**
       * @type {DataStructure}
       */
      this.data = new DataStructure();

      /**
       * @type {"ending"}
       */
      this.key = "ending";

      this.isDirty = false;
    }

    /**
     * initialize the data for ending setup.
     * @returns {Promise<void>}
     */
    async initWithData() {
      this.data = await this.load();
      this.save();
    }

    /**
     * if any ending data is set, return true.
     * @returns {boolean}
     */
    isAnyEnding() {
      if (!this.isDirty) {
        this.initWithData().then((this.isDirty = true));
      }
      return this.data.epilogue.length > 0;
    }

    /**
     * Checks if a specific epilogue has been completed
     * @param {number} epilogueNumber - The epilogue number (1-4)
     * @returns {boolean} True if the epilogue has been completed
     */
    isClearedEnding(epilogueNumber) {
      if (!this.isDirty) {
        this.initWithData().then((this.isDirty = true));
      }

      return this.data.epilogue.includes(epilogueNumber);
    }

    getCompletedEpilogues() {
      if (!this.isDirty) {
        this.initWithData().then((this.isDirty = true));
      }
      return this.data.epilogue;
    }

    isAllEpiloguesCompleted() {
      const completedEpilogues = new Set(this.getCompletedEpilogues());
      return [1, 2, 3, 4].every((num) => completedEpilogues.has(num));
    }

    getCompletionPercentage() {
      const total = 4; // Total number of possible epilogues
      const completed = new Set(this.getCompletedEpilogues()).size;
      return (completed / total) * 100;
    }

    hasEpilogue(epilogueName) {
      if (!epilogueName || typeof epilogueName !== "string") return false;

      const match = epilogueName.match(/Epilogue\s*(\d+)/i);
      if (!match) return false;

      const epilogueNumber = parseInt(match[1], 10);
      return this.isClearedEnding(epilogueNumber);
    }

    /**
     * @returns {number}
     */
    get lastEnding() {
      const length = this.data.epilogue.length;
      return this.data.epilogue[length - 1];
    }

    /**
     *
     * @param {"Epilogue 1"|"Epilogue 2"|"Epilogue 3"|"Epilogue 4"} endingName
     */
    setEnding(endingName) {
      if (!endingName) return;
      const id = endingName.split(" ")[1];
      this.data.epilogue.push(+id);
      this.save();
    }

    /**
     * @private
     * @returns {"ending"}
     */
    get saveName() {
      return this.key;
    }

    /**
     * @private
     * @returns {Promise<void>}
     */
    async save() {
      const contents = this.data;
      return await this.dataService.save(this.saveName, contents);
    }

    /**
     * @private
     * @returns {Promise<DataStructure>}
     */
    async load() {
      try {
        return this.dataService.load(this.saveName);
      } catch {
        return new DataStructure();
      }
    }

    /**
     * @returns {void}
     */
    async remove() {
      this.dataService.remove(this.saveName);
    }

    /**
     *
     * @param {{title1Name: string; title2Name: string; [key: string]: any;}} dataSystem
     * @returns {{title1Name: string; title2Name: string;}
     */
    getBackground(dataSystem) {
      return this.isAnyEnding()
        ? {
            title1Name: parameters[`ep${this.lastEnding} Title1`],
            title2Name: parameters[`ep${this.lastEnding} Title2`],
          }
        : dataSystem;
    }

    /**
     *
     * @param {{titleBgm: {name: string; pan: number; pitch: number; volume: number;}; [key: string]: any;}} dataSystem
     * @return {{titleBgm: {name: string; pan: number; pitch: number; volume: number;};}}
     */
    getTitleBgm(dataSystem) {
      return this.isAnyEnding()
        ? {
            titleBgm: {
              name: parameters[`ep${this.lastEnding} BGM`],
              pan: 0,
              pitch: 100,
              volume: 90,
            },
          }
        : dataSystem;
    }
  }

  const EndingService = new EndingServiceImpl({
    jsonService: new JsonServiceImpl(JsonEx),
    dataService: new DataServiceImpl(),
  });
  EndingService.initWithData();

  window.EndingService = EndingService;

  //=============================================================================

  const __super_Window_TitleCommand_makeCommandList =
    Window_TitleCommand.prototype.makeCommandList;
  Object.assign(Window_TitleCommand.prototype, {
    makeCommandList() {
      __super_Window_TitleCommand_makeCommandList.call(this);
      const isAnyEnding = EndingService.isAnyEnding();
      const isShowSpecificCommand = Boolean(
        parameters["Show Specific Command"] === "true"
      );
      if (isAnyEnding && isShowSpecificCommand) {
        this.addCommand(parameters["Specific Command"], "specific");
      }
    },
  });

  //=============================================================================
  Object.assign(DataManager, {
    setupEndingStage() {
      this.createGameObjects();
      this.selectSavefileForNewGame();
      $gameParty.setupStartingMembers();
      $gamePlayer.reserveTransfer(
        +parameters["Map ID"],
        +parameters["Map X"],
        +parameters["Map Y"],
        2,
        0
      );
      Graphics.frameCount = 0;
    },
  });
  //=============================================================================

  const __super_Scene_Title_createCommandWindow =
    Scene_Title.prototype.createCommandWindow;
  Object.assign(Scene_Title.prototype, {
    async createBackground() {
      const { title1Name, title2Name } =
        EndingService.getBackground($dataSystem);

      this._backSprite1 = new Sprite(ImageManager.loadTitle1(title1Name));
      this._backSprite2 = new Sprite(ImageManager.loadTitle2(title2Name));
      this.addChild(this._backSprite1);
      this.addChild(this._backSprite2);
    },
    createCommandWindow() {
      __super_Scene_Title_createCommandWindow.call(this);
      this._commandWindow.setHandler("specific", () => {
        this.commandSpecific();
      });
    },
    commandSpecific() {
      DataManager.setupEndingStage();
      this._commandWindow.close();
      this.fadeOutAll();
      SceneManager.goto(Scene_Map);
    },
    playTitleMusic() {
      const { titleBgm } = EndingService.getTitleBgm($dataSystem);
      AudioManager.playBgm(titleBgm);
      AudioManager.stopBgs();
      AudioManager.stopMe();
    },
  });

  //=============================================================================

  PluginManager.registerCommand(pluginName, "setEnding", (raw) => {
    /**
     * @type {{epilogue: string;}}
     */
    const args = raw;
    EndingService.setEnding(args.epilogue);
  });
})();
