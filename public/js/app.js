jQuery(function($) {
	var IO = {
		init: function() {
            IO.socket = io.connect('http://localhost:8081');
            IO.bindEvents();
        },

        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('new_game_created', IO.onNewGameCreated );
            IO.socket.on('player_joined_room', IO.onPlayerJoinedRoom );
        },

        onConnected: function() {
            // room = "12345"
        	console.log("Client connected.");
        	// IO.socket.emit('room', room);
        },

        onNewGameCreated: function(data) {
            // Create initial player
            IO.socket.emit('playerJoinGame', data);
        },

	};

	var Game = {

        // gameID: 0,
        // myRole: '',
        // mySocketID: '',

        // SETUP

        init: function() {
            Game.cacheElements();
            Game.bindEvents();
            Game.showInitScreen();
        },

        cacheElements: function() {
            Game.$doc = $(document);

            Game.$gameCanvas = $('#gameCanvas');
            Game.$templateIntroScreen = $('#intro-screen-template').html();
            Game.$templateNewScreen = $('#new-game-template').html();
            Game.$templateJoinScreen = $('#join-game-template').html();
        },

        showInitScreen: function() {
            Game.$gameCanvas.html(Game.$templateIntroScreen);
        },

        showNewScreen: function() {
            Game.$gameCanvas.html(Game.$templateNewScreen);  
        },

        showJoinScreen: function() {
            Game.$gameCanvas.html(Game.$templateJoinScreen);
        },

        bindEvents: function() {
            Game.$doc.on('click', '#btnNew', Game.showNewScreen);
            Game.$doc.on('click', '#btnJoin', Game.showJoinScreen);
            Game.$doc.on('click', '#btnCreate', Game.Player.onCreateClick);
            Game.$doc.on('click', '#btnStart', Game.Player.onStartClick);
        },


        // gameInit: function (data) {
        //     Game.gameID = data.gameID;
        //     Game.mySocketID = data.mySocketID;
        //     Game.myRole = 'Host';
        // },

        // PLAYER

        Player : {
            myName: '',

            onCreateClick: function () {
            playerName = $('#inputPlayerName').val() || 'anon'
            Game.myRole = 'Player';
            Game.Player.myName = playerName;

            IO.socket.emit('createNewGame', Game.Player.myName);
        },
            onStartClick: function() {
                var data = {
                    gameID : +($('#inputGameID').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                IO.socket.emit('playerJoinGame', data);
                Game.myRole = 'Player';
                Game.Player.myName = data.playerName;
            }
        },
	};

	IO.init();
	Game.init();
}($));