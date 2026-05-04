import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IniciospeciComponent } from './inicioespeci';

describe('IniciospeciComponent', () => {
  let component: IniciospeciComponent;
  let fixture: ComponentFixture<IniciospeciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciospeciComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IniciospeciComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
