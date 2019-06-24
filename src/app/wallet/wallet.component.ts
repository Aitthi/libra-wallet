import { Component, OnInit } from '@angular/core';
import { WalletService } from '../services/wallet.service';
declare var $:any,saveAs:any;
declare var navigator: any;

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {


  width: number = 100;
  height: number = 100;
  myParams: object = {};

  wallet:any
  walletList:any[] = []

  _send_model:any = {
    toAddress: '',
    amount: 10
  }


  constructor(
    private _wallet: WalletService
  ) {


    this.myParams = {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: {
          type: "circle",
          stroke: { width: 0, color: "#000000" },
          polygon: { nb_sides: 5 }
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false }
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: false, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 }
        }
      },
      retina_detect: true
    };

  }

  async ngOnInit() {
    this._init()
    setInterval(()=>{
      this._init()
    },20000)
  }

  _init(){
    try{
      let _data:any = localStorage.getItem('_wallet_data')
      _data = JSON.parse(_data)
      if(_data.length > 0){
        this.walletList = [..._data]

        for(let obj of this.walletList){
          this._wallet.getBalance(obj).then((res:any)=>{
            var _check = this.walletList.find(x => x.address == res.address)
            if(_check){
              _check.balance = res.balance
            }
            localStorage.setItem('_wallet_data', JSON.stringify(this.walletList))
          }).catch(err=>{})
        }        
      }      
    }catch(err){}
  }


  wallettModal:boolean = false
  createWallet(){
    $('#preload').fadeIn()
    this._wallet.createWallet().then((res:any) =>{
      if(res.mnemonic !== "" && res.address !== ""){
        this.walletList = [...this.walletList, {...res}]
        localStorage.setItem('_wallet_data', JSON.stringify(this.walletList))
        this.wallettModal = true
        this.wallet = res
        $('#preload').fadeOut()
      }else{
        $('#preload').fadeOut()
        alert("error : Failed to create account")
      }
      
    }).catch(err =>{
        $('#preload').fadeOut()
        alert("error : Failed to create account")
    })
  }

  saveWallett(){
    var blob = new Blob([this.wallet.mnemonic],
                { type: "text/plain;charset=utf-8" });
    saveAs(blob, `mnemonic_${this.wallet.address}.txt`);
    setTimeout(() => {
      window.location.reload()
    },100);
  }

  transfer_state:boolean = false
  transfer_select:any = {}
  openSend(obj:any){
    this.transfer_select = {...obj}
    this.transfer_state = true
  }
  closeSend(){
    this.transfer_state = false
    this._send_model = {
      toAddress: '',
      amount: 10
    }
  }
  transfer(){
    var _model = {
      address: this.transfer_select.address,
      mnemonic: this.transfer_select.mnemonic,
      toAddress: `${this._send_model.toAddress}`.trim(),
      amount: this._send_model.amount
    }

    if(_model.toAddress !== "" && _model.amount > 0 && _model.toAddress !== _model.address){
      $('#preload').fadeIn()
      this._wallet.transfer(_model).then(res =>{
        this._init()
        this.closeSend()
        $('#preload').fadeOut()
      }).catch(err =>{
        this._init()
        this.closeSend()
        $('#preload').fadeOut()
      })
    }

  }

  copy(text:string) {
    try {
      navigator.clipboard.writeText(text).then(res => {
        
      });
    } catch (err) {}
  }

  access_model:string = ''
  access_state:boolean = false
  openAccess(){
    this.access_state = true
  }
  closeAccess(){
    this.access_state = false
    this.access_model = ''
    $('#preload').fadeOut()
  }
  access(){
    $('#preload').fadeIn()
    this._wallet.access({
      mnemonic: this.access_model
    }).then((res:any) =>{
      //console.log(res)
      if(res.address !== "" && res.mnemonic){
        var _check = this.walletList.find(x => x.address == res.address)
        if(!_check){
          this.walletList = [...this.walletList, {...res}] 
          localStorage.setItem('_wallet_data', JSON.stringify(this.walletList))
        }
      }
      this.closeAccess()
    }).catch(err =>{
      this.closeAccess()
    })
  }


}
