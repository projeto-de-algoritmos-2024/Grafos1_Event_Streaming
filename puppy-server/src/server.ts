import net from 'node:net'
import { Message } from './message/message'
import { MessageCodec } from './message/codec'
import { OperationMessage } from './message/operation'
import { ResponseMessage } from './message'
import { randomUUID } from 'node:crypto'

const sockets = new Set<net.Socket>()

function broadcast(sender: net.Socket, message: Message) {
  sockets.forEach(socket => {
    if (socket === sender) return
    socket.write(MessageCodec.encode(message))
  })
}

function getSocketAddress(socket: net.Socket): string {
  const address = socket.remoteAddress
  const port = socket.remotePort
  const family = socket.remoteFamily

  if (family === 'IPv4') return `${address}:${port}`
  return `[${address}]:${port}`
}

function connectionHandler(socket: net.Socket) {
  sockets.add(socket)

  socket.on('data', data => {
    try {
      const message = MessageCodec.decode(data)
      if (message instanceof ResponseMessage) {
        console.log(`Received response`)
        return
      }

      if (message instanceof OperationMessage) {
        console.log(`Received operation ${message.operation} from ${getSocketAddress(socket)}`)
      }

      console.log(`Broadcasting message from ${getSocketAddress(socket)}`)
      broadcast(socket, message)

      const response = MessageCodec.encode(new ResponseMessage({
        messageId: message.messageId,
        status: 'OK',
        details: message.operation === 'PUBLISH' ? 'Successfully published message' : null
      }))

      socket.write(response)
    } catch(err) {
      console.log('Wrong message format')
      const response = MessageCodec.encode(new ResponseMessage({
        messageId: randomUUID(),
        status: 'ERROR',
        details: JSON.stringify({
          error: (err as Error).toString(),
          message: data.toString()
        })
      }))
      socket.write(response)
    }
  })

  socket.on('close', () => {
    sockets.delete(socket)
  })
}

export const server = net.createServer(connectionHandler)
