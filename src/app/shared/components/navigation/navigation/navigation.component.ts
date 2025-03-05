import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';
import { DropdownSection } from '@app/shared/interface/dropdown-section';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  isLoggedIn = false;
  userFullName: string = '';
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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const userData = this.authService.getUserData();
      if (userData && userData.fullName) {
        this.userFullName = userData.fullName;
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}