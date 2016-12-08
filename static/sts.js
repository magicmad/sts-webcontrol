// GLobal variables to hold mouse x-y pos.s
var mouseX = 0
var mouseY = 0


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
		mouseX = event.clientX + document.body.scrollLeft
		mouseY = event.clientY + document.body.scrollTop
	} else {  // grab the x-y pos.s if browser is NS
		mouseX = e.pageX
		mouseY = e.pageY
	}
	// catch possible negative values in NS4
	if (mouseX < 0){mouseX = 0}
	if (mouseY < 0){mouseY = 0}  

	return true
}

// get values from joy image click
function getJoyValues(elementId)
{
	var elem = document.getElementById(elementId);

	x = 0;
	y = 0;
	if ((mouseX > elem.offsetLeft && mouseX < elem.offsetLeft + elem.width) && (mouseY > elem.offsetTop && mouseY < elem.offsetTop + elem.height))
	{
		x = mouseX - elem.offsetLeft;
		y = mouseY - elem.offsetTop;
	}
	else
		return [0,0];


	// set zero to center (range x & y = -250 to 250)
	x = x - (elem.width / 2);
	y = y * -1 + (elem.height / 2);

	// from 250 to 100
	x = x / (elem.width / 200);
	y = y / (elem.height / 200);

	return [x, y];
}

// calc direction from image click and drive motors
function driveMotors()
{
	// motors 1 and 2 speed
	y1 = 0;
	y2 = 0;

	// get joy values
	joyValues = getJoyValues('joy');
	x = joyValues[0];
	y = joyValues[1];
  
 
	// center click - stop
	if(x > -24 && x < 24 && y > -24 && y < 24)
	{
		x = 0;
		y = 0; 
	}

	// left or right - turn
	if(y > -22 && y < 22)
	{
		// speed is x distance to center
		y1 = x;
		y2 = x * -1;
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

		// x reduces the speed
		if(x < 0)
		  y1 = y1 * factor;

		if(x > 0)
		  y2 = y2 * factor;
	}

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

// send motor stop
function stopMotors()
{
	$.getJSON('/drive', {
		m1: 0,
		m2: 0
	}, function(data) {
		$("#result").text(data.m1 + " - " + data.m2);
	});
}

// calc direction from image click and drive servo
function servo(num)
{
	// servo center value
	servomin = 2.6;
	servomax = 11.2;
	servorange = servomax - servomin;			// 8.6
	servofactor = 100 / servorange;				// to get the 0,100 range to servo duty cycle values
	servopos = servomin + (servorange / 2);		// center = 6.9

	// get joy values
	joyValues = getJoyValues("servo" + num);

	if(num == 0)
	{
		servopos = joyValues[0] * -1;
	}
	else
	{
		servopos = joyValues[1] * -1;
	}

	// convert from range -100,100 to 2.6,11.2 ::: 
	servopos = (servopos + 100) / 2;	// range is now 0,100
	servopos = servomin + (servopos / servofactor); //range is now servomin to servomax

	$.getJSON('/servo', { num: num, pos: servopos }, null);
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
	var client = new WebSocket('ws://10.1.1.132:8084/');
	var player = new jsmpeg(client, {canvas:canvas});

	resizeCanvas();
}
