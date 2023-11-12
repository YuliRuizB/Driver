import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ToggleSharePage } from './toggle-share.page';

describe('ToggleSharePage', () => {
  let component: ToggleSharePage;
  let fixture: ComponentFixture<ToggleSharePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleSharePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleSharePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
