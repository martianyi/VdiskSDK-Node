# Node SDK For Vdisk

## Vdisk Documentation

http://vdisk.weibo.com/developers/index.php?module=api&action=apiinfo

## Usage

Get the authorization url.

```javascript
var OAuth2 = require("../dist/index").OAuth2;
var oauth = new OAuth2(WEIPAN_APPKEY,WEIPAN_APPSECRET,WEIPAN_CALLBACK)
var url = oauth.authorize()
```





