import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSubject = new BehaviorSubject<boolean>(false);
  dataSubject$: Observable<boolean> = this.dataSubject.asObservable();
  private entryAddedSubject= new Subject<void>();
  addedEntry$: Observable<void> = this.entryAddedSubject.asObservable();

  constructor() { }

  updateValue(value: boolean) {
    this.dataSubject.next(value);
  }

  notifyEntryAdded() {
    this.entryAddedSubject.next();
  }
}
