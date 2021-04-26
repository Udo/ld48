Audio = {

	music_01 : new Howl({ src : 'audio/LD48-song01-v1.ogg', loop : true, volume : 0.3, autoplay : true }),

	boulder : new Howl({ src : 'audio/boulder_move_01.ogg', volume : 0.3 }),
	deathray : new Howl({ src : 'audio/deathray_01.ogg', loop : true, volume : 0.75 }),
	dig : new Howl({ src : 'audio/dig_01.ogg', volume : 0.8, rate : 0.5 }),
	ghostray : new Howl({ src : 'audio/ghostray_01.ogg', loop : true, volume : 0.3 }),
	ghostray_inside : new Howl({ src : 'audio/ghostray_inside_01.ogg', loop : true, volume : 0.3 }),
	gremlin_death : new Howl({ src : 'audio/gremlin_death_01.ogg', volume : 0.6 }),
	gremlin_jump : new Howl({ src : 'audio/gremlin_jump_01.ogg', volume : 0.02 }),
	gremlin_walk : new Howl({ src : 'audio/gremlin_walk_01.ogg', volume : 0.3 }),
	level_gong : new Howl({ src : 'audio/level_gong_01.ogg', volume : 1.0 }),
	level_start : new Howl({ src : 'audio/level_start_01.ogg', volume : 0.3 }),
	menu : new Howl({ src : 'audio/menu_01.ogg', volume : 0.3 }),
	reverse : new Howl({ src : 'audio/reverse_01.ogg', volume : 0.6, rate : 2.0 }),
	squash : new Howl({ src : 'audio/squash_01.ogg', volume : 0.6 }),
	walk : new Howl({ src : 'audio/walk_01.ogg', volume : 0.9 }),

}

Audio.music_01.toggle = () => {
	Audio.music_01.mute(!Audio.music_01._muted);
	localStorage.setItem('mute', Audio.music_01._muted);
}

if(localStorage.getItem('mute') === true)
	Audio.music_01.mute(true);
