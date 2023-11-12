import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HowToPayPage } from './how-to-pay.page';

describe('HowToPayPage', () => {
  let component: HowToPayPage;
  let fixture: ComponentFixture<HowToPayPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HowToPayPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HowToPayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
