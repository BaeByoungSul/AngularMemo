import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { NoteService } from '../../core/note-service';
import { FireAuthService } from '../../core/fire-auth-service';
import { deleteDoc, doc } from '@angular/fire/firestore';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Note } from '../../interfaces/note';

@Component({
  selector: 'app-note-editor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './note-editor.html',
  styleUrl: './note-editor.css',
})
export class NoteEditor implements OnInit {
  notes$!: Observable<Note[]>; // 실시간 메모 목록 Observable
  // 현재 선택된 노트 (수정 모드 관리)
  selectedNote: Note | null = null;
  
  //newNoteContent: string = '';
  //noteForm!: FormGroup; // !로 초기화 지연 선언
  noteForm: FormGroup = new FormGroup({
    title: new FormControl("", [Validators.required, Validators.maxLength(50) ]),
    content: new FormControl("")
  });
  

  constructor(
    private noteService: NoteService,
    public authService: FireAuthService
  ){
    //this.notes$ = noteService.getNotes();
    this.notes$ = this.noteService.getNotes();
    // noteService.getNotes()
    //   .subscribe((data) => {
    //     //console.log('서비스를 통해 버튼 클릭 이벤트를 수신했습니다.');
    //     console.log(data);
        
    //   });  
  }
  ngOnInit(): void {
 
  }
  initForm(note?: Note): void {
    this.noteForm.get('title')?.setValue(note?.title);
    this.noteForm.get('content')?.setValue(note?.content);
    // 폼 초기화 (수정 또는 새 노트 추가)
    // this.noteForm = this.noteForm({
    //   title: [note?.title || '', [Validators.required, Validators.maxLength(50)]],
    //   content: [note?.content || '']
    // });
  }
  // 1. 노트 선택 (수정 모드 활성화)
  selectNote(note: Note): void {
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
        await this.noteService.updateNote(this.selectedNote.id, { title, content });
        alert('노트가 수정되었습니다.');
      } else {
        // 추가 (AddNote)
        await this.noteService.addNote({ title, content });
        alert('새 노트가 추가되었습니다.');
      }
      
      this.startAddMode(); // 작업 후 폼 초기화

    } catch (error) {
      alert(`오류 발생: ${error}`);
    }
  }
  
  // 4. 노트 삭제
  async onDelete(noteId: string): Promise<void> {
    if (confirm('이 노트를 정말로 삭제하시겠습니까?')) {
      try {
        await this.noteService.deleteNote(noteId);
        alert('노트가 삭제되었습니다.');
        if (this.selectedNote?.id === noteId) {
            this.startAddMode(); // 삭제된 노트가 선택되어 있으면 추가 모드로 전환
        }
      } catch (error) {
        alert(`삭제 중 오류 발생: ${error}`);
      }
    }
  }

  // 1. 새 노트 추가
  onAddNote() {
    const newNote = {
      title: '새로 작성한 메모',
      content: '이 내용은 오늘 작성된 중요한 메모입니다.',
    };
    
    this.noteService.addNote(newNote)
      .catch(error => alert('노트 추가 실패: ' + error.message));
  }

  // 2. 노트 수정 (목록에서 noteId를 가져왔다고 가정)
  onUpdateNote(noteId: string, newTitle: string) {
    const updateData = { title: newTitle };
    
    this.noteService.updateNote(noteId, updateData)
      .catch(error => alert('노트 수정 실패: ' + error.message));
  }
  
  // 3. 노트 삭제 (목록에서 noteId를 가져왔다고 가정)
  onDeleteNote(noteId: string) {
    if (confirm('정말로 이 노트를 삭제하시겠습니까?')) {
      this.noteService.deleteNote(noteId)
        .catch(error => alert('노트 삭제 실패: ' + error.message));
    }
  }

}
