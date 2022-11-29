/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * This Script is for validation and field display state when creating 
 * Classification Record
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jan 2017		Dennis Geronimo   Initial version.
 * 
 */

/**
 * invoke once the submit button is click if the return is false
 * page submit will not continue
 * this function will handle the duplicate record validation for classification 
 * and also check if there is a type of classification selected
 * @returns {Boolean}
 */
function classififacation_SaveRecord()
{
    var intRecId = nlapiGetRecordId();
    var bInactive = nlapiGetFieldValue(HC_IS_INACTIVE);
    var stCheckBoxValue = "";
    
    if(!isEmpty(intRecId)){
        var stHasDependent    = classificationHasDependents({
            id      : intRecId,
            inactive: bInactive
        });
        
        if(!isEmpty(stHasDependent)){
            alert(stHasDependent);
            return false;
        }
    }
    
    var retVal = true;
    //Validate Duplicate
    var stName = nlapiGetFieldValue('name');
    
    var intClassType = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);
    
    if(isEmpty(intClassType)){
    	alert('Classification is required.');
    	return false;
    }
    
    var arrFil = [];
    arrFil.push(new nlobjSearchFilter('name', null, 'is', stName));
    arrFil.push(new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE, null, 'anyof', intClassType));
    
    if(!isEmpty(intRecId)){
        arrFil.push(new nlobjSearchFilter('internalid', null, 'noneof', [intRecId]));
    }
    
    var arrRes = nlapiSearchRecord(REC_CUSTOMRECORD_NSTS_RM_GENERIC_CLASS, null, arrFil);
    if(!isEmpty(arrRes)){
        alert('Duplicate Classification');
        retVal =  false;
    }
    
   return retVal;
}