#! /bin/bash
cp /tmp/ddr_config.props .
nohup python -m op_server.sqs_poller > /home/ubuntu/sqs_poller.log 2>&1 &
cd /home/ubuntu/openpose
# nohup ./build/examples/tutorial_pose/op_server.bin --disable_blending > /home/ubuntu/openpose.log 2>&1 &
nohup ./build/examples/tutorial_pose/op_server.bin > /home/ubuntu/openpose.log 2>&1 &