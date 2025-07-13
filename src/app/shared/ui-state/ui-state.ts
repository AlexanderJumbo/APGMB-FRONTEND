import { signal } from '@angular/core';

export const isSidebarOpen = signal(true);

export function toggleSidebar() {
  isSidebarOpen.set(!isSidebarOpen());
}

export function openSidebar() {
  isSidebarOpen.set(true);
}

export function closeSidebar() {
  isSidebarOpen.set(false);
}
