'use strict';

interface IPackages {
  [key:string]: string
}

type TPackages = Array<IPackages>;

import * as async from 'async';
import path = require('path');
import residence = require('residence');
import cp = require('child_process');
const root = residence.findProjectRoot(process.cwd());
const maxDepth = 20;

if (!root) {
  throw new Error('Could not find project root given current working directory.');
}

let pkg;

try {
  pkg = require(path.resolve(root + '/package.json'));
}
catch (err) {
  console.error('Could not load package.json file from your project.');
  throw err;
}

const name = pkg.name;

if(!name){
  throw new Error('No name property available for package.json file.');
}


const packagesThatDependOnInput: Array<string> = [];

const runSearch = function (name: string, cb: Function) {
  
  const k = cp.spawn('bash', [], {
    cwd: root
  });
  
  process.nextTick(function(){
    k.stdin.end(`npm view ${name} dependencies;\n`);
  });
  
  let stdout = '';
  k.once('exit', function (code: number) {
    
    if (code > 0) {
      return cb(new Error(`Exit code was greater than 0 for package with name: ${name}.`), [])
    }
    
    const json = String(stdout).trim();
    
    try{
      const obj = JSON.parse(json);
      
      // const packages = Object.keys(obj).map(function(k: string){
      //     return {
      //       [k] : obj[k]
      //     }
      // });
      
      cb(null, obj);
      
    }
    catch(err){
      return cb(err);
    }
    
  });
  
  k.stdout.setEncoding('utf8').on('data', function (data: string) {
    stdout += String(data);
  });
  
};

const getDependencies = function (name: string, depth: number, cb: Function) {
  
  runSearch(name, function (err: Error, v: IPackages) {
    
    const packages = Object.keys(v);
    
    const some = packages.some(function (k: string) {
      const version = v[k];
      return String(k).trim() === 'dezalgo';
    });
    
    if (some) {
      packagesThatDependOnInput.push(name);
    }
    
    if (depth > maxDepth) {
      return cb(null);
    }
    
    if (packages.length < 1) {
      return cb(null);
    }
    
    async.eachLimit(packages as any, 5, function (name: string, cb: Function) {
        getDependencies(name, ++depth, cb);
      },
      cb as any
    );
    
  });
  
};


getDependencies(name, 0, function (err: Error) {
  
  if(err){
    throw err;
  }
  
  console.log('completed successfully.');
  console.log('the following packages depend on the input package.');
  console.log(packagesThatDependOnInput);
  
});