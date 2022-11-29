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
 * This script is used for disabling, enabling and hiding of fields.
 * Also includes client side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Mar 2015     Roxanne Audette   Initial version
 * 
 */

var HC_OBJ_FEATURE = new objFeature();
var arrAccAccts = [];
var bFirstTrigger = false;

/*
 * ====================================================================
 * CLIENT SIDE FUNCTIONS
 * ====================================================================
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function disableEnableCustVen_PageInit(type) {
    var lstRebateStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var stPassThroughType = nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE);
    
    // HIDE SUBSIDIARY IF NON ONE WORLD
    if (HC_OBJ_FEATURE.blnOneWorld != true)
        nlapiSetFieldDisplay(FLD_CUSTRECORD_SUBSIDIARY, false);

    if (type == HC_MODE_TYPE.Create || type == HC_MODE_TYPE.Copy) {
        nlapiSetFieldValue(FLD_CUSTRECORD_STATUS, HC_AGR_STATUS.Unapprove);
        nlapiDisableField(FLD_CUSTRECORD_STATUS, true);
        if (type == HC_MODE_TYPE.Copy) {
            nlapiSetFieldValue(FLD_CUSTRECORD_START_DATE, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_END_DATE, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_AGREEMENT_NAME, '');
            
            var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
            
            if(bIsTiered == 'T'){
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_amt', '');
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_percent', '');
                
                nlapiDisableField('custrecord_nsts_rm_tier_type', false);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', true);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', true);
            }else{
                nlapiSetFieldValue('custrecord_nsts_rm_tier_type', '');
                
                nlapiDisableField('custrecord_nsts_rm_tier_type', true);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', false);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', false);
            }
        }
    }
    if (type == HC_MODE_TYPE.Edit) {
        nlapiCancelLineItem(SBL_REBATE_DETAIL);
        if (lstRebateStatus != HC_AGR_STATUS.Unapprove)
            nlapiDisableField(FLD_CUSTRECORD_TYPE, true);
        
        if (nlapiGetFieldValue(FLD_CUSTRECORD_IS_CLASS) == 'T') {
        	nlapiDisableLineItemField(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEMS, true);
        } else {
        	nlapiDisableLineItemField(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEM_CLASSIFICATION, true);
        }
    }
    
    if(lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_TYPE, true);
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_PERC, true);
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_VAL, true);
    }else{
    	nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_PERC, true);
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_VAL, true);
        
        if(stPassThroughType == HC_PASS_THROUGH_TYPE.Percent){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL, '');
        	nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_PERC, false);
        }else if(stPassThroughType == HC_PASS_THROUGH_TYPE.Value){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC, '');
        	nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_VAL, false);
        }else if(isEmpty(stPassThroughType)){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC, '');
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function validateFields_SaveRecord() {
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var lstRemittanceType = nlapiGetFieldValue(FLD_CUSTRECORD_REMITTANCE_TYPE);
    var lstClaimItem = nlapiGetFieldValue(FLD_CUSTRECORD_CLAIM_ITEM);
    var lstCredit = nlapiGetFieldValue(FLD_CUSTRECORD_CREDIT_ENTITY);
    var lstPayable = nlapiGetFieldValue(FLD_CUSTRECORD_PAYABLE);
    var lstRefund = nlapiGetFieldValue(FLD_CUSTRECORD_REFUND_ENTITY);
    var lstReceivable = nlapiGetFieldValue(FLD_CUSTRECORD_RECEIVABLE);
    var lstClaimRefund = nlapiGetFieldValue(FLD_CUSTRECORD_REFUND_CASH);
    var lstRebateStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
    var lstPrevStatus = nlapiGetFieldValue(FLD_CUSTRECORD_PREV_STATUS);
    var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE);
//    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
//    var idCustSearch =  nlapiGetFieldValue(FLD_CUSTRECORD_CUST_SEARCH);
//    var idVendSearch =  nlapiGetFieldValue(FLD_CUSTRECORD_VENDOR_SEARCH);
    var idAgreement = nlapiGetRecordId();
    var dateAgrStart = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_START_DATE));
    var dateAgrEnd = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_END_DATE));
    var arErrMessage = [];
    var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
    var stTierType = nlapiGetFieldValue('custrecord_nsts_rm_tier_type');
    var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC));
    var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL));
    
    if(!isEmpty(dateAgrStart) && !isEmpty(dateAgrEnd)){
        dateAgrStart.setHours(0, 0, 0, 0); 
        dateAgrEnd.setHours(0, 0, 0, 0); 
        if(dateAgrEnd < dateAgrStart) arErrMessage.push('Agreement End Date can not be earlier than the Agreement Start Date');
    }

    // VALIDATE EMPTY CLAIM FIELDS
    if (lstRebateType == HC_REB_TYPE.RebPurchase
        || lstRebateType == HC_REB_TYPE.RebSale) {
        if (lstRemittanceType == HC_REM_TYPE.Credit
            && (isEmpty(lstCredit) || isEmpty(lstPayable) || isEmpty(lstClaimItem))) {
            arErrMessage.push('The Claim Item, Credit Entity and Claim Payable account must be specified.');
        } else if (lstRemittanceType == HC_REM_TYPE.Refund
                   && (isEmpty(lstRefund) || isEmpty(lstReceivable) || isEmpty(lstClaimItem))) {
            arErrMessage.push('The Claim Item, Refund Entity and Claim Receivable must be specified.');
        }
    } else if (lstRebateType == HC_REB_TYPE.CustReb) {
        if (lstRemittanceType != HC_REM_TYPE.None
            && (isEmpty(lstReceivable) || isEmpty(lstClaimItem))) {
            arErrMessage.push('Claim Item and Claim Receivable must be specified.');
        }
        if (lstRemittanceType == HC_REM_TYPE.Refund && isEmpty(lstClaimRefund)) {
            arErrMessage.push('Claim Refund Cash must be specified.');
        }
    }
    
    //VALIDATE SEARCH FIELDS
//    if (bIncludeAll != 'T') {
//        if (lstRebateType != HC_REB_TYPE.RebPurchase && isEmpty(idCustSearch)) { 
//            arErrMessage.push('Customer Search must be specified.');
//        } else if(lstRebateType == HC_REB_TYPE.RebPurchase && isEmpty(idVendSearch)){
//            arErrMessage.push('Vendor Search must be specified.');
//        }
//    }

    // VALIDATE CLAIM TRANSACTION
    var lstClaimTrans = nlapiGetFieldTexts(FLD_CUSTRECORD_CLAIM_TRANS);
    if(isEmpty(lstClaimTrans) && lstRemittanceType != HC_REM_TYPE.None
            && !isEmpty(lstRemittanceType)){
        arErrMessage.push('Claim Transaction must be specified.');
    }else{
        var stRebateType = nlapiGetFieldText(FLD_CUSTRECORD_TYPE);
        var arAcceptedTrans = [];
        if (lstRebateType == HC_REB_TYPE.RebPurchase)
            arAcceptedTrans.push('Bill', 'Vendor Return Authorization',
                    'Item Receipt', 'Bill Credit', 'Purchase Order');
        if(lstRebateType == HC_REB_TYPE.RebSale || 
                lstRebateType == HC_REB_TYPE.CustReb){
             arAcceptedTrans.push('Estimate', 'Sales Order', 'Item Fulfillment',
                    'Invoice', 'Cash Sale', 'Cash Refund', 'Credit Memo', 'Return Authorization');
             if(lstRebateType == HC_REB_TYPE.RebSale)
                 arAcceptedTrans.push('Work Order', 'Assembly Build', 'Assembly Unbuild');
        }
           
        /*if (lstRebateType == HC_REB_TYPE.RebSale)
            arAcceptedTrans.push('Invoice', 'Return Authorization',
                    'Credit Memo', 'Item Fulfillment', 'Work Order',
                    'Assembly Build', 'Assembly Unbuild', 'Quote',
                    'Sales Order', 'Cash Sale');
        if (lstRebateType == HC_REB_TYPE.CustReb)
            arAcceptedTrans.push('Invoice', 'Cash Sale', 'Credit Memo',
                    'Return Authorization', 'Cash Refund', 'Quote',
                    'Sales Order', 'Item Fulfillment');*/

        var arUnacceptedTrans = [];
        if (!isEmpty(lstClaimTrans)) {
            for (var i = 0; i < lstClaimTrans.length; i++) {
                if (arAcceptedTrans.indexOf(lstClaimTrans[i]) == -1) {
                    arUnacceptedTrans.push(lstClaimTrans[i]);
                }
            }
            if (arUnacceptedTrans.length > 0) {
                arErrMessage.push('Invalid Transaction Types for Rebate Type '
                        + stRebateType + ': ' + arUnacceptedTrans.toString());
            }
        }
    }
    
    //VALIDATE SEARCH VALUES IN THE DETAIL SUBLIST
    /*if(lstRebateStatus == HC_AGR_STATUS.Approve){
        var arDetailSearchVal = validateDetailSearchValues(SBL_REBATE_DETAIL);
        if(arDetailSearchVal.length > 0){
            alert(arDetailSearchVal.join('\n'));
            return false;
        }
    }*/
    
    if (!isEmpty(idAgreement)) {
        if(!isEmpty(checkAssociatedRebTrans(idAgreement))){
            if((lstRebateStatus == HC_AGR_STATUS.Unapprove && (lstPrevStatus == HC_AGR_STATUS.Closed 
                    || lstPrevStatus == HC_AGR_STATUS.Approve))){
                arErrMessage.push('There are Rebate Transaction Detail records associated'
                        + ' with this Rebate Agreement, so it can not be updated.');
            }else if(lstRebateStatus == HC_AGR_STATUS.Approve){
              //VALIDATE START AND END AGREEMENT DATE
                var dateToday = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_CURRENT_DATE));
                var dateAgrPrevStart = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_PREV_START_DATE));
                var dateAgrPrevEnd = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_PREV_END_DATE));
             
                if(!isEmpty(dateAgrStart) && !isEmpty(dateAgrEnd)){
                    dateAgrStart.setHours(0, 0, 0, 0); dateAgrPrevStart.setHours(0, 0, 0, 0);
                    dateAgrEnd.setHours(0, 0, 0, 0); dateAgrPrevEnd.setHours(0, 0, 0, 0);
                    if(nlapiDateToString(dateAgrStart) != nlapiDateToString(dateAgrPrevStart) 
                            && dateAgrStart > dateToday)
                        arErrMessage.push('Agreement Start Date can only be backdated');
                    if(nlapiDateToString(dateAgrEnd) != nlapiDateToString(dateAgrPrevEnd)
                            && dateAgrEnd <= dateToday)
                        arErrMessage.push('Agreement End Date can only'
                                +' be set to any day post current date');
                }
            }
        }
    }
    
    if(bIsTiered == 'T' && isEmpty(stTierType))
        arErrMessage.push('Tier Type must be specified.');
    
    //Accrual Accounts validation
    var bAccrue = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS);
    var stAccrueExpense = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES);
    var stAccruePayable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE);
    var stAccrueReceivable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE);
    var stAccrualAccountRef = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
    var arrAccMsg = validateAccrualAccounts(lstRebateType, bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable, stAccrualAccountRef);
    
    if (!isEmpty(arrAccMsg)) {
        if (!isEmpty(arErrMessage)) {
            arErrMessage = arErrMessage.concat(arrAccMsg);
        } else {
            arErrMessage = arrAccMsg;
        }
    }
    
    if(lstRebateType == HC_REB_TYPE.RebSale){
        if(!isEmpty(lstPassThroughType)){
            if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Percent && flPassThroughPerc <= 0)
                arErrMessage.push('Price Pass Through % must be greater than 0.');
            
            if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Value && flPassThroughVal <= 0)
                arErrMessage.push('Price Pass Through Value must be greater than 0.');
        }
    }
    
    //JOIN ERROR MESSAGES
    if(arErrMessage.length > 0){
        alert(arErrMessage.join('\n'));
        return false;
    }else if(lstRebateStatus == HC_AGR_STATUS.Closed){
        return confirm('The Agreement will not be available for Rebate Calculations, Are you sure?');
    }
    
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function disableEnableCustVen_FieldChanged(type, name, linenum) {
    if (!bFirstTrigger) {
        bFirstTrigger = true;
        var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
        var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
        var lstRebateStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
        if (name == FLD_CUSTRECORD_INCLUDE_ALL) {
            //disableCustVendSearch();
            //disableSearchBasedOnRebType();
            disableCustomerVendorLineItem(SBL_REBATE_DETAIL, lstRebateType, bIncludeAll);
        }
        if(name == FLD_CUSTRECORD_START_DATE){
            var dateToday = new Date();
            var dateAgrStart = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_START_DATE));
            dateToday.setHours(0, 0, 0, 0);
            
            if(!isEmpty(dateAgrStart)){
                dateAgrStart.setHours(0, 0, 0, 0);
                
                if(lstRebateStatus == HC_AGR_STATUS.Approve){
                    if(dateAgrStart < dateToday){
                        alert("To calculate rebates on existing rebates after backdating agreements, edit transaction lines or use mass update to set the "
                                + "'Recalculate Rebates' and 'Recalculate in Background' flags on transactions. "
                                + "Both actions will cause the calculation script to execute a search for rebate agreements valid for the date of the transaction.");
                    }
                }
            }
        }
        if (name == FLD_CUSTRECORD_REMITTANCE_TYPE)
            disableSearchBasedOnRemType();
        if (name == FLD_CUSTRECORD_AGREEMENT_NAME)
            validateDuplicateAgrName(FLD_CUSTRECORD_AGREEMENT_NAME);
        
        if (name == FLD_CUSTRECORD_TYPE) {
            //DISABLE ENABLE AGREEMENT HEADER FIELDS
            //disableSearchBasedOnRebType();
            disableSearchBasedOnRemType();
            
            /*SET REBATE TYPE ON AGREEMENT DETAIL SUBLIST ON FIRST LINE ITEM
              AND DISABLE CUSTOMER OR VENDOR BASED ON REBATE TYPE*/
            disableCustomerVendorLineItem(SBL_REBATE_DETAIL, lstRebateType, bIncludeAll);
            //nlapiSelectLineItem(SBL_REBATE_DETAIL, 1);
            //var idItem = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_ITEM);
            //nlapiCancelLineItem(SBL_REBATE_DETAIL);
            /*if(!isEmpty(idItem) || isEmpty(lstRebateType)){
                nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_REB_TYPE, lstRebateType, true);
            }*/
            loadAccrualAccounts();
        }
        if (name == FLD_CUSTRECORD_DET_ITEM){
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_REB_TYPE, lstRebateType);
        }
        if (name == FLD_CUSTRECORD_DET_CALC_METHOD) disableCalcMethodLineFields();
        
        if (name == FLD_CUSTRECORD_CALC_METHOD) {
            var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
            
            if(bIsTiered == 'T'){
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_amt', '');
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_percent', '');
                
                nlapiDisableField('custrecord_nsts_rm_tier_type', false);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', true);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', true);
            }else{
                nlapiSetFieldValue('custrecord_nsts_rm_tier_type', '');
                
                nlapiDisableField('custrecord_nsts_rm_tier_type', true);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', false);
                nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', false);
            }
        }
        
        if (name == FLD_CUSTRECORD_ACCRUE_AMOUNTS) {
            if (nlapiGetFieldValue(name) == 'T') {
                loadAccrualAccounts(true);
            } else {
                enableDisableAccrualFields();
            }
        }
        
        bFirstTrigger = false;
    }
    
    //ENABLE DISABLE SALES PRICE PASS THROUGH FIELDS
    if(name == FLD_REBATE_AGREEMENT_REBATE_TYPE){
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_TYPE, false);
        if(lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC, '');
            nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_TYPE, true);
        }
    }
    
    if(name == FLD_CUSTRECORD_PASS_THROUGH_TYPE){
        var stPassThroughType = nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE);
        
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_PERC, true);
        nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_VAL, true);
        
        if(stPassThroughType == HC_PASS_THROUGH_TYPE.Percent){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL, '');
            nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_PERC, false);
        }else if(stPassThroughType == HC_PASS_THROUGH_TYPE.Value){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC, '');
            nlapiDisableField(FLD_CUSTRECORD_PASS_THROUGH_VAL, false);
        }else if(isEmpty(stPassThroughType)){
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC, '');
        }
    }
    
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @return {void}
 */
function rebateAgreement_PostSourcing(type, name) {
    if(name == FLD_CUSTRECORD_CALC_METHOD){ 
        var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
        if(bIsTiered == 'T'){
            nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_amt', '');
            nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_percent', '');
            
            nlapiDisableField('custrecord_nsts_rm_tier_type', false);
            nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', true);
            nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', true);
        }else{
            nlapiSetFieldValue('custrecord_nsts_rm_tier_type', '');
            
            nlapiDisableField('custrecord_nsts_rm_tier_type', true);
            nlapiDisableField('custrecord_nsts_rm_rebate_cost_amt', false);
            nlapiDisableField('custrecord_nsts_rm_rebate_cost_percent', false);
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function setRebateType_LineInit(type) {
    // NEEDS TO SET THE REBATE TYPE IN THE SUBLIST TO FILTER CALC METHOD
    if (type == SBL_REBATE_DETAIL) {
        var idAgreement = nlapiGetRecordId();
        var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
        var lstAgrStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
        var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
        
        var lstLineRebType = nlapiGetCurrentLineItemValue(type, 
                FLD_CUSTRECORD_DET_REB_TYPE);
        var intLineIndex = nlapiGetCurrentLineItemIndex(type);
        
        
        disableCustomerVendorLineItem(type, lstRebateType, bIncludeAll);
        disableCalcMethodLineFields();
        
        //DISABLE SUBLIST FIELDS WHEN CLOSED
        nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_REB_TYPE, true);
        if (lstAgrStatus == HC_AGR_STATUS.Closed) {
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_VEND, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CUST, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_ITEM, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CALC_METHOD, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_PERCENT, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_AMT, true);
            nlapiDisableLineItemField(type, FLD_REBATE_AGREEMENT_DETAIL_REBATE_COST, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_UOM, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_ITEM_CLASS, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, true);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, true);
        }
        if(isEmpty(lstLineRebType)){
             nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_REB_TYPE,
                lstRebateType);
        }
    } else if (type == SBL_RA_TIER_GROUP) {
        if (lstAgrStatus == HC_AGR_STATUS.Closed) {
            nlapiDisableLineItemField(type, FLD_NAME, true);
            nlapiDisableLineItemField(type, FLD_TIER_GROUP_ITEMS, true);
            nlapiDisableLineItemField(type, FLD_TIER_GROUP_ITEM_CLASSIFICATION, true);
            nlapiDisableLineItemField(type, FLD_TIER_GROUP_AGGREGATE, true);
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function validateAgreementDetail_ValidateLine(type) { 
    var idAgreement = nlapiGetRecordId();
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var idSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
    var idCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
    var lstRebateStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
    
    var bAccrue = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS);
    var stAccrueExpense = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES);
    var stAccruePayable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE);
    var stAccrueReceivable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE);
   
    if (type == SBL_REBATE_DETAIL) {
        var idAgrDetail = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORT_AGR_DET_ID);
        var idItem = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_ITEM);
        var idCustomer = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_CUST);
        var idVendor = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_VEND);
        var idItemClass = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
        var idCustClass = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS);
        var idVendClass = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS);
        var lstCalcMethod = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_CALC_METHOD);
        var lstCostBasis = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_COST_BASIS);
        var flAmount = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_AMT);
        var flPercent = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_PERCENT);
        var flRebCost = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_REBATE_COST);
        var stUom = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORD_DET_UOM);
        var intLineIndex = nlapiGetCurrentLineItemIndex(type);
        var intLineCount = nlapiGetLineItemCount(type);
        var arMandatoryFlds = [], arNotRequiredFlds = [], arAlertMessage = [];
        var intEntity = 0;
        var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
        
        var flPassThroughPerc = forceParseFloat(nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_PASS_THROUGH_PERC));
        var flPassThroughVal = nlapiGetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_PASS_THROUGH_VAL);
        
        if(bIncludeAll != 'T'){
             //intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
             //   : checkEmptyValue(idVendor);
             
             intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
                 (!isEmpty(idCustClass)) ? checkEmptyValue(idCustClass) :
                     (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendClass);
        }
       
        var stConcatCombination = checkEmptyValue(idAgreement) + '_'
                                  + intEligItemEntClass + '_'
                                  + intEntity + '_'
                                  + checkEmptyValue(stUom);
        
        //VALIDATE IF DETAIL HAS TRANSACTION DETAILS
        if(lstRebateStatus == HC_AGR_STATUS.Approve){
            var objTransResults = validateAssociatedTransInDet(idAgreement, idAgrDetail);
            if (!isEmpty(objTransResults)) {
                alert('There are Transaction Details associated with this record. ' 
                        +'Update is not allowed if status is Approved.');
                return false;
            }
        }
        
        //VALIDATE SUBSIDIARY AND CURRENCY
        if(HC_OBJ_FEATURE.blnOneWorld == true && isEmpty(idSubsidiary)) 
            arMandatoryFlds.push('Agreement Subsidiary');
        if (isEmpty(lstRebateType))
            arMandatoryFlds.push('Agreement Rebate Type');
        if(isEmpty(idCurrency) && HC_OBJ_FEATURE.bMultiCurrency)
            arMandatoryFlds.push('Agreement Currency');
        
        if(isEmpty(lstCalcMethod)) arMandatoryFlds.push('Calculation Method');
        
        //ELIGIBLE ITEM
        if(!isEmpty(idItem) && !isEmpty(idItemClass)){ 
            arAlertMessage.push('You may only select either an Item or Item Classification.');
        }else if(isEmpty(idItem) && isEmpty(idItemClass)) {
            arMandatoryFlds.push('Eligible Item or Eligible Item Classification');
        }
        
        //ACCRUAL ACCOUNTS
        if (bAccrue == 'T') {
            if (!isEmpty(lstRebateType)) {
                if (isEmpty(stAccrueExpense)) {
                    arMandatoryFlds.push('Accrued Expense/Income account');
                }
                if (lstRebateType != HC_REBATE_TYPE.Customer_Rebate) {
                    if (!isEmpty(stAccruePayable)) {
                        arNotRequiredFlds.push('Accrued Payable acount');
                    }
                    if (isEmpty(stAccrueReceivable)) {
                        arMandatoryFlds.push('Accrued Receivable account');
                    }
                } else {
                    if (!isEmpty(stAccrueReceivable)) {
                        arNotRequiredFlds.push('Accrued Receivable account');
                    }
                    if (isEmpty(stAccruePayable)) {
                        arMandatoryFlds.push('Accrued Payable account');
                    }
                }
            }
        } else {
            if (!isEmpty(stAccrueExpense)) {
                arNotRequiredFlds.push('Accrued Expense/Income account');
            }
            if (!isEmpty(stAccruePayable)) {
                arNotRequiredFlds.push('Accrued Payable account');
            }
            if (!isEmpty(stAccrueReceivable)) {
                arNotRequiredFlds.push('Accrued Receivable account');
            }
        }
        
        //ELIGIBLE CUSTOMER/VENDOR IN SUBLIST
        if (bIncludeAll != 'T') {
            if (lstRebateType != HC_REB_TYPE.RebPurchase) {
                //if(isEmpty(idCustomer)) arMandatoryFlds.push('Eligible Customer');
                if(!isEmpty(idVendor)) arNotRequiredFlds.push('Eligible Vendor');
                
                //if(isEmpty(idCustClass)) arMandatoryFlds.push('Eligible Customer Classification');
                if(!isEmpty(idVendClass)) arNotRequiredFlds.push('Eligible Vendor Classification');
                
                if(!isEmpty(idCustomer) && !isEmpty(idCustClass)){ 
                    arAlertMessage.push('You may only select either a Customer or Customer Classification.');
                }else if(isEmpty(idCustomer) && isEmpty(idCustClass)){
                    arMandatoryFlds.push('Eligible Customer or Eligible Customer Classification');
                }
            } else if(lstRebateType == HC_REB_TYPE.RebPurchase){
                //if(isEmpty(idVendor))  arMandatoryFlds.push('Eligible Vendor');   
                if(!isEmpty(idCustomer)) arNotRequiredFlds.push('Eligible Customer');
                
                //if(isEmpty(idVendClass))  arMandatoryFlds.push('Eligible Vendor Classification');   
                if(!isEmpty(idCustClass)) arNotRequiredFlds.push('Eligible Customer Classification');
                
                if(!isEmpty(idVendor) && !isEmpty(idVendClass)){ 
                    arAlertMessage.push('You may only select either a Vendor or Vendor Classification.');
                }else if(isEmpty(idVendor) && isEmpty(idVendClass)){
                    arMandatoryFlds.push('Eligible Vendor or Eligible Vendor Classification');
                }
            }
        }else{
            if(!isEmpty(idCustomer)) arNotRequiredFlds.push('Eligible Customer');
            if(!isEmpty(idVendor)) arNotRequiredFlds.push('Eligible Vendor');
            
            if(!isEmpty(idCustClass)) arNotRequiredFlds.push('Eligible Customer Classification');
            if(!isEmpty(idVendClass)) arNotRequiredFlds.push('Eligible Vendor Classification');
        }
        
        if(!isEmpty(lstCalcMethod)){
            var arCalcMethodFlds = [FLD_CUSTRECORD_SHOW_PERCENT, FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_SHOW_REB_COST, FLD_CUSTRECORD_REB_IS_TIERED];
            var objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, lstCalcMethod, arCalcMethodFlds);
            
            //PERCENT/AMOUNT BASED ON THE SELECTED CALC METHOD IN THE SUBLIST
            if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T'
                && objCalcMethodFlds[FLD_CUSTRECORD_REB_IS_TIERED] != 'T'
                && forceParseFloat(flPercent) <= 0) arAlertMessage.push('Rebate Percentage must be greater than 0');
            
            if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T'
                && forceParseFloat(flAmount) <= 0) arAlertMessage.push('Rebate Amount must be greater than 0'); 
              
            if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T' 
                && forceParseFloat(flRebCost) <= 0) arAlertMessage.push('Rebate Cost must be greater than 0');
                
            /*if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T'){
                if(forceParseFloat(flAmount) > 0) arNotRequiredFlds.push('Rebate Amount');
            }else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T'){
                if(forceParseFloat(flPercent) > 0) arNotRequiredFlds.push('Rebate Percentage');
            }
            
            if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] != 'T' 
                && forceParseFloat(flRebCost) > 0) arNotRequiredFlds.push('Rebate Cost');
            else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T' 
                && forceParseFloat(flRebCost) <= 0) arMandatoryFlds.push('Rebate Cost');*/
        }
        
        if(lstRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
            if(flPassThroughPerc > 0 && forceParseFloat(flPassThroughVal) > 0) arAlertMessage.push('You may only input either a Price Pass Through % or Price Pass Through Value');
            
            if(!isEmpty(flPassThroughVal) && forceParseFloat(flPassThroughVal) <= 0) arAlertMessage.push('Price Pass Through Value must be greater than 0');
        }
        
        if (arMandatoryFlds.length > 0) arAlertMessage.push('The following fields must be specified: ' 
                + arMandatoryFlds.toString());
        if(arNotRequiredFlds.length > 0) arAlertMessage.push('The following fields must not be specified: ' 
                + arNotRequiredFlds.toString());
        //if(intLineIndex != 1 && !isEmpty(idAgreement) && stConcatCombination != '0_0_0_0_0_0'){
            if(arAlertMessage.length > 0){
                alert(arAlertMessage.join('\n'));
                return false;
            }
       // }
        
        if (getValueComination(type, idAgreement, lstRebateType,
                stConcatCombination, bIncludeAll, intLineIndex)) {
            alert('There is already an existing record with the same Rebate Detail Combination');
            return false;
        }/*else{
            nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID,
                    stConcatCombination);
        }*/
    } else if (type == SBL_RA_TIER_GROUP) {
		if (isEmpty(nlapiGetCurrentLineItemValue(type, FLD_NAME))) {
			alert('Tier Group Name is required.');
			return false;
		} else if (isEmpty(nlapiGetCurrentLineItemValue(type, FLD_TIER_GROUP_ITEM_CLASSIFICATION)) && 
				nlapiGetFieldValue(FLD_CUSTRECORD_IS_CLASS) == 'T') {
			alert('Item Classification is mandatory.');
			return false;
		} else if (isEmpty(nlapiGetCurrentLineItemValue(type, FLD_TIER_GROUP_ITEMS)) && 
				nlapiGetFieldValue(FLD_CUSTRECORD_IS_CLASS) != 'T') {
			alert('Item is mandatory.');
			return false;
		}
    }
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function agrSubsidiaryCurrency_ValidateField(type, name, linenum) {
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var idSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
    var idCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
    
    if(name == FLD_CUSTRECORD_CREDIT_ENTITY || name == FLD_CUSTRECORD_REFUND_ENTITY
            || name == FLD_CUSTRECORD_RECEIVABLE || name == FLD_CUSTRECORD_PAYABLE
            || name == FLD_CUSTRECORD_REFUND_CASH || name == FLD_CUSTRECORD_CLAIM_ITEM
            /*|| name == FLD_CUSTRECORD_CURRENCY*/){
    	try{

            var stRecord = (name == FLD_CUSTRECORD_CREDIT_ENTITY) ? HC_VENDOR
                    : (name == FLD_CUSTRECORD_REFUND_ENTITY) ? HC_CUSTOMER 
                            : (name == FLD_CUSTRECORD_CLAIM_ITEM) ? REC_ITEM 
                                            : (name == FLD_CUSTRECORD_CURRENCY) ? REC_CURRENCY
                                                    : REC_ACCOUNT;
           
            var arValidateSubCur = validateSubsidiaryCurrency((name == FLD_CUSTRECORD_CURRENCY) ? FLD_CUSTRECORD_SUBSIDIARY : name, 
                    (stRecord == REC_CURRENCY) ? REC_SUBSIDIARY : stRecord,
                    (name != FLD_CUSTRECORD_CREDIT_ENTITY && name != FLD_CUSTRECORD_REFUND_ENTITY
                            && name != FLD_CUSTRECORD_CURRENCY) ? true : false, 
                                    (name == FLD_CUSTRECORD_CURRENCY) ? true : false);
            if (arValidateSubCur.length > 0) {
                alert(arValidateSubCur.join('\n'));
                return false;
            }
    	}catch(err){
    		alert('err: '+JSON.stringify(err))
    	}
    }
    
    //Include validation for item type
    if (name == FLD_CUSTRECORD_CLAIM_ITEM) {
        if (!isEmpty(nlapiGetFieldValue(name))) {
            var stItemType = nlapiLookupField(HC_ITEM, nlapiGetFieldValue(name), FLD_TYPE);
            if (!isEmpty(stItemType) && HC_VALID_CLAIM_ITEM_TYP.indexOf(stItemType) < 0) {
                alert('Claim Item should be a Non-Inventory or Other Charge item');
                return false;
            }
        }
    }
    
    if (name == FLD_CUSTRECORD_TYPE || name == FLD_CUSTRECORD_SUBSIDIARY
            || name == FLD_CUSTRECORD_CURRENCY || name == FLD_CUSTRECORD_INCLUDE_ALL) {
        var intLineCount = nlapiGetLineItemCount(SBL_REBATE_DETAIL);
        if (intLineCount > 0) {
            alert('There are Agreement Details associated with it. Please '
                  + 'delete them first before changing the field.');
            return false;
        }
    }
    
    if(name == FLD_CUSTRECORD_DET_ITEM && isEmpty(lstRebateType)){
        alert('Rebate Type must be specified.');
        return false;
    }
    
    //VALIDATE CUSTOMER/VENDOR SUBLIST FIELD (CURRENCY AND SUBSIDIARY)
    if (name == FLD_CUSTRECORD_DET_VEND
        || name == FLD_CUSTRECORD_DET_CUST) {
        var arMandatoryFlds = [];
        var stEntity = (name == FLD_CUSTRECORD_DET_VEND) ? FLD_CUSTRECORD_DET_VEND
                : FLD_CUSTRECORD_DET_CUST;
        var stRecord = (name == FLD_CUSTRECORD_DET_VEND) ? HC_VENDOR
                : HC_CUSTOMER;
        var idEntityVal = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, stEntity);
        
        if(HC_OBJ_FEATURE.blnOneWorld == true && isEmpty(idSubsidiary)) 
            arMandatoryFlds.push('Subsidiary');
        if (isEmpty(lstRebateType))
            arMandatoryFlds.push('Rebate Type');
        if(isEmpty(idCurrency) && HC_OBJ_FEATURE.bMultiCurrency)
            arMandatoryFlds.push('Currency');
        
        if(arMandatoryFlds.length > 0 && !isEmpty(idEntityVal)){
            alert('Please make sure to select values for the following fields: '
                    + arMandatoryFlds.toString());
            return false;
        }else{ 
            var arValidateSubCurLine = validateSubCurrLineItem(stEntity, stRecord);
            if (arValidateSubCurLine.length > 0) {
                alert(arValidateSubCurLine.join('\n'));
                return false;
            }
        }
    }
    
    //VALIDATE ENTITY/CLASSIFICATION SUBLIST FIELDS
    if (name == FLD_CUSTRECORD_DET_VEND || name == FLD_CUSTRECORD_DET_CUST || name == FLD_CUSTRECORD_DET_ITEM ||
            name == FLD_CUSTRECORD_DET_EL_ITEM_CLASS || name == FLD_CUSTRECORD_DET_EL_CUST_CLASS ||
            name == FLD_CUSTRECORD_DET_EL_VEND_CLASS) {
        var intCurrLineCount = nlapiGetLineItemCount(SBL_REBATE_DETAIL);
        var intCurrIndex = nlapiGetCurrentLineItemIndex(SBL_REBATE_DETAIL);
        
        var stEligItem = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_ITEM);
        var stEligCust = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_CUST);
        var stEligVend = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_VEND);
        
        var stEligItemClass = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
        var stEligCustClass = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_EL_CUST_CLASS);
        var stEligVendClass = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_EL_VEND_CLASS);
        
        var intPrevIndex = intCurrIndex - 1;
        if(intPrevIndex > 0){
            var stPrevLineValue = nlapiGetLineItemValue(SBL_REBATE_DETAIL, name, intPrevIndex);
            var stCurrLineValue = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, name);
            
            if(!isEmpty(stCurrLineValue) && isEmpty(stPrevLineValue)){
                nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, name, '', false);
                alert('The same Eligible field should be populated for the rest of the Agreement Details.');
                return false;
            }
        }
        
        if((name == FLD_CUSTRECORD_DET_ITEM || name == FLD_CUSTRECORD_DET_EL_ITEM_CLASS) && !isEmpty(stEligItem) && !isEmpty(stEligItemClass)){
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, name, '', false);
            alert('You may only select either an Item or Item Classification.');
            return false;
        }
        if((name == FLD_CUSTRECORD_DET_CUST || name == FLD_CUSTRECORD_DET_EL_CUST_CLASS) && !isEmpty(stEligCust) && !isEmpty(stEligCustClass)){
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, name, '', false);
            alert('You may only select either a Customer or Customer Classification.');
            return false;
        }
        if((name == FLD_CUSTRECORD_DET_VEND || name == FLD_CUSTRECORD_DET_EL_VEND_CLASS) && !isEmpty(stEligVend) && !isEmpty(stEligVendClass)){
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, name, '', false);
            alert('You may only select either a Vendor or Vendor Classification.');
            return false;
        }
        
    }
    
    if (type == SBL_RA_TIER_GROUP) {
    	if (name == FLD_TIER_GROUP_ITEMS || name == FLD_TIER_GROUP_ITEM_CLASSIFICATION) {
    		var intTierGroupCount = nlapiGetLineItemCount(SBL_RA_TIER_GROUP);
    		var arrItemEntry = nlapiGetCurrentLineItemValue(SBL_RA_TIER_GROUP, name);
    		var arrItemEntryText = nlapiGetCurrentLineItemTexts(SBL_RA_TIER_GROUP, name);
    		if (!isEmpty(arrItemEntry)) {
				stMsg = (nlapiGetFieldValue(FLD_CUSTRECORD_IS_CLASS) == 'T') ? 'Item Classification ' : 'Item ';
	    		arrItemEntry = arrItemEntry.split(',');

	    		for (var intOutCtr = 0; intOutCtr < arrItemEntryText.length; intOutCtr++) {
	    	    	for (var intCtr = 1; intCtr <= intTierGroupCount; intCtr++) {
	    	    		if (intCtr != linenum) {
	    	    			var arrTGOtherItem = nlapiGetLineItemTexts(SBL_RA_TIER_GROUP, name, intCtr);

	    	    			if (arrTGOtherItem.indexOf(arrItemEntryText[intOutCtr]) >= 0) {
	    	    				alert(stMsg + 'already exists in another Tier Group.');
	    	    				nlapiSetCurrentLineItemValue(SBL_RA_TIER_GROUP, name, nlapiGetLineItemValue(SBL_RA_TIER_GROUP, name, linenum));
	    	    				return false;
	    	    			}
	    	    		}
	    	    	}
	    		}
    		} else if (nlapiGetFieldValue(FLD_CUSTRECORD_IS_CLASS) == 'T') {
    			alert('Item Classification is mandatory.');
    			return false;
    		} else {
    			alert('Item is mandatory.');
				return false;
    		}
    	} else  if (name == FLD_NAME) {
    		var intTierGroupCount = nlapiGetLineItemCount(SBL_RA_TIER_GROUP);
    		var stName = nlapiGetCurrentLineItemValue(SBL_RA_TIER_GROUP, FLD_NAME);
    		
	    	for (var intCtr = 1; intCtr <= intTierGroupCount; intCtr++) {
	    		if (intCtr != linenum) {
	    			var stTGName = nlapiGetLineItemValue(SBL_RA_TIER_GROUP, name, intCtr);
	    			if (stName == stTGName) {
	    				alert('Tier Group Name already exists. Please select another one.');
	    				nlapiSetCurrentLineItemValue(SBL_RA_TIER_GROUP, name, nlapiGetLineItemValue(SBL_RA_TIER_GROUP, name, linenum));
	    				return false;
	    			}
	    		}
	    	}
    	}
    }
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function validateAgreementDetail_ValidateDelete(type) {
    if (type == SBL_REBATE_DETAIL) {
        // VALIDATE AGREEMENT DETAIL IF THERE ARE ASSOCIATED TRANS DETAIL IT. IF
        // SO, SET IT TO INACTIVE ELSE DELETE IT.
        var idAgreement = nlapiGetRecordId();
        var idAgrDetail = nlapiGetCurrentLineItemValue(type,
                FLD_CUSTRECORT_AGR_DET_ID);
       
        var objTransResults = validateAssociatedTransInDet(idAgreement, idAgrDetail);
        
        if (!isEmpty(objTransResults)) {
            /*
             * CHECK CUSTOM INACTIVE FIELD IF THERE ARE RELATED TRANS
             * RECORDS IN THE AGREEMENT. THIS FIELD WILL BE USED IN THE
             * AFTER SUBMIT SCRIPT TO IDENTIFY THE DETAILS THAT WILL BE SET
             * TO INACTIVE <- OLD FUNCTIONALITY
             */
            /*nlapiSetCurrentLineItemValue(type,
                    FLD_CUSTRECORD_CUSTOM_INACTIVE, 'T');
            nlapiCommitLineItem(type); <- OLD CODE*/
            alert('There are Transactions associated with this record,'
                    +' so it cannot be deleted');
            return false;
        }
    }
    return true;
}

//APPROVE RA VIA APPROVE BUTTON IN VIEW MODE
function approveRA(){
   try{
        nlapiSubmitField(REC_REBATE_AGREEMENT, nlapiGetRecordId(), 
            FLD_REBATE_AGREEMENT_STATUS, HC_AGR_STATUS.Approve);
         location.reload();
    }catch(error){
        if (error.getDetails != undefined) {
            alert(error.getDetails());
         }else {
            alert(error.toString());
         }
    }
    
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */

//CHECK IF A REBATE AGREEMENT DETAIL HAS REBATE TRANSACTIONS ASSOCIATED IN IT
function validateAssociatedTransInDet(idAgreement, idAgrDetail){
    if (!isEmpty(idAgrDetail) && !isEmpty(idAgreement)) {
        var objFilter = [
            new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGR_DET, null,
                    'anyof', idAgrDetail)
        ];
        var objResults = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
                objFilter);

        return objResults;
    }
}

//CHECKS IF THE AGREEMENT NAME ALREADY EXISTS
function validateDuplicateAgrName(fldName) {
    var stAgreementName = nlapiGetFieldValue(fldName);
    if(!isEmpty(stAgreementName)){
        var objFilter = [
             new nlobjSearchFilter(fldName, null, 'is', stAgreementName)
         ];
         var objResults = nlapiSearchRecord(REC_REBATE_AGREEMENT, null, objFilter);
         var stErrMessage = '';

         if (!isEmpty(objResults)) {
             if (objResults[0].getId() != nlapiGetRecordId()) {
                 stErrMessage = 'Agreement Name is Duplicate, Please specify other Agreement Name';
                 alert(stErrMessage);
             }
         }
         if (!isEmpty(stErrMessage)) return true;
    }
}

//VALIDATE THE SUBSIDIARY/CURRENCY OF A FIELD VALUE IF IT MATCHES THE AGREEMENT'S SUBSIDIARY
function validateSubsidiaryCurrency(fldName, stRecType, bSubsidiaryOnly, bCurrencyOnly) {
    var arCurrency = [], stErrMessage = [];
    var idEntity = nlapiGetFieldValue(fldName);
        idEntity = (idEntity > 0) ? idEntity : null;

    if (!isEmpty(idEntity)) {
        var fldSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
        var fldCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
    	var arrVer = nlapiGetContext().getVersion().split('.');

        if(HC_OBJ_FEATURE.blnOneWorld && bSubsidiaryOnly && !isEmpty(fldSubsidiary)){
        	try{

                var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity)];
            	if (stRecType == HC_VENDOR &&
            			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
                	arFilter.push(new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', fldSubsidiary));
                } else {
                	arFilter.push(new nlobjSearchFilter(HC_SUBSIDIARY, null, 'anyof', fldSubsidiary));
                }
                var objSubsidiaryResults = nlapiSearchRecord(stRecType, null, arFilter);
                if(isEmpty(objSubsidiaryResults))
                    stErrMessage.push(stRecType.capitalizeFirstLetter()
                        + ' subsidiary must be consistent with the Agreement Subsidiary');
        	}catch(err){
        		console.log('validateSubsidiaryCurrency: '+JSON.stringify(err))
        	}
        }else if(bCurrencyOnly){
            var objCurrency = nlapiLookupField(stRecType, idEntity, [FLD_CURRENCY]);       
            if(objCurrency[FLD_CURRENCY] != fldCurrency)
                stErrMessage
                .push(stRecType.capitalizeFirstLetter()
                      + ' currency must be consistent with the Agreement Currency');
        }else if(!bSubsidiaryOnly && !bCurrencyOnly){
            var recEntity = nlapiLoadRecord(stRecType, idEntity);
            var intCurrencyCount = recEntity.getLineItemCount(HC_CURRENCY);
            // VALIDATE SUBSIDIARY
            if (HC_OBJ_FEATURE.blnOneWorld == true) {
            	if (stRecType == HC_VENDOR &&
            			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
                    var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity)];
                    if(fldSubsidiary)
                    	arFilter.push(new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', fldSubsidiary));
                    var objSubsidiaryResults = nlapiSearchRecord(stRecType, null, arFilter);
                    if(isEmpty(objSubsidiaryResults))
                        stErrMessage.push(stRecType.capitalizeFirstLetter()
                            + ' subsidiary must be consistent with the Agreement Subsidiary');
            	} else {
	                var objEntity = nlapiLookupField(stRecType, idEntity, [
	                    HC_SUBSIDIARY
	                ]);
	                if (objEntity[HC_SUBSIDIARY] != fldSubsidiary) {
	                    stErrMessage
	                            .push(stRecType.capitalizeFirstLetter()
	                                  + ' subsidiary must be consistent with the Agreement Subsidiary');
	                }
            	}
            }
    
            // VALIDATE CURRENCY
            if (HC_OBJ_FEATURE.bMultiCurrency == true) {
                for (var line = 1; line <= intCurrencyCount; line++) {
                    arCurrency.push(recEntity.getLineItemValue(HC_CURRENCY,
                            HC_CURRENCY, line))
                }
                if (arCurrency.indexOf(fldCurrency) < 0) {
                    stErrMessage
                            .push('Currency of the Agreement must be available for the selected '
                                  + stRecType.capitalizeFirstLetter());
                }
    
            } /*else {
                var stPrimaryCurrency = recEntity.getFieldValue(HC_CURRENCY);
                if (stPrimaryCurrency != fldCurrency) {
                    stErrMessage
                            .push('Currency of the Agreement must be the Primary Currency of the selected '
                                  + stRecType.capitalizeFirstLetter());
                }
            }*/
        }
    }
    return stErrMessage;
}

//VALIDATES THE SUBSIDIARY/CURRENCY OF THE CUSTOMER/VENDOR LINE ITEM FIELD IF IT MATCHES THE AGREEMENT
function validateSubCurrLineItem(fldName, stRecType){
    var arCurrency = [], stErrMessage = [];
    var idAgrSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
    var idAgrCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
    var idSublistEntity = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, fldName);
    
    if(!isEmpty(idSublistEntity)){
        var recEntity = nlapiLoadRecord(stRecType, idSublistEntity);
        var intCurrencyCount = recEntity.getLineItemCount(HC_CURRENCY);
        
        //VALIDATE SUBSIDIARY
        if(!isEmpty(idAgrSubsidiary)){
            if (HC_OBJ_FEATURE.blnOneWorld == true) {
            	var arrVer = nlapiGetContext().getVersion().split('.');
            	if (stRecType == HC_VENDOR &&
            			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
            		var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idSublistEntity),
                    		new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', idAgrSubsidiary)];
                    var objSubsidiaryResults = nlapiSearchRecord(stRecType, null, arFilter);
                    if(isEmpty(objSubsidiaryResults))
                        stErrMessage.push(stRecType.capitalizeFirstLetter()
                            + ' subsidiary must be consistent with the Agreement Subsidiary');
            	} else {
	                var objEntity = nlapiLookupField(stRecType, idSublistEntity, [
	                    HC_SUBSIDIARY
	                ]);
	                if (objEntity[HC_SUBSIDIARY] != idAgrSubsidiary) {
	                    stErrMessage
	                            .push(stRecType.capitalizeFirstLetter()
	                                  + ' subsidiary must be consistent with the Agreement Subsidiary');
	                }
            	}
            }
        }
        
        //VALIDATE CURRENCY
        if(!isEmpty(idAgrCurrency)){
            if (HC_OBJ_FEATURE.bMultiCurrency == true) {
                for (var line = 1; line <= intCurrencyCount; line++) {
                    arCurrency.push(recEntity.getLineItemValue(HC_CURRENCY,
                            HC_CURRENCY, line))
                }
                if (arCurrency.indexOf(idAgrCurrency) < 0) {
                    stErrMessage
                            .push('Currency of the Agreement must be available for the selected '
                                  + stRecType.capitalizeFirstLetter());
                }

            } /*else {
                var stPrimaryCurrency = recEntity.getFieldValue(HC_CURRENCY);
                if (stPrimaryCurrency != idAgrCurrency) {
                    stErrMessage
                            .push('Currency of the Agreement must be the Primary Currency of the selected '
                                  + stRecType.capitalizeFirstLetter());
                }
            }*/
        }
    }
    return stErrMessage;
}

//VALIDATES THE VALUE OF THE REBATE COST FIELD
function validateDetailSearchValues(sblAgrDetail){
    var intLineCount = nlapiGetLineItemCount(sblAgrDetail);
    var arAlertMessage = [];
    for(var line = 1; line <= intLineCount; line++){
        var stCostBasis = nlapiGetLineItemValue(sblAgrDetail, 
                FLD_CUSTRECORD_COST_BASIS, line);
        var flRebateCost = nlapiGetLineItemValue(sblAgrDetail, 
                FLD_CUSTRECORD_DET_REBATE_COST, line);
        
        if(stCostBasis == HC_COST_BASIS.Rebate_Cost 
                && forceParseFloat(flRebateCost) <= 0){
            arAlertMessage.push('Line#'+line
                    +': Rebate Cost field must be specified');
        }
    }
    
    return arAlertMessage;
}

// CHECK IF THE REBATE AGREEMENT HAS REBATE TRANSACTIONS ASSOCIATED IN IT
function checkAssociatedRebTrans(intAgreement) {  
    var objFilter = [
        new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGREEMENT, null, 'anyof',
                intAgreement)
    ];
    var objTranSearch = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
            objFilter);

    return objTranSearch;
}

//HIDE/DISABLE FIELDS BASED ON INCLUDE ALL CHECKBOX
function disableCustVendSearch() {
    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
    if (bIncludeAll != 'T') {
        nlapiDisableField(FLD_CUSTRECORD_CUST_SEARCH, false);
        nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, false);
        nlapiSetFieldDisplay(FLD_CUSTRECORD_CUST_LINK, true);
        nlapiSetFieldDisplay(FLD_CUSTRECORD_VEND_LINK, true);
    } else {
        nlapiSetFieldValue(FLD_CUSTRECORD_CUST_SEARCH, '');
        nlapiSetFieldValue(FLD_CUSTRECORD_VENDOR_SEARCH, '');
        nlapiDisableField(FLD_CUSTRECORD_CUST_SEARCH, true);
        nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, true);
        nlapiSetFieldDisplay(FLD_CUSTRECORD_CUST_LINK, false);
        nlapiSetFieldDisplay(FLD_CUSTRECORD_VEND_LINK, false);
    }
}

//HIDE/DISABLE FIELDS BASED ON REBATE TYPE
function disableSearchBasedOnRebType() {
    
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
    
    nlapiSetFieldDisplay(FLD_CUSTRECORD_CUST_LINK, false);
    nlapiSetFieldDisplay(FLD_CUSTRECORD_VEND_LINK, false);
    nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, true);
    nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, true);

    if (bIncludeAll != 'T') {
        if(!isEmpty(lstRebateType)){
            if (lstRebateType == HC_REB_TYPE.RebPurchase) {
                nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, false);
                nlapiSetFieldDisplay(FLD_CUSTRECORD_VEND_LINK, true);
                disableEmptyFld(FLD_CUSTRECORD_CUST_SEARCH, true);
            } else{
                nlapiDisableField(FLD_CUSTRECORD_CUST_SEARCH, false);
                nlapiSetFieldDisplay(FLD_CUSTRECORD_CUST_LINK, true);
                disableEmptyFld(FLD_CUSTRECORD_VENDOR_SEARCH, true);
            }
        }else{
            nlapiDisableField(FLD_CUSTRECORD_VENDOR_SEARCH, false);
            nlapiSetFieldDisplay(FLD_CUSTRECORD_VEND_LINK, true);
            nlapiDisableField(FLD_CUSTRECORD_CUST_SEARCH, false);
            nlapiSetFieldDisplay(FLD_CUSTRECORD_CUST_LINK, true);
        }
    }
}

//DISABLES/ENABLES THE CUSTOMER/VENDOR LINE ITEM FIELD BASED ON THE REBATE TYPE AN INCLUDE ALL CHECKBOX
function disableCustomerVendorLineItem(type, lstRebateType, bIncludeAll){
    nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CUST, true);
    nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_VEND, true);
    nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, true);
    nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, true);
    if (bIncludeAll != 'T') {
        if(!isEmpty(lstRebateType)){
             if(lstRebateType == HC_REB_TYPE.RebPurchase){
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CUST, true);
                nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_CUST, '', false);
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, true);
                nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, '', false);
                
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_VEND, false);
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, false);
            }else{
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_VEND, true);
                nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_VEND, '', false);
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, true);
                nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, '', false);
                
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CUST, false);
                nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, false);
            }
        }else{
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_CUST, false);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_VEND, false);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_CUST_CLASS, false);
            nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_EL_VEND_CLASS, false);
        }
    }
    
    if(lstRebateType != HC_REB_TYPE.RebSale){
        nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_PASS_THROUGH_PERC, true);
        nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_PASS_THROUGH_PERC, '', false);
        nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_PASS_THROUGH_VAL, true);
        nlapiSetCurrentLineItemValue(type, FLD_CUSTRECORD_DET_PASS_THROUGH_VAL, '', false);
    }else{
        nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_PASS_THROUGH_PERC, false);
        nlapiDisableLineItemField(type, FLD_CUSTRECORD_DET_PASS_THROUGH_VAL, false);
    }
}

//DISABLES/ENABLES NUMERIC LINE ITEM FIELDS BASED ON THE SELECTED CALCULATION METHOD
function disableCalcMethodLineFields(){
    var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC));
    var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL));
    var idCalcMethod = nlapiGetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_CALC_METHOD);
    
    nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_AMT, true);
    nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_PERCENT, true);
    nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_REBATE_COST, true);
    
    if(!isEmpty(idCalcMethod)){
        var arCalcMethodFlds = [FLD_CUSTRECORD_SHOW_PERCENT, FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_SHOW_REB_COST];
        var objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, idCalcMethod, arCalcMethodFlds);
        //DISABLE PERCENT OR AMOUNT FIELD
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T'){
            nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_PERCENT, false);
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_AMT, '', false);
        }else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T'){
            nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_AMT, false);
            nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_PERCENT, '', false);
        }
        
        //DISABLE REBATE COST FIELD
        (objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T') ?
                nlapiDisableLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_REBATE_COST, false)
                :  nlapiSetCurrentLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_REBATE_COST, '', false);
                
    }  
}

//HIDE/DISABLE FIELDS BASED ON REBATE TYPE AND REMITTANCE TYPE
function disableSearchBasedOnRemType() {
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var lstRemittanceType = nlapiGetFieldValue(FLD_CUSTRECORD_REMITTANCE_TYPE);
    
    disableEmptyFld(FLD_CUSTRECORD_CREDIT_ENTITY, true);
    disableEmptyFld(FLD_CUSTRECORD_PAYABLE, true);
    disableEmptyFld(FLD_CUSTRECORD_REFUND_ENTITY, true);
    disableEmptyFld(FLD_CUSTRECORD_RECEIVABLE, true);
    disableEmptyFld(FLD_CUSTRECORD_REFUND_CASH, true);
    disableEmptyFld(FLD_CUSTRECORD_CLAIM_TRANS, true);
    
    if(isEmpty(lstRebateType)){
        alert('Rebate Type is required.');
        nlapiDisableField(FLD_CUSTRECORD_CREDIT_ENTITY, false);
        nlapiDisableField(FLD_CUSTRECORD_PAYABLE, false);
        nlapiDisableField(FLD_CUSTRECORD_REFUND_ENTITY, false);
        nlapiDisableField(FLD_CUSTRECORD_RECEIVABLE, false);
        nlapiDisableField(FLD_CUSTRECORD_REFUND_CASH, false);
        nlapiDisableField(FLD_CUSTRECORD_CLAIM_TRANS, false);
    }else if (lstRemittanceType != HC_REM_TYPE.None && !isEmpty(lstRebateType)
        && !isEmpty(lstRemittanceType)) {
        nlapiDisableField(FLD_CUSTRECORD_CLAIM_TRANS, false);

        if (lstRebateType == HC_REB_TYPE.RebPurchase
            || lstRebateType == HC_REB_TYPE.RebSale) {
            if (lstRemittanceType == HC_REM_TYPE.Credit) {
                nlapiDisableField(FLD_CUSTRECORD_CREDIT_ENTITY, false);
                nlapiDisableField(FLD_CUSTRECORD_PAYABLE, false);
            } else if (lstRemittanceType == HC_REM_TYPE.Refund) {
                nlapiDisableField(FLD_CUSTRECORD_REFUND_ENTITY, false);
                nlapiDisableField(FLD_CUSTRECORD_RECEIVABLE, false);
            }
        } else if (lstRebateType == HC_REB_TYPE.CustReb) {
            nlapiDisableField(FLD_CUSTRECORD_RECEIVABLE, false);
            if (lstRemittanceType == HC_REM_TYPE.Refund)
                nlapiDisableField(FLD_CUSTRECORD_REFUND_CASH, false);
        }
    }
}

//CHECKS IF THE LINE ITEM COMBINATION ALREADY EXISTS
function getValueComination(sblDetail, idAgreement, lstRebateType,
        stConcatCombination, bIncludeAll, index) {
    var countSublistValues = nlapiGetLineItemCount(sblDetail);

    for (line = 1; line <= countSublistValues; line++) {
        var idItem = nlapiGetLineItemValue(sblDetail, FLD_CUSTRECORD_DET_ITEM, line);
        var idCustomer = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_CUST, line);
        var idVendor = nlapiGetLineItemValue(sblDetail, FLD_CUSTRECORD_DET_VEND,
                line);
        
        var idItemClass = nlapiGetLineItemValue(sblDetail, FLD_CUSTRECORD_DET_EL_ITEM_CLASS, line);
        var idCustomerClass = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_EL_CUST_CLASS, line);
        var idVendorClass = nlapiGetLineItemValue(sblDetail, FLD_CUSTRECORD_DET_EL_VEND_CLASS,
                line);

        var lstCalcMethod = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_CALC_METHOD, line);
        var flAmount = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_AMT, line);
        var stUom = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_UOM, line);
        var flPercent = nlapiGetLineItemValue(sblDetail,
                FLD_CUSTRECORD_DET_PERCENT, line);
        
        var intEntity = 0;
        
        var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
        
        if(bIncludeAll != 'T'){
             //intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
                //: checkEmptyValue(idVendor);
            
            intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
             (!isEmpty(idCustomerClass)) ? checkEmptyValue(idCustomerClass) :
                 (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendorClass);
        }
       
        var stConcatLineValue = checkEmptyValue(idAgreement) + '_'
                                  + intEligItemEntClass + '_'
                                  + intEntity + '_'
                                  + checkEmptyValue(stUom);
        
        if (stConcatCombination == stConcatLineValue && index != line)
            return true;
    }
}

//Enables/disables Accrual fields depending on selection
function enableDisableAccrualFields() {
    var bAccrue = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS);
    
    if (bAccrue == 'T') {
        var stRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
        
        nlapiDisableField(FLD_CUSTRECORD_ACCRUED_EXPENSES, false);
        if (stRebateType != HC_REBATE_TYPE.Customer_Rebate) {
            nlapiDisableField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, false);
            
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE, '');
            nlapiDisableField(FLD_CUSTRECORD_ACCRUED_PAYABLE, true);
        } else {
            nlapiDisableField(FLD_CUSTRECORD_ACCRUED_PAYABLE, false);
            
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, '');
            nlapiDisableField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, true);
        }
    } else {
        nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES, '');
        nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE, '');
        nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, '');
        nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUAL_ACCOUNT, '');
        
        nlapiDisableField(FLD_CUSTRECORD_ACCRUED_EXPENSES, true);
        nlapiDisableField(FLD_CUSTRECORD_ACCRUED_PAYABLE, true);
        nlapiDisableField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, true);
    }
}

//Defaults the accrual account information depending on the preference 
function loadAccrualAccounts(bManualCheck) {
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE); 
    
    if (!isEmpty(lstRebateType)) {
        var objAccAcct = [];
        if (!isEmpty(arrAccAccts[lstRebateType])) {
            objAccAcct = arrAccAccts[lstRebateType];
        } else {
            var arrFil = [new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'),
                new nlobjSearchFilter(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE, null, 'anyof', lstRebateType)];
            var arrCol = [new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_FLAG),
                new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE),
                new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE),
                new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE)];
            
            var arrRes = getAllResults(REC_ACCRUAL_ACCOUNT, null, arrFil, arrCol);
            
            if (!isEmpty(arrRes)) {
                var arrResults = arrRes.results;
                
                objAccAcct[FLD_CUSTRECORD_ACCRUE_AMOUNTS] = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_FLAG);
                objAccAcct[FLD_CUSTRECORD_ACCRUED_EXPENSES] = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE);
                objAccAcct[FLD_CUSTRECORD_ACCRUED_RECEIVABLE] = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE);
                objAccAcct[FLD_CUSTRECORD_ACCRUED_PAYABLE] = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE);
                objAccAcct[FLD_CUSTRECORD_ACCRUAL_ACCOUNT] = arrResults[0].getId();
                
                arrAccAccts[lstRebateType] = objAccAcct;
            } else {
                objAccAcct[FLD_CUSTRECORD_ACCRUE_AMOUNTS] = '';
                objAccAcct[FLD_CUSTRECORD_ACCRUED_EXPENSES] = '';
                objAccAcct[FLD_CUSTRECORD_ACCRUED_RECEIVABLE] = '';
                objAccAcct[FLD_CUSTRECORD_ACCRUED_PAYABLE] = '';
                objAccAcct[FLD_CUSTRECORD_ACCRUAL_ACCOUNT] = '';
                
                arrAccAccts[lstRebateType] = objAccAcct;
            }

            if (!bManualCheck) nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS, objAccAcct[FLD_CUSTRECORD_ACCRUE_AMOUNTS]);
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES, objAccAcct[FLD_CUSTRECORD_ACCRUED_EXPENSES]);
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, objAccAcct[FLD_CUSTRECORD_ACCRUED_RECEIVABLE]);
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE,objAccAcct[FLD_CUSTRECORD_ACCRUED_PAYABLE]);
            nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUAL_ACCOUNT,objAccAcct[FLD_CUSTRECORD_ACCRUAL_ACCOUNT]);
        }
    }
    
    enableDisableAccrualFields();
}