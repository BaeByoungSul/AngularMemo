import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoViewer2 } from './memo-viewer2';

describe('MemoViewer2', () => {
  let component: MemoViewer2;
  let fixture: ComponentFixture<MemoViewer2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoViewer2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoViewer2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
