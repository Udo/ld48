Player = {

	init : () => {
		Stage.player = new THREE.Mesh( Stage.geo.player, Stage.mat.player );
		Stage.root.add( Stage.player );
		Stage.player.light = new THREE.PointLight( 0xffbb88, 1, 100 );
		Stage.player.light.position.set( 0, 0, 0 );
		Stage.player.add( Stage.player.light );
	},

	move_by : (x, y) => {
		var nx = Game.state.player.x + x;
		var ny = Game.state.player.y + y;
		if(Player.can_move_to(nx, ny)) {
			Player.move_to(nx, ny);
			GameMap.do_physics();
		} else {
			Game.state.player.cx = Game.state.player.x + x*0.5;
			Game.state.player.cy = Game.state.player.y + y*0.5;
		}
	},

	move_to : (x, y, no_physics = false) => {
		var tile = GameMap.get_tile(x, y);
		Game.state.player.x = x;
		Game.state.player.y = y;
		Stage.player.grid_x = x;
		Stage.player.grid_y = y;
		GameMap.dig_square(x, y);
		if(!no_physics)
			GameMap.apply_gravity(Game.state.player.x, Game.state.player.y, (byx, byy) => {
				Player.move_by(byx, byy);
			}, false, true);
		if(tile.type == 'exit')
			GameMap.current_level.on_exit();
		GameMap.sync();
		// console.log(Game.state.player);
	},

	can_move_to : (x, y) => {
		var tile = GameMap.get_tile(x, y);
		var rx = Game.state.player.x - x;
		var ry = Game.state.player.y - y;
		if(tile.type == 'dirt') return(true);
		if(tile.type == 'exit') return(true);
		if(tile.type == 'empty') {
			if(ry <= 0) return(true);
			/*if(GameMap.get_tile(x-1, y+1).type != 'empty' &&
				GameMap.get_tile(x+1, y+1).type != 'empty')
				return(true);*/
		}
		var b = GameMap.get_behavior(tile);
		if(b.pushable) {
			if(GameMap.can_move_to(tile, x-rx, y-ry)) {
				console.log('IS PUSHABLE?', -rx, -ry);
				GameMap.move_object_by(tile, -rx, -ry);
				return(true);
			}
		}
	},

}
