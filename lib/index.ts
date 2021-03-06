'use strict';

interface IPackages {
  [key: string]: string
}

type TPackages = Array<IPackages>;
import * as async from 'async';
import util = require('util');
import path = require('path');
import residence = require('residence');
import cp = require('child_process');
import * as semver from 'semver';
import fs = require('fs');

const maxDepth = 20;

const runSearch = function (name: string, root: string, cb: Function) {
  
  const k = cp.spawn('bash', [], {
    cwd: root
  });
  
  const cmd = `npm view ${name} dependencies --json`;
  
  process.nextTick(function () {
    k.stdin.end(`${cmd};\n`);
  });
  
  let stdout = '';
  k.once('exit', function (code: number) {
    
    if (code > 0) {
      return cb(new Error(`Exit code was greater than 0 for package with name: ${name}.`), [])
    }
    
    let json = String(stdout).trim();
    
    if (!json) {
      json = '{}';
    }
    
    try {
      let obj = JSON.parse(json);
      if (Array.isArray(obj)) {
        // console.log('cmd yielded an array:', cmd);
        obj = obj[0] || {};
      }
      
      cb(null, obj);
      
    }
    catch (err) {
      err = new Error(`${err.message}...Could not parse response for package with name "${name}", response was: ${json}`);
      return cb(err, {});
    }
    
  });
  
  k.stdout.setEncoding('utf8').on('data', function (data: string) {
    stdout += String(data);
  });
  
};

export const makeGetDependencies = function (inputPackage: string, packagesThatDependOnInput: Array<string>,
                                             root: string, isLocal: boolean, pkgJSON: any) {
  
  return function getDependencies(name: string, depth: number, cb: Function) {
    
    const handleResults = function (err: Error, nameVersionMap: IPackages) {
      
      if (err) {
        return cb(err);
      }
      
      const packages = Object.keys(nameVersionMap);
      
      const some = packages.some(function (k: string) {
        return String(k).toLowerCase().trim() === inputPackage;
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
      
      const packagesWithVersion = packages.map(function (k: string) {
        
        const version = semver.clean(nameVersionMap[k]);
        return [String(k).trim(), '@', version].join('');
      });
      
      async.eachLimit(packagesWithVersion, 3, function (name: string, cb: Function) {
          getDependencies(name, ++depth, cb);
        },
        cb as any
      );
      
    };
    
    if (isLocal === true && depth === 0) {
      process.nextTick(function () {
        handleResults(null, pkgJSON.dependencies || {});
      });
    }
    else {
      runSearch(name, root, handleResults);
    }
    
  };
  
};







