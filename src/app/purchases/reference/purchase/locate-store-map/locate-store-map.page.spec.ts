import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LocateStoreMapPage } from './locate-store-map.page';

describe('LocateStoreMapPage', () => {
  let component: LocateStoreMapPage;
  let fixture: ComponentFixture<LocateStoreMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocateStoreMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocateStoreMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
