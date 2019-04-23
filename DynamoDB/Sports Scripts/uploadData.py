# -*- coding: utf-8 -*-
import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

table = dynamodb.Table('Sports')

with open("sports.json") as json_file:
    events = json.load(json_file)
    events =  events['Sports']
    for event in events:
        event = event["Item"]
        date= event['Date']
        sport = event["SportType"]
        oneEvent = event["Event"]
        summary = event['Summary']
        location = event['LocationWhere']
        idNum = event["eventId"]

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
