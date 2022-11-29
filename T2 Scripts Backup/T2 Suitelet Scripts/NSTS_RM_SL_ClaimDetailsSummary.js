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
 * Script used to create the Claim Summary and Details saved search.
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jul 2015     Roxanne Audette   Initial version.
 * 
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function claimDetailsSummarySearch_FormSuitelet(request, response) {
    if (request.getMethod() == 'GET') {
    	var stLoadType = request.getParameter('loadType'),
    		idClaimGenLog = request.getParameter('claimgenlog'),
    		bBypass = request.getParameter('bypass');
        try{
	        if(stLoadType == 'claimdetail'){
	        	processDetail(request);
	        }else if(stLoadType == 'claimsummary'){
	        	processSummary(request);
	        }  
        } catch (e) {
        	nlapiLogExecution('ERROR', 'Process Error', e.getCode() + ': ' + e.getDetails());
        	if (bBypass == 'T') {
        		nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, FLD_CLAIM_GEN_BYPASS_CLAIM, 'F');
        	}
        }
    }
    
    /*
     * Process Claim Detail
     */
    function processDetail(request) {
        var stLoadType = request.getParameter('loadType'),
        idClaimGenLog = request.getParameter('claimgenlog'),
        idClaimGenSearch = request.getParameter('claimgensearch'),
        idClaimDetSearch = request.getParameter('claimdetsearch'),
        idAgreement = request.getParameter('agreement'),
        idClaimTrans = request.getParameter('claimtrans'),
        dateTransStart = request.getParameter('startdate'),
        dateTransEnd = request.getParameter('enddate'),
        dateToday = nlapiDateToString(new Date(), 'datetimetz'),
        objUser = request.getParameter('userid'),
        idRebateType = request.getParameter('rebateType'),
        bPostByDept = request.getParameter('postbydept'),
        bPostByClass = request.getParameter('postbyclass'),
        bPostByLocation = request.getParameter('postbyloc'),
        stCGLTrans = request.getParameter('cgltrans'),
        flClaimAmount = request.getParameter('claimamount'),
        bTiered = request.getParameter('tiered'),
        bBypass = request.getParameter('bypass'),
        stCGLStatus = request.getParameter('cglstatus');
        var arFilters = [], arUpdateFields = [], arFieldValues = [], bHasResults = true;

        arFilters = [new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_REBATE_AGREEMENT, null, 'is', idAgreement),
            new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_CLAIM, null, 'is', '@NONE@'),
            new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_SELECTED, null, 'is', 'T'),
            new nlobjSearchFilter(FLD_REBATE_TRAN_DATE, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'onorafter', dateTransStart),
            new nlobjSearchFilter(FLD_REBATE_TRAN_DATE, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'onorbefore', dateTransEnd)];

       if(!isEmpty(idClaimTrans)){
           idClaimTrans = idClaimTrans.split(',');
           arFilters.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_TRAN_TYPE, null, 'anyof', idClaimTrans));
       }
       
       var objSearch = nlapiLoadSearch(null, idClaimGenSearch);
       if(isEmpty(idClaimDetSearch)){
           var objNewSearch = nlapiCreateSearch(objSearch.getSearchType(), objSearch.getFilters(), objSearch.getColumns());
           
           objNewSearch.setIsPublic(true);
           var objReturn = createRedirectToSearchResults(objNewSearch, null, idClaimGenLog, arFilters, true, (bTiered == 'T' || bBypass == 'T') ? false: true);
           var idNewSearch = objReturn.idNewSearch;
           idClaimDetSearch = idNewSearch;
           bHasResults = objReturn.bHasResults;
           
           //UPDATE CLAIM GENERATION CHECKLIST FIELDS
           arUpdateFields.push(FLD_CLAIM_GEN_DETAIL_SEARCH, 
                               FLD_CLAIM_GEN_IS_PREVIEWED,
                               FLD_CLAIM_GEN_PREVIEWED_BY,
                               FLD_CLAIM_GEN_PREVIEWED_ON);
           arFieldValues.push(idNewSearch, 'T', objUser, dateToday);
           
           if (!bHasResults) {
        	   arUpdateFields.push(FLD_CLAIM_GEN_ERR_CODE);
        	   arFieldValues.push('There are no Rebate Transaction Details to generate claim from. Please contact your Rebate Administrator.');
           }
           
           nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, arUpdateFields, arFieldValues);
       }else{       
           arFilters = arFilters.concat(objSearch.getFilters());
           if(isEmpty(stCGLTrans)) 
        	   createRedirectToSearchResults(null, idClaimDetSearch, idClaimGenLog, arFilters, false, (bTiered == 'T' || bBypass == 'T') ? false: true);
           else 
        	   updateFilterSearch(idClaimDetSearch, ['custrecord_nsts_rebate_claim'], ['anyof'], [stCGLTrans], true, true);
           
           bHasResults = checkIfSearchHasResults({idSearch: idClaimDetSearch});
           
           arUpdateFields.push(FLD_CLAIM_GEN_IS_PREVIEWED,
                   FLD_CLAIM_GEN_PREVIEWED_BY,
                   FLD_CLAIM_GEN_PREVIEWED_ON);
           arFieldValues.push('T', objUser, dateToday);
           
           if (!bHasResults) {
        	   arUpdateFields.push(FLD_CLAIM_GEN_ERR_CODE);
        	   arFieldValues.push('There are no Rebate Transaction Details to generate claim from. Please contact your Rebate Administrator.');
           }
           
           nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, arUpdateFields, arFieldValues);
       }
        
        if(bTiered == 'T' && stCGLStatus != HC_CLAIM_GEN_LOG_STATUS.Completed && bHasResults){
            var arrSchedParam = new Array();
            arrSchedParam['custscript_nsts_rm_cgl_id'] = parseJsonToString([idClaimGenLog], "[]");
            arrSchedParam['custscript1'] = true;

            
            nlapiScheduleScript('customscript_nsts_rm_compute_tier_ss', null,
                    arrSchedParam);
            
            var stScheduledScript = null;
            var objScriptSearch = nlapiSearchRecord('scheduledscript', null, new nlobjSearchFilter('scriptid', null, 'is',
                    'customscript_nsts_rm_compute_tier_ss'), new nlobjSearchColumn(HC_INTERNAL_ID));
            
            if(!isEmpty(objScriptSearch)){
                stScheduledScript = objScriptSearch[0].getValue(HC_INTERNAL_ID);
            }
        
            nlapiSetRedirectURL('RECORD', REC_CLAIM_GENERATION_LOG, idClaimGenLog, false);
        } else if (bBypass == 'T') {
    		if (bHasResults) {
            	arUpdateFields = [FLD_CLAIM_GEN_IS_CLAIM_DET_UPDATED,
                	FLD_CLAIM_GEN_CLAIM_DET_UPDATED_BY,
                	FLD_CLAIM_GEN_CLAIM_DET_UPDATED_ON,
     			   	FLD_CLAIM_GEN_IS_CLAIM_SUMM_REVIEWED,
     			   	FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_BY,
     			   	FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_ON];
                arFieldValues = ['T',
                	objUser,
                	dateToday,
                	'T',
                	objUser,
                	dateToday];
                
                nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, arUpdateFields, arFieldValues);
                
                processSummary(request, idClaimDetSearch,true);
    		} else {
    			nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, FLD_CLAIM_GEN_BYPASS_CLAIM, 'F');
    		}
        }

        if((!bHasResults && bTiered == 'T' ) ||  bBypass == 'T'){

            nlapiSetRedirectURL('RECORD', REC_CLAIM_GENERATION_LOG, idClaimGenLog, false);

       	}
    }
 
    /*
     * Process Claim Summary
     */
    function processSummary(requestm, idClaimDetSearch,bByPassFromGenClaim) {
        var stLoadType = request.getParameter('loadType'),
        idClaimGenLog = request.getParameter('claimgenlog'),
        idClaimGenSearch = request.getParameter('claimgensearch'),
        idClaimDetSearch = (isEmpty(idClaimDetSearch))? request.getParameter('claimdetsearch') : idClaimDetSearch,
        idAgreement = request.getParameter('agreement'),
        idClaimTrans = request.getParameter('claimtrans'),
        dateTransStart = request.getParameter('startdate'),
        dateTransEnd = request.getParameter('enddate'),
        dateToday = nlapiDateToString(new Date(), 'datetimetz'),
        objUser = request.getParameter('userid'),
        idRebateType = request.getParameter('rebateType'),
        bPostByDept = request.getParameter('postbydept'),
        bPostByClass = request.getParameter('postbyclass'),
        bPostByLocation = request.getParameter('postbyloc'),
        stCGLTrans = request.getParameter('cgltrans'),
        flClaimAmount = request.getParameter('claimamount'),
        bTiered = request.getParameter('tiered'),
        bBypass = request.getParameter('bypass'),
        stCGLStatus = request.getParameter('cglstatus');
        var arFilters = [], arUpdateFields = [], arFieldValues = [], bHasResults = true;
        
        //SUMMARY SEARCH
        var objClaimSummarySearch = getClaimSummarySearch(idClaimDetSearch, idRebateType,
                bPostByDept, bPostByClass, bPostByLocation);
        
        var flSummaryClaimAmount = 0;
        if(isEmpty(stCGLTrans)){
        	if(!bByPassFromGenClaim)
        		objClaimSummarySearch.setRedirectURLToSearchResults();
        	else
        		 nlapiSetRedirectURL('RECORD', REC_CLAIM_GENERATION_LOG, idClaimGenLog, false);
        }else{
            objClaimSummarySearch = updateFilterSearch(null, ['custrecord_nsts_rebate_claim'], ['anyof'], [stCGLTrans], true, false, objClaimSummarySearch);
        }     
        
        var objSummaryResults = getAllResults(REC_REBATE_TRAN_DETAIL, null, objClaimSummarySearch.getFilters(), 
                [new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, null, 'sum')]);

        if (!isEmpty(objSummaryResults)){
            var results = objSummaryResults.results;
            /*for (var i = 0; i < results.length; i++){
                var flAmountResult = parseFloat(results[i].getValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT));
                flSummaryClaimAmount += (!isNaN(flAmountResult)) ? flAmountResult : 0;
            }*/
            arUpdateFields.push(FLD_CLAIM_GEN_TOTAL_CLAIM);
            arFieldValues.push(results[0].getValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, null, 'sum'));
        }
        
        //UPDATE CLAIM GENERATION CHECKLIST FIELDS
        arUpdateFields.push(FLD_CLAIM_GEN_IS_REVIEWED,
                FLD_CLAIM_GEN_REVIEWED_BY,
                FLD_CLAIM_GEN_REVIEWED_ON);
        arFieldValues.push('T', objUser, dateToday);
        nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, arUpdateFields, arFieldValues);
        
        if (bBypass == 'T') {
            arUpdateFields = [FLD_CLAIM_GEN_GENERATE_CLAIM];
            arFieldValues = ['T'];
            
            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, idClaimGenLog, arUpdateFields, arFieldValues);
        }
        
        //REMOVED USER STORY: RUN CREATION OF CLAIM AMOUNT VIA SCHEDULED SCRIPT
//            if(stCGLStatus != HC_CLAIM_GEN_LOG_STATUS.Completed){
//                var arrClAmtParam = new Array();
//                var objCGLParam = {
//                      idClaimGenLog:   idClaimGenLog,
//                      idClaimDetSearch: idClaimDetSearch,
//                      idRebateType: idRebateType,
//                      bPostByDept: bPostByDept,
//                      bPostByClass: bPostByClass,
//                      bPostByLocation: bPostByLocation,
//                      stCGLTrans: stCGLTrans
//                };
//                
//                arrClAmtParam[SPARAM_CGL_JSON_PARAMETER] = parseJsonToString(objCGLParam, {});
//                
//                nlapiScheduleScript(SCRIPT_CREATE_CLAIM_AMOUNT, null,
//                        arrClAmtParam);
//            }
   }
}