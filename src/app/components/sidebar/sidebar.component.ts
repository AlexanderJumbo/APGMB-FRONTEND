import { Component, Input } from '@angular/core';
import { isSidebarOpen, closeSidebar } from '../../shared/ui-state/ui-state';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  UserPlus,
  Users,
  BarChart3,
  History,
  FileText,
  HardDrive,
  CreditCard,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isSidebarOpen = isSidebarOpen;
  closeSidebar = closeSidebar;

  readonly iconUserPlus = UserPlus;
  readonly iconUsers = Users;
  readonly iconBarChart = BarChart3;
  readonly iconHistory = History;
  readonly iconReport = FileText;
  readonly iconHardDrive = HardDrive;
  readonly iconCreditCard = CreditCard;
  menuItems = [
    {
      name: 'Gestionar Usuario',
      icon: this.iconUserPlus,
      route: '/gestionar-usuario',
    },
    //{
    //  name: 'Gestionar clientes',
    //  icon: this.iconUsers,
    //  route: '/gestionar-clientes',
    // },
    // {
    //  name: 'Gestionar Medidor',
    //  icon: this.iconHardDrive,
    //  route: '/gestionar-medidor',
    //},
    {
      name: 'Gestionar Cuentas',
      icon: this.iconCreditCard,
      route: '/gestionar-cuentas',
    },
    {
      name: 'Lecturas',
      icon: this.iconReport,
      route: '/reporte-lectura',
    },

    {
      name: 'Histórico',
      icon: this.iconHistory,
      route: '/historico',
    },
  ];
}
