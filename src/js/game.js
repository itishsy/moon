
function Ship(ctx){
	game.im.loadImage([require('../img/player.png')]);
	this.width = 80;
	this.height = 80;
	this.left = game.w/2 - this.width/2;
	this.top = game.h - 2*this.height;
	this.player = game.im.createImage(require('../img/player.png'));

	this.paint = function(){
		ctx.drawImage(this.player, this.left, this.top, this.width, this.height);
	}

	this.setPosition = function(event){
		if(game.isMobile()){
			var tarL = event.originalEvent.changedTouches[0].clientX;
			var tarT = event.originalEvent.changedTouches[0].clientY;
		}
		else{
			var tarL = event.offsetX;
			var tarT = event.offsetY;
		}
		this.left = tarL - this.width/2 - 16;
		this.top = tarT - this.height/2;
		if(this.left<0){
			this.left = 0;
		}
		if(this.left> game.w-this.width){
			this.left = game.w-this.width;
		}
		if(this.top<0){
			this.top = 0;
		}
		if(this.top>game.h - this.height){
			this.top = game.h - this.height;
		}
		this.paint();
	}

	this.controll = function(){
		var _this = this;
		var stage = $('#gamepanel');
		var currentX = this.left,
			currentY = this.top,
			move = false;
		stage.on(game.eventType.start, function(event){
			_this.setPosition(event);
			move = true;
		}).on(game.eventType.end, function(){
			move = false;
		}).on(game.eventType.move, function(event){
			event.preventDefault();
			if(move){
				_this.setPosition(event);	
			}
			
		});
	}

	this.eat = function(foodlist){
		for(var i=foodlist.length-1; i>=0; i--){
			var f = foodlist[i];
			if(f){
				var l1 = this.top+this.height/2 - (f.top+f.height/2);
				var l2 = this.left+this.width/2 - (f.left+f.width/2);
				var l3 = Math.sqrt(l1*l1 + l2*l2);
				if(l3<=this.height/2 + f.height/2){
					foodlist[f.id] = null;
					if(f.type==0){
						game.stop();
						$('#gameoverPanel').show();
						setTimeout(function(){
							$('#gameoverPanel').hide();
							$('#resultPanel').show();
							game.getScore();
						}, 2000);
					}
					else{
						$('#score').text(++game.score);
						$('.heart').removeClass('hearthot').addClass('hearthot');
						setTimeout(function() {
							$('.heart').removeClass('hearthot')
						}, 200);
					}
				}
			}
			
		}
	}
}


function Food(type, left, id){
	this.speedUpTime = 200;
	this.id = id;
	this.type = type;
	this.width = 45;
	this.height = 45;
	this.left = left;
	this.top = -50;
	this.speed = 0.04 * Math.pow(1.2, Math.floor(game.time/this.speedUpTime));
	this.loop = 0;

	var r = id%4;
	var f = require('../img/food2.png');
	if(r==1){
		f = require('../img/food3.png');
	}else if(r==2){
		f = require('../img/food4.png');
	}else if(r==3){
		f = require('../img/food5.png');
	}

	var p = this.type == 0 ? require('../img/food1.png') : f;
	this.pic = game.im.createImage(p);
}
Food.prototype.paint = function(ctx){
	ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function(ctx){
	if(game.time % this.speedUpTime == 0){
		this.speed *= 1.2;
	}
	this.top += ++this.loop * this.speed;
	if(this.top>game.h){
	 	game.foodList[this.id] = null;
	}
	else{
		this.paint(ctx);
	}
}

function ImageMonitor(){
	var imgArray = [];
	return {
		createImage : function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback=='function'){
						callback();
					}
				}
				imgArray[img].src = img
			}
		}
	}
}

const game = {
	w : 375,
	h : 667,
	bgWidth : 375,
	bgHeight : 1126,
	time : 0,
	timmer : null,
	bgSpeed : 2,
	bgloop : 0,
	score : 0,
	im : new ImageMonitor(),
	foodList : [],
	bgDistance : 0,//背景位置
	eventType : {
		start : 'touchstart',
		move : 'touchmove',
		end : 'touchend'
	},
	init : function(){
		var _this = this;

		if(!_this.isMobile()){
			_this.eventType.start = 'mousedown';
			_this.eventType.move = 'mousemove';
			_this.eventType.end = 'mouseup';
		}

		var canvas = document.getElementById('stage');
		var ctx = canvas.getContext('2d');
		//绘制背景
		var bg = new Image();
		_this.bg = bg;
		bg.onload = function(){
      ctx.drawImage(bg, 0, 0, _this.bgWidth, _this.bgHeight);          	
		}
		// let img = 
		bg.src = require('../img/bg.jpg');
		_this.initListener(ctx);
	},
	initListener : function(ctx){
		var _this = this;
		var body = $(document.body);
		$(document).on(game.eventType.move, function(event){
			event.preventDefault();
		});

		body.on(game.eventType.start, '.replay, .playagain', function(){
			$('#resultPanel').hide();
			var canvas = document.getElementById('stage');
			var ctx = canvas.getContext('2d');
			_this.ship = new Ship(ctx);
      _this.ship.controll();
      _this.reset();
			_this.run(ctx);
		});

		body.on(game.eventType.start, '#guidePanel', function(){
			$(this).hide();
			_this.ship = new Ship(ctx);
			_this.ship.paint();
      _this.ship.controll();
			
			//启动game
			game.run(ctx);
		});
	},
	rollBg : function(ctx){
		if(this.bgDistance>=this.bgHeight){
			this.bgloop = 0;
		}
		this.bgDistance = ++this.bgloop * this.bgSpeed;
		ctx.drawImage(this.bg, 0, this.bgDistance-this.bgHeight, this.bgWidth, this.bgHeight);
		ctx.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
	},
	run : function(ctx){
		var _this = game;
		//清空Canvas
		ctx.clearRect(0, 0, _this.bgWidth, _this.bgHeight);

		_this.rollBg(ctx);// 滚动背景
		_this.ship.paint();//绘制飞船
		_this.ship.eat(_this.foodList);
		_this.generateFood();//产生月饼

		//绘制月饼
		for(var i=_this.foodList.length-1; i>=0; i--){
			var f = _this.foodList[i];
			if(f){
				f.paint(ctx);
				f.move(ctx);
			}
		}
		_this.timmer = setTimeout(function(){
			game.run(ctx);
		}, Math.round(1000/60));

		_this.time++;
	},
	stop : function(){
		var _this = this
		$('#stage').off(game.eventType.start + ' ' +game.eventType.move);
		setTimeout(function(){
			clearTimeout(_this.timmer);
		}, 0);
	},
	generateFood : function(){
		var genRate = 50; //产生月饼的频率
		var random = Math.random();
		if(random*genRate>genRate-1){
			var left = Math.random()*(this.w - 50);
			var type = Math.floor(left)%2 == 0 ? 0 : 1;
			var id = this.foodList.length;
			var f = new Food(type, left, id);
			this.foodList.push(f);
		}
	},
	reset : function(){
		this.foodList = [];
		this.bgloop = 0;
		this.score = 0;
		this.timmer = null;
		this.time = 0;
		$('#score').text(this.score);
	},
	getScore : function(){
		var time = Math.floor(this.time/60);
		var score = this.score;
		var sc0re = $('#sc0re').val();
		if(score < sc0re){
			var num = $('#num').val();
			num = num - 1;
			$('.replay').hide();
			if(num > 0){
				$('#fenghao').removeClass('geili yinhen').addClass('geili');
				$('#scorecontent').html('您在<span id="stime" class="lighttext">2378</span>秒内抢到了<span id="sscore" class="lighttext">21341</span>个月饼<br><span id="suser" class="lighttext">ok</span>');
				$('#stime').text(time);
				$('#sscore').text(score);
		
				$('#suser').html('很遗憾，至少要抢<span class="lighttext">'+sc0re+'</span>个！');
				var txt = "还剩"+num+"次";
				$('.btn1').text(txt).removeClass('share').addClass('playagain');
				$('#fenghao').removeClass('geili yinhen').addClass('yinhen');
				$('#num').val(num);
			} else{
				$('.btn1').hide();
				$('#scorecontent').html('挑战失败，游戏结束');
				var alias = $("#alias").val();
				window.location = "http://wzz.ziqisun.com/m/scratch_"+ alias +"?zqjover=1";
			}
		} else {
			$('#fenghao').removeClass('geili yinhen').addClass('geili');
			$('#scorecontent').html('您在<span id="stime" class="lighttext">2378</span>秒内抢到了<span id="sscore" class="lighttext">21341</span>个月饼<br><span id="suser" class="lighttext">ok</span>');
			$('#stime').text(time);
			$('#sscore').text(score);
			$('#suser').text('挑战成功!');
			$('.btn1').text('我要去抽奖了').removeClass('playagain').removeClass('share').click(function(){
				var alias = $("#alias").val();
				window.location = "http://wzz.ziqisun.com/m/scratch_"+ alias +"?is_answer=1";
			});
		}
	},
	isMobile : function(){
		var sUserAgent= navigator.userAgent.toLowerCase(),
		bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp= sUserAgent.match(/midp/i) == "midp",
		bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid= sUserAgent.match(/android/i) == "android",
		bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
		bIsWebview = sUserAgent.match(/webview/i) == "webview";
		return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
  }
}

export default game;