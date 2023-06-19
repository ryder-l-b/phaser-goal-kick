import './style.css'

import Phaser from 'phaser'

import goalKickScene from './goalKick.js'


const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'app',
		mode: Phaser.Scale.CENTER_HORIZONTALLY,
		// width: window.innerWidth,
		// height: window.innerHeight
		width: 360,
		height: 800,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		},
	},
	backgroundColor: '#4488aa',
	scene: [goalKickScene],
	antialias: true,
}

export default new Phaser.Game(config)
