import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { map, Observable, Subscription } from 'rxjs';
import { FireDataService } from '../../core/fire-data-service';


/** 트리의 계층적 데이터 인터페이스 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: '과일',
    children: [{ name: '사과' }, { name: '바나나' }, { name: '딸기' }],
  },
  {
    name: '채소',
    children: [
      {
        name: '뿌리 채소',
        children: [{ name: '당근' }, { name: '감자' }],
      },
      {
        name: '잎 채소',
        children: [{ name: '상추' }, { name: '시금치' }],
      },
    ],
  },
];

/** Flat Tree를 위한 평탄화된 노드 인터페이스 */
interface ExampleFlatNode {
  expandable: boolean; // 확장 가능 여부 (자식이 있는지)
  name: string;
  level: number; // 깊이 (레벨)
}

@Component({
  selector: 'app-data-tree',
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './data-tree.html',
  styleUrl: './data-tree.css'
})
export class DataTree implements AfterViewInit {
 
// 1. MatTreeFlattener: 계층적 노드를 Flat 노드로 변환합니다.
  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  // 2. FlatTreeControl: 확장/축소 상태와 레벨을 관리합니다.
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level, // 레벨 getter
    (node) => node.expandable // 확장 가능 여부 getter
  );

  // 3. MatTreeFlatDataSource: FlatTreeFlattener와 TreeControl을 사용하여 데이터를 제공합니다.
  dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    new MatTreeFlattener(
      this._transformer,
      (node) => node.level, // getLevel 함수
      (node) => node.expandable, // isExpandable 함수
      (node) => node.children // getChildren 함수
    )
  );
    // 노드가 확장 가능한지 확인하는 헬퍼 함수
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;


  userData$! : Observable<any>;
  subscriptionData: Subscription | undefined;
    
  constructor(
    private dataService$: FireDataService
  ) {
    this.userData$ = this.dataService$.getUserDataObservable();
    this.subscriptionData = this.userData$
      .pipe( 
        map(data => {
          const initialNode :FoodNode[] = this.buildTree(data) ;
          return initialNode;
        }) 
      )
      .subscribe((nodeData)=>{
        //console.log(nodeData);
        //console.log(TREE_DATA);
        
        this.dataSource.data = nodeData
        
        this.treeControl.expandAll();
        console.log(this.dataSource);
        
      });

    //this.dataSource.data = TREE_DATA;
  }
  ngAfterViewInit(): void {
    
  }


  private buildTree(data: any, parentNode: FoodNode | null = null): FoodNode[] {
      const nodes: FoodNode[] = [];
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          // 배열도 자식 노드를 가질 수 있는 객체로 처리하거나,
          // 데이터 탐색을 위해 별도로 처리할지 결정해야 합니다. (여기서는 기존 로직 유지)
          const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  
          const newNode: FoodNode = {
            name: key,
            // children 속성을 선택적으로 추가합니다.
            ...(isObject && { children: this.buildTree(value) }),
            //children: isObject ? this.buildTree(value) : undefined,
            // ⭐ 핵심 1: 현재 함수로 전달받은 parentNode를 새 노드의 parent로 설정
            //parent: parentNode
          };
  
          // if (isObject) {
          //   // ⭐ 핵심 2: 자식 노드를 재귀적으로 생성할 때, 현재 생성된 newNode를 자식의 parent로 전달
          //   newNode.children = this.buildTree(value, newNode);
          // }
          
          nodes.push(newNode);
        }
      }
      return nodes;
    }
}
