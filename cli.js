#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var residence = require("residence");
var lib_1 = require("./lib");
var root = residence.findProjectRoot(process.cwd());
var indexOfName = process.argv.indexOf('--name');
if (indexOfName < 0) {
    throw 'No package name received at the command line, use the "--name" option.\n';
}
var inputName = process.argv[indexOfName + 1];
if (!inputName) {
    throw 'No package name received at the command line, use the "--name" option.\n';
}
if (!root) {
    throw new Error('Could not find project root given current working directory.');
}
var packagesThatDependOnInput = [];
var getDependencies = lib_1.makeGetDependencies(inputName, packagesThatDependOnInput, root);
var pkg;
try {
    pkg = require(path.resolve(root + '/package.json'));
}
catch (err) {
    console.error('Could not load package.json file from your project.');
    throw err;
}
var name = pkg.name;
if (!name) {
    throw new Error('No name property available for package.json file.');
}
getDependencies(inputName, 0, function (err) {
    if (err) {
        throw err;
    }
    console.log(packagesThatDependOnInput);
});
