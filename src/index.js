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
     * @param display: default/mobile/popup
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
     * @param grant_type  authorization_code/refresh_token
     * @param code
     * @param refresh_token
     * @param cb 回调函数
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
     * @param root  sandbox/basic
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
     * Get metadata 获取文件和目录信息
     * @param access_token
     * @param path
     * @param cb
     */
    metadata({access_token, path=''}={}, cb) {
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
    delta({access_token, cursor=''}={}, cb) {
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
     * Get revisions 获得文件的历史版本
     * @param access_token
     * @param path
     * @param cb
     */
    revisions({access_token,path}={}, cb) {
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

    /**
     * Shares 描述创建并返回一个此分享文件的链接
     * @param access_token
     * @param path
     * @param cancel
     * @param cb
     */
    shares({access_token,path,cancel = "false"}={}, cb) {
        let param = {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Restore 还原文件到某个版本
     * @param access_token
     * @param path
     * @param rev
     * @param cb
     */
    restore({access_token,path,rev = ""}={}, cb) {
        let param = {
            "access_token": access_token
        };
        let url = this.API_URL + 'restore/' + this.root + "/" + path + '?' + querystring.stringify(param);
        request.post({
            url: url,
            form: {"rev": rev}
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
     * Search 返回符合搜索的所有文件和目录信息。搜索权限于指定的目录路径及其下级目录
     * @param access_token
     * @param path
     * @param query
     * @param file_limit
     * @param include_deleted
     * @param cb
     */
    search({access_token,path="",query,file_limit = 1000,include_deleted = "false"}={}, cb) {

        let url = this.API_URL + 'search/' + this.root + "/" + path;

        let param = {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })

    }

    /**
     * Get copy_ref 创建一个可以转存此分享文件的标识字符串
     * @param access_token
     * @param path
     * @param cb
     */
    copyRef({access_token,path}={}, cb) {
        let url = this.API_URL + 'copy_ref/' + this.root + "/" + path,
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Get media 获取文件下载和播放的链接
     * @param access_token
     * @param path
     * @param cb
     */
    media({access_token,path}={}, cb) {
        let url = this.API_URL + 'media/' + this.root + "/" + path,
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Get thumbnails 获取图片文件的缩略图
     * @param access_token
     * @param path
     * @param size s:60x60,m:100x100,l:640x480,xl:1027x768
     * @param cb
     */
    thumbnails({access_token,path,size}={}, cb) {
        let url = this.API_URL + 'thumbnails/' + this.root + "/" + path,
            param =
            {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Copy Files 复制一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。
     * @param access_token
     * @param to_path
     * @param from_path
     * @param from_copy_ref
     * @param cb
     */
    copyFiles({access_token,to_path,from_path = "",from_copy_ref = ""}={}, cb) {
        let url = this.API_URL + 'fileops/copy',
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Delete files 删除一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。
     * @param access_token
     * @param path
     * @param cb
     */
    delFiles({access_token, path}={}, cb) {
        let url = this.API_URL + 'fileops/delete',
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Move files 移动一个对象,当前目录下的目录和文件总数不超过 5000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作
     * @param access_token
     * @param from_path
     * @param to_path
     * @param cb
     */
    moveFiles({access_token,from_path = "",to_path = ""}={}, cb) {

        let param = {
                "access_token": access_token
            },
            data = {
                "root": this.root
            },
            url = this.API_URL + 'fileops/move?' + querystring.stringify(param);
        if (from_path.length > 0)data['from_path'] = from_path;
        if (to_path.length > 0)data['to_path'] = to_path;

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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Create folder 创建目录. 一个目录下最多允许创建 1000 个子目录。
     * @param access_token
     * @param path
     * @param cb
     */
    createFolder({access_token,path}={}, cb) {
        let param = {
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }

    /**
     * Get share media 获取分享文件下载和播放的链接
     * @param access_token
     * @param from_copy_ref 拷贝引用
     * @param cb 回调函数
     */
    shareMedia({access_token,from_copy_ref}={}, cb) {
        let url = this.API_URL + 'shareops/media',
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
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
    shareSearch({access_token, query='', type='', sort_order='sharetime',page='1', page_size='20'}={}, cb) {
        let url = this.API_URL + 'share/search',
            param = {
                "access_token": access_token
            };
        if (query.length > 0)param['query'] = query;
        if (type.length > 0)param['type'] = type;
        if (sort_order.length > 0)param['sort_order'] = sort_order;
        if (page.length > 0)param['page'] = page;
        if (page_size.length > 0)param['page_size'] = page_size;
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
                return cb(new Error(`请求失败: ${response.error}`))
            } else {
                return cb(null, response);
            }
        })
    }
}

exports.OAuth2 = OAuth2;
exports.Client = Client;