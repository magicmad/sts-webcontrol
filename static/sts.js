// GLobal variables to hold mouse x-y pos.s
var tempX = 0
var tempY = 0


// Detect if the browser is IE or not.
// If it is not IE, we assume that the browser is NS.
var IE = document.all?true:false

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) document.captureEvents(Event.MOUSEMOVE)

// Set-up to use getMouseXY function onMouseMove
document.onmousemove = getMouseXY;


// resize listener
window.addEventListener('resize', resizeCanvas);


// retrieve mouse x-y pos
function getMouseXY(e) 
{
  if (IE) { // grab the x-y pos.s if browser is IE
    tempX = event.clientX + document.body.scrollLeft
    tempY = event.clientY + document.body.scrollTop
  } else {  // grab the x-y pos.s if browser is NS
    tempX = e.pageX
    tempY = e.pageY
  }  
  // catch possible negative values in NS4
  if (tempX < 0){tempX = 0}
  if (tempY < 0){tempY = 0}  
  return true
}

// get values from joy image click
function getJoyValues()
{
	//alert(tempX + "  " + tempY);
	var elem = document.getElementById('joy');
	//alert('top = ' + elem.offsetTop
	//   + '\nleft = ' + elem.offsetLeft
	//   + '\nwidth = ' + elem.width );

	x = 0;
	if (tempX > elem.offsetLeft && tempX < elem.offsetLeft + elem.width)
		x = tempX - elem.offsetLeft;

	y = 0;
	if (tempY > elem.offsetTop && tempY < elem.offsetTop + elem.height)
		y = tempY - elem.offsetTop;

	// set zero to center (range x & y = -250 to 250)
	x = x - 250;
	y = y * -1 + 250;

	// from 250 to 100
	x = x / 2.5;
	y = y / 2.5;

	return [x, y];
}


function driveMotors()
{
  // motors 1 and 2 speed
  y1 = 0;
  y2 = 0;
	
  // get joy values
  joyValues = getJoyValues();
  x = joyValues[0];
  y = joyValues[1];
  
  $("#ix").text(x);
  $("#iy").text(y);
 
  // center click - stop
  if(x > -20 && x < 20 && y > -20 && y < 20)
  {
    x = 0;
	y = 0; 
  }
  
  // left or right - turn
  if(y > -20 && y < 20)
  {
    // speed is x distance to center
    y1 = x * -1;
	y2 = x;
  }
  else
  {  
	// motors 1 and 2 speed
    y1 = y;
    y2 = y;
  
    // from 0 - 1
    factor = Math.abs(x) / 100;
    // invert
    factor = 1 - factor;

    //  $("#result").text(factor);
    //  return false;
    //  alert(y1 + " - " + y2);

    // x reduces the speed
    if(x < 0)
      y2 = y2 * factor;

    if(x > 0)
      y1 = y1 * factor;
  }

  document.getElementById('result').text = y1 + " - " + y2;
  //  return false;

  // convert to integers
  y1 = parseInt(y1, 10);
  y2 = parseInt(y2, 10);

  // send values
  $.getJSON('/drive', {
    m1: y1,
    m2: y2
  }, function(data) {
    $("#result").text(data.m1 + " - " + data.m2);
  });

  return false;
}

function stopMotors()
{
  $.getJSON('/drive', {
    m1: 0,
    m2: 0
  }, function(data) {
    $("#result").text(data.m1 + " - " + data.m2);
  });
}


function resizeCanvas()
{
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	var canvas = document.getElementById('videoCanvas');
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
}

function startVideo()
{
	// Show loading notice
	var canvas = document.getElementById('videoCanvas');
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#444';
	ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);
	
	// Setup the WebSocket connection and start the player
	var client = new WebSocket('ws://10.1.1.99:8084/');
	var player = new jsmpeg(client, {canvas:canvas});
	
	resizeCanvas();
}