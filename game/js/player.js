Player = {

	init : () => {
		Stage.player = new THREE.Object3D();
		Stage.root.add( Stage.player );
		Stage.player.body = new THREE.Mesh( Stage.geo.player, Stage.mat.player );
		Stage.player.body.rotation.set(0, -1.6, 3);
		Stage.player.add(Stage.player.body);
		Stage.player.light = new THREE.PointLight( 0xffbb88, 1, 100 );
		Stage.player.light.position.set( 0, 0, 0 );
		Stage.player.light.castShadow = true;
		Stage.player.light.shadow.bias = + 0.0025;
		Stage.player.light.distance = Game.feature_size*4;
		Stage.player.light.lamp_power = 3000;
		Stage.player.add( Stage.player.light );
		Stage.player.is_creature = true;
		Stage.player.can_straddle = true;
		Stage.player.can_push = true;
		Stage.player.rfoot = new THREE.Mesh( Stage.geo.player_foot, Stage.mat.player );
		Stage.player.rfoot.position.set(-0.4*Game.feature_size, 0.4*Game.feature_size, 0);
		Stage.player.add(Stage.player.rfoot);
		Stage.player.lfoot = new THREE.Mesh( Stage.geo.player_foot, Stage.mat.player );
		Stage.player.lfoot.position.set(+0.4*Game.feature_size, 0.4*Game.feature_size, 0);
		Stage.player.add(Stage.player.lfoot);
	},

	move_by : (x, y) => {
		var nx = Game.state.player.x + x;
		var ny = Game.state.player.y + y;
		Game.push_state();
		if(Player.can_move_to(nx, ny)) {
			Player.move_to(nx, ny);
			GameMap.do_physics();
			GameMap.do_tick();
		} else {
			Game.undo_levels.pop();
			Game.state.player.cx = Game.state.player.x + x*0.5;
			Game.state.player.cy = Game.state.player.y + y*0.5;
		}
	},

	animate : (dt) => {
		Stage.player.body.position.y = Math.sin(GameMap.animation_time*4)*Game.feature_size*0.1;
		Stage.player.light.power =
			Stage.player.light.lamp_power +
				Math.sin(15.31*GameMap.animation_time)*Stage.player.light.lamp_power*0.05+
				Math.sin(5.1*GameMap.animation_time)*Stage.player.light.lamp_power*0.05+
				Math.sin(2*GameMap.animation_time)*Stage.player.light.lamp_power*0.05;
		var mid_x = GameMap.current_level.grid_size_x*0.5;
		/*Stage.root.rotation.ty = 0.01 * (Stage.player.grid_x - mid_x);
		Stage.root.rotation.y = Stage.root.rotation.ty*0.1 + Stage.root.rotation.y*0.9;*/
	},

	move_to : (x, y, no_physics = false) => {
		Audio.walk.play();
		var tile = GameMap.get_tile(x, y);
		Game.state.player.x = x;
		Game.state.player.y = y;
		Stage.player.grid_x = x;
		Stage.player.grid_y = y;
		GameMap.update_blocked_tiles();
		if(!tile.is_solid && tile.solid_material) {
			// pass-through tile
		} else {
			if(!Game.state.player.is_ghost || tile.type == 'dirt')
				GameMap.kill_tile(x, y);
		}
		GameMap.update_blocked_tiles();
		if(!no_physics)
			Unit.apply_gravity(Stage.player, (byx, byy) => {
				Player.move_to(Stage.player.grid_x+byx, Stage.player.grid_y+byy);
			});
		if(tile.type == 'exit')
		Unit.trigger_behavior(tile, 'enter');
		GameMap.sync();
	},

	can_move_to : (x, y) => {
		GameMap.update_blocked_tiles();
		if(x < 0 || y < 0 || x >= GameMap.current_level.grid_size_x || y >= GameMap.current_level.grid_size_y)
			return(false);
		var tile = GameMap.get_tile(x, y);
		var rx = Game.state.player.x - x;
		var ry = Game.state.player.y - y;
		if(tile.type == 'dirt') return(true);
		if(tile.type == 'exit') return(true);
		if(!tile.is_blocked) {
			if(ry <= 0) return(true);
		}
		if(tile.is_blocked && Game.state.player.is_ghost) {
			return(true);
		}
		var b = Unit.get_behavior(tile);
		if(b.pushable) {
			if(Unit.can_move_to(tile, x-rx, y-ry)) {
				Audio.boulder.play();
				GameMap.move_object_by(tile, -rx, -ry);
				return(true);
			} else {
				Unit.trigger_behavior(tile, 'push_fail');
			}
		}
		if(tile.is_blocked) {
			if(Game.debug_moves) console.log('player move', x, y, 'blocked');
			return(false);
		}
		var rtile = GameMap.get_tile(x+1, y);
		var ltile = GameMap.get_tile(x-1, y);
		if(rtile.is_blocked && ltile.is_blocked)
			return(true);
		var rctile = GameMap.get_tile(x+1, Game.state.player.y);
		var lctile = GameMap.get_tile(x-1, Game.state.player.y);
		if(rctile.is_blocked && lctile.is_blocked)
			return(true);
	},

}
