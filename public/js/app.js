jQuery(function($) {
	var IO = {
		init: function() {
            IO.socket = io.connect('http://localhost:8081');
            IO.bindEvents();
        },

        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('new_game_created', IO.onNewGameCreated );
            IO.socket.on('player_joined_game', IO.onPlayerJoinedRoom );
        },

        onConnected: function() {
        	console.log("Client connected.");
        	// IO.socket.emit('room', room);
        },

        onNewGameCreated: function(data) {
            // Create initial player
            IO.socket.emit('playerJoinGame', data);
        },

        onPlayerJoinedRoom: function(allPlayerNames) {
            // Update shown player list
            var playerHTML = $.map(allPlayerNames, function(playerName) {
                return('<span>' + playerName + '</span>');
            });
            Game.$templateWaitScreen.html(playerHTML.join(""));
            Game.showWaitScreen();
        }

	};

	var Game = {

        // SETUP

        init: function() {
            Game.cacheElements();
            Game.bindEvents();
            Game.showInitScreen();
        },

        cacheElements: function() {
            Game.$doc = $(document);

            Game.$gameCanvas = $('#gameCanvas');

            // Static
            Game.$templateIntroScreen = $('#intro-screen-template').html();
            Game.$templateNewScreen = $('#new-game-template').html();
            Game.$templateJoinScreen = $('#join-game-template').html();

            // Dynamic
            Game.$templateWaitScreen = $('#wait-game-template');
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

        showWaitScreen: function() {
            Game.$gameCanvas.html(Game.$templateWaitScreen.html());
        },

        bindEvents: function() {
            Game.$doc.on('click', '#btnNew', Game.showNewScreen);
            Game.$doc.on('click', '#btnJoin', Game.showJoinScreen);
            Game.$doc.on('click', '#btnCreate', Game.Player.onCreateClick);
            Game.$doc.on('click', '#btnStart', Game.Player.onStartClick);
        },

        // PLAYER

        Player : {
            myName: '',

            onCreateClick: function () {
                playerName = $('#inputPlayerName').val() || 'anon'
                Game.Player.myName = playerName;

                IO.socket.emit('createNewGame', Game.Player.myName);
                Game.showWaitScreen();
        },
            onStartClick: function() {
                var data = {
                    gameID : +($('#inputGameID').val()),
                    playerName : $('#inputPlayerName').val() || 'anon'
                };
                IO.socket.emit('playerJoinGame', data);
                Game.Player.myName = data.playerName;
                Game.showWaitScreen();
            }
        },
	};

	IO.init();
	Game.init();
}($));