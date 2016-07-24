

var orgName = 'easemob-playground';
var appName = 'test1';
var clientId = 'YXA6wDs-MARqEeSO0VcBzaqg5A';
var clientSecret = 'YXA6JOMWlLap_YbI_ucz77j-4-mI0JA';

// 企业管理员账号: zhangjianguo
// 企业管理员密码: zhangjianguo


var emchat = require('./emchat')(orgName, appName, clientId, clientSecret);

var username = 'test_' + Math.random();
var password = '123123';

// 注册用户
emchat.api.createUser(username, password, function(err, res) {

	if (!err) {

		// 创建群组
		emchat.api.createGroup('gp' + username, 'desc', true, 20, true, username, [username], function(err, res) {

			if (!err) {
				// 获取群组
				emchat.api.getGroups(10, function(err, res) {
					if (!err) {
						console.log('获取群组', res);
					} else {
						console.log('获取群组:error', err);
					}
				});
			} else {
				console.log('创建群组:error', err);
			}

		});

		// 创建聊天室
		emchat.api.createChatRoom('room' + username, 'xxx', 5000, username, [username], function(err, res) {
			if (!err) {

				var chatRoomId = res.data.id;
				var text = 'HELLO, WORLD!';

				// 发送消息
				emchat.api.sendText('chatrooms', username, chatRoomId, text, {}, function(err, res) {
					if (!err) {
						console.log('发送消息', res);
					} else {
						console.log('发送消息:error', err);
					}
				});

				// 获取聊天室
				emchat.api.getChatRooms(function(err, res) {
					if (!err) {
						console.log('获取聊天室', res);
					} else {
						console.log('获取聊天室:error', err);
					}
				});
			} else {
				console.log('创建聊天室:error', err);
			}
		});


	} else {
		console.log('注册用户:error', err);
	}

});