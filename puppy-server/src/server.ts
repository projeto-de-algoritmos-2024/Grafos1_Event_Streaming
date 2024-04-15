import net from 'node:net'
import { Controller } from './core/controller'

const controller = new Controller()

function connectionHandler(socket: net.Socket) {
  controller.addSocket(socket)
  socket.on('data', controller.handle(socket))
}

export const server = net.createServer(connectionHandler)
