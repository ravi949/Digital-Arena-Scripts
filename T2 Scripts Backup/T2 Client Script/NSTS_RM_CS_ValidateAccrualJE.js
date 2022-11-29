/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Mar 2018     rilagan
 *
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
function trans_pageInit(type){
	try{

		var stLogTitle = "trans_pageInit";
	    var stRebateId = nlapiGetFieldValue('custbody_nsts_rm_ra_id');
	    var stAccrualId = nlapiGetFieldValue('custbody_nsts_rm_accrual_je');
	    if(type == HC_MODE_TYPE.Edit && !isEmpty(stAccrualId) && !isEmpty(stRebateId)){
	    	alert("This is a system-generated transaction. Please ensure that related transaction/s is/are in synch on the changes to be done.");
	    } 
	}catch(err){
		nlapiLogExecution('error',stLogTitle,err.toString());
	}
    return true;
}
