#!/bin/bash

docker run -d -v "$PWD"/config:/usr/src/app/config --network=notificationsnodejs_default consumer