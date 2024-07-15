import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuditLogService } from '@shared/services/audit-log.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit, OnDestroy {

  auditLogSubscription: Subscription;
  auditLogId: any;
  auditLog: any = {};
  loading = true;

  constructor(private route: ActivatedRoute, private auditLogService: AuditLogService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.auditLogId = params.get('id'); 
      this.getSubscriptions();
    });
  }

  ngOnDestroy() {
    if(this.auditLogSubscription) {
      this.auditLogSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.auditLogSubscription = this.auditLogService.getAuditLogRecord(this.auditLogId)
    .subscribe((response) => {
      this.auditLog = response.payload.data();
      this.auditLog.id = response.payload.id;

      this.loading = false;
    })
  }

}
