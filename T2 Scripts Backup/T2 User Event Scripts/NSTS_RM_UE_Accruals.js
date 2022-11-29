/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jul 2017     dgeronimo
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */

var HC_OBJ_FEATURE = new objFeature();
function accrual_userEventBeforeLoad(type, form, request){
	var stLogTitle = "LOCKREVERSAL_USEREVENTBEFORELOAD";
    var context = nlapiGetContext();
    var objExecution = context.getExecutionContext();
    var stAccrualDate = nlapiGetFieldValue(FLD_ACCRUAL_DATE);
    var stRebateAgreement = nlapiGetFieldValue(FLD_ACCRUAL_RA);
    /*var arrRMAdmin = context.getSetting("script", 'custscript_nsts_rm_admins'); 
    arrRMAdmin = isEmpty(arrRMAdmin)? []: arrRMAdmin.split(',');*/
    
    //Condition added to avoid using the server date
    var stServerDate = (objExecution == HC_EXECUTION_CONTEXT.scheduled && !isEmpty(stAccrualDate)) ? stAccrualDate : nlapiDateToString(new Date());
    //nlapiSetFieldValue(FLD_ACCRUAL_DATE,stServerDate);
    
    try{
    	//hide accrual and currency field

        if (HC_OBJ_FEATURE.bMultiCurrency != true) 
            nlapiGetField(FLD_ACCRUAL_CURRENCY).setDisplayType(HC_DISPLAY_TYPE.Hidden);
        

        if (HC_OBJ_FEATURE.blnOneWorld != true) 
            nlapiGetField(FLD_ACCRUAL_SUBSIDIARY).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }catch(err){
    	nlapiLogExecution('error','err in hiding currency and subsidiary fields',err.toString());
    }
    if(type == HC_MODE_TYPE.Create){
        
        var onjSearch = nlapiLoadSearch(null, SS_ACCRUAL_DEFAULT_SEARCH);
        var objPeriod = getAccountingPeriodObject(nlapiStringToDate(stServerDate));
        nlapiSetFieldValue(FLD_ACCRUAL_SERVER_DATE,stServerDate);
        nlapiSetFieldValue(FLD_ACCRUAL_DEFAULT_SEARCH,onjSearch.getId());
        nlapiSetFieldValue(FLD_ACCRUAL_PERIOD,objPeriod.id);
        
        if(objExecution != HC_EXECUTION_CONTEXT.scheduled){
        	if(!isEmpty(stRebateAgreement)){
        		var objRebateAgreement = nlapiLookupField(REC_REBATE_AGREEMENT,stRebateAgreement,[FLD_CUSTRECORD_ACCRUE_AMOUNTS, FLD_CUSTRECORD_REMITTANCE_TYPE]);
        		nlapiLogExecution('debug', 'ralookup', objRebateAgreement[FLD_CUSTRECORD_ACCRUE_AMOUNTS] + '|' + objRebateAgreement[FLD_CUSTRECORD_REMITTANCE_TYPE]);
        		
        		if(objRebateAgreement[FLD_CUSTRECORD_ACCRUE_AMOUNTS] == 'F' || (objRebateAgreement[FLD_CUSTRECORD_REMITTANCE_TYPE]) == HC_REMIT_TYPE.None){
        			throw nlapiCreateError('Error', 'Accrual cannot be created if Rebate Agreement has Process Accrual unchecked or Remittance Type is None.', true);
        		}
        	}
        	
        	
        	//Only set tran dates if accrual is created manually
        	nlapiSetFieldValue(FLD_ACCRUAL_TRAN_START_DATE,objPeriod.startdate);
        	nlapiSetFieldValue(FLD_ACCRUAL_TRAN_END_DATE,objPeriod.enddate);
          
            //nlapiLogExecution('debug', 'date', new Date() +' | '+new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        }
        
        nlapiSetFieldValue(FLD_ACCRUAL_STATUS, HC_ACCRUAL_STATUS.pending);
    }else if(type == HC_MODE_TYPE.Edit){
   
    	
    	if(!isEmpty(nlapiGetFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
    		nlapiGetField(FLD_ACCRUAL_RA).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_DATE).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_ISGENERATE).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_TRAN_START_DATE).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_TRAN_END_DATE).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		
    		nlapiGetField(FLD_ACCRUAL_POST_BY_DEPARTMENT).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_POST_BY_CLASS).setDisplayType(HC_DISPLAY_TYPE.Inline);
    		nlapiGetField(FLD_ACCRUAL_POST_BY_LOCATION).setDisplayType(HC_DISPLAY_TYPE.Inline);
    	}else{
    	 	try{
            	var arrFld = form.getAllFields(); //onjNewRec.getAllFields();
            	if(isEmpty(arrFld)){
            		arrFld = [];
            	}
            	log("DEBUG", "arrFld", JSON.stringify(arrFld));
            	for(var i in arrFld){
            		try{
                		var stFld = arrFld[i];
                		nlapiGetField(stFld).setDisplayType(HC_DISPLAY_TYPE.Inline);
            		}catch(e){
            			log("DEBUG", "arrFld Error",e);
            		}
            	}
        	}catch(e){}
        	
        	
        	var arrAccrualTran = nlapiGetFieldValues(FLD_ACCRUAL_TRANSACTION);
        	if(isEmpty(arrAccrualTran)){
        		nlapiGetField(FLD_ACCRUAL_ISGENERATE).setDisplayType(HC_DISPLAY_TYPE.Normal);
        	}else{
        		var isVoided = isVoidedRejected(arrAccrualTran);
        		if(!isVoided){
        			nlapiGetField(FLD_ACCRUAL_ISGENERATE).setDisplayType(HC_DISPLAY_TYPE.Normal);
        		}
        		
        	}
    	}
    	
    } else if (type == HC_MODE_TYPE.View) {
		var bShowGenerateButton = false;
    	if(nlapiGetFieldValue(FLD_ACCRUAL_STATUS) != HC_ACCRUAL_STATUS.processing){
    		//GET ALL TOTAL JES
    		var intAllJEs = 0;
    		var intAllVoidedJEs = 0;
    		try{
    			var aarrFil = [new nlobjSearchFilter("custbody_nsts_rm_accrual_je", null, 'anyof', [nlapiGetRecordId()])];
    			aarrFil.push(new nlobjSearchFilter("type", null, 'anyof', ["Journal"]));
    			var arrCol = [new nlobjSearchColumn('internalid',null,"GROUP")];
    			var arrRes = nlapiSearchRecord('journalentry', null, aarrFil,arrCol);
    			intAllJEs = arrRes.length;	
    		}catch(err){
    			nlapiLogExecution('debug', 'total  JE', err.toString());
    			intAllJEs = 0;
    		}
    		
    		if(intAllJEs > 0){
    			//GET ALL TOTAL voided JES
        		try{
        			var aarrFil = [new nlobjSearchFilter("custbody_nsts_rm_accrual_je", null, 'anyof', [nlapiGetRecordId()])];
        			aarrFil.push(new nlobjSearchFilter("voided", null, 'is', ["T"]));
        			aarrFil.push(new nlobjSearchFilter("type", null, 'anyof', ["Journal"]));
        			var arrCol = [new nlobjSearchColumn('internalid',null,"GROUP")];
        			var arrRes = nlapiSearchRecord('journalentry', null, aarrFil,arrCol);
        			intAllVoidedJEs = arrRes.length;
        		}catch(err){
        			nlapiLogExecution('debug', 'total voided JE', err.toString());
        			intAllVoidedJEs = 0;
        		}
        		if(intAllJEs == intAllVoidedJEs){
        			bShowGenerateButton = true;
        		}
    		}else{
    			bShowGenerateButton = true;
    		}
    	}
    	if (bShowGenerateButton) {
	        form.setScript(SCRIPT_ACCRUAL_CS);
	        form.addButton(HC_BTN_GENERATE_ACC,'Generate', 'generateJE();');
    	}
    	/**if (nlapiGetFieldValue(FLD_ACCRUAL_ISGENERATE) != 'T' && 
    			nlapiGetFieldValue(FLD_ACCRUAL_STATUS) != HC_ACCRUAL_STATUS.complete &&
    			nlapiGetFieldValue(FLD_ACCRUAL_STATUS) != HC_ACCRUAL_STATUS.processing) {
	        form.setScript(SCRIPT_ACCRUAL_CS);
	        form.addButton(HC_BTN_GENERATE_ACC,'Generate', 'generateJE();');
    	}*/
    }
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function accrual_userEventBeforeSubmit(type){
	var context = nlapiGetContext();
	var stRa = nlapiGetFieldValue(FLD_ACCRUAL_RA);
	
	var objExecution = context.getExecutionContext();
	var stAccrualDate = nlapiGetFieldValue(FLD_ACCRUAL_DATE);
	if(type == HC_MODE_TYPE.Create && objExecution == HC_EXECUTION_CONTEXT.scheduled){
		var objPeriod = getAccountingPeriodObject(nlapiStringToDate(stAccrualDate));
        nlapiSetFieldValue(FLD_ACCRUAL_PERIOD,objPeriod.id);
	}
	
	if(type == HC_MODE_TYPE.Delete){		
		var arrAccrualTran = nlapiGetFieldValues(FLD_ACCRUAL_TRANSACTION);
		if(!isEmpty(arrAccrualTran)){
			var isVoided = isVoidedRejected(arrAccrualTran);
			log("DEBUG","accrual_userEventBeforeSubmit" ,"isVoided:" + isVoided)
			
			if(isVoided){
				throw "You are about to delete this accrual record. Please delete/void the associated accrual journal entries before you continue this action.";				
			}
		}
	}
	
	
	if(!isEmpty(stRa)){
		var recRa = nlapiLoadRecord(REC_REBATE_AGREEMENT, nlapiGetFieldValue(FLD_ACCRUAL_RA))
		nlapiSetFieldValues(FLD_ACCRUAL_CLAIM_TRAN_TYPE, recRa.getFieldValues(FLD_CUSTRECORD_CLAIM_TRANS));
	}
	


	
	var arrParam = [];
	if(context.getExecutionContext() == "userinterface"){
		if(type == HC_MODE_TYPE.Create || type == HC_MODE_TYPE.Edit){
			if(type == HC_MODE_TYPE.Edit && nlapiGetFieldValue(FLD_ACCRUAL_STATUS) == HC_ACCRUAL_STATUS.processing ){
				throw "This Accrual Record is still running on background";
			}
			
			if(isOverLappingAccrual(nlapiGetFieldValue(FLD_ACCRUAL_RA),nlapiGetRecordId())){
				throw "you cannot Create or Edit the Accruals with the same RA that has a pending background process";
			}
						
		}else if(type == HC_MODE_TYPE.Delete){
			if(nlapiGetFieldValue(FLD_ACCRUAL_STATUS) == HC_ACCRUAL_STATUS.processing && nlapiGetFieldValue('isinactive') == "F"){
				throw "This Accrual Record is still running on background";
			}
		}
	}

	
//	if(type == HC_MODE_TYPE.Create){
//		nlapiSetFieldValue(FLD_ACCRUAL_ISGENERATE, "T")
//	}
	
//	if(context.getExecutionContext() == "userinterface"){
//		//if(type == HC_MODE_TYPE.Edit && !isEmpty(nlapiGetFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
//		var stAccruStat = nlapiGetFieldValue(FLD_ACCRUAL_STATUS);
//		if(type == HC_MODE_TYPE.Edit && (stAccruStat == HC_ACCRUAL_STATUS.error || stAccruStat == HC_ACCRUAL_STATUS.reprocessing)){
//			//nlapiSetFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG, "");
//			nlapiSetFieldValue(FLD_ACCRUAL_STATUS, HC_ACCRUAL_STATUS.processing);
//			nlapiSetFieldValue(FLD_ACCRUAL_ISGENERATE, "T")
//		    arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUALS_ID] = parseJsonToString([nlapiGetRecordId()], "[]");
//		    arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRU_USER] = nlapiGetUser();
//		    var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_SS_ACCRUALS, CUSTOMDEPLOY_NSTS_RM_SS_ACCRUALS, arrParam)
//
//		}
//	}
}


function isVoidedRejected(arrAccrualTran){
	arrFil = []
	try{
		var objSearch = nlapiLoadSearch(null, 'customsearch_nsts_rm_ss_voided_accru_je');
		objSearch.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', arrAccrualTran))
		var arrRes = objSearch.runSearch().getResults(0,100);
		return isEmpty(arrRes);
	}catch(e){
		throw "ERROR:" + e.toString() + '<br/><br/>An error Occur on this <a = href= "/app/common/search/search.nl?cu=T&e=T&id=' + objSearch.getId() + '">Search</a> <br/>Please Edit and save the search to adjust the search.'
	}
	
	return false
}


function claimGenLog_AfterSubmit(type) {
	
	var blIsGenerate = nlapiGetFieldValue(FLD_ACCRUAL_ISGENERATE);

	if (blIsGenerate == 'T') {
		createAccrualJE();
	}

	if(type == HC_MODE_TYPE.Delete){
		try{
			var oldRec = nlapiGetOldRecord();
			var stSaveSearch = oldRec.getFieldValue(FLD_ACCRUAL_NEW_SEARCH);
			
			log("DEBUG", "DELETE SEARCH", "stSaveSearch:" + stSaveSearch);
			var objSearch =  nlapiLoadSearch(null,stSaveSearch);
			objSearch.deleteSearch()
		}catch(e){
			log("DEBUG", "ERROR IN DELETE SEARCH",e);
		}
	}
}

/*
 * Call scheduled script to generate JE if flag is marked
 */
function createAccrualJE() {
	var arrParam = [];
	arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUALS_ID] = parseJsonToString([nlapiGetRecordId()], "[]");
    arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRU_USER] = nlapiGetUser();
    var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_SS_ACCRUALS, CUSTOMDEPLOY_NSTS_RM_SS_ACCRUALS, arrParam);

    nlapiSubmitField(REC_ACCRUAL, nlapiGetRecordId(), [FLD_ACCRUAL_STATUS], [HC_ACCRUAL_STATUS.processing]);
}

/**
 * Check if the Accrual has a overlapping record that is still on Background process
 * @param ra
 * @param accrualId
 * @returns
 */
function isOverLappingAccrual(ra,accrualId){
	var aarrFil = [new nlobjSearchFilter("custrecord_nsts_rm_accru_ra", null, 'anyof', [ra])]
	aarrFil.push(new nlobjSearchFilter("isinactive", null, 'is', 'F' ));
	
	/*if(!isEmpty(accrualId)){
		var aarrFil = [new nlobjSearchFilter("internalid", null, 'noneof', [accrualId])]
	}*/
	
	if(nlapiGetFieldValue(FLD_ACCRUAL_STATUS) == HC_ACCRUAL_STATUS.reprocessing){ 
		return false
	}
	
	var arrRes = nlapiSearchRecord(null, 'customsearch_nsts_rm_ss_ovrlapping_accru', aarrFil,null);
	
	return isEmpty(arrRes)? false: true
}