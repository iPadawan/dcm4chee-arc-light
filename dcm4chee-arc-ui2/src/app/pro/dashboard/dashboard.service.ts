import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class DashboardService {

    constructor() { }

    prepareGraphData(elasticData){
        let preparedData = [];
        let group = {};
        try{
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
        }catch (e){
            console.error(e);
        }
        return preparedData;
    }
    updateGraph(oldData, newData){
        let group = {};
        newData.aggregations[2].buckets.forEach((m,i) => {
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
        for(let name in group){
            let foundGroup = oldData.find(g =>{return g.name === name});
            if(!foundGroup){
                oldData.push({
                    name:name,
                    series:group[name]
                });
            }else{
                for(let newGroupSerie in group[name]){
                    if(!this.seriesContainsObject(foundGroup.series,group[name][newGroupSerie])){
                        oldData.push({
                            name:name,
                            series:group[name]
                        });
                    }
                }
            }
        }
    }
    seriesContainsObject(series, object){
        let found = series.find(s => {
            return _.isEqual(s,object);
        });
        return found ? true : false;
    }
}
