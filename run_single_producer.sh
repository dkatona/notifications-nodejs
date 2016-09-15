#!/bin/bash

PORT=${1:-8080}

docker run -d -p $PORT:$PORT -e PORT=$PORT -v "$PWD"/config:/usr/src/app/config --network=notificationsnodejs_default producer