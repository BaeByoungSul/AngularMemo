import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from './fire-auth-service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { User } from '@angular/fire/auth';

export const auth2Guard: CanActivateFn = (route, state) => {
  const authService = inject(FireAuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    // 1. 현재 사용자 상태를 한 번만 받습니다.
    take(1),
    // 2. 사용자 상태에 따라 접근을 허용하거나 리디렉션합니다.
    map((user: User | null) => {
      // 사용자 객체가 존재하면 (로그인 상태)
      if (user) {
        console.log('Auth Guard: Access Granted.');
        return true; // 라우트 접근 허용
      } 
      // 사용자 객체가 null이면 (로그아웃 상태)
      else {
        console.log('Auth Guard: Access Denied. Redirecting to login...');
        // 로그인 페이지로 리디렉션하고 접근을 거부합니다.
        router.navigate(['/auth/login'], {
          skipLocationChange: true,
        });
        return false; // 라우트 접근 거부
      }
    })
  );
};
