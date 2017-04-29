var express = require('express');
var router = express.Router();
var _ = require('underscore');


var templList = `{
        "service" : "template_service", 
        "templates" : [ 
            {
                "id" : "1",
                "title" : "Template Test",
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
                "title" : "노트 3",
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

var templates = [
    {
        'id' : '1',
        'enex_file' : 'template_test.enex',
        'thumb_img' : 'template_test.png'
    },
    {
        'id' : '2',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    },
    {
        'id' : '3',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    },
    {
        'id' : '4',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    },
    {
        'id' : '5',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    },
    {
        'id' : '6',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    },
    {
        'id' : '7',
        'enex_file' : 'tmpl_01.enex',
        'thumb_img' : 'tmpl_01.png'
    }
];


router.get('/', function(req, res, next) {
    res.json(JSON.parse(templList));
});

router.get('/:id', function(req, res) {
    res.status(400).send(`Usage: Use {host}/{id}/note to retrieve note template <br> or <br> {host}/{id}/img`);
});

router.get('/:id/img', function(req, res) {

    var idx = _.findIndex(templates, { id: req.params.id });
    if (idx < 0) {
        res.status(404).send('No image');
        return
    }

    var fileName = templates[idx].thumb_img;

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

    var idx = _.findIndex(templates, { id: req.params.id });
    if (idx < 0) {
        res.status(404).send('No note');
        return
    }

    var fileName = templates[idx].enex_file;
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
