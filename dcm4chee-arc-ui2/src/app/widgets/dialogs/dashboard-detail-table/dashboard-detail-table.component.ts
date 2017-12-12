import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-dashboard-detail-table',
  templateUrl: './dashboard-detail-table.component.html',
  styleUrls: ['./dashboard-detail-table.component.css']
})
export class DashboardDetailTableComponent implements OnInit {
    searchlist = "";
    tableData;
    Object = Object;
    title;
    constructor(
        public dialogRef: MdDialogRef<DashboardDetailTableComponent>,
    ) {}

    ngOnInit() {
    }
    detailView(object){
        object.showDetail = !object.showDetail;
    }
}
