import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StopPointsPage } from './stop-points.page';

describe('StopPointsPage', () => {
  let component: StopPointsPage;
  let fixture: ComponentFixture<StopPointsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StopPointsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StopPointsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
