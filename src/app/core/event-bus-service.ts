import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private buttonClickSubject = new Subject<void>();

  // 이벤트를 내보내는 메서드
  emitButtonClick(): void {
    this.buttonClickSubject.next();
  }

  // 이벤트를 구독하는 Observable 반환
  getButtonClickEvent(): Observable<void> {
    return this.buttonClickSubject.asObservable();
  }
}
