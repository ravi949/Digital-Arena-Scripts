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
 * This script is used for disabling, enabling of fields.
 * Also includes client side validation for Exclusions.
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Mar 2017     Roxanne Audette   Initial version.
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

function exclusion_FieldChanged(type, name){
    if(name == FLD_EXC_AGREEMENT){
        nlapiSetFieldValue(FLD_EXC_TYPE, '');
    }else if(name == FLD_EXC_TYPE){
        var stExcType = nlapiGetFieldValue(FLD_EXC_TYPE);
        var stExcAgr  = nlapiGetFieldValue(FLD_EXC_AGREEMENT);
        
        nlapiDisableField(FLD_EXC_ITEM, false); 
        nlapiDisableField(FLD_EXC_CUSTOMER, false); 
        nlapiDisableField(FLD_EXC_VENDOR, false); 
        nlapiDisableField(FLD_EXC_ITEM_CLASS, false); 
        nlapiDisableField(FLD_EXC_CUST_CLASS, false); 
        nlapiDisableField(FLD_EXC_VEND_CLASS, false); 
        
        nlapiSetFieldValue(FLD_EXC_ITEM, '');
        nlapiSetFieldValue(FLD_EXC_CUSTOMER, '');
        nlapiSetFieldValue(FLD_EXC_VENDOR, '');
        nlapiSetFieldValue(FLD_EXC_ITEM_CLASS, '');
        nlapiSetFieldValue(FLD_EXC_CUST_CLASS, '');
        nlapiSetFieldValue(FLD_EXC_VEND_CLASS, '');
        
        if(!isEmpty(stExcAgr) && !isEmpty(stExcType)){
            var objAgrFlds = nlapiLookupField(REC_REBATE_AGREEMENT, stExcAgr, [FLD_CUSTRECORD_INCLUDE_ALL, FLD_CUSTRECORD_TYPE]);
            var lstRebateType = objAgrFlds[FLD_CUSTRECORD_TYPE];
            var bIncludeAll = objAgrFlds[FLD_CUSTRECORD_INCLUDE_ALL];
            
            if(stExcType == HC_EXEC_TYPE.Item){
                nlapiDisableField(FLD_EXC_CUSTOMER, true); 
                nlapiDisableField(FLD_EXC_VENDOR, true); 
                nlapiDisableField(FLD_EXC_CUST_CLASS, true); 
                nlapiDisableField(FLD_EXC_VEND_CLASS, true); 
            }else if(stExcType == HC_EXEC_TYPE.Customer){
                if(bIncludeAll == 'T'){
                    nlapiSetFieldValue(FLD_EXC_TYPE, '');
                    alert('You may only select the Item Exclusion Type.');
                }else if(bIncludeAll != 'T' && lstRebateType == HC_REB_TYPE.RebPurchase){
                    nlapiSetFieldValue(FLD_EXC_TYPE, '');
                    alert('You may only select the Item or Vendor Exclusion Type.');
                }else{
                    nlapiDisableField(FLD_EXC_ITEM, true); 
                    nlapiDisableField(FLD_EXC_VENDOR, true); 
                    nlapiDisableField(FLD_EXC_ITEM_CLASS, true); 
                    nlapiDisableField(FLD_EXC_VEND_CLASS, true); 
                }
            }else if(stExcType == HC_EXEC_TYPE.Vendor){
                if(bIncludeAll == 'T'){
                    nlapiSetFieldValue(FLD_EXC_TYPE, '');
                    alert('You may only select the Item Exclusion Type.');
                }else if(bIncludeAll != 'T' && lstRebateType != HC_REB_TYPE.RebPurchase){
                    nlapiSetFieldValue(FLD_EXC_TYPE, '');
                    alert('You may only select the Item or Customer Exclusion Type.');
                }else{
                    nlapiDisableField(FLD_EXC_ITEM, true); 
                    nlapiDisableField(FLD_EXC_CUSTOMER, true); 
                    nlapiDisableField(FLD_EXC_ITEM_CLASS, true); 
                    nlapiDisableField(FLD_EXC_CUST_CLASS, true); 
                }
            }
        }
    }
}

function exclusion_SaveRecord(){
    var stExcAgr  = nlapiGetFieldValue(FLD_EXC_AGREEMENT);
    var stExcType     = nlapiGetFieldValue(FLD_EXC_TYPE);
    var stExcItem      = nlapiGetFieldValue(FLD_EXC_ITEM);
    var stExcCustomer  = nlapiGetFieldValue(FLD_EXC_CUSTOMER);
    var stExcVendor    = nlapiGetFieldValue(FLD_EXC_VENDOR);
    var stExcItemClass      = nlapiGetFieldValue(FLD_EXC_ITEM_CLASS);
    var stExcCustomerClass  = nlapiGetFieldValue(FLD_EXC_CUST_CLASS);
    var stExcVendorClass    = nlapiGetFieldValue(FLD_EXC_VEND_CLASS);
    
    var objValidateExc = validateExclusionRec({
        id       : nlapiGetRecordId(),
        agreement: stExcAgr,
        excType  : stExcType,
        item     : stExcItem,
        customer : stExcCustomer,
        vendor   : stExcVendor,
        itemClass: stExcItemClass,
        custClass: stExcCustomerClass,
        vendClass: stExcVendorClass
    }); 
    
    if(!isEmpty(objValidateExc)){
        alert(objValidateExc.join('\n'));
        return false;
    }
    
    
    return true;
}