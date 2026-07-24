import { inject } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { take, map, of, switchMap, from } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  return user(auth).pipe(
    take(1),
    // 1. switchMap을 사용하여 user 객체 처리
    switchMap((user: User | null) => {

      if (!user) {
        // auth.signOut();
        // 사용자가 없으면 바로 접근 거부 (로그인 페이지로 리디렉션)
        return of(false); 
      }

      // true: 강제로 갱신을 시도합니다. false : 만료 시 갱신
      const tokenResultPromise = user.getIdTokenResult(false);
      // user.getIdToken
      return from(tokenResultPromise).pipe(
        map(idTokenResult => {
          // 3. 만료 시간을 확인합니다.
          const expirationTime = idTokenResult.expirationTime;
          
          if (expirationTime) {
            const expirationDate = new Date(expirationTime);
            const now = new Date();
            console.log(expirationDate);
            
            // 4. 현재 시간이 만료 시간보다 앞서는지 확인 (유효한지 판단)
            if (expirationDate > now) {
              return true; // 토큰 유효 (접근 허용)
            }
          }

          // 5. 토큰이 없거나 만료된 경우
          return false; // 접근 거부
        }),
        take(1)
      );
    }),
    // 6. 최종 결과를 받아 리디렉션 로직을 처리합니다.
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // 로그인이 유효하지 않다면 로그인 페이지로 이동
        router.navigate(['/auth/login'], {
          skipLocationChange: true,
        });
        return false;
      }
    })
  );
};
// export const authGuard: CanActivateFn = (route, state) => {
//   const auth = inject(Auth);
//   const router = inject(Router);

//   return authState(auth).pipe( // authState는 user()와 유사하게 상태를 제공합니다.
//     take(1),  //Observable이 방출하는 값 중 첫 번째 값만 구독자에게 전달합니다
//     map(user => {
//       // 사용자가 로그인되어 있으면 true 반환 (접근 허용)
//       if (user) {
//         return true;
//       }else {
      
//         router.navigate(['/auth/login'], {
//           skipLocationChange: true, 
//         });
//       }
      
      
//       return false;

//     })
//   );
// };
