import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProgramService } from '@shared/services/program.service';
import { AuthService } from '@shared/services/auth.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit, OnDestroy {

  loading: boolean = true;
  user: any;
  programSubscription: Subscription;
  program: any = [];
  programActivities: number = 0;

  events: any[] = [];
  groupedElements: any = {};

  constructor(
    private programService: ProgramService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.authService.user_profile.subscribe((data) => {
      this.user = data;

      if (!!this.user) {
        this.getSubscriptions();
      }
    });
  }

  ngOnDestroy() {
    if(this.programSubscription) {
      this.programSubscription.unsubscribe();
    }

  }

  getSubscriptions() {
    this.programSubscription = this.programService.getProgramAfterToday(this.user.uid).pipe(
      map(actions => actions.map(a => {
 
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        const docPath = a.payload.doc.ref.parent.path;
        return { id: id, path: docPath, ...data };
      })))
      .subscribe((program: any) => {
   
        this.program = this.groupByDate(program, 'startAt');
        this.programActivities = program.length;
        this.loading = false;
      });
  }

  showActionSheetWithOptions(program, slide) {

  }

  private groupByDate(input: any, groupByKey: string) {

    input.forEach((obj: any) => {

      const timestamp: Timestamp = obj[groupByKey];
      const date: Date = timestamp.toDate();
      const dateString = this.datePipe.transform(date, 'dd MMMM yyyy');

      if (!(dateString in this.groupedElements)) {
        this.groupedElements[dateString] = [];
      }

      this.groupedElements[dateString].push(obj);
    });

    for (const property in this.groupedElements) {

      if (this.groupedElements.hasOwnProperty(property)) {
        this.events.push({
          key: property,
          items: this.groupedElements[property]
        });
      }
    }

    return this.events;
  }

  formatDistanceDate(date: any) {
    const formattedDate = date.toDate();
    return formatDistanceToNow(formattedDate, { addSuffix: true, locale: es })
  }

}
