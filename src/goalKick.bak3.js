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

        this.footy;

        this.line;
        
        this.graphics;

        this.uiArrow;
        this.powerLevel;

        this.landingX = 40;

        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(175, 300);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, 380);

        this.point0;
        this.point1;
        this.point2;

        this.shotPower = null;
        this.shotAngle = null;

        this.ballAnim;

        this.gameState = {
            IDLE: 0,
            SETTING_ANGLE: 1,
            ANIMATING_POWER: 2,
            SETTING_POWER: 3,
            ANIMATING_GOAL: 4,
        };

        this.currentGameState = this.gameState.IDLE;

	}

	preload() {

    //load sprites and BG
    this.load.image('fieldBG' ,'images/bg/field-bg.png' );
    //this.load.image('ball' ,'images/sprites/ball.png' );
    this.load.image('footy' ,'images/sprites/footy.png' );
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
        
        this.powerLevel = this.add.image(330, 775, 'ui-powerbarFill').setOrigin(0.5, 1).setName('powerLevel');
        this.add.image(330, 635, 'ui-powerbar');

        // Set the initial scale of the power meter
        this.powerLevel.setScale(1, 0);

        
        //        __                                                
        //   ____/ /________ __      __   _______  ________   _____ 
        //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
        // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
        // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/  

        this.graphics = this.add.graphics();

        this.path = { t: 0, vec: new Phaser.Math.Vector2() };

        this.curve = new Phaser.Curves.QuadraticBezier(this.startPoint, this.controlPoint1, this.endPoint);

        this.points = this.curve.getSpacedPoints(32);

        this.point0 = this.add.image(this.startPoint.x, this.startPoint.y, 'footy', 0).setAlpha(0.0)
        //this.point1 = this.add.image(this.endPoint.x, this.endPoint.y, 'ball', 0).setTint(0xffcc00)
        this.point1 = new Phaser.Math.Vector2(this.endPoint.x, this.endPoint.y);
        // this.point2 = this.add.image(this.controlPoint1.x, this.controlPoint1.y, 'ball').setTint(0xff0000)
        this.point2 = new Phaser.Math.Vector2(this.controlPoint1.x, this.controlPoint1.y);

        this.point0.setData('vector', this.startPoint);
        //this.point1.setData('vector', this.endPoint);
        //this.point2.setData('vector', this.controlPoint1);

        this.point0.setData('isControl', false);
        //this.point1.setData('isControl', false);
        //this.point2.setData('isControl', true);

        this.tweens.add({
            targets: this.endPoint,
            x: 320,
            ease: 'Sine.easeInOut',
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Register the pointerdown event
        this.input.on('pointerup', this.handleClick, this);


        //     ____            __       
        //    / __/___  ____  / /___  __
        //   / /_/ __ \/ __ \/ __/ / / /
        //  / __/ /_/ / /_/ / /_/ /_/ / 
        // /_/  \____/\____/\__/\__, /  
        //                     /____/   
        // this.footy = this.add.image(175, 700, 'footy').setName('footy');
        this.ballAnim = this.add.follower(this.curve, 175,700, 'footy');

	}
    
    update() {

        this.graphics.clear();

        //  Draw the curve through the points
        // this.graphics.lineStyle(9, 0xff0080, 0.25);

        // this.curve.draw(this.graphics);

        // Get 32 points from the curve
        const curvePoints = this.curve.getSpacedPoints(32);

        this.graphics.lineStyle(1, 0xffffff, 0.5);
        this.curve.draw(this.graphics, 12);
        //  Get 32 points from the curve
        const points = this.curve.getSpacedPoints(32);
        //  Draw the points
        this.graphics.fillStyle(0xffcc00, 1);
        for (let i = 0; i < points.length; i++)
        {
            this.graphics.fillCircle(points[i].x, points[i].y, 2);
        }

        // this.line = new Phaser.Geom.Line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
        // this.graphics.lineStyle(1, 0xcccccc, 1); // Set line style: 1 pixel width, white
        // this.graphics.strokeLineShape(this.line); // Draw the line

        // // Calculate and draw 32 evenly spaced points along the line
        // this.graphics.fillStyle(0x00B000, 1); // Set the point color to green

        // const numPoints = 32;
        // for (let i = 0; i <= numPoints; i++) {
        //     const t = i / numPoints;
        //     const x = Phaser.Math.Linear(this.line.x1, this.line.x2, t);
        //     const y = Phaser.Math.Linear(this.line.y1, this.line.y2, t);
        //     this.graphics.fillCircle(x, y, 2);
    
        //     // Connect line point with corresponding curve point
        //     this.graphics.lineStyle(1, 0xffff00, 1); // Set line style to yellow
        //     this.graphics.lineBetween(x, y, curvePoints[i].x, curvePoints[i].y);
        // }


        //Game State Management
        switch (this.currentGameState) {

            case this.gameState.SETTING_ANGLE:
                // Update logic for rotating arrow animation

                this.tweens.killTweensOf(this.endPoint);
                // Update logic for setting angle
                this.lockedShotAngle = this.uiArrow.rotation;
    
                // Log the value of the locked shot angle
                this.shotAngleText.setText(`Angle: ${Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle))}`);

                //console.log(this.currentGameState);
                this.currentGameState = this.gameState.ANIMATING_POWER;
                this.powerAnimation();
                break;

            case this.gameState.ANIMATING_POWER:
                // Update logic for animating power

                //console.log(this.currentGameState, 'ANIMATING_POWER');
                break;

            case this.gameState.SETTING_POWER:
                this.setPower();

                this.shotPowerText.setText(`Power: ${Math.floor(this.powerLevel.scaleY * 100)}`);

                this.currentGameState = this.gameState.ANIMATING_GOAL;
                break;

            case this.gameState.ANIMATING_GOAL:
                // Update logic for animating goal
                this.animateGoal();
                //console.log(this.currentGameState , 'ANIMATING_GOAL');

                break;
            default:
                this.uiArrow.setRotation(Phaser.Math.Angle.BetweenPoints(this.startPoint, this.endPoint));
                //console.log(this.currentGameState, 'default');
                break;
        }

        //console.log(this.controlPoint1.y);

    }

    handleClick() {
        switch (this.currentGameState) {
            case this.gameState.IDLE:
                this.currentGameState = this.gameState.SETTING_ANGLE;
                // Start rotating arrow animation
                //console.log(this.curve);
                break;

            case this.gameState.SETTING_ANGLE:
                this.currentGameState = this.gameState.ANIMATING_POWER;
                // Start tweening powerbar
                //console.log('Angle:', Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle)));
                break;

            case this.gameState.ANIMATING_POWER:

                this.currentGameState = this.gameState.SETTING_POWER;
                // Start tweening powerbar
                //console.log('Angle:', Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle)));
                // Set the power level based on current powerbar scale
                this.tweens.killTweensOf(this.powerLevel);
                break;

            case this.gameState.SETTING_POWER:

                this.currentGameState = this.gameState.ANIMATING_GOAL;

                break;

            case this.gameState.ANIMATING_GOAL:
                // Handle click during goal animation

                this.currentGameState = this.gameState.default;
                break;

            default:
                break;

        }
    }

    powerAnimation() {
        
        this.tweens.add({
            targets: this.powerLevel,
            scaleY: 1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Cubic.In',
        });

        this.tweens.add({
            targets: this.controlPoint1,
            y: 20,
            ease: 'Cubic.In',
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });
        // this.tweens.add({
        //     targets: this.endPoint,
        //     x: 400,
        //     ease: 'Sine.easeInOut',
        //     duration: 1500,
        //     yoyo: true,
        //     repeat: -1,
        // });
    }

    setPower() {
        // Lock the current powerLevel
        this.lockedPowerLevel = Math.floor(this.powerLevel.scaleY * 100);

        // Update the UI text with the locked powerLevel value
        console.log('Power:', Math.floor(this.lockedPowerLevel));

        // Update the UI text with the locked powerLevel value
        this.shotPowerText.setText(`Power: ${Math.floor(this.lockedPowerLevel)}`);


        this.ballAnim.startFollow({
            duration: 1750,
            yoyo: false,
            delay: 300,
            ease: 'Cubic.InOut',
            repeat: 0,
            rotateToPath: true,
            //verticalAdjust: true,
            rotationOffset: 90,
        });

        this.tweens.add({
            targets: this.ballAnim,
            scale: 0.45,
            ease: 'Cubic.InOut',
            duration: 1750,
            yoyo: false,
            repeat: 0,
        });

    }
    
    animateGoal() {
        // Ball animation

        //  Draw t
        // this.curve.getPoint(this.path.t, this.path.vec);
        // this.graphics.fillStyle(0x6e110a, 1);
        // this.graphics.fillCircle(this.path.vec.x, this.path.vec.y, 6);

        this.tweens.killTweensOf(this.controlPoint1);
        this.tweens.killTweensOf(this.endPoint);

        
        //console.log(this.tweens.getTweensOf(this.path));
    }
}
