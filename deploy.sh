#!/bin/bash
# Deploy dist/ to gh-pages branch
set -e

echo "Building..."
npm install --silent
node build.js

echo "Deploying to gh-pages..."
git stash -q 2>/dev/null || true
git checkout gh-pages

# Copy built files to root
git show master:dist/index.html > index.html
git show master:dist/manifest.json > manifest.json
git show master:dist/sw.js > sw.js

git add index.html manifest.json sw.js
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" --allow-empty
git push origin gh-pages

git checkout master
git stash pop -q 2>/dev/null || true

echo "Deployed! https://ffflob.github.io/Dark-Fantasy-Game/"
