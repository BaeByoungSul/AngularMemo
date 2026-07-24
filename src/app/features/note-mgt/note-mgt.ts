import { Component } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Note } from '../../interfaces/note';
import { NoteService } from '../../core/note-service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventBusService } from '../../core/event-bus-service';
import { SnackbarService } from '../../core/snackbar.service';

@Component({
  selector: 'app-note-mgt',
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './note-mgt.html',
  styleUrl: './note-mgt.css',
})
export class NoteMgt {
  loading$ = new BehaviorSubject<boolean>(false);
  showNoteList: boolean = true;
  subscription: Subscription | undefined;
  statusMessage: string | null = null; 

  notes$!: Observable<Note[]>; // 실시간 메모 목록 Observable
  // 현재 선택된 노트 (수정 모드 관리)
  selectedNote: Note | null = null;

  noteForm: FormGroup = new FormGroup({
    title: new FormControl("", [Validators.required, Validators.maxLength(50) ]),
    content: new FormControl("")
  });
  

  myForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email ]),
    password: new FormControl("", [Validators.required]),
  });
  
  constructor(
    private noteService$:NoteService,
    private eventBus$: EventBusService,
    private snackBar$: SnackbarService
    ){
    this.notes$ = noteService$.getNotes();
        // 헤더의 메뉴버튼 클릭 event를 수신
    this.subscription = this.eventBus$.getButtonClickEvent()
      .subscribe(() => {
        //console.log('서비스를 통해 버튼 클릭 이벤트를 수신했습니다.');
        this.showNoteList = !this.showNoteList;
      });  
  }
  initForm(note?: Note): void {
    this.noteForm.get('title')?.setValue(note?.title);
    this.noteForm.get('content')?.setValue(note?.content);
   
  }
  // 1. 노트 선택 (수정 모드 활성화)
  selectNote(note: Note): void {
    this.statusMessage = '';
    this.selectedNote = note;
    this.initForm(note); // 폼을 선택된 노트 내용으로 채움
  }
   
 // 2. 새 노트 추가 모드로 전환 (폼 초기화)
  startAddMode(): void {
    this.selectedNote = null;
    this.initForm(); // 빈 폼으로 초기화
  }
  // 3. 노트 추가/수정 (폼 제출)
  async onSubmit(): Promise<void> {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    const { title, content } = this.noteForm.value;

    try {
      if (this.selectedNote && this.selectedNote.id) {
        // 수정 (UpdateNote)
        await this.noteService$.updateNote(this.selectedNote.id, { title, content });
        //this.statusMessage = '노트가 수정되었습니다.';
        this.snackBar$.success('노트가 수정되었습니다.');
        //alert('노트가 수정되었습니다.');
      } else {
        // 추가 (AddNote)
        await this.noteService$.addNote({ title, content });
        //this.statusMessage = '새 노트가 추가되었습니다.';
        this.snackBar$.success('새 노트가 추가되었습니다.');
        //alert('새 노트가 추가되었습니다.');
      }
      
      this.startAddMode(); // 작업 후 폼 초기화

    } catch (error) {
      //this.statusMessage = `오류 발생: ${error}`;
      this.snackBar$.error('새 노트가 추가되었습니다.');
      //alert(`오류 발생: ${error}`);
    }
  }
  // 4. 노트 삭제
  async onDelete(noteId: string): Promise<void> {
    if (confirm('이 노트를 정말로 삭제하시겠습니까?')) {
      try {
        await this.noteService$.deleteNote(noteId);
        //this.statusMessage = '노트가 삭제되었습니다.';
        this.snackBar$.success('노트가 삭제되었습니다.');
        // alert('노트가 삭제되었습니다.');
        if (this.selectedNote?.id === noteId) {
            this.startAddMode(); // 삭제된 노트가 선택되어 있으면 추가 모드로 전환
        }
      } catch (error) {
        //this.statusMessage = `삭제 중 오류 발생: ${error}`;
        this.snackBar$.success(`삭제 중 오류 발생: ${error}`);
        //alert(`삭제 중 오류 발생: ${error}`);
      }
    }
  }

  getErrorMsg(ctrlName: string){
    const ctrl = this.myForm.get(ctrlName);

    var maxLengthValue ;//= ctrl?.hasError('maxlength') ? ctrl.errors?.["maxlength"]["requiredLength"] : 0;
    var minLengthValue ;//= ctrl?.hasError('minlength') ? ctrl.errors?.["minlength"]["requiredLength"] : 0;
    
    if (ctrl?.hasError('maxlength')) {
      maxLengthValue = ctrl.errors?.["maxlength"]["requiredLength"];
    }
    if (ctrl?.hasError('minlength')) {
      maxLengthValue = ctrl.errors?.["minlength"]["requiredLength"];
    }
    
    return ctrl?.hasError('required') ?  'This field is required ' :
           ctrl?.hasError('pattern')  ? 'This field needs to be at least nine characters, one uppercase letter and at least 1 symbol' :
           ctrl?.hasError('email') ? 'Not a valid email' :
           ctrl?.hasError('minlength') ? `This field must be at least ${minLengthValue} characters long ` :
           ctrl?.hasError('maxlength') ?  `This field can be max ${maxLengthValue} characters long.` : '';
//           ctrl?.hasError('requirements') ? 'Password needs to be at least six characters, one uppercase letter and one number' : '';
  }
}
