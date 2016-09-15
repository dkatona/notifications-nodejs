#!/bin/bash

ID=${1:-1234}
NAME=${2:-"New API document"}

curl -X POST -H "Content-Type: application/json" --data '{"event_type": "api_description_document.changed", "data": {"id" : "'"$ID"'", "name" : "'"$NAME"'",
"url" : "/documents/1234", "changed_by" : {"user_id" : "12345","username" : "dusan.katona"}}}' http://localhost:8080/notifications