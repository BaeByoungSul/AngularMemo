import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, Firestore, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { first, Observable, of, switchMap } from 'rxjs';
import { FireAuthService } from './fire-auth-service';
import { Note } from '../interfaces/note';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  
  private notesCollection ; //= collection(this.firestore, 'notes');

  constructor(
    private firestore: Firestore,
    private authService$: FireAuthService,
    private injector: Injector // 👈 Injector를 주입받아야 합니다.
  ){
    this.notesCollection =  collection(this.firestore, 'users');
  }


  // ==========================================================
  // 1. CREATE: 새 문서 추가 (노트 작성)
  // ==========================================================
  async addNote(note: { title: string; content: string }): Promise<void> {
    try {
      //const currentUser = await this.authServic$.user$.pipe(first()).toPromise();
      const currentUser = this.authService$.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated. Cannot add note.');
      }
      await runInInjectionContext(this.injector, async () => {
        // 1. 사용자별 notes 컬렉션 참조를 생성합니다.
        const notesRef = collection(
          this.firestore,
          `users/${currentUser.uid}/notes`
        );
        
        // 2. 새로운 노트 객체를 생성하고 생성 시간을 서버 타임스탬프로 지정합니다.
        const newNote = {
          ...note,
          createdAt: serverTimestamp(), 
        };

        // 3. Firestore에 문서를 추가합니다.
        await addDoc(notesRef, newNote);
              
      });
      // // 1. 사용자별 notes 컬렉션 참조를 생성합니다.
      // const notesRef = collection(
      //   this.firestore,
      //   `users/${currentUser.uid}/notes`
      // );
      
      // // 2. 새로운 노트 객체를 생성하고 생성 시간을 서버 타임스탬프로 지정합니다.
      // const newNote = {
      //   ...note,
      //   createdAt: serverTimestamp(), 
      // };

      // // 3. Firestore에 문서를 추가합니다.
      // await addDoc(notesRef, newNote);
      //console.log('✅ Note successfully added.');
    } catch (error) {
      console.error('❌ Error adding note: ', error);
      throw error;
    }
  }
// ==========================================================
  // 2. UPDATE: 기존 문서 필드 수정 (내용/제목 수정)
  // ==========================================================
  async updateNote(noteId: string, data: Partial<Note>): Promise<void> {
    try {
      //const currentUser = await user(this.auth).pipe(first()).toPromise();
      const currentUser = this.authService$.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated. Cannot update note.');
      }

      await runInInjectionContext(this.injector, async () => {
        // 1. 특정 문서에 대한 참조를 생성합니다.
        // 경로: users/{uid}/notes/{noteId}
        const noteDocRef = doc(
          this.firestore, 
          `users/${currentUser.uid}/notes/${noteId}`
        );
        
        // 2. updateDoc 함수로 문서의 지정된 필드만 업데이트합니다.
        // 예: { title: '수정된 제목' } 또는 { content: '수정된 내용' }
        await updateDoc(noteDocRef, data);
        //console.log('✅ Note successfully updated.');
       
      });
      // // 1. 특정 문서에 대한 참조를 생성합니다.
      // // 경로: users/{uid}/notes/{noteId}
      // const noteDocRef = doc(
      //   this.firestore, 
      //   `users/${currentUser.uid}/notes/${noteId}`
      // );
      
      // // 2. updateDoc 함수로 문서의 지정된 필드만 업데이트합니다.
      // // 예: { title: '수정된 제목' } 또는 { content: '수정된 내용' }
      // await updateDoc(noteDocRef, data);
      // console.log('✅ Note successfully updated.');
    } catch (error) {
      console.error('❌ Error updating note: ', error);
      throw error;
    }
  }

  // ==========================================================
  // 3. DELETE: 문서 삭제
  // ==========================================================
  async deleteNote(noteId: string): Promise<void> {
    try {
      //const currentUser = await user(this.auth).pipe(first()).toPromise();
      const currentUser = this.authService$.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated. Cannot delete note.');
      }

      await runInInjectionContext(this.injector, async () => {
        // 1. 특정 문서에 대한 참조를 생성합니다.
        const noteDocRef = doc(
          this.firestore, 
          `users/${currentUser.uid}/notes/${noteId}`
        );
        
        // 2. deleteDoc 함수로 문서를 삭제합니다.
        await deleteDoc(noteDocRef);
        //console.log('✅ Note successfully deleted.');
      });
      // // 1. 특정 문서에 대한 참조를 생성합니다.
      // const noteDocRef = doc(
      //   this.firestore, 
      //   `users/${currentUser.uid}/notes/${noteId}`
      // );
      
      // // 2. deleteDoc 함수로 문서를 삭제합니다.
      // await deleteDoc(noteDocRef);
      // console.log('✅ Note successfully deleted.');
    } catch (error) {
      console.error('❌ Error deleting note: ', error);
      throw error;
    }
  }

  // ==========================================================
  // 4. READ: 노트 목록 가져오기 (이전 단계 코드)
  // ==========================================================
  getNotes(): Observable<Note[]> {
    return this.authService$.user$.pipe(
      switchMap((currentUser) => {
        if (!currentUser) {
          return of([]);
        }
        // const notesRef = collection(
        //   this.firestore,
        //   `users/${currentUser.uid}/notes`
        // ) as CollectionReference<Note, DocumentData>;
        
        // const notesQuery = query(
        //   notesRef,
        //   orderBy('createdAt', 'desc')
        // );
        // return collectionData(notesQuery, { idField: 'id' });

        return runInInjectionContext(this.injector, () => {
          const notesRef = collection(
            this.firestore, 
            `users/${currentUser.uid}/notes`
          ) as CollectionReference<Note, DocumentData>;
  
          const notesQuery = query(
            notesRef,
            orderBy('createdAt', 'desc')
          );
          return collectionData(notesQuery, { idField: 'id' });
        });
      })
    ) as Observable<Note[]>;
  }

  getNotes_bak(): Observable<Note[]> {
    // idField: 'id' 옵션을 사용하여 Firestore 문서 ID를 'id' 필드로 포함
    return collectionData(this.notesCollection, { idField: 'id' }) as Observable<Note[]>;
  }
  /**
   * 새 메모를 Firestore에 추가합니다.
   * @param content 메모 내용
   * @param uid 현재 로그인한 사용자의 UID
   */
  addNote_bak(content: string, uid: string): Promise<any> {
    const notesCollection = collection(this.firestore, 'notes');
    return addDoc(notesCollection, { 
        uid: uid, // 이 메모가 누구의 것인지 표시
        content: content, 
        timestamp: Date.now() 
    });
  }

  /**
   * 특정 메모를 삭제합니다.
   * @param noteId 삭제할 메모의 Firestore 문서 ID
   */
  deleteNote_bak(noteId: string): Promise<void> {
    const noteDocRef = doc(this.firestore, `notes/${noteId}`);
    return deleteDoc(noteDocRef);
  }
}
