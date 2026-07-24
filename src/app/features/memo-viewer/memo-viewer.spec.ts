import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoViewer } from './memo-viewer';

describe('MemoViewer', () => {
  let component: MemoViewer;
  let fixture: ComponentFixture<MemoViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
