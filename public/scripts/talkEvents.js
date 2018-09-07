navigator.serviceWorker.getRegistrations().then(function(registrations) {
 for(let registration of registrations) {
  registration.unregister()
} });

const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
  centerX: window.innerWidth/2,
  centerY: window.innerHeight/2,
  maxRadius: (window.innerHeight-(window.innerWidth/6))/2,
  minRadius: (window.innerHeight/10)/2
};

// initialise Reveal
Reveal.initialize({

  // The "normal" size of the presentation, aspect ratio will be preserved
  // when the presentation is scaled to fit different resolutions. Can be
  // specified using percentage units.
  width: 1024,
  height: 768,

  // Factor of the display size that should remain empty around the content
  margin: 0.1,

  // Bounds for smallest/largest possible scale to apply to content
  minScale: 0.2,
  maxScale: 1.5,

  center: false,

  // Display controls in the bottom right corner
  controls: false,

  // Display a presentation progress bar
  progress: false,

  // Display the page number of the current slide
  slideNumber: false,

  // Push each slide change to the browser history
  history: true,

  // Enable keyboard shortcuts for navigation
  keyboard: {
    25: 'next' // go to the next slide when the DOWN key is pressed
  },

  // Transition style
  transition: 'fade', // none/fade/slide/convex/concave/zoom

  // Transition speed
  transitionSpeed: 'default', // default/fast/slow

  // Transition style for full page slide backgrounds
  backgroundTransition: 'default', // none/fade/slide/convex/concave/zoom

  // Number of slides away from the current that are visible
  viewDistance: 2,

  // Parallax background image
  parallaxBackgroundImage: '', // e.g. "'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg'"

  // Parallax background size
  parallaxBackgroundSize: '', // CSS syntax, e.g. "2100px 900px"

  // Amount to move parallax background (horizontal and vertical) on slide change
  // Number, e.g. 100
  parallaxBackgroundHorizontal: '',
  parallaxBackgroundVertical: ''

});

// instigate canvas
const screen = document.getElementById('screen');
const canvas = document.createElement('canvas');
screen.appendChild(canvas);
console.log(canvas);
canvas.width = dimensions.width;
canvas.height = dimensions.height;
let ctx = canvas.getContext('2d');

// audio api stuff
const audioCtx = new AudioContext;
const freqSampleSize = 1024;
let analyserNode = new AnalyserNode(audioCtx, {
  fftSize: freqSampleSize*2,
  maxDecibels: -30,
  minDecibels: -100,
  smoothingTimeConstant: 0.8
});

// create an array for received analysis data to be stored
var receivedData = new Uint8Array(freqSampleSize);

// worker stuff
const analysisWorker = new Worker('scripts/w_analyser.js');
// put message sending into a function, just to make sure it happens after we receive data...
function sendMessageToWorker() {
  analysisWorker.postMessage({'freqs': receivedData, 'count': freqSampleSize});
}

function getStreamData() {
  // pipe in analysing to getUserMedia
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => audioCtx.createMediaStreamSource(stream))
    .then(source => {
      source.connect(analyserNode);
    });
}
Reveal.addEventListener('hex', function(ev) {
  screen.style.display = 'block';
  getStreamData().then(render);
})

// set which animation to show
let currentAnimation = 'hex',
  renderFrame = true,
  useWorker = true;

function render() {
  requestAnimationFrame(render);

  if (renderFrame) {
    renderFrame = false;

    // get frequency data
    analyserNode.getByteFrequencyData(receivedData);
    // console.log(receivedData);

    if (useWorker) {
      sendMessageToWorker();
      analysisWorker.onmessage = function(e) {
        newFreqs = e.data;
      }
      drawHex(newFreqs);
    } else {
      drawHex(receivedData);
    }

  } else {
    renderFrame = true;
  }

}

// visual functions
let drawHex = function(freqs) {
  ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  for (let i = 0; i < freqs.length; i++) {
    var d = freqs[i];

    drawHexagon(ctx, d, i*80, i*50);
    ctx.strokeStyle = "hsla("+(i*10+100)+",60%,80%,1)";
    ctx.fillStyle = "hsla("+(i*10+100)+",60%,80%,0.8)";
    // ctx.arc(x, y, d/(j*5), 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }

}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

function drawHexagon(ctx, sideLength, startX, startY) {

  // maths mother fucker
  const moveX = Math.sin(Math.radians(30))*sideLength;
  const moveY = Math.cos(Math.radians(30))*sideLength;

  // I actually want the origin to be in the centre
  var startX = startX-(sideLength/2);
  var startY = startY-moveY;

  ctx.beginPath(); // instigate
  ctx.moveTo(startX, startY); // start at pos
  ctx.lineTo(startX+sideLength, startY); // go right along top (we're drawing clockwise from top left)

  ctx.lineTo(startX+sideLength+moveX, startY+moveY);
  ctx.lineTo(startX+sideLength, startY+(moveY*2));
  ctx.lineTo(startX, startY+(moveY*2));
  ctx.lineTo(startX-moveX, startY+moveY);
  ctx.lineTo(startX, startY);
  ctx.closePath();
}


Reveal.addEventListener( 'no-visuals', function() {
  screen.style.display = 'none';
}, false);

