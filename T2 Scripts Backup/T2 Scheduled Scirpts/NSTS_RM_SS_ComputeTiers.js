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
 * 2.0       17 May 2017     roxreyes      Initial version.
 * 
 */

var HC_REC_FAILED = 0;
var HC_REC_WITH_ERROR = [];
var flTotal = 0.0;
var arrDoCalcData = null;
var arrSearchResults = 1;

function computeTier_scheduled(type) {
    var context = nlapiGetContext();
    var arrCGLId = context.getSetting("script", 'custscript_nsts_rm_cgl_id'); 
    var objOption1 = context.getSetting("script", 'custscript_nsts_rm_cgl_tier_options1'); 
    /**var stTest = context.getSetting("script", 'custscript1'); 
    if(stTest){
    	if(stTest != 'true')
    		return false;
    }else{
    	return false;
    }*/
    arrCGLId = parseStringToJson(arrCGLId, []);
    objOption1 = parseStringToJson(objOption1, {});
    
    
    
    if(objOption1.isUpdateRTD == true && !objOption1.isDoCalc){
        log("debug", "OBJOPTION1.ISUPDATERTD", "START:" + parseJsonToString(objOption1, ""));
		var getDumpingFilesFromJasonString = function(arrFileId){	
			//log("DEBUG", 'getDumpingFilesFromJasonString', "GET DUMP FILE");
			if(!isEmpty(arrFileId)){
				
				var arrRetVal = [];
				var objFl = null;
				//doYield(3000);
				for(var i in arrFileId){
					objFl = nlapiLoadFile(arrFileId[i]);
					arrRetVal.push(objFl.getValue());
					objFl = null;
					
				}
				//log("DEBUG", 'getDumpingFilesFromJasonString', "DONE");
				return arrRetVal.join("");
			}
			//log("DEBUG", 'getDumpingFilesFromJasonString', "DONE");
			return null;
		}
		
		var objData = parseStringToJson(getDumpingFilesFromJasonString(objOption1.arrFileId), {});
		getDumpingFilesFromJasonString = null;
		executeTierCalculationPerRTD(objData, objOption1);
		
        log("debug", "OBJOPTION1.ISUPDATERTD", "END");
		return;
    }
    
    if(objOption1.deleteReferenceFile == true){
    	finalizeViewClaim(objOption1);
    	finalizeViewClaim = null;
    	cleanupDumpingFileCache();
		return;
    }
    if(objOption1.isDoCalc)
    	doCalculation(null,context,objOption1);
    else if(!objOption1.isUpdateRTD  || objOption1.isUpdateRTD == false)
    	processTierCalculation(arrCGLId,context);
}

function processTierCalculation(arrCGLId,context){
	var bBypass = false;
    try{
        var stCGLName = '';
        var stCGLURL  = '';
        var stDetSearchURL = '';
        
        if(!isEmpty(arrCGLId[0])){
        	nlapiLogExecution('debug', 'arrCGLId[0]', arrCGLId[0]);
            var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, arrCGLId[0]);
            stCGLName  = recCGL.getFieldValue('name');
            stCGLURL   = nlapiResolveURL('RECORD', REC_CLAIM_GENERATION_LOG, arrCGLId[0]);
            bBypass = recCGL.getFieldValue(FLD_CLAIM_GEN_BYPASS_CLAIM);
            
            stDetSearchURL = nlapiResolveURL('TASKLINK', 'LIST_SEARCHRESULTS');
            if (bBypass != 'T')
            	doCalc_sched(recCGL, context);
            
            if (bBypass == 'T') {
            	arUpdateFields = [FLD_CLAIM_GEN_IS_CLAIM_DET_UPDATED,
                	FLD_CLAIM_GEN_CLAIM_DET_UPDATED_BY,
                	FLD_CLAIM_GEN_CLAIM_DET_UPDATED_ON,
     			   	FLD_CLAIM_GEN_IS_CLAIM_SUMM_REVIEWED,
     			   	FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_BY,
     			   	FLD_CLAIM_GEN_CLAIM_SUMM_REVIEWED_ON,
     			   	FLD_CLAIM_GEN_TOTAL_CLAIM];
                arFieldValues = ['T',
                	context.getUser(),
                	nlapiDateToString(new Date(), 'datetimetz'),
                	'T',
                	context.getUser(),
                	nlapiDateToString(new Date(), 'datetimetz'),
                	flTotal];
                
                
            	arUpdateFields = [FLD_CLAIM_GEN_GENERATE_CLAIM];
                arFieldValues = ['T'];
                
                nlapiSubmitField(REC_CLAIM_GENERATION_LOG, arrCGLId[0], arUpdateFields, arFieldValues);
                arUpdateFields = null;
                arFieldValues = null;
            }//if (bBypass == 'T')
        }
        
    }catch(e){
    	if (bBypass = 'T') nlapiSubmitField(REC_CLAIM_GENERATION_LOG, arrCGLId[0], FLD_CLAIM_GEN_BYPASS_CLAIM, 'F');
        nlapiLogExecution('ERROR', 'Process Error[computeTier_scheduled]', e);
        if (!isEmpty(context.getEmail())){
            nlapiSendEmail(
               context.getUser(),
               context.getEmail(),
               'Claim Calculation has encountered a problem for ' + stCGLName,
               'The Claim Calculation has encountered a problem.<br>Click here to view '+stCGLName+': https://system.na1.netsuite.com' + stCGLURL);
       }  
    }//catch(e)
}

function doCalc_sched(recCGL, context){
    //STEP #1: Load the RTD search
    var arrRTD = []
    var search = nlapiLoadSearch(null, recCGL.getFieldValue('custrecord_nsts_rm_cgl_detail_search'));
    search.addFilter(new nlobjSearchFilter('custrecord_nsts_rm_is_tiered_ra', 'custrecord_nsts_rm_rebatetran_agreement', "is", "T"));
    search.addColumn(new nlobjSearchColumn('custrecord_nsts_rm_calc_cost_basis', 'custrecord_nsts_rm_rebatetran_agreementd'));
    search.addColumn(new nlobjSearchColumn('custrecord_nsts_rm_tier_type', 'custrecord_nsts_rm_rebatetran_agreement'));
    search.addColumn(new nlobjSearchColumn('internalid').setSort());
    //search.setIsPublic(true);
    //var searchId =search.saveSearch('MARGINAL SEARCH', 'customsearch_search12345');
    //nlapiLogExecution('debug','ret',searchId);
    //return;
    var objSearchRTD = getAllResultsSearchObject(search);
    if(!objSearchRTD){
    	objSearchRTD = arrSearchResults;
    	arrSearchResults = null;
    }
    getAllResultsSearchObject = null;
    var res = objSearchRTD.results //search.runSearch().getResults(0,1000);
    arrDoCalcData = {};
    
    if(!isEmpty(res)){
        var stTierType = res[0].getValue('custrecord_nsts_rm_tier_type', 'custrecord_nsts_rm_rebatetran_agreement');
        if(stTierType == HC_TIER_TYPE.Marginal)
        	arrDoCalcData = calculateMarginalRM({arrRTD: res});
        	
        else if(stTierType == HC_TIER_TYPE.Linear)
        	arrDoCalcData = calculateRM({arrRTD: res});

        res = null;
        calculateMarginalRM = null;
        calculateRM = null
        calculateRM = null;
        objSearchRTD = null;
        search = null;
    	var arrFileId = createDumpingFilesFromJasonString(parseJsonToString(arrDoCalcData.objRADByEntity, "{}"));
    	createDumpingFilesFromJasonString = null;
    	
        //doCalculation(data.objRADByEntity, stTierType, context);
        doCalculation(arrDoCalcData.objRADByEntity,context,{
        	 tierType: stTierType,
        	 arrFileId: arrFileId,
        	 cglId: recCGL.getId()
        });
    }
    
//    var data = calculateRM({arrRTD: res});
//    nlapiLogExecution('debug', 'res', res.length);
}
function doCalculation(objData,context,options){


	var stLastEntity = null
	if(!options.isDoCalc){
		for(stLastEntity in objData);
		var stUserId = context.getUser();
		var stEmail = context.getEmail();
		context = null;

	    var startTime = new Date().getTime(); 
	    var timeElapsed =  new Date().getTime(); 
	    var endTime = null;
	    var intMaxTierMatrixIndex = 0;

		var intGovernanceThreshold = 1000;
		var i =0;
		var intCust = 0;
		var intGetRemainingUsage  = 0;
		nlapiLogExecution('error', 'options',JSON.stringify(options));
		var intLastIndex = 0;
		var intLastCust = 0;
		
		intLastCust = Object.keys(objData).length;
		nlapiLogExecution('error', 'Object.keys(objData[intCust]).length',intLastCust);
		var intCustCtr = 0;
		
		runSchedForTierCalcUpdateRTD({
			isUpdateRTD: true,
			isDoCalc:true, 
			arrFileId:options.arrFileId,
			entity: intCust,
			intLastCust: intLastCust,
			lastEntity: stLastEntity,
			user: stUserId,
			userEmail: stEmail,
			tierType: options.tierType,
			cglId: options.cglId,		
		});
		
	}else{
		var getDumpingFilesFromJasonString = function(arrFileId){	
			if(!isEmpty(arrFileId)){       					
				var arrRetVal = [];
				var objFl = null;
				for(var a in arrFileId){
					objFl = nlapiLoadFile(arrFileId[a]);
					arrRetVal.push(objFl.getValue());
					objFl = null;
					
				}
				return arrRetVal.join("");
			}
			return null;
		}

		var objData = parseStringToJson(getDumpingFilesFromJasonString(options.arrFileId), {});
		getDumpingFilesFromJasonString = null;

	    var startTime = new Date().getTime(); 
	    var timeElapsed =  new Date().getTime(); 
	    var endTime = null;
	    var intMaxTierMatrixIndex = 0;

		var intGovernanceThreshold = 1000;
		var i =0;
		var intCust = 0;
		var intGetRemainingUsage  = 0;
		nlapiLogExecution('error', 'options',JSON.stringify(options));
		var intLastIndex = 0;
		var intLastCust = 0;
		
		intLastCust = Object.keys(objData).length;
		nlapiLogExecution('error', 'Object.keys(objData[intCust]).length',intLastCust);
		var intCustCtr = 0;
		
	    for(intCust in objData){
	    	
	        if(!isEmpty(objData[intCust])){

	        	intMaxTierMatrixIndex = 0
	        	for (i in objData[intCust].tierMatrix){
	        		intMaxTierMatrixIndex = i;
	        	}
	        	nlapiLogExecution('error', 'intCust',intCust);
	        	if(intCustCtr == intLastCust -1){

	        		intLastIndex = intMaxTierMatrixIndex;
	        		nlapiLogExecution('error', 'last intMaxTierMatrixIndex',intLastIndex);
	        	}

	        	intCustCtr++;
	        	i=0;
	        	nlapiLogExecution('error', 'objData[intCust].tierMatrix length',objData[intCust].tierMatrix.length);
	        	nlapiLogExecution('error', 'objData[intCust].tierMatrix ',JSON.stringify(objData[intCust].tierMatrix));
	        	for (i in objData[intCust].tierMatrix){
	                var objContext = nlapiGetContext();
	        	    intGetRemainingUsage = objContext.getRemainingUsage();
	        		if (intGetRemainingUsage < intGovernanceThreshold)
	        	    {
	        			nlapiLogExecution('error', 'ss before yield executed',objData);

	        			//EMPTY DATA
	          			objData = null;
	          			intGetRemainingUsage = null;
	            	    objContext = null;
	         			nlapiLogExecution('error', 'ss before yield executed empty objData',objData);
	        			var objState = nlapiYieldScript();
	                    nlapiLogExecution("ERROR", "yield status"," exiting: Reason = " + objState.status +": "+ objState.reason + " / Size = " + objState.size);
	                    objState = null;
	         			var getDumpingFilesFromJasonString = function(arrFileId){	
	        				if(!isEmpty(arrFileId)){       					
	        					var arrRetVal = [];
	        					var objFl = null;
	        					for(var a in arrFileId){
	        						objFl = nlapiLoadFile(arrFileId[a]);
	        						arrRetVal.push(objFl.getValue());
	        						objFl = null;
	        						
	        					}
	        					return arrRetVal.join("");
	        				}
	        				return null;
	        			}

	        			nlapiLogExecution('error', 'afterYield start',objData);
	        			objData = parseStringToJson(getDumpingFilesFromJasonString(options.arrFileId), {});
	        			getDumpingFilesFromJasonString = null;
	        			nlapiLogExecution('error', 'afterYield end',objData);
	        			 
	        		}
	        		endTime =  new Date().getTime(); 
	        		timeElapsed = (endTime*0.001) - (startTime*0.001);
	            	if (timeElapsed > 3500){
	            		try{
	            		 objData = null;
	             	    arrDoCalcData = null;
	            		 nlapiLogExecution('error', 'to yield timeElapsed',timeElapsed);
	            		  state = nlapiYieldScript();
	            		 startTime = new Date().getTime();           			
	            		}catch(err){

	               		 nlapiLogExecution('error', 'to yield timeElapsed err',err.toString());
	            		}
	            		var getDumpingFilesFromJasonString = function(arrFileId){	
	        				if(!isEmpty(arrFileId)){
	        					
	        					var arrRetVal = [];
	        					var objFl = null;
	        					for(var i in arrFileId){
	        						objFl = nlapiLoadFile(arrFileId[i]);
	        						arrRetVal.push(objFl.getValue());
	        						objFl = null;
	        						
	        					}
	        					return arrRetVal.join("");
	        				}
	        				return null;
	        			}
	        			
	        			objData = parseStringToJson(getDumpingFilesFromJasonString(options.arrFileId), {});
	        			getDumpingFilesFromJasonString = null;
	            	}
	            	
	            	runSchedForTierCalcUpdateRTD({
	            		isUpdateRTD: true,
	            		arrFileId:options.arrFileId,
	            		entity: intCust,
	            		lastEntity: options.lastEntity,
	            		user: options.user,
	            		userEmail: options.userEmail,
	            		tierType: options.tierType,
	            		cglId: options.cglId,
	            		tierMatrixIndex: i,
	            		maxTierMatrixIndex: intMaxTierMatrixIndex,
	            		lastIndex :intLastIndex ? intLastIndex: null,
	            		
	            	});
	            }
	        }
	    }
	}

}

function executeTierCalculationPerRTD(objData,options){
	var intCust = options.entity;
	var tierType = options.tierType;
	var i = options.tierMatrixIndex;
    
    var stRTDCostBasis = objData[intCust].tierMatrix[i].costBasis;

    var startTime = new Date().getTime(); 
    var endTime =  new Date().getTime(); 
    var timeElapsed =  new Date().getTime(); 
    nlapiLogExecution('error',' executeTierCalculationPerRTD startTime',startTime);
    nlapiLogExecution('error',' executeTierCalculationPerRTD len',objData[intCust].tierMatrix[i].arrRelatedRTD.length);
    if(!isEmpty(objData[intCust].tierMatrix[i].arrRelatedRTD)){
        for (var iRTD = 0;iRTD < objData[intCust].tierMatrix[i].arrRelatedRTD.length; iRTD++){
            try{
            	endTime = new Date().getTime();

            	timeElapsed = (endTime*0.001) - (startTime*0.001);
        	    nlapiLogExecution('error','i: '+objData[intCust].tierMatrix[i].id+' rtd: '+objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD]+' : executeTierCalculationPerRTD timeElapsed:'+iRTD,timeElapsed);
            	if (timeElapsed > 3200){
            	    nlapiLogExecution('error','will yield ',timeElapsed);
            		 var state = nlapiYieldScript();
            		 startTime = new Date().getTime(); 
            	}
            	doYield(1000, {
            		beforeYield: function(){
            			objData = null;
            			//log("DEBUG", "BEFORE YIELD", parseJsonToString(objData,""));
            		},
            		afterYield: function(){
            			/*var objFl =  nlapiLoadFile(intFl);
            			objData = parseStringToJson(objFl.getValue(), {});*/
            			/**
            			 * get the json string from dumping files
            			 * @param arrFileId
            			 * @returns json string 
            			 */
            			var getDumpingFilesFromJasonString = function(arrFileId){	
            				//log("DEBUG", 'getDumpingFilesFromJasonString', "GET DUMP FILE");
            				if(!isEmpty(arrFileId)){
            					
            					var arrRetVal = [];
            					var objFl = null;
            					//doYield(3000);
            					for(var i in arrFileId){
            						objFl = nlapiLoadFile(arrFileId[i]);
            						arrRetVal.push(objFl.getValue());
            						objFl = null;
            						
            					}
            					//log("DEBUG", 'getDumpingFilesFromJasonString', "DONE");
            					return arrRetVal.join("");
            				}
            				//log("DEBUG", 'getDumpingFilesFromJasonString', "DONE");
            				return null;
            			}
            			
            			objData = parseStringToJson(getDumpingFilesFromJasonString(options.arrFileId), {});
            			getDumpingFilesFromJasonString = null;
            			log("DEBUG", "AFTER YIELD", parseJsonToString(objData,""));
            		}
            	});
            	
                //var intRTD = arrRTD[iRTD];
                var objLkFld =  nlapiLookupField("customrecord_nsts_rm_transaction_details", objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD], 
                        ['custrecord_nsts_rm_item_cost',
                         'custrecord_nsts_rm_td_item_qty']);
                
                
                //nlapiLogExecution('DEBUG', 'POC objLkFld',JSON.stringify(objLkFld) + '-' + stRTDCostBasis + ':'+ HC_COST_BASIS.Line_Amount);
                
                var flItemCost = parseFloat(objLkFld.custrecord_nsts_rm_item_cost);
                var flAmt = objLkFld.custrecord_nsts_rm_item_cost;
                var flqty = objLkFld.custrecord_nsts_rm_td_item_qty;
                flAmt = parseFloat(flAmt);
                flqty = parseFloat(flqty);
                var fields = [], values = [];
                
                if(stRTDCostBasis == HC_COST_BASIS.Line_Amount)
                    flqty = (flqty < 0) ? -1 : 1;
                
                if(tierType == HC_TIER_TYPE.Linear){
                    var flTotalRebateAmt = (stRTDCostBasis == HC_COST_BASIS.Line_Amount) ? (flAmt * objData[intCust].tierMatrix[i].percentage) * flqty : (flAmt * flqty) * objData[intCust].tierMatrix[i].percentage;
                    var flRebateAmount = (stRTDCostBasis == HC_COST_BASIS.Line_Amount) ? (flAmt * objData[intCust].tierMatrix[i].percentage) * flqty : flAmt * objData[intCust].tierMatrix[i].percentage;
                    flTotal += flTotalRebateAmt;
                    
                    fields = [
                                  'custrecord_nsts_rm_applied_tier',
                                  'custrecord_nsts_rm_tier_percentage',
                                  'custrecord_nsts_rm_applied_amount',
                                  'custrecord_nsts_rm_td_amount',
                                  'custrecord_nsts_rm_td_totalamt'];
                    values = [
                                objData[intCust].tierMatrix[i].id,
                                (objData[intCust].tierMatrix[i].percentage*100) + '%',
                                objData[intCust].tierMatrix[i].rebateItemCost * objData[intCust].tierMatrix[i].percentage,
                                parseFloat(flRebateAmount.toFixed(2)),
                                parseFloat(flTotalRebateAmt.toFixed(2))//(flAmt * flqty) * objTM.percentage,
                                ];
                }else{
                    var flTotalRebateAmt = (flqty < 0 && parseFloat(objData[intCust].tierMatrix[i].rebTotAmount) >= 0) ? parseFloat(objData[intCust].tierMatrix[i].rebTotAmount) * -1 : objData[intCust].tierMatrix[i].rebTotAmount;
                    flTotal += flTotalRebateAmt;
                    
                    fields = [
                        'custrecord_nsts_rm_td_totalamt',
                        'custrecord_nsts_rm_td_amount',
                        'custrecord_nsts_rm_applied_tier',
                        'custrecord_nsts_rm_tier_percentage'
                    ];
                    
                    values = [
                        parseFloat(flTotalRebateAmt.toFixed(2)),
                        parseFloat(flTotalRebateAmt.toFixed(2)),
                        objData[intCust].tierMatrix[i].id,
                        objData[intCust].tierMatrix[i].percentage,
                    ];
                }

                nlapiSubmitField('customrecord_nsts_rm_transaction_details', objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD], fields, values);
                
                //Max Usage override for inner loop consideration
                fields = null;
                values = null;
                objLkFld = null;

            }catch(error){
                if (error.getDetails != undefined) {
                    HC_REC_FAILED++;
                    HC_REC_WITH_ERROR.push('<b>RTD id:</b> ' + objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD]);
                    nlapiLogExecution('ERROR', 'Process Error', error);
                } 
            }
        }//for (var iRTD = 0;iRTD < objData[intCust].tierMatrix[i].arrRelatedRTD.length; iRTD++){
    }//if(!isEmpty(objData[intCust].tierMatrix[i].arrRelatedRTD)){
    
    nlapiLogExecution('DEBUG', 'executeTierCalculationPerRTD', "options.maxTierMatrixIndex: " + options.maxTierMatrixIndex + " == i:" + i);
    if(options.maxTierMatrixIndex == i){
    	 nlapiLogExecution('DEBUG', 'last index before delete reference',options.lastIndex);
    	objData = null;
    	runSchedForTierCalcUpdateRTD({
    		deleteReferenceFile: true,
    		arrFileId: options.arrFileId,
    		entity: intCust,
    		user: options.user,
    		userEmail: options.userEmail,
      		cglId: options.cglId,
      		lastIndex: options.lastIndex,
      		maxTierMatrixIndex: options.maxTierMatrixIndex
    	});
    }

}

function finalizeViewClaim(options){
	log("debug", "OBJOPTION1.DELETEREFERENCEFILE", "START:" + parseJsonToString(options, ""));
	//deleteDumpingFiles(options.arrFileId);

	if (!isEmpty(options.userEmail)){
	    var stCGLName = '';
		var stCGLURL  = '';
		var stDetSearchURL = '';
		var stClaimDetSearch = '';

		var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, options.cglId);
		stCGLName  = recCGL.getFieldValue('name');
		stCGLURL   = nlapiResolveURL('RECORD', REC_CLAIM_GENERATION_LOG, options.cglId);
		stClaimDetSearch = recCGL.getFieldValue('custrecord_nsts_rm_cgl_detail_search');

		//var stEmailBody = 'The Claim Calculation has been completed.<br>Click here to view '+stCGLName+': https://system.na1.netsuite.com' + stCGLURL;
		var stEmailBody = 'The Claim Calculation has been completed.<br>Click here to view <a href = "'+stCGLURL+'">'+stCGLName+'</a>';

		if(!isEmpty(stClaimDetSearch))
		    stEmailBody += '<br>Click here to view the <a href="/app/common/search/searchresults.nl?searchid='+stClaimDetSearch+'">Claim Details</a>';
		if(!isEmpty(HC_REC_WITH_ERROR)){
		    stEmailBody += '<br><br>There are ' + HC_REC_FAILED +' Rebate Transaction Detail(s) that were not updated due to error:<br>'
		+ (HC_REC_WITH_ERROR.toString()).replace(/,/g,'<br>');
		}


		doCalc_sched = null;
		doYield();
		var tranrecord 					= [];
		tranrecord['entity'] 			= options.user;
		
		nlapiLogExecution('error', 'finalizeview claim',JSON.stringify(options));
		if(options.lastIndex == options.maxTierMatrixIndex){

			nlapiLogExecution('error', 'finalizeview send email','');
			nlapiSendEmail(
				options.user,
				options.userEmail,
				'Claim Calculation is complete for ' + stCGLName,
			        	stEmailBody,
			        	null,
			        	null,
			        	tranrecord
			        	);
		   }
		}
	log("debug", "OBJOPTION1.DELETEREFERENCEFILE", "END");   
}


/**
 * Split a string into chunks of the given size
 * @param  {String} str is the String to split
 * @param  {Number} size is the size you of the cuts
 * @return {Array} an Array with the strings
 */
function splitString (str, size) {
	log("DEBUG", 'splitString', "SPLITING STRING")
	str = isEmpty(str)? "": str;
	
	
	//var re = new RegExp('.{1,' + size + '}', 'g');
	
	var chunkArr = [];
	var leftStr = str;
	do {
		chunkArr.push(leftStr.substring(0, size));
		leftStr = leftStr.substring(size, leftStr.length);
	} while (leftStr.length > 0);
	  
	leftStr = null;
	str = null;
	log("DEBUG", 'splitString', "DONE")
	return chunkArr;
}

/**
 * raw JSON string
 * @param strjson 
 * @returns array of file id
 */
function createDumpingFilesFromJasonString(strjson){
	//5242880 char is 5 MB
	log("DEBUG", 'createDumpingFilesFromJasonString', "CREATING DUMP FILE");
	var intCharLen = 10485760;
	var arrStrChuck = splitString(strjson,intCharLen);
	splitString = null;
	if(!isEmpty(arrStrChuck)){
		var arrRetVal = [];
		var fl = null;
		for(var i in arrStrChuck){
			//doYield();
			fl = nlapiCreateFile("RM_BUFF_DATA_" + Date(), "PLAINTEXT", arrStrChuck[i]);
			fl.setFolder(-15); //-15: SuiteScripts folder
			var intFl = nlapiSubmitFile(fl);
			fl = null;
			arrStrChuck[i] = null
			arrRetVal.push(intFl);
		}
		
		arrStrChuck = null;
		strjson = null;
		//log("DEBUG", 'createDumpingFilesFromJasonString', "DONE");
		return arrRetVal;
	}
	//log("DEBUG", 'createDumpingFilesFromJasonString', "DONE");
	return null;
	
}

function deleteDumpingFiles(arrFileId){
	if(!isEmpty(arrFileId)){
		var arrRetVal = [];
		for(var i in arrFileId){
			try{
				doYield();
				nlapiDeleteFile(arrFileId[i]);
				arrFileId[i] = null;
			}catch(e){
				
			}
		}
	}
	
}

function cleanupDumpingFileCache(){
	log('DEBUG','CLEANUPDUMPINGFILECACHE','START');
	try{

		doYield();
		var arrFiles = nlapiSearchRecord(null, 'customsearch_nsts_rm_file_cache_cleanup');
		if(!isEmpty(arrFiles)){
			for(var i in arrFiles){
				try{
					doYield();
					nlapiDeleteFile(arrFiles[i].getId());
					log('ERROR', 'CLEANUPDUMPINGFILECACHE', "Deleted Cache File:" + arrFiles[i].getId());
				}catch(e){
					log('ERROR', 'ERROR IN CLEANUPDUMPINGFILECACHE', e);
				}
			}
		}
	}catch(ee){
		log('ERROR', 'ERROR IN FUNC CLEANUPDUMPINGFILECACHE', ee)
	}
	log('DEBUG','CLEANUPDUMPINGFILECACHE','END');
};

function runSchedForTierCalcUpdateRTD(options){
	
    log("audit", "RUNSCHEDFORTIERCALCUPDATERTD", "START SCHEDULING" + parseJsonToString(options, "???"));
    var arrParam = [];

    arrParam['custscript_nsts_rm_cgl_tier_options1'] = parseJsonToString(options, "");
    var stScheduleStatus = invokeScheduleScript('customscript_nsts_rm_compute_tier_ss',null,arrParam);
    log("audit", "RUNSCHEDFORTIERCALCUPDATERTD", "END SCHEDULING STSCHEDULESTATUS:" + stScheduleStatus);
    options= null;
}