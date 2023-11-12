import { Component, OnInit } from '@angular/core';
import { PurchasesService } from 'src/app/services/firebase/purchases.service';
import { map } from 'rxjs/operators';
import { ProductsService } from 'src/app/services/firebase/products.service';
import * as _ from 'lodash';
import { StorageService } from 'src/app/services/storage/storage.service';
@Component({
  selector: 'app-historic',
  templateUrl: './historic.page.html',
  styleUrls: ['./historic.page.scss'],
})
export class HistoricPage implements OnInit {

  purchases: any = [];
  activeProducts: any = [];
  purchaseRequests: any = [];
  loading = true;
  boardingPassSelected = false;
  isBoardingPassValid = false;
  selectedBoardingPass: any = {};
  selectedBoardingPassValidFrom;
  selectedBoardingPassValidTo;
  showQRCode = false;

  sliderConfig = {
    slidesPerView: 1.3,
    spaceBetween: 2,
    centeredSlides: true
  };
  user: any;

  title = 'app';
  elementType = 'url';
  value = 'Techiedasdcasdcasdcasiaries';

  constructor(private purchasesService: PurchasesService, private storageService: StorageService, private productsService: ProductsService) { }

  ngOnInit() {
    this.storageService.getItem('userData').then((userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
      this.getActiveProducts();
    })
  }

  getActiveProducts() {
    let today = new Date();
    this.productsService.getActiveProducts(this.user).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((activeProducts: any) => {
      this.activeProducts = activeProducts;
    });

    this.purchasesService.getCustomerPurchases(this.user.uid).pipe(
      map(actions => actions.map(({ payload: { doc } }) => {
        const data = doc.data() as any;
        const id = doc.id;
        return { id, ...data };
      }))
    ).subscribe((purchases: any) => {
      console.log(purchases);
      this.purchases = purchases;
      this.loading = false;
    })

  }

  getSubscriptions() {
    this.loading = true;
    this.purchasesService.getCustomerActiveChargeRequests(this.user.uid).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((purchaseRequests: any) => {
      console.log(purchaseRequests);
      this.purchaseRequests = _.filter(purchaseRequests, (p) => {
        return new Date(p.due_date) >= new Date();
      })
      this.loading = false;
    })

  }

  showDetails(boardingPassCard) {
    console.log('showDetails', boardingPassCard);
    this.boardingPassSelected = true;
    this.selectedBoardingPass = boardingPassCard;
    this.selectedBoardingPassValidFrom = new Date(this.selectedBoardingPass.validFrom.seconds * 1000);
    this.selectedBoardingPassValidTo = new Date(this.selectedBoardingPass.validTo.seconds * 1000);
    this.isBoardingPassValid = this.showQRCode = new Date() >= this.selectedBoardingPassValidFrom && new Date() <= this.selectedBoardingPassValidTo;
    console.log(this.isBoardingPassValid);
  }

}
