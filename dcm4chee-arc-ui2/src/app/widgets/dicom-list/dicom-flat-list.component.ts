import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'dicom-list',
  templateUrl: './dicom-flat-list.component.html',
  styleUrls: ['./dicom-flat-list.component.scss']
})
export class DicomFlatListComponent implements OnInit {

    @Input() dicomObject;
    table = [
          {
              title:"Patient's Name",
              code:"00100010",
              description:"Patient's Name",
              widthWeight:1,
              calculatedWidth:"20%"
          },{
              title:"Patient ID",
              code:"00100020",
              description:"Patient ID",
              widthWeight:1,
              calculatedWidth:"20%"
          },{
              title:"Birth Date",
              code:"00100030",
              description:"Patient's Birth Date",
              widthWeight:1,
              calculatedWidth:"20%"
          },{
              title:"Sex",
              code:"00100040",
              description:"Patient's Sex",
              widthWeight:1,
              calculatedWidth:"20%"
          },{
              title:"Issuer of PID",
              code:"00100021",
              description:"Issuer of Patient ID",
              widthWeight:1,
              calculatedWidth:"20%"
          },
          {
              title:"Study ID",
              code:"00200010",
              description:"Study ID",
              widthWeight:1,
              calculatedWidth:"20%"
          },{
              title:"Acc. Nr.",
              code:"00080050",
              description:"Accession Number",
              widthWeight:1,
              calculatedWidth:"20%"
          },
          {
              title:"Modality",
              code:"00080061",
              description:"Modalities in Study",
              widthWeight:0.6,
              calculatedWidth:"20%"
          },
          {
              title:"#S",
              code:"00201206",
              description:"Number of Study Related Series",
              widthWeight:0.2,
              calculatedWidth:"20%"
          },
          {
              title:"#I",
              code:"00201208",
              description:"Number of Study Related Instances",
              widthWeight:0.2,
              calculatedWidth:"20%"
          }
      ];
    constructor() { }

    ngOnInit() {
        this.calculateWidthOfTable();
    }
    calculateWidthOfTable(){
        let summ = 0;
        _.forEach(this.table,(m,i)=>{
            summ += m['widthWeight'];
        });
        _.forEach(this.table,(m,i)=>{
            m['calculatedWidth'] =  ((m['widthWeight'] * 100)/summ)+"%";
        });
    };

}
