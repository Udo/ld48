GameMap = {

	current_level : false,
	current_level_name : false,
	state : {},

	sync : () => {

	},

	get_tile : (x, y) => {
		return(GameMap.state[x+':'+y] || { type : 'empty' });
	},

	dig_square : (x, y) => {
		var tile = GameMap.state[x+':'+y];
		if(tile && tile.type == 'dirt') {
			Stage.root.remove(GameMap.state[x+':'+y]);
			delete GameMap.state[x+':'+y];
		}
	},

	make_tile : (type, x, y) => {
		var cube = new THREE.Mesh( Stage.geo[type], Stage.mat[type] );
		cube.type = type;
		cube.position.tx = x*Game.feature_size;
		cube.position.ty = y*Game.feature_size;
		cube.position.x = cube.position.tx*5;
		cube.position.y = cube.position.ty*5;
		cube.grid_x = x;
		cube.grid_y = y;
		Stage.root.add( cube );
		GameMap.state[x+':'+y] = cube;
		return(cube);
	},

	move_object_by : (o, rx, ry) => {
		delete GameMap.state[o.grid_x+':'+o.grid_y];
		o.grid_x += rx;
		o.grid_y += ry;
		o.position.tx = o.grid_x * Game.feature_size;
		o.position.ty = o.grid_y * Game.feature_size;
		GameMap.state[o.grid_x+':'+o.grid_y] = o;
		GameMap.physics_updated = true;
	},

	get_behavior : (o) => {
		return(GameMap.behavior[o.type] || {});
	},

	behavior : {

		boulder : {

			pushable : true,

			physics : (o) => {
				GameMap.apply_gravity(o.grid_x, o.grid_y, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				}, Game.state.player);
			},

		},

		lava : {

			on_contact : () => {
				GameMap.die();
			},

			expand_into : (x, y) => {
				GameMap.make_tile('lava', x, y);
			},

			tick : (o) => {
				var x = o.grid_x;
				var y = o.grid_y;
				if(GameMap.get_tile(x, y-1).type == 'empty') GameMap.behavior.lava.expand_into(x, y-1);
				if(GameMap.get_tile(x-1, y).type == 'empty') GameMap.behavior.lava.expand_into(x-1, y);
				if(GameMap.get_tile(x, y+1).type == 'empty') GameMap.behavior.lava.expand_into(x, y+1);
				if(GameMap.get_tile(x+1, y).type == 'empty') GameMap.behavior.lava.expand_into(x+1, y);
			},

			physics : (o) => {
				GameMap.apply_gravity(o.grid_x, o.grid_y, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				}, Game.state.player);
			},

		},

	},

	can_move_to : (o, x, y) => {
		var rx = o.grid_x - x;
		var ry = o.grid_y - y;
		var in_direction = GameMap.get_tile(x, y);
		if(in_direction.type == 'empty') return(true);
	},

	apply_gravity : (x, y, f, exempt = false, is_player = false) => {
		var tile_below = GameMap.get_tile(x, y+1);
		if(exempt) {
			if(x == exempt.x && y+1 == exempt.y) return;
		}
		if(is_player && GameMap.get_tile(x-1, y+1).type != 'empty' &&
			GameMap.get_tile(x+1, y+1).type != 'empty')
			return;
		if(GameMap.get_tile(x-1, y).type != 'empty' &&
			GameMap.get_tile(x+1, y).type != 'empty')
			return;
		if(tile_below.type == 'empty') {
			f(0, 1);
			console.log(tile_below);
		}
	},

	do_animation : () => {
		each(Stage.root.children, (o) => {
			if(typeof o.position.tx != 'undefined') {
				o.position.x = o.position.x*0.8 + o.position.tx*0.2;
				o.position.y = o.position.y*0.8 + o.position.ty*0.2;
			}
		});
	},

	do_physics : () => {
		do {
			GameMap.physics_updated = false;
			each(Stage.root.children, (o) => {
				if(!GameMap.behavior[o.type]) return;
				var handler = GameMap.behavior[o.type].physics;
				if(handler) handler(o);
			});
		} while(GameMap.physics_updated);
		GameMap.do_tick();
		var player_tile = GameMap.get_tile(Game.state.player.x, Game.state.player.y);
		var tile_behavior = GameMap.behavior[player_tile.type];
		if(tile_behavior && tile_behavior.on_contact)
			tile_behavior.on_contact();
	},

	do_tick : () => {
		each(Stage.root.children, (o) => {
			if(!GameMap.behavior[o.type]) return;
			var handler = GameMap.behavior[o.type].tick;
			if(handler) handler(o);
		});
	},

	die : () => {
		Game.state.user_input = false;
		$('body').append('<div class="notice">YOU DIED<div style="font-size:25px;">Press [R] to restart</div></div>');
	},

	init : (level_name) => {

		$('.notice').remove();

		var level = Levels[level_name];
		GameMap.current_level_name = level_name;

		Stage.root.clear();

		var light = new THREE.PointLight( 0xff0000, 1, 100 );
		light.position.set( 0, 50, 50 );
		Stage.root.add( light );

		var ambient = new THREE.AmbientLight( 0x404040 );
		Stage.root.add( ambient );

		GameMap.state = {};
		GameMap.current_level = level;

		Player.init();
		Stage.root.rotation.x = Math.PI;

		Map.current_level = level;
		level.grid_size_y = level.tiles.length;
		level.grid_size_x = level.tiles[0].length;

		for(var y = 0; y < level.grid_size_y; y++) {
			for(var x = 0; x < level.grid_size_x; x++) {

				var c = level.tiles[y][x];

				if(c == 'X') GameMap.make_tile('dirt', x, y);
				if(c == 'E') GameMap.make_tile('exit', x, y);
				if(c == '-') GameMap.make_tile('limit', x, y);
				if(c == 'B') GameMap.make_tile('boulder', x, y);
				if(c == 'L') GameMap.make_tile('lava', x, y);

				if(c == 'P') Player.move_to(x, y, true);

			}
		}

		for(var y = -1; y < level.grid_size_y+1; y++) {
			GameMap.make_tile('limit', -1, y);
			GameMap.make_tile('limit', level.grid_size_x, y);
		}

		for(var x = -1; x < level.grid_size_x+1; x++) {
			GameMap.make_tile('limit', x, -1);
			GameMap.make_tile('limit', x, level.grid_size_y);
		}

		GameMap.position_camera();

		Game.state.user_input = true;

	},

	position_camera : () => {
		Stage.camera.position.x = Game.feature_size * (GameMap.current_level.grid_size_x-1) * 0.5;
		Stage.camera.position.y = -Game.feature_size * (GameMap.current_level.grid_size_y-1) * 0.5;
		Stage.camera.position.tz = 8 * GameMap.current_level.grid_size_x;
		Stage.camera.position.z = 1000;
	},

}
