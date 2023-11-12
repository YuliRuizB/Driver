import { Component, OnInit } from '@angular/core';
import { ShareService } from 'src/app/services/share/share.service';
import { map } from 'rxjs/operators';
import { IUserData } from 'src/app/models/models';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-toggle-share',
  templateUrl: './toggle-share.page.html',
  styleUrls: ['./toggle-share.page.scss'],
})
export class ToggleSharePage implements OnInit {

  user: IUserData;
  parents = [];
  loading = true;

  constructor(private shareService: ShareService, private storageService: StorageService) {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
   }

  ngOnInit() {
    
  }

  getSubscriptions(){
    this.shareService.getParents(this.user.uid).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (parents) => {
      this.parents = parents;
      this.loading = false;
    });
  }

  toggleNotification(parent: any) {
    const data = parent;
    this.shareService.toggleParent(this.user.uid, data.id, data.canGetNotifications);
  }

}
