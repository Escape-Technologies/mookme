import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor() {}

  profileMenuItems: MenuItem[] = [];

  ngOnInit() {
    this.profileMenuItems = [{ label: 'Log out', icon: 'pi pi-lock' }];
  }
}
