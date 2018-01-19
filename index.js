'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var path = require("path");
var residence = require("residence");
var cp = require("child_process");
var root = residence.findProjectRoot(process.cwd());
var maxDepth = 20;
if (!root) {
    throw new Error('Could not find project root given current working directory.');
}
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
var packagesThatDependOnInput = [];
var runSearch = function (name, cb) {
    var k = cp.spawn('bash', [], {
        cwd: root
    });
    process.nextTick(function () {
        k.stdin.end("npm view " + name + " dependencies;\n");
    });
    var stdout = '';
    k.once('exit', function (code) {
        if (code > 0) {
            return cb(new Error("Exit code was greater than 0 for package with name: " + name + "."), []);
        }
        var json = String(stdout).trim();
        try {
            var obj = JSON.parse(json);
            cb(null, obj);
        }
        catch (err) {
            return cb(err);
        }
    });
    k.stdout.setEncoding('utf8').on('data', function (data) {
        stdout += String(data);
    });
};
var getDependencies = function (name, depth, cb) {
    runSearch(name, function (err, v) {
        var packages = Object.keys(v);
        var some = packages.some(function (k) {
            var version = v[k];
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
        async.eachLimit(packages, 5, function (name, cb) {
            getDependencies(name, ++depth, cb);
        }, cb);
    });
};
getDependencies(name, 0, function (err) {
    if (err) {
        throw err;
    }
    console.log('completed successfully.');
    console.log('the following packages depend on the input package.');
    console.log(packagesThatDependOnInput);
});
