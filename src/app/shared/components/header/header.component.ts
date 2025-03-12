// File path: src/app/shared/components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../base/base-component';
import { AuthService } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { ThemeService } from '@app/shared/services/theme.service';
import { User } from '@app/shared/models/user.model';
import { DropdownSection } from '@app/shared/interface/dropdown-section';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent extends BaseComponent implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  unreadNotificationsCount = 0;
  isSearchVisible = false;
  searchQuery = '';
  isDarkMode = false;
  isMobileMenuOpen = false;

  coursesDropdown: DropdownSection[] = [
    {
      title: 'Programs',
      items: [
        { label: 'Nanodegree Programs', href: '/courses/nanodegree' },
        { label: 'Executive Programs', href: '/courses/executive' },
        { label: 'Free Courses', href: '/courses/free' }
      ]
    },
    {
      title: 'Popular Subjects',
      columns: 2,
      items: [
        { label: 'Artificial Intelligence', href: '/courses/ai' },
        { label: 'Data Science', href: '/courses/data-science' },
        { label: 'Web Development', href: '/courses/web-development' },
        { label: 'Cloud Computing', href: '/courses/cloud-computing' },
        { label: 'Machine Learning', href: '/courses/machine-learning' },
        { label: 'Product Management', href: '/courses/product-management' }
      ]
    },
    {
      title: 'Learning Paths',
      items: [
        { label: 'Become a Data Scientist', href: '/paths/data-scientist' },
        { label: 'Become a Full Stack Developer', href: '/paths/full-stack-developer' },
        { label: 'Become a Machine Learning Engineer', href: '/paths/ml-engineer' }
      ]
    }
  ];

  resourcesDropdown: DropdownSection[] = [
    {
      items: [
        { label: 'Career Resources', href: '/resources/career' },
        { label: 'Learning Library', href: '/resources/library' },
        { label: 'Community Forums', href: '/community' },
        { label: 'Events & Webinars', href: '/events' },
        { label: 'Blog', href: '/blog' }
      ]
    }
  ];

  enterpriseDropdown: DropdownSection[] = [
    {
      items: [
        { label: 'Udacity for Enterprise', href: '/enterprise' },
        { label: 'Government', href: '/enterprise/government' },
        { label: 'Higher Education', href: '/enterprise/education' }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private router: Router
  ) {
    super();
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/login'], { queryParams: { tab: 'register' } });
  }

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.currentUser$
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
      });

    // Subscribe to unread notifications count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(count => {
        this.unreadNotificationsCount = count;
      });

    // Subscribe to theme changes
    this.themeService.getTheme()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(theme => {
        this.isDarkMode = theme === 'dark' ||
          (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      });
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.isSearchVisible = false;
    }
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkMode ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.themeService.setTheme(newTheme as 'light' | 'dark' | 'system');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}