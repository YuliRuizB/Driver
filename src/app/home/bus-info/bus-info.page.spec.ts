import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BusInfoPage } from './bus-info.page';

describe('BusInfoPage', () => {
  let component: BusInfoPage;
  let fixture: ComponentFixture<BusInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
