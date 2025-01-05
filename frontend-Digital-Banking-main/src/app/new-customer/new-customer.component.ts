import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css']
})
export class NewCustomerComponent implements OnInit {
  newCustomerFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.newCustomerFormGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.newCustomerFormGroup.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string | null {
    const field = this.newCustomerFormGroup.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) {
      return null;
    }

    if (fieldName === 'name') {
      if (field.errors['required']) {
        return 'Name is required';
      }
      if (field.errors['minlength']) {
        return 'Name must be at least 3 characters long';
      }
    }

    if (fieldName === 'email') {
      if (field.errors['required']) {
        return 'Email is required';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }

    return null;
  }

  handleSaveCustomer() {
    if (this.newCustomerFormGroup.valid) {
      const customer = this.newCustomerFormGroup.value;
      this.customerService.saveCustomer(customer).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Customer added successfully',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigateByUrl("/customers");
          });
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add customer. Please try again.',
          });
          console.error(err);
        }
      });
    }
  }
}
