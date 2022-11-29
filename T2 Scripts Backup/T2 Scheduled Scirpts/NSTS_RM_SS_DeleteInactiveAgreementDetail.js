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
 * This script is used for deleting and re-attaching of an agreement detail to its 
 * parent agreement. It also sets a detail to inactive if its parent is inactive.
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Apr 2015     Roxanne Audette   Initial version.
 * 
 */

/*
 * ====================================================================
 * SCHEDULED SCRIPT FUNCTION
 * ====================================================================
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */

function removeRebateDetail_Scheduled(type) {
    var context = nlapiGetContext();
    var idRebateAgreement = context.getSetting(HC_CONTEXT.Script, SPARAM_REB_AGR_ID);
    var bAgrInactive = context.getSetting(HC_CONTEXT.Script, SPARAM_REB_AGR_INACTIVE);

    if (!isEmpty(idRebateAgreement)) {
        //SETS THE AGREEMENT DETAILS TO INACTIVE IF ITS PARENT AGREEMENT IS INACTIVE
        if (bAgrInactive == 'T') {
            var objAgrDetFilter = [
                    new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null,
                            'anyof', idRebateAgreement),
                    new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')
            ];
            var objAgrDetSearch = nlapiSearchRecord(REC_AGREEMENT_DETAIL, null,
                    objAgrDetFilter);

            if (!isEmpty(objAgrDetSearch)) {
                for (agrDetRec in objAgrDetSearch) {
                    var objRebateDetRec = nlapiLoadRecord(REC_AGREEMENT_DETAIL,
                            objAgrDetSearch[agrDetRec].getId());
                    var intTransDetails = objRebateDetRec.getLineItemCount(SBL_REBATE_TRANSACTION);
                    if(intTransDetails <= 0){
                        //WILL ONLY SET THE AGREEMENT DETAILS IF THERE ARE NO
                        //TRANSACTION DETAILS ASSOCIATED WITH IT
                        objRebateDetRec.setFieldValue(HC_IS_INACTIVE, 'T');
                        nlapiSubmitRecord(objRebateDetRec);
                    }
                    
                    if (context.getRemainingUsage() <= HC_MAX_USAGE) {
                        // YIELDSCRIPT ONCE USAGE EXCEEDS
                        var stateMain = nlapiYieldScript();
                        yieldStateMessage(stateMain);
                    }
                }
            }
        }
    } else {
        /*
         * GET ALL AGREEMENT DETAIL RECORDS WITH EMPTY AGREEMENT, IF THE DETAIL
         * RECORD HAS ASSOCIATED TRANSACTION DETAILS, SET ITS PREVIOUS AGREEMENT
         * ELSE, DELETE THE RECORD
         */
        var objAgrDetFilter = [new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null,
                'is', '@NONE@'),
                new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')];
        var objAgrDetSearch = getAllResults(REC_AGREEMENT_DETAIL, null, objAgrDetFilter, 
                [new nlobjSearchColumn(FLD_CUSTRECORD_DET_AGREEMENT_ID)]);    
    
        if(!isEmpty(objAgrDetSearch)){
            var objAgrDetresults = objAgrDetSearch.results;
            for(var i = 0; i < objAgrDetresults.length; i++){
                var objAgrDetail = objAgrDetresults[i];
                var stOldAgreementId = objAgrDetail.getValue(FLD_CUSTRECORD_DET_AGREEMENT_ID);
                var objAgreementDetail = nlapiLoadRecord(
                        REC_AGREEMENT_DETAIL, objAgrDetail.getId()); 
                var bAttachedTransDetails = validateTransDetailAttached(objAgrDetail.getId());
                if(bAttachedTransDetails){
                    if(!isEmpty(stOldAgreementId)){
                        objAgreementDetail.setFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT, 
                                stOldAgreementId);
                        nlapiSubmitRecord(objAgreementDetail, false, true);
                    }
                }else{
                    nlapiDeleteRecord(REC_AGREEMENT_DETAIL, objAgrDetail.getId());
                }
                
                if (context.getRemainingUsage() <= HC_MAX_USAGE) {
                    // YIELDSCRIPT ONCE USAGE EXCEEDS
                    var stateMain = nlapiYieldScript();
                    yieldStateMessage(stateMain);
                }
            }
        }
        
        
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTION
 * ====================================================================
 */

function validateTransDetailAttached(idAgrDetail){
    var objResults = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
            [new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGR_DET, null,
                    'anyof', idAgrDetail)]);
    if(!isEmpty(objResults)) return true;
    return false;
}

/**
 * fetch more than 1000 save Search Result
 * @param type RecordType id this is optional if the "id" is givent
 * @param id internal id of the save search this is optional if the "type" is Given
 * @param arrFilters nlobjSearchFileter[]
 * @param arrColumns nlobjSearchColumn[]
 * @returns {
 *      length int,
 *      saveSearch nlobjSearch,
 *      results nlobjSearchResult[] ,
 *      getResults function(start, end) nlobjSearchResult[],
 *      gotoPage function(page, displayItemCount) nlobjSearchResult[]
 *  }
 */
function getAllResults(type, id, arrFilters, arrColumns)
{
    var stLoggerTitle = 'GETALLRESULTS';
    if(isEmpty(type) && isEmpty(id))
    {
        return null;
    }
    
    //log("debug", stLoggerTitle, "type:{0},id{1}".format(type, id));
    
    var arrResults = [];
    var count = 1000;
    var init = true;
    var min = 0;
    var max = 1000;
    var search;
    
    if (!isEmpty(id))
    {
        search = nlapiLoadSearch(type, id);
        if (arrFilters) search.addFilters(arrFilters);
        if (arrColumns) search.addColumns(arrColumns);
        
        var arrCols = [];
        var arrGetCols = search.getColumns();
        
        var intFormulaCOunt = 0
        for(var col = 0; col < arrGetCols.length; col++)
        {
            var objGetCol   = arrGetCols[col];
            var stName      = objGetCol.getName();
            var stJoin      = objGetCol.getJoin();
            var stSummary   = objGetCol.getSummary();
            var stFormula   = objGetCol.getFormula();
            var stLabel     = objGetCol.getLabel();
            var objSetCol   = null;
            if(!isEmpty(stFormula)){
                if(intFormulaCOunt > 0){
                    stName += intFormulaCOunt;
                }
                
                objSetCol = new nlobjSearchColumn(stName, stJoin, stSummary);
                //log("debug", stLoggerTitle, stFormula)
                objSetCol.setFormula(stFormula);
                intFormulaCOunt++;
            }
            else
            {
                objSetCol = new nlobjSearchColumn(stName, stJoin, stSummary);
            }
            objSetCol.setLabel(stLabel);
            arrCols.push(objSetCol);
        }
        search.setColumns(arrCols);
        
    }
    else
    {
        //log("debug", stLoggerTitle, "Creating Save Search");
        search = nlapiCreateSearch(type, arrFilters, arrColumns);
        //log("debug", stLoggerTitle, "New Save Search is Created");
    }
    
    var rs = search.runSearch();
    
    while (count == 1000 || init)
    {
        var resultSet = rs.getResults(min, max);
        arrResults = arrResults.concat(resultSet);
        min = max;
        max += 1000;
        init = false;
        count = resultSet.length;
    }

    
    var retVal = {
        length : arrResults.length ,
        saveSearch : search ,
        results : arrResults ,
        getResults : function(start, end)
        {
            return arrResults.slice(start, start + end);
        } ,
        gotoPage : function(page, displayItemCount)
        {
            displayItemCount = parseInt(displayItemCount);
            var len = resultSet.length;
            var cntPages = Math.ceil(len / displayItemCount);
            if (page > cntPages) return null;

            var pageResults = null;
            var start = 0;
            var end = displayItemCount;
            if (page <= 0)
            {
                pageResults = arrResults.slice(start, end);
            }
            else
            {
                start = (page * displayItemCount); // + (page -1);
                end = start + displayItemCount;

                //log("debug", "getAllResults", "start:" + start + " end:" + end);
                pageResults = arrResults.slice(start, end);
            }

            return pageResults;
        }
    };
    return (retVal);
}