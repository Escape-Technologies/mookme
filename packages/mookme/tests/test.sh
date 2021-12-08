#!/bin/bash
CASES_FOLDER=$(dirname "$0")/cases


cd $CASES_FOLDER
for CASE in ./*
do
  echo $CASE
  ./$CASE > ../logs/$CASE.output.log
  if [ $? == 0 ]; then echo "$CASE > success"; else echo "$CASE > failure" && exit 1; fi
done
