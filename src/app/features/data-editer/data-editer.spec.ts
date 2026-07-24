import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEditer } from './data-editer';

describe('DataEditer', () => {
  let component: DataEditer;
  let fixture: ComponentFixture<DataEditer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataEditer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataEditer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
