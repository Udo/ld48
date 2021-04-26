GameMap = {

	current_level : false,
	current_level_name : false,
	tiles : {},
	effects_assigned : {},
	effects_objects : {},
	blocked_tiles : {},
	entity_map : {},
	tile_types_active : {},
	tile_types_last : {},

	sync : () => {

	},

	play : {

		screen_shake : (magnitude = 25) => {
			var total_time = 0;
			var amount = magnitude;
			Stage.animate((dt) => {
				if(!Game.state.animation_enabled) return;
				total_time += dt;
				amount *= 0.9;

				Stage.root.position.x += (0.5-Math.random())*amount;
				Stage.root.position.y += (0.5-Math.random())*amount;
				Stage.root.position.z += (0.5-Math.random())*amount;

				Stage.root.position.x *= 0.9;
				Stage.root.position.y *= 0.9;
				Stage.root.position.z *= 0.9;

				if(total_time < magnitude*0.10)
					return(true);
				else {
					Stage.root.position.x = 0;
					Stage.root.position.y = 0;
					Stage.root.position.z = 0;
					return(false);
				}
			});
		},

		death_effect : (x, y, particle_count = 100) => {
			GameMap.play.particles(x, y, 'particle_red', particle_count);
		},

		particles : (x, y, particle_type, particle_count = 100, z_bias = 0) => {
			var o = new THREE.Object3D();
			o.position.x = x*Game.feature_size;
			o.position.y = y*Game.feature_size;
			o.position.z = -0.5*Game.feature_size;
			Stage.root.add(o);
			for(var i = 0; i < particle_count; i++) {
				var p = new THREE.Mesh(Stage.geo.particle, Stage.mat[particle_type]);
				p.position.set(0.25*Math.random()*Game.feature_size, 0.25*Math.random()*Game.feature_size, 0.25*Math.random()*Game.feature_size);
				p.direction = {
					life_time : 1*Math.random(),
					x : (0.5-Math.random())*Game.feature_size,
					y : (z_bias+0.5-Math.random())*Game.feature_size,
					z : (0.5-Math.random())*Game.feature_size };
				o.add(p);
			}
			var total_time = 0;
			Stage.animate((dt) => {
				if(!Game.state.animation_enabled) return;
				total_time += dt;
				o.children.forEach((p) => {
					p.position.x += p.direction.x*dt*4;
					p.position.y += p.direction.y*dt*4;
					p.position.z += p.direction.z*dt*4;
					p.scale.y = p.scale.x *= 0.97;
					p.direction.life_time -= dt;
					if(p.direction.life_time < 0)
						o.remove(p);
				});
				if(total_time < 3)
					return(true);
				else {
					Stage.root.remove(o);
					return(false);
				}
			});
		},

	},

	get_tile : (x, y) => {
		GameMap.update_blocked_tiles();
		var t = (GameMap.tiles[x+':'+y] || { type : 'empty' });
		if(GameMap.blocked_tiles[x+':'+y])
			t.is_blocked = true;
		else
			t.is_blocked = false;
		return(t);
	},

	make_tile : (type, x, y, c) => {
		var o = new THREE.Mesh( Stage.geo[type], Stage.mat[type] );
		o.type = type;
		o.type_char = c;
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
		Unit.trigger_behavior(o, 'create');
		o.is_solid = !o.is_creature;
		Stage.root.add( o );
		if(!o.is_creature)
			GameMap.tiles[x+':'+y] = o;
		return(o);
	},

	make_creature : (type, x, y, c) => {
		var o = new THREE.Object3D();
		o.body = new THREE.Mesh( Stage.geo[type], Stage.mat[type] );
		o.add(o.body);
		o.type = type;
		o.type_char = c;
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
		Unit.trigger_behavior(o, 'create');
		o.is_solid = !o.is_creature;
		Stage.root.add( o );
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
		Unit.trigger_behavior(o, 'create');
		Stage.root.add( o );
		GameMap.effects_objects[x+':'+y] = o;
		return(o);
	},

	kill_tile : (x, y) => {
		if(!GameMap.tiles[x+':'+y]) return;
		Stage.root.remove(GameMap.tiles[x+':'+y]);
		delete GameMap.tiles[x+':'+y];
		Audio.dig.rate(0.5+Math.random()*0.1);
		Audio.dig.play();
		GameMap.play.particles(x, y, 'particle_gray', 100, 0.5);
		GameMap.play.screen_shake(0.5);
	},

	move_object_by : (o, rx, ry) => {
		if(o.is_creature) return;
		delete GameMap.tiles[o.grid_x+':'+o.grid_y];
		GameMap.kill_tile(o.grid_x+rx, o.grid_y+ry);
		o.grid_x += rx;
		o.grid_y += ry;
		o.position.tx = o.grid_x * Game.feature_size;
		o.position.ty = o.grid_y * Game.feature_size;
		GameMap.tiles[o.grid_x+':'+o.grid_y] = o;
		GameMap.physics_updated = true;
		GameMap.update_blocked_tiles();
	},

	make_passable : (o) => {
		if(!o.is_solid) return;
		o.is_solid = false;
		o.material = Stage.mat.translucent;
		GameMap.passable_fingerprint += ':'+o.grid_x+':'+o.grid_y;
	},

	update_blocked_tiles : () => {
		GameMap.blocked_tiles = {};
		GameMap.entity_map = {};
		if(Game.debug_moves) {
			if(Stage.debug_layer)
				Stage.debug_layer.clear();
			else
				Stage.root.add(Stage.debug_layer = new THREE.Object3D());
		}
		each(Stage.root.children, (o) => {
			GameMap.tile_types_active[o.type] = true;
			if(o.is_solid || o.is_creature) {
				if(Game.debug_moves) {
					var dbg = new THREE.Mesh(Stage.geo.debug, Stage.mat.debug);
					dbg.position.set(o.grid_x*Game.feature_size, o.grid_y*Game.feature_size, -0.5*Game.feature_size);
					Stage.debug_layer.add(dbg);
				}
				GameMap.blocked_tiles[o.grid_x+':'+o.grid_y] = o.is_solid;
				if(o.is_creature)
					GameMap.entity_map[o.grid_x+':'+o.grid_y] = o;
			}
		});
		GameMap.blocked_tiles[Game.state.player.x+':'+Game.state.player.y] = true;
	},

	animation_time : 0,

	do_animation : (dt) => {
		if(!Game.state.animation_enabled) return;
		GameMap.animation_time += dt;
		each(Stage.root.children, (o) => {
			if(typeof o.position.tx != 'undefined') {
				if(o.is_creature && GameMap.animation_time > 1.2) {
					dx = clamp(o.position.x - o.position.tx, -1, 1);
					dy = clamp(o.position.y - o.position.ty, -3, 3);
					o.position.x -= dx*dt*50;
					o.position.y -= dy*dt*50;
				} else {
					o.position.x = o.position.x*0.9 + o.position.tx*0.1;
					o.position.y = o.position.y*0.9+ o.position.ty*0.1;
				}
			}
			Unit.trigger_behavior(o, 'animate', dt);
		});
		Player.animate(dt);
		Stage.renderer.toneMappingExposure =
			Stage.renderer.toneMappingExposure*0.9 + Stage.renderer.toneMappingExposureTarget*0.1;
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

	trigger_activations : () => {
		each(GameMap.tile_types_active, (_a, type) => {
			if(!GameMap.tile_types_last[type])
				Unit.trigger_behavior({ type : type }, 'activate');
		});
		each(GameMap.tile_types_last, (_a, type) => {
			if(!GameMap.tile_types_active[type])
				Unit.trigger_behavior({ type : type }, 'deactivate');
		});
		GameMap.tile_types_last = GameMap.tile_types_active;
		GameMap.tile_types_active = {};
	},

	do_physics : () => {
		each(Stage.root.children, (o) => {
			if(!o.is_solid && o.solid_material) {
				o.material = o.solid_material;
				o.is_solid = true;
			}
		});
		do {
			Game.state.player.debug_text = '';
			Game.state.player.is_ghost = false;
			GameMap.effects_assigned = {};
			GameMap.passable_fingerprint_old = GameMap.passable_fingerprint;
			GameMap.passable_fingerprint = '';
			GameMap.physics_updated = false;
			each(Stage.root.children, (o) => {
				Unit.trigger_behavior(o, 'physics');
			});
			if(GameMap.passable_fingerprint_old != GameMap.passable_fingerprint)
				GameMap.physics_updated = true;
		} while(GameMap.physics_updated);
		GameMap.do_effects();
		GameMap.trigger_activations();
	},

	do_tick : () => {
		Game.state.step_count++;
		each(Stage.root.children, (o) => {
			Unit.trigger_behavior(o, 'tick');
		});
		var player_tile = GameMap.get_tile(Game.state.player.x, Game.state.player.y);
		Unit.trigger_behavior(player_tile, 'on_contact');
		GameMap.trigger_activations();
	},

	die : (death_reason) => {
		Audio.squash.play();
		GameMap.play.screen_shake();
		Game.state.user_input = false;
		GameMap.play.death_effect(Stage.player.grid_x, Stage.player.grid_y, 500);
		setTimeout(() => {
			Game.state.animation_enabled = false;
			$('.notice').remove();
			$('body').append('<div class="notice">YOU DIED'+
				'<div style="font-size:25px;">Death by: '+death_reason+'<br/>Press [R] to restart / [Z] to undo move</div></div>');
		}, 500);
	},

	init_tile : (c, x, y) => {
		if(c == 'X') GameMap.make_tile('dirt', x, y, c);
		if(c == 'E') GameMap.make_tile('exit', x, y, c);
		if(c == '-') GameMap.make_tile('limit', x, y, c);
		if(c == 'B') GameMap.make_tile('boulder', x, y, c);
		if(c == 'L') GameMap.make_tile('lava', x, y, c);
		if(c == '<') GameMap.make_tile('projector', x, y, c);
		if(c == '>') GameMap.make_tile('projector', x, y, c);
		if(c == '[') GameMap.make_tile('death_projector', x, y, c);
		if(c == ']') GameMap.make_tile('death_projector', x, y, c);
		if(c == 'G') GameMap.make_creature('gremlin', x, y, c);
		if(c == 'P') Player.move_to(x, y, true);
	},

	init_stage : () => {
		var level = GameMap.current_level;
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
		GameMap.effects_assigned = {};
		GameMap.effects_objects = {};
		GameMap.blocked_tiles = {};
		GameMap.entity_map = {};
		GameMap.tile_types_active = {};
		GameMap.tile_types_last = {};
		Player.init();

		Unit.behavior.ray_x.deactivate();
		Unit.behavior.deathray_x.deactivate();

		for(var y = -1; y < level.grid_size_y+1; y++) {
			GameMap.make_tile('limit', -1, y);
			GameMap.make_tile('limit', level.grid_size_x, y);
		}

		for(var x = -1; x < level.grid_size_x+1; x++) {
			GameMap.make_tile('limit', x, -1);
			GameMap.make_tile('limit', x, level.grid_size_y);
		}
	},

	init : (level_name) => {

		localStorage.setItem('lvl_'+level_name, true);
		localStorage.setItem('last_level', level_name);

		Audio.level_start.play();
		Game.state.step_count = 0;
		GameMap.animation_time = 0;
		Game.state.animation_enabled = true;
		Game.state.init_completed = false;
		Game.hide_menu();
		Stage.root.clear();
		GameMap.effects_assigned = {};
		GameMap.effects_objects = {};
		Game.undo_levels = [];

		var level = Levels[level_name];
		GameMap.current_level_name = level_name;
		GameMap.current_level = level;
		level.grid_size_y = level.tiles.length;
		level.grid_size_x = level.tiles[0].length;
		$('#e-level-name').text(level.title);

		GameMap.init_stage();

		Stage.root.rotation.x = Math.PI;

		for(var y = 0; y < level.grid_size_y; y++) {
			for(var x = 0; x < level.grid_size_x; x++) {

				var c = level.tiles[y][x];
				GameMap.init_tile(c, x, y);

			}
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
