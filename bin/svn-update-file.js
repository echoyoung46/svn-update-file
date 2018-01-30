#!/usr/bin/env node

const svnUltimate = require('node-svn-ultimate');
const fs = require('fs');
const ncp = require('ncp').ncp;

const param = process.argv[1];
const svnUrl = param ? param : '';
const folderPath = './checkout';

function SVNUpdateFile() {
  this.svnUrl = '';
  this.count = 0;
  this.svnUrl = '';
  this.init();
}

SVNUpdateFile.prototype = {
  init: () => {
    this.svnUrl = svnUrl;
    svnUltimate.commands.checkout(this.svnUrl, folderPath, {}, () => SVNUpdateFile.prototype.mergeFile());
  },
  mergeFile: () => {
    console.log('checkout complete.');
    console.log('merging file....');
    fs.readdir('./', function (err, files) {
      var i = 0;
      var count = 0;
      (function getDir(i) {
        if (i == files.length) {
          return;
        }

        var item = files[i];

        if (item != 'node_modules' && folderPath.indexOf(item) < 0) {
          fs.stat(item, function (err, stat) {
            if (err == null) {
              if (stat.isDirectory()) {
                ncp(item, folderPath + '/' + item, function (err) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log('directory merged!');
                  count++;
                  if (count == files.length) {
                    SVNUpdateFile.prototype.commit();
                  }
                });
              } else {
                ncp(item, folderPath + '/' + item, function (err) {
                  if (err) {
                    return console.error(err);
                  }
                  console.log('file merged!');
                  count++;
                  if (count == files.length) {
                    SVNUpdateFile.prototype.commit();
                  }
                });
              }
            }
          });
        } else {
          count++;
          if (count == files.length) {
            SVNUpdateFile.prototype.commit();
          }
        }
        getDir(++i);
      })(i)
    })
  },
  commit: () => {
    console.log('commiting..');
    svnUltimate.commands.add([folderPath + '/ossweb-img/*', folderPath + '/*'], {
      quiet: true,
      force: true,
      depth: "empty",
      ignoreExternals: true
    }, () => svnUltimate.commands.commit([folderPath + '/ossweb-img/*', folderPath + '/*'], {
      params: ['-m "Commit comment"']
    }, () => console.log('commit complete.')));
  }
};

let inst = new SVNUpdateFile();
module.exports = inst;
