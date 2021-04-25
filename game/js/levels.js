Levels = {

	level_00 : { // welcome
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
		tiles : [
			'P        ',
			'XXXXX XXX',
			'XXXXX XXX',
			'XXX------',
			'X  XX    ',
			'X  XX-XXX',
			'X  XX-XXE',
		],
		on_exit : () => {
			GameMap.init('level_01b');
		},
	},

	level_01b : { // basics
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
		tiles : [
			'XXB  BPX',
			'> X BBBB',
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

	level_04 : { // more projectors
		tiles : [
			'XXXXPXXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXX XXXX',
			'XXXXEXXXX',
		],
		on_exit : () => {
			GameMap.init('level_04');
		},
	},

	level_05 : { // monsters (combat + they act in ways)
		tiles : [
			'BBBXXPXXXX',
			'BB  BBBBBB',
			'BB  BBBBBB',
			'XXXXXBBBBX',
			'XXB BXXXXX',
			'XXXXXXXXXX',
			'XXXXXXXX X',
			'X    XXX E',
		],
		on_exit : () => {
			GameMap.init('level_03');
		},
	},

}
