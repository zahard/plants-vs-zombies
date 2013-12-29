PlantFactory = function(plantName) {
	var validName = plantName.charAt(0).toUpperCase() + plantName.slice(1);
	var className = 'Plant' + validName;
	if( typeof window[className] != 'undefined' ) {
		var args = Array.prototype.slice.call(arguments,1);
		return new window[className](plantName);	
	}
}

AvailablePlant = function(plantName, position) {
	var offset = 20;
	this.plant = PlantFactory(plantName);
	this.position = position;
	this.w = 50;
	this.h = 50;
	this.x = offset/2 + position * ( this.w + offset);
	this.y = offset/2;

	this.isReloading = false;
	this.reloadStarted = 0;
	this.reloadInterval = 5000;
}

AvailablePlant.prototype.draw = function() {
	map.save();

	if( ! this.isReloading ) {
		map.fillStyle = this.isAvailable ? '#fff' : '#ccc';
		map.fillRect( this.x, this.y, this.w, this.w);
	} else {

		var lightH = parseInt(this.w * this.reloadPercent / 100);
		var darkH = this.w - lightH;
		var boundY = this.y + darkH;

		map.fillStyle = '#777';
		map.fillRect( this.x, this.y, this.w, darkH);
		
		map.fillStyle = this.isAvailable ? '#fff' : '#ccc';
		map.fillRect( this.x, boundY, this.w, lightH);
		
	}
	
	map.fillStyle = this.plant.color;
	map.fillRect( this.x + 10, this.y + 10, this.w - 20, this.w - 20 );
	
	map.font = 'bold 18px Arial';
	map.fillStyle = 'yellow';
	map.fillText( this.plant.price, this.x + 4, this.y + 16);
	map.font = '16px Arial';
	map.fillStyle = '#333	';
	map.fillText( this.plant.price, this.x + 5, this.y + 15);

	map.restore();
}

AvailablePlant.prototype.update = function() {
	if( ! this.isReloading ) return;

	var now = new Date().getTime(),
	    start = this.reloadStarted,
	    end = this.reloadStarted + this.reloadInterval;

	if( now > end ) {
		this.isReloading = false;
	} else {
		this.reloadPercent = Math.round( (now - start) / (end - start) * 100 );
	}
}

AvailablePlant.prototype.select = function() {
	Plants.reloadingItems++;
	this.isReloading = true;
	this.reloadStarted = new Date().getTime();
}

Plant = function(plantName) {
	this.name = plantName;
	this.price = 25;
	this.line = null;
	this.cell = null;
	this.w = 40;
	this.h = 50;
	this.isAlive = true;
	this.health = 100;
}

Plant.prototype.setPosition = function(l,c) {
	var levelOffset = Plants.levelOffset;
	this.line = l;
	this.c = c;
	this.y = l * 60 + levelOffset + 60*2/3;
	this.x = c * 60 + 60/2;
}
Plant.prototype.draw = function() {
	cxt.fillStyle = this.isDamaged ? '#fff' : this.color;
	cxt.fillRect( this.x - this.w/2, this.y - this.h, this.w,this.h);
	cxt.strokeRect( this.x - this.w/2, this.y - this.h, this.w,this.h);	

	//Display health
	cxt.font = '16px Arial';
	cxt.fillStyle = '#fff';
	cxt.fillText(this.health,this.x - 15,this.y - 20);
}

Plant.prototype.update = function() {}

Plant.prototype.die = function() {
	this.isAlive = false;	
	var newPlants = [];
	for( var cell = 0; cell < 8; cell++ ) {
		if( Plants.plants[this.line][cell] !== this)
			newPlants.push(Plants.plants[this.line][cell]);
		else
			newPlants.push(undefined);
	}
	Plants.plants[this.line] = newPlants;
	delete this;
}

Plant.prototype.setDamage = function(damage) {
	this.health -= damage;
	this.isDamaged = true;
	this.damageTime = new Date().getTime();
}

Plant.prototype.checkDamage = function(t) {
	if( this.isDamaged ) {
		if( t - 250 > this.damageTime ) {
			if( this.health > 0) {
				this.isDamaged = false;
			} else {
				this.die();
			}
		}
	}
}