var express = require('express');
var router = express.Router();

var Evernote = require('evernote');
var config = require('../config.json');
var callbackUrl = "http://localhost:3000/en/oauth_callback"; // todo: should be configurable


// http://{server}/en/
router.get('/', function(req, res) {
    if (req.session.oauthAccessToken) {
        var token = req.session.oauthAccessToken;
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
            console.log(notebooks); // debug

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

module.exports = router;
