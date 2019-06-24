import express from 'express'
import LibraWallet from './controllers/wallet-ctrl'

const app = express.Router()

app.get('',(req, res)=>{
    res.send('Libra api')
})

app.get('/wallet/create', (req, res)=>{
    var _LibraWallet = new LibraWallet()
    _LibraWallet.walletCreate(req, res)
})
app.post('/wallet/balance', (req, res)=>{
    var _LibraWallet = new LibraWallet()
    _LibraWallet.getBalance(req, res)
})
app.post('/wallet/transfer', (req, res)=>{
    var _LibraWallet = new LibraWallet()
    _LibraWallet.transfer(req, res)
})

app.post('/wallet/access', (req, res)=>{
    var _LibraWallet = new LibraWallet()
    _LibraWallet.access(req, res)
})

export default app