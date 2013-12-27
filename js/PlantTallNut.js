PlantTallNut = function() {
	Plant.apply(this,arguments);
	this.color = '#333';
	this.price = 150;
	this.h = 75;
	this.health = 900;
}
extend(PlantTallNut,Plant);

PlantTallNut.prototype.update = function() {
	var t = new Date().getTime();
	this.checkDamage(t);
}
