import Phaser from 'phaser'

import goalKickScene from './goalKick'
import phaserTest from './phaserTestScene'
import background from './scenes/background'
import gameUI from './ui/gameUI'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	scale: {
    parent: 'app',
    mode: Phaser.Scale.CENTER_HORIZONTALLY,
    width: 360,
    height: 800
},
	// width: 360,
	// height: 800,
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
