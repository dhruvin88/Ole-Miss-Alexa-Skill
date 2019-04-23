# -*- coding: utf-8 -*-
import feedparser
import re
import json

def convertTime(time):
    time = time.split(":")
    amOrPM = "AM"
    if int(time[0]) > 12:
        time[0] = str(int(time[0]) - 12)
        amOrPM = "PM"
    return time[0]+":"+time[1]+ " "+amOrPM


rssFeed = feedparser.parse('https://olemisssports.com/calendar.ashx/calendar.rss')

data = {}
data["Sports"] = []
for item in rssFeed.entries:

    startdate = item.s_localstartdate
    date = startdate[5:7]+"/"+startdate[8:10]+"/"+startdate[2:4]
    if len(startdate) == 10:
        time = "TBA"
    else:
        time = startdate[11:16]
        time = convertTime(time)

    idStr = item.id[43:]
    locationWhere = item.ev_location
    if locationWhere == "":
        locationWhere = 'TBA'

    summary = item.summary.split('\\n')
    summaryReturn = ""
    if len(summary) >= 3:
        if summary[1][:1] == 'W' or summary[1][:1] == 'L':
            summary[0] = summary[0][4:]
            summary[1] = summary[1][:1]+","+summary[1][1:]
            summaryReturn = summary[1]
    if summaryReturn == "":
        summaryReturn = time


    event = re.split(" at | vs ",summary[0][26:])

    print(idStr + " " +date+" "+event[1]+" "+ locationWhere + " " + event[0] + " "+summaryReturn)

    item = {'eventId': int(idStr), \
            'Date': date, \
            "SportType": event[0] , \
            "Event": event[1], \
            "Summary": summaryReturn, \
            "LocationWhere": locationWhere }
    item = {"Item": item}

    data["Sports"].append(item)


with open('sports.json', 'w') as f:
  json.dump(data, f, ensure_ascii=False)
