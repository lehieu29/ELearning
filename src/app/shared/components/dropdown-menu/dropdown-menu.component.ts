import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { DropdownSection } from '../../interface/dropdown-section';

@Component({
  selector: 'app-dropdown-menu',
  standalone: false,
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss'
})
export class DropdownMenuComponent {
  @Input() title!: string;
  @Input() sections: DropdownSection[] = [];
  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }
}
