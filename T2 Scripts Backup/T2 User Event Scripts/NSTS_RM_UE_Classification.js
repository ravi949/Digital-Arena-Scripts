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
 */

/**
 * invoke before the page is loaded
 * this event will check if the creation of classification is came from the item page or entity record
 * if make the checkbox on a read only state the atomatically select if
 * the classification type is Item,vendor or customer
 */
function classification_beforeLoad(type,form,request){	
    var stLogTitle = 'BEFORELOAD_CLASSIFICATION';
    if(type == 'create'){
        var stTarget = '';
        
        try{
            stTarget = request.getParameter('target');
        }catch(e){
            log('DEBUG', stLogTitle, "ERROR" + e);
        }
      
        log('DEBUG', stLogTitle, 'stTarget:' + JSON.stringify(stTarget));
        stTarget = isEmpty(stTarget)? "": stTarget.toLowerCase();
        log('DEBUG', stLogTitle, 'stTarget:' + stTarget);
        
        try{
            var func_readOnlyCheckBox = function(){
                var bjSubFLD = null
                bjSubFLD = form.getField(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);
                bjSubFLD.setDisplayType("inline");
            }
            
            var objFLD = null;
            objFLD = form.getField(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);
            
            if(stTarget.indexOf(FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(1);
            }
            if(stTarget.indexOf(FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(2);
            }
            if(stTarget.indexOf(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(3);
            }
            
            //create on RAD        
            if(stTarget.indexOf(FLD_REBATE_AGREEMENT_DETAIL_VEN_CLASS) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(1);
            }
            if(stTarget.indexOf(FLD_REBATE_AGREEMENT_DETAIL_CUST_CLASS) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(2);
            }
            if(stTarget.indexOf(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS) >= 0){
                func_readOnlyCheckBox();
                objFLD.setDefaultValue(3);
            }

        }catch(e){
    		log('DEBUG', stLogTitle, e);
        }

    }else if(type == 'edit'){
    	if(!isEmpty(form)){
        	var isAttached = isAttachedClassification(nlapiGetRecordId());
        	if(isAttached == true){
        		try{
                    var bjSubFLD = null
                    bjSubFLD = form.getField(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);
                    bjSubFLD.setDisplayType("inline");
        		}catch(e){
        			log('DEBUG', stLogTitle, e);
        		}
        	}
        }
    }
}

/**
 * Triggered once the submit button is click on the server side
 * this event will validate the duplicate classification on the server side
 * @param type
 */
function classification_BeforeSubmit(type){	
	var stLogTitle = "CLASSIFICATION_BEFORESUBMIT";
    var arrErrMessage = [];
    var bInactive     = nlapiGetFieldValue(HC_IS_INACTIVE);
    if(type == "create" || type == "edit" || type == "xedit" || type== "copy"){
        var stName = nlapiGetFieldValue('name');
        var intRecId = nlapiGetRecordId();
        var intClassType = nlapiGetFieldValue(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);

	    if(type == "xedit" && !isEmpty(intRecId)){
	    	objRec = nlapiLookupField(nlapiGetRecordType(), intRecId, ["name",FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE])	    	
	    	if(isEmpty(stName) && !isEmpty(objRec)){
	    		stName = objRec["name"];
	    	}
	    	
	    	if(isEmpty(intClassType) && !isEmpty(objRec)){
	    		intClassType = objRec[FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE];
	    	}
	    }
	    
	    //Validate
        if(type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Xedit){
        	var isAttached = isAttachedClassification(nlapiGetRecordId());
        	log('DEBUG', stLogTitle,"isAttached:" + isAttached);
    		//var oldRec = nlapiGetOldRecord();
    		var oldRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());

    		var stNameOld = oldRec.getFieldValue("name");
    		var intClassTypeOld = oldRec.getFieldValue(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE);
    		intClassTypeOld = isEmpty(intClassTypeOld)? "" : intClassTypeOld;

    		intClassType = isEmpty(intClassType)? "" : intClassType;
    		
        	if(isAttached == true){
        		log('DEBUG', stLogTitle,"intClassType:" + intClassType + " intClassTypeOld:" + intClassTypeOld);
        		if(intClassType != intClassTypeOld){
        			log('DEBUG', stLogTitle,"This Classification is already referenced to another record.");
        			arrErrMessage.push("This Classification is already referenced to another record.");
        		}
        	}
        }
      //Validate

        var arrFil = [];
        arrFil.push(new nlobjSearchFilter('name', null, 'is', stName));
        if(!isEmpty(intClassType)){
            arrFil.push(new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE, null, 'is', intClassType));
        }
        if(!isEmpty(intRecId)){
            arrFil.push(new nlobjSearchFilter('internalid', null, 'noneof', [intRecId]));
        }
        
        var arrRes = nlapiSearchRecord(REC_CUSTOMRECORD_NSTS_RM_GENERIC_CLASS, null, arrFil);
        
        if(!isEmpty(arrRes)){
            arrErrMessage.push('Duplicate Classification');
        }
                
        
    }
    

    if(type != HC_MODE_TYPE.Create){
        var stHasDependent    = classificationHasDependents({
            id      : nlapiGetRecordId(),
            inactive: bInactive,
            type    : type
        });
        
        if(!isEmpty(stHasDependent)){
            arrErrMessage.push(stHasDependent);   	
        }
    }
    
    if(arrErrMessage.length > 0)
        throw nlapiCreateError('9999', arrErrMessage.join('<br/><br/>'), true);
}


function isAttachedClassification(intClassId){
	var stLogTitle = "ISATTACHEDCLASSIFICATION";
	log('DEBUG', stLogTitle,"START ID:" + intClassId );
	
	var intHasAttached = 0;
	var objInActFil = new nlobjSearchFilter("isinactive",null,"is","F");
	var arrFil = [];
	var arrRes = null;
	
	try{
		arrFil = [objInActFil];
		arrFil.push(new nlobjSearchFilter(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION, null, 'anyof', [intClassId]));
		
		arrRes = nlapiSearchRecord('item', null, arrFil);
		log('DEBUG', stLogTitle,"item:" + arrRes);
		if(!isEmpty(arrRes)){
			intHasAttached++;
		}
		
		arrFil = [objInActFil];
		arrFil.push((new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION, null, 'anyof', [intClassId])).setLeftParens(1).setOr(true));
		arrFil.push((new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION, null, 'anyof', [intClassId])).setRightParens(1));

		arrRes = nlapiSearchRecord('entity', null, arrFil);
		log('DEBUG', stLogTitle,"entity:" + arrRes);
		if(!isEmpty(arrRes)){
			intHasAttached++;
		}
		
		log('DEBUG', stLogTitle,"intHasAttached:" + intHasAttached);
		if(intHasAttached>0){
			return true;
		}
	}catch(e){
		log('DEBUG', stLogTitle, e);
	}
	
	return false
}