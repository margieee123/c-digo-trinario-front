import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iniciocliente } from './iniciocliente';

describe('Iniciocliente', () => {
  let component: Iniciocliente;
  let fixture: ComponentFixture<Iniciocliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iniciocliente],
    }).compileComponents();

    fixture = TestBed.createComponent(Iniciocliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
