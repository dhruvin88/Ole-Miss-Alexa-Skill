import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime, timedelta
import requests
import bs4

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
response = requests.get('http://www.olemisssports.com/calendar/events')

def scan_table(table_name, filter_key=None, filter_value=None):
    """
    Perform a scan operation on table.
    Can specify filter_key (col name) and its value to be filtered.
    """
    table = dynamodb.Table(table_name)

    if filter_key and filter_value:
        filtering_exp = Key(filter_key).eq(filter_value)
        response = table.scan(FilterExpression=filtering_exp)
    else:
        response = table.scan()

    return response

yesterday = datetime.now() - timedelta(days=1)
yesterdayString = yesterday.strftime('%m')+'/'+yesterday.strftime('%d')+"/"+yesterday.strftime('%y')

#Get Table information about event(s)
data = scan_table('Sports','Date',yesterdayString)
data = data['Items']

#parse calendar for updates
soup = bs4.BeautifulSoup(response.text,"lxml")
days = []
for tr in soup.findAll('tr',valign='top'):
    for td in tr.findAll('td'):
        oneEvent = td.text.strip()
        oneEvent = oneEvent.split("\n")
        try:
            oneEvent[0] = int(oneEvent[0])
        except ValueError as verr:
            pass # do job to handle: s does not contain anything convertible to int
        if isinstance(oneEvent[0], int):
            oneEvent[0] = str(oneEvent[0])
            if int(oneEvent[0]) == int(yesterday.strftime('%d')):
                [oneEvent.remove("") for i in oneEvent if i == ""]
                oneEvent = [i.strip(" ") for i in oneEvent]
                oneEvent = [i.strip("\t\n") for i in oneEvent]
                days.append(oneEvent)

events = []
for i in range(0,len(days[0]),5):
    event = {
            "SportType": days[0][i+1], \
            "Event": days[0][i+2], \
            "Summary": days[0][i+3], \
            "LocationWhere": days[0][i+4]
            }
    events.append(event)



#update table
table = dynamodb.Table('Sports')

for dataEvent in data:
    for i in range(0,len(events)):
        if dataEvent['Event'] == events[i]['Event']:
            new = events[i]

            date = yesterdayString
            sport = new['SportType']
            oneEvent = new["Event"]
            summary = new['Summary']
            location = new['LocationWhere']
            idNum = dataEvent["eventId"]

            table.put_item(
                    Item={
                   'eventId': idNum,
                   'Date': date,
                   'SportType': sport,
                   'Event': oneEvent,
                   'Summary': summary,
                   'LocationWhere': location,
                   }
                )
            events.remove(events[i])
            break
