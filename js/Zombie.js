Zombie = function(line, options) {
	
	var levelOffset = Plants.levelOffset;

	options = options || {};
	
	this.line = line;
	this.x = options['x'] ||  600;

	this.y = line * 60 + levelOffset + 60*2/3;
	this.w = 50;
	this.h = 90;

	this.health = options['health'] || 100;
	this.damage = options['damage'] || 40;

	this.attackSpeed = options['attackSpeed'] || 3000;
	this.lastAttack = 0;

	this.lastMove = 0;
	this.moveInt = 50;
	
	this.isWalking = false;
	
	this.lastStepTime = 0;
	this.lastStepStarted = 0;

	if( typeof options['stepsDelay'] !== 'undefined') {
		this.stepsDelay = options['stepsDelay'];
	} else {
		this.stepsDelay = 1000;
	}


	this.stepDuration = options['stepDuration'] || 2000;

	this.speed = options['speed'] || 1;

}

Zombie.prototype.update = function() {
	var t = new Date().getTime();

	if( ! this.isAttacking ) {

		if( ! this.isWalking && t - this.stepsDelay > this.lastStepTime ) {
			this.isWalking = true;
			this.lastStepStarted = t;
		}

		if( this.isWalking ) {
			if( t - this.stepDuration > this.lastStepStarted ) {
				this.isWalking = false;
				this.lastStepTime = t;
			} else {
				if( t - this.lastMove > this.moveInt ) {

					this.x -= this.speed;
					this.lastMove = t;
					this.nextCell = parseInt( this.x / 60 ) -1

					var checkPlant;
					if( Plants.plants[this.line][this.nextCell] ) {
						checkPlant = Plants.plants[this.line][this.nextCell];
					}

					if( checkPlant ) {
						if( this.x - this.w/2 < (this.nextCell + 1 ) * 60 ) {
							this.enemy = checkPlant;
							this.isAttacking = true;
							this.x = (this.nextCell + 1 ) * 60 + this.w/2;
						}
					}
				}
			}
		}

	} else {

		if( this.enemy.isAlive ) {
			if( t - this.attackSpeed > this.lastAttack) {
				this.enemy.setDamage(this.damage);
				this.lastAttack = t;
			}
		} else {
			this.isAttacking = false;
			this.enemy = null;
		}
	}


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

Zombie.prototype.draw = function() {
	cxt.fillStyle = this.isDamaged ? 'red' : '#777';
	cxt.fillRect( this.x - this.w/2, this.y - this.h, this.w,this.h);
	cxt.strokeStyle = '#fff';
	cxt.strokeRect( this.x - this.w/2, this.y - this.h, this.w,this.h);

	//Display zombie helth
	cxt.font = '16px Arial';
	cxt.fillStyle = '#fff';
	cxt.fillText(this.health,this.x - 10,this.y - 20);
}

Zombie.prototype.setDamage = function(damage) {
	this.health -= damage;
	this.isDamaged = true;
	this.damageTime = new Date().getTime();
}

Zombie.prototype.die = function(damage) {
	var newZombies = [];
	var zombiesLeftOnLine = false;
	for( var i = 0; i < Plants.zombies.length; i++ ) {
		if( Plants.zombies[i] !== this) {
			newZombies.push(Plants.zombies[i]);
			if( Plants.zombies[i].line == this.line ) {
				zombiesLeftOnLine = true;
			}
		}
	}
	Plants.zombies = newZombies;

	Plants.zombedLines[this.line] = zombiesLeftOnLine;
	
	delete this;

}