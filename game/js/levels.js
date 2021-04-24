Levels = {

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
			GameMap.init('level_02');
		},
	},

	level_02 : { // boulders
		tiles : [
			'XXB  BP  X',
			'BBX  BBBBB',
			'BBXBBBBBBB',
			'XXX XXX XX',
			'X-BBXXX- X',
			'X    XX- E',
		],
		on_exit : () => {
			GameMap.init('level_03');
		},
	},

	level_03 : { // lava & water _________
		tiles : [
			'XXXXPXXXX',
			'XXXXXXXXX',
			'XXXXXXXXX',
			'L      XX',
			'XX  -  XX',
			'XXX -E XX',
		],
		on_exit : () => {
			GameMap.init('level_04');
		},
	},

	level_04 : { // monsters (combat + they act in ways)
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
