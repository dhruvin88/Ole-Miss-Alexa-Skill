#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jun 11 15:00:39 2018

@author: dhruvinpatel
"""

import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

#recreate table
table = dynamodb.create_table(
    TableName='AcademicCal',
    KeySchema=[
        {
            'AttributeName': 'Event',
            'KeyType': 'HASH'  #Partition key
        },
        {
            'AttributeName': 'Date',
            'KeyType': 'RANGE'  #Sort key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'Event',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'Date',
            'AttributeType': 'S'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)