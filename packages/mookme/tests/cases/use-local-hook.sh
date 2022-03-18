#!/bin/bash
set -e

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init -q
mkdir -p package1
mkdir -p package1/.hooks

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --added-behaviour exit \
    --skip-types-selection \

echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello'"}]}' > .hooks/pre-commit.json
echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello from local' > test.txt"}]}' > .hooks/pre-commit.local.json

echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello'"}]}' > package1/.hooks/pre-commit.json
echo '{"steps": [{"name": "Hello world !", "command": "echo 'hello from package 1' > test-package.txt"}]}' > package1/.hooks/pre-commit.local.json

git add .
node $ROOT_FOLDER/dist/index.js run -t pre-commit

if [ ! "$(grep -c ".hooks/pre-commit.local.json" .gitignore)" -eq 1 ]; then exit 1; fi;
if [ ! "$(grep -c "hello from local" test.txt)" -eq 1 ]; then exit 1; fi;
if [ ! "$(grep -c "hello from package 1" package1/test-package.txt)" -eq 1 ]; then exit 1; fi;
