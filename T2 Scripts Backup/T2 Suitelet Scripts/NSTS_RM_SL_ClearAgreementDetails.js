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
 * Script for removing the Agreement details in the Rebate Agreement sublist.
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 May 2015     Roxanne Audette   Initial version.
 * 
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function clearAgreementDetails_FormSuitelet(request, response) {
    var objForm = nlapiCreateForm('Deleting Agreement Details in Process', true);
    if (request.getMethod() == 'GET') {
        var idRebateAgreement = request
        .getParameter(HC_REQUEST_PARAM.Agreement);
        
        try{ 
            var recAgreement = nlapiLoadRecord(REC_REBATE_AGREEMENT, idRebateAgreement);
            var intAgreementDetails = recAgreement.getLineItemCount(SBL_REBATE_DETAIL); 
            for(var line = intAgreementDetails; line >= 1; line--){
                var idAgrDetail = recAgreement.getLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORT_AGR_DET_ID, line);
                
                recAgreement.removeLineItem(SBL_REBATE_DETAIL, line);
            }
            var recAgreementId = nlapiSubmitRecord(recAgreement, false, true);
            nlapiSetRedirectURL('RECORD', REC_REBATE_AGREEMENT, recAgreementId, true);                   
        }catch (error) {
            if (error.getDetails != undefined) {
                nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': '
                                                            + error.getDetails());
            }
        }    
    }
}