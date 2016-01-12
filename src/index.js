"use strict";
const querystring = require("querystring");
const request = require('request');

/**
 * oauth2 client
 */
class OAuth2 {

    /**
     * Constructor
     * @param app_key
     * @param app_secret
     * @param call_back_url
     */
    constructor(app_key, app_secret, call_back_url) {
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
    authorize({response_type = "code", display = "default", state = ""}={}) {
        let data = {
            "client_id": this.app_key,
            "redirect_uri": this.call_back_url,
            "response_type": response_type,
            "display": display
        };
        if (state.length > 0) {
            data["state"] = state
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
    accessToken({grant_type = "authorization_code", code = "", refresh_token = ""}={}, cb) {
        let data = {
            "client_id": this.app_key,
            "client_secret": this.app_secret,
            "grant_type": grant_type
        };
        if (grant_type === "authorization_code") {
            data["code"] = code;
            data["redirect_uri"] = this.call_back_url
        }
        else if (grant_type == "refresh_token") {
            data["refresh_token"] = refresh_token
        }
        const url = this.ACCESS_TOKEN_URL;
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
                return cb(new Error(`请求失败: (${response.code}) ${response.msg}`))
            } else {
                return cb(null, response);
            }
        })
    }
}

/**
 * vdisk client
 */
class Client {

    /**
     * Constructor
     * @param root = sandbox | basic
     */
    constructor(root = "sandbox") {
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
    accountInfo(access_token, cb) {
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
                return cb(new Error(`请求失败: (${response.code}) ${response.msg}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Meta data
     * @param access_token
     * @param path
     * @param cb
     */
    metadata(access_token, path, cb) {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Delta
     * @param access_token
     * @param cursor
     * @param cb
     */
    delta(access_token, cursor, cb) {
        if (cursor instanceof Function) {
            cb = cursor; //未传cursor时,cursor默认值为""
            cursor = "";
        }
        let param = {},
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

}

exports.OAuth2 = OAuth2;
exports.Client = Client;