import decimal
import json
import os
import re
import sys
import time
import traceback

import boto3
import zmq

from op_server import ddb_util
from op_server import ddr_config
from op_server import ddr_score

s3bucket = ddr_config.get_config('s3_bucket')
s3region = ddr_config.get_config('s3_bucket_region')
queueUrl = ddr_config.get_config('sqs_url')
numServers = int(ddr_config.get_config('num_op_servers'))
numPoses = int(ddr_config.get_config('num_poses'))
jediMastersTable = ddr_config.get_config('jedi_masters_table')
leaderboardTable = ddr_config.get_config('jedi_leaderboard_table')



def poll_sqs():
    sqs = boto3.client('sqs', region_name=s3region)

    response = sqs.receive_message(
        QueueUrl=queueUrl
    )

    try:
        messages = response['Messages']
        #    print(messages)

        receiptHandles = [x['ReceiptHandle'] for x in messages]
        msgBodies = [json.loads(x['Body']) for x in messages]

        s3Keys = [x['Records'][0]['s3']['object']['key'] for x in msgBodies]
        print(s3Keys)

        fileQueue = []

        serverIndex = 0
        for s3Key in s3Keys:
            s3filename = str(s3Key)
            start_time = time.time()
            print(s3filename)
            lastSlashIndex = s3filename.rfind('/')
            filename = s3filename[lastSlashIndex + 1: len(s3filename)]
            serverIndex += 1

            result = processOpenpose(s3bucket, s3filename, filename, serverIndex, numServers)

            elapsed_time = time.time() - start_time

            print("Processed s3 file in: " + str(elapsed_time))

            if result.decode() == "Done.":
                print("Processed image {}".format(s3filename))


        for receipt in receiptHandles:
            sqs.delete_message(
                QueueUrl=queueUrl,
                ReceiptHandle=receipt
            )
    except Exception as e:
        print(str(e))
        traceback.print_exc()
        print("No messages in sqs")

def num_groups(regex):
    return re.compile(regex).groups

def imageInfo(fileName):
    regex = '(.*)(_pose)([0-9])(.jpg)'
    p = re.compile(regex)
    m = p.match(fileName)
    return m.group(1), m.group(3)

def processOpenpose(s3bucket, s3filename, filename, serverIndex, numServers):

    start_time = time.time()
    s3 = boto3.resource('s3', region_name=s3region)

    s3.Bucket(s3bucket).download_file(s3filename, os.path.expanduser('~') + '/' + s3filename)
    result = processImage(filename, 5555 + serverIndex % numServers)
    print("Server result: " + str(result))

    (nickname, poseNum) = imageInfo(filename)
    jediJsonFile = os.path.expanduser('~') + '/json/jedi_pose{}.json'.format(poseNum)
    nicknameJsonFile = os.path.expanduser('~') + '/json/{}_pose{}.json'.format(nickname, poseNum)
    poseScore = ddr_score.fetch_score(jediJsonFile, nicknameJsonFile)

    try:
        saveScore(nickname, poseNum, poseScore)
    except Exception as e:
        traceback.print_exc()
        print(str(e))

    if int(poseNum) == numPoses:
        try:
            updateLeaderboard(nickname)
        except Exception as e:
            traceback.print_exc()
            print(str(e))

    if result.decode() == "Done.":
        # heappush(fileQueue, filename)
        rendered_file = filename.replace(".jpg", "_rendered.png")
        s3.Bucket(s3bucket).upload_file(os.path.expanduser('~') + '/rendered/' + rendered_file,
                                       'rendered/' + rendered_file)

    elapsed_time = time.time() - start_time
    print("Processed openpose in: " + str(elapsed_time))

    return result

def updateLeaderboard(nickname):
    dynamodb = boto3.resource('dynamodb', region_name=s3region)
    table = dynamodb.Table(leaderboardTable)
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
    print(json.dumps(response, indent=4, cls=ddb_util.DecimalEncoder))


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


def saveScore(nickname, poseNum, score):
    dynamodb = boto3.resource('dynamodb', region_name=s3region)
    table = dynamodb.Table(jediMastersTable)
    response = table.update_item(
        Key={
            'nick_name': nickname
        },
        UpdateExpression="set scores.pose" + str(poseNum) + " = :s",
        ExpressionAttributeValues={
            ':s': decimal.Decimal(str(score))
        },
        ReturnValues="UPDATED_NEW"
    )
    print(json.dumps(response, indent=4, cls=ddb_util.DecimalEncoder))


def processImage(filename, serverIndex):
    context = zmq.Context()

    socket = context.socket(zmq.REQ)
    socket.connect("tcp://localhost:" + str(serverIndex))

    #  Send request
    socket.send_string(filename + '\0')

    #  Get the reply.
    message = socket.recv()
    return message

def initLeaderboardTable():
    dynamodb = boto3.resource('dynamodb', region_name=s3region)
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


def main(argv):
    initLeaderboardTable()
    while True:
        # Run forever, poll queue for new messages, sleeping 100ms in between
        poll_sqs()
        time.sleep(0.1)

        #print(response['Messages'][0]['Body'])
        #print(response['Messages'][0]['Body']['Records'][1])
        #print(response['Messages'][1]['Body'])
        #print(response)


if __name__ == '__main__':
    main(sys.argv[1:])

