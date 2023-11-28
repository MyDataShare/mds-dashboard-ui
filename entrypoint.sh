#!/usr/bin/env sh

set -o errexit

set | grep '^REACT_APP_' | cut -d = -f 1 | xargs -I % bash -c 'i=%; echo -n "\"${i}\":\"${!i}\","' | sed -e 's/^/window._env_=\{/' -e 's/,$/\}/' > env.js
cat /usr/share/nginx/html/index.html.orig | sed -e 's"window._env_={}"\n// Created and inlined from environment\n\n"' | sed -e '/\/\/ Created and inlined from environment/r env.js' >/usr/share/nginx/html/index.html

nginx -g 'daemon off;'
