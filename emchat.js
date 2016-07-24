var superAgent = require('superAgent');
var util = require('util');

exports = module.exports = function(orgName, appName, clientId, clientSecret, accessToken) {

	var that = this;

	this.apiUrl = 'https://a1.easemob.com';

	this.accessToken = '';
	this.orgName = orgName;
	this.appName = appName;
	this.clientId = clientId;
	this.clientSecret = clientSecret;

	this.api = {};

	if (accessToken) {
		this.accessToken = accessToken;
	}

	this.getApiPathUrl = function(path) {
		path = path ? path : '';
		path = path.substr(0, 1) === '/' ? path : '/' + path;
		return util.format('%s/%s/%s%s', this.apiUrl, this.orgName, this.appName, path);
	};

	this.setApiHeaders = function(headers) {

		headers = headers ? headers : {};

		var defaultHeaders = {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + this.accessToken,
		};

		for (var key in defaultHeaders) {
			headers[key] = defaultHeaders[key];
		}

		return headers;
	};

	this.get = function(path, callback) {

		var url = this.getApiPathUrl(path);

		superAgent
			.get(url)
			.set(this.setApiHeaders())
			.end(function(err, res) {
				if (!err) {
					callback && callback(0, res.body);
				} else {
					callback && callback(err.response ? err.response.body : err);
				}
			});
	};

	this.post = function(path, data, callback) {

		var url = this.getApiPathUrl(path);

		superAgent
			.post(url)
			.set(this.setApiHeaders())
			.send(data)
			.end(function(err, res) {
				if (!err) {
					callback && callback(0, res.body);
				} else {
					callback && callback(err.response ? err.response.body : err);
				}
			});
	};

	this.put = function(path, data, callback) {

		var url = this.getApiPathUrl(path);

		superAgent
			.put(url)
			.set(this.setApiHeaders())
			.send(data)
			.end(function(err, res) {
				if (!err) {
					callback && callback(0, res.body);
				} else {
					callback && callback(err.response ? err.response.body : err);
				}
			});
	};

	this.del = function(path, callback) {

		var url = this.getApiPathUrl(path);

		superAgent
			.delete(url)
			.set(this.setApiHeaders())
			.end(function(err, res) {
				if (!err) {
					callback && callback(0, res.body);
				} else {
					callback && callback(err.response ? err.response.body : err);
				}
			});
	};

	this.api.getToken = function(callback) {

		var url = util.format('%s/%s/%s%s', that.apiUrl, that.orgName, that.appName, '/token');

		if (that.accessToken !== '') {
			return callback && callback();
		}

		superAgent
			.post(url)
			.set({
				'content-type': 'application/json'
			})
			.send({
				'grant_type': 'client_credentials',
				'client_id': that.clientId,
				'client_secret': that.clientSecret
			})
			.end(function(err, res) {

				if (!err) {
					that.accessToken = res.body.access_token;
					callback && callback(0, res.body);
				} else {
					callback && callback(err.response ? err.response.body : err);
				}

			});
	};

	//注册IM用户[单个]
	this.api.createUser = function(username, password, callback) {
		this.getToken(function() {

			var data = {
				username: username,
				password: password
			};

			this.post('/users', data, callback);
		});
	};


	//注册IM用户[批量]
	this.api.createUsers = function(users, callback) {

		this.getToken(function() {
			this.post('/users', users, callback);
		});

	};


	//重置用户密码
	this.api.resetPassword = function(username, oldpwd, newpwd, callback) {
		var data = {
			oldpassword: oldpwd,
			newpassword: newpwd
		};

		this.getToken(function() {
			this.put('/users/' + username + '/password', data, callback);
		});

	};

	//获取IM用户[单个]
	this.api.getUser = function(username, callback) {

		this.getToken(function() {
			this.get('/users/' + username, callback);
		});

	};

	//获取IM用户[批量]
	this.api.getUsers = function(limit, callback) {

		this.getToken(function() {
			that.get('/users?limit=' + limit, callback);
		});

	};

	//删除IM用户[单个]
	this.api.deleteUser = function(username, callback) {

		this.getToken(function() {
			this.del('/users/' + username, callback);
		});

	};

	//删除IM用户[批量]
	this.api.deleteUsers = function(limit, callback) {

		this.getToken(function() {
			this.post('/users?limit=' + limit, callback);
		});

	};

	//修改用户昵称
	this.api.editNickname = function(username, nickname, callback) {

		this.getToken(function() {
			var data = {
				nickname: nickname
			};
			this.put('/users/' + username, data, callback);
		});

	};

	//给IM用户添加好友
	this.api.addFriend = function(username, friendname, callback) {

		this.getToken(function() {
			this.post('/users/' + username + '/contacts/users/' + friendname, data, callback);
		});

	};

	//解除IM用户的好友关系
	this.api.deleteFriend = function(username, friendname, callback) {
		this.getToken(function() {
			this.del('/users/' + username + '/contacts/users/' + friendname, callback);
		});
	};

	//查看用户的好友
	this.api.showFriends = function(username, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/contacts/users', callback);
		});
	};


	//查看用户的黑名单
	this.api.getBlacklist = function(username, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/blocks/users', callback);
		});
	}

	//往黑名单中加人
	this.api.addUserForBlacklist = function(username, users, callback) {
		var data = {
			usernames: users
		};
		this.getToken(function() {
			this.post('/users/' + username + '/blocks/users', data, callback);
		});
	};

	//从黑名单中减人
	this.api.deleteUserFromBlacklist = function(username, blackuser, callback) {
		this.getToken(function() {
			this.del('/users/' + username + '/blocks/users/' + blackuser, callback);
		});
	};

	//查看用户在线状态
	this.api.isOnline = function(username, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/status', callback);
		});
	};

	//查询用户离线消息数
	this.api.getOfflineMessuperAgentges = function(username, callback) {
		this.getToken(function() {
			this.post('/users/' + username + '/offline_msg_count', data, callback);
		});
	};

	//查询某条离线消息状态-----暂未测试---格式："{消息id}":"{状态}", 状态的值有两个: deliverd 表示此用户的该条离线消息已经收到过了，undelivered 表示此用户的该条离线消息未还未收到
	// },
	this.getOfflineMessuperAgentgeStatus = function(username, msgid, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/offline_msg_status/' + msgid, data, callback);
		});
	};

	//禁用用户账号
	this.api.deactiveUser = function(username, callback) {
		this.getToken(function() {
			this.post('/users/' + username + '/deactivate', data, callback);
		});

	};

	//解禁用户账号
	this.api.activeUser = function(username, callback) {
		this.getToken(function() {
			this.post('/users/' + username + '/activate', data, callback);
		});
	};

	//强制用户下线
	this.api.disconnectUser = function(username, callback) {
		this.getToken(function() {
			this.post('/users/' + username + '/disconnect', data, callback);
		});
	};

	//----------------------------------------------------发送消息

	//发送文本消息
	/*
		type: // users 给用户发消息。chatgroups: 给群发消息，chatrooms: 给聊天室发消息
		target:
		content:
		from:
		ext:
		callback:
	*/
	this.api.sendText = function(type, from, target, content, ext, callback) {
		this.getToken(function() {

			if (!util.isArray(target)) {
				target = [target];
			}

			var data = {
				target_type: type,
				target: target,
				msg: {
					type: 'txt',
					msg: content
				},
				from: from,
				ext: ext
			};

			this.post('/messages', data, callback);
		});
	};

	//发送图片消息
	/*
		type: // users 给用户发消息。chatgroups: 给群发消息，chatrooms: 给聊天室发消息
		target:
		url:
		filename:
		secret:
		from:
		ext:
		callback:
		
	*/
	this.api.sendImage = function(type, from, target, filename, fileUrl, secret, ext, callback) {

		this.getToken(function() {

			if (!util.isArray(target)) {
				target = [target];
			}

			var data = {
				target_type: type,
				target: target,
				msg: {
					type: 'img',
					url: fileUrl,
					filename: filename,
					secret: secret,
					size: {
						width: 480,
						height: 720
					}
				},
				from: from,
				ext: ext,
			};

			this.post('/messages', data, callback);
		});
	};

	//发送语音消息
	/*
		type: // users 给用户发消息。chatgroups: 给群发消息，chatrooms: 给聊天室发消息
		target:
		url:
		filename:
		length:
		secret:
		from:
		ext:
		callback:
		
	*/
	this.api.sendAudio = function(type, from, target, filename, fileUrl, secret, length, ext, callback) {

		this.getToken(function() {

			if (!util.isArray(target)) {
				target = [target];
			}

			var data = {
				target_type: type,
				target: target,
				msg: {
					type: 'audio',
					url: fileUrl,
					filename: filename,
					length: length,
					secret: secret
				},
				from: from,
				ext: ext,
			};

			this.post('/messages', data, callback);
		});
	};

	//发送视频消息
	/*
		type: // users 给用户发消息。chatgroups: 给群发消息，chatrooms: 给聊天室发消息
		target:
		url:
		filename:
		thumb:
		length:
		file_length:
		thumb_secret:
		secret:
		from:
		ext:
		callback:
		
	*/
	this.api.sendVedio = function(type, from, target, filename, fileUrl, length, thumb, fileLength, thmbSecret, secret, ext, callback) {
		this.getToken(function() {

			if (!util.isArray(target)) {
				target = [target];
			}

			var data = {
				target_type: type,
				target: target,
				msg: {
					type: 'video',
					url: fileUrl,
					filename: filename,
					thumb: thumb,
					length: length,
					file_length: fileLength,
					thumb_secret: thumbSecret,
					secret: secret
				},
				from: from,
				ext: ext,
			};

			this.post('/messages', data, callback);
		});
	};

	//发送透传消息
	/*
		type:
		target:
		action:
		from:
		ext:
		callback:
		
	*/
	this.api.sendCmd = function(type, from, target, action, ext, callback) {

		this.getToken(function() {

			if (!util.isArray(target)) {
				target = [target];
			}

			var data = {
				target_type: type,
				target: target,
				msg: {
					type: 'cmd',
					action: action
				},
				from: from,
				ext: ext,
			};

			this.post('/messages', data, callback);
		});

	};

	//---------------------------------------------------------------群组操作

	//获取所有群组
	this.api.getGroups = function(limit, callback) {

		this.getToken(function() {
			this.get('/chatgroups?limit=' + limit, callback);
		});
		
	};

	//获取一个或多个群组的详情
	this.api.getGroupDetail = function(groupIds, callback) {
		this.getToken(function() {
			this.get('/chatgroups/' + groupIds, callback);
		});
	};

	//创建一个群组
	/*
		groupname: 
		desc:
		public: 是否是公开群
		maxusers:  最大成员数
		approval: 加入公开群是否需要批准
		owner:
		members:
		callback: 回调
	*/
	this.api.createGroup = function(groupName, desc, public, maxUsers, approval, owner, members, callback) {

		this.getToken(function() {

			var data = {
				groupname: groupName,
				desc: desc,
				public: public,
				maxusers: maxUsers,
				approval: approval,
				owner: owner,
				members: members
			};

			this.post('/chatgroups', data, callback);

		});

	};

	//修改群组信息
	/*
		group_id:
		groupname:
		description:
		maxusers:
		callback:
	*/
	this.api.modifyGroupInfo = function(groupId, groupName, description, maxUsers, callback) {

		this.getToken(function() {

			var data = {
				groupname: groupId,
				description: description,
				maxusers: maxUsers
			};

			this.post('/chatgroups/' + groupId, data, callback);
		});

	};

	//删除群组
	this.api.deleteGroup = function(groupId, callback) {
		this.getToken(function() {
			this.del('/chatgroups/' + groupId, callback);
		});
	};

	//获取群组中成员
	this.api.getGroupUsers = function(groupId, callback) {
		this.getToken(function() {
			this.get('/chatgroups/' + groupId + '/users', callback);
		});
	};

	//群组加人
	this.api.addGroupMember = function(groupId, username, callback) {
		this.getToken(function() {
			this.post('/chatgroups/' + groupId + '/users/' + username, data, callback);
		});
	};

	//群组加人[批量]
	this.api.addGroupMembers = function(groupId, users, callback) {
		this.getToken(function() {

			var data = {
				usernames: users
			};

			this.post('/chatgroups/' + groupId + '/users', data, callback);
		});
	};

	//群组减人
	this.api.deleteGroupMember = function(groupId, username, callback) {
		this.getToken(function() {
			this.del('/chatgroups/' + groupId + '/users/' + username, callback);
		});
	};

	//群组减人[批量]----------不支持该接口
	this.api.deleteGroupMembers = function(groupId, users, callback) {
		this.getToken(function() {
			this.del('/chatgroups/' + groupId + '/users/' + users, callback);
		});
	};

	// 获取一个用户参与的所有群组
	this.api.getGroupsForUser = function(username, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/joined_chatgroups', callback);
		});
	};

	// 群组转让
	/*
		group_id:
		newowner:
		callback:
	*/
	this.api.changeGroupOwner = function(groupId, newOwner, callback) {

		this.getToken(function() {
			var data = {
				newowner: newOwner,
			};

			this.put('/chatgroups/' + groupId, data, callback);
		});
	};

	//查询一个群组黑名单用户名列表
	this.api.getGroupBlackList = function(groupId, callback) {
		this.getToken(function() {
			this.get('/chatgroups/' + groupId + '/blocks/users', callback);
		});
	};

	//群组黑名单加人
	this.api.addGroupBlackMember = function(groupId, username, callback) {
		this.getToken(function() {
			this.post('/chatgroups/' + groupId + '/blocks/users/' + username, data, callback);
		});
	};

	//群组黑名单减人
	this.deleteGroupBlackMember = function(groupId, username, callback) {
		this.getToken(function() {
			this.del('/chatgroups/' + groupId + '/blocks/users/' + username, callback);
		});
	};

	//下载文件
	/*
		uuid:
		header:
		callback:	
	*/
	this.api.downloadFile = function(uuid, callback) {

		this.getToken(function() {
			this.get('/chatfiles/' + uuid, callback);
		});

	};

	//下载文件
	/*
		uuid:
		header:
		callback:	
	*/
	this.api.downloadThumbnail = function(uuid, callback) {
		this.getToken(function() {
			this.get('/chatfiles/' + uuid, callback);
		});
	};


	//---------------------------------------------导出聊天记录

	//取聊天记录
	/*
		ql: 查询条件，如：$ql= "select+*+where+time>1403143434443'" . $uid . "'+or+to='". $uid ."'+order+by+timestamp+desc&limit=" . $limit . $cursor;
		cursor: 分页参数
		limit: 条数，默认20
	*/
	this.api.getChatRecord = function(ql, limit, cursor, callback) {
		this.getToken(function() {
			this.get('/chatmessuperAgentges?ql=' + ql + '&limit=' + limit + '&cursor=' + cursor, callback);
		});
	};


	//-----------------------------------------------------聊天室操作

	//创建聊天室
	/*
		name:  *
		description:  *
		maxusers:
		owner:  *
		members:
		
		callback:
	*/
	this.api.createChatRoom = function(name, description, maxUsers, owner, members, callback) {
		this.getToken(function() {

			var data = {
				name: name,
				description: description,
				maxusers: maxUsers,
				owner: owner,
				members: members
			};

			this.post('/chatrooms', data, callback);
		});
	};

	//修改聊天室信息
	/*
		chatroom_id:
		name:  *
		description:  *
		maxusers:
		
		callback:
	*/
	this.api.modifyChatRoom = function(name, description, maxUsers, callback) {

		this.getToken(function() {

			var data = {
				name: name,
				description: description,
				maxusers: maxusers,
			};

			this.put('/chatrooms/' + chatroom_id, data, callback);
		});

	};

	//删除聊天室
	this.api.deleteChatRoom = function(chatRoomId, callback) {
		this.getToken(function() {
			this.del('/chatrooms/' + chatRoomId, callback);
		});
	};

	//获取app中所有的聊天室
	this.api.getChatRooms = function(callback) {
		this.getToken(function() {
			this.get('/chatrooms', callback);
		});
	};


	//获取一个聊天室详情
	this.api.getChatRoomDetail = function(chatRoomId, callback) {
		this.getToken(function() {
			this.get('/chatrooms/' + chatRoomId, callback);
		});
	};

	// 获取用户加入的聊天室
	this.api.getChatRoomJoined = function(username, callback) {
		this.getToken(function() {
			this.get('/users/' + username + '/joined_chatrooms', callback);
		});
	};

	// 聊天室加人
	this.api.addChatRoomMember = function(chatRoomId, username, callback) {
		this.getToken(function() {
			this.post('/chatrooms/' + chatRoomId + '/users/' + username, data, callback);
		});
	};

	//聊天室减人
	this.api.deleteChatRoomMember = function(chatRoomId, username, callback) {
		this.getToken(function() {
			this.del('/chatrooms/' + chatRoomId + '/users/' + username, callback);
		});
	};

	return this;
};