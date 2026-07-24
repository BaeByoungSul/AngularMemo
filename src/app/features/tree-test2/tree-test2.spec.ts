import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeTest2 } from './tree-test2';

describe('TreeTest2', () => {
  let component: TreeTest2;
  let fixture: ComponentFixture<TreeTest2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeTest2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeTest2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
