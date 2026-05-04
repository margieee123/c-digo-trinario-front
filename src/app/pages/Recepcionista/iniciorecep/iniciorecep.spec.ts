import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iniciorecep } from './iniciorecep';

describe('Iniciorecep', () => {
  let component: Iniciorecep;
  let fixture: ComponentFixture<Iniciorecep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iniciorecep],
    }).compileComponents();

    fixture = TestBed.createComponent(Iniciorecep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
