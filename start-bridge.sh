#!/bin/bash
pkill -f gateway-bridge.mjs 2>/dev/null
sleep 1
export NODE_PATH=/usr/lib/node_modules
nohup node /home/ubuntu/gateway-bridge.mjs > /home/ubuntu/bridge.log 2>&1 &
BPID=$!
sleep 3
echo "Bridge PID: $BPID"
echo "--- Bridge Log ---"
cat /home/ubuntu/bridge.log
echo "--- Running? ---"
ps aux | grep gateway-bridge | grep -v grep
