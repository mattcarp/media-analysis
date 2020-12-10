import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  constructor(
    private router: Router,
  ) {}

  goToPage(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  isActiveItem(page: string): boolean {
    return this.router.url.includes(`/${page}`);
  }
}
