# emchat

这是一个能用的环信通信云 nodejs SDK  


具体使用请参考 test.js 文件  
接口参考了官方 SDK [https://github.com/easemob/emchat-server-examples](https://github.com/easemob/emchat-server-examples)  

## 注意
1. 去除了 uploadFile 接口 (个人感觉用服务端直传文件是个很不好的习惯)
2. 接口大部分做了测试, 注释持续添加中
3. 默认使用启动进程内存管理 oAuth 授权返回的 token ,建议自己做一下 token 逻辑处理(譬如使用 redis 存储)  


## 反馈/交流

反馈可使用 issues 或 邮箱: imocat@qq.com  




