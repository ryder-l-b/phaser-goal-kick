import Phaser from 'phaser'

export default class goalKickScene extends Phaser.Scene {
	constructor() {
		super('hello-world')
	}

	preload() {

    //laod sprites and BG
    this.load.image('fieldBG' ,'images/bg/field-bg.png' );
    this.load.image('ball' ,'images/sprites/ball.png' );
    this.load.image('goals' ,'images/sprites/goals.png' );

    //load UI elements
    this.load.image('ui-arrow' ,'images/ui/ui-arrow.png' );
    this.load.image('ui-powerbar' ,'images/ui/ui-powerbar.png' );
    this.load.image('ui-powerbarFill' ,'images/ui/ui-powerbar-fill.png' );

	}

	create() {
    //original positions
    this.add.image(180, 400, 'fieldBG');
    this.add.image(180, 400, 'goals');
    this.add.image(175, 700, 'ball');

    //position UI elements
    let uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0.5,1);
    let powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5,1);
    this.add.image(330, 635, 'ui-powerbar');

    var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    var line = new Phaser.Geom.Line();
    var angle = -90;


    //logic for angling arrow towards mouse
    this.input.on('pointermove', function (pointer) {
        angle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
        uiArrow.rotation = angle;
        Phaser.Geom.Line.SetToAngle(line, uiArrow.x, uiArrow.y, angle, 245);
        gfx.clear().strokeLineShape(line);
        console.log(line.angle)
    }, this);

    uiArrow.angle = -90

    // Set the initial scale of the power meter
    powerLevel.setScale(1, 0);
    // Tween the scale of the power meter
    this.tweens.add({
      targets: powerLevel,
      scaleY: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
	}
}
