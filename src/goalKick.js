import Phaser, { Game, Scene } from 'phaser'

function normaliseValue(originalValue) {
    const minValue = -113;
    const maxValue = -66;
    const newMin = -1;
    const newMax = 1;

    const normalisedValue = (originalValue - minValue) / (maxValue - minValue) * (newMax - newMin) + newMin;
    return normalisedValue;
}

function normaliseScale(val, max, min) {
    return (val - min) / (max - min);
}


export default class goalKickScene extends Phaser.Scene {

	constructor(game) {
		super(game)
        this.game = game
        this.input;

        // Fonts
        this.font = 'TCCC-UnityHeadline';

        // Initialise Score
        this.score = 0;
        this.scoreText;


        // Curve Math
        this.path;
        this.curve;
        this.points;
        //this.line;
        this.graphics;
        this.graphicsAlpha = 0.0;
        this.graphicsColour = 0xffcc00;
        
        // Sprites
        this.rav4;

        //Grass stuff
        this.grassSprites;
        this.grassColours = ['0x003408', '0x004b1b', '0x005826', '0x0d7030' , '0x2e8237'];
        this.grassEmitter;
        this.grassPlayed = false;
        
        // UI Sprites
        this.uiArrow;
        this.shotCounter;
        this.shotCounterSprites;
        this.powerLevel;
        this.powerBarLines;
        
        // UI Text
        this.goalText;
        this.pointText;
        this.missText;
        this.weakText
        this.gameoverText;
        this.secondEntryText;
        

        // Bezier points
        this.landingX = 40;
        this.landingY = 380;

        this.controlX = 175;
        this.controlY = 300;
        
        this.startPoint = new Phaser.Math.Vector2(175, 700);
        this.controlPoint1 = new Phaser.Math.Vector2(this.controlX, this.controlY);
        this.endPoint = new Phaser.Math.Vector2(this.landingX, this.landingY);
        
        this.point0;
        this.point1;
        this.point2;

        // Shots and Aim Speed vars
        this.totalShots = 0;
        this.aimSpeed = 1500;
        
        this.shotPower = null;
        this.shotAngle = null;
        this.normalisedAngle = null;

        // Path anim for ball
        this.ballAnim;

        // Game state
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
    this.load.image('fieldBG' ,'./assets/images/bg/field-bg.png' );
    this.load.image('shot' ,'./assets/images/sprites/footy_1.png' );
    this.load.image('footy' ,'./assets/images/sprites/footy-xl.png' );
    this.load.image('goals' ,'./assets/images/sprites/goals.png' );
    this.load.image('rav4', './assets/images/sprites/rav4-sprite.png');

    // load grass sprites
    this.load.image('grassClump' ,'./assets/images/sprites/grass.png' );
    //this.load.image('grass-sprite' ,'./assets/images/sprites/grass-sprites.png' );
    this.grassSprites = this.load.spritesheet('grass-sprite', './assets/images/sprites/grass-sprites.png', { 
        frameWidth: 32, 
        frameHeight: 32, 
        endFrame: 4 
    });
    

    //load UI elements
    this.load.image('ui-arrow' ,'./assets/images/ui/ui-arrow.png' );
    this.load.image('ui-powerbar' ,'./assets/images/ui/ui-powerbar.png' );
    this.load.image('ui-powerbarFill' ,'./assets/images/ui/ui-powerbar-fill.png' );
    this.load.image('ui-shotcounter' ,'./assets/images/ui/ui-shotcounter.png' );

    this.load.image('txt-goal' ,'./assets/images/ui/txt-goal.png' );
    this.load.image('txt-point' ,'./assets/images/ui/txt-point.png' );
    this.load.image('txt-miss' ,'./assets/images/ui/txt-miss.png' );
    this.load.image('txt-weak' ,'./assets/images/ui/txt-weak.png' );
    this.load.image('txt-gameover' ,'./assets/images/ui/txt-gameover.png' );
    this.load.image('txt-second-entry' ,'./assets/images/ui/txt-second-entry.png' );

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
        this.shotPowerText = this.add.text(10, 50, 'Power: 0', {
            fontFamily: this.font,
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0).setAlpha(0).setShadow(-15, 0, '#fff', 0.5, true, false);

        this.shotAngleText = this.add.text(10, 90, 'Angle: 0', {
            fontFamily: this.font,
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0).setAlpha(0).setShadow(-15, 0, '#fff', 0.5, true, false);

        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontFamily: this.font,
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0).setAlpha(1).setShadow(-15, 0, '#fff', 0.5, true, false)


        //let lastTime = 0;
        // this.scoreText.setInteractive({ useHandCursor: true });
        // this.scoreText.on('pointerdown', () => {
        //     let clickDelay = this.time.now - lastTime;
        //     lastTime = this.time.now;
        //     if(clickDelay < 350) {
        //         this.gameOver()
        //     }
        // });


        //            _                                 
        //     __  __(_)  ____ _______________ _      __
        //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
        //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
        //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  

        this.uiArrow = this.add.image(175, 685, 'ui-arrow').setOrigin(0, 0.5).setRotation(0).setName('uiArrow');

        //          __          __                         __           
        //    _____/ /_  ____  / /__________  __  ______  / /____  _____
        //   / ___/ __ \/ __ \/ __/ ___/ __ \/ / / / __ \/ __/ _ \/ ___/
        //  (__  ) / / / /_/ / /_/ /__/ /_/ / /_/ / / / / /_/  __/ /    
        // /____/_/ /_/\____/\__/\___/\____/\__,_/_/ /_/\__/\___/_/     

        this.shotCounter = this.add.image(20, 775, 'ui-shotcounter').setOrigin(0, 1).setName('shotCounter');

        this.shotCounterSprites = [];
        let shot4 = this.add.image(42, 753, 'shot').setOrigin(0.5, 0.5).setName('shot4');
        let shot3 = this.add.image(42, 721, 'shot').setOrigin(0.5, 0.5).setName('shot3');
        let shot2 = this.add.image(42, 690, 'shot').setOrigin(0.5, 0.5).setName('shot2');
        //let shot1 = this.add.image(42, 659, 'shot').setOrigin(0.5, 0.5).setName('shot1');

        //this.shotCounterSprites.push(shot1);
        this.shotCounterSprites.push(shot2);
        this.shotCounterSprites.push(shot3);
        this.shotCounterSprites.push(shot4);

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

        //    ____ __________ ___________
        //   / __ `/ ___/ __ `/ ___/ ___/
        //  / /_/ / /  / /_/ (__  |__  ) 
        //  \__, /_/   \__,_/____/____/  
        // /____/                        
        this.grass = this.add.image(175, 745, 'grassClump').setOrigin(0.5, 1).setName('grassClump');


	}
    
    update() {

        
        this.graphics.clear();

        this.graphics.lineStyle(6, this.graphicsColour, this.graphicsAlpha);
        this.curve.draw(this.graphics, 12);
        //  Get 32 points from the curve
        const points = this.curve.getSpacedPoints(32);
        //  Draw the points
        this.graphics.fillStyle(0xffcc00, 0.5);
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

                if(this.grassPlayed == false) {
                    this.grassAnimation()
                }
                //console.log(this.currentGameState , 'ANIMATING_GOAL');

                break;
            default:
                this.uiArrow.setRotation(Phaser.Math.Angle.BetweenPoints(this.startPoint, this.endPoint));
                
                //console.log(this.currentGameState, 'default');
                break;
        }


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
        this.endPoint.y = this.landingY;

        // increment shot counter
        this.totalShots += 1;
        this.aimSpeed -= 200;

        if (this.totalShots === 4) {
            this.gameOver();
            return;
        }

        // reset arrow opactiy
        this.tweens.add({
            targets: this.uiArrow,
            alpha: 1,
            duration: 400,
            yoyo: false,
            repeat: 0,
        });

        // Remove sprite from shot counter
        this.tweens.add({
            targets: this.shotCounterSprites[this.totalShots - 1],
            alpha: 0,
            ease: 'Sine.easeInOut',
            duration: 300,
            yoyo: false,
            repeat: 0,
        });

        //restart endpoint tween
        this.tweens.add({
            targets: this.endPoint,
            x: 320,
            ease: 'Sine.easeInOut',
            duration: this.aimSpeed,
            yoyo: true,
            repeat: -1,
        });

        //console.log(`Total Shots: ${this.totalShots}, Aim speed: ${this.aimSpeed}`);

        //reset powerbar
        this.powerLevel.setScale(1, 0);

        // reset ball position
        this.ballAnim = this.add.follower(this.curve, 175,700, 'footy');
        this.ballAnim.setAlpha(0);
        this.ballAnim.setScale(0.35);

        this.tweens.add({
            targets: this.ballAnim,
            alpha: 1.0,
            ease: 'Sine.easeInOut',
            duration: 200,
            yoyo: false,
        });

        // reset grass
        this.grass.destroy();
        this.grass = this.add.image(175, 745, 'grassClump').setOrigin(0.5, 1).setName('grassClump');
        this.grassPlayed = false

        // reset graphic line alpha
        this.graphicsAlpha = 0.0
    }

    gameOver() {
        
        //console.log("GAME IS OVER");

        this.powerLevel.destroy();
        this.uiArrow.destroy();
        this.graphics.destroy();
        this.powerBarLines.destroy();
        this.shotCounter.destroy();
        this.shotCounterSprites.forEach((sprite) => {
            sprite.destroy();
        });

        this.gameoverText = this.add.image(180, 300, 'txt-gameover').setAlpha(0.0);
        this.secondEntryText = this.add.image(185, 455, 'txt-second-entry').setAlpha(0.0);
        this.rav4 = this.add.image(190, 590, 'rav4').setScale(0.38).setAlpha(0.0);

        this.tweens.add({
            // Fade in Text
            targets: this.gameoverText,
            y: 275,
            alpha: 1.0,
            ease: 'Cubic.InOut',
            duration: 350,
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                // this.tweens.add({
                //     // Fade in Text
                //     targets: this.secondEntryText,
                //     y: 430,
                //     alpha: 1.0,
                //     ease: 'Cubic.InOut',
                //     duration: 500,
                //     yoyo: false,
                //     repeat: 0,
                // }),
                this.tweens.add({
                    // Fade in Rav4 sprite
                    targets: this.rav4,
                    y: 580,
                    alpha: 1.0,
                    ease: 'Cubic.InOut',
                    duration: 500,
                    yoyo: false,
                    repeat: 0,
                })

                // Create the new HTML elements
                const divElement = document.createElement('div');
                divElement.className = 'app-fg';

                const buttonElement = document.createElement('button');
                buttonElement.id = 'btn_next';
                buttonElement.className = 'btn font-unity';
                buttonElement.textContent = 'OK';

                // Append button to the div
                divElement.appendChild(buttonElement);

                // Append the div to the document body
                document.body.appendChild(divElement);

                const submitBtn = document.getElementById('btn_next');
                if (submitBtn) {
                    submitBtn.addEventListener('click', () => {
                    this.submitScore();
                    });
            }

            }
        })
    }

    powerAnimation() {

        this.tweens.add({
            targets: this.uiArrow,
            alpha: 0,
            duration: 400,
            yoyo: false,
            repeat: 0,
        });

        this.graphicsAlpha = 0.5;

        const animSpeed = 1500
        const animEase  = 'Cubic.InOut'

        const powerX = this.endPoint.x
        const powerY = this.endPoint.y

        
        this.endPoint.x = this.startPoint.x
        this.endPoint.y = this.startPoint.y

        this.tweens.add({
            targets: this.powerLevel,
            scaleY: 1,
            duration: animSpeed,
            yoyo: true,
            repeat: -1,
            ease: animEase,
        });

        this.tweens.add({
            targets: this.controlPoint1,
            y: 20,
            ease: animEase,
            duration: animSpeed,
            yoyo: true,
            repeat: -1,
        });

        this.tweens.add({
            targets: this.endPoint,
            x: powerX,
            y: powerY,
            ease: animEase,
            duration: animSpeed,
            yoyo: true,
            repeat: -1,
        });
    }

    setPower() {
        // Lock the current powerLevel
        this.lockedPowerLevel = Math.floor(this.powerLevel.scaleY * 100);

        
        // Update the UI text with the locked powerLevel value
        //console.log('Power:', Math.floor(this.lockedPowerLevel));
        this.shotPowerText.setText(`Power: ${Math.floor(this.lockedPowerLevel)}`);

        // Calculate the target scale factor based on powerLevel.scaleY
        const initialScale = 0.35;
        const minimumScale = 0.01;
        const targetScaleFactor = this.powerLevel.scaleY;

        // Calculate the target scale using the targetScaleFactor
        const targetScale = initialScale + targetScaleFactor * (minimumScale - initialScale);
        //console.log(`Target Scale (${targetScale}) = Target Scale Factor: ${targetScaleFactor} * (Minimum Scale: ${minimumScale} - Initial Scale: ${initialScale})`);

        let easeType;
        let animDuration;

        if (this.lockedPowerLevel <= 80) {
            animDuration = 1750;
            easeType = 'Cubic.Out';
        }
        else if (this.lockedPowerLevel <= 60) {
            animDuration = 1500;
            easeType = 'Cubic.Out';
        }
        else if (this.lockedPowerLevel >= 50) {
            animDuration = 750;
            easeType = 'Cubic.Out';
        }
        else if (this.lockedPowerLevel > 49) {
            animDuration = 250;
            easeType = 'Cubic.In';
        }

        // Start the ballAnim tween
        this.tweens.add({
            targets: this.ballAnim,
            scaleY: targetScale, // Tween the scaleY property to the minimumScale value
            scaleX: targetScale, // Tween the scaleX property to the minimumScale value
            duration: animDuration,
            delay: 500,
            ease: easeType,
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                this.animateText();
            }
        });

        // Start the path-following tween if needed
        this.ballAnim.startFollow({
            duration: 1750,
            yoyo: false,
            delay: 300,
            ease: easeType,
            repeat: 0,
            rotateToPath: true,
            rotationOffset: 90,
        });

        // this.ballAnim.startFollow({
        //     duration: 1750,
        //     yoyo: false,
        //     delay: 300,
        //     ease: 'Cubic.Out',
        //     repeat: 0,
        //     rotateToPath: true,
        //     //verticalAdjust: true,
        //     rotationOffset: 90,
        //     onComplete: () => {
        //         this.animateText();
        //     }
        // });

        // this.tweens.add({
        //     targets: this.ballAnim,
        //     scale: targetScale * -1,
        //     ease: 'Cubic.Out',
        //     duration: 1750,
        //     yoyo: false,
        //     repeat: 0,
        // });

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

    grassAnimation() {
        //console.log('grass animation');

        const tint = this.grassColours;

        setTimeout(() => {
        this.grassEmitter = this.add.particles(175, 740, 'grass-sprite', {
            frame: { frames: [0, 1, 2, 3], cycle: true },
            lifespan: 1750,
            x: { min: -15, max: 15},
            angle: { min: -60, max: -120 },
            speed: { min: 250, max: 300 },
            scale: { start: 1.0, end: 0.5 },
            alpha: { start: 1.0, end: 0.0 },
            gravityY: 400,
            emitting: true,
            stopAfter: 25,
            quantity: 25,
            rotate: { min: 0, max: 360 },
            // particleTint: ['0x003408', '0x004b1b', '0x005826', '0x0d7030' , '0x2e8237'],
            tint
        });
    }, 350)

        this.grassPlayed = true;

    }

    animateText() {

        // this.grassEmitter.setConfig({
        //     emitting: false,
        // });

        this.goalText = this.add.image(185, 400, 'txt-goal').setAlpha(0.0);
        this.pointText = this.add.image(185, 400, 'txt-point').setAlpha(0.0);
        this.missText = this.add.image(185, 400, 'txt-miss').setAlpha(0.0);
        this.weakText = this.add.image(180, 400, 'txt-weak').setAlpha(0.0);
        
        const angle = Number(this.normalisedAngle.toFixed(2));    
        const power = Math.floor(this.lockedPowerLevel);
        console.log(`Angle: ${angle} Power: ${power}`);

        let textToShow;

        if (angle >= -0.28 && angle <= 0.19 && power >= 95) {
            textToShow = this.goalText;
            this.score += 6;
        } else if (angle >= -0.70 && angle <= -0.32 && power >= 95) {
            textToShow = this.pointText;
            this.score += 1
        } else if (angle >= 0.20 && angle <= 0.62 && power >= 95) {
            textToShow = this.pointText;
            this.score += 1
        } else if (angle >= 0.66 && angle <= 1.0 && power >= 95) {
            textToShow = this.missText;
        } else if (angle >= -1.0 && angle <= -0.71 && power >= 95) {
            textToShow = this.missText;
        } else {
            // Handle the default case here
            textToShow = this.weakText;
        }

        //console.log(textToShow.texture.key);

        const fadeInDuration = 500; // Duration of the fade-in animation (in milliseconds)
        const holdDuration = 750; // Duration of the hold (in milliseconds)
        const fadeOutDuration = 500; // Duration of the fade-out animation (in milliseconds)
        const holdDelay = 500; // Delay before starting the fade-out animation (in milliseconds)

        this.tweens.add({
            // Fade out Text
            targets: this.ballAnim,
            alpha: 0, // Fade out to transparency
            duration: 200,
            delay: 0, // Delay before starting the fade-out animation
            onComplete: () => {
                // Reset the game
                this.ballAnim.destroy();
            }
        })

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

    submitScore() {
        location.href = "https://winaravfootypromo.com.au/thanks/" + "?score=" + this.score;
    }

}
