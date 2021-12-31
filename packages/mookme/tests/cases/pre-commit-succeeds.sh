#!/bin/bash

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init
mkdir -p package1
mkdir -p parent1/package2
mkdir -p parent1/package3

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --packages package1 "parent1/package2" "parent1/package3" \
    --added-behaviour exit \
    --skip-types-selection \
    --packages-path ""

{
  echo '#!/usr/bin/env bash'
  echo 'basename "$(pwd)"'
} > .hooks/partials/get-dir-name
chmod +x .hooks/partials/get-dir-name

echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello'"}]}' > .hooks/pre-commit.json
echo '{"steps": [{"name": "Hello world !", "command": "[  $(get-dir-name) = 'package3' ]"}]}' > parent1/package3/.hooks/pre-commit.json

git add .
node $ROOT_FOLDER/dist/index.js run -t pre-commit