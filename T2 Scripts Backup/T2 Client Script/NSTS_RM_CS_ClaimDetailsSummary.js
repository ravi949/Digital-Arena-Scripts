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
 * Script used to process the Claim Summary and Details button found in the CGL view page.
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2015     Roxanne Audette   Initial version.
 * 
 */

/**
 * @param type Can be create, copy, edit
 */
function previewAndPrintClaimDetail(blBypass){
    var objContext = nlapiGetContext(); 
    var idClaimGenLog = nlapiGetRecordId();
    var recClaimGenLog = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, nlapiGetRecordId());
    var idClaimGenSearch = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_DEF_SEARCH_CLAIM);
    var idClaimDetSearch = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_DETAIL_SEARCH);
    var idAgreement = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_REBATE_AGREEMENT);
    var idClaimTrans = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_CLAIM_TXN_TXT);
    var dateTransStart = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE);
    var dateTransEnd = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE);
    var stCGLTrans = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_CLAIM_TRANSACTION );
    var stCGLStatus = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_STATUS);
    var objCheckEmptyFields = checkEmptyFields(idAgreement, dateTransStart, dateTransEnd, idClaimGenSearch);
    var bRATiered = (!isEmpty(idAgreement)) ? nlapiLookupField(REC_REBATE_AGREEMENT, idAgreement, FLD_CUSTRECORD_IS_TIERED) : 'F';

    if(!isEmpty(objCheckEmptyFields)){
        alert('Please specify the following fields before Preview: ' + objCheckEmptyFields.join(','));
    } else if (bRATiered == 'T' && !checkIfHasTiers(idAgreement)) {
    	alert('Cannot process claim for tiered Rebate Agreement with no Tier Group and Tier definition.');
    }else{
        if(blBypass != 'T' && bRATiered == 'T' && stCGLStatus != HC_CLAIM_GEN_LOG_STATUS.Completed)
            alert('You are about to process a claim. Please wait for an email once the claim calculation is completed before you proceed any further.');
            
        var stUrlParam = '&loadType=claimdetail&claimgenlog='+ idClaimGenLog
                        +'&claimgensearch=' + idClaimGenSearch + '&claimdetsearch=' + idClaimDetSearch
                        + '&agreement=' + idAgreement
                        + '&claimtrans=' + idClaimTrans
                        + '&startdate=' + dateTransStart + '&enddate='
                        + dateTransEnd + '&userid=' + objContext.getUser()
                        + '&cgltrans=' + stCGLTrans
                        + '&tiered=' + bRATiered
                        + '&bypass=' + blBypass
                        + '&cglstatus=' + stCGLStatus;
      //alert(stUrlParam);
        redirectToSuiteletUrl(stUrlParam, bRATiered,blBypass);
    }
}

function checkIfHasTiers(idAgreement) {
	var blReturn = false;
	
	var arrFil = [new nlobjSearchFilter(FLD_TIER_DOLLAR_REBATE_AGREEMENT, null, 'anyof', idAgreement)];
	arrFil.push(new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'));
	
	var arrCol = [new nlobjSearchColumn(FLD_INTERNAL_ID)];
	
	var arrRes = nlapiSearchRecord(REC_TIERS_DOLLARS, null, arrFil, arrCol);
	
	if (!isEmpty(arrRes)) {
		blReturn = true;
	}
	
	return blReturn;
}

function previewClaimSummary(){
    var idClaimGenLog = nlapiGetRecordId();
    var recClaimGenLog = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, idClaimGenLog);
    var idClaimDetSearch = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_DETAIL_SEARCH);
    var idRebateType = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
    var bPostByDept = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_POST_BY_DEPT);
    var bPostByClass = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_POST_BY_CLASS);
    var bPostByLocation = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_POST_BY_LOC);
    var stCGLTrans = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_CLAIM_TRANSACTION);
    var flClaimAmount = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_TOTAL_CLAIM);
    var stCGLStatus = recClaimGenLog.getFieldValue(FLD_CLAIM_GEN_STATUS);
    
//OVERRIDE CLAIM SUMMARY: REMOVED USER STORY
//    if(stCGLStatus != HC_CLAIM_GEN_LOG_STATUS.Completed){
//        nlapiSubmitField(nlapiGetRecordType(), idClaimGenLog, FLD_CLAIM_GEN_GENERATE_CLAIM_AMOUNT, 'T');
//        location.reload();
//    }
    
    var stUrlParam = '&loadType=claimsummary&claimgenlog='+ idClaimGenLog
                    + '&claimdetsearch=' + idClaimDetSearch
                    + '&rebateType=' + idRebateType
                    + '&postbydept=' + bPostByDept
                    + '&postbyclass=' + bPostByClass
                    + '&postbyloc=' + bPostByLocation
                    + '&cgltrans=' + stCGLTrans
                    + '&claimamount=' + flClaimAmount
                    + '&cglstatus=' + stCGLStatus;
    redirectToSuiteletUrl(stUrlParam);
}

function redirectToSuiteletUrl(stUrlParam, bRATiered, blBypass){
    var sUrlSuitelet = nlapiResolveURL('SUITELET',
            'customscript_nsts_rm_claidetsumsearch_sl',
            'customdeploy_nsts_rm_claidetsumsearch_sl', false);
    if(blBypass == 'T'){
    	window.location.href = sUrlSuitelet + stUrlParam;
    }else if(bRATiered == 'T' || blBypass == 'T'){

    	//window.location.href = sUrlSuitelet + stUrlParam;
        window.open(sUrlSuitelet + stUrlParam, '_self');
    }
    else{

    	//window.location.href = sUrlSuitelet + stUrlParam;
        window.open(sUrlSuitelet + stUrlParam);
        location.reload();
    }
}

function checkEmptyFields(idAgreement, dateTransStart, dateTransEnd, idDefClaimSearch){
    var arFieldNames = [];
    if(isEmpty(idAgreement)) arFieldNames.push('Rabate Agreement');
    if(isEmpty(dateTransStart)) arFieldNames.push('Transaction Start Date');
    if(isEmpty(dateTransEnd)) arFieldNames.push('Transaction End Date');
    if(isEmpty(idDefClaimSearch)) arFieldNames.push('Claim Generation Default Search');
    
    return arFieldNames;
}