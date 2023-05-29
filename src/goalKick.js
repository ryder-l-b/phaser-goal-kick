import Phaser, { Game, Scene } from 'phaser'

export default class goalKickScene extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.input;

        //this.mouseX = this.input.mousePointer;

        this.path;
        this.curve;
        this.points;
        this.graphics;
        this.line;

        this.uiArrow;

        this.landingX = 40;

        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(180, 100);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, 380);

        this.point0;
        this.point1;
        this.point2;

        this.shotPower = 0;
        this.shotAngle = null;

        this.angleSet = false;
        this.powerSet = false;
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


    //    __            __ 
    //   / /____  _  __/ /_
    //  / __/ _ \| |/_/ __/
    // / /_/  __/>  </ /_  
    // \__/\___/_/|_|\__/  
    // Create text UI
    this.shotPowerText = this.add.text(10, 10, 'Power: 0', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    }).setOrigin(0);

    this.shotAngleText = this.add.text(10, 50, 'Angle: 0', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff'
    }).setOrigin(0);


    //                                    __              
    //     ____  ____ _      _____  _____/ /_  ____ ______
    //    / __ \/ __ \ | /| / / _ \/ ___/ __ \/ __ `/ ___/
    //   / /_/ / /_/ / |/ |/ /  __/ /  / /_/ / /_/ / /    
    //  / .___/\____/|__/|__/\___/_/  /_.___/\__,_/_/     
    // /_/                                     
    
    let powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5, 1).setName('powerLevel');
    this.add.image(330, 635, 'ui-powerbar');

    powerLevel.setInteractive();
    this.input.on('pointerdown', this.setShotPower, this);
    if(this.angleSet == true){
        this.time.delayedCall(1000, this.incrementShotPower, [], this);
    }
    // Set the initial scale of the power meter
    powerLevel.setScale(1, 0);


    //            _                                 
    //     __  __(_)  ____ _______________ _      __
    //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
    //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
    //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  

    this.uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0.5, 1).setRotation(0).setName('uiArrow');

    var gfx = this.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    var line = new Phaser.Geom.Line();
    var angle = 0;
    var uiArrowAngle = 0;
    var distToMouse = 0;


    //        __                                                
    //   ____/ /________ __      __   _______  ________   _____ 
    //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
    // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
    // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/  

    this.graphics = this.add.graphics();

    this.path = { t: 0, vec: new Phaser.Math.Vector2() };

    this.curve = new Phaser.Curves.QuadraticBezier(this.startPoint, this.controlPoint1, this.endPoint);

    this.points = this.curve.getSpacedPoints(32);

    this.point0 = this.add.image(this.startPoint.x, this.startPoint.y, 'ball', 0).setTint(0x0000)
    this.point1 = this.add.image(this.endPoint.x, this.endPoint.y, 'ball', 0).setTint(0xffcc00)
    this.point2 = this.add.image(this.controlPoint1.x, this.controlPoint1.y, 'ball').setTint(0xff0000)

    this.point0.setData('vector', this.startPoint);
    this.point1.setData('vector', this.endPoint);
    this.point2.setData('vector', this.controlPoint1);

    this.point0.setData('isControl', false);
    this.point1.setData('isControl', false);
    this.point2.setData('isControl', true);


    //                                                             __      
    //    ____ ___  ____  __  __________     ___ _   _____  ____  / /______
    //   / __ `__ \/ __ \/ / / / ___/ _ \   / _ \ | / / _ \/ __ \/ __/ ___/
    //  / / / / / / /_/ / /_/ (__  )  __/  /  __/ |/ /  __/ / / / /_(__  ) 
    // /_/ /_/ /_/\____/\__,_/____/\___/   \___/|___/\___/_/ /_/\__/____/  
    
    // handle pointer movement
    this.input.on('pointermove', function (pointer) {
        angle = Phaser.Math.Angle.BetweenPoints(this.uiArrow, pointer);
        distToMouse = Phaser.Math.Distance.Between(this.uiArrow.x, this.uiArrow.y, pointer.x, pointer.y);
        line.setTo(this.uiArrow.x, this.uiArrow.y, this.endPoint.x, this.endPoint.y);
        gfx.clear().strokeLineShape(line);

        // Orient the sprite towards the mouse
        //this.uiArrow.setAngle(Phaser.Math.RadToDeg(angle));

        //logic for angling arrow towards mouse
        this.uiArrowAngle = Phaser.Math.Angle.BetweenPoints(this.uiArrow, pointer);
        this.uiArrow.rotation = this.uiArrowAngle;

        //update bezier endPoint
        this.endPoint.x = this.input.mousePointer.x;
        this.endPoint.y = this.input.mousePointer.y;

        // Orient the sprite towards the mouse
        this.uiArrow.setAngle(Phaser.Math.RadToDeg(this.uiArrowAngle));

    }, this);

    this.time.delayedCall(500, this.incrementShotAngle, [], this);

	}
    update() {

    // this.tweens.add({
    //     targets: this.path,
    //     t: 1,
    //     ease: 'Linear',
    //     duration: 3000,
    //     yoyo: false,
    // });



    // Update the UI text with the locked powerLevel value
    this.shotPowerText.setText(`Power: ${Math.floor(this.lockedPowerLevel)}`);

    this.graphics.clear();
    
    //  Draw the curve through the points
    this.graphics.lineStyle(4, 0xff0080, 0.5);

    this.curve.draw(this.graphics);

    //  Draw t
    this.curve.getPoint(this.path.t, this.path.vec);
    this.graphics.fillStyle(0xffff00, 1);
    this.graphics.fillCircle(this.path.vec.x, this.path.vec.y, 8);

    

    console.log();
    }


    incrementShotAngle() {
        // Create a tween to tween the angle of uiArrow
        this.tweens.add({
            targets: this.uiArrow,
            rotation: Phaser.Math.DegToRad(-0.5),
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Update shotPowerText during the tween
                // this.shotPowerText.setText(`Power: ${Math.floor(this.shotPower)}`);

                // Update Y scale of powerLevel during the tween
                const shotAngle = this.children.getByName('uiArrow');
                const shotAngleDeg = Phaser.Math.RadToDeg(this.uiArrow.rotation);
                shotAngle.setRotation(shotAngleDeg);
                console.log(shotAngle.rotation);
            }
        });
    }
    
    setShotAngle() {
        // Stop the tween if it's currently running
        this.tweens.killTweensOf(this.uiArrow);
    
        // Lock the current shot angle
        this.lockedShotAngle = this.uiArrow.rotation;
    
        // Log the value of the locked shot angle
        console.log('Shot Angle:', Phaser.Math.RadToDeg(this.lockedShotAngle));
    }

    incrementShotPower() {
        this.tweens.add({
            targets: this,
            shotPower: 100,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Cubic.In',
            onUpdate: () => {
                // Update shotPowerText during the tween
                // this.shotPowerText.setText(`Power: ${Math.floor(this.shotPower)}`);

                // Update Y scale of powerLevel during the tween
                const powerLevel = this.children.getByName('powerLevel');
                const scaleFactor = this.shotPower / 100;
                powerLevel.setScale(1, scaleFactor);
            }
        });
    }

    setShotPower() {
        // Lock the current powerLevel
        this.lockedPowerLevel = this.shotPower;

        // Update the UI text with the locked powerLevel value
        this.shotPowerText.setText(`Power: ${Math.floor(this.lockedPowerLevel)}`);
    }

    
}
