const express = require('express')
const path = require('path')
const cors = require('cors')
const FileUpload = require('express-fileupload')


const app = express()

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json())
app.use(FileUpload());
app.use(cors())



app.use('/blogs', require('./routers/BlogRouter'));


app.listen(3000, function() {
  console.log('server is running on port: 3000');
})