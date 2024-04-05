import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'
import net from 'node:net'
import { Message, MessageCodec, OperationMessage } from 'puppy-server/src/message'


const socket = net.createConnection({
  port: 7893
})

function createMessage(): Message {
  return new OperationMessage({
    operation: 'PUBLISH',
    topic: `/${faker.word.words(3).replace(' ', '/')}/`,
    messageId: randomUUID(),
    data: Buffer.from(faker.hacker.phrase())
  })
}

const interval = setInterval(() => {
  socket.write(MessageCodec.encode(createMessage()))
}, 1000)

socket.on('close', () => {
  clearInterval(interval)
})

socket.on('error', () => {
  clearInterval(interval)
})