import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'
import net from 'node:net'
import { Message, MessageCodec, OperationMessage, ResponseMessage } from 'puppy-server/src/message'


const socket = net.createConnection({
  port: 7893
})

const toConfirm = new Set()

function createMessage(): Message {
  return new OperationMessage({
    operation: 'PUBLISH',
    topic: `/${faker.word.words(3).replace(' ', '/')}/`,
    messageId: randomUUID(),
    data: Buffer.from(faker.hacker.phrase())
  })
}

const interval = setInterval(() => {
  const message = createMessage()
  socket.write(MessageCodec.encode(message))
  toConfirm.add((message as OperationMessage).messageId)
}, 1000)

const interval2 = setInterval(() => {
  socket.write('This is a faulty message!')
}, 4000)

socket.on('data', data => {
  const message = MessageCodec.decode(data)
  if (!(message instanceof ResponseMessage)) return

  if (message.status === 'OK') {
    console.log(`Received confirmation for message - ${message.messageId}`)
    toConfirm.delete(message.messageId)
  }

  if (message.status === 'ERROR') {
    console.error('Something went wrong:')
    console.log(`${message.status} - ${message.details}`)
  }
})

socket.on('close', () => {
  clearInterval(interval)
  clearInterval(interval2)
})

socket.on('error', () => {
  clearInterval(interval)
})