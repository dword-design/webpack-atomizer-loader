"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var PATH_SEP = '/';
function writeCssFile(cssDest, cssString) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(cssDest, cssString, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.writeCssFile = writeCssFile;
function ensureFolderExists(path, mask) {
    if (mask === void 0) { mask = '0777'; }
    var isExisted = false;
    try {
        fs.mkdirSync(path, mask);
        isExisted = true;
    }
    catch (err) {
        if (err.code === 'EEXIST') {
            isExisted = true;
        }
    }
    return isExisted;
}
exports.ensureFolderExists = ensureFolderExists;
function ensureExists(filePath) {
    var dirs = path.dirname(filePath).split(PATH_SEP);
    var result = true;
    var currentPath;
    if (dirs[0] === '') {
        dirs[0] = path.sep;
    }
    dirs.forEach(function (_, i, p) {
        currentPath = path.join.apply(null, p.slice(0, i + 1));
        if (!ensureFolderExists(currentPath)) {
            result = false;
        }
    });
    return result;
}
exports.ensureExists = ensureExists;