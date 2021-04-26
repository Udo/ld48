Levels = {

	level_00 : { // welcome
		title : 'Downwards is easy',
		tiles : [
			'XXXXPXXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXX---XXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXXEXXXX',
		],
		on_exit : () => {
			GameMap.init('level_01');
		},
	},

	level_01 : { // basics
		title : 'Caving in and out',
		tiles : [
			'XP        ',
			'XXXXXX XXX',
			'XXXXXX XXX',
			'XXXX------',
			'X  XXX    ',
			'    XX-XXX',
			'X   XX-XXE',
		],
		on_exit : () => {
			GameMap.init('level_01b');
		},
	},

	level_01b : { // basics
		title : 'A rock move',
		tiles : [
			'XXX P XXX',
			'XXXXXXXXX',
			'XXXXBXXXX',
			'----X----',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXXEXXXX',
		],
		on_exit : () => {
			GameMap.init('level_02a');
		},
	},

	level_02a : { // boulders and projectors
		title : 'Ghost ray',
		tiles : [
			'XXXPXXX',
			'>XXB-XX',
			'XX-X-XX',
			'XX- -XX',
			'XX-E-XX',
		],
		on_exit : () => {
			GameMap.init('level_02b');
		},
	},

	level_02b : { // boulders and projectors
		title : 'Passing through',
		tiles : [
			'XXB  BPX',
			'>XX BBBB',
			'XXX --BX',
			'XXX -EBX',
			'XXX --BX',
			'XXXXXXXX',
			'X B ----',
			'X X XXXX',
		],
		on_exit : () => {
			GameMap.init('level_03');
		},
	},

	level_03 : { // lava & projectors
		title : 'Floor is lava',
		tiles : [
			'XX<XPXXXX',
			'---------',
			'XXXX BXXX',
			'XXXX XXXX',
			'       XX',
			' X  -  XX',
			'LXX -E XX',
		],
		on_exit : () => {
			GameMap.init('level_04');
		},
	},

	level_04 : { // dangerous ray
		title : 'Death ray',
		tiles : [
			'XXXXPXXXX',
			'XXXX XBXX',
			'XXB   BXX',
			'XXX   XXX',
			'--]    --',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXXEXXXX',
		],
		on_exit : () => {
			GameMap.init('level_05');
		},
	},

	level_05 : { // gremlin
		title : 'The gob-line',
		tiles : [
			'BBBXXPXXBBB',
			'XXXXX XXXXX',
			'XX G   G XX',
			'XXXXX XXXXX',
			'G B     B G',
			'XXXXX---XXX',
			'XXXXX XXXXX',
			'XXXXXEXXXXX',
		],
		on_exit : () => {
			GameMap.init('level_06');
		},
	},

	level_06 : { // gremlin, death ray
		title : 'Death to goblins',
		tiles : [
			'X>XXXXXPXXXXXXX',
			'XXXXXX- -XXXXXX',
			'XX BG     GB XX',
			'XXXXXX- -XXXXXX',
			'XX  BG   GB  XX',
			'XXX]XX- -XXXXXX',
			'XXXBXXX XXXXXXX',
			'XXXXXX- -------',
			'XX           XX',
			'XXB         BXX',
			'XXXXXX-E-XXXXXX',
		],
		on_exit : () => {
			GameMap.init('level_07');
		},
	},

	level_07 : { // gremlin, death ray
		title : 'Lava race',
		tiles : [
			' - - P-  XXXXXX',
			'   > X- -XXXXBX',
			' X X X- -XXXXBX',
			' X X X- -X]XXBX',
			' X X X- -XXXXXX',
			' X X X- -XXXXXX',
			' X X X- -XXXXXX',
			' X X X- -XXXXXX',
			' X X X- -XXXXGG',
			'LX   X- -XXXBGE',
		],
		on_exit : () => {
			GameMap.init('level_08');
		},
	},

	level_08 : { // gremlin, death ray
		title : 'To the bottom',
		tiles : [
			'XXXXXX-P-XXXXXX',
			'XXBXXX- -XXLXBX',
			'XXLLXX- -XXLLBX',
			'XXLLXX- -XXXXBX',
			'XXXBBX- -XXLXXX',
			'XXLLXX- -XXLXXX',
			'XXLLXX- -XLLLXX',
			'XXXXBX- -BXXXXX',
			'GGGGGG- -GGGGGG',
			'EEEEEX-E-EEEEEE',
		],
		on_exit : () => {
			Game.show_menu('credits');
		},
	},

}
