#!/bin/bash
set -e

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init -q
mkdir -p .hooks/partials
mkdir -p package1
mkdir -p parent1/package2
mkdir -p parent1/package3/.hooks

{
  echo '#!/usr/bin/env bash'
  echo 'basename "$(pwd)"'
} > .hooks/partials/get-dir-name
chmod +x .hooks/partials/get-dir-name

echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello'"}]}' > .hooks/post-commit.json
echo '{"steps": [{"name": "Hello world !", "command": "[  $(get-dir-name) = 'package3' ]"}]}' > parent1/package3/.hooks/post-commit.json

git add .
git commit -m "Set up hooks"

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --added-behaviour exit \
    --skip-types-selection

node $ROOT_FOLDER/dist/index.js run -t post-commit
