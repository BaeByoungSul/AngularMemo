import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  showSideMenu = true;
  
  sidenavToggle($event:boolean){
    this.showSideMenu=!this.showSideMenu;
  }
  constructor(){

  }
}
