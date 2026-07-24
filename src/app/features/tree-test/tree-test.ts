import { ArrayDataSource } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';


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
  selector: 'app-tree-test',
  imports: [
    MatTreeModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './tree-test.html',
  styleUrl: './tree-test.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTest implements AfterViewInit {
   
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

  constructor() {
    this.dataSource.data = TREE_DATA;
  }
  ngAfterViewInit(): void {
    this.treeControl.expandAll();
  }

  // 노드가 확장 가능한지 확인하는 헬퍼 함수
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}
