#!/usr/bin/env sh

CUR_DIR=`pwd`
TOP_DIR=`dirname $0`
cd $TOP_DIR

printf "\n=================[ lint ]=================\n"
npm run lint:ci
lint_rc=$?

printf "\n===============[ npm audit ]==============\n"
npm audit --audit-level=critical --production
audit_rc=$?

printf "\n================[ retire ]================\n"
retire --severity high --path src
retire_rc=$?

cd $CUR_DIR

if [ "$audit_rc" -ne 0 ] || \
   [ "$retire_rc" -ne 0 ] || \
   [ "$lint_rc" -ne 0 ] ; then
  echo "lint: $lint_rc, npm audit: $audit_rc, retire: $retire_rc"
  exit 1
fi
