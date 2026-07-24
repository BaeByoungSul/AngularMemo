import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeTest } from './tree-test';

describe('TreeTest', () => {
  let component: TreeTest;
  let fixture: ComponentFixture<TreeTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
