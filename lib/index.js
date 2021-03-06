'use strict';
var async = require("async");
var cp = require("child_process");
var semver = require("semver");
var maxDepth = 20;
var runSearch = function (name, root, cb) {
    var k = cp.spawn('bash', [], {
        cwd: root
    });
    var cmd = "npm view " + name + " dependencies --json";
    process.nextTick(function () {
        k.stdin.end(cmd + ";\n");
    });
    var stdout = '';
    k.once('exit', function (code) {
        if (code > 0) {
            return cb(new Error("Exit code was greater than 0 for package with name: " + name + "."), []);
        }
        var json = String(stdout).trim();
        if (!json) {
            json = '{}';
        }
        try {
            var obj = JSON.parse(json);
            if (Array.isArray(obj)) {
                obj = obj[0] || {};
            }
            cb(null, obj);
        }
        catch (err) {
            err = new Error(err.message + "...Could not parse response for package with name \"" + name + "\", response was: " + json);
            return cb(err, {});
        }
    });
    k.stdout.setEncoding('utf8').on('data', function (data) {
        stdout += String(data);
    });
};
exports.makeGetDependencies = function (inputPackage, packagesThatDependOnInput, root, isLocal, pkgJSON) {
    return function getDependencies(name, depth, cb) {
        var handleResults = function (err, nameVersionMap) {
            if (err) {
                return cb(err);
            }
            var packages = Object.keys(nameVersionMap);
            var some = packages.some(function (k) {
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
            var packagesWithVersion = packages.map(function (k) {
                var version = semver.clean(nameVersionMap[k]);
                return [String(k).trim(), '@', version].join('');
            });
            async.eachLimit(packagesWithVersion, 3, function (name, cb) {
                getDependencies(name, ++depth, cb);
            }, cb);
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
