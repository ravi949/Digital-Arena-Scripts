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
 * 1.00       10 Jul 2015     pdeleon	Initial version.
 * 
 */

/*
 * Cancels the Claim Generation Log
 */
function cancelClaimGeneration() {
    var stId = nlapiGetRecordId();
    
	alert('Affected Rebate Transaction Detail(s) and Claim Transaction(s) may need to be updated manually after cancelling this Claim Generation Log');

    var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, stId);
    recCGL.setFieldValue(FLD_CLAIM_GEN_STATUS, HC_CLAIM_GEN_LOG_STATUS.Cancelled);
    nlapiSubmitRecord(recCGL, false, true);
    
    window.location.reload();
    
    /* Can't use submit field on non-inline editable fields
    var arrFields = [FLD_CLAIM_GEN_STATUS];
    var arrValues = [HC_CLAIM_GEN_LOG_STATUS.Cancelled];
    nlapiSubmitField(REC_CLAIM_GENERATION_LOG, stId, arrFields, arrValues);
    */
}
