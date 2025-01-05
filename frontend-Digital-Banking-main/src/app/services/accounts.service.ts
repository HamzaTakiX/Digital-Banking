import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccountDetails {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOS: AccountOperation[];
}

export interface AccountOperation {
  id: number;
  operationDate: Date;
  amount: number;
  type: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  constructor(private http: HttpClient) { }

  public getAccount(accountId: string, page: number, size: number): Observable<AccountDetails> {
    return this.http.get<AccountDetails>(`${environment.backendHost}/accounts/${accountId}/pageOperations?page=${page}&size=${size}`);
  }

  public debit(accountId: string, amount: number, description: string): Observable<any> {
    let data = { accountId, amount, description };
    return this.http.post(`${environment.backendHost}/accounts/debit`, data);
  }

  public credit(accountId: string, amount: number, description: string): Observable<any> {
    let data = { accountId, amount, description };
    return this.http.post(`${environment.backendHost}/accounts/credit`, data);
  }

  public transfer(accountSource: string, accountDestination: string, amount: number, description: string): Observable<any> {
    let data = { accountSource, accountDestination, amount, description };
    return this.http.post(`${environment.backendHost}/accounts/transfer`, data);
  }

  // Get all accounts
  public getAllAccounts(): Observable<AccountDetails[]> {
    return this.http.get<AccountDetails[]>(`${environment.backendHost}/accounts`);
  }

  // Get all operations
  public getOperations(): Observable<AccountOperation[]> {
    return this.http.get<AccountOperation[]>(`${environment.backendHost}/operations`);
  }
}
