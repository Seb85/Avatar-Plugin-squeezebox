'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = require('../../node_modules/ava-ia/lib/helpers');

exports.default = function (state, actions) {
	  
	if (state.isIntent) return (0, _helpers.resolve)(state);
	
	var match;
	var periphs = Config.modules.squeezebox.intentRules;

	for (var i=0; i<periphs.length && !match; i++) {
		 for (var rule in Config.modules.squeezebox[periphs[i]]) {
			match = (0, _helpers.syntax)(state.sentence, Config.modules.squeezebox[periphs[i]][rule]); 
			if (match) 
				break;
		 }
	}
   
	if (match && rule) {
		if (state.debug) info('IntentSqueezebox'.bold.green, 'syntax:',((match) ? 'true'.green : 'false'.green));
		state.isIntent = true;
		return (0, _helpers.factoryActions)(state, actions);
	} else 
		return (0, _helpers.resolve)(state);
	
};