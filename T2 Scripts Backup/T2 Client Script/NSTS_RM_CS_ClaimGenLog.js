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

var HC_OBJ_FEATURE = new objFeature();
var STTYPE = '';
var OBJCHECKFORPREVIOUS = null;

function clientPageInit(type){
    STTYPE = type;
    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE, nlapiGetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE), false, true);
    if (type == HC_MODE_TYPE.Create && nlapiGetFieldValue('custrecord_nsts_rm_cgl_istiered') == "T") {
        nlapiSetFieldValue("custrecord_nsts_rm_cg_rebate_agreement", nlapiGetFieldValue("custrecord_nsts_rm_cg_rebate_agreement"), true, true)
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function claimGenLog_clientSaveRecord(){
    if(HC_OBJ_FEATURE.blnOneWorld){
         var stClaimRefund = nlapiGetFieldValue(FLD_CLAIM_GEN_CLAIM_REFUND);
         var stSubsidiary = nlapiGetFieldValue(FLD_CLAIM_GEN_SUBSIDIARY)
         var bIsSubsidiaryMatch = checkIfAccountInSubsidiary(stClaimRefund, stSubsidiary);
         if(!bIsSubsidiaryMatch && !isEmpty(stClaimRefund)){
             alert("Claim Refund Account' subsidiary must match the Claim Generation Log Subsidiary");
             return false;
         }
     }

    if(STTYPE == "create" || STTYPE == "copy"){
        var objCheckPreCGL = checkForPrevious();
        console.log(objCheckPreCGL);
        if(objCheckPreCGL.isTiered && !isEmpty(objCheckPreCGL.cgl)){
            var bOption = confirm("You are about to process a claim against the agreement with an existing claim, proceeding will trigger the reversal of the previously-generated claim transactions.")
            if(bOption){
                nlapiSetFieldValue(FLD_CLAIM_GEN_PREV_CGL, objCheckPreCGL.cgl, false, true);
            }else{
                //nlapiSetFieldValue(FLD_CLAIM_GEN_REBATE_AGREEMENT, "", false, true);
                //nlapiSetFieldValue(FLD_CLAIM_GEN_PREV_CGL, "", false, true);
                return false
            }
        }
    } else if (nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS) == HC_CLAIM_GEN_LOG_STATUS.Cancelled) {
        if (!isEmpty(nlapiGetFieldValue(FLD_CLAIM_GEN_CLAIM_TRANSACTION))) 
        	alert('Affected Rebate Transaction Detail(s) and Claim Transaction(s) may need to be updated manually after cancelling this Claim Generation Log');
    }
    
    
    return true;
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {Void}
 */
function claimGenLog_clientValidateField(type, name, linenum) {

    nlapiLogExecution('debug', 'validate field', name);
    if (name == FLD_CLAIM_GEN_TRANSACTION_START_DATE) {
        var stStart = nlapiGetFieldValue(name);
        var stEnd = nlapiGetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE);
        
        if (!isEmpty(stStart) && !isEmpty(stEnd)) {
            var dtStart = nlapiStringToDate(stStart);
            var dtEnd = nlapiStringToDate(stEnd);
            console.log('dtStart: '+dtStart+ ' dtEnd: '+dtEnd);
            if (dtStart != 'NaN' && dtEnd != 'Nan' && dtStart > dtEnd) {
                alert('Start date cannot be later than the End date');
                nlapiSetFieldValue(name, '');
                return false;
            }
        }
    } else if (name == FLD_CLAIM_GEN_TRANSACTION_END_DATE) {
        var stStart = nlapiGetFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE);
        var stEnd = nlapiGetFieldValue(name);
        
        if (!isEmpty(stStart) && !isEmpty(stEnd)) {
            var dtStart = nlapiStringToDate(stStart);
            var dtEnd = nlapiStringToDate(stEnd);
            
            if (dtStart != 'NaN' && dtEnd != 'NaN' && dtStart > dtEnd) {
                alert('End date cannot be earlier than the Start date');
                nlapiSetFieldValue(name, '');
                return false;
            }
        }
    }
    return true;
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {Void}
 */
function claimGenLog_clientFieldchanged(type, name, linenum) {
    nlapiLogExecution('debug', 'field change name', name);
//    if (name == FLD_CLAIM_GEN_REBATE_AGREEMENT) {
//        var stRebateType = nlapiGetFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
//        
//        var objClaimConf = retrieveClaimConfig(stRebateType);
//        
//        if (!isEmpty(objClaimConf)) {
//            nlapiSetFieldValue(FLD_CLAIM_GEN_DEF_SEARCH_CLAIM, objClaimConf.defSearchClaim, false);
//            nlapiSetFieldValue(FLD_CLAIM_GEN_DEF_SEARCH_REC, objClaimConf.defSearchRec, false);
//        }
//    } else 
    if (name == FLD_CLAIM_GEN_IS_CLAIM_DET_UPDATED) {
        if (nlapiGetFieldValue(name) == 'T') {
            var stUser = nlapiGetContext().getUser();
            
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DET_UPDATED_BY, stUser, false);
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DET_UPDATED_ON, nlapiDateToString(new Date(), 'datetime'), false);
        } else {
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DET_UPDATED_BY, '', false);
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DET_UPDATED_ON, '', false);
        }
    } else if (name == FLD_CLAIM_GEN_IS_CLAIM_SUMM_REVIEWED) {
        if (nlapiGetFieldValue(name) == 'T') {
            var stUser = nlapiGetContext().getUser();
            
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_BY, stUser, false);
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_ON, nlapiDateToString(new Date(), 'datetime'), false);
        } else {
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_BY, '', false);
            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_ON, '', false);
        }
    }
}

/**
 * For scripts that require item information to be sourced first, such as rebate calculations
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @return {void}
 */
function claimGenLog_clientPostSourcing(type, name) {
    
    if (name == FLD_CLAIM_GEN_REBATE_AGREEMENT &&
            !isEmpty(nlapiGetFieldValue(name))) {
//        var stClaimTransVal = nlapiLookupField(REC_REBATE_AGREEMENT, nlapiGetFieldValue(name), FLD_CUSTRECORD_CLAIM_TRANS);
        
        var stAgreementId = nlapiGetFieldValue(name);
        var objRAData =  setClaimTransactionFields(stAgreementId);
        setDefaultSearchFields();
        enableDisableGLAccounts();
        
        var objLatestClaimGenLog = getLatestClaimGenLog(stAgreementId);
        if (!isEmpty(objLatestClaimGenLog)) {
            var stClaimDate = objLatestClaimGenLog.claimDate;
            if (!isEmpty(stClaimDate) && objRAData.isTiered != "T") {
                nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE, stClaimDate, false, true);
            }
            
            nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE, '', false, true);
            
            var stDept = objLatestClaimGenLog.defDept;
            if (!isEmpty(stDept)) {
                nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_DEPT, stDept, false, true);
            }

            var stClass = objLatestClaimGenLog.defClass;
            if (!isEmpty(stClass)) {
                nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_CLASS, stClass, false, true);
            }

            var stLoc = objLatestClaimGenLog.defLoc;
            if (!isEmpty(stLoc)) {
                nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_LOC, stLoc, false, true);
            }
        }
        
        
        //if(name == FLD_CLAIM_GEN_REBATE_AGREEMENT){
        if(STTYPE == "create" || STTYPE == "copy"){
            OBJCHECKFORPREVIOUS = null;
            //var objCheckPreCGL = checkForPrevious();
            console.log('1 FLD_CUSTPAGE_CLAIM_GEN_SERVER_DATE: '+nlapiGetFieldValue(FLD_CUSTPAGE_CLAIM_GEN_SERVER_DATE));
            console.log(objRAData);
            
            var dtToday = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTPAGE_CLAIM_GEN_SERVER_DATE));
            
            if(objRAData.isTiered == "T" &&  objRAData.endDate > dtToday){
            	//alert(STTYPE);
                var bOption = confirm("You are about to process a claim against a tier-based whose Transaction End Date falls earlier than the Rebate Agreement End Date. \nDo you want to proceed?");
                if(bOption){
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE, nlapiDateToString(objRAData.startDate), false, true);
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE, nlapiDateToString(dtToday), false, true);
                }else{
                    nlapiSetFieldValue(FLD_CLAIM_GEN_REBATE_AGREEMENT, "", false, true);
                    nlapiSetFieldValue(FLD_CLAIM_GEN_PREV_CGL, "", false, true);
                    
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE,"", false, true);
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE,"", false, true);
                }
            }else{
                if(objRAData.isTiered == "T"){
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE, nlapiDateToString(objRAData.startDate), false, true);
                    nlapiSetFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE, nlapiDateToString(objRAData.endDate), false, true);
                }
            }
        }
        
        
        if(nlapiGetFieldValue('custrecord_nsts_rm_cgl_istiered') == "T"){
            nlapiDisableField(FLD_CLAIM_GEN_TRANSACTION_START_DATE,true);
        }else{
            nlapiDisableField(FLD_CLAIM_GEN_TRANSACTION_START_DATE,false);
        }
        
        //}
        
        
//        var recRA = nlapiLoadRecord(REC_REBATE_AGREEMENT, nlapiGetFieldValue(name));
//        var arrClaimTxns = recRA.getFieldValues(FLD_CUSTRECORD_CLAIM_TRANS);
//        var arrClaimTxnId = [];
//
//        if (arrClaimTxns instanceof Array) {
//            for (var intCtr in arrClaimTxns) {
//                arrClaimTxnId.push(arrClaimTxns[intCtr]);
//            }
//        } else {
//            arrClaimTxnId.push(arrClaimTxns);
//        }
//        nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_TXN_TXT, arrClaimTxnId.join(','), false, true);
        
//        var fldClaimTxn = nlapiGetField(FLD_CLAIM_GEN_CLAIM_TXN);
//
//        if (!isEmpty(arrClaimTxnOptions)) {
//            var stClaimTxnTxt = '';
//            for (var intCtr in arrClaimTxnOptions) {
//                var objClaimTxnOption = arrClaimTxnOptions[intCtr];
//                stClaimTxnTxt += objClaimTxnOption.getId();
//            }
//            
//            nlapiSetFieldValue(FLD_CLAIM_GEN_CLAIM_TXN_TXT, stClaimTxnTxt, false);
//        }
    }
}

/**
 * Checks if the account is available in the specified subsidiary
 */
function checkIfAccountInSubsidiary(stAccount, stSubsidiary) {
    //Search record approach
    if(!isEmpty(stAccount) && !isEmpty(stSubsidiary)){
        var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', stAccount),
                    new nlobjSearchFilter(HC_SUBSIDIARY, null, 'anyof', stSubsidiary)];
        var objSubsidiaryResults = nlapiSearchRecord(REC_ACCOUNT, null, arFilter);
        if(!isEmpty(objSubsidiaryResults)) return true;
    }
    
    /*var arrParam = [];
    arrParam.push(new nlobjSearchFilter(FLD_SUBSIDIARY, null, 'anyof', stSubsidiary));
    arrParam.push(new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'anyof', stAccount));
    
    var arrCols = [];
    arrCols.push(new nlobjSearchColumn(FLD_INTERNAL_ID));
    
    var arrResults = nlapiSearchRecord(REC_ACCOUNT, null, arrParam, arrCols);
    
    if (!isEmpty(arrResults)) {
        return true;
    }*/
    
//    //Load record approach
//    var recAccount = nlapiLoadRecord(REC_ACCOUNT, stAccount);
//    var arrAccountSubs = recAccount.getFieldValues(FLD_SUBSIDIARY);
//    
//    for (var intCtr in arrAccountSubs) {
//        var stAccountSubs = arrAccountSubs[intCtr];
//        if (stSubsidiary == stAccountSubs) {
//            return true;
//        }
//    }
    
    
    return false;
}

//OVERRIDE CLAIM SUMMARY: REMOVED USER STORY
//function disableClaimAmtField_LineInit(type){
//    if(type == SBL_CLAIM_GEN_CLAIM_AMOUNT){
//        var bGenerateClaimAmount = nlapiGetFieldValue(FLD_CLAIM_GEN_GENERATE_CLAIM_AMOUNT);
//        
//        nlapiDisableLineItemField(type, FLD_CLAIM_AMOUNT_REB_AMOUNT, true);
//        
//        if(bGenerateClaimAmount == 'T'){
//            nlapiDisableLineItemField(type, FLD_CLAIM_AMOUNT_OVERRIDE_REB_AMOUNT, true);
//        }
//    }
//}
//
//function validateClaimAmount_ValidateLine(type){
//    if(type == SBL_CLAIM_GEN_CLAIM_AMOUNT){
//        var flCalcRebAmount = nlapiGetCurrentLineItemValue(type, FLD_CLAIM_AMOUNT_REB_AMOUNT);
//        
//        if(isEmpty(flCalcRebAmount)){
//            alert('You cannot create a new Claim Amount record');
//            nlapiSetCurrentLineItemValue(type, FLD_CLAIM_AMOUNT_OVERRIDE_REB_AMOUNT, '');
//            return false;
//        }
//    }
//    return true;
//}

/*
 * Returns the record where the search is executed on
 */
function getRecordTypeOfSearch(stSearch) {
    var objSearch = nlapiLoadSearch(null, stSearch);
    
    var stRecordType = objSearch.getSearchType();
    
    nlapiLogExecution('debug', 'search type', stRecordType);
    return stRecordType;
}

/**
 * get the last CLG with completed status
 * @returns
 */
function checkForPrevious(){        
    var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_cgl_istiered');
    var stRA = nlapiGetFieldValue(FLD_CLAIM_GEN_REBATE_AGREEMENT);
    
    console.log("bIsTiered:" & bIsTiered + " stRA:" + stRA);
    
    if((bIsTiered == "T" || bIsTiered == true) && !isEmpty(stRA) && isEmpty(OBJCHECKFORPREVIOUS)){
        var arrFil = [new nlobjSearchFilter(FLD_CLAIM_GEN_REBATE_AGREEMENT,null,"anyof",[stRA])];
        var arrCGL = nlapiSearchRecord(null, 'customsearch_nsts_rm_cgl_prev_for_rvsl', arrFil);
    
        if(!isEmpty(arrCGL)){
            var objRec = arrCGL[0];
            var dtStart = objRec.getValue(FLD_REBATE_AGREEMENT_START_DATE, FLD_CLAIM_GEN_REBATE_AGREEMENT)
            var dtEnd = objRec.getValue(FLD_REBATE_AGREEMENT_END_DATE, FLD_CLAIM_GEN_REBATE_AGREEMENT)
            
            dtStart = isEmpty(dtStart)? null: nlapiStringToDate(dtStart);
            dtEnd = isEmpty(dtEnd)? null: nlapiStringToDate(dtEnd);
            
            OBJCHECKFORPREVIOUS = {
                isTiered: true,
                cgl: objRec.getId(),
                startDate: dtStart,
                endDate: dtEnd
            };
            
            return OBJCHECKFORPREVIOUS
        }
    }
    
    if(isEmpty(OBJCHECKFORPREVIOUS)){
        return {
            isTiered: false,
            cgl: null,
            startDate: null,
            endDate:null,
        }
    }else{
        return OBJCHECKFORPREVIOUS
    }

}