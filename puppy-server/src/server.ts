import net from 'node:net'

const sockets = new Set<net.Socket>()

function broadcast(sender: net.Socket, message: Buffer) {
  sockets.forEach(socket => {
    if (socket === sender) return
    socket.write(message)
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
    console.log(`Broadcasting message from ${getSocketAddress(socket)}`)
    broadcast(socket, data)
  })
}

export const server = net.createServer(connectionHandler)
