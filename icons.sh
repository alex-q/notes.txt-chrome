#!/usr/bin/env bash

for i in 16 32 48; do
  convert -scale ${i}x${i} icon128.png icon${i}.png
done
