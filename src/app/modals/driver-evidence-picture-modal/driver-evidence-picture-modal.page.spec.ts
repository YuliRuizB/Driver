import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DriverEvidencePictureModalPage } from './driver-evidence-picture-modal.page';

describe('DriverEvidencePictureModalPage', () => {
  let component: DriverEvidencePictureModalPage;
  let fixture: ComponentFixture<DriverEvidencePictureModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverEvidencePictureModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DriverEvidencePictureModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
