PlantSunFlower = function() {
	Plant.apply(this,arguments);
	this.color = 'orange';
	this.price = 50;
	this.suns = 0;
	this.sunsDrawed = 0;
	this.lastSunSpawned = new Date().getTime();
	this.sunSpawnInterval = 5000;
}
extend(PlantSunFlower,Plant);

PlantSunFlower.prototype.update = function() {
	var t = new Date().getTime();
	this.checkDamage(t);
	if( t - this.sunSpawnInterval > this.lastSunSpawned ) {
		this.lastSunSpawned = t;
		if( this.suns < 2 ) {
			Plants.suns.push( new Sun( this.x,this.y,this) );
		}
	}
	this.sunsDrawed = 0;
}

PlantSunFlower.prototype.updateSunsOrder = function() {

}

Sun = function (x,y,flower) {
	this.x = x;
	this.y = 85;
	this.destY = y;

	this.isFalling = true;
	this.flower = flower || null;
	this.radius = 12;
	if( this.flower ) {
		this.y = this.flower.y - this.flower.h;
		this.flower.suns++;
		this.order = this.flower.suns - 1;
	}
}

Sun.prototype.draw = function () {
	var p = this.getPosition();
	
	cxt.save();
	cxt.beginPath();
	cxt.arc( p.x, p.y, this.radius,  rad(0) , rad(360), false );
	cxt.fillStyle = 'red';
	cxt.fill();
	cxt.lineWidth = 3;
	cxt.strokeStyle = 'yellow';
	cxt.stroke();
	cxt.closePath();
	cxt.restore();
}

Sun.prototype.update = function () {
	if( this.isFalling ) {
		if( this.y - this.destY ) {
			this.y += 0.5;
		} else {
			this.isFalling = false;
		}
	}
}

Sun.prototype.getPosition = function () {
	var p = { x: this.x, y: this.y};
	if( this.flower ) {
		p.x = p.x - 5 + this.order * 10;
	}
	return p;
}

Sun.prototype.checkClick = function (e) {
	var p = this.getPosition();
	var distance = Math.sqrt( (e.x - p.x)*(e.x - p.x) + (e.y - p.y)*(e.y - p.y) );
	return distance <= this.radius;
}
