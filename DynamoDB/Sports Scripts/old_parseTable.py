"""
Created on Thu May 24 17:46:28 2018

@author: dhruvinpatel
"""
import time
import requests
import json
import bs4

#Parse Ole Miss Sports Calendar
response = requests.get('https://olemisssports.com/calendar.aspx')
print(response)
soup = bs4.BeautifulSoup(response.text,"lxml")
days = []
for tr in soup.findAll('tr'):
    for td in tr.findAll('td'):
        oneEvent = td.text.strip()
        oneEvent = oneEvent.split("\n")
        try:
            oneEvent[0] = int(oneEvent[0])
        except ValueError as verr:
            pass # do job to handle: s does not contain anything convertible to int
        if isinstance(oneEvent[0], int):
            oneEvent[0] = str(oneEvent[0])
            [oneEvent.remove("") for i in oneEvent if i == ""]
            oneEvent = [i.strip(" ") for i in oneEvent]
            oneEvent = [i.strip("\t\n") for i in oneEvent]
            days.append(oneEvent)

#Create Json format for the events
month = time.strftime("%m")
year = time.strftime("%y")
data = {}
idNum = 1
data["Sports"] = []
for day in days:
    dayNum = day[0]
    if len(dayNum) == 1:
        dayNum = "0"+dayNum
    if len(day) != 1:
        item = []
        date = str(month)+"/"+str(dayNum)+"/"+str(year)
        for i in range(1,len(day),5):
            sport = day[i]
            against = day[i+1]
            summary = day[i+2]
            location = day[i+3]

            item = {'eventId': idNum, \
                    'Date': date, \
                    "SportType": sport , \
                    "Event": against, \
                    "Summary": summary, \
                    "LocationWhere": location }

            item = {"Item": item}

            data["Sports"].append(item)
            idNum = idNum + 1

with open('sports.json', 'w') as f:
  json.dump(data, f, ensure_ascii=False)
