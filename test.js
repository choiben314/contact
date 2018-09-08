var rooms = [];

var room = {
		players: [],
		words: [],
		master: '',
		gameID: 12345,
	};

rooms.push(room);
console.log(rooms);
var id = 12345;
var wow = rooms.find(x => x.gameID == id);

console.log(wow.gameID);
