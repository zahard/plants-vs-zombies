PlantWallNut = function() {
	Plant.apply(this,arguments);
	this.color = 'brown';
	this.price = 50;
	this.health = 500;
}
extend(PlantWallNut,Plant);

PlantWallNut.prototype.update = function() {
	var t = new Date().getTime();
	this.checkDamage(t);
}
