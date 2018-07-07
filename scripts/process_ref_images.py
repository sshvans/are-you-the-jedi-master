import zmq

context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect("tcp://localhost:" + str(5555))

for i in range(1, 6):
  socket.send('jedi_pose{}.jpg\0'.format(i))
  message = socket.recv()
  print(message)
