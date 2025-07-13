import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import {
  closeSidebar,
  isSidebarOpen,
  toggleSidebar,
} from '../shared/ui-state/ui-state';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './MainLayout.component.html',
})
export default class MainLayoutComponent {
  isSidebarOpen = isSidebarOpen;
}
