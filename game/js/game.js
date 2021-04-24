var Game = {

	stage : false,

	debugInfo : {
		lastRenderTime : 0,
	},

	state : {
		player : {
			x : 0,
			y : 0,
			cx : 0,
			cy : 0,
		},
	},

	init : function(stage, frame_info_element) {

		Game.stage = stage;

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
			frame_info_element.text('FPS:'+inf.fps+' CPU:'+inf.threadLoadPercent+'%');
		})

	},

}
