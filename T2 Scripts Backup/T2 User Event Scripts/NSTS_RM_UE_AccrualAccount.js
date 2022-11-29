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
 * Also includes server side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 May 2017     pdeleon   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * SERVER SIDE FUNCTIONS
 * ====================================================================
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
function procAccrualAccount_BeforeLoad(type, form, request) {
	if (type != HC_MODE_TYPE.View) {
		var stRebateType = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE);
		var bAccrue = nlapiGetFieldValue(FLD_ACCRUAL_ACCOUNT_FLAG);
		
		if (bAccrue == 'T') {
			if (isEmpty(stRebateType)) {
				nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
				nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
				nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
			} else if (stRebateType != HC_REBATE_TYPE.Customer_Rebate) {
				nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
			} else {
				nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
			}
		} else {
			nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
			nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
			nlapiGetField(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
		}
	}
}

function procAccrualAccount_BeforeSubmit(type) {
	var arrMsg = [];
	if (type != HC_MODE_TYPE.Delete) {
		var idRec = nlapiGetRecordId();
		var recNewRec = nlapiGetNewRecord();
		var stRebateType = recNewRec.getFieldValue(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE);
		
		if (checkHasDuplicate(idRec, stRebateType)) {
			arrMsg.push('The Accrual Account set-up already exists for the Rebate Type. Please check and try again.');
		}
		
		if (isEmpty(arrMsg)) {
			var bAccrue = recNewRec.getFieldValue(FLD_ACCRUAL_ACCOUNT_FLAG);
			var stAccrueExpense = recNewRec.getFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE);
			var stAccruePayable = recNewRec.getFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE);
			var stAccrueReceivable = recNewRec.getFieldValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE);
			
			arrMsg = validateAccrualAccounts(stRebateType, bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable);
		}
	}
	
	if (!isEmpty(arrMsg)) {
		throw nlapiCreateError('Error', arrMsg.join('</br>') , true);
	}
}