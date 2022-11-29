/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * This script is used for disabling, enabling and hiding of fields.
 * Also includes client side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 May 2017     pdeleon   Initial version
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * CLIENT SIDE FUNCTIONS
 * ====================================================================
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function disableEnable_FieldChanged(type, name, linenum) {
	if (name == FLD_ACCRUAL_ACCOUNT_FLAG) {
		if (nlapiGetFieldValue(name) == 'T') {
			enableDisableFields();
		} else {
			nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, '');
			nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, '');
			nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, '');

			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, true);
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, true);
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, true);
		}
	} else if (name == FLD_ACCRUAL_ACCOUNT_REBATE_TYPE) {
		enableDisableFields();
	}
}

function enableDisableFields() {
	var stRebateType = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE);
	var bAccrue = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_FLAG);
	
	if (bAccrue == 'T' && !isEmpty(stRebateType)) {
		nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, false);
		
		if (stRebateType != HC_REBATE_TYPE.Customer_Rebate) {
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, false);
			
			nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, '');
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, true);
		} else {
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, false);
			
			nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, '');
			nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, true);
		}
	} else {
		nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, '');
		nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, '');
		nlapiSetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, '');
		
		nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE, true);
		nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE, true);
		nlapiDisableField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE, true);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function validateFields_SaveRecord() {
	var bReturn = true;
	var arrMsg = [];
	
	var idRec = nlapiGetRecordId();
	var stRebateType = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE);
	
	if (checkHasDuplicate(idRec, stRebateType)) {
		arrMsg.push('The Accrual Account set-up already exists for the Rebate Type. Please check and try again.');
	}
	
	if (isEmpty(arrMsg)) {
		var bAccrue = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_FLAG);
		var stAccrueExpense = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE);
		var stAccruePayable = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE);
		var stAccrueReceivable = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE);
		
		arrMsg = validateAccrualAccounts(stRebateType, bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable);
	}
	
	if (!isEmpty(arrMsg)) {
		alert(arrMsg.join('\n'));
		bReturn =  false;
	}
	
	return bReturn;
}