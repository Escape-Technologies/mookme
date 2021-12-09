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
    --packages-path "" > /dev/null

mkdir -p package2

! node $ROOT_FOLDER/dist/index.js add-pkg -p not-existent > /dev/null
node $ROOT_FOLDER/dist/index.js add-pkg -p package2 > /dev/null

if [ ! "$(grep -c "package3" .mookme.json)" -eq 0 ]; then exit 1; fi;
