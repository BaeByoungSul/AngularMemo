import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';

// 1. 프로덕션 환경 확인
if (environment.production) {
  // 2. Angular의 프로덕션 모드 활성화 (성능 최적화 및 추가 검사 비활성화)
  enableProdMode(); 
  // 3. 환경 파일에 정의한 console 비활성화 함수 호출
  environment.disableConsoleLog();
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
