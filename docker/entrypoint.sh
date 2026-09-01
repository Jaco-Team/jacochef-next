#!/bin/sh
set -eu

if [ ! -d /app/node_modules/.bin ]; then
    mkdir -p /app/node_modules
    cp -a /opt/node_modules/. /app/node_modules/
fi

chown -R node:node /app/node_modules
gosu node node scripts/copy-tinymce.js
exec gosu node "$@"
