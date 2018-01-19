#!/usr/bin/env node
'use strict';

import path = require('path');
import residence = require('residence');
import {makeGetDependencies} from "./lib";
const root = residence.findProjectRoot(process.cwd());
const indexOfName = process.argv.indexOf('--name');
const isLocal = process.argv.indexOf('--local') > 0;

if(indexOfName < 0){
  throw 'No package name received at the command line, use the "--name" option.\n';
}

const inputName = process.argv[indexOfName + 1];

if (!inputName) {
  throw 'No package name received at the command line, use the "--name" option.\n';
}

let pkg;

try {
  pkg = require(path.resolve(root + '/package.json'));
}
catch (err) {
  console.error('Could not load package.json file from your project.');
  throw err;
}

const pkgName = pkg.name;

if (!pkgName) {
  throw new Error('No name property available for package.json file.');
}

const cleanInputName = String(inputName).trim();
console.log(`We are searching for dependants of: "${cleanInputName}", anywhere in package with name: "${pkgName}"`);

if (!root) {
  throw new Error('Could not find project root given current working directory.');
}

const packagesThatDependOnInput = [] as Array<string>;
const getDependencies = makeGetDependencies(cleanInputName, packagesThatDependOnInput, root, isLocal, pkg);


getDependencies(pkgName, 0, function (err: Error) {
  
  if (err) {
    throw err;
  }
  
  console.log(packagesThatDependOnInput);
  
});