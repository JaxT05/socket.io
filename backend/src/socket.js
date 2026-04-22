import jwt from 'jsonwebtoken'
import { getUserInfoById } from './services/users.js'
import {
  joinRoom,
  sendPublicMessage,
  getUserInfoBySocketId,
} from './services/chat.js'

export function handleSocket(io) {
  io.on('connection', async (socket) => {
    joinRoom(io, socket, { room: 'public' })
    socket.on('chat.message', (room, message) =>
      sendPublicMessage(io, {
        username: socket.user.username,
        room,
        message,
      }),
    )
    socket.on('chat.join', (room) => joinRoom(io, socket, { room }))
    socket.on('user.info', async (socketId, callback) =>
      callback(await getUserInfoBySocketId(io, socketId)),
    )
  })
  io.use((socket, next) => {
    if (!socket.handshake.auth?.token) {
      return next(new Error('Authentication failed: no token provided'))
    }

    jwt.verify(
      socket.handshake.auth.token,
      process.env.JWT_SECRET,
      async (err, decodedToken) => {
        if (err) {
          return next(new Error('Authentication failed: Invalid Token'))
        }
        socket.auth = decodedToken
        socket.user = await getUserInfoById(socket.auth.sub)
        return next()
      },
    )
  })
  //   io.on('connection', (socket) => {
  //     console.log('A user connected: ', socket.id)
  //     const room = socket.handshake.query?.room ?? 'public'
  //     socket.join(room)
  //     console.log(socket.id, ' joined room: ', room)
  //     socket.on('disconnect', () => {
  //       console.log(`User ${socket.id} disconnected`)
  //     })
  //     socket.on('chat.message', (message) => {
  //       console.log(`${socket.id}: ${message}`)

  //       io.to(room).emit('chat.message', {
  //         username: socket.user.username,
  //         message,
  //       })
  //     })
  //     socket.on('user.info', async (socketId, callback) => {
  //       const sockets = await io.in(socketId).fetchSockets()
  //       if (sockets.length === 0) return callback(null)
  //       const socket = sockets[0]
  //       const userInfo = {
  //         socketId,
  //         rooms: Array.from(socket.rooms),
  //         user: socket.user,
  //       }
  //       return callback(userInfo)
  //     })
  //   })
}
