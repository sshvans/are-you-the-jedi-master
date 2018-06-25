import boto3
import json
import decimal

s3region = 'us-west-2'
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
leaderboardTable = 'cikey-JediLeaderboardTable-A5FQQ1GM6416'
jediMastersTable = 'cikey-JediMastersTable-WCS3W7TPNABI'


class DecimalEncoder(json.JSONEncoder):
  # Helper class to convert a DynamoDB item to JSON.
  def default(self, o):
    if isinstance(o, decimal.Decimal):
      if o % 1 > 0:
        return float(o)
      else:
        return int(o)
    return super(DecimalEncoder, self).default(o)

def scoreTotal(nickname):
  dynamodb = boto3.resource('dynamodb', region_name=s3region)
  table = dynamodb.Table(jediMastersTable)
  response = table.get_item(
    Key={
      'nick_name': nickname
    }
  )
  scores = response['Item']['scores'].values()
  avg = float(sum(scores))/len(scores)
  return str(avg)


def updateLeaderboard(nickname):
  dynamodb = boto3.resource('dynamodb', region_name=s3region)
  table = dynamodb.Table(leaderboardTable)
  try:
    response = table.update_item(
      Key={
        'all_scores': 'dummy'
      },
      UpdateExpression="set scores." + nickname + " = :s",
      ExpressionAttributeValues={
        ':s': decimal.Decimal(scoreTotal(nickname))
      },
      ReturnValues="UPDATED_NEW"
    )
  except:
    scoresData = {
      'all_scores': 'dummy',
      'scores': {
        nickname: decimal.Decimal(scoreTotal(nickname))
      }
    }
    response = table.put_item(
      Item=scoresData
    )
  print(json.dumps(response, indent=4, cls=DecimalEncoder))

def refreshLeaderboardTable():
  items = dynamodb.Table(jediMastersTable).scan()
  nickNames = [x['nick_name'] for x in items['Items']]
  for nickName in nickNames:
    updateLeaderboard(nickName)

def initLeaderboardTable():
  scoresData = {
    'all_scores': 'dummy',
    'scores': {
    }
  }
  leaderTable = dynamodb.Table(leaderboardTable)
  items = leaderTable.scan()
  itemCount = len(items['Items'])
  if not itemCount:
    print("Initialized empty scores dict")
    leaderTable.put_item(Item = scoresData)
  else:
    print("Table already initialized")


if __name__ == '__main__':
    # initLeaderboardTable()
    refreshLeaderboardTable()


