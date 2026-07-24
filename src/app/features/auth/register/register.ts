import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FireAuthService } from '../../../core/fire-auth-service';
@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  loading$ = new BehaviorSubject<boolean>(false);
  isSubmitOk = false;
  errorMessage: string = '';

  myForm = new FormGroup({
    email: new FormControl("",[Validators.required, Validators.email]),
    passwordGroup : new FormGroup({
      password: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
      confirmPassword: new FormControl("", [Validators.required]),
    }, {validators: this.matchValidator })
    
  })

  constructor(
    private authService$: FireAuthService,
    private router$: Router
  ){ }

  onSubmit(){
    this.errorMessage = '';
    
    if (this.myForm.invalid) {
      this.errorMessage = "form is invalid!";
      return;
    }
    this.loading$.next(true);
    
    const formValues = this.myForm.value;
    
    const email = this.myForm.controls.email.value;
    const password = this.myForm.controls.passwordGroup.controls.password.value;

    if(!email){
      this.errorMessage = "email is invalid!";
      return;
    }
    if(!password){
      this.errorMessage = "password is invalid!";
      return;
    }
    this.authService$
      .signUp(email, password)
      .then(() => { 
        console.log('로그인 성공');
        this.router$.navigate(
          ['/home/memo-viewer'],{
            skipLocationChange:true
          }); 
        //this.selectedMenuSubject.next(menuRole);
       
        this.loading$.next(false) ;
      })
      .catch(error => { this.errorMessage = error;  this.loading$.next(false);});



    // const { email, passwordGroup.password } = this.myForm.value;
    // this.isLoading = true;

    // this.authService.register(email, password)
    //   .then(() => {
    //     // 성공적으로 등록된 후, 예를 들어 /home으로 이동
    //     this.router.navigate(['/home']);
    //   })
    //   .catch(error => {
    //     // Firebase 오류 처리 (예: 이메일이 이미 사용 중인 경우)
    //     this.errorMessage = this.getErrorMessage(error.code);
    //   })
    //   .finally(() => {
    //     this.isLoading = false;
    //   });    
  }
  private matchValidator(): ValidatorFn {    
      return (controls: AbstractControl): ValidationErrors | null => {
        //const formGroup = controls as FormGroup
        const password = controls.get('password');
        const confirmPassword = controls.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
          return { mustMatch: true };
        }
        return null
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
           ctrl?.hasError('email') ? 'Not a valid email' :
           ctrl?.hasError('minlength') ? `This field must be at least ${minLengthValue} characters long ` :
           ctrl?.hasError('maxlength') ? `This field can be max ${maxLengthValue} characters long.` : '';
//           ctrl?.hasError('requirements') ? 'Password needs to be at least six characters, one uppercase letter and one number' : '';
  }
}
