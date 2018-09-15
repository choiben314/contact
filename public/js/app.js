jQuery(function($) {
	var IO = {
		init: function() {
            IO.socket = io.connect('http://localhost:8081');
            IO.bindEvents();
        },

        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('new_game_created', IO.onNewGameCreated );
            IO.socket.on('player_joined_game', IO.onPlayerJoinedGame );
            IO.socket.on('game_started', IO.onGameStarted );
            IO.socket.on('master_chosen', IO.onMasterChosen);
        },

        onConnected: function() {
        	console.log("Client connected.");
        	// IO.socket.emit('room', room);
        },

        onNewGameCreated: function(data) {
            // Create initial player
            IO.socket.emit('playerJoinGame', data);
            $('.header_game_id').html('<h1>' + data.gameID + '</h1>'); 
        },

        onPlayerJoinedGame: function(room) {
            // Update shown player list
            var playerHTML = $.map(room.players, function(player) {
                return('<button class="player-link" id='+ player.myName + '>' + player.myName + '</button><br>');
            });
            $('#playerList').html(playerHTML.join(""));

            IO.onMasterChosen(room.master);
        },
        onGameStarted: function(master) {
            Game.showPlayScreen();
            $('.header_game_id').html('<h1>' + Game.myGameID + '</h1>');
            $('.masterChosen').html('<h2>Wordmaster: ' + master.myName + '</h2>');
        },
        onMasterChosen: function(master) {
            if (master != null) {
                $('.masterChosen').html('<h2>Wordmaster: ' + master.myName + '</h2>');
            }
            else {
                $('.masterChosen').html('<h2>Wordmaster: Random</h2>');
            }
        },

	};

	var Game = {

        myGameID: '',

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
            Game.$templateWaitScreen = $('#wait-game-template').html();
            Game.$templatePlayScreen = $('#play-game-template').html();
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
            Game.$gameCanvas.html(Game.$templateWaitScreen);
        },

        showPlayScreen: function() {
            Game.$gameCanvas.html(Game.$templatePlayScreen);
        },

        bindEvents: function() {
            Game.$doc.on('click', '#btnNew', Game.showNewScreen);
            Game.$doc.on('click', '#btnJoin', Game.showJoinScreen);
            Game.$doc.on('click', '#btnCreate', Game.Player.onCreateClick);
            Game.$doc.on('click', '#btnStart', Game.Player.onStartClick);
            Game.$doc.on('click', '#btnGo', Game.Player.onGoClick);

            Game.$doc.on('click', '.player-link', $(this), Game.Player.onPlayerClick);
            Game.$doc.on('click', '#btnRandom', Game.Player.onRandomClick);

        },

        // PLAYER

        Player : {
            myName: '',
            // myRole: '',

            onCreateClick: function () {

                var data = {
                    gameID : (Math.random() * 100000) | 0,
                    playerName: $('#inputPlayerName').val() || 'anon',
                    // role: 'master',
                };
                
                Game.Player.myName = data.playerName;
                // Game.Player.myRole = data.role;
                Game.myGameID = data.gameID;
                
                IO.socket.emit('createNewGame', data);
                
                Game.showWaitScreen();
            },
            onStartClick: function() {
                var data = {
                    gameID : +($('#inputGameID').val()),
                    playerName : $('#inputPlayerName').val() || 'anon',
                    // role : 'regular',
                };

                Game.Player.myName = data.playerName;
                // Game.Player.myRole = data.role;
                Game.myGameID = data.gameID;

                IO.socket.emit('playerJoinGame', data);
                
                Game.showWaitScreen();
            },
            onGoClick: function() {
                IO.socket.emit('startGame', Game.myGameID);
            },
            onPlayerClick: function(event) {
                IO.socket.emit('masterChosen', {gameID: Game.myGameID, playerName: event.currentTarget.id});
            },

            onRandomClick: function() {
                IO.socket.emit('masterChosen', {gameID: Game.myGameID});
            }
        },
    };

	IO.init();
	Game.init();
}($));