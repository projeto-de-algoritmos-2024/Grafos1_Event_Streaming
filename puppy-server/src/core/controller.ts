import { Graph } from '@dagrejs/graphlib'
import net from 'node:net'
import { MessageCodec, OperationMessage, ResponseMessage } from '../message'
import { randomUUID } from 'node:crypto'

export class Controller {
  g: Graph
  constructor() {
    this.g = new Graph()
  }

  private getSocketAddress(socket: net.Socket): string {
    const address = socket.remoteAddress
    const port = socket.remotePort
    const family = socket.remoteFamily

    if (family === 'IPv4') return `${address}:${port}`
    return `[${address}]:${port}`
  }

  addSocket(socket: net.Socket) {
    this.g.setNode(this.getSocketAddress(socket), socket)
  }

  private publish(message: OperationMessage): void {
    const topic = message.topic
    const subscribers = this.g.neighbors(topic)

    if (!subscribers) {
      this.g.setNode(topic)
      return
    }

    const event = new OperationMessage({
      data: message.data,
      operation: 'MESSAGE',
      topic,
      messageId: message.messageId
    })

    subscribers.forEach(node => {
      const socket: net.Socket = this.g.node(node)
      socket.write(MessageCodec.encode(event))
    })
  }

  private subscribe(socket: net.Socket, message: OperationMessage) {
    const topic = message.topic
    if (!this.g.hasNode(topic)) {
      this.g.setNode(topic)
    }
    const socketKey = this.getSocketAddress(socket)
    if (!this.g.hasNode(socketKey)) {
      this.addSocket(socket)
    }

    this.g.setEdge(topic, socketKey)
  }

  handle(socket: net.Socket): (data: Buffer) => void {
    return (data) => {
      try {
        const message = MessageCodec.decode(data)

        if (message instanceof ResponseMessage) {
          console.log(`Received response => ${message}`)
          return
        }

        if (message.operation === 'PUBLISH') {
          this.publish(message)
          socket.write(MessageCodec.encode(new ResponseMessage({
            messageId: message.messageId,
            status: 'OK'
          })))
        }
        
        if (message.operation === 'SUBSCRIBE') {
          this.subscribe(socket, message)
        }
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
    }
  }
}