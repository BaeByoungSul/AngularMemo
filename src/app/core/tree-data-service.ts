import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserDataNode } from '../interfaces/user-data-node';

@Injectable({
  providedIn: 'root'
})
export class TreeDataService {
  // 초기값은 null (또는 기본 노드)
  private selectedNodeSource = new BehaviorSubject<UserDataNode | null>(null); 

  // 다른 컴포넌트에서 구독할 수 있는 Observable
  currentSelectedNode = this.selectedNodeSource.asObservable();

  // 트리 컴포넌트에서 노드를 선택할 때 호출
  changeSelectedNode(node: UserDataNode) {
    this.selectedNodeSource.next(node);
  }
}

