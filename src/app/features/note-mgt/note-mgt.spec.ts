import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteMgt } from './note-mgt';

describe('NoteMgt', () => {
  let component: NoteMgt;
  let fixture: ComponentFixture<NoteMgt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteMgt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteMgt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
