import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UsageDetailsPage } from './usage-details.page';

describe('UsageDetailsPage', () => {
  let component: UsageDetailsPage;
  let fixture: ComponentFixture<UsageDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageDetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UsageDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
