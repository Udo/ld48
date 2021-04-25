Keyboard = {

	init : () => {

		$(window).on('keydown', function(e) {
			if(Game.state.user_input) {
				if(e.key == 'w') Player.move_by(0, -1);
				if(e.key == 'a') Player.move_by(-1, 0);
				if(e.key == 's') Player.move_by(0, 1);
				if(e.key == 'd') Player.move_by(1, 0);
			}
			if(e.key == 'r') GameMap.init(GameMap.current_level_name);
		});

		$(window).on('keyup', function(e) {
		});

	},

}
