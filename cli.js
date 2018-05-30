#!/usr/bin/env node
'use strict';
var path = require("path");
var residence = require("residence");
var lib_1 = require("./lib");
var root = residence.findProjectRoot(process.cwd());
var indexOfName = process.argv.indexOf('--name');
var isLocal = process.argv.indexOf('--local') > 0;
if (indexOfName < 0) {
    throw 'No package name received at the command line, use the "--name" option.\n';
}
var inputName = process.argv[indexOfName + 1];
if (!inputName) {
    throw 'No package name received at the command line, use the "--name" option.\n';
}
var pkg;
try {
    pkg = require(path.resolve(root + '/package.json'));
}
catch (err) {
    console.error('Could not load package.json file from your project.');
    throw err;
}
var pkgName = pkg.name;
if (!pkgName) {
    throw new Error('No name property available for package.json file.');
}
var cleanInputName = String(inputName).trim();
console.log("We are searching for dependants of: \"" + cleanInputName + "\", anywhere in package with name: \"" + pkgName + "\"");
if (!root) {
    throw new Error('Could not find project root given current working directory.');
}
var packagesThatDependOnInput = [];
var getDependencies = lib_1.makeGetDependencies(cleanInputName, packagesThatDependOnInput, root, isLocal, pkg);
getDependencies(pkgName, 0, function (err) {
    if (err) {
        throw err;
    }
    console.log(packagesThatDependOnInput);
});
