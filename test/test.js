"use strict";

var assert = require('assert');
var fs = require('fs');

var app_key = ''; // Input your app key and secret here
var app_secret = '';
var call_back_url = '';
var accessToken = '18c8646666gE5HW3madls3FeZm764b81';
var OAuth2 = require("../index").OAuth2;
var Client = require("../index").Client;

var oauth = new OAuth2(app_key, app_secret, call_back_url);
describe('OAuth2', function () {
    describe('authorize', function () {
        it('should return the right url', function () {
            var url = oauth.authorize();
            assert.equal(expected, url);
        });
    });
    describe('authorization_code', function(){
        it('should get authorization_code without err', function(done){
            oauth.accessToken({code: "b0841e108f70acc530aefeee7d0daf14"},function(err, resp){
                if(err){
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });
    describe('refresh_token', function(){
        it('should get refresh_token without err', function(done){
            oauth.accessToken({grant_type:"refresh_token",refresh_token: "347ee06666gE5HW3madls3FeZm7e0141"},function(err, resp){
                if(err){
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    })
});

var client = new Client();
describe('Client', function () {
    describe('accout_info', function () {
        it('should get account info without error', function (done) {
            client.accountInfo(accessToken, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('metadata', function () {
        it('should get metadata without error', function (done) {
            client.metadata({access_token: accessToken}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('delta', function () {
        it('should get delta without error', function (done) {
            client.delta({access_token: accessToken}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('files', function () {
        it('should get files without error', function (done) {
            client.files({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('revisions', function () {
        it('should get revisions without error', function (done) {
            client.revisions({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('save files', function () {
        it('should save files without error', function (done) {
            this.timeout(5000);
            client.saveFiles({
                access_token: accessToken,
                path: 'test/test.txt',
                files: __dirname + '/file.txt'
            }, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('update files', function () {
        it('should update files without error', function (done) {
            this.timeout(5000);
            client.updateFiles({
                access_token: accessToken,
                path: 'test/test.txt',
                files: __dirname + '/file.txt'
            }, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('shares', function () {
        it('should share without error', function (done) {
            client.shares({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('restore', function () {
        it('should restore without error', function (done) {
            client.restore({access_token: accessToken, path: 'test/test.txt', rev: '4369258980'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('search', function () {
        it('should search without error', function (done) {
            client.search({access_token: accessToken, path: '', query: 'test'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('copy ref', function () {
        it('should return copy_ref without error', function (done) {
            client.copyRef({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('media', function () {
        it('should return media without error', function (done) {
            client.media({access_token: accessToken, path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('thumbnails', function () {
        it('should return thumbnails without error', function (done) {
            client.media({access_token: accessToken, path: 'test/test.txt', size: 's'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('copy files', function () {
        it('should copy files without error', function (done) {
            client.copyFiles({access_token: accessToken, to_path: 'test/test2.txt', from_path: 'test/test.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('delete files', function () {
        it('should delete files without error', function (done) {
            client.delFiles({access_token: accessToken, path: 'test'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('move files', function () {
        it('should move files without error', function (done) {
            client.moveFiles({access_token: accessToken, to_path: 'test/test3.txt',from_path:'test/test2.txt'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('create folder', function () {
        it('should create folder without error', function (done) {
            client.createFolder({access_token: accessToken, path: 'test'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('share media', function () {
        it('should return share media without error', function (done) {
            client.shareMedia({access_token: accessToken, from_copy_ref: 'qlGjboAjQYoGB'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });

    describe('share search', function () {
        this.timeout(5000);
        it('should return share without error', function (done) {
            client.shareSearch({access_token: accessToken, query: 'test.txt', type:'2'}, function (err, resp) {
                if (err) {
                    throw(err)
                }
                console.log(resp);
                done();
            })
        })
    });
});

