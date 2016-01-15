"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var querystring = require('querystring');
var request = require('request');

/**
 * oauth2 client
 */

var OAuth2 = function () {

    /**
     * Constructor
     * @param app_key 申请应用时分配的AppKey
     * @param app_secret 申请应用时分配的AppSecret
     * @param call_back_url
     */

    function OAuth2(app_key, app_secret, call_back_url) {
        _classCallCheck(this, OAuth2);

        this.version = '0.1.0';
        this.ACCESS_TOKEN_URL = "https://auth.sina.com.cn/oauth2/access_token";
        this.AUTHORIZE_URL = "https://auth.sina.com.cn/oauth2/authorize";
        this.app_key = app_key;
        this.app_secret = app_secret;
        this.call_back_url = call_back_url;
    }

    /**
     * Get the authorization url
     * @param response_type 返回类型，支持code、token，默认值为code
     * @param display 授权页面的终端类型 default/mobile/popup
     * @param state 用于保持请求和回调的状态，在回调时，会在Query Parameter中回传该参数
     * @returns {string}
     */

    _createClass(OAuth2, [{
        key: 'authorize',
        value: function authorize() {
            var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var _ref$response_type = _ref.response_type;
            var response_type = _ref$response_type === undefined ? "code" : _ref$response_type;
            var _ref$display = _ref.display;
            var display = _ref$display === undefined ? "default" : _ref$display;
            var _ref$state = _ref.state;
            var state = _ref$state === undefined ? "" : _ref$state;

            var data = {
                "client_id": this.app_key,
                "redirect_uri": this.call_back_url,
                "response_type": response_type,
                "display": display
            };
            if (state.length > 0) {
                data["state"] = state;
            }
            return this.AUTHORIZE_URL + "?" + querystring.stringify(data);
        }

        /**
         * Get access token
         * @param grant_type  请求的类型 authorization_code/refresh_token
         * @param code grant_type为authorization_code时传入
         * @param refresh_token grant_type为refresh_token时传入
         * @param cb 回调函数，接收error和response两个参数
         */

    }, {
        key: 'accessToken',
        value: function accessToken() {
            var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var _ref2$grant_type = _ref2.grant_type;
            var grant_type = _ref2$grant_type === undefined ? "authorization_code" : _ref2$grant_type;
            var _ref2$code = _ref2.code;
            var code = _ref2$code === undefined ? "" : _ref2$code;
            var _ref2$refresh_token = _ref2.refresh_token;
            var refresh_token = _ref2$refresh_token === undefined ? "" : _ref2$refresh_token;
            var cb = arguments[1];

            var data = {
                "client_id": this.app_key,
                "client_secret": this.app_secret,
                "grant_type": grant_type
            };
            if (grant_type === "authorization_code") {
                data["code"] = code;
                data["redirect_uri"] = this.call_back_url;
            } else if (grant_type == "refresh_token") {
                data["refresh_token"] = refresh_token;
            }
            var url = this.ACCESS_TOKEN_URL;
            request.post({
                url: url,
                form: data
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.code) {
                    return cb(new Error('请求失败: (' + response.code + ') ' + response.msg));
                } else {
                    return cb(null, response);
                }
            });
        }
    }]);

    return OAuth2;
}();

/**
 * vdisk client
 */

var Client = function () {

    /**
     * Constructor
     * @param root  sandbox/basic
     */

    function Client() {
        var root = arguments.length <= 0 || arguments[0] === undefined ? "sandbox" : arguments[0];

        _classCallCheck(this, Client);

        this.version = '0.1.0';
        this.API_URL = 'https://api.weipan.cn/2/';
        this.WEIBO_URL = 'https://api.weipan.cn/weibo/';
        this.UPLOAD_HOST = 'upload-vdisk.sina.com.cn';
        this.CONTENT_SAFE_URL = 'https://' + this.UPLOAD_HOST + '/2/';
        this.root = root;
    }

    /**
     * Get account info
     * @param access_token 接口获取授权后的access token
     * @param cb 回调函数，接收error和response两个参数
     */

    _createClass(Client, [{
        key: 'accountInfo',
        value: function accountInfo(access_token, cb) {
            request({
                url: this.API_URL + 'account/info',
                headers: {
                    'Authorization': 'OAuth2 ' + access_token
                }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.code) {
                    return cb(new Error('请求失败: (' + response.code + ') ' + response.msg));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get metadata 获取文件和目录信息
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'metadata',
        value: function metadata() {
            var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref3.access_token;
            var _ref3$path = _ref3.path;
            var path = _ref3$path === undefined ? '' : _ref3$path;
            var cb = arguments[1];

            request({
                url: this.API_URL + 'metadata/' + this.root + '/' + path,
                headers: {
                    'Authorization': 'OAuth2 ' + access_token
                }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Delta
         * @param access_token
         * @param cursor
         * @param cb
         */

    }, {
        key: 'delta',
        value: function delta() {
            var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref4.access_token;
            var _ref4$cursor = _ref4.cursor;
            var cursor = _ref4$cursor === undefined ? '' : _ref4$cursor;
            var cb = arguments[1];

            var param = {},
                url = this.API_URL + 'delta/' + this.root;
            if (cursor.length > 0) {
                param['cursor'] = cursor;
                url += '?' + querystring.stringify(param);
            }
            request.post({
                url: url,
                headers: {
                    'Authorization': 'OAuth2 ' + access_token
                }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get files
         * @param access_token
         * @param path
         * @param rev
         * @param cb
         */

    }, {
        key: 'files',
        value: function files() {
            var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref5.access_token;
            var _ref5$path = _ref5.path;
            var path = _ref5$path === undefined ? '' : _ref5$path;
            var _ref5$rev = _ref5.rev;
            var rev = _ref5$rev === undefined ? '' : _ref5$rev;
            var cb = arguments[1];

            var param = {},
                url = this.API_URL + 'files/' + this.root + "/" + path;
            if (rev.length > 0) {
                param['rev'] = rev;
                url += '?' + querystring.stringify(param);
            }
            request({
                url: url,
                headers: {
                    'Authorization': 'OAuth2 ' + access_token
                }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get revisions 获得文件的历史版本
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'revisions',
        value: function revisions() {
            var _ref6 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref6.access_token;
            var path = _ref6.path;
            var cb = arguments[1];

            request({
                url: this.API_URL + 'revisions/' + this.root + "/" + path,
                headers: {
                    'Authorization': 'OAuth2 ' + access_token
                }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Save files
         * @param access_token
         * @param path
         * @param files
         * @param overwrite
         * @param sha1
         * @param size
         * @param parent_rev
         * @param cb
         */

    }, {
        key: 'saveFiles',
        value: function saveFiles() {
            var _ref7 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref7.access_token;
            var _ref7$path = _ref7.path;
            var path = _ref7$path === undefined ? "" : _ref7$path;
            var files = _ref7.files;
            var _ref7$overwrite = _ref7.overwrite;
            var overwrite = _ref7$overwrite === undefined ? "true" : _ref7$overwrite;
            var _ref7$sha = _ref7.sha1;
            var sha1 = _ref7$sha === undefined ? "" : _ref7$sha;
            var _ref7$size = _ref7.size;
            var size = _ref7$size === undefined ? "" : _ref7$size;
            var _ref7$parent_rev = _ref7.parent_rev;
            var parent_rev = _ref7$parent_rev === undefined ? "" : _ref7$parent_rev;
            var cb = arguments[1];

            var param = {
                access_token: access_token,
                overwrite: overwrite
            };
            if (sha1.length > 0) param["sha1"] = sha1;
            if (size.length > 0) param["size"] = size;
            if (parent_rev.length > 0) param["parent_rev"] = parent_rev;

            var queries = querystring.stringify(param);

            var url = this.CONTENT_SAFE_URL + 'files/' + this.root + "/" + path + "?" + queries;

            var formData = {
                file: fs.createReadStream(files)
            };

            request.post({
                rejectUnauthorized: false,
                url: url,
                formData: formData
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Update files
         * @param access_token
         * @param path
         * @param files
         * @param overwrite
         * @param sha1
         * @param size
         * @param parent_rev
         * @param cb
         */

    }, {
        key: 'updateFiles',
        value: function updateFiles() {
            var _ref8 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref8.access_token;
            var path = _ref8.path;
            var files = _ref8.files;
            var _ref8$overwrite = _ref8.overwrite;
            var overwrite = _ref8$overwrite === undefined ? "true" : _ref8$overwrite;
            var _ref8$sha = _ref8.sha1;
            var sha1 = _ref8$sha === undefined ? "" : _ref8$sha;
            var _ref8$size = _ref8.size;
            var size = _ref8$size === undefined ? "" : _ref8$size;
            var _ref8$parent_rev = _ref8.parent_rev;
            var parent_rev = _ref8$parent_rev === undefined ? "" : _ref8$parent_rev;
            var cb = arguments[1];

            var param = {
                "access_token": access_token,
                "overwrite": overwrite
            };
            if (sha1.length > 0) param["sha1"] = sha1;
            if (size.length > 0) param["size"] = size;
            if (parent_rev.length > 0) param["parent_rev"] = parent_rev;

            var host = this.UPLOAD_HOST,
                api = '/2/files_put/' + this.root + "/" + path + "?" + querystring.stringify(param);
            var url = 'http://' + host + api;

            var formData = {
                file: fs.createReadStream(files)
            };

            request.put({
                rejectUnauthorized: false,
                url: url,
                formData: formData
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Shares 描述创建并返回一个此分享文件的链接
         * @param access_token
         * @param path
         * @param cancel
         * @param cb
         */

    }, {
        key: 'shares',
        value: function shares() {
            var _ref9 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref9.access_token;
            var path = _ref9.path;
            var _ref9$cancel = _ref9.cancel;
            var cancel = _ref9$cancel === undefined ? "false" : _ref9$cancel;
            var cb = arguments[1];

            var param = {
                "access_token": access_token,
                "cancel": cancel
            },
                url = this.API_URL + 'shares/' + this.root + "/" + path + '?' + querystring.stringify(param);

            request.post({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Restore 还原文件到某个版本
         * @param access_token
         * @param path
         * @param rev
         * @param cb
         */

    }, {
        key: 'restore',
        value: function restore() {
            var _ref10 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref10.access_token;
            var path = _ref10.path;
            var _ref10$rev = _ref10.rev;
            var rev = _ref10$rev === undefined ? "" : _ref10$rev;
            var cb = arguments[1];

            var param = {
                "access_token": access_token
            };
            var url = this.API_URL + 'restore/' + this.root + "/" + path + '?' + querystring.stringify(param);
            request.post({
                url: url,
                form: { "rev": rev }
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Search 返回符合搜索的所有文件和目录信息。搜索权限于指定的目录路径及其下级目录
         * @param access_token
         * @param path
         * @param query
         * @param file_limit
         * @param include_deleted
         * @param cb
         */

    }, {
        key: 'search',
        value: function search() {
            var _ref11 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref11.access_token;
            var _ref11$path = _ref11.path;
            var path = _ref11$path === undefined ? "" : _ref11$path;
            var query = _ref11.query;
            var _ref11$file_limit = _ref11.file_limit;
            var file_limit = _ref11$file_limit === undefined ? 1000 : _ref11$file_limit;
            var _ref11$include_delete = _ref11.include_deleted;
            var include_deleted = _ref11$include_delete === undefined ? "false" : _ref11$include_delete;
            var cb = arguments[1];

            var url = this.API_URL + 'search/' + this.root + "/" + path;

            var param = {
                "access_token": access_token,
                "query": query,
                "file_limit": file_limit,
                "include_deleted": include_deleted
            };

            url += '?' + querystring.stringify(param);

            request({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get copy_ref 创建一个可以转存此分享文件的标识字符串
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'copyRef',
        value: function copyRef() {
            var _ref12 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref12.access_token;
            var path = _ref12.path;
            var cb = arguments[1];

            var url = this.API_URL + 'copy_ref/' + this.root + "/" + path,
                param = {
                "access_token": access_token
            };
            url += '?' + querystring.stringify(param);

            request.post({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get media 获取文件下载和播放的链接
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'media',
        value: function media() {
            var _ref13 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref13.access_token;
            var path = _ref13.path;
            var cb = arguments[1];

            var url = this.API_URL + 'media/' + this.root + "/" + path,
                param = {
                "access_token": access_token
            };
            url += '?' + querystring.stringify(param);
            request({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get thumbnails 获取图片文件的缩略图
         * @param access_token
         * @param path
         * @param size s:60x60,m:100x100,l:640x480,xl:1027x768
         * @param cb
         */

    }, {
        key: 'thumbnails',
        value: function thumbnails() {
            var _ref14 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref14.access_token;
            var path = _ref14.path;
            var size = _ref14.size;
            var cb = arguments[1];

            var url = this.API_URL + 'thumbnails/' + this.root + "/" + path,
                param = {
                "access_token": access_token,
                "size": size
            };
            url += '?' + querystring.stringify(param);
            request({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Copy Files 复制一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。
         * @param access_token
         * @param to_path
         * @param from_path
         * @param from_copy_ref
         * @param cb
         */

    }, {
        key: 'copyFiles',
        value: function copyFiles() {
            var _ref15 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref15.access_token;
            var to_path = _ref15.to_path;
            var _ref15$from_path = _ref15.from_path;
            var from_path = _ref15$from_path === undefined ? "" : _ref15$from_path;
            var _ref15$from_copy_ref = _ref15.from_copy_ref;
            var from_copy_ref = _ref15$from_copy_ref === undefined ? "" : _ref15$from_copy_ref;
            var cb = arguments[1];

            var url = this.API_URL + 'fileops/copy',
                param = {
                "access_token": access_token
            },
                data = {
                "root": this.root,
                "to_path": to_path
            };
            if (from_path.length > 0) data['from_path'] = from_path;
            if (from_copy_ref.length > 0) data['from_copy_ref'] = from_copy_ref;
            url += '?' + querystring.stringify(param);

            request.post({
                url: url,
                form: data
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Delete files 删除一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'delFiles',
        value: function delFiles() {
            var _ref16 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref16.access_token;
            var path = _ref16.path;
            var cb = arguments[1];

            var url = this.API_URL + 'fileops/delete',
                param = {
                "access_token": access_token
            },
                data = {
                "root": this.root,
                "path": path
            };
            url += '?' + querystring.stringify(param);

            request.post({
                url: url,
                form: data
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Move files 移动一个对象,当前目录下的目录和文件总数不超过 5000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作
         * @param access_token
         * @param from_path
         * @param to_path
         * @param cb
         */

    }, {
        key: 'moveFiles',
        value: function moveFiles() {
            var _ref17 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref17.access_token;
            var _ref17$from_path = _ref17.from_path;
            var from_path = _ref17$from_path === undefined ? "" : _ref17$from_path;
            var _ref17$to_path = _ref17.to_path;
            var to_path = _ref17$to_path === undefined ? "" : _ref17$to_path;
            var cb = arguments[1];

            var param = {
                "access_token": access_token
            },
                data = {
                "root": this.root
            },
                url = this.API_URL + 'fileops/move?' + querystring.stringify(param);
            if (from_path.length > 0) data['from_path'] = from_path;
            if (to_path.length > 0) data['to_path'] = to_path;

            request.post({
                url: url,
                form: data
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Create folder 创建目录. 一个目录下最多允许创建 1000 个子目录。
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: 'createFolder',
        value: function createFolder() {
            var _ref18 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref18.access_token;
            var path = _ref18.path;
            var cb = arguments[1];

            var param = {
                "access_token": access_token
            },
                data = {
                "root": this.root,
                "path": path
            },
                url = this.API_URL + 'fileops/create_folder?' + querystring.stringify(param);
            request.post({
                url: url,
                form: data
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Get share media 获取分享文件下载和播放的链接
         * @param access_token
         * @param from_copy_ref 拷贝引用
         * @param cb 回调函数
         */

    }, {
        key: 'shareMedia',
        value: function shareMedia() {
            var _ref19 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref19.access_token;
            var from_copy_ref = _ref19.from_copy_ref;
            var cb = arguments[1];

            var url = this.API_URL + 'shareops/media',
                param = {
                "access_token": access_token,
                "from_copy_ref": from_copy_ref
            };
            url += '?' + querystring.stringify(param);
            request({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Share search 搜索分享的文件
         * @param access_token
         * @param query 搜索关键词,可以传多个值，以\|分隔。如query= txt\|pdf\|rar；按组查询时，可选doc,img,video,audio,else中一种
         * @param type 搜索类型，1：全文件检索，2：按名称3：按标题，4：按描述5：按文件(夹)类型，6：按后缀，7：按组查询。 可以传多个type，如2:5:6，此时query值也以:分隔，表示各个type对应的query值，例如：query=web:doc并且type=3:7就表示查询分组是文档的并且标题中有关键字web的文件。
         * @param sort_order 排序字段,可以传多个，可用的值为：sharetime(分享时间),price(价格),degree(星级),count_download(下载量),bytes(大小)，可以传多个，以:分隔
         * @param page 当前页数（取值范围1-40）,默认1
         * @param page_size 每页大小（取值范围1-9999），默认20
         * @param cb 回调函数
         */

    }, {
        key: 'shareSearch',
        value: function shareSearch() {
            var _ref20 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var access_token = _ref20.access_token;
            var _ref20$query = _ref20.query;
            var query = _ref20$query === undefined ? '' : _ref20$query;
            var _ref20$type = _ref20.type;
            var type = _ref20$type === undefined ? '' : _ref20$type;
            var _ref20$sort_order = _ref20.sort_order;
            var sort_order = _ref20$sort_order === undefined ? 'sharetime' : _ref20$sort_order;
            var _ref20$page = _ref20.page;
            var page = _ref20$page === undefined ? '1' : _ref20$page;
            var _ref20$page_size = _ref20.page_size;
            var page_size = _ref20$page_size === undefined ? '20' : _ref20$page_size;
            var cb = arguments[1];

            var url = this.API_URL + 'share/search',
                param = {
                "access_token": access_token
            };
            if (query.length > 0) param['query'] = query;
            if (type.length > 0) param['type'] = type;
            if (sort_order.length > 0) param['sort_order'] = sort_order;
            if (page.length > 0) param['page'] = page;
            if (page_size.length > 0) param['page_size'] = page_size;
            url += '?' + querystring.stringify(param);
            request({
                url: url
            }, function (err, resp, body) {
                if (err) return cb(new Error('请求失败: ' + err));
                // handle server errors
                if (resp.statusCode >= 500 && resp.statusCode <= 599) {
                    return cb(new Error('服务器内部错误: (' + resp.statusCode + ') ' + body));
                }
                var response = JSON.parse(body);
                if (response.error_code) {
                    return cb(new Error('请求失败: ' + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }
    }]);

    return Client;
}();

exports.OAuth2 = OAuth2;
exports.Client = Client;
//# sourceMappingURL=index.js.map
