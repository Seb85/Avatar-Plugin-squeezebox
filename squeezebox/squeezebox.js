var request = require('request');

require('colors');
var _SqueezeboxConf;

exports.init = function(){
	
	// table of properties
	 _SqueezeboxConf = {
		pathSqueezeboxApi:  Config.modules.squeezebox.html || '',
		ip : Config.modules.squeezebox.addrSqueezebox || ''
	};
	
}
  

  
exports.action = function(data, callback){
	
	if (!_SqueezeboxConf.pathSqueezeboxApi || !_SqueezeboxConf.ip ) {
		error("SqueezeBox:", "La configuration de SqueezeBox est manquante".red);
		return callback();
	}
	
	var tblCommand = {
		mute : function() { requestSqueezeBoxMute(data.client, 'p0=pause&p1=1&player=MAC')},
		mutebis : function() { requestSqueezeBoxMute(data.client, 'p0=play&p1=1&player=MAC')},
		play : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "C'est en cours.|Comme si c'était fait.|magique.")},
		pause : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "C'est en cours.|Comme si c'était fait.|magique.")}
	};
	
	var room = setClient(data);
	info("SqueezeBox command:", data.action.command.yellow, "From:", data.client.yellow, "To:", room.yellow);
	tblCommand[data.action.command]();
	callback();
}


var setClient = function (data) {
	
	// client direct (la commande provient du client et est exécutée sur le client)
	var client = data.client;	
	// Client spécifique fixe (la commande ne provient pas du client et n'est pas exécutée sur le client et ne peut pas changer)
	if (data.action.room) 
		client = (data.action.room != 'current') ? data.action.room : (Avatar.currentRoom) ? Avatar.currentRoom : Config.default.client;
	// Client spécifique non fixe dans la commande HTTP (la commande ne provient pas du client et n'est pas exécutée sur le client et peut changer)
	if (data.action.setRoom) 
		client = data.action.setRoom;
	
	return client;
}

function requestSqueezeBoxMute (client, value, txt) {
	
	
	var uri = _SqueezeboxConf.ip + _SqueezeboxConf.pathSqueezeboxApi + value;
	
	info('uri:', uri.yellow);
	
	request({
		url: uri,
		method: 'POST'
	},
	function(state) {
		if (txt) {
			Avatar.speak(txt, client, function() {
				Avatar.Speech.end(client);
			});
			} else {
			var answer = !state;
			info(answer);
		}
		},
	function (err, response) {
		if (err || response.statusCode != 200) {
			info('Error: Callback request'.red);
			return callback(false);
		}
	   
	});
	
}

function requestSqueezeBoxCmd (client, value, txt) {
	
	
	var uri = _SqueezeboxConf.ip + _SqueezeboxConf.pathSqueezeboxApi + value;
	
	info('uri:', uri.yellow);
	
	request({
		url: uri,
		method: 'POST'
	},
	function(state) {
		if (txt) {
			Avatar.speak(txt, client, function() {
				Avatar.Speech.end(client);
			});
			} else {
			var answer = !state;
			Avatar.Speech.end(client);
			info(answer);
		}
		},
	function (err, response) {
		if (err || response.statusCode != 200) {
			info('Error: Callback request'.red);
			return callback(false);
		}
	   
	});
	
}