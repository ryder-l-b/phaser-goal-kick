import Phaser from 'phaser'

export default class phaserTest extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.graphics = undefined;
        this.landingX = 80;
        this.landingY = 100;            
        this.path;
        this.curve;
        this.points;
        this.graphics;
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

    this.load.image('dragcircle', 'images/sprites/ball.png' );

	} //END OF preload();

	create() {
       
    //                       _ __  _                 
    //     ____  ____  _____(_) /_(_)___  ____  _____
    //    / __ \/ __ \/ ___/ / __/ / __ \/ __ \/ ___/
    //   / /_/ / /_/ (__  ) / /_/ / /_/ / / / (__  ) 
    //  / .___/\____/____/_/\__/_/\____/_/ /_/____/  
    // /_/                                           
        
    // //original positions
    // this.add.image(180, 400, 'fieldBG');
    // this.add.image(180, 400, 'goals');
    // this.add.image(175, 700, 'ball').setTint(0x75000d);

    //position UI elements
    //let uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0, .5);

    //            _                                 
    //     __  __(_)  ____ _______________ _      __
    //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
    //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
    //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  
                                                    
    // //logic for angling arrow towards mouse
    // var uiArrowAngle = 0;
    // this.input.on('pointermove', function(pointer) {
    //     uiArrowAngle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
    //     uiArrow.rotation = uiArrowAngle
    // });

    // var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    // var line = new Phaser.Geom.Line();
    // var angle = 0;

    // //draws line to mouse from arrow origin
    // this.input.on('pointermove', function (pointer) {
    //     angle = Phaser.Math.Angle.BetweenPoints(uiArrow, pointer);
    //     Phaser.Geom.Line.SetToAngle(line, uiArrow.x, uiArrow.y, angle, 245);
    //     gfx.clear().strokeLineShape(line);
    // }, this);
    
    //                                    __              
    //     ____  ____ _      _____  _____/ /_  ____ ______
    //    / __ \/ __ \ | /| / / _ \/ ___/ __ \/ __ `/ ___/
    //   / /_/ / /_/ / |/ |/ /  __/ /  / /_/ / /_/ / /    
    //  / .___/\____/|__/|__/\___/_/  /_.___/\__,_/_/     
    // /_/                                                

    // //position powerbar & powerbar fill
    // let powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5, 1);
    // this.add.image(330, 635, 'ui-powerbar');
    // // Set the initial scale of the power meter
    // powerLevel.setScale(1, 0);
    // // Tween the scale of the power meter
    // this.tweens.add({
    //   targets: powerLevel,
    //   scaleY: 1,
    //   duration: 1000,
    //   yoyo: true,
    //   repeat: -1,
    // });

        
    //        __                                                
    //   ____/ /________ __      __   _______  ________   _____ 
    //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
    // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
    // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/  
    
    var path;
    var curve;
    var points;
    let graphics; 
    


    graphics = this.add.graphics();

    path = { t: 0, vec: new Phaser.Math.Vector2() };

    var startPoint = new Phaser.Math.Vector2(175, 700);
    var controlPoint1 = new Phaser.Math.Vector2(180, 100);
    var endPoint = new Phaser.Math.Vector2(this.landingX, this.landingY);

    curve = new Phaser.Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);

    points = curve.getSpacedPoints(32);

    var point0 = this.add.image(startPoint.x, startPoint.y, 'dragcircle').setInteractive().setTint(0x00ff00);
    var point1 = this.add.image(endPoint.x, endPoint.y, 'dragcircle').setInteractive().setTint(0x0000ff);
    var point2 = this.add.image(controlPoint1.x, controlPoint1.y, 'dragcircle').setInteractive().setTint(0xff0000);

    point0.setData('vector', startPoint);
    point1.setData('vector', endPoint);
    point2.setData('vector', controlPoint1);

    point0.setData('isControl', false);
    point1.setData('isControl', false);
    point2.setData('isControl', true);

    this.input.setDraggable([ point0, point1, point2 ]);



    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;

        gameObject.data.get('vector').set(dragX, dragY);

        //  Get 32 points equally spaced out along the curve
        points = curve.getSpacedPoints(32);
    });


    this.tweens.add({
        targets: path,
        t: 1,
        ease: 'Sine.easeInOut',
        duration: 2000,
        yoyo: true,
        repeat: -1
    });
        graphics.clear();

    graphics.lineStyle(1, 0x00ff00, 1);

    curve.draw(graphics);

    curve.getPoint(path.t, path.vec);

    graphics.fillStyle(0xffbbd4, 1);
    graphics.fillCircle(path.vec.x, path.vec.y, 16);

	} // END OF create();


    update() {
    //console.log("updating");

   
    } // END OF update();
    
}
