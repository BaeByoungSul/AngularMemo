import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTest } from './pdf-test';

describe('PdfTest', () => {
  let component: PdfTest;
  let fixture: ComponentFixture<PdfTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
