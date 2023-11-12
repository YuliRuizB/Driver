import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  private selectedItem: any;
  private icons = [
    'flask',
    'wifi',
    'beer',
    'football',
    'basketball',
    'paper-plane',
    'american-football',
    'boat',
    'bluetooth',
    'build'
  ];

  public cards: any;
  public items: Array<{ title: string; note: string; icon: string }> = [];

  sliderConfig = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    centeredSlides: true
  };

  constructor() {

    this.cards = [
      {
        state: 'ON',
        logo: "assets/img/visa.png",
        a: 1234,
        b: 5522,
        c: 8432,
        d: 2264,
        expires: '7/12',
        bank: 'Bank of America'
      },
      {
        state: 'OFF',
        logo: "assets/img/american.png",
        a: 1234,
        b: 5321,
        c: 8283,
        d: 9271,
        expires: '8/19',
        bank: 'JPMorgan'
      },
      {
        state: 'ON',
        logo: "assets/img/mastercard.png",
        a: 8685,
        b: 2445,
        c: 9143,
        d: 7846,
        expires: '11/23',
        bank: 'CityBank'
      }
    ];

    for (let i = 1; i < 11; i++) {
      this.items.push({
        title: 'Item ' + i,
        note: 'This is item #' + i,
        icon: this.icons[Math.floor(Math.random() * this.icons.length)]
      });
    }

  }

  ngOnInit() {
  }
  // add back when alpha.4 is out
  // navigate(item) {
  //   this.router.navigate(['/list', JSON.stringify(item)]);
  // }
}
