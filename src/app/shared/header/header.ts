import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'
import { Router, RouterModule } from '@angular/router';
import { FireAuthService } from '../../core/fire-auth-service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AsyncPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { EventBusService } from '../../core/event-bus-service';
import { LogLevel } from '@angular/fire';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    AsyncPipe
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  @Output() toggleEvent = new EventEmitter<boolean>();

  isOpened = true;
  currentUser$: Observable<User | null> 
  
  //expirationTime!: Date | null;
  // 템플릿에서 async 파이프를 사용하여 구독 및 해지를 자동 관리합니다.
  public remainSecond$: Observable<number> ; //= this.authService.remainSecond$;

  constructor(
    private router$: Router,
    private authService$: FireAuthService,
    private eventBus$: EventBusService
    
  ){
    this.currentUser$ = this.authService$.user$;
    this.remainSecond$ = this.authService$.getRemainingTimeObservable();
  }
 
  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }
  
  navigateToHome(): void {
    //this.authService$.setCurrentMenu('');  
    //this.router$.navigate(['/home']);
  }

  menuIconClick(){
    console.log('sideNavToggle');
    this.eventBus$.emitButtonClick();

    //this.toggleEvent.emit(true);
    //this._sidenavToggle.toggleEmitter.emit(true);
    //this.isOpened = !this.isOpened;
    // this.subjectService$.sendIconMenuClick(this.isOpened);
  }
  onLogout(): void {
    console.log('logout');
    
    this.authService$.logout()
      .then(() => {
        // 로그아웃이 성공적으로 완료된 후 라우팅 실행
        this.router$.navigate(['/auth/login'],{
          skipLocationChange:true
        }); 
      })
      .catch((error) => {
        console.error("로그아웃 중 오류 발생:", error);
        // 오류 발생 시 사용자에게 메시지를 표시할 수 있습니다.
      });
  }
     // 남은 시간을 "분:초" 형식으로 변환하는 함수
  formatTime(totalSeconds: number): string {
    if ( totalSeconds <= 0) return '';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

 // Pad with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}

// async fetchExpirationTime(): Promise<void> {
//     const expDate = await this.authService$.getExpirationDate();
    
//     //console.log(expDate);
    
//     // 비동기 작업 완료 후 변수에 값 할당
//     this.expirationTime = expDate;
// //console.log(this.expirationTime);

//     if (expDate) {
//       // 로직 활용 예시: 만료 5분 전에 경고 콘솔 출력
//       const now = new Date().getTime();
//       const fiveMinutesInMs = 5 * 60 * 1000;
      
//       if (expDate.getTime() - now < fiveMinutesInMs) {
//         console.warn("경고: ID 토큰이 5분 이내에 만료될 예정입니다. 클라이언트 SDK가 곧 갱신할 것입니다.");
//       }
//     }
//   }