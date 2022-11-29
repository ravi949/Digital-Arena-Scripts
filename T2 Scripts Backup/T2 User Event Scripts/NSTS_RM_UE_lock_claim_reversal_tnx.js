/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jul 2017     dgeronimo
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
function lockReversal_userEventBeforeLoad(type, form, request){
	var stLogTitle = "LOCKREVERSAL_USEREVENTBEFORELOAD";
    var context = nlapiGetContext();
    var arrRMAdmin = context.getSetting("script", 'custscript_nsts_rm_admins'); 
    arrRMAdmin = isEmpty(arrRMAdmin)? []: arrRMAdmin.split(',');
    
    var stReversalFor = nlapiGetFieldValue(FLD_CUSTBODY_NSTS_RM_CLAIM_REVERSAL_FOR);
    var stUserRoleId = nlapiGetRole() + "";
    
    log('DEBUG', stLogTitle, "stUserRoleId:" + stUserRoleId + " stReversalFor:" + stReversalFor  + " arrRMAdmin:" + JSON.stringify(arrRMAdmin));
    if(!isEmpty(stReversalFor)){ //&& arrRMAdmin.indexOf(stUserRoleId)< 0 ){
    	/*if(type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Copy || type == HC_MODE_TYPE.Delete){
    		throw "Action Denied! You are not allow to edit copy delete this Claim Reversal Transaction";
    	}	*/
    	if(type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Copy || type == HC_MODE_TYPE.Delete){
    		var objFldScript = form.addField("custpage_edit_natification2", "inlinehtml", " script");
    		objFldScript.setDefaultValue('<script type="text/javascript">alert("This is an auto-generated transaction, please be aware of the potential impact on any change to be made.")</script>');
    	
    	}
    }/*else{
    	if(type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Copy || type == HC_MODE_TYPE.Delete){
    		var objFldScript = form.addField("custpage_edit_natification", "inlinehtml", " script");
    		objFldScript.setDefaultValue('<script type="text/javascript">alert("This is an auto-generated transaction, please be aware of the potential impact on any change to be made.")</script>');
    	
    	}
    }*/
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function lockReversal_userEventBeforeSubmit(type){
 
}
