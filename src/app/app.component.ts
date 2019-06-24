import { Component, OnInit, ViewChild ,ElementRef} from '@angular/core';

declare var lottie:any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  @ViewChild('preload', { static: true }) preload:ElementRef

  ngOnInit(){

    lottie.loadAnimation({
      container: this.preload.nativeElement, 
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/load.json'
    });

  }

}
