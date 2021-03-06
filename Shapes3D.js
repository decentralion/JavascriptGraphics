var defaultDepth = 700;
var sym = '.';
var baseSize = 14;

function Point3D(x, y, z, id){
	this.id = id;
	this.pSize = baseSize;
	document.write('<b id="' + id + '">' + sym +'</b>');
	s = document.getElementById(this.id).style;
	s.position = 'absolute';
	s.fontSize = 0 + 'px';

	this.move = function(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
	};

	this.relativeMove = function(xr, yr, zr){
		this.x += xr;
		this.y += yr;
		this.z += zr;
	};

	this.draw = function(){
		// Set the point size based on the depth
		// Increasing point size tends to shift the character to the right and down so we
		// will introduce a corrective factor
		s = document.getElementById(this.id).style;
		pSize = baseSize * defaultDepth / this.z;

		s.left = this.x - pSize * .165;
		s.top  = this.y - pSize * .850;
		s.fontSize = pSize + 'px';
		sf = Math.pow(defaultDepth / this.z, 3);

		o = ((-180.0)/360) * this.z + 280;


		if (o > 255) o = 255;
		if (o < 0  ) o = 0;
		o = Math.floor(o);
 
		s.color = 'rgb(' + o + ', ' + o + ', 0)';
		//console.log('fontSize set to ' + this.pSize + 'px');
		s.zIndex = Math.floor(700-this.z); 
	};
};

function Circle3D(x, y, z, radius, nPoints, id, speed){
	// defaults to axis 0,0,1 (whole circle rotates at constant depth)
	this.x = x;
	this.y = y;
	this.z = z;
	this.r = radius;
	this.nPoints = nPoints;
	this.id = id;
	this.points = [];
	this.stepSize = 2 * Math.PI / this.nPoints;

	this.basis1 = [0,1,0];
	this.basis2 = [0,0,1];

	this.speed = speed;
	this.angularOffset = 0;

	for (var i=0; i<nPoints; i++){
		var newid = this.id + '.' + i;
		var newPoint = new Point3D(0, 0, 0, newid);
		this.points.push(newPoint);
	}

	this.move = function(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
	};

	this.relativeMove = function(xr, yr, zr){
		this.x += xr;
		this.y += yr;
		this.z += zr;
	};

	this.changeBasis = function(bases){
		// needs to be an orthonormal basis for things to work properly
		this.basis1 = bases[0];
		this.basis2 = bases[1];
	};

	this.rotate = function(){
		this.angularOffset += speed;
		this.angularOffset %= 2 * Math.PI;
	};

	// this.logPointLocations = function(){
	// 	for (var i=0; i<nPoints; i++){
	// 		this.points[i].logLocation();
	// 	}
	// };

	this.changeRadius = function(radius) {this.r = radius;};

	this.draw = function(){
		/* 
	recalculate the location of each point and then draw it...
	here is the general algorithm:
	the circle is rotating on a plane perpendicular to the axis that we've been given
	we first calculate the position of the point on this plane, using the the point's
	angular displacement (based on which # point it is) and the overall angular offset
	and the radius. we calculate its position on the plane in variables a,b which 
	are a 2d coordinate

	then we use the two basis vectors we computed earlier in this.changeaxis to map from 
	our 2d planar coordinates to the 3d coordinate. then we offset by the circle's origin

	simple eh?
	*/
		for (var i=0; i<nPoints; i++){
			var angle, a, b;
			angle = this.angularOffset + this.stepSize * i;
			a = Math.cos(angle) * this.r;
			b = Math.sin(angle) * this.r;
			px = this.x + this.basis1[0] * a + this.basis2[0] * b;
			py = this.y + this.basis1[1] * a + this.basis2[1] * b;
			pz = this.z + this.basis1[2] * a + this.basis2[2] * b;

			this.points[i].move(px, py, pz);
			this.points[i].draw();
		}
	};
};


function Sphere(x, y, z, radius, nPoints, nCircles, id, speed){
	this.x = x;
	this.y = y;
	this.z = z;
	this.r = radius;
	this.nPoints = nPoints;
	this.nCircles = nCircles;
	this.id = id;
	this.circles = [];
	this.depths  = [];
	this.speed = speed;
	this.axis = [1, 0, 0];

	this.init = function (){ 
		this.topPoint = new Point3D(this.x + this.r, this.y, this.z, this.id + '.top');
		this.botPoint = new Point3D(this.x - this.r, this.y, this.z, this.id + '.bot');

		var circleSpacing = Math.PI / (nCircles+1);
		for (var i=0; i<nCircles; i++){
			var newId = this.id + '.' + i;
			var angle = circleSpacing * (i+1);
			var cirRadius = Math.sin(angle) * this.r;
			var cirDepth = Math.cos(angle) * this.r;
			//console.log('cRadius', cRadius, 'cirRadius', cirRadius);
			this.addCircle(newId, cirDepth, cirRadius, nPoints, speed);
		}
		this.changeAxis(this.axis);
	};

	// this.generateCircle = function(angle){
	// 	// angle must be in range (0, 2Pi)
	// 	var cirRadius = Math.sin(angle) * this.r;
	// 	var cirDepth = Math.cos(angle) * this.r;

	// }

	this.addCircle = function(id, depth, radius, nPoints, speed){
		var newCircle = new Circle3D(0,0,0, radius, nPoints, id, speed);
		this.circles.push(newCircle);
		this.depths.push(depth);
		//this.changeAxis(this.axis);
	}

	this.changeAxis = function(abc){
		this.axis = abc;
		a = abc[0];
		b = abc[1];
		c = abc[2];
		var norm = Math.sqrt(a*a + b*b + c*c);
		a /= norm;
		b /= norm;
		c /= norm;
		r = this.r; // saves some space, this.r is kinda long
		//console.log('a,b,c,n: ',a,b,c,norm);
		this.topPoint.move(this.x + a * r, this.y + b * r, this.z + c * r);
		this.botPoint.move(this.x - a * r, this.y - b * r, this.z - c * r);

		bases = generateBasis(a,b,c);

		var n = nCircles/2;
		for (var i=0; i<nCircles; i++){
			var depth = this.depths[i];
			this.circles[i].move(this.x + a*depth, this.y + b*depth, this.z + c*depth);
			this.circles[i].changeBasis(bases);
		}
	};

	this.move = function(x, y, z){
		var relativeX = x - this.x;
		var relativeY = y - this.y;
		var relativeZ = z - this.z;
		// use relative move so we don't need to do any axis recalculation
		this.x = x;
		this.y = y;
		this.z = z;
		this.topPoint.relativeMove(relativeX, relativeY, relativeZ);
		this.botPoint.relativeMove(relativeX, relativeY, relativeZ);
		for (var i=0; i<nCircles; i++){
			this.circles[i].relativeMove(relativeX, relativeY, relativeZ);
		}
	};

	this.rotate = function(){
		for (var i=0; i<this.nCircles; i++){
			this.circles[i].rotate()
		}
	}

	this.draw = function(){
		for (var i=0; i<this.nCircles; i++){
			this.circles[i].draw();
			this.topPoint.draw();
			this.botPoint.draw();
		}
	};

	this.changeRadius = function(radius){
		this.r = radius;
		var circleSpacing = Math.PI / (nCircles+1);
		for (var i=0; i<nCircles; i++){
			var angle = circleSpacing * (i+1);
			// z^2 + cR^2 = r^2
			// cR = sqrt(r^2 + z^2)
			var cirRadius = Math.sin(angle) * this.r;
			var cirDepth = Math.cos(angle) * this.r;
			//console.log('cRadius', cRadius, 'cirRadius', cirRadius);
			this.circles[i].changeRadius(cirRadius);
			this.depths[i] = cirDepth;
		};
	}

	this.init();
};


generateBasis = function(a, b, c){
	if (a == 0 && b == 0){
		// Catch the corner case where my algorithm won't work
		// and also default to no-depth solution when given invalid 0,0,0 input
		basis1 = [1, 0, 0];
		basis2 = [0, 1, 0];
	} else {
		// we define two orthogonal vectors according to the following algorithm:
		// where axis is (a,b,c)
		// o1 = (b, -a, 0)
		// o2 = axis x o1 = (ca, cb, -a^2 - b^2)
		var ortho1, ortho2, n1, n2;
		var a2 = Math.pow(a,2);
		var b2 = Math.pow(b,2);
		var c2 = Math.pow(c,2);
		n1 = Math.sqrt(a2 + b2);
		basis1 = [b / n1, -a / n1, 0];
		n2 = Math.sqrt(c2 * (a2 + b2) + Math.pow(a2,2) + Math.pow(b2,2) + 2*a2*b2);
		basis2 = [c * a / n2, c * b / n2, -(a2 + b2) / n2]
	}
	return [basis1, basis2]
};
