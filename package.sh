#! /bin/sh
rm -r build_output
mkdir build_output
mkdir build_output/js

cp -r index.html css images build_output
cp bower_components/three.js/three.js build_output/js
cp bower_components/jquery/dist/jquery.js build_output/js
browserify -t flow-typestrip -t [ babelify --presets [ es2015 react ] ] app.js -o build_output/js/lib.js

sed -i "" 's/bower_components\/.*\/\(.*js\)/js\/\1/g' build_output/index.html
sed -i "" 's/lib\.js/js\/lib.js/g' build_output/index.html
