const fs = require("fs");
var sax = require("sax");
var strict = true; // set to false for html-mode

var EnexParser = function EnexParser() {
    var parser = sax.parser(strict);
    var ctx = {
        "noteCount"      : 0,
        "noteIdx"        : 0,
        "resourcesCount" : 0,
        "resourcesIdx"   : 0,
        "notes"          : [],
        "tag"            : ""
    };

    this.init = function() {
        parser.onerror = function (e) {
            throw e;
        };

        parser.ontext = function (t) {
            if (ctx.tag == 'title') {
                ctx.notes[ctx.noteIdx].title = t;
            } else if (ctx.tag == 'data') {
                ctx.notes[ctx.noteIdx].resources[ctx.resourcesIdx].data = t;
            } else if (ctx.tag == 'mime') {
                ctx.notes[ctx.noteIdx].resources[ctx.resourcesIdx].mime = t;
            } else if (ctx.tag == 'width') {
                ctx.notes[ctx.noteIdx].resources[ctx.resourcesIdx].width = t;
            } else if (ctx.tag == 'height') {
                ctx.notes[ctx.noteIdx].resources[ctx.resourcesIdx].height = t;
            } else if (ctx.tag == 'file-name') {
                ctx.notes[ctx.noteIdx].resources[ctx.resourcesIdx].fileName = t;
            }
        };

        parser.oncdata = function (cdata) {
            if (ctx.tag == 'content') {
                ctx.notes[ctx.noteIdx].content = cdata;
            }
        };

        parser.onopentag = function (node) {
            ctx.tag = node.name;
            if (ctx.tag == 'note') {
                ctx.noteCount++;
                ctx.notes.push(new Object());
                ctx.notes[ctx.noteIdx].resources = [];
                ctx.resourcesIdx = 0;
            } else if (ctx.tag == 'resource') {
                ctx.resourcesCount++;
                ctx.notes[ctx.noteIdx].resources.push(new Object());
            }
        };

        parser.onclosetag = function (tag) {
            ctx.tag = '';
            if (tag == 'note') {
                ctx.noteIdx++;
                ctxResourceCount = 0;
                ctx.resourcesIdx = 0;
            } else if (tag == 'resource') {
                ctx.resourcesIdx++;
            }
        }
    }

    this.parse = function(data) {
        parser.write(data).close();
    }

    this.getNotes = function() {
        return ctx.notes;
    }

    this.close = function() {
        parser.close();
        return;
    }
}

exports.EnexParser = EnexParser;
