import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LogOut, Menu } from 'lucide';
import { isSidebarOpen, toggleSidebar } from '../../shared/ui-state/ui-state';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  navHasShadow = false;

  readonly LogOut = LogOut;
  readonly Menu = Menu;

  isSidebarOpen = isSidebarOpen;
  toggleSidebar = toggleSidebar;

  private router = inject(Router);

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.navHasShadow = window.scrollY > 10;
  }

  logout() {
    // Limpia localStorage o cualquier sesión
    localStorage.clear();
    // Redirige a login
    this.router.navigate(['/login']);
  }
}
