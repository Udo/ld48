Player = {

	init : () => {
		Stage.player = new THREE.Mesh( Stage.geo.player, Stage.mat.player );
		Stage.root.add( Stage.player );
		Stage.player.light = new THREE.PointLight( 0xffbb88, 1, 100 );
		Stage.player.light.position.set( 0, 0, 0 );
		Stage.player.light.castShadow = true;
		Stage.player.light.shadow.bias = + 0.0025;
		Stage.player.light.distance = Game.feature_size*4;
		Stage.player.light.lamp_power = 3000;
		Stage.player.add( Stage.player.light );
	},

	move_by : (x, y) => {
		var nx = Game.state.player.x + x;
		var ny = Game.state.player.y + y;
		if(Player.can_move_to(nx, ny)) {
			Player.move_to(nx, ny);
			GameMap.do_physics();
			GameMap.do_tick();
		} else {
			Game.state.player.cx = Game.state.player.x + x*0.5;
			Game.state.player.cy = Game.state.player.y + y*0.5;
		}
	},

	animate : (dt) => {
		Stage.player.light.power =
			Stage.player.light.lamp_power +
				Math.sin(15.31*GameMap.animation_time)*Stage.player.light.lamp_power*0.05+
				Math.sin(5.1*GameMap.animation_time)*Stage.player.light.lamp_power*0.05+
				Math.sin(2*GameMap.animation_time)*Stage.player.light.lamp_power*0.05;
	},

	move_to : (x, y, no_physics = false) => {
		var tile = GameMap.get_tile(x, y);
		Game.state.player.x = x;
		Game.state.player.y = y;
		Stage.player.grid_x = x;
		Stage.player.grid_y = y;
		if(!tile.is_solid && tile.solid_material) {
			// pass-through tile
		} else {
			if(!Game.state.player.is_ghost || tile.type == 'dirt')
				GameMap.kill_tile(x, y);
		}
		if(!no_physics)
			GameMap.apply_gravity(Game.state.player.x, Game.state.player.y, (byx, byy) => {
				Player.move_by(byx, byy);
			}, false, true);
		if(tile.type == 'exit')
			GameMap.current_level.on_exit();
		GameMap.sync();
	},

	can_move_to : (x, y) => {
		if(x < 0 || y < 0 || x >= GameMap.current_level.grid_size_x || y >= GameMap.current_level.grid_size_y)
			return(false);
		var tile = GameMap.get_tile(x, y);
		var rx = Game.state.player.x - x;
		var ry = Game.state.player.y - y;
		if(tile.type == 'dirt') return(true);
		if(tile.type == 'exit') return(true);
		if(!tile.is_solid) {
			if(ry <= 0) return(true);
			/*if(GameMap.get_tile(x-1, y+1).type != 'empty' &&
				GameMap.get_tile(x+1, y+1).type != 'empty')
				return(true);*/
		}
		if(tile.is_solid && Game.state.player.is_ghost) {
			return(true);
		}
		var b = GameMap.get_behavior(tile);
		if(b.pushable) {
			if(GameMap.can_move_to(tile, x-rx, y-ry)) {
				GameMap.move_object_by(tile, -rx, -ry);
				return(true);
			} else {
				GameMap.trigger_behavior(tile, 'push_fail');
			}
		}
	},

}
