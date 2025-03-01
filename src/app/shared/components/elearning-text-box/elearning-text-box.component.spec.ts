import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElearningTextBoxComponent } from './elearning-text-box.component';

describe('ElearningTextBoxComponent', () => {
  let component: ElearningTextBoxComponent;
  let fixture: ComponentFixture<ElearningTextBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElearningTextBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElearningTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
