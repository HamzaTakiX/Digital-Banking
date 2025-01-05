export interface Account {
  id: string;
  balance: number;
  createdAt: Date;
  type: string;
  customerId: string;
  status: string;
}

export interface Operation {
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  operationDate: Date;
  accountId: string;
  status: string;
}
