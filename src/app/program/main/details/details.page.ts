import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramService } from '@shared/services/program.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { endOfToday } from 'date-fns';


@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  programId;
  customerId;
  program: any = [];
  programSubscription: Subscription;
  loading = true;

  constructor(private route: ActivatedRoute, private programService: ProgramService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.programId = params.get('id');
      this.customerId = params.get('customerId');
      this.getSubscriptions();
    });
  }

  ngOnDestroy() {
    if(this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.programSubscription = this.programService.getProgram(this.customerId, this.programId)
      
      .subscribe( program => {
        this.program = program.payload.data();
  
        this.loading = false;
      })
  }

  canStartProgram(program) {
    if(this.program.length > 0) {
      const today = endOfToday();
      return !program.hasEnded && !program.isLive && !program.isWithTrouble && program.startAt.toDate() <= today;
    }
    return false;
  }

}
