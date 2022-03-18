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

echo '{"steps": [{"name": "Oups", "command": "exit 1"}]}' > package1/.hooks/pre-commit.json

git add .
! node $ROOT_FOLDER/dist/index.js run -t pre-commit
