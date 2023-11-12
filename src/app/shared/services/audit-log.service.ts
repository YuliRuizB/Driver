import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  constructor(
    private afs: AngularFirestore
  ) { }

  getAuditLog_New(programId: string) { //Soon to be implemented
    const auditLog = this.afs.collection('auditLog').doc(programId).collection('logs');
    return auditLog.snapshotChanges();
  }

  getAuditLog(programId: string) {
    const currentProgramAuditLog = this.afs.collection('activityLog', ref => ref.where('programId','==',programId).orderBy('created','desc'));
    return currentProgramAuditLog.snapshotChanges();
  }

  getAuditLogRecord(activityLogId: string) {
    const auditLogRecord = this.afs.collection('activityLog').doc(activityLogId);
    return auditLogRecord.snapshotChanges();
  }
}
