import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEmployeeComponent } from './profile-employee.component';

describe('ProfileEmployeeComponent', () => {
  let component: ProfileEmployeeComponent;
  let fixture: ComponentFixture<ProfileEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEmployeeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEmployeeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
