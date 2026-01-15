import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CustomerFormComponent } from './customer-form.component';
import { CustomerDeleteComponent } from './customer-delete.component';
import { OrdersComponent } from './orders.component';
import { SalesComponent } from './sales.component';
import { QrManagerComponent } from './qr-manager.component';
import { CustomerListComponent } from './customer-list.component';
import { FinanceComponent } from './finance.component';
import { InventoryComponent } from './inventory.component';
import { ReceiptComponent } from './receipt.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/delete', component: CustomerDeleteComponent },
  { path: 'customers/orders', component: OrdersComponent },
  { path: 'customers/list', component: CustomerListComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'qr', component: QrManagerComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'receipt', component: ReceiptComponent }
];
