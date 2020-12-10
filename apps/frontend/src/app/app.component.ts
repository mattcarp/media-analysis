import { Component, HostBinding, OnInit } from '@angular/core';

import { version } from '../../../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  @HostBinding('style.background') bgColor: string;
  verUI = version;

  ngOnInit(): void {
    this.consoleInfo();
    this.generateBackground();
  }

  consoleInfo(): void {
    const style1 = [
      'padding: 0.4rem 0.8rem;',
      'background: linear-gradient(#4560ad, #1139ad);',
      'font: 0.8rem/1 -apple-system, Roboto, Helvetica, Arial;',
      'color: #fff;',
    ].join('');
    const style2 = ['color: red;'].join('');

    console.log(
      `%c ► Media Analysis %c ${
        document.location.hostname === 'localhost' ||
        document.location.hostname === '127.0.0.1'
          ? 'localhost'
          : ''
      } %c client UI v.${this.verUI}`,
      style1,
      style2,
      '',
    );
  }

  generateBackground() {
    const hexValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e'];
    const populate = (a) => {
      for (let i = 0; i < 6; i++) {
        const x = Math.round(Math.random() * 14);
        const y = hexValues[x];
        a += y;
      }
      return a;
    }
    const color = populate('#');

    this.bgColor = `radial-gradient(circle at 46% top, ${color} -150%, #191919 75%)`;
  }
}
