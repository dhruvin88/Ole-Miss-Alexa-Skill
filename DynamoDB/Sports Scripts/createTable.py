import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

#recreate table
table = dynamodb.create_table(
    TableName='Sports',
    KeySchema=[
        {
            'AttributeName': 'eventId',
            'KeyType': 'HASH'  #Partition key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'eventId',
            'AttributeType': 'N'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)