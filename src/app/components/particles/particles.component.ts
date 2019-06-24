import { Component, OnInit, Input } from '@angular/core';
import { IParams } from './lib';

@Component({
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.css']
})
export class ParticlesComponent implements OnInit {


  @Input() width: number = 100;
  @Input() height: number = 100;
  @Input() params: IParams;
  @Input() style: Object = {};

  constructor() { }

  ngOnInit() {
  }

}
