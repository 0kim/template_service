var express = require('express');
var router = express.Router();
var templList = `{
        "service" : "template_service", 
        "templates" : [ 
            {
                "id" : "1",
                "title" : "노트 1",
                "img_url" : "/templates/1/img",
                "note_url" : "/templates/1/note"
            }, 
            {
                "id" : "2",
                "title" : "노트 2",
                "img_url" : "/templates/2/img",
                "note_url" : "/templates/2/note"
            },
            {
                "id" : "3",
                "title" : "노트 ",
                "img_url" : "/templates/3/img",
                "note_url" : "/templates/3/note"
            },
            {
                "id" : "4",
                "title" : "노트 4",
                "img_url" : "/templates/4/img",
                "note_url" : "/templates/4/note"
            },
            {
                "id" : "5",
                "title" : "노트 5",
                "img_url" : "/templates/5/img",
                "note_url" : "/templates/5/note"
            }, 
            {
                "id" : "6",
                "title" : "노트 6",
                "img_url" : "/templates/6/img",
                "note_url" : "/templates/6/note"
            },
            {
                "id" : "7",
                "title" : "노트 7",
                "img_url" : "/templates/7/img",
                "note_url" : "/templates/7/note"
            } 
        ]      
    }`;


router.get('/', function(req, res, next) {
    res.send(templList);
});

router.get('/:id', function(req, res) {

});

router.get('/:id/img', function(req, res) {

    var fileName = "tmpl_01.png";
    var options = {
        root: __dirname + '/../public/images',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-type': 'image/png',
            'Content-disposition' : "inline; filename=" + fileName
        }
    };

    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
});

router.get('/:id/note', function(req, res) {

    var fileName = "tmpl_01.enex";
    var options = {
        root: __dirname + '/../public/templates',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-type': 'text/xml'
        }
    };

    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
});


module.exports = router;
