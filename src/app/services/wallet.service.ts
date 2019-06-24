import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor(
    private _http: HttpClient
  ) { }


  createWallet(){
    return this._http.get('/api/v1/wallet/create').toPromise()
  }

  getBalance(data:any){
    return this._http.post('/api/v1/wallet/balance', data).toPromise()
  }

  transfer(data:any){
    return this._http.post('/api/v1/wallet/transfer', data).toPromise()
  }

  access(data:any){
    return this._http.post('/api/v1/wallet/access', data).toPromise()
  }

}
