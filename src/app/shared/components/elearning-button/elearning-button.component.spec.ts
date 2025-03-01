import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElearningButtonComponent } from './elearning-button.component';

describe('ElearningButtonComponent', () => {
  let component: ElearningButtonComponent;
  let fixture: ComponentFixture<ElearningButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElearningButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElearningButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
