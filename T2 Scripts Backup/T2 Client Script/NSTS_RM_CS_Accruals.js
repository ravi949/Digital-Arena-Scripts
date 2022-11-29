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
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jun 2015     pdeleon   Initial version.
 * 
 */

var STTYPE = '';


function accruals_clientPageInit(type){
	STTYPE = type
	
	/*if(STTYPE == HC_MODE_TYPE.Edit){
		if(!isEmpty(nlapiGetFieldValues(FLD_ACCRUAL_TRANSACTION))){
			alert("You are about to EDIT/DELETE the record with accrual transaction/s, please check the transaction/s for your action.");
		}
	}*/

	buttonState();
	
}

function buttonState(){
	var stRAType = nlapiGetFieldValue(FLD_ACCRUAL_REBATE_TYPE);
	
	nlapiSetFieldMandatory(FLD_ACCRUAL_EXPENSE,false);
	nlapiSetFieldMandatory(FLD_ACCRUAL_PAYABLE,false);
	nlapiSetFieldMandatory(FLD_ACCRUAL_RECEIVABLE,false);
	
	nlapiDisableField(FLD_ACCRUAL_EXPENSE,false);
	nlapiDisableField(FLD_ACCRUAL_PAYABLE,false);
	nlapiDisableField(FLD_ACCRUAL_RECEIVABLE,false);
	
	if(stRAType == HC_REB_TYPE.CustReb){
		nlapiSetFieldMandatory(FLD_ACCRUAL_EXPENSE,true);
		nlapiSetFieldMandatory(FLD_ACCRUAL_PAYABLE,true);
		nlapiDisableField(FLD_ACCRUAL_RECEIVABLE, true);
	}else{
		nlapiSetFieldMandatory(FLD_ACCRUAL_EXPENSE,true);
		nlapiSetFieldMandatory(FLD_ACCRUAL_RECEIVABLE,true);
		nlapiDisableField(FLD_ACCRUAL_PAYABLE, true);
	}
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function accruals_clientSaveRecord(){    
	var stRAType = nlapiGetFieldValue(FLD_ACCRUAL_REBATE_TYPE);
	
	var stAccruExpense = nlapiGetFieldValue(FLD_ACCRUAL_EXPENSE);
	var stAccruPayable = nlapiGetFieldValue(FLD_ACCRUAL_PAYABLE);
	var stAccruReceivable = nlapiGetFieldValue(FLD_ACCRUAL_RECEIVABLE);
	var stAccrualDate = nlapiGetFieldValue(FLD_ACCRUAL_DATE);
	
	var stAccrualSDate = nlapiGetFieldValue(FLD_ACCRUAL_TRAN_START_DATE);
	var stAccrualEDate = nlapiGetFieldValue(FLD_ACCRUAL_TRAN_END_DATE);
	
	var arrErr = [];
	var isError = false
	
	if(isEmpty(nlapiGetFieldValue(FLD_ACCRUAL_RA))){
		arrErr.push("Rebate Agreement");
		isError = true
		//return false;
	}
	
	if(isEmpty(stAccrualDate)){
		arrErr.push("Accrual Date");
		isError = true
	}
	
	if(isEmpty(stAccrualSDate)){
		arrErr.push("Transaction Start Date");
		isError = true
	}
	
	if(isEmpty(stAccrualEDate)){
		arrErr.push("Transaction End Date");
		isError = true
	}
	
	if(stRAType == HC_REB_TYPE.CustReb){
		if(isEmpty(stAccruExpense)){
			arrErr.push("Accrued Expense/Income");
			isError = true
		}
		if(isEmpty(stAccruPayable)){
			arrErr.push("Accrued Payable");
			isError = true
		}
		
	}else{
		if(isEmpty(stAccruExpense)){
			arrErr.push("Accrued Expense/Income");
			isError = true
		}
		if(isEmpty(stAccruReceivable)){
			arrErr.push("Accrued Receivable");
			isError = true
		}
	}
    
	var isHasOverLapp = isOverLappingAccrual(nlapiGetFieldValue(FLD_ACCRUAL_RA),nlapiGetRecordId());
	if(isHasOverLapp == true){
		isError = true
		alert("You cannot Create or Edit the Accruals with the same RA that has a pending background process.");
		return false;
		//arrErr.push("You cannot Create or Edit the Accruals with the same RA that has a pending background process");
	}
	
	if(isError == true){
		alert("Please enter value(s) for: " + arrErr.join(", "));
	    return false;
	}
	
//	if(STTYPE == "create"){
//		var bToCreate = confirm("You are about to create accrual transaction, please confirm if you want to proceed and wait for an email for the result.");
//		return bToCreate;
//	
//	}
	
	
    return true;
}


/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {Void}
 */
function accruals_clientFieldchanged(type, name, linenum) {
    nlapiLogExecution('debug', 'field change name', name);

    if(name == FLD_ACCRUAL_RA){
        buttonState();
    }else if (name == FLD_ACCRUAL_DATE) {
        var stServerDate = nlapiGetFieldValue(FLD_ACCRUAL_DATE);
        
        var objPeriod = getAccountingPeriodObject(stServerDate);
        nlapiSetFieldValue(FLD_ACCRUAL_PERIOD,objPeriod.id);
        
        nlapiSetFieldValue(FLD_ACCRUAL_TRAN_START_DATE,objPeriod.startdate);
        nlapiSetFieldValue(FLD_ACCRUAL_TRAN_END_DATE,objPeriod.enddate);
        
    }else if (name == FLD_ACCRUAL_ISGENERATE){
    	if(STTYPE == "edit" && nlapiGetFieldValue(FLD_ACCRUAL_ISGENERATE) == "T"){
    		nlapiSetFieldValue(FLD_ACCRUAL_STATUS,HC_ACCRUAL_STATUS.reprocessing);
    	
    	}
    }
}


function accruals_clientValidateField(type, name, linenum) {
	if(name == FLD_ACCRUAL_RA){

	}

	return true;
}

/**
 * For scripts that require item information to be sourced first, such as rebate calculations
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @return {void}
 */
function accruals_clientPostSourcing(type, name) {
	if(name == FLD_ACCRUAL_RA){
		 buttonState();
	}
}

/**
 * Check if the Accrual has a overlapping record that is still on Background process
 * @param ra
 * @param accrualId
 * @returns
 */
function isOverLappingAccrual(ra,accrualId){
	
	if(isEmpty(ra)){
		return false;
	}
	
	var aarrFil = [new nlobjSearchFilter("custrecord_nsts_rm_accru_ra", null, 'anyof', [ra])]
	aarrFil.push(new nlobjSearchFilter("isinactive", null, 'is', 'F' ));
	
	if(nlapiGetFieldValue(FLD_ACCRUAL_STATUS) == HC_ACCRUAL_STATUS.reprocessing){ 
		return false
	}
	var arrRes = nlapiSearchRecord(null, 'customsearch_nsts_rm_ss_ovrlapping_accru', aarrFil,null);
	
	return isEmpty(arrRes)? false: true
}

/**
 * Generate Accrual JE for record
 * @returns
 */
function generateJE() {
	if (confirm("You are about to create accrual transaction, please confirm if you want to proceed and wait for an email for the result.")) {
		nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), FLD_ACCRUAL_ISGENERATE, 'T');
		
		window.location.reload();
	}
}