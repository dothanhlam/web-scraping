var express = require('express');
var fs = require('fs');
var concat = require('concat-files');
var image_downloader = require('image-downloader');

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
        var data = $('table').parsetable(true, true);
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
            category: "",
            minAperture:"",
            apBlades:"",
            filter: "",
            year:"",
            dimensions:"",
            description: "",
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
        jsonData.category = cheerio.load(data[3][2]).text();
        jsonData.minAperture = data[3][3];
        jsonData.apBlades = data[3][4];
        jsonData.filter = data[3][5];
        jsonData.year = data[3][6];
        jsonData.dimensions = data[3][7];

        console.log(jsonData)
        var imageGalleries = $('a[class=modal]');
        imageGalleries.filter(function() {
            var data = $(this);
            jsonData.gallery.push(data.attr('href'));
        });

        var des = $('div[class=inf_det]');
        jsonData.description = des.text().replace("Info / Description:", "");

        console.log('parse: ', jsonData.name);

        fs.appendFileSync(file, JSON.stringify(jsonData) + ",");

    });
}


app.filesProcess = function(from, to, file){
    var allFiles = [];
    for (var i = from; i<= to; i ++) {
        allFiles.push('./m42lenses/lens-' + i + '.json');
    }
    concat(allFiles, file, function(err) {
        if (err) throw err
        console.log('files concat done');
    });

}

app.batchParsing = function(from, to) {
    for (var page = from; page <= to; page ++) {
        app.listOfLensParsing('http://m42lens.com/m42-lens-database?site=' + page, './m42lenses/lens-' + page + '.json');
    }
}



app.batchDownloadImage = function(images) {
    downloadImage = function(url, dest, success, fault) {
        var options = {
            url: url,
            dest: dest,
            done: function(err, filename, image) {
                if (err) {
                    if (fault && typeof fault === "function") {
                        fault(err);
                    }
                    else {
                        throw err;
                    }
                }

                if (success && typeof success === "function") {
                    success({filename: filename, data: image});
                }
            }
        }

        image_downloader(options);
    }

    var domain = 'http://m42lens.com';
    for (var i in images) {
        var image = images[i];
        downloadImage(domain + image.url, image.dest || './images', function(res) {
            console.log('success: ', res.filename);
        },
        function(err) {
            console.log('err: ', err);
        });
    }
}



app.listen('8081')
console.log('Magic happens on port 8081');

app.filesProcess(1, 108, './m42lenses/lenses.json');
//app.batchParsing(101, 108);
/*app.batchDownloadImage([
    {
        url: '/images/lenses/1083/a_schacht_ulm_edixa-m-travenar-a_50mm_f2_8-22_m42_01.jpg',
    }
]);
*/

exports = module.exports = app;