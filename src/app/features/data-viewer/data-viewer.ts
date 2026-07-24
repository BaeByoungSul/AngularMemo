import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FireDataService } from '../../core/fire-data-service';
import { AsyncPipe, JsonPipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-data-viewer',
  imports: [
    AsyncPipe,
    KeyValuePipe,
    JsonPipe
  ],
  templateUrl: './data-viewer.html',
  styleUrl: './data-viewer.css'
})
export class DataViewer {
  userData$ : Observable<any>;

  constructor(private dataService$:FireDataService){
    this.userData$ = this.dataService$.getMyData$;
  }
}
