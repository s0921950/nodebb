"use strict";

var express = require('express');

var uploadsController = require('../controllers/uploads');

module.exports =  function (app, middleware, controllers) {

	var router = express.Router();
	app.use('/api', router);

	router.get('/config', middleware.applyCSRF, controllers.api.getConfig);
	router.get('/widgets/render', controllers.api.renderWidgets);

	router.get('/me', middleware.checkGlobalPrivacySettings, controllers.api.getCurrentUser);
	router.get('/user/uid/:uid', middleware.checkGlobalPrivacySettings, controllers.api.getUserByUID);
	router.get('/user/username/:username', middleware.checkGlobalPrivacySettings, controllers.api.getUserByUsername);
	router.get('/user/email/:email', middleware.checkGlobalPrivacySettings, controllers.api.getUserByEmail);

	router.get('/terminal/insert', middleware.checkGlobalPrivacySettings, controllers.api.mongodbInsert);
	router.get('/terminal/remove', middleware.checkGlobalPrivacySettings, controllers.api.mongodbRemove);
	router.get('/terminal/update', middleware.checkGlobalPrivacySettings, controllers.api.mongodbUpdate);
	router.get('/terminal/find', middleware.checkGlobalPrivacySettings, controllers.api.mongodbFind);
	router.get('/terminal/showCol', middleware.checkGlobalPrivacySettings, controllers.api.mongodbShowCol);

	router.get('/:type/pid/:id', controllers.api.getObject);
	router.get('/:type/tid/:id', controllers.api.getObject);
	router.get('/:type/cid/:id', controllers.api.getObject);

	router.get('/categories/:cid/moderators', controllers.api.getModerators);
	router.get('/recent/posts/:term?', controllers.api.getRecentPosts);
	router.get('/unread/:filter?/total', middleware.authenticate, controllers.unread.unreadTotal);
	router.get('/topic/teaser/:topic_id', controllers.topics.teaser);
	router.get('/topic/pagination/:topic_id', controllers.topics.pagination);

	var multipart = require('connect-multiparty');
	var multipartMiddleware = multipart();
	var middlewares = [multipartMiddleware, middleware.validateFiles, middleware.applyCSRF];
	router.post('/post/upload', middlewares, uploadsController.uploadPost);
	router.post('/topic/thumb/upload', middlewares, uploadsController.uploadThumb);
	router.post('/user/:userslug/uploadpicture', middlewares.concat([middleware.authenticate, middleware.checkGlobalPrivacySettings, middleware.checkAccountPermissions]), controllers.accounts.edit.uploadPicture);

	router.post('/user/:userslug/uploadcover', middlewares.concat([middleware.authenticate, middleware.checkGlobalPrivacySettings, middleware.checkAccountPermissions]), controllers.accounts.edit.uploadCoverPicture);
	router.post('/groups/uploadpicture', middlewares.concat([middleware.authenticate]), controllers.groups.uploadCover);
};

