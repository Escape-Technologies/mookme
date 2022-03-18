#!/bin/bash
set -e

TESTS_DIR=$(mktemp -d)

ROOT_FOLDER=$(realpath $(dirname "$0")/../..)
npm run build &> /dev/null

# create and cd in tmp folder
cd $TESTS_DIR

git init -q

mkdir -p .hooks
echo '{"steps": [{"name": "Oups", "command": "exit 1"}]}' > .hooks/post-commit.json
git add .
git commit -m "Set up hooks"

node $ROOT_FOLDER/dist/index.js init \
    --yes \
    --added-behaviour exit \
    --skip-types-selection

! node $ROOT_FOLDER/dist/index.js run -t post-commit
