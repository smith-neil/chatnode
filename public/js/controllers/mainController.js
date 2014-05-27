'use strict';

var chatnode = angular.module('chatnode');

chatnode.controller('mainCtrl', ['$scope', '$http', 'socket',
	function ($scope, $http, socket) {

		$scope.user = {};
		$scope.people = [];
		$scope.messages = [];

		$scope.changeUsername = function (newUsername) {
			if ($scope.user === {} || newUsername === false) {
				return;
			}

			socket.emit('changeUsername', { userId: $scope.user.id, newUsername: newUsername });
		};

		$scope.sendMessage = function (message) {
			if ($scope.user === {} || message === false) {
				return;
			}

			$scope.message = null;
			socket.emit('sendMessage', { userId: $scope.user.id, message: message });
		}

		socket.on('userConnected', function (data) {
			$scope.people.push(data.user);

			$scope.messages.push({
				timestamp: Date.now(),
				userId: 0,
				username: "chatnode",
				text: data.user.username + " connected."
			});
		});

		socket.on('userDisconnected', function (data) {
			var idx = -1;
			var username = '';
			for (var i = 0; i < $scope.people.length; i++) {
				if ($scope.people[i].id === data.user.id) {
					idx = 1;
					username = $scope.people[i].username;
					break;
				}
			}

			if (idx > -1) {
				$scope.people.splice(idx, 1);
			}

			$scope.messages.push({
				timestamp: Date.now(),
				userId: 0,
				username: "chatnode",
				text: username + " disconnected."
			});
		});

		socket.on('userChangedUsername', function (data) {
			var username = '';
			for (var i = 0; i < $scope.people.length; i++) {
				if ($scope.people[i].id === data.userId) {
					username = $scope.people[i].username;
					$scope.people[i].username = data.newUsername;
					break;
				}
			}

			$scope.messages.push({
				timestamp: Date.now(),
				userId: 0,
				username: "chatnode",
				text: username + " changed their name to " + data.newUsername + "."
			});
		});

		socket.on('userSendMessage', function (data) {
			$scope.messages.push({
				timestamp: Date.now(),
				userId: data.userId,
				username: data.username,
				text: data.message
			});
		});

		socket.on('connectionRes', function (data) {
			$scope.user = data.user;
			$scope.people = data.users;
		});

		socket.on('changeUsernameRes', function (data) {
			if (data.success) {
				$scope.user.username = $scope.newUsername;
				$scope.newUsername = null;
			} else {
				$scope.displayMessage.text = data.error;
				$scope.displayMessage.isShowing = true;
			}
		});

	}
]);