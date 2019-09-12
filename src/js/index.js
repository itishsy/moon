import game from './game';
// import 'zepto'
// import '../css/lib/reset.css';
import '../css/index.css';
export default class App  {
	constructor(){
	}
	init(){
		game.w = screen.availWidth;
		game.h = screen.availHeight;
		game.bgWidth = game.w;
		console.log(game.w + ',' + game.h);
		$("#gamepanel").width(game.w+"px").height(game.h+"px");
		game.init();
	}
}
let app = new App();
app.init();