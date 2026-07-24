import { Routes } from '@angular/router';
import { DataEditer } from './features/data-editer/data-editer';
//import { MemoViewer } from './features/memo-viewer/memo-viewer';
import { DataViewer } from './features/data-viewer/data-viewer';
import { Home } from './features/home/home';
import { MemoTest } from './features/memo-test/memo-test';
import { PdfTest } from './features/pdf-test/pdf-test';
import { TreeTest } from './features/tree-test/tree-test';
import { DataTree } from './shared/data-tree/data-tree';
import { TreeTest2 } from './features/tree-test2/tree-test2';
import { auth2Guard } from './core/auth2-guard';
import { MemoViewer2 } from './features/memo-viewer2/memo-viewer2';
import { NoteEditor } from './features/note-editor/note-editor';
import { NoteMgt } from './features/note-mgt/note-mgt';


export const routes: Routes = [
     // 초기 페이지 또는 로그인 페이지
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', component: Home, canActivate:[auth2Guard],
    children: [
        {path:'', component: MemoViewer2},
        {path:'memo-viewer', component: MemoViewer2},
        //{path:'memo-viewer2', component: MemoViewer2},
        {path:'data-viewer', component: DataViewer},
        {path:'data-editer', component: DataEditer},
        {path:'memo-test', component: MemoTest},
        {path:'pdf-test', component: PdfTest},
        {path:'tree-test', component: TreeTest},
        {path:'tree-test2', component: TreeTest2},
        {path:'data-tree', component: DataTree},
        {path:'note-editor', component: NoteEditor},
        {path:'note-mgt', component: NoteMgt},
    ]
   } ,
  // UsersModule을 지연 로딩
  { 
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule ) 
  }
];
