import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { AccountsService, AccountOperation, AccountDetails } from '../services/accounts.service';
import { Customer } from '../model/customer.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Statistics
  totalBalance: number = 0;
  totalAccounts: number = 0;
  totalCustomers: number = 0;
  totalOperations: number = 0;

  // Recent Data
  recentOperations: AccountOperation[] = [];
  recentCustomers: Customer[] = [];

  constructor(
    private customerService: CustomerService,
    private accountsService: AccountsService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load Customers
    this.customerService.getCustomers().subscribe(
      (customers: Customer[]) => {
        this.totalCustomers = customers.length;
        this.recentCustomers = customers.slice(-5).reverse(); // Get last 5 customers
      },
      (err) => console.error('Error loading customers:', err)
    );

    // Load Accounts and Calculate Total Balance
    this.accountsService.getAllAccounts().subscribe(
      (accounts: AccountDetails[]) => {
        this.totalAccounts = accounts.length;
        this.totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      },
      (err) => console.error('Error loading accounts:', err)
    );

    // Load Recent Operations
    this.accountsService.getOperations().subscribe(
      (operations: AccountOperation[]) => {
        this.totalOperations = operations.length;
        this.recentOperations = operations
          .sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())
          .slice(0, 10); // Get last 10 operations
      },
      (err) => console.error('Error loading operations:', err)
    );
  }
}
