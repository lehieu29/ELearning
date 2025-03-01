import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-elearning-button',
  standalone: false,
  templateUrl: './elearning-button.component.html',
  styleUrl: './elearning-button.component.scss'
})
export class ElearningButtonComponent extends BaseComponent {
  @Input()
  disabled: boolean = false;

  /**
  * Nội dung button hiển thị
  * @CreatedBy: lthieu1 05/02/2025
  */
  @Input()
  text = "";

  @Input() variant: string = 'primary';
  @Input() size: string = 'md';

  @Input() iconStart?: string;

  @Input() iconEnd?: string;

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  classBtn: string = "";

  @Output()
  btnClick: EventEmitter<any> = new EventEmitter<any>();

  override ngOnInit(): void {
    super.ngOnInit();
    this.classBtn = this.getClasses();
  }

  /**
  * Lấy class
  * @returns 
  * @CreatedBy: lthieu1 10/02/2025
  */
  getClasses() {
    const base = 'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
      outline: 'border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 focus:ring-blue-300',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return `${base} ${variants[this.variant]} ${sizes[this.size]}`;
  }

  /**
   * Sự kiện click button
   */
  buttonClick(e: any) {
    this.btnClick.emit(e);
  }
}
