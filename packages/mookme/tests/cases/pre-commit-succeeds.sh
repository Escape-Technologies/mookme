#!/bin/bash

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init
git commit --allow-empty -m "first commit"
mkdir -p package1
mkdir -p package1/.hooks
mkdir -p parent1/package2
mkdir -p parent1/package3
mkdir -p parent1/package3/.hooks
touch package1/tobedeleted.txt

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --added-behaviour exit \
    --skip-types-selection

{
  echo '#!/usr/bin/env bash'
  echo 'basename "$(pwd)"'
} > .hooks/partials/get-dir-name
chmod +x .hooks/partials/get-dir-name

echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello'"}]}' > .hooks/pre-commit.json
echo '{"type": "txt", "steps": [{"name": "Ignore deleted files", "command": "cat {matchedFiles}"}]}' > package1/.hooks/pre-commit.json
echo '{"steps": [{"name": "Hello world !", "command": "[  $(get-dir-name) = 'package3' ]"}]}' > parent1/package3/.hooks/pre-commit.json

git add .
node $ROOT_FOLDER/dist/index.js run -t pre-commit

git commit -m "test: commit" --no-verify
rm package1/tobedeleted.txt
git add .

node $ROOT_FOLDER/dist/index.js run -t pre-commit
