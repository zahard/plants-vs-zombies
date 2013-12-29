/**
 *
 */

PlantPeaseShooter = function() {
	Plant.apply(this,arguments);
	this.color = 'blue';
	
	this.image = $('img-peashooter');
	
	this.price = 100;

	this.lastFireTime = 0;
	this.fireSpeed = 3000;
	this.waitFor2fire = false;

	this.shots = [];
	this.health = 100;
}
extend(PlantPeaseShooter,Plant);


PlantPeaseShooter.prototype.update = function() {
	var t = new Date().getTime();
	
	var isZombieOnTheLine = Plants.isZombieOnLine(this.line);

	if( isZombieOnTheLine && t - this.fireSpeed > this.lastFireTime ) {
		this.fire();
		this.lastFireTime = t;
		this.waitFor2fire = true;
	}

	
	if( this.waitFor2fire && t - 300 > this.lastFireTime ) {
		this.fire();
		this.waitFor2fire = false;
	}

	if( this.shots.length) {
		for( var i = this.shots.length;i--;){
			this.shots[i].update();
		}	
	}

	this.checkDamage(t);
}

PlantPeaseShooter.prototype.draw = function() {
	//Plant.prototype.draw.apply(this);

	cxt.drawImage( this.image, this.x - this.w , this.y -60, 80,80)

	if( this.shots.length) {
		for( var i = this.shots.length;i--;){
			this.shots[i].draw();
		}	
	}	
}

PlantPeaseShooter.prototype.fire = function() {
	this.shots.push( new Shot(this) );
}


Shot = function(shooter, speed) {
	this.shooter = shooter;
	this.speed = speed || 2;
	this.radius = 10;
	this.x = shooter.x + 25;
	this.y = shooter.y - 35;
	this.damage = 10;
}
Shot.prototype.update = function() {
	this.x += this.speed;
	for( var i = Plants.zombies.length;i--; ) {
		zombie = Plants.zombies[i];
		if(zombie.line == this.shooter.line) {
			if( zombie.x - zombie.w/2 <= this.x + this.radius) {
				zombie.setDamage(this.damage);
				this.explode();
			}
		}
	}
}

Shot.prototype.explode = function() {
	var newShots = [];
	for( var i = 0; i < this.shooter.shots.length; i++ ) {
		if( this.shooter.shots[i] !== this)
			newShots.push(this.shooter.shots[i]);
	}
	this.shooter.shots = newShots;
	delete this;
}

Shot.prototype.draw = function() {
	cxt.save();
	cxt.beginPath();
	cxt.arc(this.x, this.y, this.radius,  rad(0) , rad(360), false );
	
	var grd = cxt.createLinearGradient(this.x,this.y,this.x+10,this.y + 10);
	grd.addColorStop(0, '#A2DC41');
	grd.addColorStop(1, '#5E9406');


	cxt.fillStyle = grd;
	
	cxt.fill();
	cxt.lineWidth = 1;
	cxt.strokeStyle = '#5E9406';
	cxt.stroke();
	cxt.closePath();
}