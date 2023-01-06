import Phaser from 'phaser'

export default class goalKickScene extends Phaser.Scene {

	constructor() {
		super('hello-world')
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

    var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    var line = new Phaser.Geom.Line();
    var angle = 0;
    var uiArrowAngle = 0;

    // //draws line to mouse from arrow origin
    // this.input.on('pointermove', function (pointer) {
    //     angle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
    //     Phaser.Geom.Line.SetToAngle(line, uiArrow.x, uiArrow.y, angle, 245);
    //     gfx.clear().strokeLineShape(line);
    // }, this);


    //        __                                                
    //   ____/ /________ __      __   _______  ________   _____ 
    //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
    // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
    // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/  

    let path;
    let curve;
    let points;
    let graphics;

    let landingX = this.input.mousePointer.x;

    graphics = this.add.graphics();

    path = { t: 0, vec: new Phaser.Math.Vector2() };

    let startPoint = new Phaser.Math.Vector2(175, 700);
    let controlPoint1 = new Phaser.Math.Vector2(180, 100);
    let endPoint = new Phaser.Math.Vector2(landingX, 380);

    curve = new Phaser.Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);

    points = curve.getSpacedPoints(32);

    let point0 = this.add.image(startPoint.x, startPoint.y, 'ball', 0).setTint(0x0000)
    let point1 = this.add.image(endPoint.x, endPoint.y, 'ball', 0).setTint(0x0000ff)
    let point2 = this.add.image(controlPoint1.x, controlPoint1.y, 'ball').setTint(0xff0000)

    point0.setData('vector', startPoint);
    point1.setData('vector', endPoint);
    point2.setData('vector', controlPoint1);

    this.tweens.add({
        targets: path,
        t: 1,
        ease: 'Sine.easeInOut',
        duration: 2000,
        yoyo: true,
        repeat: -1
    });

    graphics.clear();

    //  Draw the curve through the points
    graphics.lineStyle(1, 0xff00ff, 1);

    curve.draw(graphics);

    //  Draw t
    curve.getPoint(path.t, path.vec);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(path.vec.x, path.vec.y, 16);

    

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
        
    }
}
