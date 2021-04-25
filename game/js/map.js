GameMap = {

	current_level : false,
	current_level_name : false,
	tiles : {},
	effects_assigned : {},
	effects_objects : {},

	sync : () => {

	},

	get_tile : (x, y) => {
		return(GameMap.tiles[x+':'+y] || { type : 'empty' });
	},

	make_tile : (type, x, y, c) => {
		var o = new THREE.Mesh( Stage.geo[type], Stage.mat[type] );
		o.type = type;
		o.type_char = c;
		o.is_solid = true;
		o.solid_material = Stage.mat[type];
		o.position.x = o.position.tx = x*Game.feature_size;
		o.position.y = o.position.ty = y*Game.feature_size;
		if(!Game.state.init_completed) {
			o.position.x = (Math.random()-0.5)*150*Game.feature_size;
			o.position.y = (Math.random()-0.5)*150*Game.feature_size;
		}
		o.castShadow = true;
		o.receiveShadow = true;
		o.grid_x = x;
		o.grid_y = y;
		GameMap.trigger_behavior(o, 'create');
		Stage.root.add( o );
		GameMap.tiles[x+':'+y] = o;
		return(o);
	},

	make_effect : (type, x, y) => {
		if(GameMap.effects_objects[x+':'+y]) return;
		var o = new THREE.Mesh( Stage.geo[type], Stage.mat[type] );
		o.type = type;
		o.position.x = x*Game.feature_size;
		o.position.y = y*Game.feature_size;
		o.grid_x = x;
		o.grid_y = y;
		GameMap.trigger_behavior(o, 'create');
		Stage.root.add( o );
		GameMap.effects_objects[x+':'+y] = o;
		return(o);
	},

	kill_tile : (x, y) => {
		if(!GameMap.tiles[x+':'+y]) return;
		Stage.root.remove(GameMap.tiles[x+':'+y]);
		delete GameMap.tiles[x+':'+y];
	},

	move_object_by : (o, rx, ry) => {
		delete GameMap.tiles[o.grid_x+':'+o.grid_y];
		GameMap.kill_tile(o.grid_x+rx, o.grid_y+ry);
		o.grid_x += rx;
		o.grid_y += ry;
		o.position.tx = o.grid_x * Game.feature_size;
		o.position.ty = o.grid_y * Game.feature_size;
		GameMap.tiles[o.grid_x+':'+o.grid_y] = o;
		GameMap.physics_updated = true;
	},

	get_behavior : (o) => {
		return(GameMap.behavior[o.type] || {});
	},

	trigger_behavior : (o, name, pass_param = false) => {
		if(!GameMap.behavior[o.type]) return;
		var handler = GameMap.behavior[o.type][name];
		if(handler) {
			handler(o, pass_param);
			return(true);
		}
	},

	make_passable : (o) => {
		if(!o.is_solid) return;
		o.is_solid = false;
		o.material = Stage.mat.translucent;
		GameMap.passable_fingerprint += ':'+o.grid_x+':'+o.grid_y;
	},

	behavior : {

		ray_x : {

			create : (o) => {
				o.scale.y = 0.2;
				o.scale.x = 1.2;
			},

			animate : (o, dt) => {
				o.scale.y = 0.2+Math.sin(GameMap.animation_time*8 + o.grid_x*1.0)*0.1;
			},

		},

		exit : {

			create : (o) => {
				o.light = new THREE.PointLight( 0xff88ff, 20, 10 );
				o.light.position.set(0, Game.feature_size*0.45, -Game.feature_size*0.0);
				o.add( o.light );
				o.light2 = new THREE.PointLight( 0xff88ff, 20, 10 );
				o.light2.position.set(0, -Game.feature_size*0.45, -Game.feature_size*0.0);
				o.add( o.light2 );
			},

			animate : (o, dt) => {
				o.rotation.y += dt*10.2;
				o.rotation.z += dt*3.12;
			},

		},

		projector : {

			pushable : true,

			animate : (o) => {
				o.rotation.z = -o.direction*Math.PI*0.5;
			},

			create : (o) => {
				o.light = new THREE.PointLight( 0xff88ff, 20, 10 );
				o.light.position.set(0, Game.feature_size*0.45, -Game.feature_size*0.5);
				o.add( o.light );
				if(o.type_char == '>')
					o.direction = 1;
				else if(o.type_char == '<')
					o.direction = -1;
			},

			rock_ghost_ray : (o) => {
				var ray_start = o.grid_x+1;
				var ray_is_going = true;
				for(var x = ray_start; x <= GameMap.current_level.grid_size_x; x++) {
					var rt = GameMap.get_tile(x, o.grid_y);
					if(rt.type != 'empty' && ray_is_going && rt.is_solid) {
						if(rt.type == 'boulder')
							GameMap.make_passable(rt);
						else
							ray_is_going = false;
					}
				}
			},

			player_ghost_ray : (o) => {
				var ray_is_going = true;
				var x = o.grid_x;
				while(ray_is_going) {
					x += o.direction;
					if(x < 0 || x >= GameMap.current_level.grid_size_x) return;
					var rt = GameMap.get_tile(x, o.grid_y);
					if(rt.is_solid)
						ray_is_going = false;
					else {
						if(Game.state.player.x == x && Game.state.player.y == o.grid_y)
							Game.state.player.is_ghost = true;
						GameMap.effects_assigned[x+':'+o.grid_y] = 'ray_x';
					}
				}
			},

			physics : (o) => {
				GameMap.apply_gravity(o.grid_x, o.grid_y, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				}, Game.state.player);
				GameMap.behavior.projector.player_ghost_ray(o);
			},

			push_fail : (o) => {
				// flip!
				o.direction *= -1;
				GameMap.do_physics();
			},

		},

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
				if(!GameMap.get_tile(x, y-1).is_solid) GameMap.behavior.lava.expand_into(x, y-1);
				if(!GameMap.get_tile(x-1, y).is_solid) GameMap.behavior.lava.expand_into(x-1, y);
				if(!GameMap.get_tile(x, y+1).is_solid) GameMap.behavior.lava.expand_into(x, y+1);
				if(!GameMap.get_tile(x+1, y).is_solid) GameMap.behavior.lava.expand_into(x+1, y);
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
		if(!in_direction.is_solid) return(true);
	},

	apply_gravity : (x, y, f, exempt = false, is_player = false) => {
		var tile_below = GameMap.get_tile(x, y+1);
		if(exempt) {
			if(x == exempt.x && y+1 == exempt.y) return;
		}
		if(is_player && GameMap.get_tile(x-1, y+1).is_solid &&
			GameMap.get_tile(x+1, y+1).is_solid)
			return;
		if(is_player && GameMap.get_tile(x-1, y).is_solid &&
			GameMap.get_tile(x+1, y).is_solid)
			return;
		if(!tile_below.is_solid) {
			f(0, 1);
		}
	},

	animation_time : 0,

	do_animation : (dt) => {
		GameMap.animation_time += dt;
		each(Stage.root.children, (o) => {
			if(typeof o.position.tx != 'undefined') {
				o.position.x = o.position.x*0.8 + o.position.tx*0.2;
				o.position.y = o.position.y*0.8 + o.position.ty*0.2;
			}
			GameMap.trigger_behavior(o, 'animate', dt);
		});
		Player.animate(dt);
	},

	do_effects : () => {
		each(GameMap.effects_objects, (o, k) => {
			if(!GameMap.effects_assigned[k]) {
				Stage.root.remove(GameMap.effects_objects[k]);
				delete GameMap.effects_objects[k];
			}
		});
		each(GameMap.effects_assigned, (ename, k) => {
			var coord = k.split(':');
			GameMap.make_effect(ename, 1*coord[0], 1*coord[1]);
		});
	},

	do_physics : () => {
		each(Stage.root.children, (o) => {
			if(!o.is_solid && o.solid_material) {
				o.material = o.solid_material;
				o.is_solid = true;
			}
		});
		do {
			Game.state.player.is_ghost = false;
			GameMap.effects_assigned = {};
			GameMap.passable_fingerprint_old = GameMap.passable_fingerprint;
			GameMap.passable_fingerprint = '';
			GameMap.physics_updated = false;
			each(Stage.root.children, (o) => {
				GameMap.trigger_behavior(o, 'physics');
			});
			if(GameMap.passable_fingerprint_old != GameMap.passable_fingerprint)
				GameMap.physics_updated = true;
		} while(GameMap.physics_updated);
		GameMap.do_effects();
	},

	do_tick : () => {
		each(Stage.root.children, (o) => {
			GameMap.trigger_behavior(o, 'tick');
		});
		var player_tile = GameMap.get_tile(Game.state.player.x, Game.state.player.y);
		GameMap.trigger_behavior(player_tile, 'on_contact');
	},

	die : () => {
		Game.state.user_input = false;
		$('body').append('<div class="notice">YOU DIED<div style="font-size:25px;">Press [R] to restart</div></div>');
	},

	init : (level_name) => {

		Game.state.init_completed = false;
		$('.notice').remove();
		Stage.root.clear();
		GameMap.effects_assigned = {};
		GameMap.effects_objects = {};

		var level = Levels[level_name];
		GameMap.current_level_name = level_name;

		Stage.ambient_light = new THREE.AmbientLight( 0x404040, 1.2 );
		Stage.root.add( Stage.ambient_light );

		Stage.directional_light = new THREE.DirectionalLight( 0x4488ff, 2.5 );
		Stage.directional_light.position.set(-0*Game.feature_size, -0*Game.feature_size, -Game.feature_size*0);
		Stage.directional_light.target = new THREE.Object3D();
		Stage.directional_light.target.position.set(-100, 200, 1);
		Stage.directional_light.castShadow = true;
		Stage.directional_light.shadow.bias = + 0.005;
		Stage.root.add( Stage.directional_light.target );
		Stage.root.add( Stage.directional_light );

		Stage.background = new THREE.Mesh( Stage.geo.background_plane, Stage.mat.limit );
		Stage.background.rotation.x = Math.PI;
		Stage.background.position.z = .5*Game.feature_size;
		Stage.background.receiveShadow = true;
		Stage.root.add(Stage.background);

		GameMap.tiles = {};
		GameMap.current_level = level;

		Player.init();
		Stage.root.rotation.x = Math.PI;

		Map.current_level = level;
		level.grid_size_y = level.tiles.length;
		level.grid_size_x = level.tiles[0].length;

		for(var y = 0; y < level.grid_size_y; y++) {
			for(var x = 0; x < level.grid_size_x; x++) {

				var c = level.tiles[y][x];

				if(c == 'X') GameMap.make_tile('dirt', x, y, c);
				if(c == 'E') GameMap.make_tile('exit', x, y, c);
				if(c == '-') GameMap.make_tile('limit', x, y, c);
				if(c == 'B') GameMap.make_tile('boulder', x, y, c);
				if(c == 'L') GameMap.make_tile('lava', x, y, c);
				if(c == '<') GameMap.make_tile('projector', x, y, c);
				if(c == '>') GameMap.make_tile('projector', x, y, c);

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
		GameMap.do_physics();
		Game.state.user_input = true;
		Game.state.init_completed = true;

	},

	position_camera : () => {
		Stage.camera.position.x = Game.feature_size * (GameMap.current_level.grid_size_x-1) * 0.5;
		Stage.camera.position.y = -Game.feature_size * (GameMap.current_level.grid_size_y-1) * 0.5;
		Stage.camera.position.tz = 8 * GameMap.current_level.grid_size_x;
		Stage.camera.position.z = 1000;
	},

}
