import net from 'node:net'
import { MessageCodec, ResponseMessage } from 'puppy-server/src/message'


const socket = net.createConnection({
  port: 7893
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
