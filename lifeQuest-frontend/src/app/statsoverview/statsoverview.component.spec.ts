import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsoverviewComponent } from './statsoverview.component';

describe('StatsoverviewComponent', () => {
  let component: StatsoverviewComponent;
  let fixture: ComponentFixture<StatsoverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsoverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
