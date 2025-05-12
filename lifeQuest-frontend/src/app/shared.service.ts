import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSubject = new BehaviorSubject<boolean>(false);
  dataSubject$: Observable<boolean> = this.dataSubject.asObservable();

  constructor() { }

  updateValue(value: boolean) {
    this.dataSubject.next(value);
  }
}
