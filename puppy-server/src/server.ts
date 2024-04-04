import net from 'node:net'

export const server = net.createServer(socket => {
  socket.pipe(socket)
})