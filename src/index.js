"use strict";
const fs = require('fs');
const querystring = require('querystring');
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
        if (path instanceof Function) {
            cb = path; //未传path时,path默认值为""
            path = "";
        }
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

    /**
     * Get files
     * @param access_token
     * @param path
     * @param rev
     * @param cb
     */
    files({access_token, path='', rev = ''}={}, cb) {
        let param = {},
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
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
    saveFiles({access_token,path="",files,overwrite = "true",sha1 = "",size = "", parent_rev = ""}={}, cb) {
        let param = {
            access_token: access_token,
            overwrite: overwrite
        };
        if (sha1.length > 0) param["sha1"] = sha1;
        if (size.length > 0) param["size"] = size;
        if (parent_rev.length > 0) param["parent_rev"] = parent_rev;

        let queries = querystring.stringify(param);

        let url = this.CONTENT_SAFE_URL + 'files/' + this.root + "/" + path + "?" + queries;

        let formData = {
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
                return cb(new Error(`请求失败: ${response.error}`))
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
    updateFiles({access_token,path,files,overwrite = "true",sha1 = "",size = "", parent_rev = ""}={}, cb) {

        let param = {
            "access_token": access_token,
            "overwrite": overwrite
        };
        if (sha1.length > 0)  param["sha1"] = sha1;
        if (size.length > 0) param["size"] = size;
        if (parent_rev.length > 0) param["parent_rev"] = parent_rev;

        let host = this.UPLOAD_HOST,
            api = '/2/files_put/' + this.root + "/" + path + "?" + querystring.stringify(param);
        let url = 'http://' + host + api;

        let formData = {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

}

exports.OAuth2 = OAuth2;
exports.Client = Client;