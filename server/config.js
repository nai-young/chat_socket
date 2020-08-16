const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')
const io = require('socket.io')(http)
const mongoose = require('mongoose')

const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://admin:mongopass@cluster0.mczp6.mongodb.net/chat_mern?retryWrites=true&w=majority'
const port = process.env.PORT || 4000

const Message = require('./Message')

mongoose.connect(mongoUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.log('Connected to database')
})

app.use(express.static(path.join(__dirname, '..', 'client', 'build')))

io.on('connection', (socket) => {
  Message.find().sort({ createdAt: -1 }).limit(10).exec((err, msgs) => {
    if (err) return err
    socket.emit('init', msgs)
  })

  socket.on('message', (msg) => {
    const message = new Message({
      name: msg.name,
      content: msg.content
    })
    message.save(err => {
      if (err) return err
    })
    socket.broadcast.emit('push', msg)
  })
})
http.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})