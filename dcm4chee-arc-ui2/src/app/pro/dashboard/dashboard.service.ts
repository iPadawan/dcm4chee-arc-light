import { Injectable } from '@angular/core';

@Injectable()
export class DashboardService {

    constructor() { }

    prepareGraphData(elasticData){
        let preparedData = [];
        let group = {};
        elasticData.aggregations[2].buckets.forEach((m,i) => {
            m[3].buckets.forEach(buckets=>{
              if(buckets[1].value || buckets[1].value === 0){
                  group[buckets.key] = group[buckets.key] || [];
                  group[buckets.key].push({
                      value:buckets[1].value,
                      name:new Date(m.key)
                  });
              }
            });
        });
        for(let groupLabel in group){
            preparedData.push({
                name:groupLabel,
                series:group[groupLabel]
            })
        }
        return preparedData;
    }
}
