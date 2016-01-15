# Node SDK For Vdisk

## Vdisk Documentation

http://vdisk.weibo.com/developers/index.php?module=api&action=apiinfo

## Usage

### Install 安装

`npm install vdisksdk-node --save`

### OAuth2 授权接口封装

```javascript
var OAuth2 = require("vdisksdk-node").OAuth2;
var oauth = new OAuth2(WEIPAN_APPKEY,WEIPAN_APPSECRET,WEIPAN_CALLBACK)
```

Get the authorization url

```javascript
var url = oauth.authorize()
```

Get access token
```javascript
oauth.accessToken({code:"b0841e108f70acc530aefeee7d0daf14"},function(err, resp){
    if(err) throw(err);
    console.log(resp);
})
```

Get refresh token
```javascript
oauth.accessToken({grant_type:"refresh_token",refresh_token: "347ee06666gE5HW3madls3FeZm7e0141"},function(err, resp){
    if(err){
        throw(err)
    }
    console.log(resp);
    done();
})
```

### Client 微盘接口封装

```javascript
var Client = require("../index").Client;
var client = new Client();
```

Get account info
```javascript
client.accountInfo(accessToken, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

Get metadata 获取文件和目录信息
```javascript
client.metadata({access_token: accessToken}, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

delta
```javascript
client.delta({access_token: accessToken}, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

files
```javascript
client.files({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

revisions 获得文件的历史版本
```javascript
client.revisions({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

Save files
```javascript
client.saveFiles({
    access_token: accessToken,
    path: 'test/test.txt',
    files: __dirname + '/file.txt'
}, function (err, resp) {
    if (err) {
        throw(err)
    }
    console.log(resp);
})
```

## API

### Classes

<dl>
<dt><a href="#OAuth2">OAuth2</a></dt>
<dd><p>oauth2 client</p>
</dd>
<dt><a href="#Client">Client</a></dt>
<dd><p>vdisk client</p>
</dd>
</dl>

<a name="OAuth2"></a>
### OAuth2
oauth2 client

**Kind**: global class  

* [OAuth2](#OAuth2)
    * [new OAuth2(app_key, app_secret, call_back_url)](#new_OAuth2_new)
    * [.authorize(response_type, display, state)](#OAuth2+authorize) ⇒ <code>string</code>
    * [.accessToken(grant_type, code, refresh_token, cb)](#OAuth2+accessToken)

<a name="new_OAuth2_new"></a>
#### new OAuth2(app_key, app_secret, call_back_url)
Constructor


| Param | Description |
| --- | --- |
| app_key | 申请应用时分配的AppKey |
| app_secret | 申请应用时分配的AppSecret |
| call_back_url |  |

<a name="OAuth2+authorize"></a>
#### oAuth2.authorize(response_type, display, state) ⇒ <code>string</code>
Get the authorization url

**Kind**: instance method of <code>[OAuth2](#OAuth2)</code>  

| Param | Description |
| --- | --- |
| response_type | 返回类型，支持code、token，默认值为code |
| display | 授权页面的终端类型 default/mobile/popup |
| state | 用于保持请求和回调的状态，在回调时，会在Query Parameter中回传该参数 |

<a name="OAuth2+accessToken"></a>
#### oAuth2.accessToken(grant_type, code, refresh_token, cb)
Get access token

**Kind**: instance method of <code>[OAuth2](#OAuth2)</code>  

| Param | Description |
| --- | --- |
| grant_type | 请求的类型 authorization_code/refresh_token |
| code | grant_type为authorization_code时传入 |
| refresh_token | grant_type为refresh_token时传入 |
| cb | 回调函数，接收error和response两个参数 |

<a name="Client"></a>
### Client
vdisk client

**Kind**: global class  

* [Client](#Client)
    * [new Client(root)](#new_Client_new)
    * [.accountInfo(access_token, cb)](#Client+accountInfo)
    * [.metadata(access_token, path, cb)](#Client+metadata)
    * [.delta(access_token, cursor, cb)](#Client+delta)
    * [.files(access_token, path, rev, cb)](#Client+files)
    * [.revisions(access_token, path, cb)](#Client+revisions)
    * [.saveFiles(access_token, path, files, overwrite, sha1, size, parent_rev, cb)](#Client+saveFiles)
    * [.updateFiles(access_token, path, files, overwrite, sha1, size, parent_rev, cb)](#Client+updateFiles)
    * [.shares(access_token, path, cancel, cb)](#Client+shares)
    * [.restore(access_token, path, rev, cb)](#Client+restore)
    * [.search(access_token, path, query, file_limit, include_deleted, cb)](#Client+search)
    * [.copyRef(access_token, path, cb)](#Client+copyRef)
    * [.media(access_token, path, cb)](#Client+media)
    * [.thumbnails(access_token, path, size, cb)](#Client+thumbnails)
    * [.copyFiles(access_token, to_path, from_path, from_copy_ref, cb)](#Client+copyFiles)
    * [.delFiles(access_token, path, cb)](#Client+delFiles)
    * [.moveFiles(access_token, from_path, to_path, cb)](#Client+moveFiles)
    * [.createFolder(access_token, path, cb)](#Client+createFolder)
    * [.shareMedia(access_token, from_copy_ref, cb)](#Client+shareMedia)
    * [.shareSearch(access_token, query, type, sort_order, page, page_size, cb)](#Client+shareSearch)

<a name="new_Client_new"></a>
#### new Client(root)
Constructor


| Param | Description |
| --- | --- |
| root | sandbox/basic |

<a name="Client+accountInfo"></a>
#### client.accountInfo(access_token, cb)
Get account info

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Description |
| --- | --- |
| access_token | 接口获取授权后的access token |
| cb | 回调函数，接收error和response两个参数 |

<a name="Client+metadata"></a>
#### client.metadata(access_token, path, cb)
Get metadata 获取文件和目录信息

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+delta"></a>
#### client.delta(access_token, cursor, cb)
Delta

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| cursor | 
| cb | 

<a name="Client+files"></a>
#### client.files(access_token, path, rev, cb)
Get files

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| rev | 
| cb | 

<a name="Client+revisions"></a>
#### client.revisions(access_token, path, cb)
Get revisions 获得文件的历史版本

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+saveFiles"></a>
#### client.saveFiles(access_token, path, files, overwrite, sha1, size, parent_rev, cb)
Save files

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| files | 
| overwrite | 
| sha1 | 
| size | 
| parent_rev | 
| cb | 

<a name="Client+updateFiles"></a>
#### client.updateFiles(access_token, path, files, overwrite, sha1, size, parent_rev, cb)
Update files

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| files | 
| overwrite | 
| sha1 | 
| size | 
| parent_rev | 
| cb | 

<a name="Client+shares"></a>
#### client.shares(access_token, path, cancel, cb)
Shares 描述创建并返回一个此分享文件的链接

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cancel | 
| cb | 

<a name="Client+restore"></a>
#### client.restore(access_token, path, rev, cb)
Restore 还原文件到某个版本

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| rev | 
| cb | 

<a name="Client+search"></a>
#### client.search(access_token, path, query, file_limit, include_deleted, cb)
Search 返回符合搜索的所有文件和目录信息。搜索权限于指定的目录路径及其下级目录

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| query | 
| file_limit | 
| include_deleted | 
| cb | 

<a name="Client+copyRef"></a>
#### client.copyRef(access_token, path, cb)
Get copy_ref 创建一个可以转存此分享文件的标识字符串

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+media"></a>
#### client.media(access_token, path, cb)
Get media 获取文件下载和播放的链接

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+thumbnails"></a>
#### client.thumbnails(access_token, path, size, cb)
Get thumbnails 获取图片文件的缩略图

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Description |
| --- | --- |
| access_token |  |
| path |  |
| size | s:60x60,m:100x100,l:640x480,xl:1027x768 |
| cb |  |

<a name="Client+copyFiles"></a>
#### client.copyFiles(access_token, to_path, from_path, from_copy_ref, cb)
Copy Files 复制一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| to_path | 
| from_path | 
| from_copy_ref | 
| cb | 

<a name="Client+delFiles"></a>
#### client.delFiles(access_token, path, cb)
Delete files 删除一个对象。当前目录下的目录和文件总数不超过 10000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作。

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+moveFiles"></a>
#### client.moveFiles(access_token, from_path, to_path, cb)
Move files 移动一个对象,当前目录下的目录和文件总数不超过 5000 个时，可以执行此操作。超过此限额时，请进入更深层的目录分批操作

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| from_path | 
| to_path | 
| cb | 

<a name="Client+createFolder"></a>
#### client.createFolder(access_token, path, cb)
Create folder 创建目录. 一个目录下最多允许创建 1000 个子目录。

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param |
| --- |
| access_token | 
| path | 
| cb | 

<a name="Client+shareMedia"></a>
#### client.shareMedia(access_token, from_copy_ref, cb)
Get share media 获取分享文件下载和播放的链接

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Description |
| --- | --- |
| access_token |  |
| from_copy_ref | 拷贝引用 |
| cb | 回调函数 |

<a name="Client+shareSearch"></a>
#### client.shareSearch(access_token, query, type, sort_order, page, page_size, cb)
Share search 搜索分享的文件

**Kind**: instance method of <code>[Client](#Client)</code>  

| Param | Description |
| --- | --- |
| access_token |  |
| query | 搜索关键词,可以传多个值，以\|分隔。如query= txt\|pdf\|rar；按组查询时，可选doc,img,video,audio,else中一种 |
| type | 搜索类型，1：全文件检索，2：按名称3：按标题，4：按描述5：按文件(夹)类型，6：按后缀，7：按组查询。 可以传多个type，如2:5:6，此时query值也以:分隔，表示各个type对应的query值，例如：query=web:doc并且type=3:7就表示查询分组是文档的并且标题中有关键字web的文件。 |
| sort_order | 排序字段,可以传多个，可用的值为：sharetime(分享时间),price(价格),degree(星级),count_download(下载量),bytes(大小)，可以传多个，以:分隔 |
| page | 当前页数（取值范围1-40）,默认1 |
| page_size | 每页大小（取值范围1-9999），默认20 |
| cb | 回调函数 |

