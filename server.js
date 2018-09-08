var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/js', express.static(__dirname + '/public/js'));
app.use('/public/assets', express.static(__dirname + '/public/assets'));

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

server.listen(8081, function() { // Listens to port 8081
    console.log('Listening on ' + server.address().port);
});

io.sockets.on('connection', function (socket) {
	socket.emit('connected');

	socket.on('createNewGame', createNewGame);
	socket.on('playerJoinGame', playerJoinGame);
});


// CONTACT

var rooms = [];

function createNewGame(name) {
	var game_id = (Math.random() * 100000) | 0;

	var room = {
		players: [],
		words: [],
		master: '',
		gameID: game_id,
	};

	rooms.push(room);

	this.emit('new_game_created', {playerName: name, gameID: room.gameID});
};

function playerJoinGame(data) {
	var socket = this;
	var room = rooms.find(r => r.gameID == data.gameID);

	if (room != null) {
	socket.join(room.gameID);
	room.players.push(data.playerName);

    console.log('Player ' + data.playerName + ' joining game: ' + room.gameID);
    io.sockets.in(room.gameID).emit('player_joined_game', data.playerName);
	}
	else {
	console.log("Game does not exist.");
	}
}

function getRoom(game_id) {
	for (var i in rooms) {
		console.log(rooms[i].gameID);
		if (rooms[i].gameID == game_id) {
			return rooms[i];
		}
	}
	console.log("Room not found");
}