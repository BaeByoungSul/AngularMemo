import { inject, Injectable, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { Database, ref, push, onValue, get, remove, objectVal, update, off } from '@angular/fire/database';
import { firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { FireAuthService } from './fire-auth-service';
import { User } from '@angular/fire/auth';
// update(): 지정된 경로의 데이터 중 특정 필드만 수정하거나 새로 추가합니다.
// push() : (목록에 새 항목 추가/고유 키 생성)
@Injectable({
  providedIn: 'root'
})
export class FireDataService implements OnInit {
  private db: Database = inject(Database);
  private authService$ = inject( FireAuthService )
  private injector: Injector = inject(Injector); // 💡 Injector를 주입
  
  //private auth: Auth = inject(Auth);
  //user$: Observable<User | null> = user(this.auth);

  getMyData$: Observable<any> = this.authService$.user$.pipe(
    // 1. 사용자 객체가 변경될 때마다 새로운 내부 Observable로 전환
    switchMap(firebaseUser => {
      if (firebaseUser) {
        const userUid = firebaseUser.uid;
        //const itemsRef = ref(this.db, `/${userUid}`);
        return runInInjectionContext(this.injector, () => {
             return objectVal(ref(this.db, `/${userUid}`)); 
          });

        
      } else {
        // 사용자가 로그아웃된 경우: null Observable을 반환합니다.
        return of(null);
      }
    })
  );

  constructor( ){  }
  ngOnInit() { }


  // Write data
  async addItem(path: string, data: any) {

   // 2. fireAuthService.user$ Observable에서 첫 번째 값(현재 사용자)을 Promise로 변환하여 가져옵니다.
    const user: User | null = await firstValueFrom(this.authService$.user$);
    if (!user || !user.uid) {
      // 3. 사용자 UID를 확인할 수 없으면 오류를 발생시킵니다.
      throw new Error('사용자 UID를 가져올 수 없습니다. 로그인이 필요합니다.');
    }
    // 4. 최종 데이터베이스 경로를 조합합니다: [UID]/[상대 경로]
    const fullPath = `${user.uid}/${path}`;
    
    await runInInjectionContext(this.injector, async () => {
      const itemRef = ref(this.db, fullPath);
      await push(itemRef, data);
    });

    // 5. 조합된 경로로 데이터베이스 참조를 생성하고 데이터를 추가합니다.
    //const itemRef = ref(this.db, fullPath); 
    //await push(itemRef, data);

    //const itemRef = ref(this.db, path);
    //await push(itemRef, data); // Adds a new item with a unique key
  }

  async addCategory(categoryName: string){
    const user: User | null = await firstValueFrom(this.authService$.user$);
    if (!user || !user.uid) {
      // 3. 사용자 UID를 확인할 수 없으면 오류를 발생시킵니다.
      throw new Error('사용자 UID를 가져올 수 없습니다. 로그인이 필요합니다.');
    }
    // 4. 최종 데이터베이스 경로를 조합합니다: [UID]/[상대 경로]
    const path = `${user.uid}`;
    const newValue = ""; // 원하는 초기 값 (여기서는 빈 문자열

    //const itemRef = ref(this.db, path);
    //await update(itemRef, {[categoryName]:newValue});

    await runInInjectionContext(this.injector, async () => {
      const itemRef = ref(this.db, path);
      await update(itemRef, {[categoryName]:newValue});

    });

  }

  // Set/Update data
  async updateItem(path: string, data: any) {
      // 2. fireAuthService.user$ Observable에서 첫 번째 값(현재 사용자)을 Promise로 변환하여 가져옵니다.
    const user: User | null = await firstValueFrom(this.authService$.user$);
    if (!user || !user.uid) {
      // 3. 사용자 UID를 확인할 수 없으면 오류를 발생시킵니다.
      throw new Error('사용자 UID를 가져올 수 없습니다. 로그인이 필요합니다.');
    }
    // 4. 최종 데이터베이스 경로를 조합합니다: [UID]/[상대 경로]
    const fullPath = `${user.uid}/${path}`;
    
    console.log('aaaaaa',fullPath, data);
    //const itemRef = ref(this.db, fullPath);
    //await update(itemRef, data);
    
    await runInInjectionContext(this.injector, async () => {
      const itemRef = ref(this.db, fullPath);
      await update(itemRef, data);

    });

  }
  // Delete data
  async deleteItem(path: string) {
       // 2. fireAuthService.user$ Observable에서 첫 번째 값(현재 사용자)을 Promise로 변환하여 가져옵니다.
    const user: User | null = await firstValueFrom(this.authService$.user$);
    if (!user || !user.uid) {
      // 3. 사용자 UID를 확인할 수 없으면 오류를 발생시킵니다.
      throw new Error('사용자 UID를 가져올 수 없습니다. 로그인이 필요합니다.');
    }
    // 4. 최종 데이터베이스 경로를 조합합니다: [UID]/[상대 경로]
    const fullPath = `${user.uid}/${path}`;
    
    //const itemRef = ref(this.db, fullPath);
    //await remove(itemRef);
    await runInInjectionContext(this.injector, async () => {
      const itemRef = ref(this.db, fullPath);
      await remove(itemRef);
    });
  }


  
  // Read data as an Observable
  getItems<T>(path: string): Observable<T[]> {
    const itemsRef = ref(this.db, path);
    return new Observable(observer => {
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        const items: T[] = [];
        if (data) {
          Object.keys(data).forEach(key => {
            items.push({ id: key, ...data[key] }); // Include key as 'id'
          });
        }
        observer.next(items);
      }, (error) => {
        observer.error(error);
      });
    });
  }
  getUserItems<T>(): Observable<T[]> {
    const user = this.authService$.getCurrentUser();
    const path = user?.uid;
    if (user) {

      const userRef = ref(this.db, path);  
      onValue(userRef, ((snapshot)=>{

      }));
    }
    const itemsRef = ref(this.db, path);
    return new Observable(observer => {
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        const items: T[] = [];
        if (data) {
          Object.keys(data).forEach(key => {
            items.push({ id: key, ...data[key] }); // Include key as 'id'
          });
        }
        observer.next(items);
      }, (error) => {
        observer.error(error);
      });
    });
  }

  getUserDataObservable(): Observable<any> {
    const user = this.authService$.getCurrentUser();
    const path = user?.uid;

    // 데이터베이스 경로 설정
    const userPath = `${path}`;
    const userRef = ref(this.db, userPath);

    // Observable 생성
    return new Observable(observer => {
        // 1. onValue 리스너 설정 (실시간 감시 시작)
        const callback = onValue( userRef, 
            (snapshot) => {
                // 데이터가 변경될 때마다 Observable 구독자에게 데이터를 전달
                const userData = snapshot.val();
                observer.next(userData);
            },
            (error) => {
                // 에러 발생 시 Observable 구독자에게 에러 전달
                observer.error(error);
            }
        );

        // 2. 클린업(Clean-up) 함수 반환
        // Observable 구독이 해제될 때 실행되어 리스너를 제거합니다.
        return () => {
            console.log(`Realtime listener for ${userPath} removed.`);
            // off(userRef, 'value', callback); // off()로 리스너를 명시적으로 해제
            runInInjectionContext(this.injector, async () => {
              off(userRef, 'value', callback); // off()로 리스너를 명시적으로 해제
            });
        };
    });
}

  // Get data once
  async getItemOnce<T>(path: string): Promise<T | null> {
    const itemRef = ref(this.db, path);
    const snapshot = await get(itemRef);
    return snapshot.exists() ? snapshot.val() : null;
  }



}


  // getAllData(): Observable<any> {
  //   // ref()로 경로를 참조하고, objectVal()로 Observable<any>를 얻습니다.
  //   return objectVal(ref(this.db, '/')); 
  // }
 
  // getUserAllData(uid: string): Observable<any> {
  //   // qC53z7Q2F8QYZeGJEDQF8qlkz562 : xyz5787@naver.com uid
  //   // ref()로 경로를 참조하고, objectVal()로 Observable<any>를 얻습니다.
  //   return objectVal(ref(this.db, `/${uid}`)); 
  // }