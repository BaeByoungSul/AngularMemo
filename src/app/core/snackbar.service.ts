import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(
    private snackBar$: MatSnackBar
  ) { }
  error(message: string, duration: number=5000) {
    return this.snackBar$.open(message, "error", {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',      
      panelClass: ['snackbar-error']
    
    });
    // this.snackBar$.open(message, action,{
    //   duration: 2000,
    //   horizontalPosition: this.horizontalPosition,
    //   verticalPosition: this.verticalPosition
    // });
  }

  success(message: string,duration: number=2000){
    //return this.snackBar$.open(message, undefined, {panelClass: ['snackbar-success']});
    return this.snackBar$.open(message, "success", {
      duration: duration,
      horizontalPosition:'center',
      verticalPosition:'bottom',
      panelClass: ['snackbar-success']
    })
  }

  info(message: string,duration: number=2000){
    return this.snackBar$.open(message, "info", {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-info']
    });
  }
}
