import express from 'express'
import oxiseLibraWallet from './controllers/wallet-ctrl'

const app = express.Router()

app.get('',(req, res)=>{
    res.send('Libra api')
})

app.get('/wallet/create', (req, res)=>{
    var _oxiseLibraWallet = new oxiseLibraWallet()
    _oxiseLibraWallet.walletCreate(req, res)
})
app.post('/wallet/balance', (req, res)=>{
    var _oxiseLibraWallet = new oxiseLibraWallet()
    _oxiseLibraWallet.getBalance(req, res)
})
app.post('/wallet/transfer', (req, res)=>{
    var _oxiseLibraWallet = new oxiseLibraWallet()
    _oxiseLibraWallet.transfer(req, res)
})

app.post('/wallet/access', (req, res)=>{
    var _oxiseLibraWallet = new oxiseLibraWallet()
    _oxiseLibraWallet.access(req, res)
})

export default app