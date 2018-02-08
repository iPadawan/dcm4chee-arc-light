import {Component, OnInit, ViewEncapsulation, ViewContainerRef} from '@angular/core';
import {DiffProService} from "./diff-pro.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {AppService} from "../../app.service";
import {Globalvar} from "../../constants/globalvar";
import {DatePipe} from "@angular/common";
import * as _ from 'lodash';
import {DiffDetailViewComponent} from "../../widgets/dialogs/diff-detail-view/diff-detail-view.component";
import {MdDialogConfig, MdDialog, MdDialogRef} from "@angular/material";
import {DicomOperationsComponent} from "../../widgets/dialogs/dicom-operations/dicom-operations.component";
import {j4care} from "../../helpers/j4care.service";
import {WindowRefService} from "../../helpers/window-ref.service";
import {ConfirmComponent} from "../../widgets/dialogs/confirm/confirm.component";
import {Observable} from "rxjs/Observable";
import {DiffDetailViewService} from "../../widgets/dialogs/diff-detail-view/diff-detail-view.service";

@Component({
    selector: 'app-diff-pro',
    templateUrl: './diff-pro.component.html'
})
export class DiffProComponent implements OnInit {
    filters = {
        ExporterID: undefined,
        offset: undefined,
        limit: 3000,
        StudyUID: undefined,
        updatedBefore: undefined,
        dicomDeviceName: undefined,
        AccessionNumber:undefined,
        PatientName:undefined,
        fuzzymatching:undefined,
        PatientID:undefined,
        IssuerOfPatientID:undefined,
        StudyDescription:undefined,
        StudyInstanceUID:undefined,
        LocalNamespaceEntityID:undefined,
        'ScheduledProcedureStepSequence.ScheduledStationAETitle':undefined,
        ReferringPhysicianName:undefined,
        ModalitiesInStudy:undefined,
        StudyDate:undefined,
        StudyTime:undefined,
        SeriesDescription:undefined,
        StudyID:undefined,
        BodyPartExamined:undefined,
        SOPClassesInStudy:undefined,
        SendingApplicationEntityTitleOfSeries:undefined,
        InstitutionalDepartmentName:undefined,
        StationName:undefined,
        InstitutionName:undefined,
    };
    cancel = false;
    _ = _;
    aes;
    aets;
    aet1;
    aet2;
    homeAet;
    advancedConfig = false;
    diff;
    count;
    send = 0;
    groupResults = {};
    disabled = {
        IssuerOfPatientID:false,
        LocalNamespaceEntityID:false
    };
    diffAttributes;
    modalities;
    showModalitySelector;
    StudyReceiveDateTime = {
        from: undefined,
        to: undefined
    };
    StudyDateTime = {
        from: undefined,
        to: undefined
    };
    studyInstanceUIDsFromFile = [];
    fileStudyCount;
    missingStudies = [];
    checkStep = 3;
    processStarted = false;
    showSendProgress = false;
    checked = 0;
    groups;
    groupObject;
    Object = Object;
    toggle = '';
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
    copyScp1;
    cMoveScp1;
    copyScp2;
    cMoveScp2;
    moreGroupElements = {};
    moreFunctionsButtons = false;
    dialogRef: MdDialogRef<any>;
    rjnotes;
    constructor(
        private service:DiffProService,
        private cfpLoadingBar: SlimLoadingBarService,
        private mainservice:AppService,
        public viewContainerRef: ViewContainerRef ,
        public dialog: MdDialog,
        public config: MdDialogConfig,
        public diffDetailViewService:DiffDetailViewService
    ) { }
    ngOnInit(){
        this.initCheck(10);
    }
    initCheck(retries){
        let $this = this;
        if(_.hasIn(this.mainservice,"global.authentication")){
            this.init();
        }else{
            if (retries){
                setTimeout(()=>{
                    $this.initCheck(retries-1);
                },20);
            }else{
                this.init();
            }
        }
    }
    init() {
        this.getAes(2);
        this.getAets(2);
        this.getDiffAttributeSet(2);
        this.modalities = Globalvar.MODALITIES;
        this.calculateWidthOfTable();
        this.initRjNotes(2);
        this.groups = new Map();
        this.groups.set("patient",{
            label:"Patient data",
            count:43
        });
        this.groups.set("nopatient",{
            label:"Dicom data",
            count:35
        });
        this.groups.set("auftrag",{
            label:"Assignment data",
            count:251
        });
        this.groupObject = {
            "patient":{
                label:"Patient data",
                count:43
            },
            "nopatient":{
                label:"Dicom data",
                count:35
            },
            "auftrag":{
                label:"Assignment data",
                count:25
            }
        };
        $(".diff .float_content").on("scroll",".bluecontent",function () {
            console.log("scroll this",this);
        });

    };
    toggleBar(mode){
        if(this.groupResults[mode] && this.groupResults[mode].length > 0){
            if(this.toggle === mode){
                this.toggle = '';
                this.setLoadMore();
            }else{
                this.toggle = mode;
                this.setScrollEvent(mode,2);
            }
        }
    }
    setScrollEvent(id,retry){
        let $this = this;
        let selector = '.bluecontent.'+ id;
        setTimeout(()=>{
            if($(selector).length > 0){
                $(selector).scroll(function () {
                    $this.scrolling(id);
                });
            }else{
                if(retry){
                    console.log("in retry");
                    this.setScrollEvent(id,retry-1);
                }
            }
        },1000);
    }
    selectModality(key){
        this.filters.ModalitiesInStudy = key;
        this.filters['ScheduledProcedureStepSequence.Modality'] = key;
        $('.Modality').show();
        this.showModalitySelector = false;
    };

    setDicomOperationsFromPrimaryAndSecondaryAE(){
        this.copyScp1 = this.aet1 || this.homeAet;
        this.cMoveScp1 =  this.aet1 || this.homeAet;
        this.copyScp2 = this.aet2;
        this.cMoveScp2 =  this.aet2;
    }
    aetChanged(mode){
        console.log("in changed");
        this.setDicomOperationsFromPrimaryAndSecondaryAE();
    }
    setDicomOperations(){
        let $this = this;
        this.config.viewContainerRef = this.viewContainerRef;
        this.dialogRef = this.dialog.open(DicomOperationsComponent, {
            height: 'auto',
            width: '60%'
        });
        this.copyScp1 = this.copyScp1 || this.aet1;
        this.cMoveScp1 = this.cMoveScp1 ||  this.aet1;
        this.copyScp2 = this.copyScp2 || this.aet2;
        this.cMoveScp2 = this.cMoveScp2 ||  this.aet2;
        this.dialogRef.componentInstance.aes = this.aes;
        this.dialogRef.componentInstance.aet1 = this.aet1;
        this.dialogRef.componentInstance.aet2 = this.aet2;
        this.dialogRef.componentInstance.copyScp1 = this.copyScp1;
        this.dialogRef.componentInstance.cMoveScp1 = this.cMoveScp1;
        this.dialogRef.componentInstance.copyScp2 = this.copyScp2;
        this.dialogRef.componentInstance.cMoveScp2 = this.cMoveScp2;
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result){
                $this.copyScp1 = (result.copyScp1)?result.copyScp1:$this.copyScp1;
                $this.cMoveScp1 = (result.cMoveScp1)?result.cMoveScp1:$this.cMoveScp1;
                $this.copyScp2 = (result.copyScp2)?result.copyScp2:$this.copyScp2;
                $this.cMoveScp2 = (result.cMoveScp2)?result.cMoveScp2:$this.cMoveScp2;
            }
        });
    }
    fireActionForAllElements(action,studies,i,attributes){
        console.log("action",action);
/*        let msg;
        switch (action){
            case "synchronize":
                msg = "Are you sure you want to synchronize all entries in this group?";
                break;
            case "reject":
                msg = "Are you sure you want to reject all studies in this group?";
                break;
            case "export":
                msg = "Are you sure you want to export all studies in this group?";
                break;
        }*/
/*        this.confirm({
            content: msg
        }).subscribe(ok => {
            if (ok) {*/
                this.openDetailView(studies,i,attributes,action);
/*            }
        });*/
    }
    openDetailView(studies,i,attributes,allAction?){

        let groupName = attributes.id;
        let $this = this;
        this.config.viewContainerRef = this.viewContainerRef;
        let width = "90%";
        if(groupName === "missing"){
            width = "60%"
        }
        this.dialogRef = this.dialog.open(DiffDetailViewComponent, {
            height: 'auto',
            width: width
        });
        this.copyScp1 = this.copyScp1 || this.aet1;
        this.cMoveScp1 = this.cMoveScp1 ||  this.aet1;
        this.copyScp2 = this.copyScp2 || this.aet2;
        this.cMoveScp2 = this.cMoveScp2 ||  this.aet2;
        this.dialogRef.componentInstance.aet1 = this.aet1;
        this.dialogRef.componentInstance.aet2 = this.aet2;
        this.dialogRef.componentInstance.aes = this.aes;
        this.dialogRef.componentInstance.homeAet = this.homeAet;
        this.dialogRef.componentInstance.copyScp1 = this.copyScp1;
        this.dialogRef.componentInstance.cMoveScp1 = this.cMoveScp1;
        this.dialogRef.componentInstance.copyScp2 = this.copyScp2;
        this.dialogRef.componentInstance.cMoveScp2 = this.cMoveScp2;
        this.dialogRef.componentInstance.studies = studies;
        this.dialogRef.componentInstance.groupName = groupName;
        this.dialogRef.componentInstance.groupTitle = attributes.title;
        this.dialogRef.componentInstance.index = i;
        this.dialogRef.componentInstance.allAction = allAction;
        this.dialogRef.componentInstance.rjnotes = this.rjnotes;
        this.dialogRef.componentInstance.patientMode = attributes.patientMode;
        this.dialogRef.componentInstance.actions = _.hasIn(attributes,"actions") ? attributes.actions : [];
        this.dialogRef.afterClosed().subscribe((result) => {
            if (result){
                if(result === "last"){
                    // $this.search();
                    $this.toggle = "";
                }
            }
        });
    };

    calculateWidthOfTable(){
        let summ = 0;
        _.forEach(this.table,(m,i)=>{
            summ += m.widthWeight;
        });
        _.forEach(this.table,(m,i)=>{
            m.calculatedWidth =  ((m.widthWeight * 100)/summ)+"%";
        });
    };

    clearForm(){
        _.forEach(this.filters, (m, i) => {
            if(i != "limit"){
                this.filters[i] = '';
            }
        });
        this.StudyReceiveDateTime = {
            from: undefined,
            to: undefined
        };
        this.StudyDateTime = {
            from: undefined,
            to: undefined
        };
    };

    studyReceiveDateTimeChanged(e, mode){
        this.filters['StudyReceiveDateTime'] = this.filters['StudyReceiveDateTime'] || {};
        this['StudyReceiveDateTime'][mode] = e;
        if (this.StudyReceiveDateTime.from && this.StudyReceiveDateTime.to){
            let datePipeEn = new DatePipe('us-US');
            this.filters['StudyReceiveDateTime'] = datePipeEn.transform(this.StudyReceiveDateTime.from, 'yyyyMMddHHmmss') + '-' + datePipeEn.transform(this.StudyReceiveDateTime.to, 'yyyyMMddHHmmss');
        }
    };

    studyDateTimeChanged(e, mode){
/*        this.filters['StudyDate'] = this.filters['StudyDate'] || {};
        this['StudyDateTime'][mode] = e;
        if (this.StudyDateTime.from && this.StudyDateTime.to){
            let datePipeEn = new DatePipe('us-US');
            let fromDate = datePipeEn.transform(this.StudyDateTime.from, 'yyyyMMdd');
            let toDate = datePipeEn.transform(this.StudyDateTime.to, 'yyyyMMdd');
            let fromTime = datePipeEn.transform(this.StudyDateTime.from, 'HHmmss');
            let toTime = datePipeEn.transform(this.StudyDateTime.to, 'HHmmss');
            if(fromDate === toDate){
                this.filters['StudyDate'] = fromDate;
            }else{
                this.filters['StudyDate'] = fromDate + '-' + toDate;
            }
/!*            if(fromTime === toTime){
                this.filters['StudyTime'] = fromTime;
            }else{
                this.filters['StudyTime'] = fromTime + '-' + toTime;
            }*!/
        }*/
    };

    conditionWarning($event, condition, msg){
        let id = $event.currentTarget.id;
        let $this = this;
        if (condition){
            this.disabled[id] = true;
            this.mainservice.setMessage({
                'title': 'Warning',
                'text': msg,
                'status': 'warning'
            });
            setTimeout(function() {
                $this.disabled[id] = false;
            }, 100);
        }
    };

    appendFilter(filter, key, range, regex) {
        let value = range.from.replace(regex, '');
        if (range.to !== range.from)
            value += '-' + range.to.replace(regex, '');
        if (value.length)
            filter[key] = value;
    };

    createStudyFilterParams() {
        let filter = Object.assign({}, this.filters);
        return filter;
    };

    createQueryParams(limit, filter) {
        let params = {
            includefield: 'all',
            limit: limit
        };
        for (let key in filter){
            if (filter[key] || filter === false){
                params[key] = filter[key];
            }
        }
        return params;
    };
    counts ={};
    showLoader = {};
    search(){
        let $this = this;
        this.cfpLoadingBar.start();
        if(!this.aet2) {
            this.mainservice.setMessage({
                'title': 'Warning',
                'text': "Secondary AET is empty!",
                'status': 'warning'
            });
            $this.cfpLoadingBar.complete();
        }else{
            if(!this.aet1){
                this.aet1 = this.homeAet;
            }
            _.forEach($this.diffAttributes,(m,i)=>{
                $this.counts[m.id] = null;
                $this.groupResults[m.id] = [];
                $this.showLoader[m.id] = true;
            });
            let queryParameters = this.createQueryParams(this.filters.limit + 1, this.createStudyFilterParams());
            _.forEach($this.diffAttributes,(m,i)=>{
                if(m.id === "missing"){
                    delete queryParameters["comparefield"];
                    queryParameters["different"] = false;
                    queryParameters["missing"] = true;
                    $this.cfpLoadingBar.start();

                    $this.service.getDiff($this.homeAet,$this.aet1,$this.aet2,queryParameters).subscribe(
                        (partDiff)=>{
                            $this.groupResults[m.id] = partDiff ? partDiff:[];
                            $this.counts[m.id] = partDiff ? partDiff.length : 0;
                            $this.showLoader[m.id] = false;
                            $this.toggle = '';
                            $this.cfpLoadingBar.complete();
                        },
                        (err)=>{
                            $this.cfpLoadingBar.complete();
                            $this.showLoader[m.id] = false;
                            $this.mainservice.setMessage({
                                'title': 'Error ' + err.status,
                                'text': 'Error getting ' + m.title + ' (' + err.statusText + ')',
                                'status': 'error'
                            });
                        });
                }else{
                    $this.cfpLoadingBar.start();
                    queryParameters["comparefield"] = m.id;
                    $this.service.getDiff($this.homeAet,$this.aet1,$this.aet2,queryParameters).subscribe(
                        (partDiff)=>{
                            $this.cfpLoadingBar.complete();
                            $this.counts[m.id] = partDiff ? partDiff.length : 0;
                            $this.toggle = '';
                            $this.groupResults[m.id] = partDiff ? partDiff:[];
                            $this.showLoader[m.id] = false;
                        },
                        (err)=>{
                            $this.cfpLoadingBar.complete();
                            $this.showLoader[m.id] = false;
                            $this.mainservice.setMessage({
                                'title': 'Error ' + err.status,
                                'text': 'Error getting ' + m.title + ' (' + err.statusText + ')',
                                'status': 'error'
                            });
                        });
                }
            });

        }
    };
    getAes(retries){
        let $this = this;
        this.service.getAes().subscribe(
            (aes)=>{
                $this.aes = _.sortBy(j4care.extendAetObjectWithAlias(aes),['dicomAETitle']);
            },
            (err)=>{
                if (retries){
                    $this.getAes(retries - 1);
                }
            }
        );
    };
    setLoadMore(){
        let $this = this;
        _.forEach(this.diffAttributes,(m,i)=>{
            this.moreGroupElements[m.id] = {
                limit: 30,
                start: 0,
                loaderActive: false
            };
        });
    }
    loadMore(id){
        this.moreGroupElements[id].loaderActive = true;
        this.moreGroupElements[id].limit += 20;
        this.moreGroupElements[id].loaderActive = false;
    }

    scrolling(id){
        let hT = ($('.load_more.'+id).offset()) ? $('.load_more.'+id).offset().top : 0,
            hH = $('.load_more.'+id).outerHeight(),
            wH = $('.bluecontent.'+id).height(),
            wS = $('.bluecontent.'+id).scrollTop();
        if (wS > (hT + hH - wH)){
            this.loadMore(id);
        }
    }
    addLabelToActionArray(action){
        function replacerLabel(match, p1, p2, p3, offset, string) {
            if(p3){
                return 'SYNCHRONIZE THIS ENTRIES';
            }else{
                return j4care.firstLetterToUpperCase(p2) + ' selected ' + p1;
            }
        }
        function replacerDescription(match, p1, p2, p3, offset, string) {
            if(p3){
                return j4care.firstLetterToUpperCase(p2) + ' not selected ' + p1 + ' and ' + p3 + ' selected one to the not selected AEt';
            }else{
                return j4care.firstLetterToUpperCase(p2) + ' selected ' + p1;
            }
        }
        return action.map(m => {
            return {
                key: m,
                label: m.replace(/(\w*)\-(\w*)\-?(\w*)?/g, replacerLabel),
                description: m.replace(/(\w*)\-(\w*)\-?(\w*)?/g, replacerDescription)
            }
        });
    }
    convertActionToArray(str){
        const regex = /[A-Za-z0-9_-]*[^\s^,]/g;
        let m;
        let result = [];
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

/*            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                console.log(`Found match, group ${groupIndex}: ${match}`);
            });*/
            result.push(m[0]);
        }
        return result;
    }
    confirm(confirmparameters){
        this.config.viewContainerRef = this.viewContainerRef;
        this.dialogRef = this.dialog.open(ConfirmComponent, {
            height: 'auto',
            width: 'auto'
        });
        this.dialogRef.componentInstance.parameters = confirmparameters;
        return this.dialogRef.afterClosed();
    };
    getDiffAttributeSet(retries){
        let $this = this;
        this.service.getDiffAttributeSet().subscribe(
            (res)=>{
                //Don't show all group
                $this.diffAttributes = res.filter(attr=>{
                    return attr.id != "all";
                });
                $this.diffAttributes.forEach((m,i)=>{
                    if(_.hasIn(m,"actions")){
                        m.patientMode = (m.actions.indexOf("patient-update") > -1) ? true : false;
                        m.actions = this.addLabelToActionArray(this.convertActionToArray(m.actions));
                    }else{
                        m.patientMode = false;
                    }
                    if(_.hasIn(m,"groupButtons")){
                        m.groupButtons = this.convertActionToArray(m.groupButtons).map((actionButton)=>{
                            switch (actionButton){
                                case "synchronize":
                                    return {
                                        action:actionButton,
                                        iconClass:"glyphicon glyphicon-transfer",
                                        title:"Synchronize all entries from this group"
                                    };
                                case "reject":
                                    return {
                                        action:actionButton,
                                        iconClass:"glyphicon glyphicon-trash",
                                        title:"Reject all entries from this group"
                                    };
                                case "export":
                                    return {
                                        action:actionButton,
                                        iconClass:"glyphicon glyphicon-export",
                                        title:"Export all entries from this group"
                                    };
                            }
                        });

                    }
                });
                //get first letter after "-": regex: /\-(\w)/g
                $this.diffAttributes.push({
                    id:"missing",
                    title:"Missing studies",
                    descriptioin:"Compares only missing Studies",
                    groupButtons:[{
                        action:"missing",
                        iconClass:"glyphicon glyphicon-export",
                        title:"Send all studies to secondary AE"
                    }]
                });
                $this.setLoadMore();
            },
            (err)=>{
                if (retries){
                    $this.getDiffAttributeSet(retries - 1);
                }
            }
        );
    };
    initRjNotes(retries) {
        let $this = this;
        this.service.rjNotes().subscribe(
                (res) => {
                    let rjnotes = res;
                    rjnotes.sort(function (a, b) {
                        if (a.codeValue === '113039' && a.codingSchemeDesignator === 'DCM')
                            return -1;
                        if (b.codeValue === '113039' && b.codingSchemeDesignator === 'DCM')
                            return 1;
                        return 0;
                    });
                    $this.rjnotes = rjnotes;
                    // $this.reject = rjnotes[0].codeValue + '^' + rjnotes[0].codingSchemeDesignator;

                    // $this.mainservice.setGlobal({rjnotes:rjnotes,reject:$this.reject});
                },
                (res) => {
                    if (retries)
                        $this.initRjNotes(retries - 1);
                });
    }
    getAets(retries){
        let $this = this;
        this.service.getAets().subscribe(
            (aets)=>{
                $this.aets = j4care.extendAetObjectWithAlias(aets);
                $this.homeAet = aets[0].dicomAETitle;
            },
            (err)=>{
                if (retries){
                    $this.getAets(retries - 1);
                }
            }
        );
    };
    onFileChange(event){
        console.log("file",event);
        let file = event.target.files[0];
        let ignoreFirstElement = false;
        this.missingStudies = [];
        this.checked = 0;
        this.cancel = false;
        if(file){

            let blob = file.slice(0, 240);
            let checkReader = new FileReader();
            checkReader.readAsText(blob);
            checkReader.onload = ()=>{
                if(checkReader.result.indexOf(',') > -1){
                    this.mainservice.setMessage({
                        'title': 'Error',
                        'text': 'More than one column found, try uploading csv-file with only one column!',
                        'status': 'error'
                    });
                }else{
                    let reader = new FileReader();
                    reader.readAsText(file);
                    reader.onprogress = (data)=>{
                        if (data.lengthComputable) {
                            var progress = parseInt( ((data.loaded / data.total) * 100).toString(), 10 );
                            console.log(progress);
                        }
                    }
                    reader.onload = () => {
                        // console.log("reader.result",reader.result);
                        this.studyInstanceUIDsFromFile = reader.result.split('\n');
                        if(this.studyInstanceUIDsFromFile[0].toLowerCase().indexOf('study') > -1 || this.studyInstanceUIDsFromFile[0].toLowerCase().indexOf('insta') > -1){
                            ignoreFirstElement = true;
                        }
                        console.log("reader.result",this.studyInstanceUIDsFromFile);
                        if(ignoreFirstElement)
                            this.studyInstanceUIDsFromFile.splice(0,1);
                        this.fileStudyCount = this.studyInstanceUIDsFromFile.length;

                    }
                }
            };
        }

    }
    findeMissingStudies(){
        if(this.studyInstanceUIDsFromFile.length > 0){
            this.performeMissingStudyDiffFromFile(this.studyInstanceUIDsFromFile);
        }
    }
    performeMissingStudyDiffFromFile(studies:string[]){
        this.processStarted = true;
        this.showSendProgress = false;
        this.checked = 0;
        if(!this.aet2) {
            this.mainservice.setMessage({
                'title': 'Warning',
                'text': "Secondary AET is empty!",
                'status': 'warning'
            });
            this.cfpLoadingBar.complete();
        }else{
            if(!this.aet1){
                this.aet1 = this.homeAet;
            }
            if(studies.length > 0){
                this.filters["different"]=false;
                this.filters["missing"]=true;
                this.getMissingStudiesWithStudyInstaceUID(studies,0,this.checkStep, 5);
            }else{
                this.mainservice.setMessage({
                    'title': 'Info',
                    'text': "No StudyInstanceUIDs found in the file!",
                    'status': 'info'
                });
            }
        }
    }
    getMissingStudiesWithStudyInstaceUID(studyInstanceUIDsFromFile, start, end, retry){
        let services = [];
        let studyInstanceUIDs = [];
        studyInstanceUIDsFromFile.slice(start,end).forEach(StudyInstanceUID => {
            this.filters.StudyInstanceUID = StudyInstanceUID.trim();
            if(StudyInstanceUID && StudyInstanceUID != ''){
                services.push(this.service.getDiffCount(this.homeAet,this.aet1,this.aet2,this.createQueryParams(this.filters.limit + 1, this.createStudyFilterParams())));
                studyInstanceUIDs.push(this.filters.StudyInstanceUID);
            }else
                this.checked++;
        });
        Observable.forkJoin(services).subscribe((res)=>{
            this.checked = this.checked + res.length;
            let nextEnd;
            if(studyInstanceUIDsFromFile.length > end+this.checkStep)
                nextEnd = end+this.checkStep;
            else
                nextEnd = studyInstanceUIDsFromFile.length;
                res.forEach((checkRes,i)=>{
                    if(checkRes && _.hasIn(checkRes,'missing') && checkRes['missing'] > 0)
                       this.missingStudies.push(studyInstanceUIDs[i]);
                   /*if(checkRes && _.hasIn(checkRes,'[0]["0020000D"].Value[0]'))
                       this.missingStudies.push(checkRes[0]["0020000D"].Value[0]);*/
                });
            if(!this.cancel)
                this.getMissingStudiesWithStudyInstaceUID(studyInstanceUIDsFromFile,end,nextEnd, retry);
        },(err)=>{
            console.log("err",err);
            if(retry)
                this.getMissingStudiesWithStudyInstaceUID(studyInstanceUIDsFromFile,start,end, retry-1);
        });
    }/*
    cancelProcess(){
        this.processStarted = false;
        this.cancel = true;
        this.checked = 0;
        this.missingStudies = [];

    }*/
    sendMissingStudies(){
        this.showSendProgress = true;
        this.copyScp1 = this.copyScp1 || this.aet1;
        this.cMoveScp1 = this.cMoveScp1 ||  this.aet1;
        this.copyScp2 = this.copyScp2 || this.aet2;
        this.cMoveScp2 = this.cMoveScp2 ||  this.aet2;
        let externalAET;
        let destinationAET;
            externalAET = this.cMoveScp1;
            destinationAET = this.copyScp2;
        this.send = 0;
        this.sendQueuedMissingStudies(this.missingStudies,0,2,3, externalAET, destinationAET);
    }
    sendQueuedMissingStudies(missingStudies:any[],start:number,end:number, retry:number, externalAET:string, destinationAET:string){
        let services:any[] = [];
        missingStudies.slice(start,end).forEach(StudyInstanceUID => {
            this.filters.StudyInstanceUID = StudyInstanceUID.trim();
            if(StudyInstanceUID && StudyInstanceUID != '')
                services.push(this.diffDetailViewService.exportStudyExternal(this.homeAet,externalAET, StudyInstanceUID, destinationAET,true));
            else
                this.send++;
        });
        Observable.forkJoin(services).subscribe((res)=>{
            this.send = this.send + res.length;
            let nextEnd;
            if(missingStudies.length > end+this.checkStep)
                nextEnd = end+2;
            else
                nextEnd = missingStudies.length;
/*            res.forEach(checkRes=>{
                if(checkRes && _.hasIn(checkRes,'[0]["0020000D"].Value[0]'))
                    this.missingStudies.push(checkRes[0]["0020000D"].Value[0]);
            });*/
            if(!this.cancel)
                this.sendQueuedMissingStudies(missingStudies,end,nextEnd, retry, externalAET, destinationAET);
        },(err)=>{
            console.log("err",err);
            if(retry)
                this.sendQueuedMissingStudies(missingStudies,start,end, retry-1,  externalAET, destinationAET);
        });
    }

}
