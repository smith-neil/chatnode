'use strict';

(function () {

	var app = angular.module('chatnode', ['luegg.directives', 'btford.socket-io']);
	
	app.factory('socket', function (socketFactory) {
		return socketFactory();
	});

})();