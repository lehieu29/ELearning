// src/app/shared/guard/browser-support.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowserSupportGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check browser support
    if (this.isBrowserSupported()) {
      return true;
    }
    
    // Redirect to browser not supported page
    return this.router.createUrlTree(['/browser-not-supported']);
  }
  
  private isBrowserSupported(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for IE
    if (userAgent.indexOf('msie') !== -1 || userAgent.indexOf('trident') !== -1) {
      return false;
    }
    
    // Check for older browsers
    const browserSupport = {
      chrome: 60,
      firefox: 60,
      safari: 12,
      edge: 17
    };
    
    // Extract browser and version
    let browser: string | null = null;
    let version = 0;
    
    if (userAgent.indexOf('chrome') !== -1) {
      browser = 'chrome';
      version = this.extractVersion(userAgent, 'chrome');
    } else if (userAgent.indexOf('firefox') !== -1) {
      browser = 'firefox';
      version = this.extractVersion(userAgent, 'firefox');
    } else if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
      browser = 'safari';
      version = this.extractVersion(userAgent, 'safari');
    } else if (userAgent.indexOf('edg') !== -1) {
      browser = 'edge';
      version = this.extractVersion(userAgent, 'edg');
    }
    
    // Check if browser and version are supported
    if (browser && version >= browserSupport[browser]) {
      return true;
    }
    
    return browser === null; // Allow unknown browsers
  }
  
  private extractVersion(userAgent: string, browser: string): number {
    const regExp = new RegExp(`${browser}\\/([\\d.]+)`);
    const match = userAgent.match(regExp);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  }
}