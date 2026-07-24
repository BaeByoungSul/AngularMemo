import { Component, OnInit } from '@angular/core';
import { FireAuthService } from '../../../core/fire-auth-service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loading$ = new BehaviorSubject<boolean>(false);
  serverError: string | null = null; 

  currentUser$: Observable<User | null> 

  myform: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email ]),
    password: new FormControl("", [Validators.required]),
  });
  
  constructor(
    private authService$: FireAuthService,
    private router$: Router
  ){
    this.currentUser$ = this.authService$.user$;
  }

  ngOnInit(): void {
    // // 1. 인증 상태 스트림을 구독합니다.
    // this.authService$.isLoggedIn().pipe(
    //   take(1) // 상태를 한 번만 확인하고 구독을 종료합니다.
    // ).subscribe(isLoggedIn => {
    //   if (isLoggedIn) {
    //     // 2. 이미 로그인된 경우, 대시보드(혹은 다른 페이지)로 리다이렉션합니다.
    //     this.router$.navigate(
    //       ['/memo-viewer'],{
    //         skipLocationChange:true
    //       }); 
    //   }
    //   // 3. 로그인되지 않은 경우, 로그인 화면을 유지합니다.
    // });


  }


  onSignIn() {
    // 실제 앱에서는 form을 통해 값을 받아야 합니다.
    // this.authService$.signIn('xyz5787@naver.com', 'wkehd124!@$')
    //   .then(() => console.log('로그인 성공'))
    //   .catch(error => console.error('로그인 실패:', error));
    if (this.myform.invalid) {
      this.serverError = "form is invalid!";
      return;
    }
    this.loading$.next(true);
    
    const formValues = this.myform.value;
    
    this.authService$
      .signIn(formValues.email, formValues.password)
      .then(() => { 
        console.log('로그인 성공');
        this.router$.navigate(
          ['/memo-viewer'],{
            skipLocationChange:true
          }); 
        //this.selectedMenuSubject.next(menuRole);
       
        this.loading$.next(false) ;
      })
      .catch(error => { this.serverError = error;  this.loading$.next(false);});
  }

  onSignInWithGoogle() {
    this.authService$.signInWithGoogle()
      .then(() => console.log('Google 로그인 성공'))
      .catch(error => console.error('Google 로그인 실패:', error));
  }

  onLogout() {
    this.authService$.logout()
      .then(() => console.log('로그아웃 성공'))
      .catch(error => console.error('로그아웃 실패:', error));
  }

    getErrorMsg(ctrlName: string){
    const ctrl = this.myform.get(ctrlName);

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
