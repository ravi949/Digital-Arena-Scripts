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
 *This script is used for disabling, enabling and hiding of fields.
 * Also includes server side validation for Rebate Agreement Details.
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Mar 2015     Roxanne Audette   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * SERVER SIDE FUNCTIONS
 * ====================================================================
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function enableDisableFields_BeforeLoad(type, form, request) {
    var idAgreement = nlapiGetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
    var idCalcMethod = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD);
    var stRebateCost = nlapiGetFieldValue(FLD_REBATE_AGREEMENT_DETAIL_COST_BASIS);
    
    /*SCRIPTED FIELD THAT WILL SHOW THE HIDDEN COST BASIS FIELD VALUE. 
     * NEED THE SELECT COST BASIS FIELD TO BE HIDDEN SO IT WILL NOT BE
     * SHOWN IN THE RA SUBLIST*/
    form.addField('custpage_nsts_rm_cost_basis_text', HC_FIELD_TYPE.Select, 'Cost Basis', LIST_COST_BASIS)
         .setDisplayType(HC_DISPLAY_TYPE.Inline)
         .setDefaultValue((!isEmpty(stRebateCost)) ? stRebateCost : '');
    
    //HIDE DEFAULT UOM IF UOM FEATURE IS OFF
    if(!HC_OBJ_FEATURE.bUOM){
    	nlapiGetField(FLD_REBATE_AGREEMENT_DETAIL_UOM).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }
    
    if (!isEmpty(idAgreement)) {
        var arAgrFields = [
                FLD_CUSTRECORD_TYPE, FLD_CUSTRECORD_INCLUDE_ALL
        ];
        var objAgrFields = nlapiLookupField(REC_REBATE_AGREEMENT, idAgreement,
                arAgrFields);
        nlapiGetField(FLD_CUSTRECORD_DET_CUST).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_VEND).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_EL_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_EL_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_CUST_EXCL).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_VEND_EXCL).setDisplayType(HC_DISPLAY_TYPE.Disabled);

        if (objAgrFields[FLD_CUSTRECORD_INCLUDE_ALL] != 'T') {
            if (objAgrFields[FLD_CUSTRECORD_TYPE] != HC_REB_TYPE.RebPurchase) {
                nlapiGetField(FLD_CUSTRECORD_DET_CUST).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_DET_EL_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_DET_CUST_EXCL).setDisplayType(HC_DISPLAY_TYPE.Normal);
            } else if (objAgrFields[FLD_CUSTRECORD_TYPE] == HC_REB_TYPE.RebPurchase){
                nlapiGetField(FLD_CUSTRECORD_DET_VEND).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_DET_EL_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_DET_VEND_EXCL).setDisplayType(HC_DISPLAY_TYPE.Normal);
            }
        }
        
        if(objAgrFields[FLD_CUSTRECORD_TYPE] != HC_REB_TYPE.RebSale){
            nlapiGetField(FLD_CUSTRECORD_DET_PASS_THROUGH_PERC).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTRECORD_DET_PASS_THROUGH_VAL).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }
    }

    if (!isEmpty(idCalcMethod)) {
        var fldCalcMethod = [
                FLD_CUSTRECORD_SHOW_PERCENT, 
                FLD_CUSTRECORD_SHOW_AMOUNT, 
                FLD_CUSTRECORD_SHOW_REB_COST
        ];
        var objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, idCalcMethod,
                fldCalcMethod);
        nlapiGetField(FLD_CUSTRECORD_DET_PERCENT).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_AMT).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_DET_REBATE_COST).setDisplayType(HC_DISPLAY_TYPE.Disabled);

        if (objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T')
            nlapiGetField(FLD_CUSTRECORD_DET_PERCENT).setDisplayType(HC_DISPLAY_TYPE.Normal);
        if (objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T')
            nlapiGetField(FLD_CUSTRECORD_DET_AMT).setDisplayType(HC_DISPLAY_TYPE.Normal);
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T')
            nlapiGetField(FLD_CUSTRECORD_DET_REBATE_COST).setDisplayType(HC_DISPLAY_TYPE.Normal);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function validateDupRebateDetail_BeforeSubmit(type) {
    var objExecution = nlapiGetContext().getExecutionContext();
    var idRebateDetail = nlapiGetRecordId();
    var recAgrDetailNew = nlapiGetNewRecord();
    var arrErrMessage = [];
    
    var idAgreement = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
    var idItem = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_ITEM); 
    var idCustomer = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_CUST);
    var idVendor = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_VEND);
    var flAmount = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_AMT); 
    var flPercent = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_PERCENT); 
    var flRebCost = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_REBATE_COST);
    var stUom = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_UOM); 
    var idCalcMethod = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD);
    var bInactive = recAgrDetailNew.getFieldValue(HC_IS_INACTIVE);
    
    var idItemClass = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
    var idCustomerClass = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS);
    var idVendorClass = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS);
    
    var idItemExc = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_ITEM_EXCL);
    var idCustomerExc = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_CUST_EXCL);
    var idVendorExc = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_VEND_EXCL);
    var flPassThroughPerc = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_PERC);
    var flPassThroughVal = recAgrDetailNew.getFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_VAL);

    if (objExecution != HC_CONTEXT.Scheduled){
        if(type == HC_MODE_TYPE.Xedit){
            var recAgrDetailLoad = nlapiLoadRecord(REC_AGREEMENT_DETAIL, idRebateDetail);
            idAgreement = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_REBATE_AGREEMENT);
            idItem = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_ITEM);
            idCustomer = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_CUST);
            idVendor = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_VEND);
            flAmount = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_AMT);
            flPercent = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_PERCENT);
            flRebCost = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_REBATE_COST);
            idCalcMethod = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_CALC_METHOD);
            bInactive = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, HC_IS_INACTIVE);
            idItemClass = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
            idCustomerClass = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_EL_CUST_CLASS);
            idVendorClass = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_EL_VEND_CLASS);
            idItemExc = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_ITEM_EXCL);
            idCustomerExc = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_CUST_EXCL);
            idVendorExc = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_VEND_EXCL);
            flPassThroughPerc = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_PASS_THROUGH_PERC);
            flPassThroughVal = getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, FLD_CUSTRECORD_DET_PASS_THROUGH_VAL);
            
            getAllValidations(idRebateDetail, idAgreement, idItem, idCustomer, idVendor, 
                    flAmount, flPercent, flRebCost, idCalcMethod, bInactive, null, idItemClass, idCustomerClass, idVendorClass, idItemExc, idCustomerExc, idVendorExc,
                    flPassThroughPerc, flPassThroughVal);
             
         }else if(type != HC_MODE_TYPE.Delete){
             getAllValidations(idRebateDetail, idAgreement, idItem, idCustomer, idVendor, 
                     flAmount, flPercent, flRebCost, idCalcMethod, bInactive, null, idItemClass, idCustomerClass, idVendorClass, idItemExc, idCustomerExc, idVendorExc,
                     flPassThroughPerc, flPassThroughVal);
         } 
        
        var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
         
        var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
            (!isEmpty(idCustomerClass)) ? checkEmptyValue(idCustomerClass) :
                (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendorClass);
        //var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
            //: checkEmptyValue(idVendor);
         
        // CHECK FOR DUPLICATE REBATE DETAIL RECORD
        var stConcatLineValue = checkEmptyValue(idAgreement) + '_'
                                  + intEligItemEntClass + '_'
                                  + intEntity + '_'
                                  + checkEmptyValue(stUom);
        
         if (getDuplicateRebateDetail(stConcatLineValue, REC_AGREEMENT_DETAIL,
                 idRebateDetail, type) > 0) {
             //throw nlapiCreateError('Error',
                     //'There is already an existing record with the same Rebate Detail Combination.', true);
             arrErrMessage.push('There is already an existing record with the same Rebate Detail Combination.');
         }
         
         if(!isEmpty(arrErrMessage)){
             throw nlapiCreateError('Error', arrErrMessage.join('</br>') , true);
         }
     }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function setExternalId_AfterSubmit(type) {
    var objExecution = nlapiGetContext().getExecutionContext();

    if (objExecution != HC_CONTEXT.Scheduled && type != HC_MODE_TYPE.Delete) {
        var recRebateDetail = nlapiLoadRecord(REC_AGREEMENT_DETAIL,
                nlapiGetRecordId());
        var idAgreement = recRebateDetail
                .getFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
        var idItem = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_ITEM);
        var idCustomer = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_CUST);
        var idVendor = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_VEND);
        var flAmount = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_AMT);
        var flPercent = recRebateDetail
                .getFieldValue(FLD_CUSTRECORD_DET_PERCENT);
        var stUom = recRebateDetail
            .getFieldValue(FLD_CUSTRECORD_DET_UOM);
        var idCalcMethod = recRebateDetail
                .getFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD);
        
        var idItemClass = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
        var idCustomerClass = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS);
        var idVendorClass = recRebateDetail.getFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS);
        
        var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
        
        var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
            (!isEmpty(idCustomerClass)) ? checkEmptyValue(idCustomerClass) :
                (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendorClass);
        //var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
            //: checkEmptyValue(idVendor);
        
        var stConcatLineValue = checkEmptyValue(idAgreement) + '_'
                                  + intEligItemEntClass + '_'
                                  + intEntity + '_'
                                  + checkEmptyValue(stUom);
        
        if(!isEmpty(idAgreement))recRebateDetail.setFieldValue(FLD_CUSTRECORD_DET_AGREEMENT_ID, idAgreement);
        recRebateDetail.setFieldValue(FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID, stConcatLineValue);
        recRebateDetail.setFieldValue(HC_EXTERNAL_ID, stConcatLineValue);
        nlapiSubmitRecord(recRebateDetail);
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */
function getFieldValuesOnInline(recAgrDetailNew, recAgrDetailLoad, fldName){
    
    var objEditedFields = recAgrDetailNew.getAllFields();
    var fldValue = recAgrDetailLoad.getFieldValue(fldName);

    // loop through the returned fields
    for (var i = 0; i < objEditedFields.length; i++){
        if(objEditedFields[i] == fldName){
            fldValue = recAgrDetailNew.getFieldValue(fldName);
            return fldValue;
        }
    }
    return fldValue;
}

function getAllValidations(idRebateDetail, idAgreement, idItem, idCustomer, idVendor, 
        flAmount, flPercent, flRebCost, idCalcMethod, bInactive, sblRebateTran, idItemClass, idCustomerClass, idVendorClass, idItemExc, idCustomerExc, idVendorExc,
        flPassThroughPerc, flPassThroughVal){
    var arErrMessage = [];
    var arAgrFields, objAgrFields, fldCalcMethod, objCalcMethodFlds;
    if(!isEmpty(idAgreement)) {
        arAgrFields = [
                FLD_CUSTRECORD_TYPE, FLD_CUSTRECORD_INCLUDE_ALL,
                FLD_CUSTRECORD_STATUS
        ];
        objAgrFields = nlapiLookupField(REC_REBATE_AGREEMENT, idAgreement,
                arAgrFields);
        
        if(bInactive == 'T' && !isEmpty(idRebateDetail)){
            if(validateTransDetailAttached(idRebateDetail))
                arErrMessage.push('There are Transaction Details associated with this record. '  
                        + 'Agreement Detail cannot be set to inactive.');
        }
            

        if (objAgrFields[FLD_CUSTRECORD_STATUS] == HC_AGR_STATUS.Closed) {
            arErrMessage.push('Selected Agreement is already Closed.');
        }else if(objAgrFields[FLD_CUSTRECORD_STATUS] == HC_AGR_STATUS.Approve 
                && !isEmpty(idRebateDetail) && bInactive == 'F'){
            if(validateTransDetailAttached(idRebateDetail)) arErrMessage.push('There are Transaction Details associated with this record. ' 
                    +'Update is not allowed if the selected Agreement is Approved.');
        }
        
        //ELIGIBLE ITEM
        if(!isEmpty(idItem) && !isEmpty(idItemClass)){ 
            arErrMessage.push('You may only select either an Item or Item Classification.');
        }else if(isEmpty(idItem) && isEmpty(idItemClass)) {
            arErrMessage.push('Eligible Item or Eligible Item Classification');
        }
        
        if (isEmpty(idItemClass) && !isEmpty(idItemExc)) {
            arErrMessage.push('Item Exclusions can only be used with Eligible Item Classification');
        }
        
        //ELIGIBLE CUSTOMER/VENDOR
        if (objAgrFields[FLD_CUSTRECORD_INCLUDE_ALL] != 'T') {
            if (objAgrFields[FLD_CUSTRECORD_TYPE] != HC_REB_TYPE.RebPurchase) {
                //if(isEmpty(idCustomer))arErrMessage.push('Eligible Customer must be specified.');
                if(!isEmpty(idVendor)) arErrMessage.push('Eligible Vendor must not be specified.');
                if(!isEmpty(idVendorClass)) arErrMessage.push('Eligible Vendor Classification must not be specified.');
                if(!isEmpty(idVendorExc)) arErrMessage.push('Vendor Exclusion must not be specified.');
                
                if(!isEmpty(idCustomer) && !isEmpty(idCustomerClass)){ 
                    arErrMessage.push('You may only select either a Customer or Customer Classification.');
                }else if(isEmpty(idCustomer) && isEmpty(idCustomerClass)){
                    arErrMessage.push('Eligible Customer or Eligible Customer Classification must be specified.');
                }
                
                if (isEmpty(idCustomerClass) && !isEmpty(idCustomerExc)) {
                    arErrMessage.push('Customer Exclusions can only be used with Eligible Customer Classification');
                }
            } else if (objAgrFields[FLD_CUSTRECORD_TYPE] == HC_REB_TYPE.RebPurchase) {
                //if(isEmpty(idVendor)) arErrMessage.push('Eligible Vendor must be specified.');
                if(!isEmpty(idCustomer)) arErrMessage.push('Eligible Customer must not be specified.');
                if(!isEmpty(idCustomerClass)) arErrMessage.push('Eligible Customer Classification must not be specified.');
                if(!isEmpty(idCustomerExc)) arErrMessage.push('Customer Exclusion must not be specified.');
                
                if(!isEmpty(idVendor) && !isEmpty(idVendorClass)){ 
                    arErrMessage.push('You may only select either a Vendor or Vendor Classification.');
                }else if(isEmpty(idVendor) && isEmpty(idVendorClass)){
                    arErrMessage.push('Eligible Vendor or Eligible Vendor Classification must be specified.');
                }
                
                if (isEmpty(idVendorClass) && !isEmpty(idVendorExc)) {
                    arErrMessage.push('Vendor Exclusions can only be used with Eligible Vendor Classification');
                }
            }
        }else{
            if(!isEmpty(idCustomer)) arErrMessage.push('Eligible Customer must not be specified.');
            if(!isEmpty(idVendor)) arErrMessage.push('Eligible Vendor must not be specified.');
            
            if(!isEmpty(idCustomerClass)) arErrMessage.push('Eligible Customer Classification must not be specified.');
            if(!isEmpty(idVendorClass)) arErrMessage.push('Eligible Vendor Classification must not be specified.');
            
            if(!isEmpty(idCustomerExc)) arErrMessage.push('Customer Exclusion must not be specified.');
            if(!isEmpty(idVendorExc)) arErrMessage.push('Vendor Exclusion must not be specified.');
        }
        
        //PRICE PASS THROUGH
        if(objAgrFields[FLD_CUSTRECORD_TYPE] != HC_REB_TYPE.RebSale){
            if(forceParseFloat(flPassThroughPerc) > 0) arErrMessage.push('Price Pass Through % must not be specified.');
            if(forceParseFloat(flPassThroughVal) > 0) arErrMessage.push('Price Pass Through Value must not be specified.');
        }else{
            if(forceParseFloat(flPassThroughPerc) > 0 && forceParseFloat(flPassThroughVal) > 0)
                arErrMessage.push('You may only input either a Price Pass Through % or Price Pass Through Value.');
            
            if(!isEmpty(flPassThroughVal) && forceParseFloat(flPassThroughVal) <= 0)
                arErrMessage.push('Price Pass Through Value must be greater than 0.');
        }
        
        /*VALIDATE SUBSIDIARY AND CURRENCY OF SELECTED AGREEMENT AND 
          CUSTOMER/VENDOR IF THEY MATCH*/
        var arVendValidateSubCur = validateSubsidiaryCurrency(idAgreement, idVendor, HC_VENDOR);
        var arCustValidateSubCur = validateSubsidiaryCurrency(idAgreement, idCustomer, HC_CUSTOMER);
        if (arVendValidateSubCur.length > 0) arErrMessage.push(arVendValidateSubCur.join('<br>'));
        if (arCustValidateSubCur.length > 0) arErrMessage.push(arCustValidateSubCur.join('<br>'));
    }
    
    if(!isEmpty(idCalcMethod)){
        fldCalcMethod = [FLD_CUSTRECORD_SHOW_PERCENT, FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_SHOW_REB_COST, FLD_CUSTRECORD_REB_IS_TIERED];
        objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, idCalcMethod, fldCalcMethod);
        
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T' 
            && objCalcMethodFlds[FLD_CUSTRECORD_REB_IS_TIERED] != 'T'
            && forceParseFloat(flPercent) <= 0) arErrMessage.push('Rebate Percent must be greater than 0.');
        else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] != 'T'
            && forceParseFloat(flPercent) > 0) arErrMessage.push('Rebate Percent must be set to blank.');
        
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T' 
            && forceParseFloat(flAmount) <= 0) arErrMessage.push('Rebate Amount must be greater than 0.');
        else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] != 'T'
            && forceParseFloat(flAmount) > 0) arErrMessage.push('Rebate Amount must be set to blank.');
        
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T' 
            && forceParseFloat(flRebCost) <= 0) arErrMessage.push('Rebate Cost must be greater than 0.');
        else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] != 'T'
            && forceParseFloat(flRebCost) > 0) arErrMessage.push('Rebate Cost must be set to blank.');
    }
    
    var intValidateEligible = validateEligibleFields({
        rebateDetail : idRebateDetail,
        agreement    : idAgreement,
        item         : idItem,
        itemClass    : idItemClass,
        customer     : idCustomer,
        customerClass: idCustomerClass,
        vendor       : idVendor,
        vendorClass  : idVendorClass
    });
    
    if(!isEmpty(intValidateEligible))
        arErrMessage.push('The same Eligible fields should be populated for the rest of the Agreement Details under the selected Rebate Agreement.');
    
    if(arErrMessage.length > 0) throw nlapiCreateError('Error', arErrMessage.join('<br>'), true);
}

function validateTransDetailAttached(idAgrDetail){
    var objResults = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
            [new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGR_DET, null,
                    'anyof', idAgrDetail)]);
    if(!isEmpty(objResults)) return true;
    return false;
}

function validateSubsidiaryCurrency(idAgreement, idEntity, idRecord) {
    var arCurrency = [], stErrMessage = [];

    if (!isEmpty(idEntity) && !isEmpty(idAgreement)) {
        var recEntity = nlapiLoadRecord(idRecord, idEntity);
        var stEntityType = recEntity.getRecordType();
        var intCurrencyCount = recEntity.getLineItemCount(HC_CURRENCY);

        // VALIDATE SUBSIDIARY
        var stRecType = nlapiGetRecordType();
        if (HC_OBJ_FEATURE.blnOneWorld == true) {
        	var arrVer = nlapiGetContext().getVersion().split('.');
        	if ((stEntityType == HC_VENDOR || stEntityType == HC_CUSTOMER) &&
        			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
	            var fldAgrSubsidiary = nlapiLookupField(REC_REBATE_AGREEMENT, 
	                    idAgreement, [FLD_CUSTRECORD_SUBSIDIARY]);
	            var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity),
            		new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', [fldAgrSubsidiary[FLD_CUSTRECORD_SUBSIDIARY]])];
                var objSubsidiaryResults = nlapiSearchRecord(idRecord, null, arFilter);
                if(isEmpty(objSubsidiaryResults))
                    stErrMessage.push(stEntityType.capitalizeFirstLetter()
                        + ' subsidiary must be consistent with the Agreement Subsidiary');
        	} else {
	            var objEntity = nlapiLookupField(idRecord, idEntity, [
	                HC_SUBSIDIARY
	            ]);
	            var fldAgrSubsidiary = nlapiLookupField(REC_REBATE_AGREEMENT, 
	                    idAgreement, [FLD_CUSTRECORD_SUBSIDIARY]);
	            if (objEntity[HC_SUBSIDIARY] != fldAgrSubsidiary[FLD_CUSTRECORD_SUBSIDIARY]) {
	                stErrMessage
	                        .push(stEntityType.capitalizeFirstLetter()
	                              + ' subsidiary must be consistent with the Agreement Subsidiary.');
	            }
        	}
        }

        // VALIDATE CURRENCY
        var fldAgrCurrency = nlapiLookupField(REC_REBATE_AGREEMENT, 
                idAgreement, [FLD_CUSTRECORD_CURRENCY]);
        if (HC_OBJ_FEATURE.bMultiCurrency == true) {
            for (var line = 1; line <= intCurrencyCount; line++) {
                arCurrency.push(recEntity.getLineItemValue(HC_CURRENCY,
                        HC_CURRENCY, line))
            }
            if (arCurrency.indexOf(fldAgrCurrency[FLD_CUSTRECORD_CURRENCY]) < 0) {
                stErrMessage
                        .push('Currency of the Agreement must be available for the selected '
                              + stEntityType.capitalizeFirstLetter() + '.');
            }

        } /*else {
            var stPrimaryCurrency = recEntity.getFieldValue(HC_CURRENCY);
            if (stPrimaryCurrency != fldAgrCurrency[FLD_CUSTRECORD_CURRENCY]) {
                stErrMessage
                        .push('Currency of the Agreement must be the Primary Currency of the selected '
                              + stEntityType.capitalizeFirstLetter() + '.');
            }
        }*/

    }
    return stErrMessage;
}