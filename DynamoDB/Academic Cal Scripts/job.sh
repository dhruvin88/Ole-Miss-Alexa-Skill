#!/bin/sh
python parseAcademicTable.py
python deleteTable.py
sleep 180s # Waits 2 minutes.
python createAcademicCal.py
sleep 15s # Waits 15 seconds.
python uploadCalData.py