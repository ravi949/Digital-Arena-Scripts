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
 * 1.00       27 Apr 2015     dgeronimo   Initial version.
 * 
 */


var HC_OBJ_FEATURE = new objFeature();

function accruals_reversal(type) {
    var stLogTitle = 'ACCRUALS_REVERSAL';
    var context = nlapiGetContext();
    var arrCGL = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_CGL); 
    var stUserId = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_USER); 
	log('DEBUG', stLogTitle, "arrCGL:" + arrCGL);
    arrCGL = parseStringToJson(arrCGL, []);
    
    
    for(var icgl = 0; icgl < arrCGL.length; icgl++){
    	var intCGLId = arrCGL[icgl];
    	log('DEBUG', stLogTitle, "intCGLId:" + intCGLId);
    	var objProc = processReversal(intCGLId,stUserId);
    }
}

function processReversal(cglId,user){
	var stLogTitle = "PROCESSREVERSAL";
	var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, cglId);
	
	var stRa 				= recCGL.getFieldValue(FLD_ACCRUAL_RA);
	var stRaTxt 				= recCGL.getFieldText(FLD_ACCRUAL_RA);
	var stClainSearchDetail	= recCGL.getFieldValue(FLD_CLAIM_GEN_DETAIL_SEARCH);
	var arrClaims 			= recCGL.getFieldValues(FLD_CLAIM_GEN_CLAIM_TRANSACTION);
	
    var bPostByDept 		= recCGL.getFieldValue(FLD_CLAIM_GEN_POST_BY_DEPT);
    var bPostByClass 		= recCGL.getFieldValue(FLD_CLAIM_GEN_POST_BY_CLASS);
    var bPostByLocation 	= recCGL.getFieldValue(FLD_CLAIM_GEN_POST_BY_LOC);
    
	var stPostByDefaultDepartment	= recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_DEPT);
	var stPostByDefalultClass 		= recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_CLASS);
	var stPostByDefaultLocation 	= recCGL.getFieldValue(FLD_CLAIM_GEN_CLAIM_DEFAULT_LOC);
		
    var stCGLStartDate             = nlapiStringToDate(recCGL.getFieldValue(FLD_CLAIM_GEN_TRANSACTION_START_DATE));
    var stCGLEndDate             = nlapiStringToDate(recCGL.getFieldValue(FLD_CLAIM_GEN_TRANSACTION_END_DATE));
	
    var stClaimDate             = nlapiStringToDate(recCGL.getFieldValue(FLD_CLAIM_GEN_DATE));
	var intRebateType 			= recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
    
	var objsearch = nlapiLoadSearch(null, stClainSearchDetail);
	var arrOldFil = objsearch.getFilters();
	

	var arrNewFil = [];
	var arrNewCol = [];
	
	for(var i = 0; i < arrOldFil.length; i++){
		var objFil = arrOldFil[i];
		var stFilName = objFil.getName();
		
		if(stFilName == FLD_CUSTRECORD_NSTS_REBATE_CLAIM && !isEmpty(arrClaims)){
			objFil = new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_REBATE_CLAIM, null, 'anyof', arrClaims );
		}
		if(!isEmpty(objFil)){
			arrNewFil.push(objFil);
		}
	}
	
	arrNewFil.push(new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_RECORD, null, 'noneof', ["@NONE@"]));
	//search.createFilter({name: 'formulatext', operator: 'isnot', formula: 'NVL({custbody_nsts_vp_prepay_vp}, 0)', values: 0}
	//var objFilArrcuTnx = new nlobjSearchFilter(FLD_ACCRUAL_TRANSACTION, FLD_CUSTRECORD_ACCRUAL_RECORD, 'noneof', ["@NONE@"])
	var objFilArrcuTnx = new nlobjSearchFilter('formulatext',null , 'isnot', 0)
	objFilArrcuTnx.setFormula('NVL({custrecord_nsts_rm_rtd_accrual_rec.custrecord_nsts_rm_accru_transaction}, 0)')
	arrNewFil.push(objFilArrcuTnx);
	
	arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_REBATE_TYPE, null, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_CUSTOMER, null, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_VENDOR, null, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_CUSTRECORD_ACCRUAL_AMO, null, HC_SEARCH_SUMMARY_TYPE.sum)); 
	
	arrNewCol.push(new nlobjSearchColumn(FLD_CUSTRECORD_ACCRUAL_RECORD, null, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_TRAN_START_DATE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_TRAN_END_DATE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_EXPENSE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_RECEIVABLE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_PAYABLE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
		
    arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DEPARTMENT, FLD_CUSTRECORD_NSTS_RM_REBATETRAN, HC_SEARCH_SUMMARY_TYPE.group));
    arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_CLASS, FLD_CUSTRECORD_NSTS_RM_REBATETRAN, HC_SEARCH_SUMMARY_TYPE.group));
    arrNewCol.push(new nlobjSearchColumn(FLD_REBATE_TRAN_LOCATION, FLD_CUSTRECORD_NSTS_RM_REBATETRAN, HC_SEARCH_SUMMARY_TYPE.group));
    
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_DEPARTMENT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_CLASS, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_LOCATION, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_DEFAULT_DEPARTMENT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_DEFAULT_CLASS, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_POST_BY_DEFAULT_LOCATION, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 

	if(HC_OBJ_FEATURE.blnOneWorld)
		arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_SUBSIDIARY, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	
	if(HC_OBJ_FEATURE.bMultiCurrency)
		arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_CURRENCY, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group));
	
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_DATE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group)); 
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_PERIOD, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group));
	arrNewCol.push(new nlobjSearchColumn(FLD_ACCRUAL_AMOUNT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group));

	//objsearch = nlapiCreateSearch(REC_TRANSACTION_DETAIL, arrNewFil, arrNewCol)
    objsearch.setFilters(arrNewFil);
    objsearch.setColumns(arrNewCol);
    
    var objSrchRes = getAllResultsSearchObject(objsearch);
    var arrRes = objSrchRes.results;

    //Group the obj1stNormalFormToJE by Accrual
	var obj1stNormalFormToJE = {};
	for(var ii = 0; ii < arrRes.length; ii++){
		var rec = arrRes[ii];
		var objRtd = new rtdComponent(rec);
		if(isEmpty(obj1stNormalFormToJE[objRtd.accrual])){
			obj1stNormalFormToJE[objRtd.accrual] = {}
		}
		var stPostByKey = ["POSTBYKEY"];
		
		
		if(intRebateType ==  HC_REB_TYPE.CustReb){
			if(!isEmpty(objRtd.customer)){
				stPostByKey.push("CUSTOMER");
				stPostByKey.push(objRtd.customer);	
			}
		}

		stPostByKey.push("ACCRUAL");
		if(!isEmpty(objRtd.accrual)){
			stPostByKey.push(objRtd.accrual);	
		}
		
		if(objRtd.postByDepartment == "T" || objRtd.postByDepartment == true){
			stPostByKey.push("DEPARTMENT");
			if(!isEmpty(objRtd.department)){
				stPostByKey.push(objRtd.department);
			}
		}
		if(objRtd.postByClass == "T" || objRtd.postByClass == true){
			stPostByKey.push("CLASS");
			if(!isEmpty(objRtd.class)){
				stPostByKey.push(objRtd.class);
			}
			
		}
		if(objRtd.postByLocation == "T" || objRtd.postByLocation == true){
			stPostByKey.push("LOCATION");
			if(!isEmpty(objRtd.location)){
				stPostByKey.push(objRtd.location);	
			}
		}


		stPostByKey = stPostByKey.join("_");

		if(isEmpty(obj1stNormalFormToJE[objRtd.accrual][stPostByKey])){
			obj1stNormalFormToJE[objRtd.accrual][stPostByKey] = parseStringToJson(parseJsonToString(objRtd, {}), {});
			obj1stNormalFormToJE[objRtd.accrual][stPostByKey].accrualAmount = 0;
			
		}
		//Summary the Accrual Amount
		obj1stNormalFormToJE[objRtd.accrual][stPostByKey].accrualAmount += objRtd.accrualAmount;
	}
		
	for (var keyAccrual in obj1stNormalFormToJE){
		var arrGroupToArray = [];
		for (var keyGroupings in obj1stNormalFormToJE[keyAccrual]){
			arrGroupToArray.push(obj1stNormalFormToJE[keyAccrual][keyGroupings]);
		}
		
		//convert the object obj1stNormalFormToJE[keyAccrual] to array list
		obj1stNormalFormToJE[keyAccrual] = arrGroupToArray
	}

	
	//check if the array list per accrual is more than 500 
	var intMaxItem = 500;
	for (var keyAccrual in obj1stNormalFormToJE){
		//parseStringToJson(parseJsonToString(arrBuf, {}), {}); this will create an Identical Value without any memory referencing
		var arrBuf = obj1stNormalFormToJE[keyAccrual];
		//arrBuf = parseStringToJson(parseJsonToString(arrBuf, []), []);

		if(isEmpty(arrBuf)){
			continue;
		}
		
		var arrChuck = chuckArray(arrBuf,intMaxItem);

		var stStartDate = null;
		var stEndDate = null;
		if(!isEmpty(arrBuf)){
			stStartDate = arrBuf[0].accrualStartDate;
			stEndDate = arrBuf[0].accrualEndDate;
		}
		
		
		obj1stNormalFormToJE[keyAccrual] = {
			ra: stRa,
			rtdList: {},
			accrualStartDate: stStartDate,
			accrualEndDate: stEndDate,
			accrualAmount: 0,
			accrualRecAmount: arrBuf[0].accrualRecAmount 
		};
		
		log('DEBUG',stLogTitle, "keyAccrual:" + keyAccrual);
		for(var ii = 0; ii < arrChuck.length; ii++){
			obj1stNormalFormToJE[keyAccrual].rtdList[keyAccrual + "_" + ii] = arrChuck[ii]
			
	
			for(var ii2 = 0; ii2 < arrChuck[ii].length; ii2++ ){
				log('DEBUG',stLogTitle, " accrualAmount " + obj1stNormalFormToJE[keyAccrual].accrualAmount );
				log('DEBUG',stLogTitle, " arrChuck[ii].accrualAmount " + arrChuck[ii][ii2].accrualAmount );
				obj1stNormalFormToJE[keyAccrual].accrualAmount += arrChuck[ii][ii2].accrualAmount;
			}
			
		}
	}
    
	
	var arrReversedJE = [];
	var arrErrorLog = [];
   	for (var keyAccrual in obj1stNormalFormToJE){
		var objToJe 			= obj1stNormalFormToJE[keyAccrual].rtdList;
		var dtAccruStartDate	= nlapiStringToDate(obj1stNormalFormToJE[keyAccrual].accrualStartDate);
		var dtAccruEndDate		= nlapiStringToDate(obj1stNormalFormToJE[keyAccrual].accrualEndDate);
		var flaccrualAmount		= obj1stNormalFormToJE[keyAccrual].accrualAmount;
		var flaccrualAmountOnRec	= obj1stNormalFormToJE[keyAccrual].accrualRecAmount;
		
		flaccrualAmount = toFixed(flaccrualAmount, 2)
		flaccrualAmountOnRec = toFixed(flaccrualAmountOnRec, 2)
		
		var recAccru = nlapiLoadRecord(REC_ACCRUAL, keyAccrual);
		var arrAccruJe = recAccru.getFieldValues(FLD_ACCRUAL_TRANSACTION);
		var arrAccruJeRev = recAccru.getFieldValues(FLD_ACCRUAL_REVERSAL_TRAMSACTION);
		var arrCGLPrevOnAccrual = recAccru.getFieldValues(FLD_ACCRUAL_CGL);
		var arrCGLPrev = [cglId];
		
		if(!isEmpty(arrCGLPrevOnAccrual)){
			arrCGLPrev = arrCGLPrev.concat(arrCGLPrevOnAccrual);
		}

		if(!isEmpty(arrAccruJeRev)){
			arrReversedJE = arrReversedJE.concat(arrAccruJeRev);
		}

		var arrReversalPerJE = [];
		try{

			//if((dtAccruStartDate >= stCGLStartDate && dtAccruEndDate <= stCGLEndDate) || flaccrualAmountOnRec == flaccrualAmount){
			if(flaccrualAmountOnRec == flaccrualAmount){
				log('debug', stLogTitle,"arrAccruJe: " + JSON.stringify(arrAccruJe));

				if(!isEmpty(arrAccruJe) && isEmpty(arrAccruJeRev)){
					for(var iJe = 0; iJe < arrAccruJe.length; iJe ++){
						doYield();
						//var stMemo = [ "[REBATE MANAGEMENT]: this is an auto-generated reversal JE for Accrual #" + keyAccrual];
						//stMemo.push(" | This is fully reversed. To check the reversal please refer to field 'REVERSAL #'.")
						//stMemo.push(" | Claim #: " + cglId)
						//stMemo.push(" | Accrual Inclusive Dates: " + recAccru.getFieldValue(FLD_ACCRUAL_TRAN_START_DATE) + " - " + recAccru.getFieldValue(FLD_ACCRUAL_TRAN_END_DATE))
						var stMemo = "[REBATE MANAGEMENT]: This is an auto-generated JE. This is fully/partially reversed. Please check Accrual # "+keyAccrual+" for the reversal/related JEs.";
						
						//var intJeId = nlapiSubmitField('journalentry', arrAccruJe[iJe], ['reversaldate','reversaldefer',FLD_CUSTBODY_NSTS_RM_CGL,'memo'], [stClaimDate,'T',arrCGLPrev,stMemo.join("\n")]);
						//var intJeId = nlapiSubmitField('journalentry', arrAccruJe[iJe], ['reversaldate','reversaldefer',FLD_CUSTBODY_NSTS_RM_CGL,'memo'], [stClaimDate,'F',arrCGLPrev,stMemo.join("\n")]);
						var intJeId = nlapiSubmitField('journalentry', arrAccruJe[iJe], ['reversaldate','reversaldefer',FLD_CUSTBODY_NSTS_RM_CGL,'memo'], [stClaimDate,'F',arrCGLPrev,stMemo]);
						arrReversedJE.push(intJeId);
						arrReversalPerJE.push(intJeId);
						log('debug', stLogTitle,"Fully Reversed JE ID:" + intJeId);
					}
				}else{
					log('debug', stLogTitle,"Reversal with lessthan Accrual Amount!");
					if(!isEmpty(arrAccruJe)){
						for(var iJe = 0; iJe < arrAccruJe.length; iJe ++){
							doYield();
							nlapiSubmitField('journalentry', arrAccruJe[iJe], [FLD_CUSTBODY_NSTS_RM_CGL], [arrCGLPrev]);
						}
					}
					
					var objPartialJERec = processPartialJeReversal(objToJe,recCGL,recAccru);
					log('debug', stLogTitle,"objPartialJERec" + JSON.stringify(objPartialJERec));
					if(!isEmpty(objPartialJERec.arrReversedJE)){
						log('debug', stLogTitle,"objPartialJERec.arrReversedJE:" + JSON.stringify(objPartialJERec.arrReversedJE));
						arrReversedJE = arrReversedJE.concat(objPartialJERec.arrReversedJE);
						arrReversalPerJE = objPartialJERec.arrReversedJE;
						
						if(!isEmpty(arrReversalPerJE)){
							arrReversalPerJE = arrReversalPerJE.concat(arrAccruJeRev);
						}
						log('debug', stLogTitle, JSON.stringify(arrReversedJE))
					}
				}
			}else{
				//update the actual JE with the CGL info
				//if(!isEmpty(arrAccruJe) && isEmpty(arrAccruJeRev)){
				if(!isEmpty(arrAccruJe)){
					for(var iJe = 0; iJe < arrAccruJe.length; iJe ++){
						doYield();
						nlapiSubmitField('journalentry', arrAccruJe[iJe], [FLD_CUSTBODY_NSTS_RM_CGL], [arrCGLPrev]);
					}
				}
				//update the actual JE 
				log('debug', stLogTitle,"Partial Reversal PROCESSPARTIALJEREVERSAL");
				var objPartialJERec = processPartialJeReversal(objToJe,recCGL,recAccru);
				log('debug', stLogTitle,"objPartialJERec " + JSON.stringify(objPartialJERec));
				if(!isEmpty(objPartialJERec.arrReversedJE)){
					log('debug', stLogTitle,"objPartialJERec.arrReversedJE:" + JSON.stringify(objPartialJERec.arrReversedJE));
					arrReversedJE = arrReversedJE.concat(objPartialJERec.arrReversedJE);
					arrReversalPerJE = objPartialJERec.arrReversedJE;
					
					if(!isEmpty(arrReversalPerJE)){
						arrReversalPerJE = arrReversalPerJE.concat(arrAccruJeRev);
					}
					log('debug', stLogTitle, JSON.stringify(arrReversedJE))
				}
			}
		}catch(e){
			try{
	            var records = {};
	            records['record'] = cglId;
	            records['recordtype'] = REC_CLAIM_GENERATION_LOG;
	            var stcglsuburl = nlapiResolveURL("RECORD", REC_CLAIM_GENERATION_LOG, cglId, "VIEW");
	            var stErrorSubject = "ERROR: In Generating Accrual Reversal"
	            var stErrorBody = e.toString() + '<br/><br/>Please Check this <a href="' + stcglsuburl +'">CGL #'+ cglId + ' </a>';
				nlapiSendEmail(user, user, stErrorSubject ,stErrorBody, null, null, records);
				log('DEBUG',"#1.1 ERROR IN EMAIL SENDING", e);
				recCGL.setFieldValue(REC_CLAIM_GENERATION_LOG, e.toString());
				recCGL.setFieldValue(FLD_CLAIM_GEN_STATUS, HC_CLAIM_GEN_LOG_STATUS.Reversal_Error);
				recCGL.setFieldValue(FLD_CLAIM_GEN_BYPASS_CLAIM, 'F');
			}catch(e2){
				log('DEBUG',"#1 ERROR IN EMAIL SENDING", e2);
			}

		}
		
		arrReversalPerJE = arrReversalPerJE.filter(function(ele){
			return !isEmpty(ele);
		});
		
		if(!isEmpty(arrReversalPerJE)){
			recAccru.setFieldValues(FLD_ACCRUAL_REVERSAL_TRAMSACTION, arrReversalPerJE);
			recAccru.setFieldValues(FLD_ACCRUAL_CGL, arrCGLPrev);
			nlapiSubmitRecord(recAccru);
		}else{
			recAccru.setFieldValues(FLD_ACCRUAL_CGL, arrCGLPrev);
			nlapiSubmitRecord(recAccru);
		}


	}
	
	
	recCGL.setFieldValues(FLD_CLAIM_GEN_ACCRUAL_REVERSAL_TRANSACTION, arrReversedJE);
	recCGL.setFieldValue(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL, 'F');
	
	if(recCGL.getFieldValue(FLD_CLAIM_GEN_STATUS) != HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual_Error){
		recCGL.setFieldValue(FLD_CLAIM_GEN_STATUS, HC_CLAIM_GEN_LOG_STATUS.Completed);
		
		try{
			if(!isEmpty(arrReversedJE)){
			      var records = {};
			        records['record'] = cglId;
			        records['recordtype'] = REC_CLAIM_GENERATION_LOG;
			        var stcglsuburl = nlapiResolveURL("RECORD", REC_CLAIM_GENERATION_LOG, cglId, "VIEW");
			        var stErrorSubject = "Generating Accrual Reversal is Complete"
			        var stErrorBody = 'Please Check this <a href="' + stcglsuburl +'">CGL #'+ cglId + ' </a>';
					nlapiSendEmail(user, user, stErrorSubject ,stErrorBody, null, null, records);
			}
		}catch(e){
			log('DEBUG',"#2 ERROR IN EMAIL SENDING", e);
		}	
	}

	nlapiSubmitRecord(recCGL, false, true);
	
	return {
    	arrReversalJe: arrReversedJE
    };
	
}


function processPartialJeReversal(objToJe,recCGL,recAccrual){
	

	var stLogTitle = 'PROCESSPARTIALJEREVERSAL';
	
	var stRa 		= recCGL.getFieldValue(FLD_ACCRUAL_RA);
	var cglId 		= recCGL.getId();
    var stClaimDate	= nlapiStringToDate(recCGL.getFieldValue(FLD_CLAIM_GEN_DATE));
	
	var intRebateType = recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
	
	var stAccrialId = recAccrual.getId();
	var intMaxItem = 500;
	var recJE = null;
	var arrReversedJE = []
	var intCurCount = 0;

	var stDep = null;
	var stClass =  null;
	var STLocation = null;
	
	var stPostByDefaultDepartment = null;
	var stPostByDefalultClass = null;
	var stPostByDefaultLocation = null;
	
	var stAccrualSubsidiary = null;
	var stAccrualCurency = null;
	var stAccrualDate = null;
	var stAccrualPeriod = null;
	
	var stPostByDepartment = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEPARTMENT);
	var stPostByClass = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_CLASS);
	var stPostByLocation = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_LOCATION);
	
	var stRebateType = recAccrual.getFieldValue(FLD_ACCRUAL_REBATE_TYPE);
	var stRemitType = recAccrual.getFieldValue(FLD_ACCRUAL_REMIT_TYPE);
	var stCreditEntity = recAccrual.getFieldValue(FLD_ACCRUAL_CREDIT_ENTITY);
	var stRefundEntity = recAccrual.getFieldValue(FLD_ACCRUAL_REFUND_ENTITY);
	
	var bIsVROSVROP = false;
	var stVROSVROPEntity = null;
	if(stRebateType != HC_REB_TYPE.CustReb){
    	bIsVROSVROP = true;
    	if(stRemitType == HC_REMIT_TYPE.Credit){
    		stVROSVROPEntity = stCreditEntity;
    	}else{
    		stVROSVROPEntity = stRefundEntity
    	}
    	
	}
	
	var objAcrrualConfig = retrieveAccrualConfig(intRebateType);
	
	var funcConverJeSearchToObject = function(recAccrual){
		var HC_OBJ_FEATURE = new objFeature();
		var arrAccruJe = recAccrual.getFieldValues(FLD_ACCRUAL_TRANSACTION);
		var arrAccruJeRev = recAccrual.getFieldValues(FLD_ACCRUAL_REVERSAL_TRAMSACTION);
		var arrCGLPrevOnAccrual = recAccrual.getFieldValues(FLD_ACCRUAL_CGL);
		
    	var stPostByDepartment = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEPARTMENT);
    	var stPostByClass = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_CLASS);
    	var stPostByLocation = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_LOCATION);
    	
    	var stFldAmountName = FLD_AMOUNT;
		
    	var retObject = {
    			accrual: null,
    			reversal: null
    	}
    	
		var arrJEId = [];
		if(!isEmpty(arrAccruJe)){
			arrJEId = arrJEId.concat(arrAccruJe);
		}else{
			arrAccruJe = [];
		}
		
		if(!isEmpty(arrAccruJeRev)){
			arrJEId = arrJEId.concat(arrAccruJeRev);
		}else{
			arrAccruJeRev = [];
		}
		
		
		var arrColumns = [];
		var arrFilters = [];
		arrFilters.push(new nlobjSearchFilter("internalid", null, 'anyof', arrJEId));
		

		arrColumns.push(new nlobjSearchColumn(FLD_INTERNAL_ID, null, HC_SEARCH_SUMMARY_TYPE.group));
		arrColumns.push(new nlobjSearchColumn(FLD_ENTITY, null, HC_SEARCH_SUMMARY_TYPE.group));
		
    	if(stPostByDepartment == "T"){
    		arrColumns.push(new nlobjSearchColumn(FLD_DEPARTMENT, null, HC_SEARCH_SUMMARY_TYPE.group))
    	}
    	if(stPostByClass == "T"){
    		arrColumns.push(new nlobjSearchColumn(FLD_CLASS, null, HC_SEARCH_SUMMARY_TYPE.group))
    	}
    	if(stPostByLocation == "T"){
    		arrColumns.push(new nlobjSearchColumn(FLD_LOCATION, null, HC_SEARCH_SUMMARY_TYPE.group))
    	}
    	
    	var objColJEAmount = new nlobjSearchColumn(stFldAmountName, null, HC_SEARCH_SUMMARY_TYPE.sum)
    	if(HC_OBJ_FEATURE.bMultiCurrency){
    		stFldAmountName = "fxamount"
    		objColJEAmount = new nlobjSearchColumn(stFldAmountName, null, HC_SEARCH_SUMMARY_TYPE.sum)
    	}

    	arrColumns.push(objColJEAmount);

		var objSearchJE = getAllResults(null, 'customsearch_nsts_rm_ss_get_reversal_amt', arrFilters, arrColumns);
		var arrJERes = objSearchJE.results;
		
		if(!isEmpty(arrJERes)){
			for(var ii = 0; ii < arrJERes.length; ii++){
				var result = arrJERes[ii];

				//result = nlobjSearchResult;
				var intJeId = result.getValue(FLD_INTERNAL_ID, null, HC_SEARCH_SUMMARY_TYPE.group);
				var stEntity = result.getValue(FLD_ENTITY, null, HC_SEARCH_SUMMARY_TYPE.group);
				var stEntityid = result.getValue('internalid','customer', HC_SEARCH_SUMMARY_TYPE.group);
				var stDepartment = result.getValue(FLD_DEPARTMENT, null, HC_SEARCH_SUMMARY_TYPE.group);
				var stClass = result.getValue(FLD_CLASS, null, HC_SEARCH_SUMMARY_TYPE.group);
				var stLocation = result.getValue(FLD_LOCATION, null, HC_SEARCH_SUMMARY_TYPE.group);
				var flAmount = result.getValue(stFldAmountName, null, HC_SEARCH_SUMMARY_TYPE.sum);
				flAmount = Math.abs(parseFloat(flAmount));
				
				var stGrpKey = ["KEYS"];
				if(!bIsVROSVROP){
		    		if(!isEmpty(stEntityid)){
		    			stGrpKey.push("CUSTOMER");
		    			stGrpKey.push(stEntityid);
		    		}
				}

		    	if(stPostByDepartment == "T"){
		    		if(!isEmpty(stDepartment)){
		    			stGrpKey.push("DEPARTMENT");
		    			stGrpKey.push(stDepartment);
		    		}
		    	}
		    	if(stPostByClass == "T"){
		    		if(!isEmpty(stClass)){
		    			stGrpKey.push("CLASS");
		    			stGrpKey.push(stClass);
		    		}
		    	}
		    	if(stPostByLocation == "T"){
		    		if(!isEmpty(stLocation)){
		    			stGrpKey.push("LOCATION");
		    			stGrpKey.push(stLocation);
		    		}
		    	}
		    	
		    	stGrpKey = stGrpKey.join('_');
				
				if(arrAccruJe.indexOf(intJeId) >= 0){
					if(isEmpty(retObject.accrual)){
						retObject.accrual = {};
					}
					
					if(isEmpty(retObject.accrual[stGrpKey])){
						retObject.accrual[stGrpKey] =  {
								id: [],
								entity: stEntity,
								customer: stEntityid,
								department: stDepartment,
								class: stClass,
								location: stLocation,
								amount: 0
						};
					}
					retObject.accrual[stGrpKey].id.push(intJeId)
					retObject.accrual[stGrpKey].amount += flAmount;
					
					if(arrAccruJeRev.indexOf(intJeId) >= 0){
						if(isEmpty(retObject.reversal)){
							retObject.reversal = {}
						}
						if(isEmpty(retObject.reversal[stGrpKey])){
							retObject.reversal[stGrpKey] = retObject.accrual[stGrpKey];
						}
					}
					
					//retObject.accrual.push(objRes)
					
				}else{
					if(isEmpty(retObject.reversal)){
						retObject.reversal = {};
					}
					
					if(isEmpty(retObject.reversal[stGrpKey])){
						retObject.reversal[stGrpKey] =  {
								id: [],
								entity: stEntity,
								customer: stEntityid,
								department: stDepartment,
								class: stClass,
								location: stLocation,
								amount: 0
						};
					}
					retObject.reversal[stGrpKey].id.push(intJeId)
					retObject.reversal[stGrpKey].amount += flAmount;
					
					
					//retObject.reversal.push(objRes);
				}
			}

		}else{
			return {
				accrual: null,
				reversal: null
			}
		}
		
		return retObject
	}
	
	var objAccrualJEInfo = funcConverJeSearchToObject(recAccrual);
	
	try{
    	for (var stGroupAccrualKey in objToJe){
    		var arrBuf = objToJe[stGroupAccrualKey];
    		if(!isEmpty(arrBuf)){

    			var createNewJe = function(recAccrualJE){
        			if(isEmpty(recAccrualJE)){
        			    var onjIniVals = {};
        			    onjIniVals["recordmode"] = 'dynamic';	    			    
		    
        			    stDep = arrBuf[0].department;
    					stClass = arrBuf[0].class;
    					STLocation = arrBuf[0].location;
    				
    					stPostByDefaultDepartment = arrBuf[0].postByDepartmentDefault;
    					stPostByDefalultClass = arrBuf[0].postByClassDefault;
    					stPostByDefaultLocation = arrBuf[0].postByDepartmentDefault;
    					
    					stDep = isEmpty(stDep)? stPostByDefaultDepartment : stDep;
    					stClass = isEmpty(stClass)? stPostByDefalultClass : stClass;
    					STLocation = isEmpty(STLocation)? stPostByDefaultLocation : STLocation;

    					stAccrualSubsidiary = arrBuf[0].accrualSubsidiary;
    					stAccrualCurency = arrBuf[0].accrualCurency;
    					stAccrualDate = arrBuf[0].accrualDate;
    					stAccrualPeriod = arrBuf[0].accrualPeriod;
    					
    					doYield();
        				recAccrualJE = nlapiCreateRecord('journalentry', onjIniVals);
        				
	    				if(!isEmpty(objAcrrualConfig.JEForm)){
	    					recAccrualJE.setFieldValue('customform', objAcrrualConfig.JEForm);
	    				}
	    				
    					recAccrualJE.setFieldValue('subsidiary', stAccrualSubsidiary);
    					recAccrualJE.setFieldValue('currency', stAccrualCurency);
    					
    					recAccrualJE.setFieldValue('trandate', stClaimDate);
    					recAccrualJE.setFieldValue('postingperiod', stAccrualPeriod);
    					
    					recAccrualJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_RA_ID, stRa);
    					recAccrualJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_CGL, cglId);
    					recAccrualJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_ACCRUALREC, stAccrialId);
    					
             			log('DEBUG', stLogTitle, "#1 stAccrualSubsidiary:" + stAccrualSubsidiary + " stAccrualCurency:" + stAccrualCurency + " stAccrualDate:" + stAccrualDate + " stAccrualPeriod:" + stAccrualPeriod);
             			
						//var stMemo = [ "{REBATE MANAGEMENT}: this is an auto-generated reversal JE for Accrual #" + stAccrialId];
						//stMemo.push(" | Claim #: " + cglId);
						//stMemo.push(" | Accrual Inclusive Dates: " + recAccrual.getFieldValue(FLD_ACCRUAL_TRAN_START_DATE) + " - " + recAccrual.getFieldValue(FLD_ACCRUAL_TRAN_END_DATE))
             			//var stMemo = "[REBATE MANAGEMENT]: This is an auto-generated JE. This is fully/partially reversed. Please check accrual <accrual record ID> for the reversal/related JEs.";
             			var stMemo = "[REBATE MANAGEMENT]: This is an auto-generated JE. This is fully/partially reversed. Please check Accrual # "+stAccrialId+" for the reversal/related JEs.";
						
             			
						recAccrualJE.setFieldValue('memo', stMemo);
             			
             			return recAccrualJE;
  
        			}
        			return recAccrualJE;
    			}
    			
    			recJE = createNewJe(recJE);
    			log("DEBUG",stLogTitle, "arrBuf.length :" + arrBuf.length);
    			
    			for(var ii = 0; ii < arrBuf.length; ii++){
    				log("DEBUG",stLogTitle, "ADDING DATA: " + JSON.stringify(arrBuf[ii]) );
    				
         			var flAccrualAmount = arrBuf[ii].accrualAmount;
         			flAccrualAmount = toFixed(flAccrualAmount, 2);
         			
					if(flAccrualAmount == 0){
	    				log("DEBUG",stLogTitle, "SKIPPING ADDING DATA: flAccrualAmount: " + flAccrualAmount);
						continue;
					}
					
    				
         			stDep = arrBuf[ii].department;
         			stClass = arrBuf[ii].class;
         			STLocation = arrBuf[ii].location;
         			
         			var stEntityCustomerid = arrBuf[ii].customer;
         			
         			log("DEBUG",stLogTitle, ii + " arrBuf[ii]: " + JSON.stringify(arrBuf[ii])); 
         			
    				var stGrpKey = ["KEYS"];
    				
    				if(!bIsVROSVROP){
        	    		if(!isEmpty(stEntityCustomerid)){
        	    			stGrpKey.push("CUSTOMER");
        	    			stGrpKey.push(stEntityCustomerid);
        	    		}
    				}
    				
    		    	if(stPostByDepartment == "T"){
    		    		if(!isEmpty(stDep)){
    		    			stGrpKey.push("DEPARTMENT");
    		    			stGrpKey.push(stDep);
    		    		}
    		    	}
    		    	if(stPostByClass == "T"){
    		    		if(!isEmpty(stClass)){
    		    			stGrpKey.push("CLASS");
    		    			stGrpKey.push(stClass);
    		    		}
    		    	}
    		    	if(stPostByLocation == "T"){
    		    		if(!isEmpty(STLocation)){
    		    			stGrpKey.push("LOCATION");
    		    			stGrpKey.push(STLocation);
    		    		}
    		    	}
    		    	
    		    	stGrpKey = stGrpKey.join('_');
         			
         			var funcGenerateLine = function(accrountJEAmount){
         				stPostByDefaultDepartment = arrBuf[0].postByDepartmentDefault;
    					stPostByDefalultClass = arrBuf[0].postByClassDefault;
    					stPostByDefaultLocation = arrBuf[0].postByDepartmentDefault;
             			
    					stDep = isEmpty(stDep)? stPostByDefaultDepartment : stDep;
    					stClass = isEmpty(stClass)? stPostByDefalultClass : stClass;
    					STLocation = isEmpty(STLocation)? stPostByDefaultLocation : STLocation;
             			
             			var objReversedAcc = getReversedAccrualAccrount (arrBuf[ii]);
             			var stDebit = objReversedAcc.debit;
             			var stCredit = objReversedAcc.credit;
             			
    					var stDebitTmp = stDebit
    					var stCreditTmp = stCredit
    					var flAccrualAmount = accrountJEAmount;
    					var stRevAccruEntity = arrBuf[ii].entity;
    					
    		    		if(bIsVROSVROP && !isEmpty(stVROSVROPEntity)){
    		    			stRevAccruEntity = stVROSVROPEntity;
    		    		}

    					
    					if(flAccrualAmount < 0 ){
    						stDebitTmp = stCredit;
    						stCreditTmp = stDebit;
    						flAccrualAmount = Math.abs(flAccrualAmount);
    					}
    					
    					flAccrualAmount = toFixed(flAccrualAmount,2);
    					
    					if(flAccrualAmount != 0){
    		   				//DEBIT
                 			recJE.selectNewLineItem(FLD_LINE);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stDebitTmp)
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'debit', flAccrualAmount);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', stRevAccruEntity);
             
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
                 			recJE.commitLineItem(FLD_LINE);
                 			
            				//credit
                 			recJE.selectNewLineItem(FLD_LINE);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stCreditTmp);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'credit', flAccrualAmount);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', stRevAccruEntity);
             
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
                 			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
                 			recJE.commitLineItem(FLD_LINE);

                 			
                 			
                 			intCurCount = recJE.getLineItemCount(FLD_LINE);
                 			log("DEBUG",stLogTitle, "intCurCount:" + intCurCount);
                 			if(intCurCount >= 1000){
                 				doYield();
                 				log("DEBUG",stLogTitle, "#1 SAVING JE");
                    			var intJe = nlapiSubmitRecord(recJE, true, true);
                      			if(!isEmpty(intJe)){
                    	  			arrReversedJE.push(intJe);
                    			}
                    			recJE = null;
                    			recJE = createNewJe(recJE);
                    			intCurCount = 0;
                 			}
    					}//if(flAccrualAmount != 0){
    					
     
             			
         			}//END: var funcGenerateLine = function(){
         			
         			
         			var objAccruJEInfo = objAccrualJEInfo.accrual[stGrpKey];
         			var objAccruReversalJEInfo = null;
         			try{
             			objAccruReversalJEInfo = objAccrualJEInfo.reversal[stGrpKey];
         			}catch(e){
         				objAccruReversalJEInfo = null;
         			}


         			log('DEBUG',  stLogTitle, "stGrpKey: " + stGrpKey);
         			log('DEBUG',  stLogTitle, "objAccruJEInfo: " + JSON.stringify(objAccruJEInfo));
         			log('DEBUG',  stLogTitle, "objAccruReversalJEInfo: " + JSON.stringify(objAccruReversalJEInfo));
         			if(!isEmptyObject(objAccruJEInfo) && isEmpty(objAccruReversalJEInfo)){
         				log('DEBUG',  stLogTitle, "if(!isEmptyObject(objAccruJEInfo) && isEmpty(objAccruReversalJEInfo))");
         				funcGenerateLine(flAccrualAmount);
         				log('DEBUG',  stLogTitle, "#2 if(!isEmptyObject(objAccruJEInfo) && isEmpty(objAccruReversalJEInfo))");
         				
         			}else{
         				log('DEBUG',  stLogTitle, "ELSE if(!isEmptyObject(objAccruJEInfo) && isEmpty(objAccruReversalJEInfo))");
         				var flAccrualAmount_to_abs = Math.abs(flAccrualAmount);
         				var bIsAccrualAmountNegative = false;
         				if(flAccrualAmount < 0){
         					bIsAccrualAmountNegative = true
         				}
         				
         				flAccrualAmount_to_abs = toFixed(flAccrualAmount_to_abs, 2)
         				
         				log('DEBUG',  stLogTitle, "objAccruJEInfo.amount " + objAccruJEInfo.amount + " objAccruReversalJEInfo.amount: " + objAccruReversalJEInfo.amount + " flAccrualAmount_to_abs:" + flAccrualAmount_to_abs);

         				if(objAccruReversalJEInfo.amount < objAccruJEInfo.amount){
             				if(objAccruReversalJEInfo.amount >= flAccrualAmount_to_abs){
             					var flAccrualAmount_difference = objAccruReversalJEInfo.amount - flAccrualAmount_to_abs
                 				log('DEBUG',  stLogTitle, "#1 flAccrualAmount_difference: " + flAccrualAmount_difference);
                 				
             					if(flAccrualAmount_difference > 0){
                 					flAccrualAmount_difference = (bIsAccrualAmountNegative == true)? -flAccrualAmount_difference: flAccrualAmount_difference;
                 					log('DEBUG',  stLogTitle, "#2 flAccrualAmount_difference: " + flAccrualAmount_difference);
                 					funcGenerateLine(flAccrualAmount_difference);
             					}else if(flAccrualAmount_difference == 0){
             						funcGenerateLine(flAccrualAmount_to_abs);
             					}
             				}else{
             					log('DEBUG',  stLogTitle, "#2 flAccrualAmount_sum: " + flAccrualAmount_sum);
             					var flAccrualAmount_sum = flAccrualAmount_to_abs - objAccruReversalJEInfo.amount
             					var flAccrualAmount_sum_temp = objAccruJEInfo.amount - objAccruReversalJEInfo.amount
             					if(flAccrualAmount_sum_temp == flAccrualAmount_to_abs){
             						flAccrualAmount_sum = flAccrualAmount_to_abs;
             					}
           
             					if(flAccrualAmount_sum > 0){
             						flAccrualAmount_sum = (bIsAccrualAmountNegative == true)? -flAccrualAmount_sum: flAccrualAmount_sum;
                 					log('DEBUG',  stLogTitle, "#3 flAccrualAmount_sum: " + flAccrualAmount_sum);
                 					funcGenerateLine(flAccrualAmount_sum);
             					}else if(flAccrualAmount_sum == 0){
             						funcGenerateLine(flAccrualAmount_to_abs);
             						
             					}
             				}
         				}else if(objAccruJEInfo.amount == flAccrualAmount_to_abs){
         					var flAccrualAmount_difference = objAccruJEInfo.amount - objAccruReversalJEInfo.amount 
             				log('DEBUG',  stLogTitle, "#3 flAccrualAmount_difference: " + flAccrualAmount_difference);
             				
         					if(flAccrualAmount_difference > 0){
             					flAccrualAmount_difference = (bIsAccrualAmountNegative == true)? -flAccrualAmount_difference: flAccrualAmount_difference;
             					log('DEBUG',  stLogTitle, "#3 flAccrualAmount_difference: " + flAccrualAmount_difference);
             					funcGenerateLine(flAccrualAmount_difference);
         					}else if(flAccrualAmount_sum == 0){
         						funcGenerateLine(flAccrualAmount_difference);
         					}
         						
         				}else{
             				log('DEBUG',  stLogTitle,"ELSE: objAccruReversalJEInfo.amount:" + objAccruReversalJEInfo.amount);
             				log('DEBUG',  stLogTitle,"ELSE: objAccruJEInfo.amount:" + objAccruJEInfo.amount);
             				log('DEBUG',  stLogTitle,"ELSE: flAccrualAmount_to_abs:" + flAccrualAmount_to_abs);
             			}
         				//if(objAccruJEInfo.amount < objAccruReversalJEInfo.amount)
         				
         			}
    			}
    		}
    	}
    	
		if(!isEmpty(recJE)){
 			var intCurCount = recJE.getLineItemCount(FLD_LINE);
 			log("DEBUG",stLogTitle, "#2 intCurCount:" + intCurCount);
 			if(intCurCount > 0){
 				doYield();
 				log("DEBUG",stLogTitle, "#2 SAVING JE");
    			var intJe = nlapiSubmitRecord(recJE, true, true);
    			log("DEBUG",stLogTitle, "SAVING JE ID" + intJe);
    			if(!isEmpty(intJe)){
    	  			arrReversedJE.push(intJe);
    			}
  
    			recJE = null;
    			intCurCount = 0;
 			}
    		
		}
		
	}catch(e){
		throw e;
	}
	
	log("DEBUG",stLogTitle, "End arrReversedJE: " + JSON.stringify(arrReversedJE));
	return {
		arrReversedJE: arrReversedJE
	};
}

function rtdComponent(result){
	//result =  nlobjSearchResult;

	var stRebateType = result.getValue(FLD_REBATE_TRAN_DETAIL_REBATE_TYPE,null,HC_SEARCH_SUMMARY_TYPE.group);
	var stCustomer = result.getValue(FLD_REBATE_TRAN_DETAIL_CUSTOMER,null,HC_SEARCH_SUMMARY_TYPE.group);
	var stVendor = result.getValue(FLD_REBATE_TRAN_DETAIL_VENDOR,null,HC_SEARCH_SUMMARY_TYPE.group);
	var flAccruAmt = result.getValue(FLD_CUSTRECORD_ACCRUAL_AMO,null,HC_SEARCH_SUMMARY_TYPE.sum);
	

	var stAccrual = result.getValue(FLD_CUSTRECORD_ACCRUAL_RECORD,null,HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualSDate = result.getValue(FLD_ACCRUAL_TRAN_START_DATE,FLD_CUSTRECORD_ACCRUAL_RECORD,HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualEDate = result.getValue(FLD_ACCRUAL_TRAN_END_DATE,FLD_CUSTRECORD_ACCRUAL_RECORD,HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualExpense = result.getValue(FLD_ACCRUAL_EXPENSE,FLD_CUSTRECORD_ACCRUAL_RECORD,HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualReceivable = result.getValue(FLD_ACCRUAL_RECEIVABLE,FLD_CUSTRECORD_ACCRUAL_RECORD,HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualPayable = result.getValue(FLD_ACCRUAL_PAYABLE,FLD_CUSTRECORD_ACCRUAL_RECORD,HC_SEARCH_SUMMARY_TYPE.group);

	var stDept = result.getValue(FLD_REBATE_TRAN_DEPARTMENT, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, HC_SEARCH_SUMMARY_TYPE.group);
	var stClass = result.getValue(FLD_REBATE_TRAN_CLASS, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, HC_SEARCH_SUMMARY_TYPE.group);
	var stLoc = result.getValue(FLD_REBATE_TRAN_LOCATION, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, HC_SEARCH_SUMMARY_TYPE.group);
	
	var stPostByDept = result.getValue(FLD_ACCRUAL_POST_BY_DEPARTMENT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stPostByClass = result.getValue(FLD_ACCRUAL_POST_BY_CLASS, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stPostByLoc = result.getValue(FLD_ACCRUAL_POST_BY_LOCATION, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	
	var stPostByDeptDefault = result.getValue(FLD_ACCRUAL_POST_BY_DEFAULT_DEPARTMENT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stPostByClassDefault = result.getValue(FLD_ACCRUAL_POST_BY_DEFAULT_CLASS, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stPostByLocDefault = result.getValue(FLD_ACCRUAL_POST_BY_DEFAULT_LOCATION, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	
	if(HC_OBJ_FEATURE.blnOneWorld) 
		var stAccrualSubsidiary = result.getValue(FLD_ACCRUAL_SUBSIDIARY, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	else 
		var stAccrualSubsidiary = ''
	if(HC_OBJ_FEATURE.bMultiCurrency)
		var stAccrualCurency = result.getValue(FLD_ACCRUAL_CURRENCY, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	else
		var stAccrualCurency = '';
	var stAccrualDate = result.getValue(FLD_ACCRUAL_DATE, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualPeriod = result.getValue(FLD_ACCRUAL_PERIOD, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	var stAccrualRecAmount = result.getValue(FLD_ACCRUAL_AMOUNT, FLD_CUSTRECORD_ACCRUAL_RECORD, HC_SEARCH_SUMMARY_TYPE.group);
	
	var entity = stVendor;
	if(isEmpty(entity)){
		entity = stCustomer;
	}
	
	/*flAccruAmt = isEmpty(flAccruAmt)? 0 : toFixed(parseFloat(flAccruAmt),2);
	stAccrualRecAmount = parseFloat(stAccrualRecAmount);*/
	flAccruAmt = isEmpty(flAccruAmt)? 0 : parseFloat(flAccruAmt);
	stAccrualRecAmount = parseFloat(stAccrualRecAmount);
	
	return {
		rebateType: stRebateType,
		vendor: stVendor,
		customer: stCustomer,
		accrualAmount: flAccruAmt,
		entity: entity,
		
		accrual: stAccrual,
		accrualStartDate: stAccrualSDate,
		accrualEndDate: stAccrualEDate,
		accrualExpense: stAccrualExpense,
		accrualReceivable: stAccrualReceivable,
		accruaalPayable: stAccrualPayable,
		accrualSubsidiary: stAccrualSubsidiary,
		accrualCurency: stAccrualCurency,
		accrualDate: stAccrualDate,
		accrualPeriod: stAccrualPeriod,
		accrualRecAmount: stAccrualRecAmount,
		department: stDept,
		class: stClass,
		location: stLoc,
		
		postByDepartment: stPostByDept,
		postByClass: stPostByClass,
		postByLocation: stPostByLoc,
		
		postByDepartmentDefault: stPostByDeptDefault,
		postByClassDefault: stPostByClassDefault,
		postByLocationDefault: stPostByLocDefault
	};
}

/**
 * 
 * @param rtdComponent {rtdComponent}
 */
function getReversedAccrualAccrount (rtdComponent){
	var stRebateType = rtdComponent.rebateType
	
	var stDebit = rtdComponent.accruaalPayable //actual debit: AccruedExpense , reversed: AccruedPayable
	var stCredit =rtdComponent.accrualExpense; //actual credit: AccruedPayable , reversed: AccruedExpense
	
	if(stRebateType != HC_REB_TYPE.CustReb){
    	stDebit = rtdComponent.accrualExpense; //actual debit: stAccruedReceivable , reversed: AccruedPayable
    	stCredit = rtdComponent.accrualReceivable; //actual credit: stAccruedExpense , reversed: AccruedPayable
	}
	    	
    return {
    	debit: stDebit,
    	credit: stCredit
    }
}


function isEmptyObject(obj) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
}

function retrieveAccrualConfig(stRebateType) {
    var objClaimConf = null;
    
    var arrFilters = [];
    arrFilters.push(new nlobjSearchFilter(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE, null, 'anyof', stRebateType));
    arrFilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    
    var arrCols = [];

    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_FLAG));
    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE));
    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE));
    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE));
    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE));
    arrCols.push(new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_JEFORM));
  
    var arrResult = nlapiSearchRecord(REC_ACCRUAL_ACCOUNT, null, arrFilters, arrCols);
    
    var stAccountFlag = null;
    var stRebateType = null;
    var stAccruedExpense = null;
    var stAccruedReceivable = null;
    var stAccruedPayable = null;
    var stJEForm = null
    
    if (!isEmpty(arrResult)) {
        // Should only have 1 result
        stAccountFlag = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_FLAG);
        stRebateType = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE);
        stAccruedExpense = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE);
        stAccruedReceivable = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE);
        stAccruedPayable = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE);
        stJEForm = arrResult[0].getValue(FLD_ACCRUAL_ACCOUNT_JEFORM);
        
    }
 
    return {
    	accountTag: stAccountFlag,
    	rebateType: stRebateType,
    	accruedExpense: stAccruedExpense,
    	accruedReceivable: stAccruedReceivable,
    	accruedPayable: stAccruedPayable,
    	JEForm: stJEForm
    };
}