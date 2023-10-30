import { PATH } from 'src/app/constants/path.constant';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stream-list',
  templateUrl: './stream-list.component.html',
  styleUrls: ['./stream-list.component.css']
})
export class StreamListComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  joinStream(userId: string): void {
    this.router.navigate([PATH.BROADCAST], { queryParams: { userId } });
  }
}
