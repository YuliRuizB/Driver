import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StationInfoPage } from './station-info.page';

describe('StationInfoPage', () => {
  let component: StationInfoPage;
  let fixture: ComponentFixture<StationInfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StationInfoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StationInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
