import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { catchError, filter, map, Observable, of, Subscription, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FireAuthService } from '../../core/fire-auth-service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { EventBusService } from '../../core/event-bus-service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { renderAsync } from 'docx-preview';

interface MyNode {
  name: string;
  level: number;
  children?: MyNode[];
  currentPath?: string[] ;
}

@Component({
  selector: 'app-memo-viewer2',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './memo-viewer2.html',
  styleUrl: './memo-viewer2.css',
})
export class MemoViewer2 implements OnInit, OnDestroy{
  showSideMenu = true;
  sideNavMode: 'side' | 'over' = 'side';

  datasource : MyNode[]=[];
 
  childrenAccessor = (node: MyNode) => node.children ?? [];
  hasChild = (_: number, node: MyNode) => !!node.children && node.children.length > 0;
  
  //userTreeData: UserDataNode[] = [];
  //userData$! : Observable<any>
  dataSubscription : Subscription | undefined;
  menuIconSubscription : Subscription | undefined;

  myform: FormGroup = new FormGroup({
    filename: new FormControl("", [Validators.required ]),
  //  foldername:new FormControl("", [Validators.required ])
  });
  currentFilePath: string[] | undefined =[];
  
  fileExtension: string  = '';
  // 오류 메시지를 담을 Observable (오류가 발생한 경우에만 값을 방출)
  errorMessage$!: string | null;

  // PDF 뷰어 
  pdfSrc$!: Observable<Blob | null>  ;
  textContent: string = '';
  @ViewChild('docxContainer') docxContainer!: ElementRef;
  
  constructor(
    private http$: HttpClient,
    private authService$: FireAuthService,
    private eventBus$: EventBusService
  ) {

    this.dataSubscription = this.authService$.user$.pipe(
        filter(user => !!user && !!user.uid),
        //map(user => user?.uid) ,
        switchMap( user => {
          const uid = user?.uid;

          return this.http$.get('assets/file_mgt.json',{responseType:'json'}).pipe(
            map((json:any) =>{
              return json[uid as string];
            })
          );
        }
      )).subscribe(data => {
        //console.log(data);
        this.datasource=  this.traverseJson(data);
        console.log(this.datasource);
        
      }) ;

    // 헤더의 메뉴버튼 클릭 event를 수신
    this.menuIconSubscription = this.eventBus$.getButtonClickEvent()
      .subscribe(() => {
        //console.log('서비스를 통해 버튼 클릭 이벤트를 수신했습니다.');
        this.showSideMenu = !this.showSideMenu;
      });  

  }
  ngOnInit(): void {
    this.myform.get('filename')?.setValue('');
    this.currentFilePath = [];
  }
  ngOnDestroy(): void {
    if (this.menuIconSubscription) {
      this.menuIconSubscription?.unsubscribe()
    }
    if(this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  traverseJson(obj: any, currentPath: string[] = [], level: number=0): MyNode[] {
     const nodes: MyNode[] = [];

    // 반복 로직: 객체의 모든 키를 순회합니다.
    for (const key in obj) {
        // 키 값이 유효한지 점검
        if (obj.hasOwnProperty(key)) {
            // 새 경로를 만듭니다. (예: "WebAPI" 또는 "WebAPI.0")
            //const newPath = currentPath ? `${currentPath}.${key}` : key;
            const newPath = [...currentPath, key];
            //console.log(obj[key], newPath);
            const value = obj[key];

            const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
            
            const newNode: MyNode = {
              name: isObject ? key : value,
              level: level,
              currentPath: currentPath,
              //children: isObject ? this.traverseJson(value, newPath, level+1): undefined
            };           
            if (isObject) {
              newNode.children= this.traverseJson(value, newPath, level+1);
            }
            //console.log(newNode.name, newNode.children);
            
            nodes.push(newNode);
           
        }
    }
    //console.log('return');
    
    return nodes;
  }

  onNodeClick(node: MyNode): void {
    console.log('Node clicked:', node);
    this.myform.get('filename')?.setValue(node?.name);
    this.currentFilePath = node?.currentPath;
    //this.myform.get('foldername')?.setValue(node?.currentPath);
    

  }
  loadFile(){
    // if (this.myform.invalid) {
    //   console.error("form is invalid!");
    //   return;
    // }
    // this.authService$.user$.pipe()
    // .subscribe(

    // )
    //const currentUser = this.auth.currentUser;
    const currentUser = this.authService$.getCurrentUser();

    if (!currentUser) {
      console.log('currentUser is null');
      return;
    }
    const userEmail = currentUser.email;

    // 폼 전체의 값을 JSON 객체 형태로 가져옵니다.
    const formValues = this.myform.value;
    //const foldername = formValues.foldername;
    const filename = formValues.filename;

    if( this.currentFilePath == undefined) {
      console.error('currentFilePath is null');
      return;
    }
    const pathString: string = this.currentFilePath?.join('/');

    const filepath = `assets/${userEmail}/${pathString}/${filename}`;
    
    
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

  }

  previewDocx(fileData: ArrayBuffer) {
    // renderAsync 함수를 사용하여 DOCX 파일을 렌더링합니다.
    // 첫 번째 인자: DOCX 데이터 (ArrayBuffer 또는 Blob)
    // 두 번째 인자: 렌더링할 HTML 컨테이너 요소
    renderAsync(fileData, this.docxContainer.nativeElement)
      .then(x => console.log('DOCX 렌더링 완료'))
      .catch(err => console.error('DOCX 렌더링 오류:', err));
  }

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
