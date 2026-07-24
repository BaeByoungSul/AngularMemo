import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoTest } from './memo-test';

describe('MemoTest', () => {
  let component: MemoTest;
  let fixture: ComponentFixture<MemoTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
