import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { handleSocket } from './socket.js'

import { userRoutes } from './routes/users.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())

userRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello World from Express!')
})

const server = createServer(app)
/* In production, set "origin" to the deployed frontend URL */
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})
handleSocket(io)

// io.on('connection', (socket) => {
//   console.log('A user connected: ', socket.id)
//   socket.on('disconnect', () => {
//     console.log(`User ${socket.id} disconnected`)
//   })
// })
export { server as app }
