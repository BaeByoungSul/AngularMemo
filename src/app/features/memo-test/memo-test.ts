import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { renderAsync } from 'docx-preview';

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Component({
  selector: 'app-memo-test',
  imports: [

  ],
  templateUrl: './memo-test.html',
  styleUrl: './memo-test.css'
})
export class MemoTest implements OnInit, AfterViewInit {


// 3. ViewChild가 확실히 존재함을 나타내기 위해 ! (Non-null assertion operator)를 사용합니다.
  @ViewChild('docxContainer') docxContainer!: ElementRef;
  
  docxData!: ArrayBuffer; /* 여기에 실제 DOCX ArrayBuffer */
  
  constructor(private http$: HttpClient){

  }
  ngOnInit(): void {
     const assetsUrl: string = `assets/IIS.docx`; // 예시 DOCX 파일 경로
    
    console.log(assetsUrl);
    
    this.http$.get(assetsUrl, { responseType: 'arraybuffer'  })
    .subscribe( {
      next:(data: ArrayBuffer)=>{
        console.log(data);
        
        this.previewDocx(data);
      },
      error: (error) =>{
        console.error('Failed to load docx file:', error);
//      this.htmlContent = '<p style="color:red;">문서를 불러오는 데 실패했습니다.</p>';
      }
    
    });
  }
  ngAfterViewInit(): void {
    // if (this.docxData && this.docxContainer) {
    //   this.previewDocx(this.docxData);
    // } else {
    //     console.error('docxContainer 요소가 존재하지 않거나 docxData가 없습니다.');
    // }
  }
  previewDocx(fileData: ArrayBuffer) {
    // 여기서 this.docxContainer.nativeElement는 DOM 요소를 나타냅니다.
    renderAsync(fileData, this.docxContainer.nativeElement)
      .then(x => console.log('DOCX 렌더링 완료'))
      .catch(err => console.error('DOCX 렌더링 오류:', err));
  }
}
