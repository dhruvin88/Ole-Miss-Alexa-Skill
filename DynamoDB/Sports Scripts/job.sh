#!/bin/sh
python newParseTable.py
python deleteTable.py
sleep 190s # Waits 2 minutes.
python createTable.py
sleep 60s # Waits 15 seconds.
python uploadData.py
