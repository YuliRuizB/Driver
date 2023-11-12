import { Component, OnInit } from '@angular/core';
import { PaymentMethodsService } from 'src/app/services/firebase/payment-methods.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.page.html',
  styleUrls: ['./stores.page.scss'],
})
export class StoresPage implements OnInit {
  participantStores: any = [];

  constructor( public paymentMethodsService: PaymentMethodsService) { }

  ngOnInit() {
    this.paymentMethodsService.getStores().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (stores) => {
      this.participantStores = stores;
    })
  }

}
