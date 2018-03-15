// An Archimedean spiral is a spiral with polar equation
// r=atheta^(1/n),
//where r is the radial distance, theta is the polar angle, and n is a constant which determines how tightly the spiral is "wrapped."

class Spiral {

  // inputProperties returns a list of CSS properties that this paint function gets access to
  // I don't understand this bit but I missed it and was stuck for a little bit
  static get inputProperties() { return ['--smoothness']; }

  paint(ctx, geom, properties) {

    var smoothness = properties.get('--smoothness') || 1;
    smoothness = parseInt( smoothness.toString() );

    var wWidth = geom.width,
      wHeight = geom.height,
      spiralStart = 10,
      spiralSize = 4;

    const sin = Math.sin,
          cos = Math.cos,
          startX = geom.width/4,
          startY = geom.height/4;

    // get a colour in the right range
    function getCol(val) {
      let col = val<1000 ? val : val%1000;
      return 0.36*col;
    }

    ctx.strokeStyle = 'hsla('+getCol(wHeight)+', 70%, 80%, 1)';
    ctx.lineWidth = 5;
    ctx.fillStyle = 'hsla('+getCol(wWidth)+', 60%, 40%, 0.5)';
    // start
    ctx.beginPath();
    // first point
    ctx.moveTo(startX, startY);

    for (let i=0; i<300; i++) {
      let angle = i/smoothness;
      let x = (spiralStart+spiralSize*angle)*cos(angle) + startX;
      let y = (spiralStart+spiralSize*angle)*sin(angle) + startY;

      // console.log(x,y);

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fill();
    }
      ctx.closePath();

  }
}

// Register our class under a specific name
registerPaint('spiral', Spiral);

