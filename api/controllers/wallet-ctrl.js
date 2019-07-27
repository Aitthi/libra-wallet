import { 
  LibraClient, 
  LibraNetwork, 
  LibraWallet 
} from 'libra-core'

import BigNumber from 'bignumber.js'

export default class oxiseLibraWallet{

    constructor(){

    }


    async walletCreate(req, res) {
      try{

        let client = new LibraClient({ network: LibraNetwork.Testnet })
        let wallet = new LibraWallet()
        let account = wallet.newAccount()
        let address = account.getAddress().toHex()
        let amount = 100
        await client.mintWithFaucetService(address, BigNumber(amount).times(1e6).toString(10))
  
        let model = {
          address: address,
          mnemonic: wallet.config.mnemonic,
          balance: amount
        }
  
        res.json(model)

      }catch(err){
        res.status(400).json({message: err.message})
      }
    }



    async getBalance(req, res){
      try{
        let input = req.body

        let client = new LibraClient({ network: LibraNetwork.Testnet })
        let state = await client.getAccountState(input.address)
        let balance = BigNumber(state.balance.toString(10))
        balance = balance.dividedBy(BigNumber(1e6))
        let model = {
          address: input.address,
          mnemonic: input.mnemonic,
          balance: balance
        }
  
        res.json(model)

      }catch(err){
        res.status(400).json({message: err.message})
      }
    }



    async transfer(req, res){

      try{
        let input = req.body

        let client = new LibraClient({ network: LibraNetwork.Testnet })
        let wallet = new LibraWallet({ mnemonic: input.mnemonic })
        let account = wallet.newAccount()
        let amount = BigNumber(input.amount).times(1e6)
        let transferCoins = await client.transferCoins(account, input.toAddress, amount)
        await transferCoins.awaitConfirmation(client);

        res.json({
          amount: input.amount,
          address: input.address,
          to: input.toAddress
        })

      }catch(err){
        res.status(400).json({message: err.message})
      }

    }
 
    async access(req, res){
      try{
        let input = req.body

        let client = new LibraClient({ network: LibraNetwork.Testnet })
        let wallet = new LibraWallet({ mnemonic: input.mnemonic })
        let account = wallet.newAccount()
        account  = account.getAddress().toHex()
        let state = await client.getAccountState(account)
        let balance = BigNumber(state.balance.toString(10))
        balance = balance.dividedBy(BigNumber(1e6))
        res.json({
          address: account,
          mnemonic: input.mnemonic,
          balance: balance
        })

      }catch(err){
        res.status(400).json({message: err.message})
      }
    }


}