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
 * 1.00       27 Apr 2015     pdeleon   Initial version.
 * 
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */

function scheduled_cgl_Reversal_Generation(type) {
    var stLogTitle = 'SCHEDULED_CGL_GENERATION';
    var context = nlapiGetContext();
    var arrCGLId = context.getSetting("script", 'custscript_nsts_rm_reversal_cgl_ids'); 
    var stUserId = context.getSetting("script", 'custscript_nsts_rm_reversal_cgl_user');
    var stCurCIL = context.getSetting("script", 'custscript_nsts_rm_current_reversal_cgl');
    var stDomainUrl = context.getSetting("script", 'custscript_nsts_rm_reversal_domain_url'); 
    
    var stNotifCompleteSubject = context.getSetting("script", 'custscript_nsts_rm_reversal_done_subject'); 
    var stNotifCompleteMsg = context.getSetting("script", 'custscript_nsts_rm_reversal_done_msg'); 
    
    log("debug", stLogTitle,"stCurCIL : " + stCurCIL + " stDomainUrl:" + stDomainUrl);
    var arrCGLField = [];
    var arrCGLValue = [];
    
    var stCurrentClaimDate = null;
    if(!isEmpty(stCurCIL)){
    	try{
    		doYield();
        	log("debug", stLogTitle,"Updating Originating CIL: " + stCurCIL);
            arrCGLField.push(FLD_CLAIM_GEN_STATUS);
            arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Reversal_In_Process);
            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, stCurCIL, arrCGLField, arrCGLValue);
    	}catch(e){
    		log("debug", stLogTitle + " ERROR", e);
    	}
    	
    	var objCurrentCGLLookup =  nlapiLookupField(REC_CLAIM_GENERATION_LOG,stCurCIL,["custrecord_nsts_cgl_claim_date"])
    	stCurrentClaimDate = objCurrentCGLLookup.custrecord_nsts_cgl_claim_date;
    	
    }
    
    log("debug", stLogTitle,"arrCGLId : " + arrCGLId);
    arrCGLId = parseStringToJson(arrCGLId, []);
    log("debug", stLogTitle,"arrCGLId#2 : " + arrCGLId);
    for (var index = 0; index < arrCGLId.length; index++) {
    	try{
    		doYield();
        	var objReversal = {};
        	var arrReversal = [];
            var intCGLId = arrCGLId[index];
            doYield();
            var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, intCGLId);
            var stMemo = "This is a generated reversal transaction for Claim ";
            
            var stLogs = [];
            var stRebateType        = recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
            var stRemittanceType    = recCGL.getFieldValue(FLD_CLAIM_GEN_REMIT_TYPE);
            var arrClaims			= recCGL.getFieldValues(FLD_CLAIM_GEN_CLAIM_TRANSACTION);
            var arrClaimsText		= recCGL.getFieldTexts(FLD_CLAIM_GEN_CLAIM_TRANSACTION);
            var stIsProcReversal	= recCGL.getFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL);
            var arrRevTnx			= recCGL.getFieldValues(FLD_CLAIM_GEN_GENERATE_REVERSAL_TNX);
            
            var stAccountClaimRefund	= recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_REFUND);
            
            if(stIsProcReversal != "T"){
            	log('DEBUG', stLogTitle + " SKIPING REVERSAL","intCGLId:" + intCGLId + " stIsProcReversal:" + stIsProcReversal);
            	continue;
            }
            
            if(!isEmpty(arrRevTnx)){
            	log('DEBUG', stLogTitle + " SKIPING REVERSAL","intCGLId:" + intCGLId + " stIsProcReversal:" + stIsProcReversal + " Reversal Transaction ALREADY EXIST");
            	continue;
            }
            
            
        	log('DEBUG', stLogTitle ,"PROCESSING REVERSAL");
            var objClaimConfig		= retrieveClaimConfig(stRebateType);
            
            
            var stClaimCredit		= HC_REBATE_TRAN_TYPE_NUM[objClaimConfig.creditTrans];
            var stClaimRefund		= HC_REBATE_TRAN_TYPE_NUM[objClaimConfig.refundTrans];
            
            var stClaimCreditReversal	= HC_REBATE_TRAN_TYPE_NUM[objClaimConfig.ReversalCredit];
            var stClaimRefundReversal	= HC_REBATE_TRAN_TYPE_NUM[objClaimConfig.ReversalRefund];
            var stClaimCreditReversalFrm	= objClaimConfig.ReversalCreditForm;
            var stClaimRefundReversalFrm	= objClaimConfig.ReversalRefundForm;
            
        	var stClaimRecType = null;
        	var stClaimReversalRecType = null;
        	var stClaimReversalRecForm = null;
        	if(stRemittanceType == HC_REMIT_TYPE.Credit){
        		stClaimRecType 			= stClaimCredit;
        		stClaimReversalRecType	= stClaimCreditReversal;
        		stClaimReversalRecForm	= stClaimCreditReversalFrm;
        	}else if(stRemittanceType == HC_REMIT_TYPE.Refund){
        		stClaimRecType 			= stClaimRefund;
        		stClaimReversalRecType 	= stClaimRefundReversal;
        		stClaimReversalRecForm 	= stClaimRefundReversalFrm;
        	}
        	
        	log('DEBUG', stLogTitle, "stClaimRecType:" + stClaimRecType + " stClaimReversalRecType:" + stClaimReversalRecType + " stClaimReversalRecForm:" + stClaimReversalRecForm)
        	
            var FUNC_VROP = function(intClaimTranId,stClaimTranText){
            	log('DEBUG', stLogTitle, "FUNC_VROP")
            	if(isEmpty(stClaimRecType) && isEmpty(stClaimReversalRecType)){
            		throw "Please Check the Claim Generation Config! Missing \"Claim Transaction type\" or \"Reversal Transaction type\" "
            	}
            	doYield();
            	var objClaimTran	= nlapiLoadRecord(stClaimRecType, intClaimTranId);
            	objClaimTran.setFieldValue("memo",stMemo + stClaimTranText);
            	objReversal		= transformRecord(objClaimTran, stClaimReversalRecType,stClaimReversalRecForm,recCGL,objClaimConfig,stCurrentClaimDate);
            	log('DEBUG', stLogTitle, "END FUNC_VROP:" + objReversal.nlobjRec.getId())
            	
            	return objReversal.nlobjRec.getId();
            }
            
            var FUNC_CR = function(intClaimTranId,stClaimTranText){
            	log('DEBUG', stLogTitle, "FUNC_CR")
            	if(isEmpty(stClaimRecType) && isEmpty(stClaimReversalRecType)){
            		throw "Please Check the Claim Generation Config! Missing \"Claim Transaction type\" or \"Reversal Transaction type\" "
            	}
            	doYield();
            	var objClaimTran	= nlapiLoadRecord(stClaimRecType, intClaimTranId);
            	objClaimTran.setFieldValue("memo",stMemo + stClaimTranText);
            	if(stClaimReversalRecType == "customerpayment"){
            		objClaimTran.setFieldValue("memo","RELATED REVERSAL TRANSACTION FOR: " + stClaimTranText);
                	objReversal		= transformRecord(objClaimTran, 'invoice',null,recCGL,objClaimConfig,stCurrentClaimDate);
                	var recInvoice	= objReversal.nlobjRec;
                	log('DEBUG', stLogTitle, "ID:" + objReversal.nlobjRec.getId() + " Type:" + objReversal.nlobjRec.getRecordType() + " TRansform type:" + stClaimReversalRecType)
                	objReversal.nlobjRec = nlapiTransformRecord(objReversal.nlobjRec.getRecordType(), objReversal.nlobjRec.getId(), stClaimReversalRecType);
                	                	
                	objReversal.nlobjRec.setFieldValue('account', stAccountClaimRefund);
                	objReversal.nlobjRec.setFieldValue('memo', stMemo +  stClaimTranText);
                	objReversal.nlobjRec.setFieldValue('class', recInvoice.getFieldValue('class'));
                	objReversal.nlobjRec.setFieldValue('department', recInvoice.getFieldValue('department'));
                	objReversal.nlobjRec.setFieldValue('location', recInvoice.getFieldValue('location'));
                	objReversal.nlobjRec.setFieldValue('trandate', recInvoice.getFieldValue('trandate'));
                	objReversal.nlobjRec.setFieldValue(FLD_CUSTBODY_NSTS_RM_CLAIM_REVERSAL_FOR, objClaimTran.getId());	
                	
                	
                	
                	objReversal.nlobjRec.setFieldValue('approvalstatus', 2);
                	objReversal.nlobjRec.setFieldValue('supervisorapproval', "T");
                	
                	var objReturnId = nlapiSubmitRecord(objReversal.nlobjRec, true,true);
                	objReversal.nlobjRec = nlapiLoadRecord(objReversal.nlobjRec.getRecordType(), objReversal.nlobjRec.getId());
            	}else {
                	objReversal		= transformRecord(objClaimTran, stClaimReversalRecType,stClaimReversalRecForm,recCGL,objClaimConfig,stCurrentClaimDate);	
            	}
               	log('DEBUG', stLogTitle, "END FUNC_CR:" + objReversal.nlobjRec.getId())
            	return objReversal.nlobjRec.getId();
 
            }
            
            var arrClaimsWithErr = null;
        	if(!isEmpty(arrClaims)){
        		for(var clm in arrClaims){
        			var intClaimTranId = arrClaims[clm];
        			var stClaimTranText = arrClaimsText[clm];
        			log('DEBUG', stLogTitle, "stRebateType:" + stRebateType + " intClaimTranId:" + intClaimTranId)
                    var intRevId = null;
        			
        			if(arrReversal.indexOf(intClaimTranId)<= -1 && !isEmpty(intClaimTranId)){
            			try{
                            if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase){
                            	intRevId = FUNC_VROP(intClaimTranId,stClaimTranText);
                            }else if(stRebateType == HC_REBATE_TYPE.Customer_Rebate){
                            	intRevId = FUNC_CR(intClaimTranId,stClaimTranText);
                            }
                            
                        	if(!isEmpty(intRevId)){
                            	arrReversal.push(intRevId);
                        	}
                        }catch(e){
                        	log('DEBUG', stLogTitle, e)
                            stLogs.push(e.toString());
                        	if(isEmpty(arrClaimsWithErr)){
                        		arrClaimsWithErr = {};
                        	}
                        	arrClaimsWithErr[intClaimTranId] = {
                        			Claims: stClaimTranText,
                        			error: e
                        	}; 
                        }
        			}
        		}
        		
        		log('DEBUG', stLogTitle,"arrClaims:" + JSON.stringify(arrClaims))
                removedClaimsInRTD(arrClaims);
        	}

        	log('DEBUG', stLogTitle,"arrReversal:" + JSON.stringify(arrReversal));
            arrCGLField = [];
            arrCGLValue = [];
            if(!isEmpty(stLogs) || isEmpty(arrReversal)){
                arrCGLField.push(FLD_CLAIM_GEN_ERR_CODE);
                arrCGLField.push(FLD_CLAIM_GEN_GENERATE_REVERSAL);
                arrCGLField.push(FLD_CLAIM_GEN_STATUS);	
                arrCGLField.push(FLD_CLAIM_GEN_BYPASS_CLAIM);
                
                if(isEmpty(arrReversal)){
                	stLogs.push("ERROR: NO REVERSAL HAS BEEN CREATED");
                }
                
                arrCGLValue.push(stLogs.join("|"));
                arrCGLValue.push("F");
                arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Reversal_Error);
                arrCGLValue.push("F");
                nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
                
            }else if (!isEmpty(arrReversal)){
                recCGL.setFieldValue(FLD_CLAIM_GEN_ERR_CODE, stLogs.join("|"));
                recCGL.setFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL, "F");
                recCGL.setFieldValue(FLD_CLAIM_GEN_STATUS, HC_CLAIM_GEN_LOG_STATUS.Reversal_Completed);
                recCGL.setFieldValues(FLD_CLAIM_GEN_GENERATE_REVERSAL_TNX, arrReversal);
                
                nlapiSubmitRecord(recCGL,false,true);
                
                try{
                    var records = {};
                    records['record'] = intCGLId;
                    records['recordtype'] = REC_CLAIM_GENERATION_LOG;

                    var stcglsuburl = nlapiResolveURL("RECORD", REC_CLAIM_GENERATION_LOG, recCGL.getId(), "VIEW");
                    var stcglurl = stDomainUrl + stcglsuburl;
                    var stSubject = "Reversal transaction's has been created";
                    var stMsg =  'The Claim Reversal has been completed.<bt/>Click here to view <a href="${clg.url}">${cgl.name}</a>';
                    
                    stSubject = isEmpty(stNotifCompleteSubject)? stSubject : stNotifCompleteSubject;
                    stMsg = isEmpty(stNotifCompleteMsg)? stMsg : stNotifCompleteMsg;
                                        
                    var renderer = nlapiCreateTemplateRenderer();
                    renderer.setTemplate(stMsg);
                    recCGL.setFieldValue("url", stcglurl);
                    renderer.addRecord("cgl", recCGL);
                    stMsg = renderer.renderToString();
                    
                    vrenderer = nlapiCreateTemplateRenderer();
                    renderer.setTemplate(stSubject);
                    recCGL.setFieldValue("url", stcglurl);
                    renderer.addRecord("cgl", recCGL);
                    stSubject = renderer.renderToString();
                    
                    var deentitize = function(str) {
                    	var ret = str;
                        ret = ret.replace(/&gt;/g, '>');
                        ret = ret.replace(/&lt;/g, '<');
                        ret = ret.replace(/&quot;/g, '"');
                        ret = ret.replace(/&apos;/g, "'");
                        ret = ret.replace(/&amp;/g, '&');
                        return ret;
                    };
                    stSubject = deentitize(stSubject);
                    stMsg = deentitize(stMsg);
                   
                    nlapiSendEmail(stUserId, stUserId, stSubject,stMsg, null, null, records);
                }catch(e){
                	log("DEBUG", stLogTitle,"ERROR IN SENDING EMAIL:" + e);
                }
            }
            
            if(!isEmpty(arrClaimsWithErr)){
                var records = {};
                records['record'] = intCGLId;
                records['recordtype'] = REC_CLAIM_GENERATION_LOG;
                nlapiSendEmail(stUserId, stUserId, "ERROR ENCOUNTERED: Some of the Claim is not Reversed", "Some of the Claim is not Reversed\nDetails:\n" + JSON.stringify(arrClaimsWithErr), null, null, records);
            }
    	}catch(e){
    		log("DEBUG", stLogTitle,"ERROR: " + e);
    	}
    }
    
    try{
        arrCGLField = [];
        arrCGLValue = [];
        if(!isEmpty(stCurCIL)){
            arrCGLField.push(FLD_CLAIM_GEN_STATUS);
            arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Initiated);
            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, stCurCIL, arrCGLField, arrCGLValue);
        }
    }catch(e){
    	log("DEBUG", stLogTitle + " UPDATING ORIGINATING CGL:" + stCurCIL,"ERROR: " + e);
    }

}

function removedClaimsInRTD(arrClaims){
	var stLogTitle = "REMOVEDCLAIMSINRTD";
	if(!isEmpty(arrClaims)){
		var arrFils = [new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_REBATE_CLAIM, null, 'anyof', arrClaims)];
		var objSearchRTD = getAllResults(null, 'customsearch_nsts_rm_get_prev_clmd_rtd',arrFils);
		
		var intLen = objSearchRTD.length;
		var arrRes = objSearchRTD.results;
		log("DEBUG", stLogTitle,"intLen:" + intLen);
	    for (var i = 0; i < intLen; i++) {
	    	try{
	    		doYield();
		        var intRTDId = arrRes[i].getId();
		        log("DEBUG", stLogTitle,"intRTDId:" + intRTDId);
		        nlapiSubmitField(REC_REBATE_TRAN_DETAIL, intRTDId, [FLD_CUSTRECORD_NSTS_REBATE_CLAIM], [""]);
	    	}catch(e){
	        	log("DEBUG", stLogTitle,"ERROR IN REMOVING CLAIMNS TRDID:" + intRTDId + "ERROR: " + e);
	    	}
	    }
	}

	log("DEBUG", stLogTitle,"END REMOVEDCLAIMSINRTD");
}


function transformRecord(nlobjRec,newRecType,reversalForm,recCGL,objClaimConfig,currentClaimDate,noNLTransform){
	var stLogTitle = "TRANSFORMRECORD";
	var objReturn = null;
	var objReturnId = null;
	var stCGLDate = currentClaimDate; //recCGL.getFieldValue(FLD_CLAIM_GEN_DATE);
	
	var errError = [];
	if (noNLTransform == true){
		noNLTransform = false;
	}
	
	var func_bruteForceTransform = function(){
		var arrExcludeFields = ['name','id','recordid','type','rectype','customwhence','ownerid','customform',
		                        'externalid','isinactive','nsapiFC','_eml_nkey_','nsapiVF','nsapiVD','nsapiVL','nsapiVI','wfPS','ownerid',
		                        'version','_multibtnstate_','wfPI','selectedtab','nsapiPS','nluser','nsapiPI','wfSR','nsapiPD','nlloc',
		                        'nlsub','wfVF','nsapiRC','scriptid','wfinstances','nsapiLI','nsapiCT','nldept','nsapiLC','nsapiSR',
		                        'templatestored','whence','nlrole','baserecordtype','submitnext_y','submitnext_t','wfFC',"promotions"];
		
		var arrTransactionComonFields = ["entity","subsidiary", "currency", "email",
				"partner", "class", "location","department","shandlingaccount", "trandate",
				"memo", , , "tranid", "account"];
		

		var arrTransactionCommonLineFields = [ "item", "account", "quantity","description", "units",
				,"class", "location","department","rate","amount"]

		var arrExcludeList = ["workflowhistory","systemnotes",
		                      "activeworkflows","output","calls","activities","usernotes","messages","links","contacts","tasks","events"]
		var arrIncludeList = ["item","expense","apply"]
		
		var arrFlds = nlobjRec.getAllFields();
		var arrSublist  = ["item","expense","apply"];//nlobjRec.getAllLineItems();
		
	    var onjIniVals = {};
	    onjIniVals["recordmode"] = 'dynamic';
	    doYield();
		var objNewRec =  nlapiCreateRecord(newRecType,onjIniVals);
		
		if(!isEmpty(reversalForm)){
			objNewRec.setFieldValue('customform', reversalForm)
		}

		for (var ind in arrFlds){
			var stFldName = arrFlds[ind]
			if(stFldName.indexOf("custbody") >= 0){
				arrTransactionComonFields.push(stFldName)
			}
		}

		var ST_DEFAULT_LOCATION,ST_DEFAULT_CLASS,ST_DEFAULT_DEPARTMENT
	    if(!isEmpty(recCGL)){
	        ST_DEFAULT_LOCATION = recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_LOC);
	        ST_DEFAULT_CLASS = recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_CLASS);
	        ST_DEFAULT_DEPARTMENT = recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_DEPT);
	    }

		
		log('DEBUG', stLogTitle,"Copyimg Fields Value reversalForm:" + reversalForm);
		for (var ind in arrTransactionComonFields){
			var stFldName = arrTransactionComonFields[ind]
			//var bDoSet = arrTransactionComonFields.indexOf(stFldName);
			
			var objFldVal = nlobjRec.getFieldValue(stFldName)
			if(nlobjRec.getRecordType() == "customerrefund" && stFldName == "entity"){
				objFldVal  = nlobjRec.getFieldValue('customer');
			}else if(nlobjRec.getRecordType() == "customerrefund"){ //&& stFldName == "account"
				objFldVal = "";
			}
			

			log('DEBUG', stLogTitle,"BDOSET: " + bDoSet +" STFLDNAME:" + stFldName + " OBJFLDVAL:" + objFldVal);
			if(!isEmpty(objFldVal)){
				
				objNewRec.setFieldValue(stFldName, objFldVal);
	
			}else {
				if(stFldName == "class"){
					objNewRec.setFieldValue(stFldName, ST_DEFAULT_CLASS);
				}else if(stFldName == "department"){
					objNewRec.setFieldValue(stFldName, ST_DEFAULT_DEPARTMENT);
				}else if(stFldName == "location"){
					objNewRec.setFieldValue(stFldName, ST_DEFAULT_LOCATION);
				}
				
			}
		}
		
		objNewRec.setFieldValue(FLD_CUSTBODY_NSTS_RM_CLAIM_REVERSAL_FOR, nlobjRec.getId());		
		objNewRec.setFieldValue('approvalstatus', 2);
		objNewRec.setFieldValue('supervisorapproval', "T");
		if(!isEmpty(stCGLDate)){
			objNewRec.setFieldValue('trandate', stCGLDate); 
		}


		
		if(objClaimConfig.approveInvoice == true){
			objNewRec.setFieldValue('approvalstatus', 2);
			objNewRec.setFieldValue('supervisorapproval', "T");
		}
		
		log('DEBUG', stLogTitle,"Copyimg Sublist Value");
		for (var ind in arrSublist){
			var stsListName = arrSublist[ind]
			var bDoSet = arrIncludeList.indexOf(stsListName);
			log('DEBUG', stLogTitle,"STSLISTNAME:" + stsListName);
			if(bDoSet>=0){
				var intSListLen = nlobjRec.getLineItemCount(stsListName);
				//var arrLineFld = nlobjRec.getAllLineItemFields(stsListName);
				log('DEBUG', stLogTitle,"INTSLISTLEN:" + intSListLen);
								
				if(stsListName == "apply"){
					
				}else{
					
					log('DEBUG', stLogTitle,"Copying Sublist Field Val");
					for(var iSList = 1; iSList <= intSListLen; iSList++){
						
						objNewRec.selectNewLineItem(stsListName);
						log('DEBUG', stLogTitle,"Selected New Line");
						for ( var indSList in arrTransactionCommonLineFields) {
							var stSlstFldName = arrTransactionCommonLineFields[indSList];
							var stSlstFldVal = nlobjRec.getLineItemValue(stsListName, stSlstFldName, iSList);
							log('DEBUG', stLogTitle,"STSLSTFLDNAME:" + stSlstFldName + " STSLSTFLDVAL:" + stSlstFldVal);
							if (!isEmpty(stSlstFldVal)) {
								objNewRec.setCurrentLineItemValue(stsListName, stSlstFldName, stSlstFldVal);
							}else{
								if(stSlstFldName == "class"){
									objNewRec.setCurrentLineItemValue(stsListName, stSlstFldName, ST_DEFAULT_CLASS);
								}else if(stSlstFldName == "department"){
									objNewRec.setCurrentLineItemValue(stsListName, stSlstFldName, ST_DEFAULT_DEPARTMENT);
								}else if(stSlstFldName == "location"){
									objNewRec.setCurrentLineItemValue(stsListName, stSlstFldName, ST_DEFAULT_LOCATION);
								}
							}
							
						}
						objNewRec.commitLineItem(stsListName);
						log('DEBUG', stLogTitle,"commitLineItem:" + stsListName );
					}
				}
			}
		}
		
		doYield();
		return objNewRec
	}
	
	var fnc_forceTransform = function(){
		try{
			log('DEBUG', stLogTitle, "Brute Force Transforming Record ID:" + nlobjRec.getId() +", " + nlobjRec.getRecordType() + " TO " + newRecType );			
			objReturn = func_bruteForceTransform();
			log('DEBUG', stLogTitle,"Submiting Brute Force record! " + nlobjRec.getRecordType());
			
			
			if(nlobjRec.getRecordType() == "customerrefund"){
				if(isEmpty(recCGL)){
					throw "CGI Not Found!"
				}
				
				//nlobjRec = nlapiLoadRecord("invoice", id, initializeValues);
				
				var intSListLen = nlobjRec.getLineItemCount('apply');
				for(var iSList = 1; iSList <= intSListLen; iSList++){
					var intInvId = nlobjRec.getLineItemValue('apply', 'internalid', iSList);
					var bApplied = nlobjRec.getLineItemValue('apply', 'apply', iSList);
					log('DEBUG', stLogTitle,"FORCE CRETE INVOICE intInvId:" + intInvId + " bApplied:" + bApplied);
					
					if(bApplied == "T" && !isEmpty(intInvId)){
						doYield();
						var objRecInc = nlapiLoadRecord("creditmemo", intInvId);
						objRecInc.setFieldValue("memo", nlobjRec.getFieldValue("memo"));
						objClaimConfig["approveInvoice"] = true
						var objTrans = transformRecord(objRecInc, "invoice", reversalForm, recCGL,objClaimConfig,currentClaimDate,true);
						objReturn = objTrans.nlobjRec;
						log('DEBUG', stLogTitle + " GENERATING INVOICE FOR PAYMENT","FORCE CRETE INVOICE SUBMIT ID:" + objReturn.getId() + " TYPE:" + objReturn.getRecordType());
					}

				}
				
				var stClaimCreditReversalFrm	= objClaimConfig.ReversalCreditForm;
				if(!isEmpty(stClaimCreditReversalFrm)){
					objReturn.setFieldValue('customform', stClaimCreditReversalFrm)
				}

			}
			
			objReturnId = nlapiSubmitRecord(objReturn, false, true)
			objReturn = nlapiLoadRecord(newRecType, objReturnId);
			log('DEBUG', stLogTitle, "Transforming Record NEW_TRANSFORM_ID:" + objReturnId +", " + nlobjRec.getRecordType() + " TO " + objReturn.getRecordType());

		}catch(e2){
			errError.push("ERROR Brute Force Transforming: " + e2.toString());
			objReturnId = null;
			objReturn = null;
			
		}
	}
	
	try{
		if(noNLTransform == false){
			doYield();
			log('DEBUG', stLogTitle, "Transforming Record ID:" + nlobjRec.getId() +", " + nlobjRec.getRecordType() + " TO " + newRecType );
			objReturn = nlapiTransformRecord(nlobjRec.getRecordType(), nlobjRec.getId(),newRecType);
			objReturnId = nlapiSubmitRecord(objReturn, false,true);
			objReturn = nlapiLoadRecord(newRecType, objReturnId);
			log('DEBUG', stLogTitle, "Transforming Record NEW_TRANSFORM_ID:" + objReturnId +", " + nlobjRec.getRecordType() + " TO " + objReturn.getRecordType() );

		}else{
			fnc_forceTransform()
		}

	}catch(e){
		errError.push(e.toString());
		fnc_forceTransform();
	}
	
	
	if ( isEmpty(objReturn) && isEmpty(objReturnId) && !isEmpty(errError)) {
		log('DEBUG', stLogTitle,errError.join(","));
		throw errError.join(",");
	}
	
	return {
		nlobjRec: objReturn,
		errors: errError.join(",")
	}
}

