var fs = require('fs');

var db = require('./results/lenses.json');
var jsonData = {
    vendors: [],
    focalRange: [],
    typeName:[],
    maxAperture:[],
    lenses: []
};

for(var i in db) {
    var item = db[i];
    // parse vendors
    if (jsonData.vendors.indexOf(item.vendor) === -1) {
        jsonData.vendors.push(item.vendor);
    }

    // parse focal range
    if (jsonData.focalRange.indexOf(item.focalRange) === -1) {
        jsonData.focalRange.push(item.focalRange);
    }

    // parse typeName
    if (jsonData.typeName.indexOf(item.typeName) === -1) {
        jsonData.typeName.push(item.typeName);
    }

    // parse maxAperture
    if (jsonData.maxAperture.indexOf(item.maxAperture) === -1) {
        jsonData.maxAperture.push(item.maxAperture);
    }

    jsonData.lenses.push(item);
}

fs.appendFileSync('./results/db.json', JSON.stringify(jsonData));
