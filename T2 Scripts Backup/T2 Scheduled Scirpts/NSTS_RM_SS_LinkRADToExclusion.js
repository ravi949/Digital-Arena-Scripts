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
 * This script creates Rebate Agreement Detail records via selected values
 * in Process Eligibility Suitelet.
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Mar 2015     Roxanne Audette   Initial version.
 * 
 */


var HC_EXC_LINK_ERROR_MSG = [],
    HC_EXC_UNLINK_ERROR_MSG = [];

function linkRADToExclusion_Scheduled(type){
    var objContext = nlapiGetContext();
    var objExclusion = objContext.getSetting("SCRIPT", SPARAM_EXCLUSION_JSON); 
        objExclusion = parseStringToJson(objExclusion, {});
        
    var stExclusionUrl = (!isEmpty(objExclusion.idExclusion)) ? 
            nlapiResolveURL('RECORD', REC_EXCLUSION, objExclusion.idExclusion) : '';
    
    try{
        if(Object.keys(objExclusion).length > 0){
            var objLinkRADExclusion = linkRADToExclusion({
                context : objContext,
                bWithLimit : objExclusion.bWithLimit,
                idExclusion: objExclusion.idExclusion,
                stExcAgr: objExclusion.stExcAgr,
                stExcType: objExclusion.stExcType,
                stExcItem: objExclusion.stExcItem, 
                stExcCustomer: objExclusion.stExcCustomer,
                stExcVendor: objExclusion.stExcVendor,
                stExcItemClass: objExclusion.stExcItemClass,
                stExcCustomerClass: objExclusion.stExcCustomerClass,
                stExcVendorClass: objExclusion.stExcVendorClass,
                bExcChanged: objExclusion.bExcChanged,
                stExcOldAgr: objExclusion.stExcOldAgr,
                stExcOldType: objExclusion.stExcOldType,
                stExcOldItem: objExclusion.stExcOldItem,
                stExcOldCustomer: objExclusion.stExcOldCustomer,
                stExcOldVendor: objExclusion.stExcOldVendor,
                stExcOldItemClass: objExclusion.stExcOldItemClass,
                stExcOldCustomerClass: objExclusion.stExcOldCustomerClass,
                stExcOldVendorClass: objExclusion.stExcOldVendorClass 
            });
        }
        
        nlapiLogExecution('DEBUG', 'LINK RAD TO EXCLUSION', 
                'NO. OF RAD LINKED TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_LINKED);
        nlapiLogExecution('DEBUG', 'LINK RAD TO EXCLUSION', 
                'NO. OF RAD FAILED TO LINK TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_FAILED);
        nlapiLogExecution('DEBUG', 'UNLINK RAD TO EXCLUSION', 
                'NO. OF RAD UNLINKED TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_UNLINK);
        nlapiLogExecution('DEBUG', 'UNLINK RAD TO EXCLUSION', 
                'NO. OF RAD FAILED TO UNLINK TO EXCLUSION: ' + objLinkRADExclusion.HC_EXC_UNLINK_F);
        
        //SEND NOTIFICATION EMAIL TO USER
        try {
            if (!isEmpty(objContext.getEmail())) {
                var stEmailBody = 'Linking and Unlinking of RADs to Exclusion has been completed. ' + objLinkRADExclusion.HC_EXC_LINKED
                    + ' detail(s) were linked and '+objLinkRADExclusion.HC_EXC_UNLINK+' were unlinked.<br>Click here to view the transaction: https://system.na1.netsuite.com'
                    + stExclusionUrl;
                if(!isEmpty(HC_EXC_LINK_ERROR_MSG)){
                    stEmailBody += '<br><br>There are ' + objLinkRADExclusion.HC_EXC_FAILED +' details(s) that were not linked due to error:<br>'
                        + (HC_EXC_LINK_ERROR_MSG.toString()).replace(/,/g,'<br>');
                }
                if(!isEmpty(HC_EXC_UNLINK_ERROR_MSG)){
                    stEmailBody += '<br><br>There are ' + objLinkRADExclusion.HC_EXC_UNLINK_F +' details(s) that were not unlinked due to error:<br>'
                        + (HC_EXC_UNLINK_ERROR_MSG.toString()).replace(/,/g,'<br>');
                }
                nlapiSendEmail(
                        objContext.getUser(),
                        objContext.getEmail(),
                        'Linking and Unlinking of RADs to Exclusion is Complete for Exclusion record with id ' + objExclusion.idExclusion,
                        stEmailBody);
            }
        } catch (error) { 
            nlapiLogExecution('DEBUG', 'linkRADToExclusion_Scheduled EMAIL[ERROR]', error);
            //Do nothing, most likely error encountered when getting email is invalid user or email address
        }
    }catch(e){
        nlapiLogExecution('DEBUG', 'linkRADToExclusion_Scheduled[ERROR]', e);
        if (!isEmpty(objContext.getEmail())){
             nlapiSendEmail(
                objContext.getUser(),
                objContext.getEmail(),
                'Linking and Unlinking of RADs to Exclusion has encountered a problem for Exclusion record with id ' + objExclusion.idExclusion,
                'Linking and Unlinking of RADs to Exclusion has encountered a problem.<br>' + 'Click here to view the agreement: https://system.na1.netsuite.com' + stExclusionUrl);
        }    
    }
}