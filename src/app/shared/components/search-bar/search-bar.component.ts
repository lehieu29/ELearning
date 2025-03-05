import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() initialValue: string = '';
  @Input() debounceTime: number = 300;
  @Output() search = new EventEmitter<string>();
  
  searchControl = new FormControl('');
  
  ngOnInit(): void {
    super.ngOnInit();
    this.searchControl.setValue(this.initialValue);
    
    this.searchControl.valueChanges.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this._onDestroySub)
    ).subscribe(value => {
      this.search.emit(value);
    });
  }
  
  clearSearch(): void {
    this.searchControl.setValue('');
  }
}