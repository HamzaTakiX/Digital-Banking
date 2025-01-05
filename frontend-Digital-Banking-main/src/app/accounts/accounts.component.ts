import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../services/accounts.service';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountDetails } from '../services/accounts.service';
declare var bootstrap: any;

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accountFormGroup!: FormGroup;
  operationFormGroup!: FormGroup;
  currentPage: number = 0;
  pageSize: number = 5;
  accountObservable!: Observable<AccountDetails>;
  operationType: string = '';
  errorMessage!: string;
  operationModal: any;

  constructor(private fb: FormBuilder, private accountService: AccountsService) { }

  ngOnInit(): void {
    this.accountFormGroup = this.fb.group({
      accountId: ['', Validators.required]
    });

    this.operationFormGroup = this.fb.group({
      accountDestination: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  handleSearchAccount() {
    let accountId = this.accountFormGroup.value.accountId;
    this.accountObservable = this.accountService.getAccount(accountId, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(() => err);
      })
    );
  }

  gotoPage(page: number) {
    if (page >= 0) {
      this.currentPage = page;
      this.handleSearchAccount();
    }
  }

  handleNewOperation(type: string) {
    this.operationType = type;
    this.operationFormGroup.reset();

    // Add or remove destination account validation based on operation type
    if (type === 'TRANSFER') {
      this.operationFormGroup.get('accountDestination')?.setValidators([Validators.required]);
    } else {
      this.operationFormGroup.get('accountDestination')?.clearValidators();
      this.operationFormGroup.get('accountDestination')?.updateValueAndValidity();
    }

    // Show modal
    this.operationModal = new bootstrap.Modal(document.getElementById('operationModal'));
    this.operationModal.show();
  }

  handleOperation() {
    if (this.operationFormGroup.valid) {
      const accountId = this.accountFormGroup.value.accountId;
      const amount = this.operationFormGroup.value.amount;
      const description = this.operationFormGroup.value.description;

      let operationObs: Observable<any>;

      switch (this.operationType) {
        case 'DEBIT':
          operationObs = this.accountService.debit(accountId, amount, description);
          break;
        case 'CREDIT':
          operationObs = this.accountService.credit(accountId, amount, description);
          break;
        case 'TRANSFER':
          const accountDestination = this.operationFormGroup.value.accountDestination;
          operationObs = this.accountService.transfer(accountId, accountDestination, amount, description);
          break;
        default:
          return;
      }

      operationObs.pipe(
        catchError(err => {
          this.errorMessage = err.message;
          return throwError(() => err);
        })
      ).subscribe({
        next: () => {
          this.operationModal.hide();
          this.handleSearchAccount(); // Refresh account details
          // You might want to show a success message here
        },
        error: (err) => {
          console.error('Operation failed:', err);
          // You might want to show an error message here
        }
      });
    }
  }
}
