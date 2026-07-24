import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTree } from './data-tree';

describe('DataTree', () => {
  let component: DataTree;
  let fixture: ComponentFixture<DataTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
