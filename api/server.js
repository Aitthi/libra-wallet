import express from 'express'
import bodyParser from 'body-parser'
import apiRoute from './routes'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(`${__dirname}/../dist/libra-wallet`))
app.set('view engine', 'html');

app.use('/api/v1', apiRoute)

app.get('/', (req, res)=>{
    res.sendFile(`${__dirname}/../dist/libra-wallet/index.html`)
})


app.listen(process.env.PORT || 4200, console.log('server is running'))




