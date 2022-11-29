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

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */

var USAGE_LIMIT = 1000;

var HC_OBJ_FEATURE = new objFeature();

function accruals_Generation(type) {
    var stLogTitle = 'ACCRUALS_GENERATION';
    var context = nlapiGetContext();
    var arrAccruals = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUALS_ID); 
    var stUserId = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRU_USER);
    var stEmailSubject = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRU_EMAIL_SUBJECT); 
    var stEmailBody = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRU_EMAIL_BODY); 
    
    var arrAccruals = parseStringToJson(arrAccruals, []);
    
    log("debug",stLogTitle, "stUserId: " + stUserId + " stEmailSubject:" + stEmailSubject + " stEmailBody:" + stEmailBody);
    
    for(var i = 0; i < arrAccruals.length; i++){
    	var intAccru = arrAccruals[i];
    	
    	//nlapiSubmitField(REC_ACCRUAL, intAccru, [FLD_ACCRUAL_STATUS], [HC_ACCRUAL_STATUS.processing]);
    	
    	var recAccrual = nlapiLoadRecord(REC_ACCRUAL, intAccru);
    	
    	var stRa = recAccrual.getFieldValue(FLD_ACCRUAL_RA);
    	var stDefaultSearch = recAccrual.getFieldValue(FLD_ACCRUAL_DEFAULT_SEARCH);
    	var stRebateType = recAccrual.getFieldValue(FLD_ACCRUAL_REBATE_TYPE);
    	
    	var stRemitType = recAccrual.getFieldValue(FLD_ACCRUAL_REMIT_TYPE);
    	var stCreditEntity = recAccrual.getFieldValue(FLD_ACCRUAL_CREDIT_ENTITY);
    	var stRefundEntity = recAccrual.getFieldValue(FLD_ACCRUAL_REFUND_ENTITY);
    	
    	var stAccrualDate = recAccrual.getFieldValue(FLD_ACCRUAL_DATE);
    	var stAccrualPeriod = recAccrual.getFieldValue(FLD_ACCRUAL_PERIOD);
    	var stTranStartDate = recAccrual.getFieldValue(FLD_ACCRUAL_TRAN_START_DATE);
    	var stTranEndDate = recAccrual.getFieldValue(FLD_ACCRUAL_TRAN_END_DATE);
    	
    	var stPostByDepartment = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEPARTMENT);
    	var stPostByClass = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_CLASS);
    	var stPostByLocation = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_LOCATION);
    	
    	var stPostByDefaultDepartment = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_DEPARTMENT);
    	var stPostByDefalultClass = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_CLASS);
    	var stPostByDefaultLocation = recAccrual.getFieldValue(FLD_ACCRUAL_POST_BY_DEFAULT_LOCATION);
    	
    	var stAccruSubsidiary = recAccrual.getFieldValue(FLD_ACCRUAL_SUBSIDIARY);
    	var stAccruCurrency = recAccrual.getFieldValue(FLD_ACCRUAL_CURRENCY);
    	
    	var stAccruedExpense = recAccrual.getFieldValue(FLD_ACCRUAL_EXPENSE);
    	var stAccruedReceivable = recAccrual.getFieldValue(FLD_ACCRUAL_RECEIVABLE);
    	var stAccruedPayable = recAccrual.getFieldValue(FLD_ACCRUAL_PAYABLE);
    	
    	var bIsGenerate =  recAccrual.getFieldValue(FLD_ACCRUAL_ISGENERATE); 
    	var stErrorLog = recAccrual.getFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG);
    	var arrClaimTranType = recAccrual.getFieldValues(FLD_ACCRUAL_CLAIM_TRAN_TYPE);

    	var stNewSearch = recAccrual.getFieldValue(FLD_ACCRUAL_NEW_SEARCH);
    	
    	var arrAccrualFld = [];
    	var arrAccrualVal = [];
    	
    	log("debug",stLogTitle, "stNewSearch: " + stNewSearch);
    	if(bIsGenerate == "F"){
    		continue;
    	}
    	
    	var objAcrrualConfig = retrieveAccrualConfig(stRebateType);
    	
    	var stDebit = stAccruedExpense;
    	var stCredit = stAccruedPayable;
    	
    	var bIsVROSVROP = false;
    	var stVROSVROPEntity = null;
    	if(stRebateType != HC_REB_TYPE.CustReb){
        	stDebit = stAccruedReceivable;
        	stCredit = stAccruedExpense;
        	bIsVROSVROP = true;
        	
        	if(stRemitType == HC_REMIT_TYPE.Credit){
        		stVROSVROPEntity = stCreditEntity;
        	}else{
        		stVROSVROPEntity = stRefundEntity
        	}
        	
    	}

    	var objSearchDefault = nlapiLoadSearch(null, stDefaultSearch);

    	
    	log("debug",stLogTitle, "getting save search component");
    	//LOAD Search component
    	var objNewSSearch = objSearchDefault;
    	var arrAccruColsOld = objNewSSearch.getColumns();
    	var arrAccruFilsOld = objNewSSearch.getFilters();
    	
    	var arrAccruColsNew = [];
    	var arrAccruFilsNew = [];
    	for(var icol = 0; icol < arrAccruColsOld.length; icol++){
    		var col = arrAccruColsOld[icol]; 

    		if(icol == 0){
    			col.setSort(false);
    		}
    		var stColName = col.getName();
    		var stConJoin = col.getJoin();
    		var stSum = col.getSummary();
    		//arrAccruColsNew.push(new nlobjSearchColumn(stColName, stConJoin, stSum));
    		
    		arrAccruColsNew.push(col);
    	}
    	
    	if(stRebateType == HC_REB_TYPE.CustReb){
    		arrAccruColsNew.push(new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_CUSTOMER, null, HC_SEARCH_SUMMARY_TYPE.group));    		
    	}
    	
    	for(var ifil = 0; ifil < arrAccruFilsOld.length; ifil++){
    		var fil = arrAccruFilsOld[ifil];
    		arrAccruFilsNew.push(fil);	
    	}
    	
    	
    	if(stPostByDepartment == "T"){
    		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_DEPARTMENT, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
    	}
    	if(stPostByClass == "T"){
    		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_CLASS, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
    	}
    	if(stPostByLocation == "T"){
    		arrAccruColsNew.push( new nlobjSearchColumn(FLD_REBATE_TRAN_LOCATION, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP'))
    	}
    	
    	if(!isEmpty(stRa)){
    		arrAccruFilsNew.push(new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGREEMENT, null, 'anyof', [stRa]))
    	}
    	
    	if(!isEmpty(arrClaimTranType)){
    		arrAccruFilsNew.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_TRAN_TYPE, null, 'anyof', arrClaimTranType))
    	}
    	
   		arrAccruFilsNew.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DATE, FLD_CUSTRECORD_NSTS_RM_REBATETRAN, 'within', stTranStartDate,stTranEndDate));
   		arrAccruFilsNew.push(new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'));

    	
    	
    	//END LOAD Search component
    	log("debug",stLogTitle, "all save search component ready");
    	
    	var bDoUpdateFilterOnNewSearch = false;
    	if(isEmpty(stNewSearch)){
    		
    		log("debug",stLogTitle, "Creating Save Search");
        	//arrAccruFilsNew.push(new nlobjSearchFilter(FLD_REBATE_TRAN_DETAIL_REBATE_AGREEMENT, null, 'anyof', [intAccru]))
        	//objNewSSearch = nlapiCreateSearch(REC_REBATE_TRAN_DETAIL, arrAccruFilsNew, arrAccruColsNew);
    		objNewSSearch = nlapiCreateSearch(REC_REBATE_TRAN_DETAIL, arrAccruFilsNew, null);
    		objNewSSearch.setIsPublic(true);
        	
        	stNewSearch = objNewSSearch.saveSearch('RTD for Accruals Default #' + intAccru + '-' + nlapiStringToDate(recAccrual.getFieldValue(FLD_ACCRUAL_DATE)).toString().split(" ").slice(0, 4).join(" "));
        	//recAccrual.setFieldValue(FLD_ACCRUAL_NEW_SEARCH,stNewSearch);
        	arrAccrualFld.push(FLD_ACCRUAL_NEW_SEARCH);
        	arrAccrualVal.push(stNewSearch);
        	bDoUpdateFilterOnNewSearch = true;
        	log("debug",stLogTitle, "Creating Save Search complete");
    	}

    	var objSearchNew = nlapiLoadSearch(null, stNewSearch);
    	
    	/*objSearchNew.setColumns([new nlobjSearchColumn('internalid')]);
    	objSearchNew.setFilters(arrAccruFilsNew);*/
    	
    	//UPDATE TRD
    	log("debug",stLogTitle, "getAllResultsSearchObject");
    	var objSearch = getAllResultsSearchObject(objSearchNew) //(null, stNewSearch, arrFil, arrCol);
    	log("debug",stLogTitle, "getAllResultsSearchObject done");
    	var arrRes = objSearch.results;
    	for(var iRTD = 0; iRTD < arrRes.length; iRTD++){
    		var recRTD = arrRes[iRTD];
    		var intRTD = recRTD.getId();
    		if(!isEmpty(intRTD)){
                try{
                	doYield();
                }catch(e){
                	log('debug',stLogTitle,e);
                }
        		nlapiSubmitField(REC_REBATE_TRAN_DETAIL, intRTD, [FLD_CUSTRECORD_ACCRUAL_RECORD], [intAccru]);
    		}
    	}
    	
    	log("debug",stLogTitle, "getAllResultsSearchObject Updating");
    	if(bDoUpdateFilterOnNewSearch){

	    	objSearchNew.setColumns(arrAccruColsNew);
	    	var isAccrualFilterApplied = false;
	    	for(var ifil = 0; ifil < arrAccruFilsNew.length; ifil++){
	    		var fil = arrAccruFilsNew[ifil];
	    		
	    		if(fil.getName() == FLD_CUSTRECORD_ACCRUAL_RECORD){
	    			isAccrualFilterApplied = true;
	    			arrAccruFilsNew[ifil] = new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_RECORD, null, 'anyof', [intAccru]);
	    		}
	    	}
	    	if(isAccrualFilterApplied == false){
		    	arrAccruFilsNew.push(new nlobjSearchFilter(FLD_CUSTRECORD_ACCRUAL_RECORD, null, 'anyof', [intAccru]));
	    	}

    		objSearchNew.setFilters(arrAccruFilsNew);
    		stNewSearch = objSearchNew.saveSearch();
    		//, 'customsearch_nsts_rm_accru_' + intAccru);

        	objSearch = getAllResults(null, stNewSearch);
        	arrRes = objSearch.results;
    	}
    	
    	

    	
    	log("debug",stLogTitle, "getAllResultsSearchObject Updated");
    	var objToJe = {};
    	if(isEmpty(arrRes)){
    		log("debug",stLogTitle, "NO DATA TO PROCESS");
    		//continue;
    	}
    	
    	log("debug",stLogTitle, "arrRes.length: " + arrRes.length);
    	for(var ii = 0; ii < arrRes.length; ii++){
    		var rec = arrRes[ii];
    		var objRtd = new rtdComponent(rec);
    		
    		if(bIsVROSVROP && !isEmpty(stVROSVROPEntity)){
    			objRtd.entity = stVROSVROPEntity;
    		}
    		
    		if(isEmpty(objToJe[objRtd.entity])){
    			objToJe[objRtd.entity] = []
    		}
    		
    		objToJe[objRtd.entity].push(objRtd);
    	}
    	
    	//check if a group is more than 500 
    	var intMaxItem = 500;
    	for (var key in objToJe){
    		var arrBuf = objToJe[key];
    		if(!isEmpty(arrBuf) && arrBuf.length >= intMaxItem){
    			
    			var arrChuck = chuckArray(arrBuf,intMaxItem);
    			/*try{
    				var fl = nlapiCreateFile("Accruals_arrBuf" + intAccru + ".txt", "PLAINTEXT", JSON.stringify(arrBuf));
    				fl.setFolder(-9);
    				nlapiSubmitFile(fl);
    			}catch(e){

    				log('DEBUG', "ERROR:" + stLogTitle, e);
    			}*/
    			
    			for(var ii = 0; ii < arrChuck.length; ii++){
    				objToJe[key + "_" + ii] = arrChuck[ii]
    			}
    			
    			objToJe[key] = null;
    			
    			delete objToJe[key];
    		}
    	}
    	
    	
    	var recJE = null;
    	var intCurCount = 0;
    	var arrJE = []
    	
		var stDep = null;
		var stClass =  null;
		var STLocation = null;
		var stIsGenerating = "F";
		var flRunningTotalAccrualAmt = 0;
			
		/*
		 * Dumping data
		 * for testing and debugging
		 * try{
			var fl = nlapiCreateFile("Accruals_" + intAccru + ".txt", "PLAINTEXT", JSON.stringify(objToJe));
			fl.setFolder(-9);
			nlapiSubmitFile(fl);
		}catch(e){

			log('DEBUG', "ERROR:" + stLogTitle, e);
		}*/
		
		try{
			var stJEError = '';
	    	for (var key in objToJe){
	    		var arrBuf = objToJe[key];
	    		if(!isEmpty(arrBuf)){
	    			
	    			
	    			var createNewJe = function (recAccruJE){
	    				
		    			if(isEmpty(recAccruJE)){
		    			    var onjIniVals = {};
		    			    onjIniVals["recordmode"] = 'dynamic';

		    			    
							stDep = isEmpty(stDep)? stPostByDefaultDepartment : stDep;
							stClass = isEmpty(stClass)? stPostByDefalultClass : stClass;
							STLocation = isEmpty(STLocation)? stPostByDefaultLocation : STLocation;
								    			    
		    			    stDep = arrBuf[0].department;
							stClass = arrBuf[0].class;
							STLocation = arrBuf[0].location;
							
							/*onjIniVals["department"] = stDep;
		    			    onjIniVals["class"] = stClass;
		    			    onjIniVals["location"] = STLocation;*/
		    			    
		    				recAccruJE = nlapiCreateRecord('journalentry', onjIniVals)

		    				if(!isEmpty(objAcrrualConfig.JEForm)){
		    					recAccruJE.setFieldValue('customform', objAcrrualConfig.JEForm);
		    				}

		    				if(HC_OBJ_FEATURE.blnOneWorld) recAccruJE.setFieldValue('subsidiary', stAccruSubsidiary);
		    				if(HC_OBJ_FEATURE.bMultiCurrency) recAccruJE.setFieldValue('currency', stAccruCurrency);
							
							recAccruJE.setFieldValue('trandate', stAccrualDate);
							recAccruJE.setFieldValue('postingperiod', stAccrualPeriod);
							recAccruJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_RA_ID, stRa);
							recAccruJE.setFieldValue(FLD_CUSTBODY_NSTS_RM_ACCRUALREC, intAccru);
							

							/*stDep = arrBuf[0].department;
							stClass = arrBuf[0].class;
							STLocation = arrBuf[0].location;

							stDep = isEmpty(stDep)? stPostByDefaultDepartment : stDep;
							stClass = isEmpty(stClass)? stPostByDefalultClass : stClass;
							STLocation = isEmpty(STLocation)? stPostByDefaultLocation : STLocation;*/
							
							/*recJE.setFieldValue('department', stDep);
							recJE.setFieldValue('class', stClass);
							recJE.setFieldValue('location', STLocation);*/

							recAccruJE.setFieldValue('memo', "{REBATE MANAGEMENT}: This is an auto-generated JE for Accrual");
							return recAccruJE;
		    			}
		    			
		    			return recAccruJE;
	    			}
	    			recJE = createNewJe(recJE);
	    			
        			for(var ii = 0; ii < arrBuf.length; ii++){

             			stDep = arrBuf[ii].department;
             			stClass = arrBuf[ii].class;
             			STLocation = arrBuf[ii].location;
             			
             			//log("DEBUG",stLogTitle, "#1 stDep: " + stDep );
             			
    					stDep = isEmpty(stDep)? stPostByDefaultDepartment : stDep;
    					stClass = isEmpty(stClass)? stPostByDefalultClass : stClass;
    					STLocation = isEmpty(STLocation)? stPostByDefaultLocation : STLocation;
    					//log("DEBUG",stLogTitle, "#2 stDep: " + stDep );
    					
    					var stDebitTmp = stDebit
    					var stCreditTmp = stCredit
    					var flAccrualAmount = arrBuf[ii].accrualAmount;
    					if(flAccrualAmount == 0){
    						continue;
    					}
    					
    					if(flAccrualAmount < 0 ){
    						stDebitTmp = stCredit;
    						stCreditTmp = stDebit;
    						flAccrualAmount = Math.abs(flAccrualAmount);
    					}
    					flRunningTotalAccrualAmt += parseFloat(flAccrualAmount);
    					
    					
        				//DEBIT
             			recJE.selectNewLineItem(FLD_LINE);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stDebitTmp)
             			recJE.setCurrentLineItemValue(FLD_LINE, 'debit', flAccrualAmount);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', arrBuf[ii].entity);
         
             			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
             			recJE.commitLineItem(FLD_LINE);
             			
        				//credit
             			recJE.selectNewLineItem(FLD_LINE);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'account', stCreditTmp);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'credit', flAccrualAmount);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'entity', arrBuf[ii].entity);
         
             			recJE.setCurrentLineItemValue(FLD_LINE, 'department', stDep);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'class', stClass);
             			recJE.setCurrentLineItemValue(FLD_LINE, 'location', STLocation);
             			recJE.commitLineItem(FLD_LINE);
             			
	         			intCurCount = recJE.getLineItemCount(FLD_LINE);

	         			if(intCurCount >= 1000){
		         			log('DEBUG', stLogTitle, "#1 " + intCurCount);
	            			var intJe = nlapiSubmitRecord(recJE, true, true);
	            			log('DEBUG', stLogTitle, "#1 intJe: " + intJe);
	            			arrJE.push(intJe);
	            			recJE = null;
	            			recJE = createNewJe(recJE);
	            			intCurCount = 0;
	         			}
        			}
         			
                    try{
                    	doYield();
                    }catch(e){
                    	log('debug',stLogTitle,e);
                    }
	    		}
	    	}
	    	
			if(!isEmpty(recJE)){
	 			var intCurCount = recJE.getLineItemCount(FLD_LINE);
	 			log('DEBUG', stLogTitle, "#3 " + intCurCount);
	 			if(intCurCount > 0){
	    			var intJe = nlapiSubmitRecord(recJE, true, true);
	    			arrJE.push(intJe);
	    			recJE = null;
	    			intCurCount = 0;
	 			}
	    		
			}
			
			//recAccrual.setFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG, "");
        	arrAccrualFld.push(FLD_ACCRUAL_GENERATE_ERROR_LOG);
        	arrAccrualVal.push("");
        	stJEError = '';
        	
			//recAccrual.setFieldValue(FLD_ACCRUAL_AMOUNT,flRunningTotalAccrualAmt);
        	arrAccrualFld.push(FLD_ACCRUAL_AMOUNT);
        	arrAccrualVal.push(flRunningTotalAccrualAmt);
			
		}catch(e){
			stIsGenerating = 'F';
			log('DEBUG', stLogTitle, e);
			//recAccrual.setFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG, e.toString());
	       	arrAccrualFld.push(FLD_ACCRUAL_GENERATE_ERROR_LOG);
        	arrAccrualVal.push(e.toString());
        	stJEError = e.toString();
        	
			try{
	            var records = {};
	            records['record'] = intAccru;
	            records['recordtype'] = REC_ACCRUAL;
	            var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, intAccru, "VIEW");
	            var stErrorSubject = "ERROR: In Generating JE For Accrual #" + intAccru;
	            var stErrorBody = e.toString() + '<br/><br/>Please Check this <a href="' + stcglsuburl +'">Accrual #'+ intAccru + ' </a>';
				nlapiSendEmail(stUserId, stUserId, stErrorSubject ,stErrorBody, null, null, records);
				//recAccrual.setFieldValue(FLD_ACCRUAL_STATUS, HC_ACCRUAL_STATUS.error);
		       	arrAccrualFld.push(FLD_ACCRUAL_STATUS);
	        	arrAccrualVal.push(HC_ACCRUAL_STATUS.error);
			}catch(e2){
				log('DEBUG', stLogTitle + " ERROR IN EMAIL SENDING", e2);
			}

		}
		
		if(!isEmpty(arrJE)){
			//recAccrual.setFieldValues(FLD_ACCRUAL_TRANSACTION, arrJE);
	       	arrAccrualFld.push(FLD_ACCRUAL_TRANSACTION);
        	arrAccrualVal.push(arrJE);
            try{
                var records = {};
                records['record'] = intAccru;
                records['recordtype'] = REC_ACCRUAL;

                var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, intAccru, "VIEW");
                var stcglurl = stcglsuburl;
                var stSubject = "Accrual JE Generation Completed for Accrual #${accrual.id}";
                var stMsg =  'Please click the link to view the <a href="${accrual.url}">Accrual #${accrual.id}</a>';
                
                stSubject = isEmpty(stEmailSubject)? stSubject : stEmailSubject;
                stMsg = isEmpty(stEmailBody)? stMsg : stEmailBody;
                                    
                var renderer = nlapiCreateTemplateRenderer();
                renderer.setTemplate(stMsg);
                recAccrual.setFieldValue("url", stcglurl);
                renderer.addRecord("accrual", recAccrual);
                stMsg = renderer.renderToString();
                
                vrenderer = nlapiCreateTemplateRenderer();
                renderer.setTemplate(stSubject);
                recAccrual.setFieldValue("url", stcglurl);
                renderer.addRecord("accrual", recAccrual);
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
			
		}else{
			if(isEmpty(stJEError)){//if(isEmpty(recAccrual.getFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
				try{
		            var records = {};
		            records['record'] = intAccru;
		            records['recordtype'] = REC_ACCRUAL;
		            var stcglsuburl = nlapiResolveURL("RECORD", REC_ACCRUAL, intAccru, "VIEW");
		            var stErrorSubject = "Accrual JE Not Generated for Accrual #" + intAccru;
		            var stErrorBody = 'No accrual journal entry was generated – might be no Rebate Transaction Details (RTDs) to process or zero (0.00) accrual amount of all the RTDs or accruals might have been processed previously.'; 
		            stErrorBody += '<br/><br/>Please click the link to view the <a href="' + stcglsuburl +'">Accrual #'+ intAccru + ' </a>';
					nlapiSendEmail(stUserId, stUserId, stErrorSubject ,stErrorBody, null, null, records);
					
				}catch(e2){
					log('DEBUG', stLogTitle + " ERROR IN EMAIL SENDING", e2);
				}
			}
		}

		if(isEmpty(stJEError)){//if(isEmpty(recAccrual.getFieldValue(FLD_ACCRUAL_GENERATE_ERROR_LOG))){
			//recAccrual.setFieldValue(FLD_ACCRUAL_STATUS, HC_ACCRUAL_STATUS.complete);

	       	arrAccrualFld.push(FLD_ACCRUAL_STATUS);
        	arrAccrualVal.push(HC_ACCRUAL_STATUS.complete);
		}
		//recAccrual.setFieldValue(FLD_ACCRUAL_ISGENERATE, stIsGenerating);
       	arrAccrualFld.push(FLD_ACCRUAL_ISGENERATE);
    	arrAccrualVal.push(stIsGenerating);
    	
    	//nlapiSubmitRecord(recAccrual);
    	nlapiSubmitField(REC_ACCRUAL, intAccru, arrAccrualFld, arrAccrualVal);
    	
    	arrAccrualFld = null;
    	arrAccrualVal = null;
    	recAccrual = null;
		doYield();
    } //END: for(var i = 0; i < arrAccruals.length; i++)
}

function rtdComponent(result){
	//result =  nlobjSearchResult;
	
	var stRa = result.getValue(FLD_CUSTRECORD_TRANS_AGREEMENT,null,"GROUP");
	var flAccruAmt = result.getValue(FLD_CUSTRECORD_ACCRUAL_AMO,null,"SUM");
	var stCustomer = result.getValue(FLD_REBATE_TRAN_DETAIL_CUSTOMER,null,"GROUP");
	var stVendor = result.getValue(FLD_REBATE_TRAN_DETAIL_VENDOR,null,"GROUP");
	var stCustomerTxt = result.getText(FLD_REBATE_TRAN_DETAIL_CUSTOMER,null,"GROUP");
	var stVendorTxt = result.getText(FLD_REBATE_TRAN_DETAIL_VENDOR,null,"GROUP");
	
	var stDept = result.getValue(FLD_REBATE_TRAN_DEPARTMENT, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');
	var stClass = result.getValue(FLD_REBATE_TRAN_CLASS, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');
	var stLoc = result.getValue(FLD_REBATE_TRAN_LOCATION, FLD_REBATE_TRAN_DETAIL_REBATE_TRANSACTION, 'GROUP');

	
	var entity = stVendor;
	var entityName = stVendorTxt;
	if(isEmpty(entity)){
		entity = stCustomer;
		entityName = stCustomerTxt;
	}

	
	flAccruAmt = isEmpty(flAccruAmt)? 0 : round(flAccruAmt,2);
	
	return {
		ra: stRa,
		accrualAmount: flAccruAmt,
		vendor: stVendor,
		customer: stCustomer,
		entity: entity,
		entityName: entityName,
		department: stDept,
		class: stClass,
		location: stLoc
	}
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