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
 * Also includes server side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Mar 2017     Roxanne Audette   Initial version.
 * 
 */

function exclusion_BeforeLoad(type, form, request){
    if (type == HC_MODE_TYPE.Edit){
        var stExcType = nlapiGetFieldValue(FLD_EXC_TYPE);
        
        if(stExcType == HC_EXEC_TYPE.Item){
            nlapiGetField(FLD_EXC_CUSTOMER).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_VENDOR).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }else if(stExcType == HC_EXEC_TYPE.Customer){
            nlapiGetField(FLD_EXC_ITEM).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_ITEM_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_VENDOR).setDisplayType(HC_DISPLAY_TYPE.Disabled);            
            nlapiGetField(FLD_EXC_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }else if(stExcType == HC_EXEC_TYPE.Vendor){
            nlapiGetField(FLD_EXC_ITEM).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_ITEM_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_EXC_CUSTOMER).setDisplayType(HC_DISPLAY_TYPE.Disabled);            
            nlapiGetField(FLD_EXC_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }
    }
}

function exclusion_BeforeSubmit(type){
    if(type != HC_MODE_TYPE.Delete){
        if(type == HC_MODE_TYPE.Xedit)
            throw nlapiCreateError('Error', 'Inline edit is not allowed', true);
        
        var arErrMessage = [];
        var stErrMessage = '';
        var stExcAgr  = nlapiGetFieldValue(FLD_EXC_AGREEMENT);
        var stExcType     = nlapiGetFieldValue(FLD_EXC_TYPE);
        var stExcItem      = nlapiGetFieldValue(FLD_EXC_ITEM);
        var stExcCustomer  = nlapiGetFieldValue(FLD_EXC_CUSTOMER);
        var stExcVendor    = nlapiGetFieldValue(FLD_EXC_VENDOR);
        var stExcItemClass      = nlapiGetFieldValue(FLD_EXC_ITEM_CLASS);
        var stExcCustomerClass  = nlapiGetFieldValue(FLD_EXC_CUST_CLASS);
        var stExcVendorClass    = nlapiGetFieldValue(FLD_EXC_VEND_CLASS);
        
        if(!isEmpty(stExcAgr) && !isEmpty(stExcType)){
            var objAgrFlds = nlapiLookupField(REC_REBATE_AGREEMENT, stExcAgr, [FLD_CUSTRECORD_INCLUDE_ALL, FLD_CUSTRECORD_TYPE]);
            var lstRebateType = objAgrFlds[FLD_CUSTRECORD_TYPE];
            var bIncludeAll = objAgrFlds[FLD_CUSTRECORD_INCLUDE_ALL];
            
            if(stExcType == HC_EXEC_TYPE.Item){
                if(!isEmpty(stExcVendor) || !isEmpty(stExcVendorClass) || !isEmpty(stExcCustomer) || !isEmpty(stExcCustomerClass))
                    stErrMessage = 'Only Item Classification and Item can be specified.';
            }else if(stExcType == HC_EXEC_TYPE.Customer){
                if(bIncludeAll == 'T'){
                    stErrMessage = 'You may only select the Item Exclusion Type.';
                }else if(bIncludeAll != 'T' && lstRebateType == HC_REB_TYPE.RebPurchase){
                    stErrMessage = 'You may only select the Item or Vendor Exclusion Type.';
                }else if(!isEmpty(stExcVendor) || !isEmpty(stExcVendorClass) || !isEmpty(stExcItem) || !isEmpty(stExcItemClass)){
                    stErrMessage = 'Only Customer Classification and Customer can be specified.';
                }
            }else if(stExcType == HC_EXEC_TYPE.Vendor){
                if(bIncludeAll == 'T'){
                    stErrMessage = 'You may only select the Item Exclusion Type.';
                }else if(bIncludeAll != 'T' && lstRebateType != HC_REB_TYPE.RebPurchase){
                    stErrMessage = 'You may only select the Item or Customer Exclusion Type.';
                }else if(!isEmpty(stExcCustomer) || !isEmpty(stExcCustomerClass) || !isEmpty(stExcItem) || !isEmpty(stExcItemClass)){
                    stErrMessage = 'Only Vendor Classification and Vendor can be specified.';
                }
            }
        }
        
        if(!isEmpty(stErrMessage)){
            arErrMessage.push(stErrMessage);
        }else{
            arErrMessage = validateExclusionRec({
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
        }
        
        if(!isEmpty(arErrMessage)){
            throw nlapiCreateError('Error', arErrMessage.join('<br>'), true);
        }
    }
}

function exclusion_AfterSubmit(type){
    try{
        var objExecution = nlapiGetContext().getExecutionContext();
        if(type != HC_MODE_TYPE.Delete && objExecution != HC_EXECUTION_CONTEXT.scheduled){
            var idExclusion = nlapiGetRecordId();
            var stExcAgr  = nlapiGetFieldValue(FLD_EXC_AGREEMENT);
            var stExcType     = nlapiGetFieldValue(FLD_EXC_TYPE);
            var stExcItem      = nlapiGetFieldValue(FLD_EXC_ITEM);
            var stExcCustomer  = nlapiGetFieldValue(FLD_EXC_CUSTOMER);
            var stExcVendor    = nlapiGetFieldValue(FLD_EXC_VENDOR);
            var stExcItemClass      = nlapiGetFieldValue(FLD_EXC_ITEM_CLASS);
            var stExcCustomerClass  = nlapiGetFieldValue(FLD_EXC_CUST_CLASS);
            var stExcVendorClass    = nlapiGetFieldValue(FLD_EXC_VEND_CLASS); 
            
            //Get Old Exclusion field values
            var recOldRec             = nlapiGetOldRecord();
            var bExcChanged           = false;
            
            if (!isEmpty(recOldRec)) {
                var stExcOldAgr = recOldRec.getFieldValue(FLD_EXC_AGREEMENT);
                if(stExcOldAgr != stExcAgr) bExcChanged = true;
                
                var stExcOldType = recOldRec.getFieldValue(FLD_EXC_TYPE);
                if(stExcOldType != stExcType) bExcChanged = true;
                
                var stExcOldItem = recOldRec.getFieldValue(FLD_EXC_ITEM);
//                if(!isEmpty(stExcOldItem) && !isEmpty(stExcItem) && stExcOldItem != stExcItem) bExcChanged = true;
//                
                var stExcOldCustomer = recOldRec.getFieldValue(FLD_EXC_CUSTOMER);
//                if(!isEmpty(stExcOldCustomer) && !isEmpty(stExcCustomer) && stExcOldCustomer != stExcCustomer) bExcChanged = true;
//                
                var stExcOldVendor = recOldRec.getFieldValue(FLD_EXC_VENDOR);
//                if(!isEmpty(stExcOldVendor) && !isEmpty(stExcVendor) && stExcOldVendor != stExcVendor) bExcChanged = true;
                
                var stExcOldItemClass = recOldRec.getFieldValue(FLD_EXC_ITEM_CLASS);
                if(!isEmpty(stExcOldItemClass) && !isEmpty(stExcItemClass) && stExcOldItemClass != stExcItemClass) bExcChanged = true;
                
                var stExcOldCustomerClass = recOldRec.getFieldValue(FLD_EXC_CUST_CLASS);
                if(!isEmpty(stExcOldCustomerClass) && !isEmpty(stExcCustomerClass) && stExcOldCustomerClass != stExcCustomerClass) bExcChanged = true;
                
                var stExcOldVendorClass = recOldRec.getFieldValue(FLD_EXC_VEND_CLASS);
                if(!isEmpty(stExcOldVendorClass) && !isEmpty(stExcVendorClass) && stExcOldVendorClass != stExcVendorClass) bExcChanged = true;
            }
            
            
            if(objExecution == HC_EXECUTION_CONTEXT.userinterface){
                var arrExclusionParam = new Array();
                var objExclusionJson = {
                        bWithLimit : false,
                        idExclusion: idExclusion,
                        stExcAgr: stExcAgr,
                        stExcType: stExcType,
                        stExcItem: stExcItem, 
                        stExcCustomer: stExcCustomer,
                        stExcVendor: stExcVendor,
                        stExcItemClass: stExcItemClass,
                        stExcCustomerClass: stExcCustomerClass,
                        stExcVendorClass: stExcVendorClass,
                        bExcChanged: bExcChanged,
                        stExcOldAgr: stExcOldAgr,
                        stExcOldType: stExcOldType,
                        stExcOldItem: stExcOldItem,
                        stExcOldCustomer: stExcOldCustomer,
                        stExcOldVendor: stExcOldVendor,
                        stExcOldItemClass: stExcOldItemClass,
                        stExcOldCustomerClass: stExcOldCustomerClass,
                        stExcOldVendorClass: stExcOldVendorClass 
                };
                
                arrExclusionParam[SPARAM_EXCLUSION_JSON] = parseJsonToString(objExclusionJson, '{}');
                nlapiScheduleScript(SCRIPT_LINK_RAD_EXCLUSION, null, arrExclusionParam);
            }else if(objExecution == HC_EXECUTION_CONTEXT.csvimport){
                var objLinkRADExclusion = linkRADToExclusion({
                    context : nlapiGetContext(),
                    bWithLimit : true,
                    idExclusion: idExclusion,
                    stExcAgr: stExcAgr,
                    stExcType: stExcType,
                    stExcItem: stExcItem, 
                    stExcCustomer: stExcCustomer,
                    stExcVendor: stExcVendor,
                    stExcItemClass: stExcItemClass,
                    stExcCustomerClass: stExcCustomerClass,
                    stExcVendorClass: stExcVendorClass,
                    bExcChanged: bExcChanged,
                    stExcOldAgr: stExcOldAgr,
                    stExcOldType: stExcOldType,
                    stExcOldItem: stExcOldItem,
                    stExcOldCustomer: stExcOldCustomer,
                    stExcOldVendor: stExcOldVendor,
                    stExcOldItemClass: stExcOldItemClass,
                    stExcOldCustomerClass: stExcOldCustomerClass,
                    stExcOldVendorClass: stExcOldVendorClass
                });
                    
                    nlapiLogExecution('DEBUG', 'LINK RAD TO EXCLUSION', 
                            'NO. OF RAD LINKED TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_LINKED);
                    nlapiLogExecution('DEBUG', 'LINK RAD TO EXCLUSION', 
                            'NO. OF RAD FAILED TO LINK TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_FAILED);
                    nlapiLogExecution('DEBUG', 'UNLINK RAD TO EXCLUSION', 
                            'NO. OF RAD UNLINKED TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_UNLINK);
                    nlapiLogExecution('DEBUG', 'UNLINK RAD TO EXCLUSION', 
                            'NO. OF RAD FAILED TO UNLINK TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_UNLINK_F);
            }
        }
    }catch(e){
        nlapiLogExecution('ERROR', 'exclusion_AfterSubmit[ERROR]', e);
    }
}