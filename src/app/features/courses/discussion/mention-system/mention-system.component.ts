import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { UserService } from '@app/shared/services/user.service';
import { User } from '@app/shared/models/user.model';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-mention-system',
  templateUrl: './mention-system.component.html'
})
export class MentionSystemComponent extends BaseComponent implements OnInit {
  @Input() inputElement: ElementRef;
  @Output() userMentioned = new EventEmitter<User>();
  
  @ViewChild('mentionDropdown') mentionDropdown: ElementRef;
  
  isMentionActive = false;
  searchTerm = '';
  mentionUsers: User[] = [];
  selectedIndex = 0;
  mentionStartIndex = -1;
  
  constructor(private userService: UserService) {
    super();
  }
  
  ngOnInit(): void {
    if (this.inputElement && this.inputElement.nativeElement) {
      fromEvent(this.inputElement.nativeElement, 'input')
        .pipe(
          takeUntil(this._onDestroySub),
          debounceTime(200),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.checkForMention();
        });
        
      fromEvent(this.inputElement.nativeElement, 'keydown')
        .pipe(takeUntil(this._onDestroySub))
        .subscribe((event: KeyboardEvent) => {
          this.handleKeyDown(event);
        });
    }
  }
  
  checkForMention(): void {
    const textContent = this.inputElement.nativeElement.value || '';
    const caretPosition = this.inputElement.nativeElement.selectionStart;
    
    let currentPosition = caretPosition - 1;
    let mentionStartPos = -1;
    
    while (currentPosition >= 0 && textContent[currentPosition] !== ' ' && textContent[currentPosition] !== '\n') {
      if (textContent[currentPosition] === '@') {
        mentionStartPos = currentPosition;
        break;
      }
      currentPosition--;
    }
    
    if (mentionStartPos >= 0) {
      const searchQuery = textContent.substring(mentionStartPos + 1, caretPosition);
      
      if (searchQuery.length > 0) {
        this.searchTerm = searchQuery;
        this.mentionStartIndex = mentionStartPos;
        this.isMentionActive = true;
        this.searchUsers();
      } else {
        this.closeMentionDropdown();
      }
    } else {
      this.closeMentionDropdown();
    }
  }
  
  searchUsers(): void {
    this.userService.searchUsers(this.searchTerm)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (users) => {
          this.mentionUsers = users.slice(0, 5); // Limit to 5 users
          this.selectedIndex = 0;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.closeMentionDropdown();
        }
      });
  }
  
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isMentionActive) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.mentionUsers.length - 1);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        break;
        
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.selectUser(this.mentionUsers[this.selectedIndex]);
        break;
        
      case 'Escape':
        event.preventDefault();
        this.closeMentionDropdown();
        break;
    }
  }
  
  selectUser(user: User): void {
    if (!this.inputElement || !user) return;
    
    const textContent = this.inputElement.nativeElement.value;
    const caretPosition = this.inputElement.nativeElement.selectionStart;
    
    const beforeMention = textContent.substring(0, this.mentionStartIndex);
    const afterMention = textContent.substring(caretPosition);
    
    // Insert the user mention
    const userMention = `@${user.username} `;
    this.inputElement.nativeElement.value = beforeMention + userMention + afterMention;
    
    // Set caret position after the mention
    const newPosition = this.mentionStartIndex + userMention.length;
    this.inputElement.nativeElement.setSelectionRange(newPosition, newPosition);
    
    // Focus the input element
    this.inputElement.nativeElement.focus();
    
    this.userMentioned.emit(user);
    this.closeMentionDropdown();
  }
  
  closeMentionDropdown(): void {
    this.isMentionActive = false;
    this.searchTerm = '';
    this.mentionUsers = [];
    this.selectedIndex = 0;
    this.mentionStartIndex = -1;
  }
}
