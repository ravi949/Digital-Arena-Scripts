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
 * Contains the logic and validations for the Rebate Calculations for the 
 * Rebate Management solution 
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 May 2015     pdeleon   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/**
 * Does the preliminary checks and field population, such as if rebates will be calculated and if data can be edited
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */function rebatesCalculation_BeforeLoad(type, form, request){
    var stFormId = nlapiGetFieldValue(FLD_CUSTOMFORM);
    var stTranType = nlapiGetRecordType();
    var stTranTypeNumId = HC_REBATE_TRAN_TYPE[stTranType];
    var stTransformParam =  null;
    
    if (!isEmpty(request)) {
        stTransformParam = request.getParameter('transform');
    }
        
    if (!isEmpty(stTransformParam)) {
        // Workaround for transforms since Bill does not have the 'Created By' field
        var fldTransform = form.addField(HC_REBATE_CALC_FROM_TRANSFORM, 'checkbox', 'From Transform');
        fldTransform.setDefaultValue('T');
        fldTransform.setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }
    nlapiLogExecution('debug', 'in');
    var blApplyRebateForm = checkFormForRebatesApplication(stTranTypeNumId, stFormId);
    
    // Mark the Apply Rebates check box depending if rebates should apply to the form or not  
    if (!blApplyRebateForm) {
        var intTotalItem = nlapiGetLineItemCount(SBL_ITEM);
        setRebateFieldColumnValues(type, intTotalItem);
        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_APPLY_REBATES, 'F', false, true);
    } else {
        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_APPLY_REBATES, 'T', false, true);
    
        var stCreatedFrom = nlapiGetFieldValue(FLD_CREATED_FROM);
        
        var stContext = nlapiGetContext().getExecutionContext();
        var stBackgroundProcess = nlapiGetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
        
        if (type != HC_MODE_TYPE.View 
                && stBackgroundProcess == 'T' 
                && stContext != HC_CONTEXT.Scheduled) {
            // Use record type to check if the record will be processed in a scheduled run
            var arrTran = retrieveTranTypesForScheduledRun();
            
            if (arrTran.indexOf(HC_REBATE_TRAN_TYPE[stTranType]) < 0) {
                throw nlapiCreateError('Error', 'Transaction cannot be updated while in background process', true);
            }
        }
    
        if ((type == HC_MODE_TYPE.Create && (!isEmpty(stCreatedFrom) || !isEmpty(stTransformParam))) ||
                type == HC_MODE_TYPE.Copy) {
            //If created from another record, check the original record type
            var intTotalItem = nlapiGetLineItemCount(SBL_ITEM);
            setRebateFieldColumnValues(type, intTotalItem);
            nlapiSetFieldValue(FLD_RECALCULATE_REBATES, 'T', false, true);
        }
        
        // Hide recalc checkboxes for credit transactions from transform
        if (!isEmpty(stCreatedFrom) || !isEmpty(stTransformParam)) {
            disableRecalcCheckboxesIfCreditTransaction(stTranType);
        }

        // Clear out the 'To Delete' field
        var objFldToDelete = form.getField(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE);
        if(!isEmpty(objFldToDelete)){
            try{
                objFldToDelete.setDefaultValue("");
            }catch(e){ }
        }
        
        // Populate base currency field for use for computatations and conversions
        if(HC_OBJ_FEATURE.bMultiCurrency == true){ 
            var stBaseCurrency = nlapiGetFieldValue(FLD_CUSTBODY_BASE_CURR);
            if (type == HC_MODE_TYPE.Create || (type == HC_MODE_TYPE.Edit && isEmpty(stBaseCurrency))) {
                var objCompanyInfo = nlapiLoadConfiguration(HC_COMPANY_INFO);
                stBaseCurrency = objCompanyInfo.getFieldValue(HC_ACCT_BASE_CURRENCY);
                nlapiSetFieldValue(FLD_CUSTBODY_BASE_CURR, stBaseCurrency, false, true);
            }
        }
    }
}

/**
 * Primarily concerned with the creation and calculation of the rebates per line item,
 * and passing the process to a scheduled script if selected by the user
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @return {void}
 */
function rebatesCalculation_BeforeSubmit(type){
    var stLogTitle = "REBATESCALCULATION_BEFORESUBMIT";
    
    var stFormId = nlapiGetFieldValue(FLD_CUSTOMFORM);
    var stTranType = nlapiGetRecordType();
    var stTranTypeNumId = HC_REBATE_TRAN_TYPE[stTranType];
    if (isEmpty(stFormId) && type != HC_MODE_TYPE.Create) {
        var recNewRec = nlapiLoadRecord(stTranType, nlapiGetRecordId());
        stFormId = recNewRec.getFieldValue(FLD_CUSTOMFORM);
    }
    
    var blApplyRebates = checkFormForRebatesApplication(stTranTypeNumId, stFormId);
    if (blApplyRebates && blApplyRebates != 'F') {
        //log("debug", stLogTitle, "type: " + type + " rectype: " + nlapiGetRecordType() + " id:" + nlapiGetRecordId());
        if(type == HC_MODE_TYPE.Delete){
            var rec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
            
            var arrTRClaims = getExistingClaimOnRT(rec);
            log("debug", stLogTitle, "arrTRClaims: " + parseJsonToString(arrTRClaims));
            if(!isEmpty(arrTRClaims)){
                // Transactions can't be deleted if claims are already filed
                throw nlapiCreateError("99999", "Record cannot be deleted as there are Accrual JE\/Claims associated with the transaction");
            }else{
                // Delete RT and RTDs if transaction will be deleted
                if(!isEmpty(rec)){
                    var intItmCount = rec.getLineItemCount(SBL_ITEM); //nlapiGetLineItemCount(SBL_ITEM);
                    var arrRTId = [];
                    for (var linenum = 1; linenum <= intItmCount; linenum++) {
                        arrRTId.push(rec.getLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, linenum));
                    }
                    log("debug", stLogTitle, "arrRTId:" + parseJsonToString(arrRTId, "[]"));
                    removeRTAndRTD(arrRTId);
                }
            }
        }else if(type == HC_MODE_TYPE.Create || type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Copy){
            var objContext = nlapiGetContext();
            if(objContext.getExecutionContext() == 'csvimport'){
                validatedTransaction();
            }
            log("debug",stLogTitle, objContext.getExecutionContext());
            computeGrossProfit();

            nlapiSetFieldValue(FLD_CUSTBODY_RM_ER_CODE, '', false, true);
        }else if(type == HC_MODE_TYPE.Cancel || type == HC_MODE_TYPE.Reject || type == HC_MODE_TYPE.Close ){
            var arrTRClaims = getExistingClaimOnRT();
            log("debug", stLogTitle, "arrTRClaims: " + parseJsonToString(arrTRClaims));
            
            if(!isEmpty(arrTRClaims)){
                // Transactions can't be cancelled if claims are already filed
                throw nlapiCreateError("99999", "Record cannot be " + type + " as there are Claims associated with the transaction");
            }else{
                // Inactivate RT and RTDs if transaction will be cancelled
                var intItmCount = nlapiGetLineItemCount(SBL_ITEM);
                for (var linenum = 1; linenum <= intItmCount; linenum++) {
                   var rtId = nlapiGetLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, linenum);
                   setInactiveRTAndRTD(rtId, "T");
                }
            }
        }
    }
}

/**
 * Primarily concerned with the creation and calculation of the rebates per line item,
 * and passing the process to a scheduled script if selected by the user.
 * Also creates the Rebate Transactions and Rebate Transaction Details
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @return {void}
 */
function RebatesCalculation_afterSubmit(type) {
    var recNewRec = nlapiGetNewRecord();
    if (type == HC_MODE_TYPE.Xedit) {
        recNewRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    }
    
    var stFormId = nlapiGetFieldValue(FLD_CUSTOMFORM);
    if (isEmpty(stFormId)) {
        stFormId = recNewRec.getFieldValue(FLD_CUSTOMFORM);
    }
    var stTranType = nlapiGetRecordType();
    var stTranTypeNumId = HC_REBATE_TRAN_TYPE[stTranType];
    
    var blApplyRebates = checkFormForRebatesApplication(stTranTypeNumId, stFormId);
    if (blApplyRebates && blApplyRebates != 'F') {
        try {
            var stLogTitle = "REBATESCALCULATION_AFTERSUBMIT";
            var stExecType = nlapiGetContext().getExecutionContext();
            var intNewRecId = nlapiGetRecordId();
            var stRecType = nlapiGetRecordType();
            var stCreatedFrom = recNewRec.getFieldValue(FLD_CREATED_FROM);
            var stTransform = nlapiGetFieldValue(HC_REBATE_CALC_FROM_TRANSFORM);
            var blTransform = !isEmpty(stTransform) && stTransform == 'T';
          	var fldRecalc = recNewRec.getFieldValue(FLD_RECALCULATE_REBATES);
            log("debug", stLogTitle, "type:" + type);
            nlapiLogExecution('DEBUG','RebatesCalculation_afterSubmit', 
                '**Begin Script ** Execution Context: ' + stExecType + ' Record: ' + stRecType);
    
            var bBackgroundProcess = nlapiGetNewRecord().getFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
            nlapiLogExecution('DEBUG','RebatesCalculation_afterSubmit', 'Background Process : ' + bBackgroundProcess);
            
            if (stExecType != HC_CONTEXT.Scheduled) {
                if (type == HC_MODE_TYPE.DropShip || type == HC_MODE_TYPE.SpecOrder) {
                    resetDataForDropship(recNewRec);
                    bBackgroundProcess = 'T';
                }
                
                if(bBackgroundProcess =='T') {
                    var arrTran = retrieveTranTypesForScheduledRun();
                    
                    // Use record type to check if the record will be processed in a scheduled run
                    if (arrTran.indexOf(HC_REBATE_TRAN_TYPE[stRecType]) < 0) {
                        var arrParam = {};
                        arrParam[SPARAM_TXN_ID] = nlapiGetRecordId();
                        arrParam[SPARAM_TXN_TYP] = stRecType;
                        nlapiScheduleScript(SCRIPT_ASYNC_SCHEDULED,null,arrParam);

                        nlapiLogExecution('DEBUG','RebatesCalculation_afterSubmit',
                        '***Trigger Background Process Scheduled Script - FINISHED***');
                    }
                } else if(type == HC_MODE_TYPE.Create && (!isEmpty(stCreatedFrom) || blTransform)){
                    updatedRebateTransactionRecords(recNewRec);
                }else if(type == HC_MODE_TYPE.Create && (isEmpty(stCreatedFrom) && !blTransform)){
                    createRebateTransactionRecords(recNewRec);
                    
                }else if((type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Xedit) && fldRecalc == 'T'){
                    updatedRebateTransactionRecords(recNewRec);
                }
            }
        
            nlapiLogExecution('DEBUG','RebatesCalculation_afterSubmit', '**End Script **' );
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
    }
}

/*
 * Checks if claims have already been filed for the transaction and if fields referenced by the claims will be updated
 */
function validatedTransaction(){
    var stLogTitle = "VALIDATEDTRANSACTION";
    var objContext = nlapiGetContext();
    
    if(objContext.getExecutionContext() == "csvimport"){
        var arrTRClaims = getExistingClaimOnRT();
        if(!isEmpty(arrTRClaims)){
            var intErrCount = 0;
            var arrError = [];
            var objNewRec = nlapiGetNewRecord();
            var objOldRec = nlapiGetOldRecord(); //nlapiGetNewRecord();
            
            var stNewEntity = objNewRec.getFieldValue(FLD_ENTITY);
            var stOldEntity = objOldRec.getFieldValue(FLD_ENTITY);
            
            var stNewCurrency = objNewRec.getFieldValue(FLD_CURRENCY);
            var stOldCurrency = objOldRec.getFieldValue(FLD_CURRENCY);
            
            var stNewTranDate = objNewRec.getFieldValue(FLD_TRANDATE);
            var stOlTranDate = objOldRec.getFieldValue(FLD_TRANDATE);
            
            log("debug", stLogTitle, "stNewEntity:" + stNewEntity + " ,stOldEntity:" + stOldEntity + 
                    " stNewCurrency:" + stNewCurrency + " ,stOldCurrency:" + stOldCurrency +
                    " stNewTranDate:" + stNewTranDate + " ,stOlTranDate:" + stOlTranDate
            );
            
            if(stNewEntity != stOldEntity){
                intErrCount++;
                arrError.push("Not Allowed to Change the Entity! There is an Existing Claims");
            }
            
            if(stNewCurrency != stOldCurrency){
                intErrCount++;
                arrError.push("Not Allowed to Change the Currency! There is an Existing Claims");
            }
            
            if(stNewTranDate != stOlTranDate){
                intErrCount++;
                arrError.push("Not Allowed to Change the Date! There is an Existing Claims");
            }
            
            var intNewItemCount = objNewRec.getLineItemCount(SBL_ITEM);
            var intOldItemCount = objOldRec.getLineItemCount(SBL_ITEM);
            
            for (var newLn = 1; newLn <= intNewItemCount; newLn++) {
                var stNewLineId = nlapiGetLineItemValue(SBL_ITEM, "line", newLn);
                
                var stNewItem = nlapiGetLineItemValue(SBL_ITEM, FLD_ITEM, newLn);
                var stNewAmt = nlapiGetLineItemValue(SBL_ITEM, FLD_AMOUNT, newLn);
                var stNewQty = nlapiGetLineItemValue(SBL_ITEM, FLD_QUANTITY, newLn);
                var stNewUnit = nlapiGetLineItemValue(SBL_ITEM, FLD_UNITS, newLn);
                
                var stNewRebPOSO = nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, newLn);
                var stNewRebCust = nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, newLn);

                
                for (var oldLn = 1; oldLn <= intOldItemCount; oldLn++) {
                    var stOldLineId = objOldRec.getLineItemValue(SBL_ITEM, "line", oldLn);
                    
                    var stOldItem = objOldRec.getLineItemValue(SBL_ITEM, FLD_ITEM, oldLn);
                    var stOldAmt = objOldRec.getLineItemValue(SBL_ITEM, FLD_AMOUNT, oldLn);
                    var stOldQty = objOldRec.getLineItemValue(SBL_ITEM, FLD_QUANTITY, oldLn);
                    var stOldnit = objOldRec.getLineItemValue(SBL_ITEM, FLD_UNITS, oldLn);
                    
                    var stOldRebPOSO = objOldRec.getLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, oldLn);
                    var stOldRebCust = objOldRec.getLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, oldLn);
                    
                    if(stNewLineId == stOldLineId){
                        if(stNewItem != stOldItem){
                            intErrCount++;
                            arrError.push("Line Number " + newLn + " : Not Allowed to Change the Item! There is an Existing Claims on the Current RT");
                        }
                        
                        if(stNewAmt != stOldAmt){
                            intErrCount++;
                            arrError.push("Line Number " + newLn + " : Not Allowed to Change the Amount! There is an Existing Claims on the Current RT");
                        }
                        
                        if(stNewQty != stOldQty){
                            intErrCount++;
                            arrError.push("Line Number " + newLn + " : Not Allowed to Change the Quaantity! There is an Existing Claims on the Current RT");
                        }
                        
                        if(stNewUnit != stOldnit){
                            intErrCount++;
                            arrError.push("Line Number " + newLn + " : Not Allowed to Change the Unit! There is an Existing Claims on the Current RT");
                        }
                        
                        if(stNewRebPOSO != stOldRebPOSO || stNewRebCust != stOldRebCust){
                            intErrCount++;
                            arrError.push("Line Number " + newLn + " : Not Allowed to Change the Selected Rebates! There is an Existing Claims on the Current RT");
                        }
                        
                    }
                    
                }
            }

            if(intErrCount> 0){
                throw nlapiCreateError("99999", arrError.join("\n"));
            }
        }
    }
}

/*
 * Hides the recalculate checkboxes for credit transactions from transforms
 */
function disableRecalcCheckboxesIfCreditTransaction(stRecType) {
    if (HC_NEGATIVE_REBATE_REC_TYPES.indexOf(stRecType) > -1) {
        var fldRecalc = nlapiGetField(FLD_RECALCULATE_REBATES);
        var fldCalcBG = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
        
        fldRecalc.setDisplayType(HC_DISPLAY_TYPE.Hidden);
        fldCalcBG.setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }
}