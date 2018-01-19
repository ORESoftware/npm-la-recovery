#!/usr/bin/env node
'use strict';

import path = require('path');
import residence = require('residence');
import {makeGetDependencies} from "./lib";
const root = residence.findProjectRoot(process.cwd());
const indexOfName = process.argv.indexOf('--name');

if(indexOfName < 0){
  throw 'No package name received at the command line, use the "--name" option.\n';
}

const inputName = process.argv[indexOfName + 1];

if (!inputName) {
  throw 'No package name received at the command line, use the "--name" option.\n';
}

if (!root) {
  throw new Error('Could not find project root given current working directory.');
}

const packagesThatDependOnInput = [] as Array<string>;
const getDependencies = makeGetDependencies(inputName, packagesThatDependOnInput, root);

let pkg;

try {
  pkg = require(path.resolve(root + '/package.json'));
}
catch (err) {
  console.error('Could not load package.json file from your project.');
  throw err;
}

const name = pkg.name;

if (!name) {
  throw new Error('No name property available for package.json file.');
}

getDependencies(inputName, 0, function (err: Error) {
  
  if (err) {
    throw err;
  }
  
  console.log(packagesThatDependOnInput);
  
});