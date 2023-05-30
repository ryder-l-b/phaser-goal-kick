import Phaser, { Game, Scene } from 'phaser'

export default class goalKickScene extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.input;

        this.button;

        //this.mouseX = this.input.mousePointer;

        this.path;
        this.curve;
        this.points;
        this.graphics;

        this.uiArrow;

        this.landingX = 40;

        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(180, 100);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, 380);

        this.point0;
        this.point1;
        this.point2;

        this.shotPower = null;
        this.shotAngle = null;

        this.gameState = {
            IDLE: 0,
            SETTING_ANGLE: 1,
            SETTING_POWER: 2,
            ANIMATING_GOAL: 3,
        };

        this.currentGameState = this.gameState.IDLE;

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


        //            _                                 
        //     __  __(_)  ____ _______________ _      __
        //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
        //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
        //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  

        this.uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0, 0.5).setRotation(0).setName('uiArrow');


        //                                    __              
        //     ____  ____ _      _____  _____/ /_  ____ ______
        //    / __ \/ __ \ | /| / / _ \/ ___/ __ \/ __ `/ ___/
        //   / /_/ / /_/ / |/ |/ /  __/ /  / /_/ / /_/ / /    
        //  / .___/\____/|__/|__/\___/_/  /_.___/\__,_/_/     
        // /_/                                     
        
        let powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5, 1).setName('powerLevel');
        this.add.image(330, 635, 'ui-powerbar');

        // Set the initial scale of the power meter
        powerLevel.setScale(1, 0);


        
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

        this.tweens.add({
            targets: this.endPoint,
            x: 320,
            ease: 'Sine.easeInOut',
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Register the pointerdown event
        this.input.on('pointerdown', this.handleClick, this);


	}
    update() {

        this.graphics.clear();
                
        //  Draw the curve through the points
        this.graphics.lineStyle(9, 0xff0080, 0.25);

        this.curve.draw(this.graphics);

        //  Draw t
        this.curve.getPoint(this.path.t, this.path.vec);
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillCircle(this.path.vec.x, this.path.vec.y, 8);
        
        this.curve.getPoint(this.path.t, this.path.vec);
        this.graphics.fillStyle(0xffff00, 1);
        this.graphics.fillCircle(this.path.vec.x, this.path.vec.y, 8);

        switch (this.currentGameState) {

            case this.gameState.SETTING_ANGLE:
                // Update logic for rotating arrow animation
                
                //orient uiArow towards the position of endPoint
                this.uiArrow.setRotation(Phaser.Math.Angle.BetweenPoints(this.startPoint, this.endPoint));

                // Update logic for setting angle
                this.lockedShotAngle = this.uiArrow.rotation;
    
                // Log the value of the locked shot angle
                this.shotAngleText.setText(`Angle: ${Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle))}`);

                break;


            case this.gameState.SETTING_POWER:
                this.tweens.killTweensOf(this.endPoint);
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

                break;

            case this.gameState.ANIMATING_GOAL:
                // Update logic for animating goal

                // Update the UI text with the locked powerLevel value
                this.shotPowerText.setText(`Power: ${Math.floor(this.lockedPowerLevel)}`);

                this.tweens.add({
                    targets: this.path,
                    t: 1,
                    ease: 'Linear',
                    duration: 3000,
                    yoyo: false,
                });

                break;
            default:
                this.uiArrow.setRotation(Phaser.Math.Angle.BetweenPoints(this.startPoint, this.endPoint));
                console.log('default');
                break;
        }

    }

    handleClick() {
        switch (this.currentGameState) {
            case this.gameState.IDLE:
                this.currentGameState = this.gameState.SETTING_ANGLE;
                // Start rotating arrow animation

                console.log('animating arrow');
                break;

            case this.gameState.SETTING_ANGLE:
                this.currentGameState = this.gameState.SETTING_POWER;
                // Start tweening powerbar
                //console.log('Angle:', Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle)));
                break;

            case this.gameState.SETTING_POWER:
                this.currentGameState = this.gameState.ANIMATING_GOAL;
                console.log('animating powerbar');
                // Set the power level based on current powerbar scale
                console.log('setting power');
                break;

            case this.gameState.ANIMATING_GOAL:
                // Handle click during goal animation
                console.log('animating goal');
                break;

            default:
                console.log('idle');

                break;

        }
    }

    incrementShotAngle() {
        this.started = true;
        console.log("game started");
    }
    
    setShotAngle() {
        // Stop the tween if it's currently running
        this.tweens.killTweensOf(this.uiArrow);

    
        // Lock the current shot angle
        this.lockedShotAngle = this.uiArrow.rotation;
    
        // Log the value of the locked shot angle
        this.shotAngleText.setText(`Angle: ${Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle))}`);

        if (this.angleSet == false){
            console.log('Angle:', Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle)));
        }

        this.angleSet = true;

        this.time.delayedCall(10, this.incrementShotPower, [], this);
    }

    incrementShotPower() {

    }

    setShotPower() {
        // stop the tween if it's currently running
        this.tweens.killTweensOf(this.powerLevel);

        // Lock the current powerLevel
        this.lockedPowerLevel = this.shotPower;

        // Update the UI text with the locked powerLevel value
        console.log('Power:', Math.floor(this.lockedPowerLevel));
        this.shotPowerText.setText(`Power: ${this.lockedPowerLevel}`);
    }

    
}
