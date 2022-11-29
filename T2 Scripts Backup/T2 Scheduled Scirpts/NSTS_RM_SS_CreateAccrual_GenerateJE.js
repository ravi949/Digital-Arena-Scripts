/**
 * Copyright (c) 1998-2015 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * This script contains reusable functions that can be used in any
 * type of script records.
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Feb 2018     Roxanne Audette   Initial version.
 * 
 */

var USAGE_LIMIT = 1000;
var HC_JE_SUCCESS = [];
var HC_JE_ERROR = [];
var HC_ACC_ERROR = [];
var HC_JE_SUCCESS_CNT = 0;
var HC_ACC_SUCCESS_CNT = 0;
var HC_ACC_ERROR_CNT = 0;

var HC_OBJ_FEATURE = new objFeature();

function generateAccrual(type){
    var context = nlapiGetContext();
    var stUserId = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_GEN_ACCRU_USER);
    
	var currentDate = new Date(); currentDate.setHours(0,0,0,0);
	//var stServerDate = nlapiDateToString(new Date());
	//var objPeriod = getAccountingPeriodObject(nlapiStringToDate(stServerDate));
	
	var objFilter = [new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'),
					 new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUE_AMOUNTS, null, 'is', 'T'),
					 new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_ACCOUNT, null, 'noneof', '@NONE@'),
					 new nlobjSearchFilter(FLD_REBATE_AGREEMENT_STATUS, null, 'anyof', [HC_AGREEMENT_STATUS.Approved, HC_AGREEMENT_STATUS.Closed]),
					 new nlobjSearchFilter(FLD_CUSTRECORD_REMITTANCE_TYPE, null, 'anyof', [HC_REMIT_TYPE.Refund, HC_REMIT_TYPE.Credit])];//,
					 //new nlobjSearchFilter(FLD_CUSTRECORD_START_DATE, null, 'onorbefore', currentDate),
					 //new nlobjSearchFilter(FLD_CUSTRECORD_END_DATE, null, 'onorafter', currentDate)];
	
	var objColumn = [new nlobjSearchColumn(FLD_CUSTRECORD_AGREEMENT_NAME),
				     new nlobjSearchColumn(FLD_CUSTRECORD_ACCRUED_EXPENSES),
					 new nlobjSearchColumn(FLD_CUSTRECORD_ACCRUED_RECEIVABLE),
					 new nlobjSearchColumn(FLD_CUSTRECORD_ACCRUED_PAYABLE),
					 new nlobjSearchColumn(FLD_REBATE_AGREEMENT_REBATE_TYPE),
					 new nlobjSearchColumn(FLD_CUSTRECORD_REMITTANCE_TYPE),
					 new nlobjSearchColumn(FLD_CUSTRECORD_CREDIT_ENTITY),
					 new nlobjSearchColumn(FLD_CUSTRECORD_REFUND_ENTITY),
					 new nlobjSearchColumn(FLD_CUSTRECORD_CLAIM_TRANS),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_POST_DEPT, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_POST_CLASS, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_POST_LOC, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_DEF_DEPT, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_DEF_CLASS, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_DEF_LOC, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_FLAG, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
					 new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_JEFORM, FLD_CUSTRECORD_ACCRUAL_ACCOUNT)];
	
	if(HC_OBJ_FEATURE.blnOneWorld) {
		objColumn.push(new nlobjSearchColumn(FLD_REBATE_AGREEMENT_SUBSIDIARY));
	}
	
	if(HC_OBJ_FEATURE.bMultiCurrency) {
		objColumn.push(new nlobjSearchColumn(FLD_REBATE_AGREEMENT_CURRENCY));
	}
	
	var objAgreementSearch = getAllResults(REC_REBATE_AGREEMENT, null, objFilter, objColumn);
	//var objRASub = null;
	
	if (!isEmpty(objAgreementSearch)) {
		var objAgreementResults = objAgreementSearch.results;
		
		for(var a = 0; a < objAgreementResults.length; a++){
			var idAccrualRec = null;
			var bPostDept = false, bPostClass = false, bPostLoc = false;
			var stDefDept = null, stDefClass = null, stDefLoc = null;
			
			try{
				//Create Accrual Record
				var accrualRec = nlapiCreateRecord(REC_ACCRUAL); 
				accrualRec.setFieldValue(FLD_ACCRUAL_RA, objAgreementResults[a].getId());
				accrualRec.setFieldValue(FLD_ACCRUAL_REBATE_TYPE, objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_REBATE_TYPE));
				if(HC_OBJ_FEATURE.blnOneWorld){
					accrualRec.setFieldValue(FLD_ACCRUAL_SUBSIDIARY, objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_SUBSIDIARY));
					//Get the Accrual Date Adjuster from the subsidiary (cannot search the column of a subsidiary so need to load the subsidiary record)
					var objRASub = nlapiLoadRecord(HC_SUBSIDIARY, objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_SUBSIDIARY)); 
					
					if(!isEmpty(objRASub.getFieldValue(FLD_ACCRUAL_DATE_ADJ)) && !isEmpty(accrualRec.getFieldValue(FLD_ACCRUAL_CURR_DATE_TIME)) && accrualRec.getFieldValue(FLD_ACCRUAL_CURR_DATE_TIME) != 0){
						accrualRec.setFieldValue(FLD_ACCRUAL_DATE, nlapiDateToString(addHours(nlapiStringToDate(accrualRec.getFieldValue(FLD_ACCRUAL_CURR_DATE_TIME), 'datetime'), objRASub.getFieldValue(FLD_ACCRUAL_DATE_ADJ)), 'date'));
						accrualRec.setFieldValue(FLD_ACCRUAL_TRAN_START_DATE, nlapiDateToString(addHours(nlapiStringToDate(accrualRec.getFieldValue(FLD_ACCRUAL_CURR_DATE_TIME), 'datetime'), objRASub.getFieldValue(FLD_ACCRUAL_DATE_ADJ)), 'date'));
						accrualRec.setFieldValue(FLD_ACCRUAL_TRAN_END_DATE, nlapiDateToString(addHours(nlapiStringToDate(accrualRec.getFieldValue(FLD_ACCRUAL_CURR_DATE_TIME), 'datetime'), objRASub.getFieldValue(FLD_ACCRUAL_DATE_ADJ)), 'date'));
					}
					
					if(HC_OBJ_FEATURE.bDepartment){
						bPostDept = objRASub.getFieldValue(FLD_POST_BY_DEPT);
						stDefDept = objRASub.getFieldValue(FLD_DEFAULT_DEPT);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEPARTMENT, bPostDept);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_DEPARTMENT, stDefDept);
					}
					
					if(HC_OBJ_FEATURE.bClass){
						bPostClass = objRASub.getFieldValue(FLD_POST_BY_CLASS);
						stDefClass = objRASub.getFieldValue(FLD_DEFAULT_CLASS);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_CLASS, bPostClass);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_CLASS, stDefClass);
					}
					
					if(HC_OBJ_FEATURE.bLocation){
						bPostLoc = objRASub.getFieldValue(FLD_POST_BY_LOC);
						stDefLoc = objRASub.getFieldValue(FLD_DEFAULT_LOC);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_LOCATION, bPostLoc);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_LOCATION, stDefLoc);
					}
					
				}else{		
					if(HC_OBJ_FEATURE.bDepartment){
						bPostDept = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_POST_DEPT, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						stDefDept = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_DEF_DEPT, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEPARTMENT, bPostDept);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_DEPARTMENT, stDefDept);
					}
					
					if(HC_OBJ_FEATURE.bClass){
						bPostClass = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_POST_CLASS, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						stDefClass = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_DEF_CLASS, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_CLASS, bPostClass);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_CLASS, stDefClass);
					}
					
					if(HC_OBJ_FEATURE.bLocation){
						bPostLoc = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_POST_LOC, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						stDefLoc = objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_DEF_LOC, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_LOCATION, bPostLoc);
						accrualRec.setFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_LOCATION, stDefLoc);
					}
				}
				if(HC_OBJ_FEATURE.bMultiCurrency) accrualRec.setFieldValue(FLD_ACCRUAL_CURRENCY, objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_CURRENCY)); 
				
				//nlapiLogExecution('debug', 'accrualDateToday:TIMEZONE L C DT', accrualRec.getFieldValue(FLD_ACCRUAL_DATE) + ':' +  stSubTimeZone + ':' + nlapiDateToString(new Date(), 'datetime' ,stSubTimeZone));
				//accrualRec.setFieldValue(FLD_ACCRUAL_DATE, nlapiStringToDate(stUserDate));
				//accrualRec.setFieldValue(FLD_ACCRUAL_PERIOD, objPeriod.id);
				//accrualRec.setFieldValue(FLD_ACCRUAL_TRAN_START_DATE, nlapiDateToString(stUserDate));
				//accrualRec.setFieldValue(FLD_ACCRUAL_TRAN_END_DATE, nlapiDateToString(stUserDate));
				accrualRec.setFieldValue(FLD_ACCRUAL_EXPENSE, objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_EXPENSES));
				accrualRec.setFieldValue(FLD_ACCRUAL_RECEIVABLE, objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE));
				accrualRec.setFieldValue(FLD_ACCRUAL_PAYABLE, objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_PAYABLE));
				
				
	            idAccrualRec = nlapiSubmitRecord(accrualRec);
			}catch(e){
	            var stRAURL = nlapiResolveURL("RECORD", REC_REBATE_AGREEMENT,  objAgreementResults[a].getId(), "VIEW");
	            HC_ACC_ERROR.push('Agreement: <a href="'+stRAURL+'">'+objAgreementResults[a].getValue(FLD_CUSTRECORD_AGREEMENT_NAME)+'</a> | Error: ' + e.toString());
				HC_ACC_ERROR_CNT++;
			}
			
            
            if(!isEmpty(idAccrualRec)){
            	HC_ACC_SUCCESS_CNT++
	            generateJE({
	            	user: stUserId,
	            	idAccrualRec: idAccrualRec,
	            	raName: objAgreementResults[a].getValue(FLD_CUSTRECORD_AGREEMENT_NAME),
	            	rebateAgreement: objAgreementResults[a].getId(),
	            	rebateType: objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_REBATE_TYPE),
	            	remitType: objAgreementResults[a].getValue(FLD_CUSTRECORD_REMITTANCE_TYPE),
	            	creditEntity: objAgreementResults[a].getValue(FLD_CUSTRECORD_CREDIT_ENTITY),
	            	refundEntity: objAgreementResults[a].getValue(FLD_CUSTRECORD_REFUND_ENTITY),
	            	currentDate: currentDate,
	            	postByDept: bPostDept,
	            	postByClass: bPostClass,
	            	postByLoc: bPostLoc,
	            	defaultDept: stDefDept,
	            	defaultClass: stDefClass,
	            	defaultLoc: stDefLoc,
	            	subsidiary:  (HC_OBJ_FEATURE.blnOneWorld) ? objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_SUBSIDIARY) : null,
	            	currency:  (HC_OBJ_FEATURE.bMultiCurrency) ? objAgreementResults[a].getValue(FLD_REBATE_AGREEMENT_CURRENCY) : null,
	            	expense:  objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_EXPENSES),
	            	receivable:  objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE),
	            	payable:  objAgreementResults[a].getValue(FLD_CUSTRECORD_ACCRUED_PAYABLE),
	            	claimTranType: objAgreementResults[a].getValue(FLD_CUSTRECORD_CLAIM_TRANS),
	            	accountTag: objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_FLAG, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
	            	accruedExpense: objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
	            	accruedReceivable: objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
	            	accruedPayable: objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, FLD_CUSTRECORD_ACCRUAL_ACCOUNT),
	            	JEForm: objAgreementResults[a].getValue(FLD_ACCRUAL_ACCOUNT_JEFORM, FLD_CUSTRECORD_ACCRUAL_ACCOUNT)
	            });
            }
            nlapiLogExecution('debug', 'idAccrualRec', idAccrualRec)
		}
		//nlapiLogExecution('debug', 'accrual exp', objAgreementResults[0].getId()+'|'+objAgreementResults[0].getValue('custrecord_nsts_rm_accrue_acc_exp', FLD_CUSTRECORD_ACCRUAL_ACCOUNT));
	}
	
	try{
		var stSubject = "Accrual and JE Generation Completed";
		var stAccrualEmailBody = 'The accrual creation and JE generation has been completed. ';
		
		stAccrualEmailBody += '<br><br>There are ' + HC_ACC_SUCCESS_CNT + ' Accruals created and ' + HC_ACC_ERROR_CNT + ' that were not created due to an error. <br>'
			+ (HC_ACC_ERROR.toString()).replace(/,/g,'<br>');
		
		if(!isEmpty(HC_JE_SUCCESS)){
			stAccrualEmailBody += '<br><br> There are ' + HC_JE_SUCCESS_CNT + ' Journal Entries created. Click Accrual links to view the journal entries. <br>'
			+ (HC_JE_SUCCESS.toString()).replace(/,/g,'<br>');
		}
		
		if(!isEmpty(HC_JE_ERROR)){
			stAccrualEmailBody += "<br>Journal Entries were not not generated on the following Accruals – might be no Rebate Transaction Details (RTDs) to process or zero (0.00) "
				+'accrual amount of all the RTDs or accruals might have been processed previously or an error was encountered during the process of generating the JE. <br>'
				+ (HC_JE_ERROR.toString()).replace(/,/g,'<br>');
			
		}
		var records = {};
        records['entity'] = stUserId;
		nlapiSendEmail(stUserId, stUserId, stSubject, stAccrualEmailBody,null,null,records);
		
	}catch(e){
		//Do nothing, most likely error encountered when getting email is invalid user or email address
	}
}

function generateJE(param){
	var stLogTitle = 'ACCRUALS_AND_JE_GENERATION';
	var arrAccrualFld = [];
	var arrAccrualVal = [];
	var stJEError = '';
	
	var stDebit = param.expense;
	var stCredit = param.payable;
	
	var bIsVROSVROP = false;
	var stVROSVROPEntity = null;
	
	if(param.rebateType != HC_REB_TYPE.CustReb){
		stDebit = param.receivable;
    	stCredit = param.expense;
    	
    	bIsVROSVROP = true;
    	
    	if(param.remitType == HC_REMIT_TYPE.Credit){
    		stVROSVROPEntity = param.creditEntity;
    	}else{
    		stVROSVROPEntity = param.refundEntity;
    	}
	}
	var recAccrual = nlapiLoadRecord(REC_ACCRUAL, param.idAccrualRec);
	
	var objSearchDefault = nlapiLoadSearch(null, SS_ACCRUAL_DEFAULT_SEARCH);
	
	log("debug",stLogTitle, "getting save search component");
	//LOAD Search component
	var objNewSSearch = objSearchDefault;
	var arrAccruColsOld = objNewSSearch.getColumns();
	var arrAccruFilsOld = objNewSSearch.getFilters();
	
	var arrAccruColsNew = [];
	var arrAccruFilsNew = [];
	
	for(var icol = 0; icol < arrAccruColsOld.length; icol++){
		var col = arrAccruColsOld[icol]; 

		if(icol == 0){
			col.setSort(false);
		}
		var stColName = col.getName();
		var stConJoin = col.getJoin();
		var stSum = col.getSummary();
		//arrAccruColsNew.push(new nlobjSearchColumn(stColName, stConJoin, stSum));
		
		arrAccruColsNew.push(col);
	}
	
	if(param.rebateType == HC_REB_TYPE.CustReb){
		arrAccruColsNew.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_CUSTOMER, null, HC_SEARCH_SUMMARY_TYPE.group));    		
	}
	
	for(var ifil = 0; ifil < arrAccruFilsOld.length; ifil++){
		var fil = arrAccruFilsOld[ifil];
		arrAccruFilsNew.push(fil);	
	}
	nlapiLogExecution('debug', 'param.postByDept', param.postByDept);
	if(param.postByDept == "T"){
		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_DEPARTMENT, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
	}
	if(param.postByClass == "T"){
		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_CLASS, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
	}
	if(param.postByLoc == "T"){
		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_LOCATION, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
	}
	
	if(!isEmpty(param.rebateAgreement)){
		arrAccruFilsNew.push(new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGREEMENT, null, 'anyof', [param.rebateAgreement]))
	}
	//nlapiLogExecution('debug', 'trantypes', (param.claimTranType).toString() + ':' + JSON.stringify(recAccrual.getFieldValues(FLD_ACCRUAL_CLAIM_TRAN_TYPE)));
	if(!isEmpty(recAccrual.getFieldValues(FLD_ACCRUAL_CLAIM_TRAN_TYPE))){
		arrAccruFilsNew.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_TRAN_TYPE, null, 'anyof', recAccrual.getFieldValues(FLD_ACCRUAL_CLAIM_TRAN_TYPE)))
	}
	
	arrAccruFilsNew.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DATE, FLD_CUSTRECORD_NSTS_RM_REBATETRAN, 'on', recAccrual.getFieldValue(FLD_ACCRUAL_DATE)));
	arrAccruFilsNew.push(new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'));

	//END LOAD Search component
	log("debug",stLogTitle, "all save search component ready");
	
	//if(isEmpty(stNewSearch)){
		
		log("debug",stLogTitle, "Creating Save Search");
		objNewSSearch = nlapiCreateSearch(REC_REBATE_TRAN_DETAIL, arrAccruFilsNew, null);
		objNewSSearch.setIsPublic(true);
    	
    	var stNewSearch = objNewSSearch.saveSearch('RTD for Accruals Default #' + param.idAccrualRec + '-' + nlapiStringToDate(recAccrual.getFieldValue(FLD_ACCRUAL_DATE)).toString().split(" ").slice(0, 4).join(" "));
    	arrAccrualFld.push(FLD_ACCRUAL_NEW_SEARCH);
    	arrAccrualVal.push(stNewSearch);
    	var bDoUpdateFilterOnNewSearch = true;
    	log("debug",stLogTitle, "Creating Save Search complete");
	//}

	var objSearchNew = nlapiLoadSearch(null, stNewSearch);
	
	//UPDATE TRD
	log("debug",stLogTitle, "getAllResultsSearchObject");
	var objSearch = getAllResultsSearchObject(objSearchNew) //(null, stNewSearch, arrFil, arrCol);
	log("debug",stLogTitle, "getAllResultsSearchObject done");
	var arrRes = objSearch.results;
	for(var iRTD = 0; iRTD < arrRes.length; iRTD++){
		var recRTD = arrRes[iRTD];
		var intRTD = recRTD.getId();
		if(!isEmpty(intRTD)){
            try{
            	doYield();
            }catch(e){
            	log('debug',stLogTitle,e);
            }
    		nlapiSubmitField(REC_REBATE_TRAN_DETAIL, intRTD, [FLD_CUSTRECORD_ACCRUAL_RECORD], [param.idAccrualRec]);
		}
	}
	
	log("debug",stLogTitle, "getAllResultsSearchObject Updating");
	if(bDoUpdateFilterOnNewSearch){

    	objSearchNew.setColumns(arrAccruColsNew);
    	var isAccrualFilterApplied = false;
    	for(var ifil = 0; ifil < arrAccruFilsNew.length; ifil++){
    		var fil = arrAccruFilsNew[ifil];
    		
    		if(fil.getName() == FLD_CUSTRECORD_ACCRUAL_RECORD){
    			isAccrualFilterApplied = true;
    			arrAccruFilsNew[ifil] = new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_RECORD, null, 'anyof', [param.idAccrualRec]);
    		}
    	}
    	if(isAccrualFilterApplied == false){
	    	arrAccruFilsNew.push(new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_RECORD, null, 'anyof', [param.idAccrualRec]));
    	}

		objSearchNew.setFilters(arrAccruFilsNew);
		stNewSearch = objSearchNew.saveSearch();
		//, 'customsearch_nsts_rm_accru_' + param.idAccrualRec);

    	objSearch = getAllResults(null, stNewSearch);
    	arrRes = objSearch.results;
	}
	
	log("debug",stLogTitle, "getAllResultsSearchObject Updated");
	var objToJe = {};
	if(isEmpty(arrRes)){
		log("debug",stLogTitle, "NO DATA TO PROCESS");
		//continue;
	}
	
	log("debug",stLogTitle, "arrRes.length: " + arrRes.length);
	for(var ii = 0; ii < arrRes.length; ii++){
		var rec = arrRes[ii];
		var objRtd = new rtdComponent(rec);
		
		if(bIsVROSVROP && !isEmpty(stVROSVROPEntity)){
			objRtd.entity = stVROSVROPEntity;
		}
		
		if(isEmpty(objToJe[objRtd.entity])){
			objToJe[objRtd.entity] = []
		}
		
		objToJe[objRtd.entity].push(objRtd);
	}
	
	//check if a group is more than 500 
	var intMaxItem = 500;
	for (var key in objToJe){
		var arrBuf = objToJe[key];
		if(!isEmpty(arrBuf) && arrBuf.length >= intMaxItem){
			
			var arrChuck = chuckArray(arrBuf,intMaxItem);
			
			for(var ii = 0; ii < arrChuck.length; ii++){
				objToJe[key + "_" + ii] = arrChuck[ii]
			}
			
			objToJe[key] = null;
			
			delete objToJe[key];
		}
	}
	
	var recJE = null;
	var intCurCount = 0;
	var arrJE = []
	
	var stDep = null;
	var stClass =  null;
	var STLocation = null;
	var stIsGenerating = "F";
	var flRunningTotalAccrualAmt = 0;
	
	try{
		for (var key in objToJe){
			var arrBuf = objToJe[key];
    		if(!isEmpty(arrBuf)){
    			var createNewJe = function (recAccruJE){
    				if(isEmpty(recAccruJE)){
    					var onjIniVals = {};
	    			    onjIniVals["recordmode"] = 'dynamic';

	    			    
						stDep = isEmpty(stDep)? param.defaultDept : stDep;
						stClass = isEmpty(stClass)? param.defaultClass : stClass;
						STLocation = isEmpty(STLocation)? param.defaultLoc : STLocation;
							    			    
	    			    stDep = arrBuf[0].department;
						stClass = arrBuf[0].class;
						STLocation = arrBuf[0].location;
						
						recAccruJE = nlapiCreateRecord('journalentry', onjIniVals)

	    				if(!isEmpty(param.JEForm)){
	    					recAccruJE.setFieldValue('customform', param.JEForm);
	    				}

						if(!isEmpty(param.subsidiary)) recAccruJE.setFieldValue('subsidiary', param.subsidiary);
						if(!isEmpty(param.currency)) recAccruJE.setFieldValue('currency', param.currency);
						
						recAccruJE.setFieldValue('trandate', recAccrual.getFieldValue(FLD_ACCRUAL_DATE));
						//recAccruJE.setFieldValue('postingperiod', stAccrualPeriod);
						recAccruJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_RA_ID, param.rebateAgreement);
						recAccruJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_ACCRUALREC, param.idAccrualRec);
						
						recAccruJE.setFieldValue('memo', "{REBATE MANAGEMENT}: This is an auto-generated JE for Accrual");
						return recAccruJE;
    				}
    				
    				return recAccruJE;
    			}
    			
    			recJE = createNewJe(recJE);
    			
    			for(var ii = 0; ii < arrBuf.length; ii++){
    				stDep = arrBuf[ii].department;
         			stClass = arrBuf[ii].class;
         			STLocation = arrBuf[ii].location;
         			
         			stDep = isEmpty(stDep)? param.defaultDept : stDep;
					stClass = isEmpty(stClass)? param.defaultClass : stClass;
					STLocation = isEmpty(STLocation)? param.defaultLoc : STLocation;
					
					var stDebitTmp = stDebit;
					var stCreditTmp = stCredit;
					var flAccrualAmount = arrBuf[ii].accrualAmount;
					if(flAccrualAmount == 0){
						continue;
					}
					
					if(flAccrualAmount < 0 ){
						stDebitTmp = stCredit;
						stCreditTmp = stDebit;
						flAccrualAmount = Math.abs(flAccrualAmount);
					}
					flRunningTotalAccrualAmt += flAccrualAmount;
					
					//DEBIT
         			recJE.selectNewLineItem(FLD_LINE);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stDebitTmp)
         			recJE.setCurrentLineItemValue(FLD_LINE, 'debit', flAccrualAmount);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', arrBuf[ii].entity);
     
         			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
         			recJE.commitLineItem(FLD_LINE);
         			
         			//credit
         			recJE.selectNewLineItem(FLD_LINE);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stCreditTmp);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'credit', flAccrualAmount);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', arrBuf[ii].entity);
     
         			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
         			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
         			recJE.commitLineItem(FLD_LINE);
         			
         			intCurCount = recJE.getLineItemCount(FLD_LINE);
         			
         			if(intCurCount >= 1000){
	         			log('DEBUG', stLogTitle, "#1 " + intCurCount);
            			var intJe = nlapiSubmitRecord(recJE, true, true);
            			log('DEBUG', stLogTitle, "#1 intJe: " + intJe);
            			arrJE.push(intJe);
            			recJE = null;
            			recJE = createNewJe(recJE);
            			intCurCount = 0;
         			}
    			}
    			
    			try{
                	doYield();
                }catch(e){
                	log('debug',stLogTitle,e);
                }
    		}
		}
		
		if(!isEmpty(recJE)){
 			var intCurCount = recJE.getLineItemCount(FLD_LINE);
 			log('DEBUG', stLogTitle, "#3 " + intCurCount);
 			if(intCurCount > 0){
    			var intJe = nlapiSubmitRecord(recJE, true, true);
    			arrJE.push(intJe);
    			recJE = null;
    			intCurCount = 0;
    			HC_JE_SUCCESS_CNT++;
 			}
    		
		}
		
    	arrAccrualFld.push(FLD_ACCRUAL_GENERATE_ERROR_LOG);
    	arrAccrualVal.push("");
    	stJEError = '';
    	
    	arrAccrualFld.push(FLD_ACCRUAL_AMOUNT);
    	arrAccrualVal.push(flRunningTotalAccrualAmt);
	}catch(e){
		stIsGenerating = 'F';
		log('DEBUG', stLogTitle, e);
       	arrAccrualFld.push(FLD_ACCRUAL_GENERATE_ERROR_LOG);
    	arrAccrualVal.push(e.toString());
    	stJEError = e.toString();
    	
    	try{
            var records = {};
            records['record'] = param.idAccrualRec;
            records['recordtype'] = REC_ACCRUAL;
            var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, param.idAccrualRec, "VIEW");
            var stRAURL = nlapiResolveURL("RECORD", REC_REBATE_AGREEMENT, param.rebateAgreement, "VIEW");
            HC_JE_ERROR.push('Agreement: <a href="'+stRAURL+'">'+param.raName+'</a> | Accrual #: <a href="'+stcglsuburl+'">'+param.idAccrualRec+'</a> | Error: ' + e.toString());
//            var stErrorSubject = "ERROR: In Generating JE For Accrual #" + param.idAccrualRec;
//            var stErrorBody = e.toString() + '<br/><br/>Please Check this <a href="' + stcglsuburl +'">Accrual #'+ param.idAccrualRec + ' </a>';
//			nlapiSendEmail(param.user, param.user, stErrorSubject ,stErrorBody, null, null, records);
	       	arrAccrualFld.push(FLD_ACCRUAL_STATUS);
        	arrAccrualVal.push(HC_ACCRUAL_STATUS.error);
		}catch(e2){
			log('DEBUG', stLogTitle + " ERROR IN EMAIL SENDING", e2);
		}
	}
	
	if(!isEmpty(arrJE)){
		arrAccrualFld.push(FLD_ACCRUAL_TRANSACTION);
    	arrAccrualVal.push(arrJE);
    	
    	try{
    		var records = {};
            records['record'] = param.idAccrualRec;
            records['recordtype'] = REC_ACCRUAL;

            var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, param.idAccrualRec, "VIEW");
            var stRAURL = nlapiResolveURL("RECORD", REC_REBATE_AGREEMENT, param.rebateAgreement, "VIEW");
            HC_JE_SUCCESS.push('Agreement: <a href="'+stRAURL+'">'+param.raName+'</a> | Accrual #: <a href="'+stcglsuburl+'">'+param.idAccrualRec+'</a>');
            
//            var stcglurl = stcglsuburl;
//            var stSubject = "Accrual JE Generation Completed for Accrual #${accrual.id}";
//            var stMsg =  'Please click the link to view the <a href="${accrual.url}">Accrual #${accrual.id}</a>';
//            
//            stSubject = isEmpty(param.emailSubject)? stSubject : param.emailSubject;
//            stMsg = isEmpty(param.emailBody)? stMsg : param.emailBody;
//            
//            var renderer = nlapiCreateTemplateRenderer();
//            renderer.setTemplate(stMsg);
//            recAccrual.setFieldValue("url", stcglurl);
//            renderer.addRecord("accrual", recAccrual);
//            stMsg = renderer.renderToString();
//            
//            vrenderer = nlapiCreateTemplateRenderer();
//            renderer.setTemplate(stSubject);
//            recAccrual.setFieldValue("url", stcglurl);
//            renderer.addRecord("accrual", recAccrual);
//            stSubject = renderer.renderToString();
//            
//            var deentitize = function(str) {
//            	var ret = str;
//                ret = ret.replace(/&gt;/g, '>');
//                ret = ret.replace(/&lt;/g, '<');
//                ret = ret.replace(/&quot;/g, '"');
//                ret = ret.replace(/&apos;/g, "'");
//                ret = ret.replace(/&amp;/g, '&');
//                return ret;
//            };
//            stSubject = deentitize(stSubject);
//            stMsg = deentitize(stMsg);
//            
//        
//            nlapiSendEmail(param.user, param.user, stSubject,stMsg, null, null, records);
    	}catch(e){
        	log("DEBUG", stLogTitle,"ERROR IN SENDING EMAIL:" + e);
        }
	}else{
		if(isEmpty(stJEError)){//if(isEmpty(recAccrual.getFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
			try{
	            var records = {};
	            records['record'] = param.idAccrualRec;
	            records['recordtype'] = REC_ACCRUAL;
	            var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, param.idAccrualRec, "VIEW");
	            var stRAURL = nlapiResolveURL("RECORD", REC_REBATE_AGREEMENT, param.rebateAgreement, "VIEW");
	            HC_JE_ERROR.push('Agreement: <a href="'+stRAURL+'">'+param.raName+'</a> | Accrual #: <a href="'+stcglsuburl+'">'+param.idAccrualRec+'</a>');
	            
//	            var stErrorSubject = "Accrual JE Not Generated for Accrual #" + param.idAccrualRec;
//	            var stErrorBody = 'No accrual journal entry was generated – might be no Rebate Transaction Details (RTDs) to process or zero (0.00) accrual amount of all the RTDs or accruals might have been processed previously.'; 
//	            stErrorBody += '<br/><br/>Please click the link to view the <a href="' + stcglsuburl +'">Accrual #'+ param.idAccrualRec + ' </a>';
//				nlapiSendEmail(param.user, param.user, stErrorSubject ,stErrorBody, null, null, records);
				
			}catch(e2){
				log('DEBUG', stLogTitle + " ERROR IN EMAIL SENDING", e2);
			}
		}
	}
	
	if(isEmpty(stJEError)){//if(isEmpty(recAccrual.getFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
       	arrAccrualFld.push(FLD_ACCRUAL_STATUS);
    	arrAccrualVal.push(HC_ACCRUAL_STATUS.complete);
	}
	
	arrAccrualFld.push(FLD_ACCRUAL_ISGENERATE);
	arrAccrualVal.push(stIsGenerating);
	
	//nlapiSubmitRecord(recAccrual);
	nlapiSubmitField(REC_ACCRUAL, param.idAccrualRec, arrAccrualFld, arrAccrualVal);
	
	arrAccrualFld = null;
	arrAccrualVal = null;
	recAccrual = null;
	doYield();
}

function rtdComponent(result){
	//result =  nlobjSearchResult;
	
	var stRa = result.getValue(FLD_CUSTRECORD_TRANS_AGREEMENT,null,"GROUP");
	var flAccruAmt = result.getValue(FLD_CUSTRECORD_ACCRUAL_AMO,null,"SUM");
	var stCustomer = result.getValue(FLD_REBATE_TRAN_DETAIL_CUSTOMER,null,"GROUP");
	var stVendor = result.getValue(FLD_REBATE_TRAN_DETAIL_VENDOR,null,"GROUP");
	var stCustomerTxt = result.getText(FLD_REBATE_TRAN_DETAIL_CUSTOMER,null,"GROUP");
	var stVendorTxt = result.getText(FLD_REBATE_TRAN_DETAIL_VENDOR,null,"GROUP");
	
	var stDept = result.getValue(FLD_REBATE_TRAN_DEPARTMENT, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');
	var stClass = result.getValue(FLD_REBATE_TRAN_CLASS, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');
	var stLoc = result.getValue(FLD_REBATE_TRAN_LOCATION, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');

	
	var entity = stVendor;
	var entityName = stVendorTxt;
	if(isEmpty(entity)){
		entity = stCustomer;
		entityName = stCustomerTxt;
	}

	
	flAccruAmt = isEmpty(flAccruAmt)? 0 : toFixed(parseFloat(flAccruAmt),2);
	
	return {
		ra: stRa,
		accrualAmount: flAccruAmt,
		vendor: stVendor,
		customer: stCustomer,
		entity: entity,
		entityName: entityName,
		department: stDept,
		class: stClass,
		location: stLoc
	}
}

function addHours(date, time) {
   date.setTime(date.getTime() + (parseInt(time)*60*60*1000));
   date.setMinutes(date.getMinutes() + (Number((time-parseInt(time)).toFixed(2)) * 60));
   return date;   
}