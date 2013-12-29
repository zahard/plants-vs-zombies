var cxt,map;

(function(){

window.addEventListener('load', function() {
	window.Plants = new PlantsVsZombies();
	Plants.init();
}, false);

function PlantsVsZombies() {	
	var _this = this,
	    canvas = $("canvas"),
	    mCanvas = $("mapCanvas");

	this.isPaused = false;
	this.levelOffset = 100;

	var levelOffset = this.levelOffset;

	this.width  = 600;
	this.height = 400;
	canvas.width  = this.width;
	canvas.height = this.height;
	cxt = canvas.getContext("2d");

	mCanvas.width  = this.width;
	mCanvas.height = this.height;
	map = mCanvas.getContext("2d");

	//Holder for mouse events
	this.mouse = { x: 0, y: 0, clicked: false };

	this.lastSpawnTime = 0;
	this.spawnInterval = 10000;
	
	this.sunCoins = 1000;

	this.lastSunSpawnTime = new Date().getTime();
	this.sunInterval = 3000;

	this.shovelActivated = false;
	
	this.reloadingItems = 0;

	this.zombedLines = [false,false,false,false,false];

	this.zombies = [];
	
	this.suns = [];

	this.plants = generatePlantCells();

	function generatePlantCells() {
		var plants = [];
		for( var line = 5; line--;){
			plants[line] = [];
			for( var cell = 8; cell--;){
				plants[line][cell] = undefined;	
			}
		}
		return plants;
	}

	this.isZombieOnLine = function(line){
		return this.zombedLines[line];
	}

	this.addPlant = function(plant,line,cell) {
		plant.setPosition(line,cell);
		this.plants[line][cell] = plant;
		this.paySunCoins( plant.price );	
	}

	this.init = function() {	
		//Listen for mouse events
		this.addListeners();


		this.drawLevel();

		//Start game
		this.animate();
		
	}

	this.placePlants = function() {
		this.addPlant( PlantFactory('SunFlower'), 0, 0);
	}

	this.drawLevel = function() {
		map.fillStyle = '#7d7';
		map.fillRect(0, 0, this.width, this.height);

		map.fillStyle = '#6c6';
		for( var i = 5; i--; ) {
			for( var j = 9; j--; ) {
				if( (i + j) % 2 == 0 )
					map.fillRect(j*60, levelOffset + i * 60, 60,60);	
			}
		}

		this.availablePlants = [];
		this.availablePlants.push( new AvailablePlant('SunFlower', 0) );
		this.availablePlants.push( new AvailablePlant('PeaseShooter', 1) );
		this.availablePlants.push( new AvailablePlant('WallNut', 2) );
		this.availablePlants.push( new AvailablePlant('TallNut', 3) );


		this.avalablePlantsStatusCheck();
		this.drawHud();
		
		this.on('sunCoinsChanged',function() {
			_this.avalablePlantsStatusCheck();
			_this.drawHud();
		});

		this.on('click',function(e) {
			_this.checkShovelClick();	
		});
	}

	
	this.checkShovelClick = function() {
		if( this.shovelActivated ) {
			this.shovelActivated = false;
			var r = this.cellToRemove;
			if( r && this.plants[r.l][r.c] ) {
				this.plants[r.l][r.c].die();
			}

		} else {
			if( this.mouse.y <= 60 && this.mouse.y >= 10 && 
				this.mouse.x >= this.width-160 &&
				this.mouse.x <= this.width-110 ) {
				this.shovelActivated = true;
			}
		}
	}

	this.avalablePlantsStatusCheck = function() {
		for(var i = this.availablePlants.length;i--;) {
			var ap = this.availablePlants[i];
			ap.isAvailable = ! ap.isReloading && this.sunCoins >= ap.plant.price;
			if( ap.isReloading ) {
				ap.update();
			}
		}
	}

	this.updateHud = function() {
		for(var i = this.availablePlants.length;i--;) {
			var ap = this.availablePlants[i];
			if( ap.isReloading ) {
				ap.update();
			}
		}
	}

	this.drawHud = function() {
		//Draw HUD
		map.save();
		map.fillStyle = '#333';
		map.fillRect(0, 0, this.width, 70);
		
		//Available plants
		for(var i in this.availablePlants ) {
			this.availablePlants[i].draw();
		}

		map.fillStyle = '#fff';
		map.fillRect(this.width-160, 10, 50, 50);

		map.drawImage( $('img-shovel'), this.width-160, 10 , 50 , 50);

		//Display coins
		var txt = '$'+this.sunCoins;
		map.fillStyle = '#777';
		map.fillRect(this.width-100, 10, 90, 50);
		map.fillStyle = '#ff0';
		map.font = 'bold 26px Arial';
		map.fillText('$'+this.sunCoins, this.width - (110 - map.measureText(txt).width/2) , 45);
		map.restore();
	}

	this.checkSuns = function() {
		var found = false;
		for( var i = 0; i < this.suns.length; i++ ) {
			if( this.suns[i].checkClick(this.mouse) ) {
				found = i;
				break;
			}
		}

		if( found !== false ) {
			var newSuns = [];
			for( var i = 0; i < this.suns.length; i++ ) {
				if( i !== found ) {
					newSuns.push( this.suns[i] );
				}else{
					if( this.suns[i].flower )
					this.suns[i].flower.suns--;
					delete this.suns[i];
				}
			}
			this.suns = newSuns;

			this.pickupSunCoin();
			
		}
	}

	this.pickupSunCoin =  function() {
		this.updateSunCoins( this.sunCoins + 25 ); 
	}
	
	this.paySunCoins =  function( coins ) {
		if( coins > this.sunCoins )
			coins = this.sunCoins;

		this.updateSunCoins( this.sunCoins - coins ); 
	}

	this.updateSunCoins =  function( coins ) {
		this.sunCoins = coins;
		this.trigger('sunCoinsChanged');
	}

	this.checkHud = function() {
		for(var i in this.availablePlants ) {
			var o = this.availablePlants[i];
			if( o.isAvailable &&
				this.mouse.x > o.x && 
				this.mouse.x < o.x + o.w &&
				this.mouse.y > o.y && 
				this.mouse.y < o.y + o.h  ) 
			{
				_this.drag = true;
				_this.dragObject = o;
			}
		}
	}

	this.addListeners = function() {

		window.addEventListener('mousemove',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
		});

		window.addEventListener('click',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
			_this.mouse.clicked = true;
		});

		window.addEventListener('mousedown',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
			_this.mouse.down = true;
		});	

		window.addEventListener('mouseup',function(e) {
			_this.mouse.up = true;
		});

		window.addEventListener('keyup',function(e) {
			var ESC = 27;
			if( e.keyCode == ESC ) {
				_this.pauseGame(e);
			}
		});	

		this.on('mousedown', function() {
			if( _this.mouse.y < 75 ) {
				_this.checkHud();
			}
		});

		this.on('mouseup', function() {
			if( _this.drag) {
				if( _this.activeCell ) {
					var cell = _this.activeCell;
					var newPlant = PlantFactory( _this.dragObject.plant.name );
					_this.addPlant( newPlant , cell.l, cell.c);
					_this.activeCell = null;
					_this.dragObject.select();
				}
				_this.drag = false;
				_this.dragObject = null;
			}
		});

		this.on('click', function() {
			_this.checkSuns();
		});
	}

	this.pauseGame = function(e) {
		if( _this.isPaused ) {
			_this.isPaused = false;
			_this.animate();
		} else {
			_this.isPaused = true;
			cxt.save();
			cxt.globalAlpha = 0.7;
			cxt.fillStyle = '#333';
			cxt.fillRect(0,0,this.width,this.height);
			cxt.globalAlpha = 1;
			cxt.fillStyle = '#fff'
			cxt.font = '40px Impact';
			var text = 'P A U S E D'
			cxt.fillText(text, this.width/2 - cxt.measureText(text).width/2, this.height/2 + 20);
			cxt.restore();

		}
	}

	this.animate = function() {
		if( _this.isPaused )
			return;

		_this.update();
		_this.draw();
		requestAnimationFrame(window.Plants.animate)
	}


	this.update = function() {

		var t = new Date().getTime();

		if( this.reloadingItems ) {
			this.updateHud();
		}

		if( this.mouse.down ) {
			this.mouse.down = false;
			this.trigger('mousedown');
		}

		if( this.mouse.up ) {
			this.mouse.up = false;
			this.trigger('mouseup');
		}

		if( this.mouse.clicked ) {
			this.mouse.clicked = false;
			this.trigger('click');
		}


		//Spawn sun
		if( t - this.sunInterval > this.lastSunSpawnTime && this.suns.length < 10 ) {
			this.spawnSun(t);
		}

		//Spawn zombie if required
		if( t - this.spawnInterval > this.lastSpawnTime && this.zombies.length < 2 ) {
			this.spawnZombie(t);
		}
			
		for (var i = this.zombies.length;i--; ) {
			this.zombies[i].update();
		}

		if( this.suns.length) {
			for( var i = this.suns.length;i--;){
				this.suns[i].update();
			}
		}

		for (var line = 0; line < 5; line++ ) {
			for (var cell = this.plants[line].length;cell--; ) {
				if( this.plants[line][cell] )
					this.plants[line][cell].update(); 
			}	
		}
	}

	this.draw = function() {
		this.clearCanvas();

		if( this.reloadingItems ) {
			this.drawHud();
		}

		//HIghtlight active cell
		if( this.drag ) {
			var c = parseInt(this.mouse.x / 60);
			var l = parseInt((this.mouse.y - levelOffset ) / 60);
			if( l >= 0 && l < 5 && c >= 0 && c < 9 ) {
				if( ! this.plants[l] || ! this.plants[l][c] ) {
					cxt.fillStyle = '#7f7'
					cxt.fillRect(c*60, levelOffset + l * 60, 60,60);	
					this.activeCell = {c:c,l:l}
				} else {
					this.activeCell = null;
				}
			} else {
				this.activeCell = null;
			}
			
		}


		for (var line = 0; line < 5; line++ ) {
			for (var cell = this.plants[line].length;cell--; ) {
				if( this.plants[line][cell] )
					this.plants[line][cell].draw(); 
			}	
		}

		for (var i = this.zombies.length;i--; ) {
			this.zombies[i].draw();
		}

		if( this.suns.length) {
			for( var i = this.suns.length;i--;){
				this.suns[i].draw();
			}
		}

		if( this.drag ) {
			this.dragObject.plant.x = this.mouse.x;
			this.dragObject.plant.y = this.mouse.y + this.dragObject.plant.h/2;
			cxt.save();
			cxt.globalAlpha = 0.5
			this.dragObject.plant.draw();
			cxt.restore();
		}


		if( this.shovelActivated ) {
			var c = parseInt(this.mouse.x / 60);
			var l = parseInt((this.mouse.y - levelOffset ) / 60);
			if( l >= 0 && l < 5 && c >= 0 && c < 9 ) {
				cxt.save();
				cxt.fillStyle = '#f00'
				cxt.globalAlpha = 0.3;
				cxt.fillRect(c*60, levelOffset + l * 60, 60,60);	
				cxt.restore();
				cxt.drawImage($('img-shovel'), c*60 + 5 , levelOffset + l * 60 + 5, 50 , 50);
				this.cellToRemove = {c:c,l:l}
			} else {
				this.cellToRemove = null;
			}
		}
	}

	this.spawnSun = function(t) {
		this.suns.push( new Sun( rand(30,this.width-200), rand(150, this.height-30) ) );
		this.lastSunSpawnTime = t;
	}

	this.spawnZombie = function(t) {
		var line = rand(1,5) - 1;
		this.zombies.push( new Zombie(line) );
		this.zombedLines[line] = true;
		this.lastSpawnTime = t;
	}

	this.trigger = function(event) {
		if( typeof this.subscribers != 'undefined' && typeof this.subscribers[event] != 'undefined' ) {
			for(var i in this.subscribers[event]) {
				this.subscribers[event][i].call()
			}
		}
	}

	this.on = function(event, handler) {
		if( typeof this.subscribers == 'undefined' )
			this.subscribers = {};

		if( typeof this.subscribers[event] == 'undefined' )
			this.subscribers[event] = [];

		this.subscribers[event].push(handler);
	}

	this.clearCanvas = function() {
		cxt.clearRect(0, 0, this.width, this.height);
	}
	
}
})()