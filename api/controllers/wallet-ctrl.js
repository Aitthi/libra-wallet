import { spawn, exec } from 'child_process'
import { writeFile } from 'fs'

var libra_cli = `${__dirname}/../libra-cli/client`
var _args = ['--host', 'ac.testnet.libra.org', '--port', '8000', '-s', `${__dirname}/../libra-cli/trusted_peers.config.toml`]

export default class LibraWallet{

    constructor(){
      this.model = {
        address: '',
        balance: '',
        mnemonic: ''
      }
    }

    stdin(stdin, command, encoding = 'utf8') {
      return new Promise((resolve, reject) => {
          const _err = (err) => {
              stdin.removeListener('error', _err)
              reject(err)
          }
          stdin.addListener('error', _err)
          const callback = () => {
              stdin.removeListener('error', _err)
              resolve(undefined)
          }
          stdin.write(command, encoding, callback)
      })
    }

    sleep(ms){
      return new Promise((s,j)=>{
        setTimeout(() => {
          s()
        },ms)
      })
    }

    cmd(command) {
      return new Promise((s, j)=> {
          exec(command, (error, stdout, stderr) => {
              if (error) {
                  j(error)
              }
              s(stdout)
          })
      })
    }

    write_File(path, data){
      return new Promise((s, j)=> {
        writeFile(path, data, ()=>{
          s()
        })
      })
    }

    async walletCreate(req, res) {

        try{
          await this.cmd(`rm -rf ${__dirname}/../../client.mnemonic`)
        }catch(err){}

        let cmd = spawn(libra_cli, _args, {stdio: ['pipe', 'pipe', process.stderr]})
        
        this.newWallet(cmd.stdin)
        await this.stdoutWallet(cmd.stdout)

        res.json(this.model)

    }

    async newWallet(stdin){
      await this.stdin(stdin, 'account create\n')
      await this.sleep(2000)
      await this.stdin(stdin, `account mint ${this.model.address} 1337\n`)
      //await this.sleep(1500)
      await this.stdin(stdin, `account write ${__dirname}/../data_wallet/${this.model.address}.mnemonic\n`)
      await this.sleep(1500)
      var _mnemonic = await this.cmd(`cat ${__dirname}/../data_wallet/${this.model.address}.mnemonic`)
      this.model.mnemonic = _mnemonic
      await this.stdin(stdin, `query balance ${this.model.address}\n`)
      await this.sleep(1500)
      try{
        await this.cmd(`rm -rf ${__dirname}/../../client.mnemonic`)
      }catch(err){}
      await this.cmd(`rm -rf ${__dirname}/../data_wallet/${this.model.address}.mnemonic`)
      await this.stdin(stdin, 'quit\n')
    }



    async stdoutWallet(stdout){
      for await (let line of stdout){
        var _data = line.toString('utf8')
        //console.log(_data)
        var _account = _data.search('Created/retrieved account #')
        if(_account !== -1){
          var _obj =  `${_data.substr(_account).replace("Created/retrieved account #", "")}`.split(" ")
          if(_obj.length == 3){
            this.model.address = `${_obj[2]}`.replace("\n", "")
          }
        } 
        var _isBalance = _data.search('Balance is: ')
        if(_isBalance !== -1){
          var _balance = `${_data.substr(_isBalance)}`.replace('Balance is: ',"")
          _balance = `${_balance}`.replace("\n","")
          this.model.balance = _balance
        }

        var _address = _data.search("#0 address ")
        if(_address !== -1){
          var _obj =  `${_data.substr(_address).replace("#0 address ", "")}`.split(" ")
          this.model.address = `${_obj[0]}`.replace("\n", "")
          //console.log(_obj)
        }

      }

    }

    async getBalance(req, res){

      var input = {...req.body}
      //console.log(input)
      let cmd = spawn(libra_cli, _args, {stdio: ['pipe', 'pipe', process.stderr]})
      this.model.address = input.address
      this.model.mnemonic = input.mnemonic
      this.stdinBalance(cmd.stdin, input)
      await this.stdoutWallet(cmd.stdout)
      res.json(this.model)
    }

    async stdinBalance(stdin, input){
      await this.stdin(stdin, `query balance ${input.address}\n`) 
      await this.sleep(1500)
      await this.stdin(stdin, 'quit\n');
    }


    async transfer(req, res){
      var input = {...req.body}
      let cmd = spawn(libra_cli, _args, {stdio: ['pipe', 'pipe', process.stderr]})
      let stdin = cmd.stdin
      await this.write_File(`${__dirname}/../data_wallet/${input.address}.mnemonic`, input.mnemonic)
      await this.sleep(1000)
      await this.stdin(stdin, `account recover ${__dirname}/../data_wallet/${input.address}.mnemonic\n`);
      await this.sleep(1500)
      //console.log(`transfer ${input.address} ${input.toAddress} ${input.amount}\n`)
      await this.stdin(stdin, `transferb ${input.address} ${input.toAddress} ${input.amount}\n`);
      await this.sleep(1000)
      await this.stdin(stdin, 'quit\n');
      await this.cmd(`rm -rf ${__dirname}/../data_wallet/${input.toAddress}.mnemonic`)

      res.json({
        amount: input.amount,
        address: input.address,
        to: input.toAddress
      })
    }
 
    async access(req, res){
      var input = {...req.body}
      let cmd = spawn(libra_cli, _args, {stdio: ['pipe', 'pipe', process.stderr]})
      var _a = Buffer.from(input.mnemonic).toString('base64')
      await this.write_File(`${__dirname}/../data_wallet/_access_${_a}.mnemonic`, input.mnemonic)
      this.accessStdin(cmd.stdin, input)
      await this.stdoutWallet(cmd.stdout)
      if(this.model.address !== ""){
        this.model.mnemonic = input.mnemonic
      }

      try{
        await this.cmd(`rm -rf ${__dirname}/../data_wallet/_access_${_a}.mnemonic`)
      }catch(err){}
      try{
        await this.cmd(`rm -rf ${__dirname}/../data_wallet/${this.model.address}.mnemonic`)
      }catch(err){}

      res.json(this.model)
    }

    async accessStdin(stdin, input){
      var _a = Buffer.from(input.mnemonic).toString('base64')
      await this.sleep(1000)
      await this.stdin(stdin, `account recover ${__dirname}/../data_wallet/_access_${_a}.mnemonic\n`);
      await this.sleep(1500)
      if(this.model.address !== ""){
        await this.stdin(stdin, `query balance ${this.model.address}\n`) 
      }      
      await this.sleep(1000)
      await this.stdin(stdin, 'quit\n');
    }

}