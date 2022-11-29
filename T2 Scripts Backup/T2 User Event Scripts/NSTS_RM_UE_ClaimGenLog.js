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
 * 1.00       17 Jun 2015     pdeleon   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/**
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @return {void}
 */
function claimGenLog_beforeLoad(type, form, request) {
    try{
        handleSubsidiaryField();
        handleCurrencyField();
        
        if (type == HC_MODE_TYPE.Create) {
        	var stRebateAgreement = nlapiGetFieldValue(FLD_CLAIM_GEN_REBATE_AGREEMENT);
        	
        	if(!isEmpty(stRebateAgreement)){
	        	var objRebateAgreement = nlapiLookupField(REC_REBATE_AGREEMENT,stRebateAgreement,[FLD_CUSTRECORD_REMITTANCE_TYPE]);
	        	
	        	if(objRebateAgreement[FLD_CUSTRECORD_REMITTANCE_TYPE] == HC_REMIT_TYPE.None){
	    			throw nlapiCreateError('Error', "CGL cannot be created if Rebate Agreement's Remittance Type is None.", true);
	    		}
        	}
        	
        	
            disableFieldsBeforeLoadCreate(type);
            sourceFieldsBeforeLoad(type, form, request);
            enableDisableGLAccounts();
            disableDefaultFields();
            nlapiGetField(FLD_CLAIM_GEN_GENERATE_REVERSAL).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        } else if (type == HC_MODE_TYPE.Edit) {
            enableDisableGLAccounts();
            disableFieldsPerStatus();
            disableFieldsPerValue();
            disableDefaultFields();
            
            var stStatus = nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS);
            if (stStatus == HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process || 
                    stStatus == HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual) {
                try{
                    var arrFld = form.getAllFields(); //onjNewRec.getAllFields();
                    if(isEmpty(arrFld)){
                        arrFld = [];
                    }
                    log("DEBUG", "arrFld", JSON.stringify(arrFld));
                    for(var i in arrFld){
                        try{
                            var stFld = arrFld[i];
                            nlapiGetField(stFld).setDisplayType(HC_DISPLAY_TYPE.Inline);
                        }catch(e){
                            log("DEBUG", "arrFld Error",e);
                        }
                    }
                }catch(e){}
            }else if(stStatus == HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual_Error){
                nlapiGetField(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL).setDisplayType(HC_DISPLAY_TYPE.Normal); 
                nlapiGetField(FLD_CLAIM_GEN_GENERATE_CLAIM).setDisplayType(HC_DISPLAY_TYPE.Disabled); 
                
            }
        } else if (type == HC_MODE_TYPE.View) {
            disableDefaultFields();
            
            //if(nlapiGetFieldValue(FLD_CLAIM_GEN_GENERATE_CLAIM_AMOUNT) != 'T'){
                var stStatus = nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS);
                var bBypass = nlapiGetFieldValue(FLD_CLAIM_GEN_BYPASS_CLAIM);
                
                form.setScript('customscriptnsts_rm_claimdetsumsearch_cs');
                addButtonsPerStatus(form);
                
                if (isSpecialRole() &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Cancelled &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Completed &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Scheduled &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Reversal_Completed &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process &&
                        stStatus != HC_CLAIM_GEN_LOG_STATUS.Reversal_Error &&
                        bBypass != 'T') {
                    form.setScript('customscript_nsts_rm_cs_cancel_claim');
                    form.addButton(HC_CANCEL_CLAIM_GEN, 'Cancel Claim Generation', 'cancelClaimGeneration()');
                }
            //}
        }
    } catch(error) {
        if (error.getDetails != undefined)
        {
           nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
           throw error;
        }
        else
        {
           nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
           throw nlapiCreateError('99999', error.toString());
        }
    }
    
    try{

        var stDate = nlapiDateToString(new Date());
        log('DEBUG', 'FLDSERVERDATE', 'stDate:' + stDate);
        var fldServerDate = form.addField(FLD_CUSTPAGE_CLAIM_GEN_SERVER_DATE,HC_FIELD_TYPE.Date, "Server Date");
        fldServerDate.setDisplayType(HC_DISPLAY_TYPE.Hidden);
        log('DEBUG', 'FLDSERVERDATE setDefaultValue', 'set Field ');
        fldServerDate.setDefaultValue(stDate)
        log('DEBUG', 'FLDSERVERDATE', "SET DONE!");
        nlapiSetFieldValue('custrecord_nsts_rm_cgl_server_date', stDate);
        
        
        if (type == HC_MODE_TYPE.Create) {
            
            //nlapiGetField(FLD_CLAIM_GEN_REBATE_AGREEMENT).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
    }catch(e){
        
    }

}

/**
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @return {void}
 */

function claimGenLog_BeforeSubmit(type) {
    var stLogTitle = "CLAIMGENLOG_BEFORESUBMIT";
    try{
        if (type == HC_MODE_TYPE.Delete) {
            throw nlapiCreateError('ERROR', 'Claim Generatrion Logs cannot be deleted. Please cancel the record instead.', true);
        } else if (type == HC_MODE_TYPE.Copy) {
            throw nlapiCreateError('ERROR', 'Claim Generatrion Logs cannot be copied.', true);
        } else {
            // Check if a record already exists that uses the same Agreement and Transaction Dates
            var recNewRec = nlapiGetNewRecord();
            if (type == HC_MODE_TYPE.Create) {
                resetFieldsForCreate(recNewRec);                
            } else if (type == HC_MODE_TYPE.Xedit) {
                var stExecType = nlapiGetContext().getExecutionContext();
                var stStatus = recNewRec.getFieldValue(FLD_CLAIM_GEN_STATUS);
                if (!isEmpty(stStatus) && stExecType != HC_EXECTYPE_SCHEDULED) {
                    //Disable inline editing of status
                    throw new nlapiCreateError('9999', 'Inline editing of status is disabled', true);
                } else {
                    recNewRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
                }
            }
            
            var stClaimStat = nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS); 
            log("debug", stLogTitle, "#1 stClaimStat" + stClaimStat);
            if(isEmpty(stClaimStat)){
                stClaimStat = recNewRec.getFieldValue(FLD_CLAIM_GEN_STATUS); 
                log("debug", stLogTitle, "#1 stClaimStat" + stClaimStat);
            }

            updateClaimPeriod(recNewRec);
            var bCheckIfRAProc = checkIfAgreementInProcess(recNewRec);
            var isGenReversal = recNewRec.getFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL);
            log("DEBUG","claimGenLog_BeforeSubmit","STCLAIMSTAT:" + stClaimStat + " CIL:" + nlapiGetRecordId() + " bCheckIfRAProc:" + bCheckIfRAProc + " isGenReversal:" + isGenReversal) ;
            if (bCheckIfRAProc == true && stClaimStat != HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process && 
                            stClaimStat != HC_CLAIM_GEN_LOG_STATUS.Reversal_Completed 
                            && stClaimStat != HC_CLAIM_GEN_LOG_STATUS.Reversal_Error && isGenReversal == "F") {
                throw nlapiCreateError('Error', 'A Claim Generation Record in progress already exists for this Rebate Agreement and Dates', true);
            }

            var arrErrLog = checkDefaultSearches(recNewRec);
            if (!isEmpty(arrErrLog)) {
                var stErrLog = 'Problem(s) encountered when saving the record: ' + arrErrLog.join(', ');
                throw nlapiCreateError('Error', stErrLog, true);
            }
            
            if (nlapiGetContext().getExecutionContext() == HC_EXECTYPE_UI) {
                nlapiSetFieldValue(FLD_CLAIM_GEN_ERR_CODE, '', false, true);
            }

            var stIsGenClaim = nlapiGetFieldValue(FLD_CLAIM_GEN_GENERATE_CLAIM);
            var stcglStat = nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS);
            
            log("debug", stLogTitle, "log #3 HC_CLAIM_GEN_LOG_STATUS:" + JSON.stringify(HC_CLAIM_GEN_LOG_STATUS));
            if(stIsGenClaim == "T" && stcglStat != HC_CLAIM_GEN_LOG_STATUS.Completed){

                log("debug", stLogTitle, "STRAT ***Execution Scheduled Script***");
                var arrParam = [];
                var arrParamCGLVal = [nlapiGetRecordId()];

                arrParam[PARAM_CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_IDS] = parseJsonToString(arrParamCGLVal, "[]");
                arrParam[CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_USER] = nlapiGetUser();
                var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_CGL_GENERATE_CLAIMS,CUSTOMDEPLOY_NSTS_RM_CGL_GENERATE_CLAIMS,arrParam);
                if (stScheduleStatus == true) {
                    nlapiSetFieldValue(FLD_CLAIM_GEN_STATUS, HC_CLAIM_GEN_LOG_STATUS.Scheduled);
                }
                log("debug", stLogTitle, "END ***Execution Scheduled Script***");
            }

            //OVERRIDE CLAIM SUMMARY: REMOVED USER STORY
//            if(type == HC_MODE_TYPE.Edit){
//                var intClAmtLineCount = nlapiGetLineItemCount(SBL_CLAIM_GEN_CLAIM_AMOUNT);
//                var flTotalClAmt = 0;
//                
//                for (var line = 1; line <= intClAmtLineCount; line++) {
//                    flTotalClAmt += forceParseFloat(nlapiGetLineItemValue(SBL_CLAIM_GEN_CLAIM_AMOUNT, FLD_CLAIM_AMOUNT_OVERRIDE_REB_AMOUNT, line));
//                }
//                
//                nlapiSetFieldValue(FLD_CLAIM_GEN_TOTAL_CLAIM, flTotalClAmt);
//            }
        }
        
    } catch(error) {
    	log("debug", stLogTitle, "log #7");
        if (error.getDetails != undefined)
        {
           nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
           throw error;
        }
        else
        {
           nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
           throw nlapiCreateError('99999', error.toString());
        }
    }
    
    log("debug", stLogTitle, "END OF BEFORE SUBMIT");
}

function claimGenLog_AfterSubmit(type) {
    var recNewRec = nlapiGetNewRecord();
    
    var stClaimStat = recNewRec.getFieldValue(FLD_CLAIM_GEN_STATUS);
    stClaimStat = isEmpty(stClaimStat)? nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS) : stClaimStat;
    
    var isGenReversal = recNewRec.getFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL);
    isGenReversal = isEmpty(isGenReversal)? nlapiGetFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL): isGenReversal;
    
    var isGenerateReverseAccrual = recNewRec.getFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL);
    isGenerateReverseAccrual = isEmpty(isGenerateReverseAccrual)? nlapiGetFieldValues(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL) : isGenerateReverseAccrual
    
    
    
    var stPrevCGL = nlapiGetFieldValue(FLD_CLAIM_GEN_PREV_CGL);
    if(!isEmpty(stPrevCGL) && type == HC_MODE_TYPE.Create){
        var arrFieldsToChange = [FLD_CLAIM_GEN_STATUS,FLD_CLAIM_GEN_GENERATE_REVERSAL];
        var arrFielfsValues = [HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process,"T"];
        nlapiSubmitField(nlapiGetRecordType(), stPrevCGL, arrFieldsToChange, arrFielfsValues, false);
 
        var arrParam = [];
        arrParam[PARAM_CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_IDS_REVERSAL] = parseJsonToString([stPrevCGL], "[]");
        arrParam[CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_USER_REVERSAL] = nlapiGetUser();
        arrParam[CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_CURRENT_REVERSAL_CGL] = nlapiGetRecordId();
        var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_CGL_GENERATE_CLAIMS_REVERSAL,CUSTOMDEPLOY_NSTS_RM_CGL_GENERATE_CLAIMS_REVERSAL, arrParam)
    }
    
    log('DEBUG', 'CLAIMGENLOG_AFTERSUBMIT', "stClaimStat:" + stClaimStat + " isGenReversal:" + isGenReversal);
    if(stClaimStat == HC_CLAIM_GEN_LOG_STATUS.Reversal_Error && isGenReversal == "T" && type == HC_MODE_TYPE.Edit){
        var arrParam = [];
        arrParam[PARAM_CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_IDS_REVERSAL] = parseJsonToString([nlapiGetRecordId()], "[]");
        arrParam[CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_USER_REVERSAL] = nlapiGetUser();
        arrParam[CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_CURRENT_REVERSAL_CGL] = "";
        var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_CGL_GENERATE_CLAIMS_REVERSAL,CUSTOMDEPLOY_NSTS_RM_CGL_GENERATE_CLAIMS_REVERSAL, arrParam);
        
        var arrFieldsToChange = [FLD_CLAIM_GEN_STATUS];
        var arrFielfsValues = [HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process];
        nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), arrFieldsToChange, arrFielfsValues, false);
 
        log('DEBUG', 'CLAIMGENLOG_AFTERSUBMIT', "Executed: invokeScheduleScript");
    }

    if(stClaimStat == HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual_Error && isGenerateReverseAccrual == "T" && type == HC_MODE_TYPE.Edit){
        var arrParam = [];
        nlapiSetFieldValue(FLD_ACCRUAL_ISGENERATE, "T");
        
        var arrFieldsToChange = [FLD_CLAIM_GEN_STATUS];
        var arrFielfsValues = [HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual];
        nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), arrFieldsToChange, arrFielfsValues, false);
         
        arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_CGL] = parseJsonToString([nlapiGetRecordId()], "[]");
        arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_USER] = nlapiGetUser();;
        var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_SS_ACCRUALS_REVERSAL, CUSTOMDEPLOY_NSTS_RM_SS_ACCRUALS_REVERSAL, arrParam);
    
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTION
 * ====================================================================
 */

function generateClaim(){
	var blBypass = false;
	if (nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS) == HC_CLAIM_GEN_LOG_STATUS.Initiated ||
			nlapiGetFieldValue(FLD_CLAIM_GEN_STATUS) == HC_CLAIM_GEN_LOG_STATUS.Previewed) {
		blBypass = true;
	}
	
	var stMsg = "'By clicking on this button, claim transaction will be created, do you want to generate claim? '";
	if (blBypass) {
		stMsg += " + '\nThis would bypass the review process for the claim.'";
	}
	
	var stFxn = "nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), '"+FLD_CLAIM_GEN_GENERATE_CLAIM+"', 'T'); location.reload();";
	if (blBypass) {
		stFxn = "nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), '"+FLD_CLAIM_GEN_BYPASS_CLAIM+"', 'T'); previewAndPrintClaimDetail('T'); ";
	}
	
    var stConfirm = "var bConfirm = (confirm(" + stMsg + ")) ? true : false;"
        + "if(bConfirm){ " + stFxn + " }";
    return stConfirm;
}

function updateClaimStatus(stFieldName, stFieldValue){
    var stScript = "nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), "+stFieldName+", "+stFieldValue+"); location.reload();";
    return stScript;
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
 *//*
function getAllResults(type, id, arrFilters, arrColumns){
    var stLoggerTitle = 'GETALLRESULTS';
    if(isEmpty(type) && isEmpty(id))
    {
        return null;
    }
    
    //log("debug", stLoggerTitle, "type:{0},id{1}".format(type, id));
    
    var arrResults = [];
    var arrGetCols = [];
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
        arrGetCols = search.getColumns();
        
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
        columns : arrGetCols,
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
}*/