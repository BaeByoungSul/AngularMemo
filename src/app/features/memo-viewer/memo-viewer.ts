import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, lastValueFrom, map, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { UserDataNode } from '../../interfaces/user-data-node';
import { FireDataService } from '../../core/fire-data-service';
import { MatButtonModule } from '@angular/material/button';

//import { TreeDataService } from '../../core/tree-data-service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventBusService } from '../../core/event-bus-service';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CommonModule } from '@angular/common';
import { renderAsync } from 'docx-preview';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FireAuthService } from '../../core/fire-auth-service';
import { getAuth } from '@angular/fire/auth';
import { warn } from 'pdfjs-dist/types/src/shared/util';
import { LogLevel } from '@angular/fire';


@Component({
  selector: 'app-memo-viewer',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    NgxExtendedPdfViewerModule 
  ],
  templateUrl: './memo-viewer.html',
  styleUrl: './memo-viewer.css'
})
export class MemoViewer implements OnInit, AfterViewInit, OnDestroy {
  showSideMenu = true;
  sideNavMode: 'side' | 'over' = 'side';

  // MatTree 관련 설정
  public userTreeData: UserDataNode[] = []; 
  childrenAccessor = (node: UserDataNode) => node.children ?? [];
  hasChild = (_: number, node: UserDataNode) => !!node.children && node.children.length > 0;

  userData$! : Observable<any>;
  //userData2$! : Observable<any>;
  
  myform: FormGroup = new FormGroup({
    filename: new FormControl("", [Validators.required ]),
    foldername:new FormControl("", [Validators.required ])
  });
  
  
  fileExtension: string  = '';
  // 오류 메시지를 담을 Observable (오류가 발생한 경우에만 값을 방출)
  errorMessage$!: string | null;
// 오류 메시지를 다른 Observable로 전달하기 위한 Subject
  private errorSubject = new Subject<string>();
  
  // PDF 뷰어 
  pdfSrc$!: Observable<Blob | null>  ;
  textContent: string = '';
  @ViewChild('docxContainer') docxContainer!: ElementRef;
  
  // 헤더 메뉴 아이콘 클릭 구독
  subscription: Subscription | undefined;
  dataSubscription: Subscription | undefined;
  
  @ViewChild('tree') tree!: MatTree<UserDataNode>; 
  
  auth = getAuth();
  
  constructor(
    private http$: HttpClient,
    private dataService$: FireDataService,
    //private treeDataService$: TreeDataService,
    //private authService$: FireAuthService,
    private eventBus$: EventBusService
  ){
    
    this.userData$ = this.dataService$.getUserDataObservable();
    this.dataSubscription = this.userData$
      .pipe( 
        map(data => {
          const initialNode :UserDataNode[] = this.buildTree(data) ;
          return initialNode;
        }) 
      )
      .subscribe((nodeData)=>{
        console.log(nodeData);
      
        this.userTreeData = nodeData;
      });


    //this.userData$ = objectVal(ref(this.db, 'qC53z7Q2F8QYZeGJEDQF8qlkz562'));

    //this.userData$ = this.dataService$.getMyData$;
   
    // firebase realtime data를 mat-tree구조에 맞춰서 변환
    // this.userData$.pipe(
    //   map(data =>{
    //     if(!data) return[]
    //     console.log(data);
        
    //     // 2. JSON 객체를 재귀적으로 UserDataNode 배열로 변환
    //     //const initialNode: UserDataNode = { name: 'Root', value: '', children: this.buildTree(data) };
    //     const initialNode :UserDataNode[] = this.buildTree(data) ;
    //     return initialNode;
    //   })
    // ).subscribe( nodeData =>{
    //   this.userTreeData = nodeData;
    // });

    // 헤더의 메뉴버튼 클릭 event를 수신
    this.subscription = this.eventBus$.getButtonClickEvent()
      .subscribe(() => {
        //console.log('서비스를 통해 버튼 클릭 이벤트를 수신했습니다.');
        this.showSideMenu = !this.showSideMenu;
      });    

  }
 
  ngOnInit() {}
  ngAfterViewInit() {}

  ngOnDestroy(): void {
    console.log('OnDestroy');
    
    if (this.subscription) {
      this.subscription?.unsubscribe()
    }
    if(this.dataSubscription) this.dataSubscription.unsubscribe();
  }
  private buildTree(data: any, parentNode: UserDataNode | null = null): UserDataNode[] {
    const nodes: UserDataNode[] = [];
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        // 배열도 자식 노드를 가질 수 있는 객체로 처리하거나,
        // 데이터 탐색을 위해 별도로 처리할지 결정해야 합니다. (여기서는 기존 로직 유지)
        const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);

        const newNode: UserDataNode = {
          name: key,
          value: isObject ? '' : value,
          // ⭐ 핵심 1: 현재 함수로 전달받은 parentNode를 새 노드의 parent로 설정
          parent: parentNode
        };

        if (isObject) {
          // ⭐ 핵심 2: 자식 노드를 재귀적으로 생성할 때, 현재 생성된 newNode를 자식의 parent로 전달
          newNode.children = this.buildTree(value, newNode);
        }
        
        nodes.push(newNode);
      }
    }
    return nodes;
  }
  // 일반 JSON 객체를 재귀적 트리 노드 배열로 변환하는 헬퍼 함수
  private buildTree_bak(data: any): UserDataNode[] {
    const nodes: UserDataNode[] = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);

        nodes.push({
          name: key,
          value: isObject ? '' : value,
          children: isObject ? this.buildTree_bak(value) : undefined,
          
        });
      }
    }
    return nodes;
  }
  
  // input file명에 file명을 입력
  onNodeClick(node: UserDataNode): void {
    console.log('Node clicked:', node);
    this.myform.get('filename')?.setValue(node?.value);
    this.myform.get('foldername')?.setValue(node?.parent?.name);
    // this.treeDataService$.changeSelectedNode(node);

  }


  
  loadFile(){
    // if (this.myform.invalid) {
    //   console.error("form is invalid!");
    //   return;
    // }
    // this.authService$.user$.pipe()
    // .subscribe(

    // )
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      console.log('currentUser is null');
      return;
    }
    const userEmail = currentUser.email;

    // 폼 전체의 값을 JSON 객체 형태로 가져옵니다.
    const formValues = this.myform.value;
    const foldername = formValues.foldername;
    const filename = formValues.filename;

    const filepath = `assets/${userEmail}/${foldername}/${filename}`;

    console.log(filepath);
    
    // if(!filleExists) {
    //   this.fileExistMessage = "해당 파일이 없습니다.";
    //   return;
    // }else {
    //   this.fileExistMessage = "";
    // }
    // const filename = this.myform.get('filename')?.value;
    // const filename = this.selectedNode?.value;
    this.fileExtension = this.getFileExtension(filename)
    switch(this.fileExtension){
      case 'txt':
        this.loadTextFile(filepath)
        break;
      case 'pdf':
        // 오류 메세지를 나타내려고 하는 로직 추가
        // 원본 : this.pdfSrc$ = this.loadPdfAsBlobAsync(filepath);
        const load$ = this.loadPdfAsBlobAsync(filepath);
        this.pdfSrc$ = load$.pipe(
          map(blob => {
            this.errorMessage$ =null;
            return blob;
          }),
          catchError(error => {
            
            this.errorMessage$ = error.message;
            
            return of(null);
          })
        );
        break;
      case 'docx':
        this.loadDocxFile(filepath)
        break;
      default:
        console.warn(`지원하지 않는 파일 형식: ${this.fileExtension}`);
    }
  }
  

  loadTextFile(filepath: string){
    //const assetsUrl: string = `/assets/xyz5787@naver.com/Angular/${filename}`; 
    this.textContent='';

    this.http$.get(filepath, { responseType: 'text' })
    .subscribe({
        next: (res) => {
          this.textContent = res;
          this.errorMessage$ =null;
          console.log(this.textContent);
        },
        error: (err) => {
          //this.errorMessage$ = err;
          //console.error('Error fetching data:', err);
          let userFriendlyMessage: string;

          if (err.status === 404) {
            // 1. 404 Not Found 오류 처리
            userFriendlyMessage = `요청한 파일을 찾을 수 없습니다. (404)`;
          } else if (err.status >= 500) {
            // 2. 서버 오류 (5xx) 처리
            userFriendlyMessage = '서버에서 데이터를 로드하는 중 오류가 발생했습니다.';
          } else {
            // 3. 기타 클라이언트/네트워크 오류 처리 (예: 0, 401, 403 등)
            userFriendlyMessage = `파일 로드 실패: ${err.message || '알 수 없는 오류'}`;
          }

          // 4. 컴포넌트의 오류 메시지 변수에 저장
          this.errorMessage$ = userFriendlyMessage;
        }

      });
  }

  private loadPdfAsBlobAsync(filepath: string): Observable<Blob> {
    //const pdfUrl: string = `assets/${filename}`; // 예시 DOCX 파일 경로
    
    return this.http$.get(filepath, { 
      // 🚨 핵심: 응답 타입을 'blob'으로 설정해야 합니다.
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        // console.error('PDF 로드 실패:', error);
        // 사용자에게 표시할 에러를 throw
        //return throwError(() => new Error('PDF 파일을 서버에서 로드할 수 없습니다.'));
        let userErrorMessage: string;

        if (error.status === 404) {
          // 1. 파일 없음 (404 Not Found) 오류 처리
          //userErrorMessage = `요청한 파일(${filepath})을 찾을 수 없습니다. (404)`;
          userErrorMessage = `요청한 파일을 찾을 수 없습니다. (404)`;
        } else if (error.status >= 500) {
          // 2. 서버 오류 (5xx) 처리
          userErrorMessage = '서버에서 파일을 로드하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        } else {
          // 3. 기타 네트워크/클라이언트 오류 처리 (예: CORS, 401, 403)
          // error.error가 'string'일 수도 있으므로, 안전하게 처리합니다.
          userErrorMessage = '파일을 로드할 수 없습니다: ' + (error.message || '알 수 없는 오류');
        }

        // 4. 새로운 Error 객체와 함께 Observable 체인으로 오류를 다시 던집니다.
        return throwError(() => new Error(userErrorMessage));        
      })
    );
  }
  
  // arraybuffer는 not found일 경우 error로 처리되지 않고 있다.
  loadDocxFile(filepath: string) {
    //const assetsUrl: string = `assets/${filename}`; 
    const MIN_FILE_SIZE = 1000;
    this.http$.get(filepath, { responseType: 'arraybuffer' })
    .subscribe({
        next: (res) => {
          console.log(res);
          //console.log('next (ArrayBuffer size:', res.byteLength, 'bytes)');
      
          // 1. ArrayBuffer의 크기를 확인하여 파일 부재를 판단
          if (res.byteLength < MIN_FILE_SIZE ) {
            // 파일 크기가 너무 작거나 0인 경우 (파일이 없거나 index.html이 로드된 경우)
            //this.errorMessage$ = `요청한 파일의 내용이 없거나 잘못되었습니다.`;
            this.errorMessage$ = '요청한 파일을 찾을 수 없습니다';
            return; // next 처리 중단
          }

          this.errorMessage$ = null;
          this.previewDocx(res);
        },
        error: (err) => {
          //this.errorMessage$ = err;
          //console.error('Error fetching data:', err);
          let userFriendlyMessage: string;

          if (err.status === 404) {
            // 1. 404 Not Found 오류 처리
            userFriendlyMessage = '요청한 파일을 찾을 수 없습니다. (404)';
          } else if (err.status >= 500) {
            // 2. 서버 오류 (5xx) 처리
            userFriendlyMessage = '서버에서 데이터를 로드하는 중 오류가 발생했습니다.';
          } else {
            // 3. 기타 클라이언트/네트워크 오류 처리 (예: 0, 401, 403 등)
            userFriendlyMessage = `파일 로드 실패: ${err.message || '알 수 없는 오류'}`;
          }

          // 4. 컴포넌트의 오류 메시지 변수에 저장
          this.errorMessage$ = userFriendlyMessage;
        }

      });
      return;

    this.http$.get(filepath, { responseType: 'arraybuffer'  })
    .subscribe( {
      next:(data: ArrayBuffer)=>{
        //this.convertDocxToHtml(data);
        console.log('next');
        
        this.errorMessage$ = null;
        this.previewDocx(data);
      },
      error: (err) =>{
        console.error('Failed to load docx file:', err);
        //this.htmlContent = '<p style="color:red;">문서를 불러오는 데 실패했습니다.</p>';
        let userFriendlyMessage: string;

        if (err.status === 404) {
          // 1. 404 Not Found 오류 처리
          userFriendlyMessage = `요청한 파일을 찾을 수 없습니다. (404)`;
        } else if (err.status >= 500) {
          // 2. 서버 오류 (5xx) 처리
          userFriendlyMessage = '서버에서 데이터를 로드하는 중 오류가 발생했습니다.';
        } else {
          // 3. 기타 클라이언트/네트워크 오류 처리 (예: 0, 401, 403 등)
          userFriendlyMessage = `파일 로드 실패: ${err.message || '알 수 없는 오류'}`;
        }

        // 4. 컴포넌트의 오류 메시지 변수에 저장
        this.errorMessage$ = userFriendlyMessage;        
      }
    
    });
   
  }

  previewDocx(fileData: ArrayBuffer) {
    // renderAsync 함수를 사용하여 DOCX 파일을 렌더링합니다.
    // 첫 번째 인자: DOCX 데이터 (ArrayBuffer 또는 Blob)
    // 두 번째 인자: 렌더링할 HTML 컨테이너 요소
    renderAsync(fileData, this.docxContainer.nativeElement)
      .then(x => console.log('DOCX 렌더링 완료'))
      .catch(err => console.error('DOCX 렌더링 오류:', err));
  }


 
  
  // .ts 파일
  
  getFileExtension(fileName: string): string  {
    // 1. 파일 이름에 마침표가 있는지 확인
    const lastDot = fileName.lastIndexOf('.');
    
    if (lastDot === -1) {
      return ''; // 확장자가 없음
    }
    
    // 2. 마지막 마침표 이후의 문자열을 소문자로 변환하여 반환
    // 예: "aaa.TXT" -> "txt"
    return fileName.substring(lastDot + 1).toLowerCase();
  }

}

// import mammoth from 'mammoth';
//import { convertToHtml } from 'mammoth';
//import { PdfViewerModule, PDFDocumentProxy } from 'ng2-pdf-viewer'; // 👈 Import the module
//import * as pdfjsLib from 'pdfjs-dist';
//import { PdfJsViewerModule } from 'ng2-pdfjs-viewer'; // 이 부분을 추가

//public isReadyToRender: boolean = false; // 새로운 플래그 추가
  // @ViewChild()로 자식 컴포넌트의 인스턴스를 참조합니다.
  // ChildComponent 타입으로 선언하여 TypeScript가 해당 메서드를 인식하게 합니다.
  // @ViewChild(FileViewer) childComponent!: FileViewer;
  

  //pdfSrc : string = "";
  //htmlContent: string = ''
        //this.loadPdfFile(filename)
        //this.pdfSrc = `/assets/${filename}`; // 예시 DOCX 파일 경로
        // this.loadPdf(filename);
        // this.loadPdfBlob(filename).then(blob => {
        //   this.pdfBlob = blob;
        // });
 // 여기에 표시할 DOCX 파일의 ArrayBuffer 데이터가 있어야 합니다.
  // 실제로는 파일을 읽거나 서버에서 받아오는 과정이 필요합니다.
  //docxData: ArrayBuffer = /* 여기에 실제 DOCX ArrayBuffer */;

  // 3. ArrayBuffer 또는 Blob 데이터도 사용 가능
  //pdfData: ArrayBuffer | undefined;
  //workerSrc = '/assets/pdf-workers/';
  //workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';

  //userUid: string | null = null;
  //currentUid: string | null = null;

//  loadPdfFile(filename: string){
//     this.pdfSrc = `assets/${filename}`; // 예시 DOCX 파일 경로
//   }
  // // 1. 공백 상태로 만드는 함수
  // clearTextarea(): void {
  //   // 가장 일반적인 방법: 변수를 빈 문자열로 설정
  //   this.textContent = ''; 
    
  //   // (대안) 만약 바인딩이 이를 처리한다면 null도 가능하지만 ''이 더 명확합니다.
  //   // this.fileContent = null; 
  //   console.log('Textarea 내용을 지웠습니다.');
  // }
// async loadPdfBlob(filename:string): Promise<Blob> {
//     const assetsUrl: string = `/assets/${filename}`; // 예시 DOCX 파일 경로
//     const res = await fetch (assetsUrl);

//     const blob = await res.blob()
//     return blob;

//     this.http$.get(assetsUrl, { responseType: 'blob' })
//     .subscribe({
//         next: (res) => {
//           console.log(res);
          
//           //this.pdfBlob = res;
          
          
//           //this.fileContent = res.replace(/\r\n/g, '\n');
//           console.log(this.textContent);

//         },
//         error: (err) => {
//           console.error('Error fetching data:', err);
//         }

//       });
    
//   }

// onPageRendered(event: PageRenderedEvent): void {
//   this.pdfViewerService.isRenderQueueEmpty()
//   // 렌더링된 페이지에 대한 주석 삽입 로직 실행
//   // event.pageNumber를 사용하여 특정 페이지에 대한 로직 처리 가능
 
//   //this.viewerService.injectLinkAnnotations(...);
// }

// async convertDocxToHtml(arrayBuffer: ArrayBuffer) {
  
//     const options = {
//         styleMap: [
//           // 'List Paragraph' 경고를 해결하기 위한 매핑
//           "p[style-name='List Paragraph'] => li", 
//           // "r[style-name='Strong'] => strong",
//           // "p[style-name='Heading 1'] => h1",
//           // // ... 기타 스타일 매핑 추가 가능
//         ],
    
//       };
//     // Mammoth.js의 convertToHtml 함수 사용
//     await mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
//       .then((result: any) => {
//         console.log(result.value);
        
//         // 변환된 HTML 내용을 저장
//         //const convertedHtml = result.value.replace(/\n/g, '<br>');
//         this.htmlContent = result.value;
//         // this.convertedHtml == this.sanitizer.bypassSecurityTrustHtml(result.value);
//         //console.log(this.convertedHtml);
        
//         // 변환 중 발생한 경고나 오류 메시지 확인 (선택 사항)
//         if (result.messages.length > 0) {
//           console.warn('Mammoth Messages:', result.messages);
//         }
//       })
//       .catch((error: any) => {
//         console.error('Failed to convert docx to HTML:', error);
//         this.htmlContent = '<p style="color:red;">DOCX 변환에 실패했습니다.</p>';
//       });
//   }