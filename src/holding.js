
    //        __                                                
    //   ____/ /________ __      __   _______  ________   _____ 
    //  / __  / ___/ __ `/ | /| / /  / ___/ / / / ___/ | / / _ \
    // / /_/ / /  / /_/ /| |/ |/ /  / /__/ /_/ / /   | |/ /  __/
    // \__,_/_/   \__,_/ |__/|__/   \___/\__,_/_/    |___/\___/                                     
    let graphics;
    let path;
    let curve;
    graphics = this.add.graphics();

    path = { t: 0, vec: new Phaser.Math.Vector2() };

    var startPoint = new Phaser.Math.Vector2(175, 800);
    var controlPoint1 = new Phaser.Math.Vector2(50, 100);
    var controlPoint2 = new Phaser.Math.Vector2(600, 100);
    var endPoint = new Phaser.Math.Vector2(180, 400);

    curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
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

    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(path.vec.x, path.vec.y, 16);

