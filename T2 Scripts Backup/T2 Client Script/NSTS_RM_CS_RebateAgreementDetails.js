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
 * This script is used for disabling, enabling and hiding of fields.
 * Also includes client side validation for Rebate Agreement Details.
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Mar 2015     Roxanne Audette   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * CLIENT SIDE FUNCTIONS
 * ====================================================================
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function disableEnableFlds_PageInit(){
   var idAgrDetail = nlapiGetRecordId();
   if(isEmpty(idAgrDetail)){
       nlapiDisableField(FLD_CUSTRECORD_DET_PERCENT, true);
       nlapiDisableField(FLD_CUSTRECORD_DET_AMT, true);
       nlapiDisableField(FLD_CUSTRECORD_DET_REBATE_COST, true);
   }
   
}

function validateFldValues_SaveRecord(){
    var idAgrDetail = nlapiGetRecordId();
    var idAgreement = nlapiGetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
    var idCalcMethod = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD);
    var idCustomer = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CUST);
    var idVendor = nlapiGetFieldValue(FLD_CUSTRECORD_DET_VEND);
    var flPercent = nlapiGetFieldValue(FLD_CUSTRECORD_DET_PERCENT);
    var flAmount = nlapiGetFieldValue(FLD_CUSTRECORD_DET_AMT);
    var flRebCost = nlapiGetFieldValue(FLD_CUSTRECORD_DET_REBATE_COST);
    var bInactive = nlapiGetFieldValue(HC_IS_INACTIVE);
    var arAgrFields, objAgrFields, arCalcMethodFlds, objCalcMethodFlds;
    
    var idItem = nlapiGetFieldValue(FLD_CUSTRECORD_DET_ITEM);
    var idItemClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
    var idCustomerClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS);
    var idVendorClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS);
    var stUom = nlapiGetFieldValue(FLD_CUSTRECORD_DET_UOM); 
    
    var idItemExc = nlapiGetFieldValue(FLD_CUSTRECORD_DET_ITEM_EXCL);
    var idCustomerExc = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CUST_EXCL);
    var idVendorExc = nlapiGetFieldValue(FLD_CUSTRECORD_DET_VEND_EXCL);
    var flPassThroughPerc = nlapiGetFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_PERC);
    var flPassThroughVal = nlapiGetFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_VAL);
    
    var arErrMessage = [];
    if(!isEmpty(idAgrDetail)){
        if(validateTransDetailAttached(idAgrDetail)){
            if(bInactive == 'T') arErrMessage.push('There are Transaction Details associated with this record,'
                    + ' so it cannot be inactivated.');
        }
    }
    
    if(!isEmpty(idAgreement)){
        arAgrFields = [FLD_CUSTRECORD_TYPE, FLD_CUSTRECORD_INCLUDE_ALL, FLD_CUSTRECORD_STATUS];
        objAgrFields = nlapiLookupField(REC_REBATE_AGREEMENT, idAgreement, arAgrFields);
        
        if(objAgrFields[FLD_CUSTRECORD_STATUS] == HC_AGR_STATUS.Approve
                && !isEmpty(idAgrDetail) && bInactive == 'F'){
            if(validateTransDetailAttached(idAgrDetail)) arErrMessage.push('There are Transaction Details associated with this record. ' 
                        +'Update is not allowed if the selected Agreement is Approved.');
        }
        
        //ELIGIBLE ITEM
        if(!isEmpty(idItem) && !isEmpty(idItemClass)){ 
            arErrMessage.push('You may only select either an Item or Item Classification.');
        }else if(isEmpty(idItem) && isEmpty(idItemClass)) {
            arErrMessage.push('Eligible Item or Eligible Item Classification must be specified.');
        }
        
        if (isEmpty(idItemClass) && !isEmpty(idItemExc)) {
            arErrMessage.push('Item Exclusions can only be used with Eligible Item Classification');
        }
        
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
    }
    
    //PRICE PASS THROUGH
    if(forceParseFloat(flPassThroughPerc) > 0 && forceParseFloat(flPassThroughVal) > 0)
        arErrMessage.push('You may only input either a Price Pass Through % or Price Pass Through Value.');
    
    if(!isEmpty(flPassThroughVal) && forceParseFloat(flPassThroughVal) <= 0)
        arErrMessage.push('Price Pass Through Value must be greater than 0.');
    
    if(!isEmpty(idCalcMethod)){
        arCalcMethodFlds = [FLD_CUSTRECORD_SHOW_PERCENT, FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_SHOW_REB_COST, FLD_CUSTRECORD_REB_IS_TIERED];
        objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, idCalcMethod, arCalcMethodFlds);
        
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT] == 'T' 
            && objCalcMethodFlds[FLD_CUSTRECORD_REB_IS_TIERED] != 'T'
            && forceParseFloat(flPercent) <= 0){
                arErrMessage.push('Rebate Percentage must be greater than 0.');
        }else if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T' 
            && forceParseFloat(flAmount) <= 0){
                arErrMessage.push('Rebate Amount must be greater than 0.');
        }
        
        if(objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST] == 'T' 
            && forceParseFloat(flRebCost) <= 0) 
            arErrMessage.push('Rebate Cost must be greater than 0.');
    }
    
    var intValidateEligible = validateEligibleFields({
        rebateDetail : idAgrDetail,
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
        
    if(arErrMessage.length > 0){
        alert(arErrMessage.join('\n'));
        return false;
    }
    
    var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
    
    var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
        (!isEmpty(idCustomerClass)) ? checkEmptyValue(idCustomerClass) :
            (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendorClass);
            
    // CHECK FOR DUPLICATE REBATE DETAIL RECORD
    var stConcatLineValue = checkEmptyValue(idAgreement) + '_'
                              + intEligItemEntClass + '_'
                              + intEntity + '_'
                              + checkEmptyValue(stUom);
    
    var stType = (isEmpty(idAgrDetail)) ? HC_MODE_TYPE.Create : '';
    
    if (getDuplicateRebateDetail(stConcatLineValue, REC_AGREEMENT_DETAIL,
             idAgrDetail, stType) > 0) {
         alert('There is already an existing record with the same Rebate Detail Combination.');
         return false;
    }
     
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function disableFldByCalcMethod_FieldChanged(type, name, linenum){
    var idAgreement = nlapiGetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
    if (name==FLD_CUSTRECORD_REBATE_AGREEMENT){
        if(!isEmpty(idAgreement)){
            var arAgrFields = [FLD_CUSTRECORD_TYPE, FLD_CUSTRECORD_INCLUDE_ALL, FLD_CUSTRECORD_STATUS];
            var objAgrFields = nlapiLookupField(REC_REBATE_AGREEMENT, idAgreement, arAgrFields);
            
            if(objAgrFields[FLD_CUSTRECORD_STATUS] == HC_AGR_STATUS.Closed){
                alert('Selected Agreement is already Closed.');
                nlapiSetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT, '');
                nlapiDisableField(FLD_CUSTRECORD_DET_CUST, false); 
                nlapiDisableField(FLD_CUSTRECORD_DET_VEND, false); 
                nlapiDisableField(FLD_CUSTRECORD_DET_EL_CUST_CLASS, false); 
                nlapiDisableField(FLD_CUSTRECORD_DET_EL_VEND_CLASS, false); 
            }else{
                toggleDisableCustVend(objAgrFields[FLD_CUSTRECORD_TYPE], objAgrFields[FLD_CUSTRECORD_INCLUDE_ALL]);
            }
            
        }
    }

    if(name == FLD_CUSTRECORD_DET_CALC_METHOD){
        var idCalcMethod = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD);
        var flPriceThroughPerc = 0;
        var flPriceThroughVal = 0;
        if(!isEmpty(idCalcMethod)){
            var fldCalcMethod = [FLD_CUSTRECORD_SHOW_PERCENT, FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_SHOW_REB_COST, 
                                 FLD_CUSTRECORD_REB_CALC_COST_BASIS];
            var objCalcMethodFlds = nlapiLookupField(REC_CALC_METHOD, idCalcMethod, fldCalcMethod);
            
            toggleDisablePercentAmount(FLD_CUSTRECORD_DET_PERCENT, objCalcMethodFlds[FLD_CUSTRECORD_SHOW_PERCENT]);
            toggleDisablePercentAmount(FLD_CUSTRECORD_DET_AMT, objCalcMethodFlds[FLD_CUSTRECORD_SHOW_AMOUNT]);
            toggleDisablePercentAmount(FLD_CUSTRECORD_DET_REBATE_COST, objCalcMethodFlds[FLD_CUSTRECORD_SHOW_REB_COST]);
            
            nlapiSetFieldValue('custpage_nsts_rm_cost_basis_text', objCalcMethodFlds[FLD_CUSTRECORD_REB_CALC_COST_BASIS]);
            
        }else{
            nlapiSetFieldValue('custpage_nsts_rm_cost_basis_text', '');
        }
    }
    
    var stEligItem = nlapiGetFieldValue(FLD_CUSTRECORD_DET_ITEM);
    var stEligCust = nlapiGetFieldValue(FLD_CUSTRECORD_DET_CUST);
    var stEligVend = nlapiGetFieldValue(FLD_CUSTRECORD_DET_VEND);
    
    var stEligItemClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
    var stEligCustClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS);
    var stEligVendClass = nlapiGetFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS);
    
    if((name == FLD_CUSTRECORD_DET_ITEM || name == FLD_CUSTRECORD_DET_EL_ITEM_CLASS) && !isEmpty(stEligItem) && !isEmpty(stEligItemClass)){
        nlapiSetFieldValue(name, '');
        alert('You may only select either an Item or Item Classification.');
    }
    if((name == FLD_CUSTRECORD_DET_CUST || name == FLD_CUSTRECORD_DET_EL_CUST_CLASS) && !isEmpty(stEligCust) && !isEmpty(stEligCustClass)){
        nlapiSetFieldValue(name, '');
        alert('You may only select either a Customer or Customer Classification.');
    }
    if((name == FLD_CUSTRECORD_DET_VEND || name == FLD_CUSTRECORD_DET_EL_VEND_CLASS) && !isEmpty(stEligVend) && !isEmpty(stEligVendClass)){
        nlapiSetFieldValue(name, '');
        alert('You may only select either a Vendor or Vendor Classification.');
    }
}

function agrSubsidiaryCurrency_ValidateField(type, name, linenum){
   if(name == FLD_CUSTRECORD_DET_CUST || name == FLD_CUSTRECORD_DET_VEND){
       var idAgreement = nlapiGetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);
       if(!isEmpty(idAgreement)){
           var stEntity = (name == FLD_CUSTRECORD_DET_VEND) ? FLD_CUSTRECORD_DET_VEND
                   : FLD_CUSTRECORD_DET_CUST;
           var stRecord = (name == FLD_CUSTRECORD_DET_VEND) ? HC_VENDOR
                   : HC_CUSTOMER;
           
           var arValidateSubCur = validateSubsidiaryCurrency(stEntity, stRecord);
           if (arValidateSubCur.length > 0) {
               alert(arValidateSubCur.join('\n'));
               return false;
           }
       }
   }
   return true;
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */

function validateSubsidiaryCurrency(fldName, idRecord) {
    var arCurrency = [], stErrMessage = [];
    var idEntity = nlapiGetFieldValue(fldName);
    var idAgreement = nlapiGetFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT);

    if (!isEmpty(idEntity) && !isEmpty(idAgreement)) {
        var recEntity = nlapiLoadRecord(idRecord, idEntity);
        var stEntityType = recEntity.getRecordType();
        var intCurrencyCount = recEntity.getLineItemCount(HC_CURRENCY);

        // VALIDATE SUBSIDIARY
        if (HC_OBJ_FEATURE.blnOneWorld == true) {
        	var arrVer = nlapiGetContext().getVersion().split('.');
        	if (idRecord == HC_VENDOR &&
        			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
	            var fldAgrSubsidiary = nlapiLookupField(REC_REBATE_AGREEMENT, 
	                    idAgreement, [FLD_CUSTRECORD_SUBSIDIARY]);
                var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity),
                		new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', fldAgrSubsidiary)];
                var objSubsidiaryResults = nlapiSearchRecord(idRecord, null, arFilter);
                if(isEmpty(objSubsidiaryResults))
                    stErrMessage.push(stRecType.capitalizeFirstLetter()
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
	                              + ' subsidiary must be consistent with the Agreement Subsidiary');
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
                              + stEntityType.capitalizeFirstLetter());
            }

        } /*else {
            var stPrimaryCurrency = recEntity.getFieldValue(HC_CURRENCY);
            if (stPrimaryCurrency != fldAgrCurrency[FLD_CUSTRECORD_CURRENCY]) {
                stErrMessage
                        .push('Currency of the Agreement must be the Primary Currency of the selected '
                              + stEntityType.capitalizeFirstLetter());
            }
        }
*/
    }
    return stErrMessage;
}

function validateTransDetailAttached(idAgrDetail){
    var objResults = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
            [new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGR_DET, null,
                    'anyof', idAgrDetail)]);
    if(!isEmpty(objResults)) return true;
    return false;
}

function toggleDisablePercentAmount(fld, bool){
    nlapiDisableField(fld, true);
    if(bool == 'T'){
        nlapiDisableField(fld, false);
    }else{
        nlapiSetFieldValue(fld, '');
    }
}

function toggleDisableCustVend(idRebateType, bIncludeAll){
    disableEmptyFld(FLD_CUSTRECORD_DET_CUST, true);
    disableEmptyFld(FLD_CUSTRECORD_DET_VEND, true);
    disableEmptyFld(FLD_CUSTRECORD_DET_EL_CUST_CLASS, true);
    disableEmptyFld(FLD_CUSTRECORD_DET_EL_VEND_CLASS, true);
    
    if(bIncludeAll != 'T'){
        if(idRebateType != HC_REB_TYPE.RebPurchase){
            nlapiDisableField(FLD_CUSTRECORD_DET_CUST, false);
            nlapiDisableField(FLD_CUSTRECORD_DET_EL_CUST_CLASS, false);
        }else if(idRebateType == HC_REB_TYPE.RebPurchase){
            nlapiDisableField(FLD_CUSTRECORD_DET_VEND, false); 
            nlapiDisableField(FLD_CUSTRECORD_DET_EL_VEND_CLASS, false); 
        }
    }
}