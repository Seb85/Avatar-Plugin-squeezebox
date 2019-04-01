var request = require('request');
var Promise = require('q').Promise;

var _SqueezeboxConf;

exports.init = function(){
	
	// table of properties
	 _SqueezeboxConf = {
		SqueezeboxHtml:  Config.modules.squeezebox.html || '',
		ip : Config.modules.squeezebox.addrSqueezebox || ''
	};
	
}
  

  
exports.action = function(data, callback){
	
	if (!_SqueezeboxConf.SqueezeboxHtml || !_SqueezeboxConf.ip ) {
		error("SqueezeBox:", "La configuration de SqueezeBox est manquante".red);
		return callback();
	}
	
	var tblCommand = {
		play : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "Très bien.")},
		pause : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "OK.")},
		stop : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "Bien monsieur.")},
		suivant : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "Suivant.")},
		precedent : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "Précédent.")},
		sondown : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "OK.")},
		sonup : function(){requestSqueezeBoxCmd(data.client, Config.modules.squeezebox.clients[room][data.action.value], "OK.")},
		deezer : function(){requestSqueezeBoxDeezer(data, client, Config.modules.squeezebox.clients[room][data.action.value])}
	};
	let client = setClient(data);
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

function requestSqueezeBoxCmd (client, value, txt) {
	var url = _SqueezeboxConf.ip + _SqueezeboxConf.SqueezeboxHtml + value;
	http_request(url),
	Avatar.speak(txt, client, function() {
				Avatar.Speech.end(client);
	});;
}

function requestSqueezeBoxDeezer(data, client, value) {
	var url = _SqueezeboxConf.ip + '/anyurl?p0=playlist&p1=clear&' + value
	http_request(url)
    Avatar.askme("Tu veux rechercher un artiste, un album, un titre, une playlist ou bien le flo ?", data.client,
	{
		"*": "generic",
        "terminer": "done"
	},0, function (answer, end) {
			
			if (answer && answer.indexOf('generic') != -1) {
              end(data.client);
              answer = answer.split(':')[1];

              if (answer.indexOf('artiste') != -1) {
                return deezerartiste(data, client, value);
              }

              if (answer.indexOf('album') != -1) {
                return deezeralbum(data, client, value);
              }

              if (answer.indexOf('titre') != -1) {
                return deezertitre(data, client, value);
              }
			  
			  if (answer.indexOf('playlist') != -1) {
                return deezerplaylist(data, client, value);
              }
			  
			  if (answer.indexOf('flow') != -1) {
				Avatar.speak("C'est parti.", data.client, function () {
                });
				var url = _SqueezeboxConf.ip + _SqueezeboxConf.SqueezeboxHtml + 'p0=playlist&p1=play&p2=deezer%3A%2F%2Fflow.dzr&p3=Deezer%20Flow&' + value;
				http_request(url)
				end(data.client, true);
				return;
              }

              return Avatar.speak("Je suis désolé, je n'ai pas compris.", data.client, function(){
                  requestSqueezeBoxDeezer(data, client)
              });
          }

          // Grammaire fixe
          switch(answer) {
            case "done":
            default:
                Avatar.speak("Terminé", data.client, function(){
                    end(data.client, true);
                });
         }
      })		
}	

function deezerartiste(data, client, value) {
				Avatar.askme("Quel artiste ?", data.client,
				{
					"*": "generic",
                    "terminer": "done"
				},0, function (answer, end) {
					if (answer && answer.indexOf('generic') != -1) {
					answer = answer.split(':')[1];
					answer = answer.replace('l\'','');
					answer = answer.replace('é','e');
					answer = answer.replace('è','e');
					answer = answer.replace('ê','e');
					answer = answer.replace('ç','c');
					answer = answer.replace('ö','o');
					answer = answer.replace('à','a');
					answer = answer.replace('ï','i');
					answer = answer.replace(':','');
					answer = answer.replace('.','');
					answer = answer.replace(',','');
					answer = answer.replace(';','');
					answer = answer.replace('?','');
					answer = answer.replace('!','');
					answer = answer.replace('&','');
					answer = answer.replace('angel','angele');
					answer = answer.replace('jane','jain');
					answer = answer.replace(answer[0], answer[0].toUpperCase());
					info(answer)
					Avatar.speak("C'est parti.", data.client, function () {
					});
					var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&sess=&index=0f41dc65.0.0&submit=Recherche&q=' + answer
					http_request(url)
					.then(body => scraperartiste(body))
					.then(function(index) { 
					var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&' + index + '&sess='
					info(url)
					http_request(url)
					.then(body => scraperall(body, value))
					})
					end(data.client, true);
					return;
					}
					
					// Grammaire fixe
					switch(answer) {
					case "done":
					default:
						Avatar.speak("Terminé", data.client, function(){
							end(data.client, true);
					});
			}
	})
}

function deezeralbum(data, client, value) {
				Avatar.askme("Quel album ?", data.client,
				{
					"*": "generic",
                    "terminer": "done"
				},0, function (answer, end) {
					if (answer && answer.indexOf('generic') != -1) {
					answer = answer.split(':')[1];
					answer = answer.replace('l\'','');
					answer = answer.replace('é','e');
					answer = answer.replace('è','e');
					answer = answer.replace('ê','e');
					answer = answer.replace('ç','c');
					answer = answer.replace('ö','o');
					answer = answer.replace('à','a');
					answer = answer.replace('ï','i');
					answer = answer.replace(':','');
					answer = answer.replace('.','');
					answer = answer.replace(',','');
					answer = answer.replace(';','');
					answer = answer.replace('?','');
					answer = answer.replace('!','');
					answer = answer.replace('&','');
					answer = answer.replace('angel','angele');
					answer = answer.replace('jane','jain');
					answer = answer.replace(answer[0], answer[0].toUpperCase());
					info(answer)
					Avatar.speak("C'est parti.", data.client, function () {
					});
					var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&sess=&index=27df761e.0.1&submit=Recherche&q=' + answer
					http_request(url)
					.then(body => scraperalbum(body))
					.then(function(index) { 
					var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&' + index + '&sess='
					http_request(url)
					.then(body => scraperall(body, value))
					})
					end(data.client, true);
					return;
					}
					
					// Grammaire fixe
					switch(answer) {
					case "done":
					default:
						Avatar.speak("Terminé", data.client, function(){
							end(data.client, true);
					});
			}
	})
}

function deezertitre(data, client, value) {
				Avatar.askme("Quel titre ?", data.client,
				{
					"*": "generic",
                    "terminer": "done"
				},0, function (answer, end) {
					if (answer && answer.indexOf('generic') != -1) {
					answer = answer.split(':')[1];
					answer = answer.replace('l\'','');
					answer = answer.replace('é','e');
					answer = answer.replace('è','e');
					answer = answer.replace('ê','e');
					answer = answer.replace('ç','c');
					answer = answer.replace('ö','o');
					answer = answer.replace('à','a');
					answer = answer.replace('ï','i');
					answer = answer.replace(':','');
					answer = answer.replace('.','');
					answer = answer.replace(',','');
					answer = answer.replace(';','');
					answer = answer.replace('?','');
					answer = answer.replace('!','');
					answer = answer.replace('&','');
					answer = answer.replace('angel','angele');
					answer = answer.replace('jane','jain');
					answer = answer.replace(answer[0], answer[0].toUpperCase());
					info(answer)
					Avatar.speak("C'est parti.", data.client, function () {
					});
					var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&sess=&index=a319d32b.0.2&submit=Recherche&q=' + answer
					http_request(url)
					.then(body => scrapertitre(body, value))
					end(data.client, true);
					return;
					}
					
					// Grammaire fixe
					switch(answer) {
					case "done":
					default:
						Avatar.speak("Terminé", data.client, function(){
							end(data.client, true);
					});
			}
	})
}

function deezerplaylist(data, client, value) {
				Avatar.askme("Vous avez le choix entre ces playlist. Soirée, Sport ?", data.client,
				{
					"*": "generic",
                    "terminer": "done"
				},0, function (answer, end) {
					if (answer && answer.indexOf('generic') != -1) {
					end(data.client);
					answer = answer.split(':')[1];

					if (answer.indexOf('soirée') != -1) {
						end(data.client);
						info(answer)
						Avatar.speak("C'est parti.", data.client, function () {
						});
						var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&sess=&index=a8fde8a9.3.0&sess='
						http_request(url)
						.then(body => scraperplaylist(body, answer, value))
						end(data.client, true);
						return;
					}
			  
					if (answer.indexOf('sport') != -1) {
						end(data.client);
						info(answer)
						Avatar.speak("C'est parti.", data.client, function () {
						});
						var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&sess=&index=a8fde8a9.3.0&sess='
						http_request(url)
						.then(body => scraperplaylist(body, answer, value))
						end(data.client, true);
						return;
					}

					return Avatar.speak("Je suis désolé, je n'ai pas compris.", data.client, function(){
						deezerplaylist(data, client)
					});
				}

				// Grammaire fixe
				switch(answer) {
					case "done":
					default:
						Avatar.speak("Terminé", data.client, function(){
							end(data.client, true);
						});
				}
		})
}

function scraperartiste(body) {
	return new Promise(function (resolve, reject) {
		var index = body;
		index = index.split('<div class="browseItemDetail">')[1];
		index = index.split('<a href="index.html?')[1];
		index = index.split('.0&')[0];
		index = index + '.0.1';
		if (!index) {
			Avatar.speak("Désolé je n'ai pas trouvé.", data.client, function(){
			});
		}
		resolve (index);
	});
	
}

function scraperalbum(body) {
	return new Promise(function (resolve, reject) {
		var index = body;
		index = index.split('<div class="browseItemDetail">')[1];
		index = index.split('<a href="index.html?')[1];
		index = index.split('&')[0];
		
		if (!index) {
			Avatar.speak("Désolé je n'ai pas trouvé.", data.client, function(){
			});
		}
		resolve (index);
	});
	
}

function scrapertitre(body, value) {
	return new Promise(function (resolve, reject) {
		var index = body;
		index = index.split('title="Lecture"/></a>')[1];
		index = index.split('SqueezeJS.Controller.urlRequest(')[1];
		index = index.split("'")[1];
		index = index.split("'")[0];
		if (!index) {
			Avatar.speak("Désolé je n'ai pas trouvé.", data.client, function(){
			});
		}
		var url = _SqueezeboxConf.ip + index
		http_request(url)
		var url = _SqueezeboxConf.ip + _SqueezeboxConf.SqueezeboxHtml + 'p0=play&p1=1&' + value
		http_request(url)
		resolve (index);
	});
	
}

function scraperplaylist(body, answer, value) {
		var index = body;
		var answer = answer.substring(1, answer.length0);
		index = index.split(answer)[0];
		var index = index.split(/html\?+/).pop();
		index = index.split('&')[0];
		if (!index) {
			Avatar.speak("Désolé je n'ai pas trouvé.", data.client, function(){
			});
		}
		var url = _SqueezeboxConf.ip + '/plugins/deezer/index.html?' + value + '&' + index + '&sess='
		http_request(url)
		.then(body => scraperall(body, value))
}

function scraperall(body, value) {
	return new Promise(function (resolve, reject) {
		//Merci Yann
		var regex = /\/anyurl?.*', 1\)/g
		var index = body.match(regex);
		for(let a of index) 
			{
			var index2 = a.substring(0, a.length-5);
			var url = _SqueezeboxConf.ip + index2
			http_request(url)
			};
			var url = _SqueezeboxConf.ip + _SqueezeboxConf.SqueezeboxHtml + 'p0=play&p1=1&' + value
			http_request(url)
		resolve (index);
	});
}

function http_request (url) {
	return new Promise(function (resolve, reject) {
		
		var request = require('request');
		request({ 'uri' : url}, function (err, response, body) {
		
			if (err || response.statusCode != 200) {
			  return reject ('Désolé je n\'ai pas trouvé de vie de merde');
			}

			resolve(body);
		});
		
	});
	
}
