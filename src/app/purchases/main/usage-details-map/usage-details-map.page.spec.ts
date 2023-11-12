import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UsageDetailsMapPage } from './usage-details-map.page';

describe('UsageDetailsMapPage', () => {
  let component: UsageDetailsMapPage;
  let fixture: ComponentFixture<UsageDetailsMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageDetailsMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UsageDetailsMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
