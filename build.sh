#! /bin/sh
watchify -t flow-typestrip -t [ babelify --presets [ es2015 react ] ] app.js -o lib.js
