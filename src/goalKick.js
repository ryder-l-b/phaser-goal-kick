import Phaser from 'phaser'

export default class goalKickScene extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.input;

        this.path;
        this.curve;
        this.points;
        this.graphics;

        this.landingX = 40;

        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(180, 100);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, 380);

        this.point0;
        this.point1;
        this.point2;
	}

	preload() {

    //load sprites and BG
    this.load.image('fieldBG' ,'images/bg/field-bg.png' );
    this.load.image('ball' ,'images/sprites/ball.png' );
    this.load.image('goals' ,'images/sprites/goals.png' );

    //load UI elements
    this.load.image('ui-arrow' ,'images/ui/ui-arrow.png' );
    this.load.image('ui-powerbar' ,'images/ui/ui-powerbar.png' );
    this.load.image('ui-powerbarFill' ,'images/ui/ui-powerbar-fill.png' );

	}

	create() {
       
    //                       _ __  _                 
    //     ____  ____  _____(_) /_(_)___  ____  _____
    //    / __ \/ __ \/ ___/ / __/ / __ \/ __ \/ ___/
    //   / /_/ / /_/ (__  ) / /_/ / /_/ / / / (__  ) 
    //  / .___/\____/____/_/\__/_/\____/_/ /_/____/  
    // /_/                                           
        
    //original positions
    this.add.image(180, 400, 'fieldBG');
    this.add.image(180, 400, 'goals');
    this.add.image(175, 700, 'ball').setTint(0x75000d);

    //position UI elements
    let uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0, .5);
    let powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5, 1);
    this.add.image(330, 635, 'ui-powerbar');


    
    //            _                                 
    //     __  __(_)  ____ _______________ _      __
    //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
    //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
    //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  
                                                    
    //logic for angling arrow towards mouse
    this.input.on('pointermove', function(pointer) {
        uiArrowAngle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
        uiArrow.rotation = uiArrowAngle
    });

    // var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    // var line = new Phaser.Geom.Line();
    // var angle = 0;
    // var uiArrowAngle = 0;

    //draws line to mouse from arrow origin
    this.input.on('pointermove', function (pointer) {
        angle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
        Phaser.Geom.Line.SetToAngle(line, uiArrow.x, uiArrow.y, angle, 245);
        gfx.clear().strokeLineShape(line);
    }, this);


    //        __                                                
    //   ____/ /________ __      __   _______  ________   _____ 
    //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
    // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
    // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/  

    this.game.landingX = this.input.mousePointer.x

    this.graphics = this.add.graphics();

    this.path = { t: 0, vec: new Phaser.Math.Vector2() };


    this.curve = new Phaser.Curves.QuadraticBezier(this.startPoint, this.controlPoint1, this.endPoint);

    // this.input.setDraggable([ this.point0, this.point1, this.point2 ]);
    
    // this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    //     gameObject.x = dragX;
    //     gameObject.y = dragY;

    //     gameObject.data.get('vector').set(dragX, dragY);

    //     //  Get 32 points equally spaced out along the curve
    //     this.points = this.curve.getSpacedPoints(32);
    // });

    this.points = this.curve.getSpacedPoints(32);

    this.point0 = this.add.image(this.startPoint.x, this.startPoint.y, 'ball', 0).setTint(0x0000)
    this.point1 = this.add.image(this.endPoint.x, this.endPoint.y, 'ball', 0).setTint(0x0000ff)
    this.point2 = this.add.image(this.controlPoint1.x, this.controlPoint1.y, 'ball').setTint(0xff0000)

    this.point0.setData('vector', this.startPoint);
    this.point1.setData('vector', this.endPoint);
    this.point2.setData('vector', this.controlPoint1);

    this.point0.setData('isControl', false);
    this.point1.setData('isControl', false);
    this.point2.setData('isControl', true);


    //                                    __              
    //     ____  ____ _      _____  _____/ /_  ____ ______
    //    / __ \/ __ \ | /| / / _ \/ ___/ __ \/ __ `/ ___/
    //   / /_/ / /_/ / |/ |/ /  __/ /  / /_/ / /_/ / /    
    //  / .___/\____/|__/|__/\___/_/  /_.___/\__,_/_/     
    // /_/                                                
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
    update() {
    //console.log("updating");
    
    this.tweens.add({
        targets: this.path,
        t: 1,
        ease: 'Sine.easeInOut',
        duration: 100,
        yoyo: true,
        repeat: -1
    });

    this.graphics.clear();

    //  Draw the curve through the points
    this.graphics.lineStyle(1, 0xff00ff, 1);

    this.curve.draw(this.graphics);

    //  Draw t
    this.curve.getPoint(this.path.t, this.path.vec);
    
    this.graphics.fillStyle(0xffff00, 1);
    this.graphics.fillCircle(this.path.vec.x, this.path.vec.y, 16);

    }
}
