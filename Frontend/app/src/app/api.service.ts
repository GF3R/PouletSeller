import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Customer, CustomerRequest, DiscountConfig, FinanceEntry, FinanceRequest, InventoryData, SaleRequest, SaleResponse } from './models';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  getCustomers(query?: string) {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }
    return this.http.get<Customer[]>(`${this.api}/customers`, { params });
  }

  getCustomer(id: string) {
    return this.http.get<Customer>(`${this.api}/customers/${id}`);
  }

  createCustomer(request: CustomerRequest) {
    return this.http.post<Customer>(`${this.api}/customers`, request);
  }

  updateCustomer(id: string, request: CustomerRequest) {
    return this.http.put<Customer>(`${this.api}/customers/${id}`, request);
  }

  updateOrders(id: string, request: Partial<CustomerRequest>) {
    return this.http.put<Customer>(`${this.api}/customers/${id}/orders`, {
      pouletSpezial: request.pouletSpezial ?? 0,
      pouletSpezialStueck: request.pouletSpezialStueck ?? 0,
      poulet3kg: request.poulet3kg ?? 0,
      truten5kg: request.truten5kg ?? 0,
      truten10kg: request.truten10kg ?? 0
    });
  }

  deleteCustomer(id: string) {
    return this.http.delete(`${this.api}/customers/${id}`);
  }

  getInventory() {
    return this.http.get<InventoryData>(`${this.api}/inventory`);
  }

  saveInventory(data: InventoryData) {
    return this.http.put<InventoryData>(`${this.api}/inventory`, data);
  }

  getDiscount() {
    return this.http.get<DiscountConfig>(`${this.api}/discount`);
  }

  saveDiscount(config: DiscountConfig) {
    return this.http.put<DiscountConfig>(`${this.api}/discount`, config);
  }

  submitSale(request: SaleRequest) {
    return this.http.post<SaleResponse>(`${this.api}/sales`, request);
  }

  getIncomes(from?: string, to?: string) {
    return this.http.get<FinanceEntry[]>(`${this.api}/finance/incomes`, { params: this.toDateParams(from, to) });
  }

  getExpenses(from?: string, to?: string) {
    return this.http.get<FinanceEntry[]>(`${this.api}/finance/expenses`, { params: this.toDateParams(from, to) });
  }

  addIncome(request: FinanceRequest) {
    return this.http.post<FinanceEntry>(`${this.api}/finance/incomes`, request);
  }

  addExpense(request: FinanceRequest) {
    return this.http.post<FinanceEntry>(`${this.api}/finance/expenses`, request);
  }

  getFinanceOverview() {
    return this.http.get<{ incomes: number; expenses: number; balance: number }>(`${this.api}/finance/overview`);
  }

  downloadCsv(type: 'income' | 'expense', from?: string, to?: string): Observable<string> {
    let params = this.toDateParams(from, to);
    params = params.set('type', type);
    return this.http.get(`${this.api}/finance/csv`, { responseType: 'text', params });
  }

  downloadCombinedCsv(from?: string, to?: string): Observable<string> {
    return this.http.get(`${this.api}/finance/csv/combined`, {
      responseType: 'text',
      params: this.toDateParams(from, to)
    });
  }

  listUploads() {
    return this.http.get<{ name: string; path: string }[]>(`${this.api}/uploads`);
  }

  upload(kind: 'twint' | 'google' | 'logo', file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ path: string }>(`${this.api}/uploads/${kind}`, form);
  }

  private toDateParams(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return params;
  }
}
