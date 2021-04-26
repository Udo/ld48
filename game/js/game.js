var Game = {

	stage : false,

	debugInfo : {
		lastRenderTime : 0,
	},

	debug_moves : false,

	state : {
		player : {
			x : 0,
			y : 0,
			cx : 0,
			cy : 0,
		},
	},

	update_ui : () => {
		$('#step-counter-value').text(1*Game.state.step_count);
		setTimeout(Game.update_ui, 200);
	},

	undo_levels : [],

	push_state : () => {
		var s = { gs : clone(Game.state), items : [] };
		each(Stage.root.children, (oc, tk) => {
			if(typeof oc.type_char == 'undefined') return;
			s.items.push([ oc.type_char, oc.grid_x, oc.grid_y ]);
		});
		Game.undo_levels.push(s);
	},

	pop_state : () => {
		var s = Game.undo_levels.pop();
		if(!s) return;
		Stage.root.clear();
		GameMap.init_stage();
		Game.state = s.gs;
		Audio.reverse.play();
		each(s.items, (item) => {
			GameMap.init_tile(item[0], item[1], item[2]);
		});
		Stage.renderer.toneMappingExposure = 5;
		Game.state.user_input = true;
		Game.state.animation_enabled = true;
		Game.hide_menu();
		GameMap.do_physics();
	},

	show_menu : (screen_name = 'main') => {
		Game.menu_visible = true;
		Game.state.user_input = false;
		Game.state.animation_enabled = false;
		$('.notice').remove();
		$('#menu-screen').remove();
		$('body').append('<div id="menu-screen"></div>');
		$('#menu-screen').load('screens/'+screen_name+'.html?v='+Math.random());
	},

	hide_menu : () => {
		Game.menu_visible = false;
		Game.state.user_input = true;
		Game.state.animation_enabled = true;
		$('.notice').remove();
		$('#menu-screen').remove();
		if(Game.onclose_menu) {
			var f = Game.onclose_menu;
			Game.onclose_menu = false;
			f();
		}
	},

	toggle_menu : () => {
		if(Game.menu_visible)
			Game.hide_menu();
		else
			Game.show_menu();
	},

	register_highscore : () => {

		Game.onclose_menu = GameMap.current_level.on_exit;

		Game.show_menu('highscore');

	},

	init : function(stage, frame_info_element) {

		if(!localStorage.client_id)
			localStorage.client_id = Math.random()*10000;

		Game.stage = stage;

		Game.update_ui();

		stage.on('mousedown_right', function(m) {
			if(stage.root.dragStart)
				stage.root.dragStart();
		});

		stage.on('wheel', function(m) {
			console.log('wheel', m);
		});

		stage.on('mousemove', function(m) {

		});

		stage.on('frameinfo', function(inf) {
			frame_info_element.text('FPS:'+inf.fps+' CPU:'+inf.threadLoadPercent+'% '+
				Game.state.player.debug_text);
		})

	},

}
