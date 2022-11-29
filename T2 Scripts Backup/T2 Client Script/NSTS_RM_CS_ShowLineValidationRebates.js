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
 * 1.00       29 Apr 2015     pdeleon   Initial version.
 * 
 */

var RECORDTYPE = nlapiGetRecordType();
var FLDVAL_ENTIITY = null;
var FLDVAL_TRANDATE = null;
var FLDVAL_LOCATION = null;
var stBaseCurrency = null;
var FLDVAL_ITEM = null;
var FLDVAL_UNIT = null;
var FLDVAL_QTY = null;
var FLDVAL_AMT = null;
var FLDVAL_REBSOPO = null;
var FLDVAL_REBCUST = null;
var FLDVAL_ISCLOSED = null;
var FLDVAL_CURRENCY = null;
var HC_PAGE_TYPE = null;
var HC_HAS_REBATES = false;
var HC_MAX_TRAN_LINE = 5;

var FLAG_VALIDATED_CHANGE = {
    isAllowChange : false,
    isHasCLaims : false
};

var blApplyRebates = false;

var bToggleAlert = false;
var bToggleConfirmation = false;

var ST_PREVENTDOUBLE_RECURSION_ENTITY = "";
var ST_PREVENT_FIELD_EVENTCHAIN = "";

var ST_RECORD_ID = "";
/**
 * 
 * @param type
 */
function showRebateAgreements_pageInit(type){
    var objParam = getScriptParam();
    bToggleAlert = objParam.toggle_alert;
    bToggleConfirmation = objParam.toggle_confirmation;
    
    ST_RECORD_ID = nlapiGetRecordId();

    var stApplyRebates = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_APPLY_REBATES);
    var idRA = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RA_ID);
    if (!isEmpty(idRA) && type == HC_MODE_TYPE.Edit) {
    	alert('Affected Accrual and Claim Transactions and Reversal may need to be updated manually if this transaction will be deleted or voided.');
    }
    
    if (stApplyRebates == 'T') {
        blApplyRebates = true;
        var intItemLine = nlapiGetLineItemCount(SBL_ITEM);
        
        HC_PAGE_TYPE = type;
        if(!isEmpty(RECORDTYPE)){
            FLDVAL_ENTIITY = nlapiGetFieldValue(FLD_ENTITY);
            FLDVAL_TRANDATE = nlapiGetFieldValue(FLD_TRANDATE);
            FLDVAL_LOCATION = nlapiGetFieldValue(FLD_LOCATION);
            FLDVAL_CURRENCY = nlapiGetFieldValue(FLD_CURRENCY);
            
            FLDVAL_ISCLOSED = nlapiGetFieldValue(FLD_ISCLOSED);
            stBaseCurrency = nlapiGetFieldValue(FLD_CUSTBODY_BASE_CURR);
        }
        
        //MANIPULATION OF REBATE TRANSACTION COLUMN FIELD
        if(type == HC_MODE_TYPE.Edit){
            var arRebateTranIds = [];
            /*GET ALL REBATE RANSACTION IDS IN THE SUBLIST AND SET IT ON THE CUSTOM FIELD.
            THE CUSTOM FIELD IS USED FOR THE COPY PREVIOUS LINE FUNCTIONALITY - IF THE
            REBATE TRANSACTION ALREADY EXISTS ON THE LINE, SET IT TO BLANK*/
            for(var line = 1; line <= intItemLine; line++){
                var idRebateTrans = nlapiGetLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, line);
                if(forceParseFloat(idRebateTrans) > 0) arRebateTranIds.push(idRebateTrans);
            }
            nlapiSetFieldValue('custbody_nsts_rm_rebate_tran_ids', arRebateTranIds.toString());
            if (!isEmpty(arRebateTranIds)) {
                HC_HAS_REBATES = true;
            }
        }
        
        if (type == HC_MODE_TYPE.Create ||
                type == HC_MODE_TYPE.Edit || 
                type == HC_MODE_TYPE.Copy) {
            var intMaxLine = nlapiGetContext().getSetting('SCRIPT', PARAM_CUSTSCRIPT_NSTS_MAX_TRAN_LINE_CS);
            if (!isEmpty(intMaxLine) &&
                    intMaxLine >= 0) {
                HC_MAX_TRAN_LINE = intMaxLine;
            }

            if (type != HC_MODE_TYPE.Create) {
                checkItemCountForBGProcesing(intItemLine, true);
            }
        }
    }
}

/**
 * 
 * @param type
 * @param name
 * @param linenum
 * @returns {Boolean}
 */
function showRebateAgreements_validateField(type, name, linenum) {
    if (blApplyRebates) {

        var returnVal = true;
        var isHasClaims = false;
        
        var itemCount = 0;
        
        var arrClaimOnRT = [];
        if(ST_PREVENTDOUBLE_RECURSION_ENTITY == name){
            ST_PREVENTDOUBLE_RECURSION_ENTITY="";
            return true;
        }
        if (name == FLD_ENTITY) {
            if(ST_PREVENT_FIELD_EVENTCHAIN == name){
                ST_PREVENT_FIELD_EVENTCHAIN = '';
                return true; 
            }
            ST_PREVENT_FIELD_EVENTCHAIN = name;
            
            if(FLDVAL_ENTIITY != nlapiGetFieldValue(FLD_ENTITY)){
                
                if(!isEmpty(ST_RECORD_ID)){
                    arrClaimOnRT =  getExistingClaimOnRT();  
                }

                if(!isEmpty(arrClaimOnRT)){
                    
                    var isConfirm = false;
                    if(bToggleConfirmation){
                        isConfirm = confirm("There is an Existing Accrual JE\/Claims!\nDo you really want to change the value on Entity?");
                    }
                    isHasClaims = true;
                    returnVal = isConfirm;
                    if(!isConfirm){
                        ST_PREVENTDOUBLE_RECURSION_ENTITY = name;
                        nlapiSetFieldValue(FLD_ENTITY, FLDVAL_ENTIITY, false);   
                    }
                }
                if(returnVal){
                    returnVal = func_updateLines(returnVal,name,arrClaimOnRT);
                }
            }
            
            FLAG_VALIDATED_CHANGE.isAllowChange = returnVal;
            FLAG_VALIDATED_CHANGE.isHasCLaims = isHasClaims;
        }else if (name == FLD_TRANDATE) {
            if(ST_PREVENT_FIELD_EVENTCHAIN == name){
                ST_PREVENT_FIELD_EVENTCHAIN = '';
                return true; 
            }
            ST_PREVENT_FIELD_EVENTCHAIN = name;
            
            if(FLDVAL_TRANDATE != nlapiGetFieldValue(FLD_TRANDATE)){
                if(!isEmpty(ST_RECORD_ID)){
                    arrClaimOnRT =  getExistingClaimOnRT();  
                }
                //var arrRTDelete = parseStringToJson( nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE) , []);
                
                if(!isEmpty(arrClaimOnRT)){
    
                    var isConfirm = false;
                    if(bToggleConfirmation){
                        isConfirm = confirm("There is an Existing Accrual JE\/Claims!\nDo you really want to change the value on Transaction Date?");
                    }
                    isHasClaims = true;
                    returnVal = isConfirm;
                    if(!isConfirm){
                        ST_PREVENTDOUBLE_RECURSION_ENTITY = name;
                        nlapiSetFieldValue(FLD_TRANDATE, FLDVAL_TRANDATE, false);
                    }
                }
                var idTransaction = nlapiGetRecordId();
                var stCreatedFrom = nlapiGetFieldValue(FLD_CREATED_FROM);
                if(returnVal && 
                		!(HC_PAGE_TYPE == HC_MODE_TYPE.Copy || (isEmpty(idTransaction) && !isEmpty(stCreatedFrom)))){
                    returnVal = func_updateLines(returnVal,name,arrClaimOnRT);
                }
            }
            
            FLAG_VALIDATED_CHANGE.isAllowChange = returnVal;
            FLAG_VALIDATED_CHANGE.isHasCLaims = isHasClaims;
        }else if (name == FLD_CURRENCY) {
            if(ST_PREVENT_FIELD_EVENTCHAIN == name){
                ST_PREVENT_FIELD_EVENTCHAIN = '';
                return true; 
            }
            ST_PREVENT_FIELD_EVENTCHAIN = name;
            
            if(FLDVAL_CURRENCY != nlapiGetFieldValue(FLD_CURRENCY)){
                if(!isEmpty(ST_RECORD_ID)){
                    arrClaimOnRT =  getExistingClaimOnRT();  
                }
                //var arrRTDelete = parseStringToJson( nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE) , []);
                
                if(!isEmpty(arrClaimOnRT)){
    
                    var isConfirm = false;
                    if(bToggleConfirmation){
                        isConfirm = confirm("There is an Existing Accrual JE\/Claims!\nDo you really want to change the value on Currency?");
                    }
                    
                    isHasClaims = true;
                    returnVal = isConfirm;
                    if(!isConfirm){
                        ST_PREVENTDOUBLE_RECURSION_ENTITY = name;
                        nlapiSetFieldValue(FLD_CURRENCY, FLDVAL_CURRENCY, false);
                    }
                }
                if(returnVal){
                    returnVal = func_updateLines(returnVal,name,arrClaimOnRT);
                }
            }
            
            FLAG_VALIDATED_CHANGE.isAllowChange = returnVal;
            FLAG_VALIDATED_CHANGE.isHasCLaims = isHasClaims;
            
        }else if(name == FLD_LOCATION && HC_OBJ_FEATURE.bMultiLocationInventory == true){
            if(ST_PREVENT_FIELD_EVENTCHAIN == 'employee'){
                ST_PREVENT_FIELD_EVENTCHAIN = '';
                return true; 
            }
            
            if (isEmpty(type)) {
                if (isEmpty(FLDVAL_LOCATION)) {
                    FLDVAL_LOCATION = nlapiGetFieldValue(FLD_LOCATION);
                    var intTotalItem = nlapiGetLineItemCount(SBL_ITEM);
                    if (intTotalItem > 0 && HC_HAS_REBATES) {
                        
                        var stRecalc = nlapiGetFieldValue(FLD_RECALCULATE_REBATES);
                        if (stRecalc != 'T') {
                            if(bToggleAlert){
                                alert('You need to click each line and click Ok Button to recalculate or Check the Calculate Rebates in Background. ' + 
                                        '\n\nIf you selected rebates manually, you will need to reselect rebates before clicking OK on each line or after the background recalculation completes.' + 
                                        '\n\nBackground Recalculation is complete when the box is unchecked.');
                            }
                            
                            nlapiSetFieldValue(FLD_RECALCULATE_REBATES, 'T', false);
                            var objField = nlapiGetField(FLD_RECALCULATE_REBATES);
                            objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                        }
                    }
                } else {
                    var intTotalItem = nlapiGetLineItemCount(SBL_ITEM);
                    if (intTotalItem > 0 && HC_HAS_REBATES) {
                       nlapiSetFieldValue(FLD_RECALCULATE_REBATES, 'T', false);
                       var stRecalc = nlapiGetFieldValue(FLD_RECALCULATE_REBATES);
                       if (stRecalc== 'T') {
                           if(bToggleAlert){
                               alert('You need to click each line and click Ok Button to recalculate or Check the Calculate Rebates in Background. ' + 
                                       '\n\nIf you selected rebates manually, you will need to reselect rebates before clicking OK on each line or after the background recalculation completes.' + 
                                       '\n\nBackground Recalculation is complete when the box is unchecked.');   
                           }
                       }
                       //nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T', false);
                       var objField = nlapiGetField(FLD_RECALCULATE_REBATES);
                       objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                    }
                }
            } else {
                
                if(type == SBL_ITEM){
                    var stBGProcess = nlapiGetFieldValue(CUSTBODY_NSTS_RM_RECALCULATE_BACKGROUN);
                    if (stBGProcess != 'T') {
                        // If line level location si changed, refetch the cost basis and recompute the rebate amounts
                        var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
                        if (!isEmpty(stItem)) {
                            var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
                            if (stItemType == 'ASSEMBLY' || stItemType == 'KIT') {
                                // If item is assembly, reprocess the cost basis and rebates in the background 
                                if (stBGProcess != 'T') {
                                    if(bToggleAlert){
                                        alert('The transaction has kits or assemblies and rebates will be calculated in background. ' + 
                                                'When the rebates are calculated, you will receive an email and the \'Calculate Rebates in Background\' checkbox will be unchecked.  ' + 
                                                'Refresh or return to the transaction to make any changes to selections.');   
                                    }
    
                                }
                                nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
                                var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
                                objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                            } else {
                                setCostBases(stItemType);
                                
                                var stSelectedRebates = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES,linenum);
                                var stSelectedRebates_cust = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,linenum);
                                
                                var arrPOSO = parseStringToJson(stSelectedRebates);
                                var arrCust = parseStringToJson(stSelectedRebates_cust);
                                var arrRebates = [];
                                //clean if event arrPOSO is an array concat it on arrRebates
                                if(arrPOSO instanceof Array){
                                    arrRebates = arrRebates.concat(arrPOSO);
                                }
                                //clean if event arrCust is an array concat it on arrRebates
                                if(arrCust instanceof Array){
                                    arrRebates = arrRebates.concat(arrCust);
                                }
    
                                setRebateTotalAmoun(arrRebates);
                            }
                        }//if (!isEmpty(stItem))
                    }//if (stBGProcess != 'T')
                }//if(type == SBL_ITEM){
                
            }//if (isEmpty(type))
        }else if(name == 'employee'){
           
            ST_PREVENT_FIELD_EVENTCHAIN = name;
            return true;
        }
      
        return returnVal;
    } else {
        return true;
    }
}

function func_updateLines(returnVal, name,arrClaimOnRT){
    if(returnVal && (name == FLD_ENTITY || name == FLD_TRANDATE || name == FLD_CURRENCY)){
        
        console.log('FLAG_VALIDATED_CHANGE');
        console.log("Name:" + name);
        console.log(FLAG_VALIDATED_CHANGE);
        
        var arrRTDelete = parseStringToJson( nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE) , []);
        var stRebateInfoChanged = false;
        itemCount = nlapiGetLineItemCount(FLD_ITEM);
        
        for(var intlinenum = 1; intlinenum <= itemCount; intlinenum++){
            stRebateInfoChanged = true;
            nlapiSelectLineItem(SBL_ITEM, intlinenum);
            var stEntity = nlapiGetFieldValue(FLD_ENTITY);
            var stItem = getCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            if(!isEmpty(stEntity) && !isEmpty(stItem)){
                    
                var intRT = parseInt(nlapiGetLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, intlinenum));                
                intRT = (intRT)? intRT : 0;
                //getDefaultRebates();
                
                //RTId
                var bisHasClaims = false;
                if(isEmpty(arrClaimOnRT)){
                    arrClaimOnRT =  getExistingClaimOnRT();
                }
               
                if(!isEmpty(arrClaimOnRT)){
                    for(var i in arrClaimOnRT){
                        var objRTClaims = arrClaimOnRT[i];
                        if(objRTClaims.RTId == intRT){
                            bisHasClaims = true;
                        }
                    }
                }
                
                if(!bisHasClaims){
                    
                    var isOverride = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE);
                    
                    if(isOverride != 'T'){
                        setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_PURCHASE_REBATE_AMT, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_CUSTOMER_REBATE_AMT, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, "", false);
                        if (name == FLD_CURRENCY) {
                            setCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, "", false);
                        }
                        
                        if(arrRTDelete.indexOf(intRT)< 0 && intRT > 0){
                            arrRTDelete.push(intRT);
                        }
                        
                        nlapiCommitLineItem(SBL_ITEM);
                    }

                }
                
                
            }
            
            /*var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            if(!isEmpty(stItem)){
                nlapiCommitLineItem(SBL_ITEM);
            }*/
        }
        
        var stFieldChangeValHolder = null;
        if(name == FLD_ENTITY){
            stFieldChangeValHolder = FLDVAL_ENTIITY;
        }else if(name == FLD_TRANDATE){
            stFieldChangeValHolder = FLDVAL_TRANDATE;
        }else if(name == FLD_LOCATION){
            stFieldChangeValHolder = FLD_LOCATION;
        }else if(name == FLD_CURRENCY){
            stFieldChangeValHolder = FLD_CURRENCY;
        }
        
        if(!isEmpty(stFieldChangeValHolder)){
            var intItemCount = nlapiGetLineItemCount(SBL_ITEM);
            if (intItemCount > 0) {
                nlapiSetFieldValue(FLD_RECALCULATE_REBATES, 'T', false);
                var objField = nlapiGetField(FLD_RECALCULATE_REBATES);
                objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
            }
        }

        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE, parseJsonToString(arrRTDelete, "[]"), false);
        
        FLAG_VALIDATED_CHANGE.isAllowChange = false;
        FLAG_VALIDATED_CHANGE.isHasCLaims = false;
    }else if(returnVal == false && (name == FLD_ENTITY || name == FLD_TRANDATE || name == FLD_CURRENCY)){
        //alert("isAllowChange:" + FLAG_VALIDATED_CHANGE.isAllowChange + " isHasCLaims:" + FLAG_VALIDATED_CHANGE.isHasCLaims);
        returnVal = true;
    }
    
    return returnVal;
}

/**
 * get the previous field Data
 */
function showRebateAgreements_lineInit(type){
    if (blApplyRebates) {
        console.log("SHOWREBATEAGREEMENTS_LINEINIT : " + type);
        if(type == SBL_ITEM){
            FLDVAL_ITEM = getCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            FLDVAL_UNIT = getCurrentLineItemValue(SBL_ITEM, FLD_UNITS);
            
            
            FLDVAL_QTY = getCurrentLineItemValue(SBL_ITEM, FLD_QUANTITY);
            FLDVAL_AMT = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT);
            
            FLDVAL_REBSOPO = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES);
            FLDVAL_REBCUST = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST);
            
            FLDVAL_ISCLOSED = getCurrentLineItemValue(SBL_ITEM, FLD_ISCLOSED);
        }
    }
}

/**
 * compare the previous field data into the new Data
 */
function showRebateAgreements_validateLine(type){
    if (blApplyRebates) {
        console.log("SHOWREBATEAGREEMENTS_VALIDATELINE : " + type);
        var returnVal = true;
        var blRebatesSearched = false;
        var idTransaction = nlapiGetRecordId();
        if(type == SBL_ITEM){
            var stItem = getCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            var stUnit = getCurrentLineItemValue(SBL_ITEM, FLD_UNITS);
            
            var stQty = getCurrentLineItemValue(SBL_ITEM, FLD_QUANTITY);
            var stAmt = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT);
            var stRate = getCurrentLineItemValue(SBL_ITEM, FLD_RATE);
            
            var stRebPOSO = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES);
            var stRebCust = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST);
            
            var stIsClosed = getCurrentLineItemValue(SBL_ITEM, FLD_ISCLOSED);
            
            console.log("FLDVAL_ITEM : " + FLDVAL_ITEM + " stItem " + stItem + " FLDVAL_UNIT : " + FLDVAL_UNIT + " stUnit : " + stUnit);
            
            //CHECK IF ITEM SELECTED IS ASSEMBLY OR KIT

            var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
            if (!isEmpty(stItemType)) { 
                stItemType = stItemType.toUpperCase();
                if(stItemType == 'ASSEMBLY' || stItemType == 'KIT') {
                    var stRecalc = nlapiGetFieldValue(FLD_RECALCULATE_REBATES);
                    if (nlapiIsLineItemChanged(SBL_ITEM) || stRecalc == "T"){
                        
                        //if (nlapiGetRecordType() != REC_FULFILLMENT) {
                        var stBGProcess = nlapiGetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
                        if (stBGProcess != 'T') {
                            if(bToggleAlert){
                                alert("The transaction has kits or assemblies and rebates will be calculated in background. " + 
                                        "When the rebates are calculated, you will receive an email and the 'Calculate Rebates in Background' checkbox will be unchecked. " + 
                                        "Refresh or return to the transaction to make any changes to selections.");   
                            }
                            nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
                            var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
                            objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                        }
                        //}
                        
                    }
                }
            }
            
            if(!isEmpty(idTransaction)){
                var stRebateTransactions = nlapiGetFieldValue('custbody_nsts_rm_rebate_tran_ids');
                if(!isEmpty(stRebateTransactions)){
                    var arRebateTranIds = stRebateTransactions.split(',');
                    var idLineRebateTrans = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS);
                    var intCurrentLine = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_LINE);
                    var intRebTranIndex = arRebateTranIds.indexOf(idLineRebateTrans);
                    
                    if(intRebTranIndex != -1 && isEmpty(intCurrentLine)){
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, '');
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_PURCHASE_REBATE_AMT, 0.00);
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, 0.00);
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTOMER_REBATE_AMT, 0.00);
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, 0.00);
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, '[]');
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, '[]');
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, '');
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "", false);
                    }
                }
            }
    
            if(FLDVAL_ITEM != stItem || FLDVAL_UNIT != stUnit || FLDVAL_ISCLOSED != stIsClosed){
    
                var intRT = getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS);
                //var onjClaims = getExistingClaimOnRT(null, intRT);
                var onjClaims = null;
                if(!isEmpty(intRT)){
                    onjClaims = getExistingClaimOnRT(null, intRT);
                }
                
                if(!isEmpty(onjClaims)){
                    if(FLDVAL_ISCLOSED != stIsClosed){
                        alert("Item cannot be Closed on the line without inactivating the Accrual JE\/Claim transaction.");
                        returnVal = false;
                    }
                    
                    if(FLDVAL_ITEM != stItem || FLDVAL_UNIT != stUnit){
                        if(!FLAG_VALIDATED_CHANGE.isAllowChange && !FLAG_VALIDATED_CHANGE.isHasCLaims){
                            alert("Item cannot be changed on the line without inactivating the Accrual JE\/Claim transaction.");
                            returnVal = false;
                        }
                    }
    
                    
                }else{
                    var arrRTDelete = parseStringToJson(nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE), []);
                    var intRT = parseInt(getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS));                
                    //HIS COde IS PREVIOUSLY ON POST SOURCE CODE
                    //Trigger only when Item and Unit is changed
                    if(FLDVAL_ITEM != stItem || FLDVAL_UNIT != stUnit){
                        intRT = (intRT) ? intRT : 0;
                        if (arrRTDelete.indexOf(intRT) < 0 && intRT > 0) {
                            arrRTDelete.push(intRT);
                        }
                        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE, parseJsonToString(arrRTDelete, "[]"), false);
                        
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_SHOW_CUSTOMER_AGREEMENTS, 'F', false, true);
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_SHOW_PURCHASE_AGREEMENTS, 'F', false, true);
    
                        setCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS, "", false);
    /*                    setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_PURCHASE_REBATE_AMT, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, "", false);
                        setCurrentLineItemValue(SBL_ITEM, FLD_CUSTOMER_REBATE_AMT, "", false);*/
                        
                        var stEntity = nlapiGetFieldValue(FLD_ENTITY);
                        var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
                        var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
                            stItemType = stItemType.toUpperCase();
                            
                        var stCalcInBG = nlapiGetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
    
                        if (!isEmpty(stEntity) && !isEmpty(stItem)) {
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_PURCHASE_REBATE_AMT, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTOMER_REBATE_AMT, "", false);
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "", false);
                            
                            
                            if(stCalcInBG != "T"){
                                getDefaultRebates(stItemType);
                            }
                            
                            blRebatesSearched = true;
                      }
                        
                        /*var stRecalc = nlapiGetFieldValue(FLD_RECALCULATE_REBATES);
                        if (stRecalc == "T"){
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "", false);
                        }*/
                        
                        /*if(!isEmpty(FLDVAL_ITEM) || !isEmpty(FLDVAL_UNIT)){
                            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "", false);
                        }*/
                        
                        
                    }
                    //HIS COde IS PREVIOUSLY ON POST SOURCE CODE
                    
                }
            }
            
            if(FLDVAL_QTY != stQty || 
                    FLDVAL_AMT != stAmt ||
                    FLDVAL_REBSOPO != stRebPOSO ||
                    FLDVAL_REBCUST != stRebCust){
                
                var intRT = getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS);
                var onjClaims = null;
                if(!isEmpty(intRT)){
                    onjClaims = getExistingClaimOnRT(null, intRT);
                }
                
                if(!isEmpty(onjClaims)){
    
                    if(!FLAG_VALIDATED_CHANGE.isAllowChange && !FLAG_VALIDATED_CHANGE.isHasCLaims == true){
                        
                        alert("Item cannot be changed on the line without inactivating the Accrual JE\/Claim transaction.");
                        returnVal = false;
                    }
                }
            }
            
            //APPLY PASS THROUGH DISCOUNT
            if(returnVal){
                var flPassThroughTotal = Math.abs(forceParseFloat(nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL)));//alert(flPassThroughTotal);
                var flTotalAmount = forceParseFloat(stQty) * forceParseFloat(stRate);
                if(flPassThroughTotal > 0 && round(flTotalAmount, 2) == round(stAmt, 2) && stItemType != 'ASSEMBLY' && stItemType != 'KIT'){
                    if(flPassThroughTotal < forceParseFloat(flTotalAmount)){
                        var flDiscountedAmt = forceParseFloat(flTotalAmount) - flPassThroughTotal;
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flDiscountedAmt, false);
                    }else{
                        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, 0, false);
                    }
                }/*else{
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL, 0, false);
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flTotalAmount, false);
                }*/
            }
            checkItemCountForBGProcesing();
        }
        
        var stRecalc = nlapiGetFieldValue(FLD_RECALCULATE_REBATES);
        var stRecalcBG = nlapiGetFieldValue(CUSTBODY_NSTS_RM_RECALCULATE_BACKGROUN);
        if(stRecalc == "T" ){
          
            var stEntity = nlapiGetFieldValue(FLD_ENTITY);
            var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
            stItemType = stItemType.toUpperCase();
            
            if (!isEmpty(stEntity) && !isEmpty(stItem) && stRecalcBG != "T") {
                if (!blRebatesSearched) {
                    setCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, '', false, true);
                    setCostBases(stItemType);
                    getDefaultRebates(stItemType);
                }
            }
            setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "", false);
        }
        
        return returnVal;
    } else {
        return true;
    }
}

/**
 * 
 * @param type
 * @param name
 * @param linenum
 */
function showRebateAgreements_fieldChanged(type, name, linenum) {
    console.log("SHOWREBATEAGREEMENTS_FIELDCHANGED TYPE:" + type + " name:" + name + " linenum:" + linenum);
    
    if(!isEmpty(RECORDTYPE)){
        if (blApplyRebates) {
            if(type == "item" && (name == FLD_SHOW_CUSTOMER_AGREEMENTS || name == FLD_SHOW_PURCHASE_AGREEMENTS)) {
                
                
                var isChecked = nlapiGetCurrentLineItemValue(SBL_ITEM, name);
                var rebateType = "";
                var stDataRebates = "";
                if(name == FLD_SHOW_CUSTOMER_AGREEMENTS){
                    nlapiLogExecution('debug', 'customer agreement', '');
                    stDataRebates = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,linenum);
                    rebateType = HC_REBATE_TYPE.Customer_Rebate;
                }else if(name == FLD_SHOW_PURCHASE_AGREEMENTS){
                    
                    stDataRebates = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES,linenum);
                    var arrSOLineList = [
                            REC_ESTIMATE, 
                            REC_SALES_ORDER, 
                            REC_FULFILLMENT,
                            REC_CASH_SALE, 
                            REC_INVOICE, 
                            REC_RETURN_AUTH,
                            REC_CUSTOMER_CREDIT, 
                            REC_WORK_ORDER,
                            REC_CREDITMEMO,
                            REC_CASH_REFUND
                    ];
                    var arrPOLineList = [
                            REC_PURCHASE_ORDER,
                            REC_RECEIPT, 
                            REC_BILL,
                            REC_VENDOR_RETURN, 
                            REC_VENDOR_CREDIT
                    ];
                    
                    
                    if(arrSOLineList.indexOf(RECORDTYPE)>=0){
                        rebateType = HC_REBATE_TYPE.Vendor_Rebate_on_Sale;
                    }else if(arrPOLineList.indexOf(RECORDTYPE)>=0){
                        rebateType = HC_REBATE_TYPE.Vendor_Rebate_on_Purchase;
                    }
                }
                
                if(isChecked == "T"){
                    var stURL = nlapiResolveURL('SUITELET', CUSTOMSCRIPT_NSTS_RM_SHOWVALDNREBATES_SL, CUSTOMDEPLOY_NSTS_RM_SHOWVALDNREBATES_SL);
    
                    var isItm = getCurrentLineItemValue(SBL_ITEM, 'item',linenum);
                    var isQty = getCurrentLineItemValue(SBL_ITEM, 'quantity',linenum);
                    var isitmType = getCurrentLineItemValue(SBL_ITEM, 'itemtype',linenum) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM));
                    var stUnits = getCurrentLineItemValue(SBL_ITEM, 'units',linenum);
                    var flRate = getCurrentLineItemValue(SBL_ITEM, FLD_RATE,linenum);
                    var flLineAmt = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT,linenum);
                    var stCostBases = getCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES,linenum);
                    var stLocation = getCurrentLineItemValue(SBL_ITEM, FLD_LOCATION,linenum);
                    var stRT = getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS,linenum);
                    
                    var stSelectedItemClass = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_ITEM_CLASSIFICATION,linenum);
                    var stSelectedVendorClass = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_VEN_CLASSIFICATION);
                    var stSelectedCustClass = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_CUST_CLASSIFICATION);
                    
                    var objClassification = {
                            itemClass: stSelectedItemClass,
                            vendorClass: stSelectedVendorClass,
                            customerClass: stSelectedCustClass
                    }
                    
                    if (isEmpty(stLocation)) {
                        stLocation = nlapiGetFieldValue(FLD_LOCATION);
                    }
                    var stCurrency = nlapiGetFieldValue(FLD_CURRENCY);
                    if (isEmpty(stCurrency)) {
                        stCurrency = nlapiGetFieldValue(FLD_KCURRENCY);
                    }
                    
                    stURL += '&entity=' + nlapiGetFieldValue('entity');
                    stURL += '&recordtype=' + nlapiGetRecordType();
                    stURL += '&itemLine=' + linenum;
                    stURL += '&item=' + isItm;
                    stURL += "&quantity=" + isQty; //nlapiGetLineItemValue(SBL_ITEM, 'quantity',linenum);
                    stURL += '&itemtype=' + isitmType; //nlapiGetLineItemValue(SBL_ITEM, 'itemtype',linenum);
                    stURL += '&trandate=' + nlapiGetFieldValue('trandate');
                    stURL += '&units=' + stUnits; //nlapiGetLineItemValue(SBL_ITEM, 'units',linenum);
                    stURL += "&rate=" + flRate;
                    stURL += "&currency=" + stCurrency;
                    stURL += "&subsidiary=" + nlapiGetFieldValue("subsidiary");
                    stURL += "&location=" + stLocation;
                    stURL += "&rebateType=" + rebateType;
                    stURL += "&objCostBasis=" + stCostBases;//nlapiGetLineItemValue(SBL_ITEM, FLD_COST_BASES,linenum);
                    stURL += "&rtid=" + stRT;
                    stURL += "&class=" + JSON.stringify(objClassification);
                    stURL += "&lineamt" + flLineAmt;
    
                    //var stDataRebates = nlapiGetCurrentLineItemValue('item', FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES);
                    
                    var arrSelectedRebates = parseStringToJson(stDataRebates);
                    if(!isEmpty(arrSelectedRebates)){
                        var arrRebates = [];
                        for (var int = 0; int < arrSelectedRebates.length; int++) {
                            //arrRebates.push(arrSelectedRebates[int].internalId);
                            arrRebates.push({
                                ra: arrSelectedRebates[int].internalId,
                                item: arrSelectedRebates[int].item
                            })
                        }
                        stURL += "&data=" + parseJsonToString(arrRebates);
                    }
                    
                    var objWin = window.open(stURL,"Rebates Arg","height=600,scrollbars=yes");
                    if(objWin){
                        objWin.focus();
                    }
                    nlapiSetCurrentLineItemValue("item", name, 'F', false, true);
                }
    //        }else if(name == "item"){
    //            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, "", false, false);
    //            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_SHOW_CUSTOMER_AGREEMENTS, 'F', false, true);
    //            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_SHOW_PURCHASE_AGREEMENTS, 'F', false, true);
    //            
    //            var stEntity = nlapiGetFieldValue(FLD_ENTITY);
    //            if(!isEmpty(stEntity)){
    //                setCostBases();
    //                getDefaultRebates();
    //            }
    
            }else if((name == "quantity" || name == 'rate' || name == 'amount') && type == SBL_ITEM ){
                var stSelectedRebates = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES,linenum);
                var stSelectedRebates_cust = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,linenum);
                
                var arrPOSO = parseStringToJson(stSelectedRebates);
                var arrCust = parseStringToJson(stSelectedRebates_cust);
                var arrRebates = [];
                //clean if event arrPOSO is an array concat it on arrRebates
                if(arrPOSO instanceof Array){
                    arrRebates = arrRebates.concat(arrPOSO);
                }
                //clean if event arrCust is an array concat it on arrRebates
                if(arrCust instanceof Array){
                    arrRebates = arrRebates.concat(arrCust);
                }
                
                var stCostBasis = getCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES,linenum);
                if (!isEmpty(stCostBasis)) {
                    var objCostBasis = parseStringToJson(stCostBasis);
                    
                    if (!isEmpty(objCostBasis)) {
                        if (objCostBasis instanceof Array) {
                            var arrCostBasis = objCostBasis;
                            var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
                            
                            objCostBasis = getCostBasisFromArray(arrCostBasis, stItem);
                            if (!isEmpty(objCostBasis)) {
                                var intCBIndex = arrCostBasis.indexOf(objCostBasis);
                                
                                objCostBasis.transPrice = getCurrentLineItemValue(SBL_ITEM, FLD_RATE,linenum);
                                objCostBasis.lineAmount = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT,linenum);
                                arrCostBasis[intCBIndex] = objCostBasis;
                                nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, parseJsonToString(arrCostBasis));
                            }
                        } else {
                            if (!isEmpty(objCostBasis)) {
                                objCostBasis.transPrice = getCurrentLineItemValue(SBL_ITEM, FLD_RATE,linenum);
                                objCostBasis.lineAmount = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT,linenum);
                                nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, parseJsonToString(objCostBasis));
                            }
                        }
                    }
                }
                
                setRebateTotalAmoun(arrRebates, name);
                //setRebateTotalAmoun(parseStringToJson(stSelectedRebates));
            } else if (name == FLD_LOCATION) {

            }
        }
    }else if (isEmpty(RECORDTYPE)){
        //If RECORDTYPE is null or undefined it means that it is trigger Suiteklet change field event
        fieldChanged_sl_showRebateAgreements(type, name, linenum);
    }
}

/**
 * For scripts that require item information to be sourced first, such as rebate calculations
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @return {void}
 */
function clientPostSourcing_calcRebates(type, name) {
    if (blApplyRebates) {
        console.log("SHOWREBATEAGREEMENTS_FIELDCHANGED TYPE:" + type + " name:" + name );
        
        if (type == SBL_ITEM && name == FLD_ITEM) {
            var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
            if (!isEmpty(stItem)) {
                var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
                setCostBases(stItemType);
            }
        }else if(name == FLD_ENTITY){
            FLDVAL_ENTIITY = nlapiGetFieldValue(FLD_ENTITY);
        }
        
        if(name == FLD_ENTITY){
            FLDVAL_ENTIITY = nlapiGetFieldValue(FLD_ENTITY);
        }
    }
}

/**
 * Validated Line on deleting Items
 * @param type
 * @returns {Boolean}
 */
function showRebateAgreements_validateDelete(type ){
    var returnVal = true;
    var intRT = getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS);
    var onjClaims = null;
    if(!isEmpty(intRT)){
        onjClaims = getExistingClaimOnRT(null, intRT);
    }
    
    console.log("onjClaims");
    console.log(onjClaims);
    if(!isEmpty(onjClaims)){
        returnVal = false;
        alert("Item cannot be changed on the line without inactivating the Claim transaction.");
    }else{
        var arrRTDelete = parseStringToJson(nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE), []);
        var intRT = parseInt(getCurrentLineItemValue(SBL_ITEM, FLD_REBATE_TRANSACTIONS));
        intRT = (intRT) ? intRT : 0;
        if (arrRTDelete.indexOf(intRT) < 0 && intRT > 0) {
            arrRTDelete.push(intRT);
        }

        nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_RT_TO_DELETE, parseJsonToString(arrRTDelete, "[]"), false);
    }
    
    return returnVal;
}

/**
 * the pop-pup window will call this function to easily updated the Parent window document
 * @param linenum
 * @param value
 */
function SetSelectedRebateFromPopupWin(linenum,value,rebateType){
    nlapiSelectLineItem(SBL_ITEM, linenum);
    if(rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase || rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, value, false, false);
    }else if(rebateType == HC_REBATE_TYPE.Customer_Rebate){
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, value, false, false);
    }
   
    setCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_OVERRIDE_DFLT_REBATE, "T", false);
    
   /* if(!isEmpty(value) || value != "{}" || value != "[]"){
        nlapiSetCurrentLineItemValue(type, FLD_SHOW_CUSTOMER_AGREEMENTS, 'T', false, true);
        nlapiSetCurrentLineItemValue(type, FLD_SHOW_PURCHASE_AGREEMENTS, 'T', false, true);
    }else{
        nlapiSetCurrentLineItemValue(type, FLD_SHOW_CUSTOMER_AGREEMENTS, 'F', false, true);
        nlapiSetCurrentLineItemValue(type, FLD_SHOW_PURCHASE_AGREEMENTS, 'F', false, true);
    }*/
    
    var stPOSORebates = "";
    var stCustRebate =  "";

    try{
        stPOSORebates = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES);
    }catch(e){
        stPOSORebates = nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES,linenum);
    }
    
    try{
        stCustRebate =  nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST);
    }catch(e){
        stCustRebate =  nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,linenum);
    }

    var arrPOSO = parseStringToJson(stPOSORebates);
    var arrCust = parseStringToJson(stCustRebate);
    
    var arrRebates = [];
    //clean if event arrPOSO is an array concat it on arrRebates
    if(arrPOSO instanceof Array){
        arrRebates = arrRebates.concat(arrPOSO);
    }
    //clean if event arrCust is an array concat it on arrRebates
    if(arrCust instanceof Array){
        arrRebates = arrRebates.concat(arrCust);
    }
    
    if (!isEmpty(arrRebates)) {
        HC_HAS_REBATES = true;
    }

    setRebateTotalAmoun(arrRebates);
    //nlapiCommitLineItem(type);
}
/**
 * this function is used to get the default Rebates if new item is selected
 */
function getDefaultRebates(stItemType){   
    var stSelectedPOSOReb = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES);
    var stSelectedCustReb = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST);
    var stSelectedItemClass = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_ITEM_CLASSIFICATION);
    var stSelectedVendorClass = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_VEN_CLASSIFICATION);
    var stSelectedCustClass = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_CUST_CLASSIFICATION);
    var objClassification = {
            itemClass: stSelectedItemClass,
            vendorClass: stSelectedVendorClass,
            customerClass: stSelectedCustClass
    }

    var intQuantity = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_QUANTITY);
    
    if(stItemType != 'ASSEMBLY' && stItemType != 'KIT'){
         var stRecType = nlapiGetRecordType();
        var stEntity = nlapiGetFieldValue('entity');
        var stCurrency = nlapiGetFieldValue("currency");
        var stSubsidiary = null;
        if (isOneWorld()) {
            stSubsidiary = nlapiGetFieldValue("subsidiary");
        }
        var stTranDate =  nlapiGetFieldValue('trandate');
        var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, 'item');
        var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
        var stUOM =  nlapiGetCurrentLineItemValue(SBL_ITEM, 'units');
        var stLog = "Trigger on Client Side";
        
        console.log("==============================");
        console.log("stRecType:" + stRecType + " stEntity:" + stEntity + " stCurrency:" + stCurrency + " stSubsidiary:" + stSubsidiary + " stTranDate:" + stTranDate + " stItem:" + stItem + " stItemType:" + stItemType + " stUOM:" + stUOM)
        console.log("==============================");
        
        var arrApplicableRebates = searchRebates(stRecType, stEntity, stCurrency, stSubsidiary, stTranDate, stItem, stItemType, stUOM, stLog,null,objClassification);
        if(arrApplicableRebates.length > 5){
            alert('There are more than 5 Rebates on this Item');
            nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
            var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
            objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }
        /*else{
            var stComponents = getComponent(stItem,intQuantity); 
            var arrApplicableRebates = [];
            for( var i = 0; i < stComponents.length; i++ ){
                var arrSearchApplicableRebates = searchRebates(stRecType, stEntity, stCurrency, stSubsidiary, stTranDate, stComponents[i]['id'], stUOM, stLog);
                if(!isEmpty(arrSearchApplicableRebates) && arrSearchApplicableRebates.length > 0){
                    arrApplicableRebates = arrApplicableRebates.concat(arrSearchApplicableRebates);
                }
            }
            if(arrApplicableRebates.length > 5){
                alert('There are more than 5 Rebates on this Item');
                nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
            }
        }*/
        
        
        var arrPOSOReb = [];
        var arrCustReb = [];
        var stArrPOSOReb = "";
        var stArrCustReb = "";

        var stCostBasis = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES);
        var objCostBasis = parseStringToJson(stCostBasis);
        var arrSelectedRebates = priorityAndStackabilityLogic(arrApplicableRebates);
        
        nlapiLogExecution('debug', 'def rebates cost basis', stCostBasis);
        
        //Separate the Rebate on Sale and Purchace to Customer
        for(var ind = 0; ind < arrSelectedRebates.length; ind++){
            var objReb = arrSelectedRebates[ind];
            
            if (stBaseCurrency == null) {
                stBaseCurrency = objReb.baseCurrency;
            }
            
            if (isEmpty(objCostBasis) || isEmpty(stCostBasis)) {
                setCostBases(stItemType);
                stCostBasis = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES);
                objCostBasis = parseStringToJson(stCostBasis);
            }
            
            if(objReb.rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase || objReb.rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
                arrPOSOReb.push(objReb);
            }else if(objReb.rebateType == HC_REBATE_TYPE.Customer_Rebate){
                arrCustReb.push(objReb);
            }
        }
        
        stArrPOSOReb =  parseJsonToString(arrPOSOReb);
        stArrCustReb = parseJsonToString(arrCustReb);
        
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES,stArrPOSOReb , false, true);
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,stArrCustReb, false, true);
        
        if (!isEmpty(arrPOSOReb) || 
                !isEmpty(arrCustReb)) {
            HC_HAS_REBATES = true;
        }
        

        setRebateTotalAmoun(arrSelectedRebates);
        nlapiLogExecution('debug', 'Default Rebates', stLog);
    }
       
}

function setCostBases(stItemType) {
    nlapiLogExecution('debug', 'set cost bases', '');
    if(stItemType.toUpperCase() != 'ASSEMBLY' && stItemType.toUpperCase() != 'KIT'){
    //    var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE);
        var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
        var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
        var intQuantity = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_QUANTITY);
        var stSubsidiary = null;
        if (isOneWorld()) {
            stSubsidiary = nlapiGetFieldValue(FLD_SUBSIDIARY);
        }
        var stTranDate = nlapiGetFieldValue(FLD_TRANDATE);
        var flRate = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_RATE);
        var flAmount = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT);
    //    var flRebateCost = 0.0;
        var stLocation = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_LOCATION);
        if (isEmpty(stLocation)) {
            stLocation = nlapiGetFieldValue(FLD_LOCATION);
        }
        var stCurrency = nlapiGetFieldValue(FLD_CURRENCY);
        if (isEmpty(stCurrency)) {
            stCurrency = nlapiGetFieldValue(FLD_KCURRENCY);
        }
        
        if (!isEmpty(nlapiGetFieldValue(FLD_COST_BASES))) {
            nlapiSetFieldValue(FLD_COST_BASES, '');
        }
        
    //    var objCostBasisInstance = getCostBasisObject(stItemType, stItem, stSubsidiary, stLocation, stCurrency, stTranDate, flRebateCost, flTransPrice);
        var objCostBasisInstance = null;
        
            objCostBasisInstance = retrieveCostBasisObject(stItem, stItemType, stLocation, stSubsidiary, stBaseCurrency, stCurrency, stTranDate, flRate, flAmount);
        /*else{
            var stComponents = getComponent(stItem,intQuantity); 
            objCostBasisInstance = [];
            for( var i = 0; i < stComponents.length; i++ ){
                var objGetCostBasisInstance = retrieveCostBasisObject(stComponents[i]['id'], stLocation, stSubsidiary, stBaseCurrency, stCurrency, stTranDate, flRate);
                objCostBasisInstance.push(objGetCostBasisInstance);
            }
        }*/
        
        var stCostBasis = parseJsonToString(objCostBasisInstance);
        
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, stCostBasis);
        nlapiLogExecution('debug', 'set cost bases', 'end');
    }
}

///////////////////////////////////////////////////////////////////////////
//Suitlet Function
///////////////////////////////////////////////////////////////////////////
/**
 * 
 */
function showRebateAgreements_saveRecord(){
    if (isEmpty(RECORDTYPE)){
      //If RECORDTYPE is null or undefined it means that it is triggered in Suitelet change saveRecord
        var linenum = nlapiGetFieldValue(FLD_SL_ITEM_LINE);
        var rebateType = nlapiGetFieldValue(FLD_SL_REBATE_TYPE);
        var intLineCount = nlapiGetLineItemCount(SBL_SL_REBATE);
        
        var objDataArr = [];
        for (var index = 1; index <= intLineCount; index++) {
            var bIsApply = nlapiGetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_SELECT, index);
            if(bIsApply == "T"){
                var objdata = parseStringToJson(nlapiGetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_DATA, index));
                objDataArr.push(objdata);
            }
        }
        
        window.opener.SetSelectedRebateFromPopupWin(linenum, parseJsonToString(objDataArr),rebateType);
        window.ischanged = false;
        window.close();
    }else{
        if (blApplyRebates) {
            setRebateTotalAmounGrossProfit();
            var stCreatedFrom = nlapiGetFieldValue(FLD_CREATED_FROM);
            var idTransaction = nlapiGetRecordId();
            var intItemLineCount = nlapiGetLineItemCount(HC_ITEM);
            
            if(HC_PAGE_TYPE == HC_MODE_TYPE.Copy || (isEmpty(idTransaction) && !isEmpty(stCreatedFrom))){
                var dateTrans = nlapiStringToDate(nlapiGetFieldValue(FLD_TRANDATE));
                var arrErrMessage = [];
                var intAssemblyCount = 0;
                
                for(var line = 1; line <= intItemLineCount; line++){ 
                    var stItemType = nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, line);
                    if (!isEmpty(stItemType)) { 
                        stItemType = stItemType.toUpperCase();
                        if(stItemType == 'ASSEMBLY' || stItemType == 'KIT') intAssemblyCount++;    
                    }
                    
                    if(isEmpty(idTransaction) && !isEmpty(stCreatedFrom)){
                        var stSelectedPReb = nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, line);
                        stSelectedPReb = (!isEmpty(stSelectedPReb)) ? JSON.parse(nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES, line))
                                : '';
                        var stSelectedCReb = nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, line);
                            stSelectedCReb = (!isEmpty(stSelectedCReb)) ? JSON.parse(nlapiGetLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST, line))
                                    : '';
                        
                        var stInvalidPurchAgr = validateAgreementEndDate(stSelectedPReb, dateTrans);
                        var stInvalidCustAgr = validateAgreementEndDate(stSelectedCReb, dateTrans);
                        if(!isEmpty(stInvalidPurchAgr)) arrErrMessage.push('Item #' + line 
                                + ': The rebate may not apply because the end date of one of the selected Purchase Agreement has passed.');
                        if(!isEmpty(stInvalidCustAgr)) arrErrMessage.push('Item #' + line 
                                + ': The rebate may not apply because the end date of one of the selected Customer Agreement has passed.');
                    }
                }
                
                if(intAssemblyCount > 0){
                    if (nlapiGetRecordType() != REC_FULFILLMENT) {
                        var stBGProcess = nlapiGetFieldValue(CUSTBODY_NSTS_RM_RECALCULATE_BACKGROUN);
                        if (stBGProcess != 'T') {
                            if(bToggleAlert){
                                alert('The transaction has kits or assemblies and rebates will be calculated in background. ' + 
                                        'When the rebates are calculated, you will receive an email and the \'Calculate Rebates in Background\' checkbox will be unchecked.  ' + 
                                        'Refresh or return to the transaction to make any changes to selections.');   
                            }

                        }
                    }
                    nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
                    var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
                    objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                }else if(HC_PAGE_TYPE == HC_MODE_TYPE.Copy && isEmpty(nlapiGetFieldValue('transform'))){
                	var bConfirm = confirm('If there are rebates, rebates will be calculated in background on make copy. ' + 
                            'When the rebates are calculated, you will receive an email and the \'Calculate Rebates in Background\' checkbox will be unchecked.  ' + 
                            'Refresh or return to the transaction to make any changes to selections.');
                	
                	if(bConfirm){
	                	nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
	                    var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
	                    objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
                	}else{
                		return false;
                	}
                	
                }
                
                if(arrErrMessage.length > 0){
                    return confirm(arrErrMessage.join('\n'));
                }
            }
        }
    }
    
    return true;
}


function validateAgreementEndDate(stSelectedAgreement, dateTrans){
    var arInvalidAgreement = [];
    if(!isEmpty(stSelectedAgreement)){
        for( var a = 0; a < stSelectedAgreement.length; a++) {
            var dateAgreementEnd = nlapiStringToDate(stSelectedAgreement[a].agreementEndDate);
            if(!isEmpty(dateTrans) && !isEmpty(dateAgreementEnd)){
                dateTrans.setHours(0,0,0,0);
                dateAgreementEnd.setHours(0,0,0,0);
                
                if(dateAgreementEnd < dateTrans){
                    arInvalidAgreement.push(stSelectedAgreement[a].agreementName);
                }
            }
        }
    }
    if(arInvalidAgreement.length > 0) return arInvalidAgreement;
}

/**
 * 
 * @param type
 * @param name
 * @param linenum
 */
function fieldChanged_sl_showRebateAgreements(type, name, linenum){
    if(name == FLD_SL_REBATE_SELECT){
        var count = 0;
        var intLineCount = nlapiGetLineItemCount(SBL_SL_REBATE);
        
        var objdata = parseStringToJson(nlapiGetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_DATA, linenum));
        if(!isEmpty(objdata.claims)){
            nlapiSetCurrentLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_SELECT, "T",false);
            alert("Claim Is Already Generated! You cannot unselect RTD.");
            return;
        }
        
        for (var index = 1; index <= intLineCount; index++) {
            var bIsApply = nlapiGetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_SELECT, index);
            var objdata = parseStringToJson(nlapiGetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_DATA, index));
            if(bIsApply == "T" && isEmpty(objdata.claims)){
                count++;
            }
        }
        if(count > 5){
            //nlapiSetLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_SELECT, index, "F",false);
            nlapiSetCurrentLineItemValue(SBL_SL_REBATE, FLD_SL_REBATE_SELECT, "F",false);
            alert("Only 5 Rebate Agreements can be selected");
        }
    }
}

/**
 * 
 * @param arrSelectedRebate
 */
function setRebateTotalAmoun(arrSelectedRebate, name){
    
    var stItem = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEM);
    var intTotalPurchaceRebate = 0;
    var intTotalCustomerRebate = 0;
    
    var intPurchareRebateAmt = 0;
    var intCustomerRebateAmt = 0;
    
    var intQty = parseFloat(nlapiGetCurrentLineItemValue("item", "quantity"));
    intQty = (intQty)? intQty : 0;
    
    
    var linenum = null;
    try{
        linenum = nlapiGetCurrentLineItemIndex(SBL_ITEM);
    }catch(e){}
    
    var flLineRate = getCurrentLineItemValue(SBL_ITEM, FLD_RATE,linenum);
    var flRateQty = flLineRate * intQty;
    var stItemType = nlapiGetCurrentLineItemValue(SBL_ITEM, FLD_ITEMTYPE) || nlapiGetLineItemValue(SBL_ITEM, FLD_ITEMTYPE, nlapiGetCurrentLineItemIndex(SBL_ITEM)) || '';
        stItemType = stItemType.toUpperCase();
    //var stSelectedRebates_cust = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_SELECTED_REBATES_CUST,linenum);
    
    if(!isEmpty(arrSelectedRebate)){
        var stRecType = nlapiGetRecordType();
        var stTranDate = nlapiGetFieldValue(FLD_TRANDATE);
        var stVendCust = nlapiGetFieldValue(FLD_ENTITY);
        var stCostBasis = getCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES,linenum);
        var flLineAmount = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT,linenum);
        
        var stCurrency = nlapiGetFieldValue(FLD_CURRENCY);
        if (isEmpty(stCurrency)) {
            stCurrency = nlapiGetFieldValue(FLD_KCURRENCY);
        }
        
        if (!isEmpty(stCostBasis)) {
            var objCostBasisInstance = parseStringToJson(stCostBasis);
            var arrCostBasis = [];
            
            if (objCostBasisInstance instanceof Array) {
                arrCostBasis = objCostBasisInstance;
            } else {
                arrCostBasis.push(objCostBasisInstance);
            }
            
            if (!objCostBasisInstance.baseCurrAdjusted) {
                adjustCostBasisForBaseCurrency(stBaseCurrency, stCurrency, objCostBasisInstance, stTranDate);
                var stCostBasis = parseJsonToString(objCostBasisInstance);
            }

            var blCostBasisAdjusted = false;
            var flPassThroughTotal = 0;
            for (var int = 0; int < arrSelectedRebate.length; int++) {
                if (isOneWorld()) {
                    stSubsidiary = nlapiGetFieldValue("subsidiary");
                }
                var flRate = getCurrentLineItemValue(SBL_ITEM, FLD_RATE,linenum);
                
                var stItem = getCurrentLineItemValue(SBL_ITEM, FLD_ITEM,linenum);
                var stItemClass = getCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_NSTS_RM_ITEM_CLASSIFICATION,linenum);
                var stRebateType = arrSelectedRebate[int].rebateType;
                var stCalcType = arrSelectedRebate[int].calcType;
                var stCostBasis = arrSelectedRebate[int].costBasis;
                var flRebateAmt = arrSelectedRebate[int].rebateAmount;
                var flPerc = arrSelectedRebate[int].rebatePerc;
                var flRebateCost = arrSelectedRebate[int].rebateCost;
                var stAgreementId = arrSelectedRebate[int].agreementInternalId;
                var bTiered = arrSelectedRebate[int].tiered;
                var flTierPerc = arrSelectedRebate[int].accrualPerc;
                var flLineAmount = getCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, linenum);
                var flPassThroughPerc = arrSelectedRebate[int].passThroughPerc;
                var flPassThroughVal = arrSelectedRebate[int].passThroughVal;
                
                var stRebateItem = arrSelectedRebate[int].item;
                objCostBasisInstance = getCostBasisFromArray(arrCostBasis, stRebateItem);
                if (isEmpty(objCostBasisInstance)) {
                    continue;
                }

                if (!objCostBasisInstance.baseCurrAdjusted) {
                    adjustCostBasisForBaseCurrency(stBaseCurrency, stCurrency, objCostBasisInstance, stTranDate);
                    blCostBasisAdjusted = true;
                }
                objCostBasisInstance.rebateCost = flRebateCost;
                objCostBasisInstance.lineAmount = flLineAmount;
                // Re-compute for the rebate quantity
                var intQtyMultiplier = intQty;
                if (!isEmpty(objCostBasisInstance.compQty)) {
                    intQtyMultiplier = objCostBasisInstance.compQty * intQty;
                }
                
    //            var objRebateAmounts = calculateRebate(stItem, stItemType, stRebateType, stCalcType, stCostBasis, 
    //                    null, intQty, flRebateAmt, flPerc, flAmount, stSubsidiary, stCurrency, stTranDate, null);
                var objRebateAmounts = calculateRebate(stRecType, stRebateType, stCalcType, stCostBasis, intQtyMultiplier, flRebateAmt, flPerc, flRate, flRebateCost, objCostBasisInstance, stAgreementId, stItem, bTiered, stItemClass, stVendCust, flTierPerc,
                        flPassThroughPerc, flPassThroughVal);
                
    //            var intRAmt = parseFloat(arrSelectedRebate[int].rebateAmount);
    //            intRAmt = (intRAmt)?intRAmt: 0;
                var flRAmt = parseFloat(objRebateAmounts.rebateAmt);
                flRAmt = (flRAmt)?flRAmt: 0;
                
                console.log("objRebateAmounts");
                console.log(objRebateAmounts);
                if(arrSelectedRebate[int].rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase || arrSelectedRebate[int].rebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
    //                intTotalPurchaceRebate += (flRAmt * intQty);
                    intTotalPurchaceRebate += parseFloat(objRebateAmounts.totalRebateAmt);
                    intPurchareRebateAmt += flRAmt;
                    nlapiLogExecution('debug', 'purchase amounts | ' + arrSelectedRebate[int].agreementName, objRebateAmounts.rebateAmt + ' | ' + objRebateAmounts.totalRebateAmt + ' = ' + intPurchareRebateAmt + ' | ' + intTotalPurchaceRebate);
                }else{
    //                intTotalCustomerRebate += (flRAmt * intQty);
                    intTotalCustomerRebate += parseFloat(objRebateAmounts.totalRebateAmt);
                    intCustomerRebateAmt += flRAmt;
                    nlapiLogExecution('debug', 'customer amounts | ' + arrSelectedRebate[int].agreementName, objRebateAmounts.rebateAmt + ' | ' + objRebateAmounts.totalRebateAmt + ' = ' + intCustomerRebateAmt + ' | ' + intTotalCustomerRebate);
                }
                
                flPassThroughTotal += forceParseFloat(objRebateAmounts.passThroughAmount);
            }
            
            //APPLY PASS THROUGH TOTAL
            if (Math.abs(flPassThroughTotal) > 0 && round(flRateQty, 2) == round(flLineAmount, 2) && stItemType != 'ASSEMBLY' && stItemType != 'KIT' && name != FLD_AMOUNT){
                nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL, flPassThroughTotal, false);
                if(flPassThroughTotal < forceParseFloat(flRateQty)){
                    var flCompAmount = round(flRateQty, 2) - Math.abs(flPassThroughTotal);
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flCompAmount, false);
                }else{
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, 0, false);
                }
                
                /*else{
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL, 0, false);
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flRateQty, false);
                }*/
                
            }/*else if(Math.abs(flPassThroughTotal) <= 0){
                nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL, 0, false);
                nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flRateQty, false);
            }*/
                
                
            if (blCostBasisAdjusted) {
                if (stItemType != 'ASSEMBLY' && stItemType != 'KIT') {
                    nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_COST_BASES, parseJsonToString(objCostBasisInstance), false, true);
                }
            }
        }
    }else if(stItemType != 'ASSEMBLY' && stItemType != 'KIT' && name != FLD_AMOUNT){
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTCOL_PASS_THROUGH_TOTAL, 0, false);
        nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_AMOUNT, flRateQty, false);
    }
    
    console.log("START SETREBATETOTALAMOUN");
    console.log("intTotalPurchaceRebate:" + intTotalPurchaceRebate + " ,intTotalCustomerRebate:" + intTotalCustomerRebate);
    console.log(arrSelectedRebate);
    console.log("END SETREBATETOTALAMOUN");
    var stEntity = nlapiGetFieldValue(FLD_ENTITY);
    
    try{

        if(!isEmpty(stItem) && !isEmpty(stEntity)){
            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, round(intTotalPurchaceRebate, 2), false); //Changed to 2 decimal places
            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_PURCHASE_REBATE_AMT, round(intPurchareRebateAmt, 2), false); //Changed to 2 decimal places
        }
    }catch(e){
        
    }
    
    try{
        if(!isEmpty(stItem) && !isEmpty(stEntity)){
            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, round(intTotalCustomerRebate, 2), false); //Changed to 2 decimal places
            nlapiSetCurrentLineItemValue(SBL_ITEM, FLD_CUSTOMER_REBATE_AMT, round(intCustomerRebateAmt, 2), false); //Changed to 2 decimal places
        }
    }catch(e){
        
    }

    /*if(RECORDTYPE == REC_SALES_ORDER){
        nlapiSetCurrentLineItemValue("item", FLD_PURCHASE_REBATE_AMT, intTotalPurchaceRebate, false);
    }else if(RECORDTYPE == REC_PURCHASE_ORDER){
        nlapiSetCurrentLineItemValue("item", FLD_PURCHASE_REBATE_AMT, intTotalPurchaceRebate, false);
        //nlapiSetCurrentLineItemValue("item", FLD_CUSTOMER_REBATE_AMT, intTotalPurchaceRebate, false);
    }*/
    
    setRebateTotalAmounGrossProfit();
}

function setRebateTotalAmounGrossProfit(){
    var itemCount = nlapiGetLineItemCount(FLD_ITEM);
    var flTotalPOSORebate = 0;
    var flTotalCustRebate = 0;
    for(var linenum = 1; linenum <= itemCount; linenum++){
        var flTotPOSORebate = parseFloat( nlapiGetLineItemValue(SBL_ITEM, FLD_TOTAL_PURCHASE_REBATE, linenum));
        var flTotCustRebate = parseFloat( nlapiGetLineItemValue(SBL_ITEM, FLD_TOTAL_CUSTOMER_REBATE, linenum));
        flTotPOSORebate = (flTotPOSORebate)?flTotPOSORebate: 0;
        flTotCustRebate = (flTotCustRebate)?flTotCustRebate: 0;
        
        flTotalCustRebate += flTotCustRebate;
        flTotalPOSORebate += flTotPOSORebate;
    }
    
    nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_CUSTOMER_REBATES,round(flTotalCustRebate, 2), false); //Changed to 2 decimal places
    nlapiSetFieldValue(FLD_CUSTBODY_NSTS_RM_TOT_PURCHASE_REBATES,round(flTotalPOSORebate, 2) , false); //Changed to 2 decimal places
}

function getScriptParam(){
    var objContex = nlapiGetContext();
    var stToggleAlert           = objContex.getSetting('SCRIPT', PARAM_CUSTSCRIPT_NSTS_RM_TOGGLE_ALERT_CS);
    var stToggleConfirmation    = objContex.getSetting('SCRIPT', PARAM_CUSTSCRIPT_NSTS_TOGGLE_CONFIRM_CS);
    stToggleAlert = (stToggleAlert == 'T')? true : false; 
    stToggleConfirmation = (stToggleConfirmation == 'T')? true : false;
    
    return {
        toggle_alert: stToggleAlert,
        toggle_confirmation : stToggleConfirmation
    };
}

function checkItemCountForBGProcesing(intItemCount, blPageInit) {
    var blCalcInBG = nlapiGetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
    if (blCalcInBG != 'T') {
        if (intItemCount == null || intItemCount == undefined) {
            intItemCount = nlapiGetLineItemCount(SBL_ITEM);
        }
        if (blPageInit? intItemCount > HC_MAX_TRAN_LINE : intItemCount >= HC_MAX_TRAN_LINE) {
            alert('There are more than ' + HC_MAX_TRAN_LINE + ' items and rebates will be calculated in background. Background Recalculation is complete when the box is unchecked.');
            
            nlapiSetFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND, 'T');
            var objField = nlapiGetField(FLD_RECALC_REBATES_IN_BACKGROUND);
            objField.setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }
    }
}