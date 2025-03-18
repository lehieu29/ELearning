import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { UserService } from '@app/shared/services/user.service';
import { User } from '@app/shared/models/user.model';
import { takeUntil, debounceTime, distinctUntilChanged, finalize, catchError } from 'rxjs/operators';
import { fromEvent, of } from 'rxjs';
import { NotificationService } from '@app/shared/services/notification.service';

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
  isLoading = false;
  error = '';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param userService Dịch vụ quản lý người dùng
   * @param notificationService Dịch vụ thông báo
   */
  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và đăng ký theo dõi sự kiện từ input
   * Initialize component and subscribe to input events
   */
  ngOnInit(): void {
    if (!this.inputElement || !this.inputElement.nativeElement) {
      console.error('Input element is not provided to MentionSystemComponent');
      return;
    }
    
    // Đăng ký sự kiện 'input' để phát hiện thay đổi và kiểm tra mention
    // Register 'input' event to detect changes and check for mentions
    fromEvent(this.inputElement.nativeElement, 'input')
      .pipe(
        takeUntil(this._onDestroySub),
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.checkForMention();
      });
    
    // Đăng ký sự kiện 'keydown' để xử lý phím di chuyển và chọn
    // Register 'keydown' event to handle navigation and selection keys
    fromEvent(this.inputElement.nativeElement, 'keydown')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe((event: KeyboardEvent) => {
        this.handleKeyDown(event);
      });
    
    // Đăng ký sự kiện click ra ngoài để đóng dropdown
    // Register click outside event to close dropdown
    document.addEventListener('click', this.handleClickOutside.bind(this));
    
    // Đảm bảo gỡ bỏ listener khi component bị hủy
    // Ensure listener is removed when component is destroyed
    this._onDestroySub.subscribe(() => {
      document.removeEventListener('click', this.handleClickOutside.bind(this));
    });
  }
  
  /**
   * Kiểm tra nếu có @ trong văn bản và vị trí của con trỏ để tìm mention
   * Check if there is an @ symbol in the text and the cursor position to find mentions
   */
  checkForMention(): void {
    if (!this.inputElement || !this.inputElement.nativeElement) return;
    
    const textContent = this.inputElement.nativeElement.value || '';
    const caretPosition = this.inputElement.nativeElement.selectionStart;
    
    let currentPosition = caretPosition - 1;
    let mentionStartPos = -1;
    
    // Tìm ngược từ vị trí con trỏ để tìm ký tự @
    // Search backwards from cursor position to find @ character
    while (currentPosition >= 0 && textContent[currentPosition] !== ' ' && textContent[currentPosition] !== '\n') {
      if (textContent[currentPosition] === '@') {
        mentionStartPos = currentPosition;
        break;
      }
      currentPosition--;
    }
    
    // Nếu tìm thấy @, lấy chuỗi tìm kiếm và bắt đầu tìm người dùng
    // If @ is found, get the search query and start searching for users
    if (mentionStartPos >= 0) {
      const searchQuery = textContent.substring(mentionStartPos + 1, caretPosition);
      
      if (searchQuery.length > 0) {
        this.searchTerm = searchQuery;
        this.mentionStartIndex = mentionStartPos;
        this.isMentionActive = true;
        this.searchUsers();
      } else {
        // Nếu chỉ có @ mà không có ký tự nào, hiển thị tất cả người dùng
        // If only @ is typed without any characters, show all users
        this.searchTerm = '';
        this.mentionStartIndex = mentionStartPos;
        this.isMentionActive = true;
        this.searchUsers();
      }
    } else {
      this.closeMentionDropdown();
    }
  }
  
  /**
   * Tìm kiếm người dùng dựa trên từ khóa tìm kiếm
   * Search for users based on search term
   */
  searchUsers(): void {
    this.isLoading = true;
    this.error = '';
    
    this.userService.searchUsers(this.searchTerm)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tìm kiếm người dùng:', err);
          this.error = 'Không thể tìm kiếm người dùng. Vui lòng thử lại.';
          return of([]);
        })
      )
      .subscribe(users => {
        // Giới hạn số lượng người dùng hiển thị và đặt lại chỉ mục đã chọn
        // Limit number of users displayed and reset selected index
        this.mentionUsers = users.slice(0, 5);
        this.selectedIndex = 0;
        
        // Nếu không có kết quả, có thể hiển thị thông báo
        // If no results, may display a message
        if (this.mentionUsers.length === 0 && !this.error) {
          this.error = 'Không tìm thấy người dùng phù hợp';
        }
      });
  }
  
  /**
   * Xử lý sự kiện phím được nhấn để điều hướng và chọn
   * Handle key down event for navigation and selection
   * @param event Sự kiện bàn phím
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isMentionActive) return;
    
    switch (event.key) {
      case 'ArrowDown':
        // Di chuyển xuống trong danh sách
        // Move down in the list
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.mentionUsers.length - 1);
        this.scrollToSelected();
        break;
        
      case 'ArrowUp':
        // Di chuyển lên trong danh sách
        // Move up in the list
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.scrollToSelected();
        break;
        
      case 'Enter':
      case 'Tab':
        // Chọn người dùng đang được highlight
        // Select currently highlighted user
        if (this.mentionUsers.length > 0) {
          event.preventDefault();
          this.selectUser(this.mentionUsers[this.selectedIndex]);
        }
        break;
        
      case 'Escape':
        // Đóng dropdown
        // Close dropdown
        event.preventDefault();
        this.closeMentionDropdown();
        break;
    }
  }
  
  /**
   * Cuộn đến mục đã chọn trong dropdown
   * Scroll to selected item in dropdown
   */
  scrollToSelected(): void {
    if (this.mentionDropdown && this.mentionDropdown.nativeElement) {
      const menuElement = this.mentionDropdown.nativeElement;
      const selectedElement = menuElement.querySelector(`li:nth-child(${this.selectedIndex + 1})`);
      
      if (selectedElement) {
        // Tính toán vị trí cuộn để đảm bảo mục được chọn hiển thị trong vùng nhìn thấy
        // Calculate scroll position to ensure selected item is visible
        const menuRect = menuElement.getBoundingClientRect();
        const selectedRect = selectedElement.getBoundingClientRect();
        
        if (selectedRect.bottom > menuRect.bottom) {
          menuElement.scrollTop = selectedElement.offsetTop + selectedElement.clientHeight - menuElement.clientHeight;
        } else if (selectedRect.top < menuRect.top) {
          menuElement.scrollTop = selectedElement.offsetTop;
        }
      }
    }
  }
  
  /**
   * Xử lý sự kiện click ra ngoài component để đóng dropdown
   * Handle click outside component to close dropdown
   * @param event Sự kiện click
   */
  handleClickOutside(event: MouseEvent): void {
    if (this.isMentionActive) {
      // Kiểm tra nếu click bên ngoài dropdown và input
      // Check if click is outside dropdown and input
      const targetElement = event.target as HTMLElement;
      const isClickInside = this.mentionDropdown?.nativeElement.contains(targetElement) ||
                            this.inputElement?.nativeElement.contains(targetElement);
      
      if (!isClickInside) {
        this.closeMentionDropdown();
      }
    }
  }
  
  /**
   * Chọn một người dùng và chèn mention vào input
   * Select a user and insert mention into input
   * @param user Người dùng được chọn
   */
  selectUser(user: User): void {
    if (!this.inputElement || !this.inputElement.nativeElement || !user) return;
    
    const textContent = this.inputElement.nativeElement.value;
    const caretPosition = this.inputElement.nativeElement.selectionStart;
    
    // Tách văn bản thành phần trước và sau vị trí mention
    // Split text into parts before and after mention position
    const beforeMention = textContent.substring(0, this.mentionStartIndex);
    const afterMention = textContent.substring(caretPosition);
    
    // Chèn mention người dùng
    // Insert user mention
    const userMention = `@${user.username} `;
    this.inputElement.nativeElement.value = beforeMention + userMention + afterMention;
    
    // Đặt vị trí con trỏ sau mention
    // Set caret position after mention
    const newPosition = this.mentionStartIndex + userMention.length;
    this.inputElement.nativeElement.setSelectionRange(newPosition, newPosition);
    
    // Focus lại vào input
    // Focus back on input
    this.inputElement.nativeElement.focus();
    
    // Thông báo user đã được mention
    // Notify that user has been mentioned
    this.userMentioned.emit(user);
    
    // Đóng dropdown
    // Close dropdown
    this.closeMentionDropdown();
  }
  
  /**
   * Đóng dropdown mention và đặt lại các giá trị
   * Close mention dropdown and reset values
   */
  closeMentionDropdown(): void {
    this.isMentionActive = false;
    this.searchTerm = '';
    this.mentionUsers = [];
    this.selectedIndex = 0;
    this.mentionStartIndex = -1;
    this.error = '';
  }
}
