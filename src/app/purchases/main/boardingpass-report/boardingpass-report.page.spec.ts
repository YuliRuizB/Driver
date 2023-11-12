import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BoardingpassReportPage } from './boardingpass-report.page';

describe('BoardingpassReportPage', () => {
  let component: BoardingpassReportPage;
  let fixture: ComponentFixture<BoardingpassReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardingpassReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardingpassReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
