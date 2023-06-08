import Phaser, { Game, Scene } from 'phaser'

function normaliseValue(originalValue) {
    const minValue = -113;
    const maxValue = -66;
    const newMin = -1;
    const newMax = 1;

    const normalisedValue = (originalValue - minValue) / (maxValue - minValue) * (newMax - newMin) + newMin;
    return normalisedValue;
}


export default class goalKickScene extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.input;

        this.score = 0;
        this.scoreText;

        //this.mouseX = this.input.mousePointer;

        this.path;
        this.curve;
        this.points;
        //this.line;
        this.graphics;
        
        this.uiArrow;
        this.powerLevel;
        this.powerBarLines;
        
        this.goalText;
        this.pointText;
        this.missText;
        this.gameoverText;
        
        this.landingX = 40;

        this.controlX = 175;
        this.controlY = 300;
        
        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(this.controlX, this.controlY);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, 380);

        this.totalShots = 0;
        this.aimSpeed = 1500;
        
        this.point0;
        this.point1;
        this.point2;
        
        this.shotPower = null;
        this.shotAngle = null;
        this.normalisedAngle = null;

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
    this.load.image('footy' ,'images/sprites/footy-xl.png' );
    this.load.image('goals' ,'images/sprites/goals.png' );

    //load UI elements
    this.load.image('ui-arrow' ,'images/ui/ui-arrow.png' );
    this.load.image('ui-powerbar' ,'images/ui/ui-powerbar.png' );
    this.load.image('ui-powerbarFill' ,'images/ui/ui-powerbar-fill.png' );

    this.load.image('txt-goal' ,'images/ui/txt-goal.png' );
    this.load.image('txt-point' ,'images/ui/txt-point.png' );
    this.load.image('txt-miss' ,'images/ui/txt-miss.png' );
    this.load.image('txt-gameover' ,'images/ui/txt-gameover.png' );

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
        this.add.image(175, 290, 'goals');




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
        }).setOrigin(0).setAlpha(0);

        this.shotAngleText = this.add.text(10, 50, 'Angle: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0).setAlpha(0);

        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0).setAlpha(1).setShadow(-15, 0, '#fff', 1, true, false);


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
        this.powerBarLines = this.add.image(330, 635, 'ui-powerbar').setName('powerBarLines');

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
            duration: this.aimSpeed,
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
        this.ballAnim.setScale(0.35);

	}
    
    update() {

        

        this.graphics.clear();

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

        //Game State Management
        switch (this.currentGameState) {

            case this.gameState.SETTING_ANGLE:
                // Update logic for rotating arrow animation

                this.tweens.killTweensOf(this.endPoint);
                // Update logic for setting angle
                this.lockedShotAngle = this.uiArrow.rotation;
    
                // Log the value of the locked shot angle
                // this.shotAngleText.setText(`Angle: ${Math.floor(Phaser.Math.RadToDeg(this.lockedShotAngle))}`);
                this.shotAngle = Math.floor(Phaser.Math.RadToDeg(this.uiArrow.rotation));
                this.normalisedAngle = normaliseValue(this.shotAngle);
                this.shotAngleText.setText(`Angle: ${Number(this.normalisedAngle.toFixed(2))}`);


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

    resetGame() {
        //reset game state
        this.currentGameState = this.gameState.IDLE;

        //reset text
        this.shotAngleText.setText(`Angle: 0`);
        this.shotPowerText.setText(`Power: 0`);

        // Reset controlPoint1 y height
        this.controlPoint1.y = this.controlY;
        
        //reset endpoint
        this.endPoint.x = this.landingX;

        // increment shot counter
        this.totalShots += 1;
        this.aimSpeed -= 150;

        if (this.totalShots === 5) {
            this.gameOver();
            return;
        }

        //restart endpoint tween
        this.tweens.add({
            targets: this.endPoint,
            x: 320,
            ease: 'Sine.easeInOut',
            duration: this.aimSpeed,
            yoyo: true,
            repeat: -1,
        });

        console.log(`Total Shots: ${this.totalShots}, Aim speed: ${this.aimSpeed}`);


        //reset powerbar
        this.powerLevel.setScale(1, 0);

        // reset ball position
        this.ballAnim = this.add.follower(this.curve, 175,700, 'footy');
        this.ballAnim.setScale(0.35);
    }

    gameOver() {
        console.log("GAME IS OVER");

        this.powerLevel.destroy();
        this.uiArrow.destroy();
        this.graphics.destroy();
        this.powerBarLines.destroy();

        this.gameoverText = this.add.image(180, 400, 'txt-gameover').setAlpha(0.0);
        this.tweens.add({
            // Fade in Text
            targets: this.gameoverText,
            y: 375,
            alpha: 1.0,
            ease: 'Cubic.InOut',
            duration: 350,
            yoyo: false,
            repeat: 0
        })
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
            ease: 'Cubic.Out',
            repeat: 0,
            rotateToPath: true,
            //verticalAdjust: true,
            rotationOffset: 90,
            onComplete: () => {
                this.animateText();
            }
        });

        this.tweens.add({
            targets: this.ballAnim,
            scale: 0.01,
            ease: 'Cubic.Out',
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

    animateText() {

        this.goalText = this.add.image(185, 400, 'txt-goal').setAlpha(0.0);
        this.pointText = this.add.image(185, 400, 'txt-point').setAlpha(0.0);
        this.missText = this.add.image(185, 400, 'txt-miss').setAlpha(0.0);
        
        const angle = Number(this.normalisedAngle.toFixed(2));    
        const power = Math.floor(this.lockedPowerLevel);
        console.log(`Angle: ${angle} Power: ${power}`);

        let textToShow;

        if (angle >= -0.23 && angle <= 0.18) {
            textToShow = this.goalText;
            this.score += 6;
        } else if (angle >= -0.69 && angle <= -0.32) {
            textToShow = this.pointText;
            this.score += 1
        } else if (angle >= 0.19 && angle <= 0.61) {
            textToShow = this.pointText;
            this.score += 1
        } else if (angle >= 0.66 && angle <= 1.0) {
            textToShow = this.missText;
        } else if (angle >= -1.0 && angle <= -0.7) {
            textToShow = this.missText;
        } else {
            // Handle the default case here
            textToShow = this.missText;
        }

        console.log(textToShow.texture.key);

        const fadeInDuration = 500; // Duration of the fade-in animation (in milliseconds)
        const holdDuration = 750; // Duration of the hold (in milliseconds)
        const fadeOutDuration = 500; // Duration of the fade-out animation (in milliseconds)
        const holdDelay = 500; // Delay before starting the fade-out animation (in milliseconds)

        this.tweens.add({
            // Fade in Text
            targets: textToShow,
            y: 375,
            alpha: 1.0,
            ease: 'Cubic.InOut',
            duration: fadeInDuration,
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                this.ballAnim.destroy();
                this.scoreText.setText(`Score: ${this.score}`);
                //hold for delay
                this.time.delayedCall(holdDuration, () => {
                    this.tweens.add({
                        // Fade out Text
                        targets: textToShow,
                        alpha: 0, // Fade out to transparency
                        y: 350,
                        duration: fadeOutDuration,
                        delay: holdDelay, // Delay before starting the fade-out animation
                        onComplete: () => {
                            
                            // Reset the game
                            this.time.delayedCall(holdDuration, this.resetGame, [], this)
                        }
                    })
                })
            }
        })
    }
}
