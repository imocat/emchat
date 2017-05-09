var superAgent = require('superAgent');
var util = require('util');

module.exports = function(orgName, appName, clientId, clientSecret, accessToken) {

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

	/*----------  网络请求  ----------*/

	this.getApiPathUrl = function(path) {
		path = path ? path : '';
		path = path.substr(0, 1) === '/' ? path : '/' + path;
		return util.format('%s/%s/%s%s', this.apiUrl, this.orgName, this.appName, path);
	};

	this.setApiHeaders = function(headers) {

		headers = headers ? headers : {};

		var defaultHeaders = {
			'content-type': 'application/json',
		};

		if (this.accessToken !== '') {
			defaultHeaders['Authorization'] = 'Bearer ' + this.accessToken;
		}

		for (var key in defaultHeaders) {
			headers[key] = defaultHeaders[key];
		}

		return headers;
	};

	this.request = function(request, data, callback) {

		return request
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

	this.get = function(path, callback) {

		var url = this.getApiPathUrl(path);
		return this.request(superAgent.get(url), {}, callback);

	};

	this.post = function(path, data, callback) {

		var url = this.getApiPathUrl(path);
		return this.request(superAgent.post(url), data, callback);

	};

	this.put = function(path, data, callback) {

		var url = this.getApiPathUrl(path);
		return this.request(superAgent.put(url), data, callback);

	};

	this.del = function(path, callback) {

		var url = this.getApiPathUrl(path);
		return this.request(superAgent.del(url, {}, callback));

	};

	/*----------  access token  ----------*/

	/**
	 * 获取 token
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getToken = function(callback) {

		if (that.accessToken !== '') {
			return callback && callback(0);
		}

		var path = '/token';

		return that.post(path, {
			'grant_type': 'client_credentials',
			'client_id': that.clientId,
			'client_secret': that.clientSecret
		}, function(err, res) {

			if (!err) {
				this.accessToken = res.access_token;
				callback && callback(0, res);
			} else {
				callback && callback(err);
			}

		});

	};

	/*----------  用户  ----------*/

	/**
	 * 注册用户
	 * @param  {string} 用户名
	 * @param  {string} 密码
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.createUser = function(username, password, callback) {
		return this.getToken(function() {

			var data = {
				username: username,
				password: password
			};

			this.post('/users', data, callback);
		});
	};


	/**
	 * 批量注册用户
	 * @param  {array}
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.createUsers = function(users, callback) {

		return this.getToken(function() {
			this.post('/users', users, callback);
		});

	};


	/**
	 * 修改密码
	 * @param  {string} 用户名
	 * @param  {string} 旧密码
	 * @param  {string} 新密码
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.updatePassword = function(username, oldPassword, newPassword, callback) {

		return this.getToken(function() {

			var data = {
				oldpassword: oldPassword,
				newpassword: newPassword
			};

			this.put('/users/' + username + '/password', data, callback);
		});

	};

	/**
	 * 获取用户
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getUser = function(username, callback) {

		return this.getToken(function() {
			this.get('/users/' + username, callback);
		});

	};

	/**
	 * 获取用户列表
	 * @param  {int} 数量
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getUsers = function(limit, callback) {

		return this.getToken(function() {
			that.get('/users?limit=' + limit, callback);
		});

	};

	/**
	 * 删除用户
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteUser = function(username, callback) {

		return this.getToken(function() {
			this.del('/users/' + username, callback);
		});

	};

	/**
	 * 批量删除用户
	 * @param  {limit} 数量
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteUsers = function(limit, callback) {

		return this.getToken(function() {
			this.del('/users?limit=' + limit, callback);
		});

	};

	/**
	 * 修改用户昵称
	 * @param  {string} 用户名
	 * @param  {string} 昵称
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.updateNickname = function(username, nickname, callback) {

		return this.getToken(function() {
			var data = {
				nickname: nickname
			};
			this.put('/users/' + username, data, callback);
		});

	};

	/**
	 * 添加好友
	 * @param {string} 用户名
	 * @param {string} 好友用户名
	 * @param {Function}
	 * @return {void}
	 */
	this.api.addFriend = function(username, friendname, callback) {

		return this.getToken(function() {
			this.post('/users/' + username + '/contacts/users/' + friendname, data, callback);
		});

	};

	/**
	 * 删除好友
	 * @param  {string} 用户名
	 * @param  {string} 好友用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteFriend = function(username, friendname, callback) {
		return this.getToken(function() {
			this.del('/users/' + username + '/contacts/users/' + friendname, callback);
		});
	};

	/**
	 * 得到用户好友列表
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getFriends = function(username, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/contacts/users', callback);
		});
	};

	/**
	 * 获取用户黑名单列表
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getBlacklist = function(username, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/blocks/users', callback);
		});
	};

	/**
	 * 批量添加黑名单
	 * @param {string} 用户名
	 * @param {array} 黑名单用户名数组
	 * @param {Function}
	 * @return {void}
	 */
	this.api.addUserForBlacklist = function(username, users, callback) {
		return this.getToken(function() {
			var data = {
				usernames: users
			};
			this.post('/users/' + username + '/blocks/users', data, callback);
		});
	};

	/**
	 * 移除黑名单
	 * @param  {string} 用户名
	 * @param  {string} 黑名单用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteUserFromBlacklist = function(username, blackuser, callback) {
		return this.getToken(function() {
			this.del('/users/' + username + '/blocks/users/' + blackuser, callback);
		});
	};

	/**
	 * 查看用户在线状态
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.isOnline = function(username, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/status', callback);
		});
	};

	/**
	 * 查询用户离线消息数
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getOfflineMessuperAgentges = function(username, callback) {
		return this.getToken(function() {
			this.post('/users/' + username + '/offline_msg_count', data, callback);
		});
	};

	/**
	 * 获取离线消息状态
	 * @todo 状态 deliverd 表示此用户的该条离线消息已经收到过了，undelivered 表示此用户的该条离线消息未还未收到
	 * @param  {string} 用户名
	 * @param  {string} 消息ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.getOfflineMessageStatus = function(username, msgid, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/offline_msg_status/' + msgid, data, callback);
		});
	};

	/**
	 * 禁用用户账号
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deactiveUser = function(username, callback) {
		return this.getToken(function() {
			this.post('/users/' + username + '/deactivate', data, callback);
		});

	};

	/**
	 * 解禁用户账号
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.activeUser = function(username, callback) {
		return this.getToken(function() {
			this.post('/users/' + username + '/activate', data, callback);
		});
	};

	/**
	 * 强制用户下线
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.disconnectUser = function(username, callback) {
		return this.getToken(function() {
			this.post('/users/' + username + '/disconnect', data, callback);
		});
	};

	/*----------   消息  ----------*/


	/** 发送文本消息
	 * @param  {string} 消息类型: users 发送给用户  chatgroups 发送给群聊  chatrooms 发送给聊天室
	 * @param  {string} 发送人用户名
	 * @param  {string|array} 接收人用户名|群聊 ID|聊天室 ID
	 * @param  {string} 消息正文
	 * @param  {object} 扩展信息
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.sendText = function(type, from, target, content, ext, callback) {
		return this.getToken(function() {

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

	/**
	 * 发送图片消息
	 * @param  {string} 消息类型(参照文本消息)
	 * @param  {string} 发送人用户名
	 * @param  {string|array} 接收人(参照文本消息)
	 * @param  {string} 文件名称
	 * @param  {string} 文件 url
	 * @param  {string} 安全校验
	 * @param  {object} 扩展信息
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.sendImage = function(type, from, target, filename, fileUrl, secret, ext, callback) {

		return this.getToken(function() {

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

	/**
	 * 发送语音消息
	 * @param  {string} 消息类型(参照文本消息)
	 * @param  {string} 发送人用户名
	 * @param  {string|array} 接收人(参照文本消息)
	 * @param  {string} 文件名
	 * @param  {string} 文件 url
	 * @param  {string} 安全校验
	 * @param  {int} 文件大小
	 * @param  {object} 扩展信息
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.sendAudio = function(type, from, target, filename, fileUrl, secret, length, ext, callback) {

		return this.getToken(function() {

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
	/**
	 * @param  {string} 消息类型(参照文本消息)
	 * @param  {string} 发送人用户名
	 * @param  {string|array} 接收人(参照文本消息)
	 * @param  {string} 文件名
	 * @param  {string} 文件 url
	 * @param  {int} 文件大小
	 * @param  {string} 视频缩略图
	 * @param  {int} 视频缩略图大小
	 * @param  {string} 缩略图安全校验码
	 * @param  {string} 视频安全校验码
	 * @param  {object} 扩展信息
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.sendVedio = function(type, from, target, filename, fileUrl, fileLength, thumb, thumbFileLength, thumbSecret, secret, ext, callback) {
		return this.getToken(function() {

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
					length: fileLength,
					file_length: thumbFileLength,
					thumb_secret: thumbSecret,
					secret: secret
				},
				from: from,
				ext: ext,
			};

			this.post('/messages', data, callback);
		});
	};

	/**
	 * 发送透传消息
	 * @param  {string} 消息类型(参照文本消息)
	 * @param  {string} 发送人用户名
	 * @param  {string|array} 接收人(参照文本消息)
	 * @param  {string} 消息命令
	 * @param  {object} 扩展信息
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.sendCmd = function(type, from, target, action, ext, callback) {

		return this.getToken(function() {

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

	/*----------  群组  ----------*/

	/**
	 * 获取所有群组
	 * @param  {int} 数量
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getGroups = function(limit, callback) {

		return this.getToken(function() {
			this.get('/chatgroups?limit=' + limit, callback);
		});

	};

	/**
	 * 获取一个或多个群组的详情
	 * @param  {array} 群组 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getGroupDetail = function(groupIds, callback) {
		return this.getToken(function() {
			this.get('/chatgroups/' + groupIds, callback);
		});
	};

	/**
	 * 创建一个群组
	 * @param  {string} 群聊名称
	 * @param  {string} 群公告
	 * @param  {bool} 是否是公开群
	 * @param  {int} 群内最大成员数
	 * @param  {bool} 加入是否需要批准
	 * @param  {string} 创建人用户名
	 * @param  {array} 群成员
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.createGroup = function(groupName, desc, isPublic, maxUsers, approval, owner, members, callback) {

		return this.getToken(function() {

			var data = {
				groupname: groupName,
				desc: desc,
				public: isPublic,
				maxusers: maxUsers,
				approval: approval,
				owner: owner,
				members: members
			};

			this.post('/chatgroups', data, callback);

		});

	};

	/**
	 * 修改群组信息
	 * @param  {string} 群 ID
	 * @param  {string} 群名称
	 * @param  {string} 群公告
	 * @param  {int} 群内最大成员数
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.updateGroup = function(groupId, groupName, description, maxUsers, callback) {

		return this.getToken(function() {

			var data = {
				groupname: groupId,
				description: description,
				maxusers: maxUsers
			};

			this.put('/chatgroups/' + groupId, data, callback);
		});

	};

	/**
	 * 删除群组
	 * @param  {string} 群 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteGroup = function(groupId, callback) {
		return this.getToken(function() {
			this.del('/chatgroups/' + groupId, callback);
		});
	};

	/**
	 * 获取群组中成员
	 * @param  {string} 群 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getGroupUsers = function(groupId, callback) {
		return this.getToken(function() {
			this.get('/chatgroups/' + groupId + '/users', callback);
		});
	};

	/**
	 * 加入群
	 * @param {string} 群 ID
	 * @param {string} 被加入的成员用户名
	 * @param {Function}
	 */
	this.api.addGroupMember = function(groupId, username, callback) {
		return this.getToken(function() {
			this.post('/chatgroups/' + groupId + '/users/' + username, data, callback);
		});
	};

	/**
	 * 往群内批量加入成员
	 * @param {string} 群 ID
	 * @param {array} 要加入的成员
	 * @param {Function}
	 */
	this.api.addGroupMembers = function(groupId, users, callback) {
		return this.getToken(function() {

			var data = {
				usernames: users
			};

			this.post('/chatgroups/' + groupId + '/users', data, callback);
		});
	};

	/**
	 * 从群组中删除指定的成员
	 * @param  {string} 群 ID
	 * @param  {string} 被删除的成员用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteGroupMember = function(groupId, username, callback) {
		return this.getToken(function() {
			this.del('/chatgroups/' + groupId + '/users/' + username, callback);
		});
	};

	/**
	 * 获取用户参与的群组列表
	 * @param  {string} 用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getGroupsForUser = function(username, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/joined_chatgroups', callback);
		});
	};

	/**
	 * 转让群组
	 * @param  {string} 群 ID
	 * @param  {string} 接收人用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.changeGroupOwner = function(groupId, newOwner, callback) {

		return this.getToken(function() {
			var data = {
				newowner: newOwner,
			};

			this.put('/chatgroups/' + groupId, data, callback);
		});
	};

	/**
	 * 获取群组黑名单用户名列表
	 * @param  {string} 群 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getGroupBlackList = function(groupId, callback) {
		return this.getToken(function() {
			this.get('/chatgroups/' + groupId + '/blocks/users', callback);
		});
	};

	/**
	 * 将成员添加到群组黑名单
	 * @param {string} 群 ID
	 * @param {string} 被加入黑名单成员用户名
	 * @param {Function}
	 * @return {void}
	 */
	this.api.addGroupBlackMember = function(groupId, username, callback) {
		return this.getToken(function() {
			this.post('/chatgroups/' + groupId + '/blocks/users/' + username, data, callback);
		});
	};

	/**
	 * 将成员从群组黑名单中移除
	 * @param  {string}
	 * @param  {string}
	 * @param  {Function}
	 * @return {void}
	 */
	this.deleteGroupBlackMember = function(groupId, username, callback) {
		return this.getToken(function() {
			this.del('/chatgroups/' + groupId + '/blocks/users/' + username, callback);
		});
	};

	/*----------  下载文件  ----------*/

	/**
	 * 下载文件
	 * @param  {string}
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.downloadFile = function(uuid, callback) {

		return this.getToken(function() {
			this.get('/chatfiles/' + uuid, callback);
		});

	};

	/*----------  聊天记录  ----------*/


	//取聊天记录
	/*
	 ql: 查询条件，如：$ql= "select+*+where+time>1403143434443'" . $uid . "'+or+to='". $uid ."'+order+by+timestamp+desc&limit=" . $limit . $cursor;
	 cursor: 分页参数
	 limit: 条数，默认20
	 */

	/**
	 * 获取聊天记录
	 * @param  {string} 查询语句
	 * @param  {int} 数量
	 * @param  {int} 游标位置
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getChatRecord = function(ql, limit, cursor, callback) {
		return this.getToken(function() {
			this.get('/chatmessuperAgentges?ql=' + ql + '&limit=' + limit + '&cursor=' + cursor, callback);
		});
	};


	/*----------  聊天室  ----------*/

	/**
	 * 创建聊天室
	 * @param  {string} 聊天室名称
	 * @param  {string} 聊天室公告
	 * @param  {int} 最大成员数量
	 * @param  {string} 创建人用户名
	 * @param  {array} 成员列表
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.createChatRoom = function(name, description, maxUsers, owner, members, callback) {
		return this.getToken(function() {

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

	/**
	 * 修改聊天室信息
	 * @param  {string} 聊天室 ID
	 * @param  {string} 聊天室名称
	 * @param  {string} 聊天室公告
	 * @param  {int} 聊天室最大成员数量
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.updateChatRoom = function(chatRoomId, name, description, maxUsers, callback) {

		return this.getToken(function() {

			var data = {
				name: name,
				description: description,
				maxusers: maxusers,
			};

			this.put('/chatrooms/' + chatRoomId, data, callback);
		});

	};

	/**
	 * 删除聊天室
	 * @param  {string} 聊天室 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteChatRoom = function(chatRoomId, callback) {
		return this.getToken(function() {
			this.del('/chatrooms/' + chatRoomId, callback);
		});
	};

	/**
	 * 获取聊天室列表
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getChatRooms = function(callback) {
		return this.getToken(function() {
			this.get('/chatrooms', callback);
		});
	};

	/**
	 * 获取聊天室详情
	 * @param  {string} 聊天室 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getChatRoomDetail = function(chatRoomId, callback) {
		return this.getToken(function() {
			this.get('/chatrooms/' + chatRoomId, callback);
		});
	};

	/**
	 * 获取用户加入的聊天室列表
	 * @param  {string} 聊天室 ID
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.getChatRoomJoined = function(username, callback) {
		return this.getToken(function() {
			this.get('/users/' + username + '/joined_chatrooms', callback);
		});
	};

	/**
	 * 加入聊天室
	 * @param {string} 聊天室 ID
	 * @param {string} 被加入的成员用户名
	 * @param {Function}
	 * @return {void}
	 */
	this.api.addChatRoomMember = function(chatRoomId, username, callback) {
		return this.getToken(function() {
			this.post('/chatrooms/' + chatRoomId + '/users/' + username, data, callback);
		});
	};

	/**
	 * 将成员移出聊天室
	 * @param  {string} 聊天室 ID
	 * @param  {string} 被移出的成员用户名
	 * @param  {Function}
	 * @return {void}
	 */
	this.api.deleteChatRoomMember = function(chatRoomId, username, callback) {
		return this.getToken(function() {
			this.del('/chatrooms/' + chatRoomId + '/users/' + username, callback);
		});
	};

	return this;
};