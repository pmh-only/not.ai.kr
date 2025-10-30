import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import fs from 'fs/promises'
import OpenAI from 'openai'
import { Server as SocketIO } from 'socket.io'
import http from 'http'
import { addCooldown, isCooldown } from './utils.mjs'

const app = express()
const server = http.createServer(app)
const io = new SocketIO(server)

const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN })
const prompt = await fs.readFile('./prompt/developer_context.txt')
  .then((value) => value.toString('utf-8'))

app.use(morgan('combined'))
app.use(express.text())
app.use(express.static('./public'))
app.use('/node_modules', express.static('./node_modules'))

io.on('connection', async (socket) => {
  const remoteIp =
    socket.handshake.headers['x-forwarded-for'] ??
    socket.handshake.address

  let conversation = await openai.conversations.create({
    items: [{
      type: 'message',
      role: 'developer',
      content: prompt
    }]
  })

  socket.on('reset', async () => {
    conversation = await openai.conversations.create({
      items: [{
        type: 'message',
        role: 'developer',
        content: prompt
      }]
    })
  })

  socket.on('chat', async (message) => {
    if (isCooldown(remoteIp)) {
      socket.emit('cooldown')
      return
    }

    addCooldown(remoteIp)

    const stream = await openai.responses.create({
      model: 'gpt-5-mini',
      max_output_tokens: 1000,
      reasoning: { effort: 'low' },
      text: { verbosity: 'low' },
      store: true,
      stream: true,
      conversation: conversation.id ,
      input: [{
        role: 'user',
        content: message
      }]
    })

    for await (const chunk of stream)
      socket.emit('chat', chunk)
  })
})

server.listen(8080, () => {
  console.log('Server is now on http://localhost:8080')
})
