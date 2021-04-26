Unit = {

	get_behavior : (o) => {
		return(Unit.behavior[o.type] || {});
	},

	trigger_behavior : (o, name, pass_param = false) => {
		if(!Unit.behavior[o.type]) return;
		var handler = Unit.behavior[o.type][name];
		if(handler) {
			handler(o, pass_param);
			return(true);
		}
	},

	get_at : (x, y) => {
		var o = GameMap.entity_map[x+':'+y];
		return(o);
	},

	die : (o) => {
		Audio.gremlin_death.play();
		Stage.root.remove(o);
		GameMap.play.death_effect(o.grid_x, o.grid_y, 100);
		GameMap.update_blocked_tiles();
	},

	apply_gravity : (o, f) => {
		var x = o.grid_x;
		var y = o.grid_y;
		GameMap.update_blocked_tiles();
		var tile_below = GameMap.get_tile(x, y+1);
		if(tile_below.is_blocked) return;
		if(o.can_straddle &&
			GameMap.get_tile(x-1, y+1).is_blocked &&
			GameMap.get_tile(x+1, y+1).is_blocked)
			return;
		if(o.can_straddle &&
			GameMap.get_tile(x-1, y).is_blocked &&
			GameMap.get_tile(x+1, y).is_blocked)
			return;
		if(!tile_below.is_blocked) {
			//o.position.x = x*Game.feature_size;
			//o.position.y = y*Game.feature_size;
			f(0, 1);
		}
	},

	can_move_to : (o, x, y) => {
		GameMap.update_blocked_tiles();
		if(x < 0 || y < 0 || x >= GameMap.current_level.grid_size_x || y >= GameMap.current_level.grid_size_y) {
			console.log(o.type, 'can_move_to:oob', x, y);
			return(false);
		}
		var tile = GameMap.get_tile(x, y);
		var rx = o.grid_x - x;
		var ry = o.grid_y - y;
		if(!tile.is_blocked) {
			if(Game.debug_moves) console.log(o.type, 'can_move_to:not blocked', x, y);
			return(true);
		}
		if(tile.is_blocked && o.is_ghost) return(true);
		var b = Unit.get_behavior(tile);
		if(b.pushable && o.can_push) {
			if(Unit.can_move_to(tile, x-rx, y-ry)) {
				Audio.boulder.play();
				GameMap.move_object_by(tile, -rx, -ry);
				return(true);
			} else {
				Unit.trigger_behavior(tile, 'push_fail');
			}
		}
		if(Game.debug_moves) console.log(o.type, 'can_move_to:blocked', x, y);
	},

	move_to : (o, x, y) => {
		if(Game.debug_moves) console.log(o.type, 'move_to', x, y);
		var tile = GameMap.get_tile(x, y);
		o.grid_x = x;
		o.grid_y = y;
		o.position.tx = x*Game.feature_size;
		o.position.ty = y*Game.feature_size;
		GameMap.update_blocked_tiles();
		GameMap.do_physics();
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

			activate : () => {
				Audio.ghostray.play();
			},

			deactivate : () => {
				Audio.ghostray.stop();
			},

		},

		deathray_x : {

			create : (o) => {
				o.scale.y = 0.2;
				o.scale.x = 1.2;
			},

			animate : (o, dt) => {
				o.scale.y = 0.2+Math.sin(GameMap.animation_time*8 + o.grid_x*1.0)*0.1;
			},

			activate : () => {
				Audio.deathray.play();
			},

			deactivate : () => {
				Audio.deathray.stop();
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

			enter : (o) => {
				Audio.level_gong.play();
				Game.register_highscore();
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
				Unit.apply_gravity(o, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				});
				Unit.behavior.projector.player_ghost_ray(o);
			},

			push_fail : (o) => {
				// flip!
				o.direction *= -1;
				GameMap.do_physics();
			},

		},

		death_projector : {

			pushable : true,

			animate : (o) => {
				o.rotation.z = -o.direction*Math.PI*0.5;
			},

			create : (o) => {
				o.light = new THREE.PointLight( 0xff88ff, 20, 10 );
				o.light.position.set(0, Game.feature_size*0.45, -Game.feature_size*0.5);
				o.add( o.light );
				if(o.type_char == ']')
					o.direction = 1;
				else if(o.type_char == '[')
					o.direction = -1;
			},

			player_death_ray : (o) => {
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
							GameMap.die('Death ray');
						var u = Unit.get_at(x, o.grid_y);
						if(u)
							Unit.die(u);
						GameMap.effects_assigned[x+':'+o.grid_y] = 'deathray_x';
					}
				}
			},

			physics : (o) => {
				Unit.apply_gravity(o, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				});
				Unit.behavior.death_projector.player_death_ray(o);
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
				Unit.apply_gravity(o, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				});
			},

		},

		gremlin : {

			tick : (o) => {
				var x = o.grid_x;
				var y = o.grid_y;
				var dest_x = x+o.direction;
				var dest_y = y;
				if(Unit.can_move_to(o, dest_x, dest_y)) {
					Unit.move_to(o, dest_x, dest_y);
					Audio.gremlin_walk.play();
				} else {
					o.direction *= -1;
				}
				var d = dist(o.grid_x, o.grid_y, Stage.player.grid_x, Stage.player.grid_y);
				if(d <= 1) {
					console.log('ATTACK PLAYER');
					GameMap.die('Goblin attack');
				}
				o.body.rotation.set(0, -1.6-o.direction, 3.5);
			},

			physics : (o) => {
				Unit.apply_gravity(o, (mx, my) => {
					Audio.gremlin_jump.play();
					Unit.move_to(o, o.grid_x+mx, o.grid_y+my);
				});
			},

			create : (o) => {
				o.direction = 1;
				o.body.rotation.set(0, -0.8, 3.5);
				o.is_creature = true;
				o.can_push = true;
				o.lightc = new THREE.PointLight( 0xffbb88, 10, 100 );
				o.animation_offset = Math.random();
				//o.light.position.set( 0, -Game.feature_size*0.8, 0 );
				//o.light.castShadow = true;
				//o.light.shadow.bias = + 0.0025;
				o.lightc.distance = Game.feature_size*4;
				o.lightc.lamp_power = 3000;
				o.add( o.lightc );

				o.rfoot = new THREE.Mesh( Stage.geo.gremlin_foot, o.body.material );
				o.rfoot.position.set(-0.23*Game.feature_size, 0.4*Game.feature_size, 0);
				o.add(o.rfoot);
				o.lfoot = new THREE.Mesh( Stage.geo.gremlin_foot, o.body.material );
				o.lfoot.position.set(+0.23*Game.feature_size, 0.4*Game.feature_size, 0);
				o.add(o.lfoot);
			},

			animate : (o) => {
				o.body.position.y = Math.sin(GameMap.animation_time*6+o.animation_offset*3)*Game.feature_size*0.1;
			},

		},

		lava : {

			on_contact : () => {
				GameMap.die('Lava');
			},

			expand_into : (x, y) => {
				GameMap.make_tile('lava', x, y, 'L');
			},

			tick : (o) => {
				var x = o.grid_x;
				var y = o.grid_y;
				if(!GameMap.get_tile(x, y-1).is_solid) Unit.behavior.lava.expand_into(x, y-1);
				if(!GameMap.get_tile(x-1, y).is_solid) Unit.behavior.lava.expand_into(x-1, y);
				if(!GameMap.get_tile(x, y+1).is_solid) Unit.behavior.lava.expand_into(x, y+1);
				if(!GameMap.get_tile(x+1, y).is_solid) Unit.behavior.lava.expand_into(x+1, y);
			},

			physics : (o) => {
				Unit.apply_gravity(o, (mx, my) => {
					GameMap.move_object_by(o, mx, my);
				});
			},

		},

	},



}
