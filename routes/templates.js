var express = require('express');
var router = express.Router();
var _ = require('underscore');


var templList = `{
        "service" : "template_service", 
        "templates" : [
            {
                "id" : "table_2x1",
                "title" : "Table 2x1",
                "img_url" : "/templates/table_2x1/img",
                "note_url" : "/templates/table_2x1/note"
            },
            {
                "id" : "2017-daily-note",
                "title" : "2017 Daily Note",
                "img_url" : "/templates/2017-daily-note/img",
                "note_url" : "/templates/2017-daily-note/note"
            },
            {
                "id" : "bizcard",
                "title" : "Evernote Empty Biz. Card",
                "img_url" : "/templates/bizcard/img",
                "note_url" : "/templates/bizcard/note"
            },
            {
                "id" : "2017-weekly-note",
                "title" : "2017 Weekly Note",
                "img_url" : "/templates/2017-weekly-note/img",
                "note_url" : "/templates/2017-weekly-note/note"
            },
            {
                "id" : "table_2x3",
                "title" : "Table 2x3",
                "img_url" : "/templates/table_2x3/img",
                "note_url" : "/templates/table_2x3/note"
            },
            {
                "id" : "table_2x6",
                "title" : "Table 2x6",
                "img_url" : "/templates/table_2x6/img",
                "note_url" : "/templates/table_2x6/note"
            },
            {
                "id" : "books",
                "title" : "Reading memo",
                "img_url" : "/templates/books/img",
                "note_url" : "/templates/books/note"
            }
        ]      
    }`;

var templates = [
    {
        'id' : '2017-daily-note',
        'enex_file' : 'note_daily.enex',
        'thumb_img' : 'note_daily.png'
    },
    {
        'id' : '2017-weekly-note',
        'enex_file' : 'note_weekly.enex',
        'thumb_img' : 'note_weekly.png'
    },
    {
        'id' : '1',
        'enex_file' : 'template_test.enex',
        'thumb_img' : 'template_test.png'
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
        'id' : 'bizcard',
        'enex_file' : 'bizcard.enex',
        'thumb_img' : 'bizcard.png'
    },
    {
        'id': 'table_2x1',
        'enex_file': 'table_2x1.enex',
        'thumb_img': 'table_2x1.png'
    },
    {
        'id': 'table_2x3',
        'enex_file': 'table_2x3.enex',
        'thumb_img': 'table_2x3.png'
    },
    {
        'id': 'table_2x6',
        'enex_file': 'table_2x6.enex',
        'thumb_img': 'table_2x6.png'
    },
    {
        'id': 'books',
        'enex_file': 'books.enex',
        'thumb_img': 'books.png'
    }


];


router.get('/', function(req, res, next) {
    res.setHeader('content-type', 'application/json');
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
    });
});

module.exports = router;
