//-----------------------------------------------------------------------------
//  Galv's Character Animations
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_CharacterAnimations.js
//-----------------------------------------------------------------------------
//  2020-13-05 - Version 1.8 - Fixed followers not disabling animations
//  2017-10-28 - Version 1.7 - Fixed follower dash bug I made with last update
//  2017-10-26 - Version 1.6 - Added ability for events to use char anims
//  2017-07-02 - Version 1.5 - Changed to reset animation frame to first when
//                           - switching between idle, run, walk, jump
//  2016-07-01 - Version 1.4 - Fixed bug when event running idle not working
//  2016-04-18 - Version 1.3 - Added graphic change when jumping
//  2015-11-16 - Version 1.2 - Fixed a bug with idle not activating in event
//  2015-11-11 - Version 1.1 - added Galv plugin command efficiency code
//  2015-11-03 - Version 1.0 - release
//-----------------------------------------------------------------------------
//  Terms can be found at:
//  galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_CharacterAnimations = true;

var Galv = Galv || {};        // Galv's main object
Galv.pCmd = Galv.pCmd || {};  // Plugin Command manager
Galv.CA = Galv.CA || {};      // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.8) Make the player and follower characters use different
 * graphics for idle, walk and run. View HELP for more info.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Use Jump Graphic
 * @desc true or false. If true, when jumping, player will use 4th character slot in their character sheet
 * @default true
 *
 * @param Common Event ID
 * @desc The common event ID that runs when the idle time expires
 * @default 0
 *
 * @param Common Event Time
 * @desc Amount of frames the player is idle until above common event
 * is activated
 * @default 0
 *
 * @param Repeat Common Event
 * @desc Can be 0 or 1. If 1, the above common event is repeated
 * every time the Common Event Time passes. 0 is no repeat
 * @default 0
 *
 * @help
 *   Galv's Character Animations
 * ----------------------------------------------------------------------------
 * To use this script, you will need a character spritesheet for each of your
 * actors that will be in the party (the full 8 character sheet). While on
 * the map, the characters will change their appearance within their sheets.
 * While not moving (idle) they will use the first character. While walking,
 * they will use the second character. And while running, they will use the
 * third character.
 * If you have "Use Jump Graphic" set to true, they will use the forth
 * character as the jump graphic. The jumping graphic will use each frame in
 * a different way.
 * Left = start of jump, mid = middle of jump, right = end of jump
 *
 * While this is happening, the player's step animation is active (meaning
 * while stopped, the idle pose will be stepping). This is so you can make
 * movement in your idle poses.
 *
 * The settings in the plugin allow you to run a common event after the player
 * has been idle for a certain amount of frames. (60 frames per second).
 *
 * The plugin command below can be used to turn functionality on and off.
 * (For Actors Only)
 *
 * ----------------------------------------------------------------------------
 *    PLUGIN COMMAND
 * ----------------------------------------------------------------------------
 * 
 *    CHARANIM STATUS                   // STATUS can be TRUE or FALSE
 *
 * ----------------------------------------------------------------------------
 * Example:
 * CHARANIM FALSE       // Disables the character animations
 * CHARANIM TRUE        // Enables them again. They are enabled by default
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *    EVENTS
 * ----------------------------------------------------------------------------
 *
 * Event functionality is now also possible for any event with the note tag:
 * 
 *     <charAnims>
 *
 * Events will use idle, walk and jump automatically but as they do not have
 * a way to dash/run by default, you need to use in a move route the script:
 *
 *     this._isDashing = status;   // status can be true or false
 *
 * This will make it when they move they will use the dashing pose or walking
 * id turned on or off respectively;
 *
 * You can temporarily disable an event's character animation functionality
 * in a move route using:
 *
 *     this.disableCharAnims = status; // true to disable, false to re-enable
 *
 * NOTE: When exiting/re-entering the map or changing scenes, this will
 * revert to it's original state. Only use for special event motions for
 * example in cutscenes for events that have charAnims on.
 *
 *
 * For events, you can set which poses are used for idle, walk, dash, jump by
 * using another note tag (the first is still required):
 *
 *     <charAnimSetup:i,w,d,j>    // i = idle index (0 for first character)
 *                                // w = walk index
 *                                // d = dash index
 *                                // j = jump index
 *
 * ----------------------------------------------------------------------------
 * Find the plugin demo for examples!
 * ----------------------------------------------------------------------------
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------



(function() {
	Galv.CA.ceventId = Number(PluginManager.parameters('Galv_CharacterAnimations')["Common Event ID"]);
	Galv.CA.ceventId = Number(PluginManager.parameters('Galv_CharacterAnimations')["Common Event ID"]);
	Galv.CA.ceventTime = Number(PluginManager.parameters('Galv_CharacterAnimations')["Common Event Time"]);
	Galv.CA.ceventRepeat = Number(PluginManager.parameters('Galv_CharacterAnimations')["Repeat Common Event"]);
	Galv.CA.useJump = PluginManager.parameters('Galv_CharacterAnimations')["Use Jump Graphic"].toLowerCase() == 'true' ? true : false;
	

// GALV'S PLUGIN MANAGEMENT. INCLUDED IN ALL GALV PLUGINS THAT HAVE PLUGIN COMMAND CALLS, BUT ONLY RUN ONCE.
if (!Galv.aliased) {
	var Galv_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		if (Galv.pCmd[command]) {
			Galv.pCmd[command](args);
			return;
		};
		Galv_Game_Interpreter_pluginCommand.call(this, command, args);
	};
	Galv.aliased = true; // Don't keep aliasing for other Galv scripts.
};

// Direct to Plugin Object
Galv.pCmd.CHARANIM = function(arguments) {
	Galv.CA.animChange(arguments);
};
// END GALV'S PLUGIN MANAGEMENT


Galv.CA.animChange = function(status) {
	if (status[0] === "TRUE") {
		$gamePlayer.disableCharAnims = false;
		$gamePlayer._stepAnime = true;

		$gamePlayer.followers()._data.forEach(function(actor) {
				actor.disableCharAnims = false;
				actor._stepAnime = true;
			}
		);
		
		
	} else if (status[0] === "FALSE") {
		$gamePlayer.disableCharAnims = true;
		$gamePlayer._stepAnime = false;
		
		$gamePlayer.followers()._data.forEach(function(actor) {
				actor.disableCharAnims = true;
				actor._stepAnime = false;
			}
		);
	};
};


//-----------------------------------------------------------------------------
// Game Character
//-----------------------------------------------------------------------------

Galv.CA.Game_Character_initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function() {
	Galv.CA.Game_Character_initMembers.call(this);
	this.idleTime = 0;
	this._currentAnimIndex = 0;
	this._charAnimIndex = [0,1,2,3];  // [idle, walk, run, jump
};

Galv.CA.Game_Character_update = Game_Character.prototype.update;
Game_Character.prototype.update = function(sceneActive) {
	Galv.CA.Game_Character_update.call(this,sceneActive);
	if (!this.disableCharAnims) this.updateCharAnims();
};

if (Galv.CA.useJump) {
	Galv.CA.Game_Character_jump = Game_Character.prototype.jump;
	Game_Character.prototype.jump = function(xPlus, yPlus) {
		Galv.CA.Game_Character_jump.call(this, xPlus, yPlus);
		this._jumpValues = [this._jumpCount * 0.3, this._jumpCount * 0.7];
		this._stopCount = 0;
		this._pattern = 0;
	};
	
	// update with jump
	Game_Character.prototype.updateCharAnims = function() {
		if (this.isJumping()) {
			this.charAnimJump();
		} else if (this.isMoving()) {
			this.charAnimMove();
		} else {
			this.charAnimCheckIdle();
		};
	};
} else {
	// update without jump
	Game_Character.prototype.updateCharAnims = function() {
		if (this.isMoving()) {
			this.charAnimMove();
		} else {
			this.charAnimCheckIdle();
		};
	};
};

Game_Character.prototype.charAnimJump = function() {
	this._stopCount = 0;
	if (this._jumpCount > this._jumpValues[1]) { // start of jump
		this._pattern = 0;	
	} else if (!this._jumpCount || this._jumpCount < this._jumpValues[0]) { // end of jump
		this._pattern = 2;
	} else {
		this._pattern = 1;	
	};

	this.setAnimIndex(3);
	this.idleTime = 0;
};

Game_Character.prototype.charAnimMove = function() {
	if (this.isDashing()) {
		this.setAnimIndex(2);
	} else {
		this.setAnimIndex(1);
	};
	this.idleTime = 0;
};

Game_Character.prototype.charAnimCheckIdle = function() {
	this.idleTime += 1;
	if (this.idleTime === 5) this.charAnimIdle();
};

Game_Character.prototype.charAnimIdle = function() {
	this._stepAnime = true;
	this.setAnimIndex(0);
};

Game_Character.prototype.setAnimIndex = function(ind) {
	var ind = this._charAnimIndex[ind];
	if (this._currentAnimIndex != ind) {
		this._pattern = 0;
		this._animationCount = 0;
		this._currentAnimIndex = ind;
	};
	this._characterIndex = ind;
};


//-----------------------------------------------------------------------------
// Game Player
//-----------------------------------------------------------------------------

Game_Player.prototype.charAnimCheckIdle = function() {
	Game_Character.prototype.charAnimCheckIdle.call(this);
	if (this.idleTime === Galv.CA.ceventTime) this.charAnimCevent();
};

Game_Player.prototype.charAnimCevent = function() {
	if ($gameMap._interpreter.isRunning()) return this.idleTime = 0;
	$gameTemp.reserveCommonEvent(Galv.CA.ceventId);
	if (Galv.CA.ceventRepeat === 1) return this.idleTime = 0;
};

Game_Player.prototype.setAnimIndex = function(ind) {
	var ind = this._charAnimIndex[ind];	
	if (this._currentAnimIndex != ind) {
		this._pattern = 0;
		this._animationCount = 0;
		this.followers()._data.forEach(function(actor) {
				actor._pattern = 0;
				actor._animationCount = 0;
			}
		);
		this._currentAnimIndex = ind;
	};
	
	this._characterIndex = ind;
	this.followers()._data.forEach(function(actor) {
			actor._characterIndex = ind;
		}
	);
};


//-----------------------------------------------------------------------------
// Game Follower
//-----------------------------------------------------------------------------

Game_Follower.prototype.charAnimMove = function() {
	if ($gamePlayer.isDashing()) {
		this.setAnimIndex(2);
	} else {
		this.setAnimIndex(1);
	};
	this.idleTime = 0;
};


//-----------------------------------------------------------------------------
// Game Event
//-----------------------------------------------------------------------------

Galv.CA.Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
	this._isDashing = false;
	Galv.CA.Game_Event_initialize.call(this, mapId, eventId);
	this.disableCharAnims = !this.event().meta.charAnims;
	this.charAnimSetup();
};

Game_Event.prototype.charAnimSetup = function(mapId, eventId) {
	// setup new indexes for character animations based on tag <charAnimSetup:i,w,d,j>
	var tag = this.event().meta.charAnimSetup;
	if (tag) {
		var array = tag.split(',');
		for (var i = 0; i < array.length; i++) {
			this._charAnimIndex[i] = Number(array[i]);
		}
	}
};

Game_Event.prototype.isDashing = function() {
	return this._isDashing;
};

})();