export default class drawCurve {
  constructor(game) {
    this.game = game

    this.pointer = this.game.input.pointer;
    this.uiArrow = game.add.image(175, 685, 'ui-arrow').setOrigin(0, .5);
    this.uiArrowRotation = this.uiArrow.rotation;
    this.uiPowerbar = game.add.image(330, 635, 'ui-powerbar');
    this.uiArrowAngle = 90;

    this.score = 0

    this.cursors = this.game.input.keyboard.createCursorKeys()
    this.createStaticFields()
    this.spriteSetup()
    this.uiSetup()
  }

  createStaticFields() {
    this.scoreIncrement = 10
    this.moveVelocity = 160
    this.jumpVelocity = -330
  }

  spriteSetup() {
    
    //            _                                 
    //     __  __(_)  ____ _______________ _      __
    //    / / / / /  / __ `/ ___/ ___/ __ \ | /| / /
    //   / /_/ / /  / /_/ / /  / /  / /_/ / |/ |/ / 
    //   \__,_/_/   \__,_/_/  /_/   \____/|__/|__/  
                                                    
    //logic for angling arrow towards mouse
    this.game.input.on('pointermove', function(pointer) {
        this.uiArrowAngle = Phaser.Math.Angle.BetweenPoints(this.uiArrow, pointer);
        this.uiArrowRotation = this.uiArrowAngle
    });

    var gfx = this.game.add.graphics().setDefaultStyles({ lineStyle: { width: 5, color: 0xBADA55, alpha: 0.5 } });
    var line = new Phaser.Geom.Line();
    var angle = 0;
    var uiArrowAngle = 0;
  }


  uiSetup() {
    this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  }

  update() {
    //console.log("GameUI.js loaded");
  }

}