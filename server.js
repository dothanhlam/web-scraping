var express = require('express');
var fs = require('fs');
var concat = require('concat-files');

var request = require('request');
var cheerio = require('cheerio');
cheerioTableparser = require('cheerio-tableparser');

var app = express();

app.genGUID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

app.listOfLensParsing = function(url, file) {
    request(url, function(error, response, html){
        if(error) {
            return
        }

        var $ = cheerio.load(html);
        cheerioTableparser($);

        var data = $('table').parsetable(true, true, false);
        var firstCol = data[0];
        firstCol.splice(0, 1);
        for (var i in firstCol) {
            var item = cheerio.load(firstCol[i]);
            var pageURL = item('a').attr('href');
            app.parseLensDetail('http://m42lens.com' + pageURL, file);
        }
    });
}

app.parseLensDetail = function(url, file) {

    request(url, function(error, response, html){
        if(error) {
            return
        }

        var $ = cheerio.load(html);
        cheerioTableparser($);

        var lensName = $('.SPTitle').text();
        var data = $('table').parsetable(true, true, false);
        var jsonData = {
            id: app.genGUID(),
            name: "",
            vendor : "",
            typeName : "",
            focalRange : "",
            maxAperture: "",
            elements: "",
            mfd: "",
            weight: "",
            presetAperture: "",
            mount: "",
            gallery: [],
        };

        jsonData.name = lensName;
        jsonData.vendor = data[1][0];
        jsonData.typeName = data[1][1];
        jsonData.focalRange = data[1][2];
        jsonData.maxAperture = data[1][3];
        jsonData.elements = data[1][4];
        jsonData.mfd = data[1][5];
        jsonData.weight = data[1][6];
        jsonData.presetAperture = data[1][7];
        jsonData.mount = data[1][8];

        var imageGalleries = $('a[class=modal]');
        imageGalleries.filter(function() {
            var data = $(this);
            jsonData.gallery.push(data.attr('href'));
        });

        console.log('lens: ', jsonData);

        fs.appendFileSync(file, JSON.stringify(jsonData) + ",");

    });
}


app.filesProcess = function(from, to, file){
    var allFiles = [];
    for (var i = from; i<= to; i ++) {
        allFiles.push('./results/lens-' + i + '.json');
    }
    console.log('concat: ', concat);

    concat(allFiles, file, function(err) {
        if (err) throw err
        console.log('done');
    });

}

app.listen('8081')

console.log('Magic happens on port 8081');
// for (var page = 2; page < 10; page ++) {
//     app.listOfLensParsing('http://m42lens.com/m42-lens-database?site=' + page, './results/lens-' + page + '.json');
// }

app.filesProcess(1, 9, './results/lenses.json');

exports = module.exports = app;