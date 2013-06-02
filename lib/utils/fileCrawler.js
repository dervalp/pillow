var fs      =   require("fs"),
    async   =   require("async"),
    _       =   require("underscore");

module.exports = function(path) {

    var pathToCrawl = path,
        results = [];

    var readFolder = function(folder,  cb) {
        var files = [];

        fs.readdir(folder, function (err, fileList) {
             _.each(fileList, function(file) {
                files.push(folder + file);
             });
             cb(files);
        });
    },
    registerStructure = function(path, cb) {
        fs.readFile(path, 'utf-8', function(err, content) {
            if(!content) { throw "no content for " + path; }

            results.push(JSON.parse(content));
            cb(null, results);
        });
    },
    registerStructures = function(all, visit, cb) {
        async.map(all, visit, function(err, result) {
            cb(result[0]);
        });
    },
    build = function (instanceFolder, cb) {
        //load system structure
        //load instance structure
        var all = [],
            callback = cb,
            hasInstance = true;

        if(_.isFunction(instanceFolder)) {
            callback = instanceFolder;
            hasInstance = false;
        }

        readFolder(pathToCrawl, function(structures) {

            if(!hasInstance) {
                return registerStructures(structures, registerStructure, callback);
            }

            return readFolder(instanceFolder, function(instanceStructures){
                all = all.conact(structures).concat(instanceStructures);
                registerStructures(all, registerStructure, callback);
            });
        });
    };

    return {
        build:build
    }
}