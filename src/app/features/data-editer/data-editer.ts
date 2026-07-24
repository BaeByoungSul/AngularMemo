import { Component, OnInit } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { FireDataService } from '../../core/fire-data-service';
import { AsyncPipe, JsonPipe, KeyValuePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-data-editer',
  imports: [
    AsyncPipe,
    JsonPipe,
    KeyValuePipe,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './data-editer.html',
  styleUrl: './data-editer.css'
})
export class DataEditer implements OnInit {
  userData$ : Observable<any>;
// 2. 변환된 옵저버블 (Observable<Array<{ key: string, value: string }>>)
  // processedData$: Observable<Array<{ key: string, value: string }>>;
  
  myform: FormGroup = new FormGroup({
    category: new FormControl("", [Validators.required ])
  });
  serverError: string | null = null; 
  

  constructor(
    private dataService$: FireDataService,
    
  ){ 
    this.userData$ = this.dataService$.getMyData$;
  }
  ngOnInit(): void {
    //this.userData$.subscribe()
  }

    // C: Create 실행
  onAdd(myPath: unknown) {
    
    if(typeof myPath !== 'string'){ return}

    const newFileName = prompt('새 파일 이름을 입력하세요:');
    if (newFileName) {
      const formValues = this.myform.value;
      //const mypath = formValues.path
      //const myfilename = formValues.filename;

      this.dataService$.addItem(myPath, newFileName);
    }
  }
  addCategory() {
    if (this.myform.invalid) {
      this.serverError = "form is invalid!";
      return;
    }
    const formValues = this.myform.value;
    //const mypath = formValues.path
    const myCategory = formValues.category;

    this.dataService$.addCategory(myCategory);
    

  }
  onUpdate(parentKey:unknown, fileKey: string, filename: string) {

    const newName = prompt('새 파일 이름을 입력하세요:', filename);
    if(typeof parentKey !== 'string'){ return}

    if (newName) {
      const updates: { [key: string]: string } = {};
      updates[fileKey] = newName; // { "filename1": "new_value.txt" } 형태

      this.dataService$.updateItem( parentKey,updates)
        .catch(error => console.error('업데이트 오류:', error));
    }
  }
   onDelete(parentKey: unknown, fileKey: string) {
    if (confirm('정말로 이 파일을 삭제하시겠습니까?')) {
      const deleteItem= `${parentKey}/${fileKey}`
      this.dataService$.deleteItem(deleteItem)
        .catch(error => console.error('삭제 오류:', error));
    }
  }
}
