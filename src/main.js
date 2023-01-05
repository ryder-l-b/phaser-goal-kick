import Phaser from 'phaser'

import goalKickScene from './goalKick'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 360,
	height: 800,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
		},
	},
	scene: [goalKickScene],
}

export default new Phaser.Game(config)
