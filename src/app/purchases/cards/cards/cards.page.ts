import { Component, OnInit } from '@angular/core';
import { ContactusService } from 'src/app/services/firebase/contactus.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  terms: any;

  constructor(
    private contactUsService: ContactusService 
  ) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  getSubscriptions() {
    this.contactUsService.getAboutUsInfo().pipe(
      map(action => {
        const data = action.payload.data();
        const id = action.payload.id;
        return { id, ...data };
    })
    ).subscribe( (info: any) => {
      this.terms = info.terms
    })
  }

}
