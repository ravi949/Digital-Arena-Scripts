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
 * 1.00       22 Jun 2015     pdeleon	Initial version.
 * 
 */

/**
 * @return {Boolean} True to continue save, false to abort save
 */
function ClaimConfig_clientSaveRecord() {
	
    var stRebateType = nlapiGetFieldValue(FLD_CLAIM_CONFIG_REBATE_TYPE);
    var stCreditType = nlapiGetFieldValue(FLD_CLAIM_CONFIG_CREDIT_TRANS_TYPE);
    var stRefundType = nlapiGetFieldValue(FLD_CLAIM_CONFIG_REFUND_TRANS_TYPE);
    var stRevCreditType = nlapiGetFieldValue(FLD_CLAIM_CONFIG_REV_CREDIT_TRANS_TYPE);
    var stRevRefundType = nlapiGetFieldValue(FLD_CLAIM_CONFIG_REV_REFUND_TRANS_TYPE);
    var arrError = [];
    
    if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale ||
            stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase) {
        if (stCreditType != HC_REBATE_TRAN_TYPE.vendorcredit) {
            arrError.push('Credit Transaction Type should be Bill Credit');
        }
        if (stRefundType != HC_REBATE_TRAN_TYPE.invoice) {
            arrError.push('Refund Transaction Type should be Invoice');
        }
        
        if(stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase && stCreditType == HC_REBATE_TRAN_TYPE.vendorcredit && stRevCreditType != HC_REBATE_TRAN_TYPE.vendorbill){
        	arrError.push('Reversal Credit Transaction Type should be Bill');
        }
        
        if(stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase && stRefundType == HC_REBATE_TRAN_TYPE.invoice && stRevRefundType != HC_REBATE_TRAN_TYPE.creditmemo){
        	arrError.push('Reversal Refund Transaction Type should be Credit Memo');
        }
    } else if (stRebateType == HC_REBATE_TYPE.Customer_Rebate) {
        if (stCreditType != HC_REBATE_TRAN_TYPE.creditmemo) {
            arrError.push('Credit Transaction Type should be Credit Memo');
        }
        if (stRefundType != HC_REBATE_TRAN_TYPE.customerrefund) {
            arrError.push('Refund Transaction Type should be Customer Refund');
        }
        if(stCreditType == HC_REBATE_TRAN_TYPE.creditmemo && stRevCreditType != HC_REBATE_TRAN_TYPE.invoice){
        	arrError.push('Reversal Credit Transaction Type should be Invoice');
        }
        if(stRefundType == HC_REBATE_TRAN_TYPE.customerrefund && !(stRevRefundType == HC_REBATE_TRAN_TYPE.invoice || stRevRefundType == HC_REBATE_TRAN_TYPE.payment)){
        	arrError.push('Reversal Refund Transaction Type should either be Invoice or Payment');
        }
    }
    
    if(!isFolderExist(nlapiGetFieldValue(FLD_CLAIM_CONFIG_FOLDER_ID))){
        arrError.push('Folder does not exist!');
    }
    
    if (!isEmpty(arrError)) {
        var stErrorMsg = arrError.join('\n');
        alert(stErrorMsg);
        return false;
    }
    
    return true;
}