#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jun 11 17:24:58 2018

@author: dhruvinpatel
"""

import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

table = dynamodb.Table('AcademicCal')

with open("academicCal.json") as json_file:
    events = json.load(json_file)
    events =  events['academicCal']
    for event in events:
        event = event["Item"]
        date = event['Date']
        oneEvent = event["Event"]
        semester = event["Semester"]

        table.put_item(
           Item={
                'Date': date,
                'Event': oneEvent,
                'Semester': semester
            }
        )
