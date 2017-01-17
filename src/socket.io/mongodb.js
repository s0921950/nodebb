"use strict";

var MongoClient = require('mongodb').MongoClient;
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var meta = require('../meta');

var SocketMongodb = {};

SocketMongodb.initial = function (socket, database, callback) {

	var adminName, adminPassword, username, password, address, port;
	meta.settings.get('terminal', function(err, settings) {
		address = settings.address;
		port = settings.port;
		adminName = settings.admin_username;
		adminPassword = settings.admin_password;
		username = settings.username;
		password = settings.password;
		var db = new Db(database, new Server(address, port));
		db.open(function (err, db) {
			if (err) throw err;
			// Use the admin database for the operation
			var adminDb = db.admin();

			adminDb.authenticate(adminName, adminPassword, function (err, result) {
				db.addUser(username, password, 
				{
			        roles: [
			            "dbOwner"
			        ]   
			    },
			    function (err, result) {
				});
			});
		})
	})
};

SocketMongodb.removeDb = function (socket, database, callback) {

	var username, password, address, port;
	meta.settings.get('terminal', function(err, settings) {
		address = settings.address;
		port = settings.port;
		username = settings.username;
		password = settings.password;
		var db = new Db(database, new Server(address, port));
		// Establish connection to db
		db.open(function(err, db) {
			if (err) throw err;

			// Use the admin database for the operation
			var adminDb = db.admin();

			adminDb.authenticate(username, password, function (err, result) {
				db.dropDatabase(function(err, result) {
				});
			});
		})
	})
};

module.exports = SocketMongodb;