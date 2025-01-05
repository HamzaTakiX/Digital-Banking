import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CustomerService } from "../services/customer.service";
import { catchError, map, Observable, throwError } from "rxjs";
import { Customer } from "../model/customer.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers!: Observable<Array<Customer>>;
  errorMessage!: string;
  searchFormGroup: FormGroup | undefined;
  editCustomerForm: FormGroup;
  selectedCustomer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editCustomerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control("")
    });
    this.handleSearchCustomers();
  }

  handleSearchCustomers() {
    let kw = this.searchFormGroup?.value.keyword;
    this.customers = this.customerService.searchCustomers(kw).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err);
      })
    );
  }

  handleEditCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.editCustomerForm.patchValue({
      name: customer.name,
      email: customer.email
    });
    
    Swal.fire({
      title: 'Edit Customer',
      html: `
        <form id="editCustomerForm" class="swal2-form">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" id="name" class="swal2-input" placeholder="Customer name" value="${customer.name}">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" id="email" class="swal2-input" placeholder="Customer email" value="${customer.email}">
          </div>
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      customClass: {
        container: 'edit-customer-modal'
      },
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        
        if (!name || !email) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        if (!this.validateEmail(email)) {
          Swal.showValidationMessage('Please enter a valid email address');
          return false;
        }
        
        return { name, email };
      }
    }).then((result) => {
      if (result.isConfirmed && this.selectedCustomer) {
        const updatedCustomer = {
          ...this.selectedCustomer,
          name: result.value.name,
          email: result.value.email
        };
        
        this.customerService.updateCustomer(updatedCustomer).subscribe({
          next: () => {
            // Refresh the customers list
            this.handleSearchCustomers();
            
            Swal.fire({
              title: 'Success!',
              text: 'Customer information updated successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update customer information',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error(err);
          }
        });
      }
    });
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  handleDeleteCustomer(customer: Customer) {
    Swal.fire({
      title: 'Delete Customer',
      text: `Are you sure you want to delete ${customer.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.customers = this.customers.pipe(
              map(data => {
                return data.filter(c => c.id !== customer.id);
              })
            );
            Swal.fire({
              title: 'Deleted!',
              text: `${customer.name} has been deleted successfully.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: err => {
            Swal.fire({
              title: 'Error!',
              text: 'Could not delete the customer. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            console.error(err);
          }
        });
      }
    });
  }

  handleCustomerAccounts(customer: Customer) {
    this.router.navigateByUrl("/customer-accounts/" + customer.id, { state: customer });
  }
}
