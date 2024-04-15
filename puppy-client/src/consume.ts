import { randomUUID } from 'node:crypto'
import net from 'node:net'
import { MessageCodec, OperationMessage, ResponseMessage } from 'puppy-server/src/message'

const topics = process.argv[2].split(',')

const socket = net.createConnection({
  port: 7893
})

socket.on('connect', () => {
  topics.forEach(topic => {
    socket.write(MessageCodec.encode(new OperationMessage({
      messageId: randomUUID(),
      topic,
      data: null,
      operation: 'SUBSCRIBE'
    })))
  })
})

socket.on('data', data => {
  const decoded = MessageCodec.decode(data)
  if (decoded instanceof ResponseMessage) return
  console.log('===========================================')
  console.log('Received data from server')
  console.log(`Message ID: ${decoded.messageId}`)
  console.log(`Topic: ${decoded.topic}`)
  console.log(`Data: ${decoded.data?.toString()}`)
  console.log('===========================================')
})
