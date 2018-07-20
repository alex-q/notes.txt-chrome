#!/usr/bin/env bash
rm -rf dist
mkdir dist
cp *.json *.html *.js *.css *.png LICENSE dist/
pushd dist
zip dist.zip *
popd
