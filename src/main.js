import Phaser from 'phaser'

import goalKickScene from './goalKick'
import phaserTest from './phaserTestScene'
import background from './scenes/background'
import gameUI from './ui/gameUI'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 360,
	height: 800,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		},
	},
	// 	scene: {
	// 	preload: preload,
	// 	create: create,
	// 	update: update
	// },

	//scene: [phaserTest],

	scene: [goalKickScene],
}

export default new Phaser.Game(config)

// function preload() {

// 	this.phaserTest = new phaserTest(this)

// 	//load sprites and BG
// 	this.load.image('fieldBG' ,'../images/bg/field-bg.png' );
// 	this.load.image('ball' ,'images/sprites/ball.png' );
//   this.load.image('goals' ,'images/sprites/goals.png' );

// 	//load UI elements
// 	this.load.image('ui-arrow' ,'images/ui/ui-arrow.png' );
// 	this.load.image('ui-powerbar' ,'images/ui/ui-powerbar.png' );
// 	this.load.image('ui-powerbarFill' ,'images/ui/ui-powerbar-fill.png' );

// 	this.load.image('dragcircle', 'images/sprites/ball.png' );
// }
// function create() {	

// 	this.add.image(180, 400, 'fieldBG');
// 	this.add.image(180, 400, 'goals');
// 	this.add.image(175, 700, 'ball').setTint(0x75000d);

// 	this.gameUI = new gameUI(this)
// }
// function update() {
// 	  this.gameUI.update()
// }