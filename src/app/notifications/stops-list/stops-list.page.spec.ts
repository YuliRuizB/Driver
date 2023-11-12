import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StopsListPage } from './stops-list.page';

describe('StopsListPage', () => {
  let component: StopsListPage;
  let fixture: ComponentFixture<StopsListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StopsListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StopsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
