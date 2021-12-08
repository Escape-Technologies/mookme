#!/bin/bash

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init
mkdir -p package1

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --packages package1 \
    --added-behaviour exit \
    --packages-path ""

echo '{"steps": [{"name": "Oups", "command": "exit 1"}]}' > package1/.hooks/pre-commit.json

git add .
! node $ROOT_FOLDER/dist/index.js run -t pre-commit