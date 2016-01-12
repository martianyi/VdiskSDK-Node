"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var querystring = require("querystring");
var request = require('request');

/**
 * oauth2 client
 */

var OAuth2 = function () {

    /**
     * Constructor
     * @param app_key
     * @param app_secret
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
     * @param response_type
     * @param display: default|mobile|popup
     * @param state
     * @returns {string}
     */

    _createClass(OAuth2, [{
        key: "authorize",
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
         * @param grant_type = authorization_code|refresh_token
         * @param code
         * @param refresh_token
         * @param cb
         */

    }, {
        key: "accessToken",
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
                    return cb(new Error("请求失败: (" + response.code + ") " + response.msg));
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
     * @param root = sandbox | basic
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
     * @param access_token
     * @param cb
     */

    _createClass(Client, [{
        key: "accountInfo",
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
                    return cb(new Error("请求失败: (" + response.code + ") " + response.msg));
                } else {
                    return cb(null, response);
                }
            });
        }

        /**
         * Meta data
         * @param access_token
         * @param path
         * @param cb
         */

    }, {
        key: "metadata",
        value: function metadata(access_token, path, cb) {
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
                    return cb(new Error("请求失败: " + response.error));
                } else {
                    return cb(null, response);
                }
            });
        }
    }, {
        key: "delta",
        value: function delta(access_token, cursor, cb) {
            if (cursor instanceof Function) {
                cb = cursor; //未传cursor时,cursor默认值为""
                cursor = "";
            }
            var param = {},
                url = this.API_URL + 'delta/' + this.root;
            if (cursor.length > 0) {
                param['cursor'] = cursor;
                url += '?' + querystring.stringify(param);
            }
            console.log(url);
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
                    return cb(new Error("请求失败: " + response.error));
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
