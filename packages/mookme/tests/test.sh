#!/bin/bash

CASES_FOLDER=$(realpath $(dirname "$0")/cases)

cd $CASES_FOLDER

for CASE in ./*
do
  ./$CASE > ../logs/$CASE.output.log
  if [ $? == 0 ]; then echo "$CASE > success"; else echo "$CASE > failure" && exit 1; fi
done
