import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { 
  Auth, 
  User, 
  user, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
} from '@angular/fire/auth';
import { distinctUntilChanged, from, interval, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class FireAuthService {
  //private auth: Auth = inject(Auth);
  private injector: Injector = inject(Injector);

  // 현재 사용자 상태를 Observable<User | null>로 제공
  //user$: Observable<User | null> = user(this.auth);
  user$: Observable<User | null> ;

  //private remainingTimeSubject = new BehaviorSubject<number>(0);
  //public remainingTime$: Observable<number> = this.remainingTimeSubject.asObservable();
  
  // ✅ 1. 로그인 상태와 UID를 스트리밍하는 Observable
  // public readonly uid$: Observable<string | null> = user(this.auth).pipe(
  //   // User 객체에서 UID만 추출
  //   map(firebaseUser => firebaseUser ? firebaseUser.uid : null),
  //   // 앱 전체에서 구독을 공유하고, 마지막 값을 캐시하여 즉시 제공
  //   shareReplay({ bufferSize: 1, refCount: true }) 
  // );

  //private currentUid: string | null = null;

  constructor(
    private auth: Auth
  ){
    this.user$ = user(this.auth);

  }
  // getCurrentUid(): string | null {
  //   // Observable을 통한 비동기 로딩이 완료된 '최신' UID를 반환
  //   return this.currentUid;
  // }

  
  // ------------------------------------
  // 로그인 및 등록
  // ------------------------------------

  signIn(email: string, password: string): Promise<any> {
    //return signInWithEmailAndPassword(this.auth, email, password);
    return runInInjectionContext(this.injector, () => {
      return signInWithEmailAndPassword(this.auth, email, password);
    });    
  }

  signUp(email: string, password: string): Promise<any> {
    return runInInjectionContext(this.injector, () => {
      return createUserWithEmailAndPassword(this.auth, email, password);
    });    
    //return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // ------------------------------------
  // 로그아웃
  // ------------------------------------

  logout(): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      
      return signOut(this.auth);
    });  
    //return signOut(this.auth);
  }

  // ------------------------------------
  // 현재 사용자 UID 가져오기 (선택 사항)
  // ------------------------------------
  
  // 현재 사용자 UID를 Promise로 한 번만 가져오는 유틸리티
  // async getUid(): Promise<string | null> {
  //   const currentUser = await this.user$.toPromise(); // RxJS toPromise는 v7에서 제거될 수 있으므로, first()나 take(1) 사용 권장
  //   return currentUser ? currentUser.uid : null;
  // }
  // 1. Observable을 사용하여 UID를 가져오는 메서드 (권장)
  getUidObservable(): Observable<string | null> {
    return this.user$.pipe(
      // user 객체가 있으면 uid를 반환하고, 없으면 null을 반환
      map(user => user ? user.uid : null)
    );
  }
  
  // 2. Promise를 사용하여 UID를 한 번만 가져오는 메서드
  async getUidPromise(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.uid : null;
  }
// 현재 사용자 UID를 가져와 Firestore 데이터 경로에 사용
  get CurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }
  getCurrentUser(): User | null{
    return this.auth.currentUser;
  }
  /**
   * 사용자가 로그인했는지 여부를 반환하는 Observable<boolean> 구현
   * @returns Observable<boolean>
   */
  isLoggedIn(): Observable<boolean> {
    // user$를 구독하여 User 객체가 있으면 true, null이면 false를 반환
    return this.user$.pipe(
      map((user) => !!user) // !!user는 User 객체가 null이 아닐 경우(로그인 상태) true 반환
    );
  }
  // 2. 사용자가 로그인했는지 여부를 나타내는 Observable을 생성합니다.
  // isLoggedIn$: Observable<boolean> = this.user$.pipe(
  //   map(user => !!user) // user 객체가 있으면 true (로그인 상태)
  // );

  /**
   * ✅ 토큰 만료까지 남은 시간(초)을 스트리밍하는 Observable
   * @returns Observable<number> (남은 초, 로그아웃 시 -1)
   * 1. login 사용자 >> 토큰 만기 시간 >> 
   */
  // public remainSecond$: Observable<number> = this.user$.pipe(
  //   // 1. 사용자 객체가 변경될 때마다 새로운 내부 Observable로 전환
  //   switchMap(firebaseUser => {
  //     if (firebaseUser) {
  //       // 2. 토큰을 비동기적으로 가져오고, 그 결과를 Observable로 변환 (from)
  //       //    true: 토큰 만료 시 갱신 시도
  //       return from(firebaseUser.getIdToken(false)).pipe(
  //         // 3. 토큰 문자열이 도착하면 만료 시간(exp)을 추출
  //         map(token => {
  //           //const decodedToken = jwtDecode<CustomJwtPayload>(token);
  //           const decodedToken = jwtDecode(token);
  //           return decodedToken.exp; // UNIX timestamp (초)
  //         }),
  //         // 4. 만료 시간(exp)을 기준으로 매 초 남은 시간을 계산하는 Observable 생성
  //         switchMap(expTimestamp => {
  //           return interval(1000).pipe( // 1초마다 실행
  //             startWith(0), // 즉시 한 번 실행하여 초기값 제공
  //             map(() => {
  //               if(!expTimestamp) return 0;
                
  //               const nowInSeconds = Math.floor(Date.now() / 1000);
  //               // 남은 시간 계산 (초 단위)
  //               const remaining = expTimestamp - nowInSeconds;
  //               return remaining > 0 ? remaining : 0; // 0 미만이면 0으로 처리
  //             })
  //           );
  //         })
  //       );
  //     } else {
  //       // 5. 로그아웃 상태면, -1을 스트리밍하는 Observable 반환
  //       return of(-1);
  //     }
  //   }),
  //   // 6. 값이 변경될 때만 방출 (중복 방지)
  //   distinctUntilChanged(),
  //   // 7. 한 번 구독되면 결과를 공유하고 나중에 구독하는 관찰자에게도 마지막 값을 전달
  //   shareReplay({ bufferSize: 1, refCount: true })
  // );

  // remainSecond$를 getExpTimestampObservable, getRemainingTimeObservable 로 분리
  public getRemainingTimeObservable(): Observable<number>{
    const expTimestamp$ = this.getExpTimestampObservable();
    
    return expTimestamp$.pipe(
      switchMap(expTimestamp =>{
        if(!expTimestamp) return of(0)

        return interval(1000).pipe(
         startWith(0), 
         map(()=> {
          const nowInSeconds = Math.floor(Date.now() / 1000);
          // 남은 시간 계산 (초 단위)
          const remaining = expTimestamp - nowInSeconds;
          
          return Math.max(0, remaining); // 0 미만이면 0으로 처리
         })
        )
      }),
      // 6. 값이 변경될 때만 방출 (중복 방지)
      distinctUntilChanged(),
      // 7. 한 번 구독되면 결과를 공유하고 나중에 구독하는 관찰자에게도 마지막 값을 전달
      shareReplay({ bufferSize: 1, refCount: true })
    );

  }
  
  getExpTimestampObservable(): Observable<number | undefined>{
    return this.user$.pipe(
      switchMap(user =>{
        if(!user) { return of(-1)}
      
        return from(user.getIdToken(false)).pipe(
          map( token => {
            const decodedToken = jwtDecode(token);
            return decodedToken.exp; // UNIX timestamp (초)
          })
        )
      })  
    );
  }


  getCurrentIdToken(): Observable<JwtPayload | null> {
    //const auth = getAuth();
    
    // 이 리스너는 Firebase가 현재 인증 상태를 결정했을 때 실행됩니다.
    return this.user$.pipe(
        switchMap(user => {
          if (user) {
           // 1. user.getIdToken() Promise를 from()으로 Observable로 변환
            return from(user.getIdToken(false)).pipe( 
              // 2. Observable 내에서 토큰(string)이 도착하면 map으로 디코딩 처리
              map(token => {
                // 토큰은 이제 동기적인 string 타입입니다.
                const decodedToken = jwtDecode(token); 
                
                // 필요한 경우 디코딩된 토큰을 Observable로 반환
                return decodedToken; 
              })
            );
          } else {
            // 사용자가 로그아웃된 경우: null Observable을 반환합니다.
            return of(null);
          }
        })   
    );
  }

  /**
   * ID 토큰을 디코딩하여 만료 시간을 Date 객체로 반환합니다.
   */
  async getExpirationDate(): Promise<Date | null> {

    const token = this.getCurrentIdToken().subscribe(decodedToken=>{
      
        //const decodedToken = jwtDecode(token);
       const expTimestamp = decodedToken?.exp;

        // 'exp'는 UNIX 타임스탬프(초)이므로, Date 객체로 변환하려면 1000을 곱합니다.
        if(expTimestamp) {
          const expirationDate = new Date(expTimestamp * 1000);
          const now = new Date();
          const remainingMilliseconds = expirationDate.getTime() - now.getTime();
          console.log(expirationDate);
          console.log(remainingMilliseconds/1000);// 밀리초를 초 단위로 변환
        }
    });
    
    
    // if (token) {
    //   try {
    //     const decodedToken = jwtDecode(token);
    //     console.log(decodedToken);
        
    //     const expTimestamp = decodedToken.exp;

    //     // 'exp'는 UNIX 타임스탬프(초)이므로, Date 객체로 변환하려면 1000을 곱합니다.
    //     if(!expTimestamp) return null
        
         
    //     const expirationDate = new Date(expTimestamp * 1000);

    //     console.log(`토큰 만료 시간: ${expirationDate.toLocaleString()}`);
    //     return expirationDate;

    //   } catch (error) {
    //     console.error("JWT 디코딩 실패:", error);
    //     return null;
    //   }
    // }
    return null;
  }
}
