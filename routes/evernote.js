var express = require('express');
var router = express.Router();

var Evernote = require('evernote');
var config = require('../config.json');
var callbackUrl = "http://localhost:3000/en/oauth_callback"; // todo: should be configurable
var request = require('request');

var parser = require('./../js_backend/enexparser');
const md5 = require('md5');
const util = require('util');


var templateUrlFmt = "http://localhost:3000/templates/%s/note";


function writeTokenToCookie(req, res, value){
    res.cookie( 'entkn',
                value,
                { expires: new Date(Date.now() + 604800000), httpOnly: true ,signed:true}
    );
};

function readTokenFromCookie(req, res) {
    var token = req.signedCookies.entkn;
    console.log("token:"+ token);
    return token;
}


// http://{server}/en/
router.get('/', function(req, res) {
    var token = '';

    if (token = readTokenFromCookie(req, res)) {
        req.session.oauthAccessToken = token;
    }

    if (req.session.oauthAccessToken) {
        token = req.session.oauthAccessToken;
        var client = new Evernote.Client({
            token: token,
            sandbox: config.EN_API_IS_SANDBOX,
            china: config.EN_API_IS_CHINA
        });
        client.getNoteStore().listNotebooks().then(function(notebooks) {
            req.session.notebooks = notebooks;
            res.render('en/index', {session: req.session});
        }, function(error) {
            req.session.error = JSON.stringify(error);
            res.render('en/index', {session: req.session});
        });
    } else {
        res.render('en/index', {session: req.session, title: 'Evernote API'});
    }
});


// http://{server}/en/oauth
router.get('/oauth', function(req, res) {
    var client = new Evernote.Client({
        consumerKey: config.EN_API_CONSUMER_KEY,
        consumerSecret: config.EN_API_CONSUMER_SECRET,
        sandbox: config.EN_API_IS_SANDBOX,
        china: config.EN_API_IS_CHINA
    });

    client.getRequestToken(callbackUrl, function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            req.session.error = JSON.stringify(error);
            res.redirect('/en');
        } else {
            // store the tokens in the session
            req.session.oauthToken = oauthToken;
            req.session.oauthTokenSecret = oauthTokenSecret;

            // redirect the user to authorize the token
            res.redirect(client.getAuthorizeUrl(oauthToken));
        }
    });
});

// http://{server}/en/oauth_callback
router.get('/oauth_callback', function(req, res) {
    var client = new Evernote.Client({
        consumerKey: config.EN_API_CONSUMER_KEY,
        consumerSecret: config.EN_API_CONSUMER_SECRET,
        sandbox: config.EN_API_IS_SANDBOX,
        china: config.EN_API_IS_CHINA
    });

    client.getAccessToken(
        req.session.oauthToken,
        req.session.oauthTokenSecret,
        req.query.oauth_verifier,
        function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if (error) {
                console.log('error');
                console.log(error);
                res.redirect('/en');
            } else {
                // store the access token in the session
                req.session.oauthAccessToken = oauthAccessToken;
                req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
                req.session.edamShard = results.edam_shard;
                req.session.edamUserId = results.edam_userId;
                req.session.edamExpires = results.edam_expires;
                req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
                req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;

                // save auth token to cookie
                writeTokenToCookie(req, res, oauthAccessToken);
                res.redirect('/en');
            }
        });
});


// http://{server}/en/me
router.get('/me', function(req, res) {
    if (req.session.oauthAccessToken) {
        var token = req.session.oauthAccessToken;
        var client = new Evernote.Client({
            token: token,
            sandbox: config.EN_API_IS_SANDBOX,
            china: config.EN_API_IS_CHINA
        })

        var userStore = client.getUserStore();

        userStore.getUser().then( function(user) {
            // user is the returned User object
            // res.send(user);
            res.render('en/me', {user: user, session: req.session, title: "Evernote user store"});
        });
    } else {
        res.send(user, 401);
    }
});


// http://{server}/en/notebooks
router.get('/notebooks', function(req, res) {
    if (req.session.oauthAccessToken) {
        var token = req.session.oauthAccessToken;
        var client = new Evernote.Client({
            token: token,
            sandbox: config.EN_API_IS_SANDBOX,
            china: config.EN_API_IS_CHINA
        });

        client.getNoteStore().listNotebooks().then(function (notebooks) {
            var retNotebooks = [];

            if (notebooks.length > 0) {
                for (var i = 0; i < notebooks.length; ++i) {
                    retNotebooks.push({});
                    retNotebooks[i]['name'] = notebooks[i].name;
                    retNotebooks[i]['guid'] = notebooks[i].guid;
                    console.log(retNotebooks);
                    console.log("NAME: " + notebooks[i].name);
                    console.log("GUID: " + notebooks[i].guid);
                }
            }

            res.status(200).send(retNotebooks);
        }, function (error) {
            req.session.error = JSON.stringify(error);
            res.status(500).send(error);
        });
    }
    else
    {
        res.status(500).send('Evernote login is required.');
    }
});


// todo:test code...
// http://{server}/en/note
router.get('/note', function(req, res) {
    if (req.session.oauthAccessToken) {
        var token = req.session.oauthAccessToken;
        var client = new Evernote.Client({
            token: token,
            sandbox: config.EN_API_IS_SANDBOX,
            china: config.EN_API_IS_CHINA
        });

        var noteStore = client.getNoteStore();
        var note = {};
        var templateId = req.query.tid;
        var notebookGuid = req.query.nbguid;

        if(!templateId) {
            res.status(400).send('tid(\'Template Id\') is note specified.');
            return;
        }

        var enexUrl = util.format(templateUrlFmt, templateId);

        var body = '';

        request.get(enexUrl).on('response', function(response) {
            console.log(response.statusCode);
            console.log(response.headers['content-type']);
        }).on('error', function(err) {
            res.status(400).send(err);
            return;
        }).on('data', function(chunck) {
            body += chunck;
        }).on('end', function () {
            res.set('Content-Type', 'text/xml');

            console.log("request/data/length: " + body.length);

            var pp = new parser.EnexParser();

            pp.init();
            console.log(body.toString('utf8'));
            pp.parse(body);

            var enexNotes = pp.getNotes();
            var createdNoteCount = 0;

            pp.close();

            for (let n of enexNotes) {
                var enNote = {};
                var enResources = [];

                for (let r of n.resources) {

                    var enRsc = {};
                    var enRscBodyData = new Buffer(r.data, "base64");
                    var enRscData = new Evernote.Types.Data();

                    enRscData.bodyHash = new Buffer(md5(enRscBodyData));
                    enRscData.size = enRscBodyData.length;
                    enRscData.body = enRscBodyData;

                    enRsc.guid = ''; // new resource should be empty.
                    enRsc.noteGuid = ''; // new note should be empty.
                    enRsc.data = enRscData;
                    enRsc.mime = r.mime;
                    enRsc.width = r.width;
                    enRsc.height = r.height;

                    enResources.push(enRsc);
                }

                enNote.content = n.content;
                enNote.title = n.title;
                enNote.resources = enResources;

                // Create a note with ENEX.
                noteStore.createNote(enNote)
                    .then( function( noteCallback ) {
                        console.log(noteCallback.guid + " created");
                        createdNoteCount++;
                        console.log(createdNoteCount);
                    }, function (error) {
                        console.error( error );
                        res.status(400).send(error);
                        return;
                    });
            }

            res.status(200).send( createdNoteCount.toString() + " notes are posted." );
            return;
        });
    }
});

module.exports = router;
