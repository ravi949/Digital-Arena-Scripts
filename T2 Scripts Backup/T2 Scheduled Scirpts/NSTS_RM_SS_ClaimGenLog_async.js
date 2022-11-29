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

	var flTotal = 0;
function doCalc(recCGL, context, bReviewed,stTotalClaim){
    //STEP #1: Load the RTD search
    var arrRTD = []
    var bTiered = recCGL.getFieldValue('custrecord_nsts_rm_cgl_istiered');
    if(!bTiered)
    	bTiered == '';

    if(!stTotalClaim)
		stTotalClaim = '0';
	if(stTotalClaim){
		stTotalClaim = parseFloat(stTotalClaim);
	}
    if(bTiered == 'T' && !stTotalClaim){
    	nlapiLogExecution('debug', 'CALCULATION OF RTDs','');
        var search = nlapiLoadSearch(null, recCGL.getFieldValue('custrecord_nsts_rm_cgl_detail_search'));
        search.addFilter(new nlobjSearchFilter('custrecord_nsts_rm_is_tiered_ra', 'custrecord_nsts_rm_rebatetran_agreement', "is", "T"));
        search.addColumn(new nlobjSearchColumn('custrecord_nsts_rm_calc_cost_basis', 'custrecord_nsts_rm_rebatetran_agreementd'));
        search.addColumn(new nlobjSearchColumn('custrecord_nsts_rm_tier_type', 'custrecord_nsts_rm_rebatetran_agreement'));
        search.addColumn(new nlobjSearchColumn('internalid').setSort());
       
        var objSearchRTD = getAllResultsSearchObject(search);
        if(!objSearchRTD){
        	objSearchRTD = arrSearchResults;
        	arrSearchResults = null;
        }
       // getAllResultsSearchObject = null;
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
        	
        }
    	//executeTierCalculationPerRTD(arrDoCalcData)
    	
    	executeTierCalculationPerRTD(arrDoCalcData.objRADByEntity,context,{
            	 tierType: stTierType,
            	 cglId: recCGL.getId(),
            	 reviewed: bReviewed
        });

    }
    try{

		
		if(bTiered == 'T'){
			try{
				var objClaimDetSearch = nlapiLoadSearch(null, recCGL.getFieldValue('custrecord_nsts_rm_cgl_detail_search'))
			    
			    var objSummaryResults = getAllResults(REC_REBATE_TRAN_DETAIL, null, objClaimDetSearch.getFilters(), 
		                [new nlobjSearchColumn(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, null, 'sum')]);

		        if (!isEmpty(objSummaryResults)){
		            var results = objSummaryResults.results;
		            if(results){

			            stTotalClaim = results[0].getValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, null, 'sum');
			            nlapiLogExecution('debug', 'update total claim amt','stTotalClaim: '+stTotalClaim);
			            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, recCGL.getId(), [FLD_CLAIM_GEN_TOTAL_CLAIM], [stTotalClaim]);
		            }
		        }
			}catch(err){
				nlapiLogExecution('error', 'update total claim amt',err.toString());
			}
	        
		}
        
    }catch(err){
    	nlapiLogExecution('error','err in update total claim',err.toString());
    }

}


function executeTierCalculationPerRTD(objData,context,options){
	var stUserId = null;
	var startTime = null;
	var stEmail;
	for(stLastEntity in objData){
		stUserId = context.getUser();
		stEmail = context.getEmail();
	}
	context = null;
	flTotal = 0;
	var tierType = options.tierType;
    for(intCust in objData){
		if(!isEmpty(objData[intCust])){
			for (i in objData[intCust].tierMatrix){
				for (var iRTD = 0;iRTD < objData[intCust].tierMatrix[i].arrRelatedRTD.length; iRTD++){
					try{

					    var stRTDCostBasis = objData[intCust].tierMatrix[i].costBasis;
						endTime = new Date().getTime();

						timeElapsed = (endTime*0.001) - (startTime*0.001);
						//nlapiLogExecution('error','i: '+objData[intCust].tierMatrix[i].id+' rtd: '+objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD]+' : executeTierCalculationPerRTD timeElapsed:'+iRTD,timeElapsed);
						if (timeElapsed > 3200){
							nlapiLogExecution('audit','will yield ',timeElapsed);
							 var state = nlapiYieldScript();
							 startTime = new Date().getTime(); 
						}
						doYield(1000,null);
						
						//var intRTD = arrRTD[iRTD];
						var objLkFld =  nlapiLookupField("customrecord_nsts_rm_transaction_details", objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD], 
								['custrecord_nsts_rm_item_cost',
								 'custrecord_nsts_rm_td_item_qty',
								 FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT]);
						
						
						var flOrigRebAmt = (objLkFld[FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT]);
						if(flOrigRebAmt)
							flOrigRebAmt = parseFloat(flOrigRebAmt);
						
						
						
						
						if(options.reviewed == 'T' ){
							flTotal += flOrigRebAmt;
							nlapiLogExecution('audit','will return','');
							
						}
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
							var flTotalRebateAmt 	= (stRTDCostBasis == HC_COST_BASIS.Line_Amount) ? (flAmt * objData[intCust].tierMatrix[i].percentage) * flqty : (flAmt * flqty) * objData[intCust].tierMatrix[i].percentage;
							var flRebateAmount 		= (stRTDCostBasis == HC_COST_BASIS.Line_Amount) ? (flAmt * objData[intCust].tierMatrix[i].percentage) * flqty : flAmt * objData[intCust].tierMatrix[i].percentage;
							if(options.reviewed != 'T' )
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
										round((objData[intCust].tierMatrix[i].rebateItemCost * objData[intCust].tierMatrix[i].percentage), 2),
										parseFloat(flRebateAmount.toFixed(2)),
										parseFloat(flTotalRebateAmt.toFixed(2))//(flAmt * flqty) * objTM.percentage,
										];
						}else{
							var flTotalRebateAmt = (flqty < 0 && parseFloat(objData[intCust].tierMatrix[i].rebTotAmount) >= 0) ? parseFloat(objData[intCust].tierMatrix[i].rebTotAmount) * -1 : objData[intCust].tierMatrix[i].rebTotAmount;
							if(options.reviewed != 'T' )
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
						
						//update only if no total rebate amt
						if(options.reviewed != 'T' )
							nlapiSubmitField('customrecord_nsts_rm_transaction_details', objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD], fields, values);
						
						nlapiLogExecution('audit', 'updated rtd: '+objData[intCust].tierMatrix[i].arrRelatedRTD[iRTD],JSON.stringify(fields)+ ' : '+ JSON.stringify(values));
						//Max Usage override for inner loop consideration
						fields = null;
						values = null;
						objLkFld = null;

					}catch(error){
						nlapiLogExecution('ERROR', 'Process Error', error.toString());
					}
				}
			}
		}
	}

}
function scheduled_cgl_Generation(type) {
    var stLogTitle = 'SCHEDULED_CGL_GENERATION';
    var context = nlapiGetContext();
    var arrCGLId = context.getSetting("script", PARAM_CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_IDS); 
    var stUserId = context.getSetting("script", CUSTSCRIPT_NSTS_RM_CLAIMGEN_CGL_USER);
    var obj = parseStringToJson(context.getSetting("script", 'custscript_nsts_rm_claimgen_cgl_options1'), null);
    
    
    log("debug", stLogTitle,"arrCGLId : " + arrCGLId);
    arrCGLId = parseStringToJson(arrCGLId, []);
    
    log("debug", stLogTitle,"scheduled_cgl_Generation : " + parseJsonToString(obj, ""));

    if(!isEmpty(obj)){
    	/**
    	 * obj.isUpdateRTD
    	 * obj.searchDetail
    	 * obj.tranIdToAttach
    	 * obj.arrFilters {fieldId,join,operator,value}
    	 */
    	
    	if(obj.isUpdateRTD == true){
    		log("DEBUG", "UPDATING RTDS!", "START")
    		var arrFilters = null;
    		if(!isEmpty(obj.arrFilters)){
    			arrFilters = [];
    			for(var intFil in obj.arrFilters){
    				log("debug", stLogTitle,"arrCGLId : " + parseJsonToString(obj.arrFilters[intFil], "{}"));
    				
    				arrFilters.push(new nlobjSearchFilter(
    						obj.arrFilters[intFil].fieldId,
    						null,
    						obj.arrFilters[intFil].operator,
    						obj.arrFilters[intFil].value));
    			}
    		}
    		
			updateRTD(obj.searchDetail, obj.tranIdToAttach ,arrFilters)
			
			
			var intCGLId = obj.cglId;
			var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, intCGLId)
			
			var objCGLInfo  = parseStringToJson(recCGL.getFieldValue('custrecord_nsts_rm_cgl_updt_rtd_per_clm'),null);

			if(!isEmpty(objCGLInfo) && !isEmpty(objCGLInfo.updatedRTD)){


				objCGLInfo.updatedRTD[obj.tranIdToAttach] = true;

				log("audit", "obj.tranIdToAttach", "obj.tranIdToAttach:" + obj.tranIdToAttach+ ' :'+parseJsonToString(objCGLInfo, ''));
				//recCGL.setFieldValue('custrecord_nsts_rm_cgl_updt_rtd_per_clm', parseJsonToString(objCGLInfo, ''));
				//nlapiSubmitRecord(recCGL);
				nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, 'custrecord_nsts_rm_cgl_updt_rtd_per_clm', parseJsonToString(objCGLInfo, ''))
						
				var bIsCompete = true;
				for(var intTran in objCGLInfo.updatedRTD){
					if(objCGLInfo.updatedRTD[intTran] != true){
						bIsCompete = false;
					}
				}
				log("DEBUG", "UPDATING RTDS!", "bIsCompete:" + bIsCompete);
				if(bIsCompete == true){
					log("DEBUG", "UPDATING RTDS!", "#2 bIsCompete:" + bIsCompete);
			        runSchedForUpdateRTD({
			        	completeCGL: true,
			        	user: stUserId,
			        	cglId: intCGLId
			        	}
			        );
			        
				}
			}
			
	    	//SKIP PROCESS THE CLAIM GENERATION
			log("DEBUG", "UPDATING RTDS!", "END")
	    	return;
    	}
    	
    	if(obj.completeCGL == true){
    		log("DEBUG", "SEND EMAIL CGL", "START");
    		var intCGLId 			= obj.cglId;
			var recCGL 				= nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, intCGLId);
	        var stRTDUpdated        = recCGL.getFieldValue(FLD_CLAIM_GEN_IS_RDT_UPDATED);
			var stRebateType        = recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
			var stSearchDetail      = recCGL.getFieldValue(FLD_CLAIM_GEN_DETAIL_SEARCH);

			var objCGLInfo  = parseStringToJson(recCGL.getFieldValue('custrecord_nsts_rm_cgl_updt_rtd_per_clm'),null);

	        if(!stRTDUpdated)
	        	stRTDUpdated = '';
			if(!isEmpty(objCGLInfo) && stRTDUpdated!= 'T'){

				
				objCGLInfo.cglInfo.recCGL = recCGL;
				finalizingCGL(objCGLInfo.cglInfo);
				finalizingCGL = null;
				sendCreateAttachment(stUserId,stRebateType, stSearchDetail,objCGLInfo.cglInfo);
				
				
		        log("debug", 'PROCESS REVERSAL',"REVERSAL");
		        var stRebateType        = recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
		        var stRemittanceType    = recCGL.getFieldValue(FLD_CLAIM_GEN_REMIT_TYPE);
		       
		        //PROCESS THE CLAIM REVERSAL
		        var stLogs = [];
		        try{
		            
		            var arrAccrualRevTrans = recCGL.getFieldValues(FLD_CLAIM_GEN_ACCRUAL_REVERSAL_TRANSACTION);
		            var isGenerateRevAccrual = recCGL.getFieldValues(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL); 
		            var arrClaim = recCGL.getFieldValues(FLD_CLAIM_GEN_CLAIM_TRANSACTION);
		            
		            log("debug", stLogTitle, "arrAccrualRevTrans: " + JSON.stringify(arrAccrualRevTrans));
		            log("debug", stLogTitle, "isGenerateRevAccrual: " + JSON.stringify(isGenerateRevAccrual));
		            log("debug", stLogTitle, "arrClaim: " + JSON.stringify(arrClaim));
		            if( isEmpty(arrAccrualRevTrans) || isGenerateRevAccrual == "T"){
		            	try{
		                    var arrParam = [];
		        			nlapiSetFieldValue(FLD_ACCRUAL_ISGENERATE, "T")
		        		    arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_CGL] = parseJsonToString([intCGLId], "[]");
		        		    arrParam[PARAM_CUSTSCRIPT_NSTS_RM_SS_ACCRUAL_REV_USER] = stUserId;
		        		    var stScheduleStatus = invokeScheduleScript(CUSTOMSCRIPT_NSTS_RM_SS_ACCRUALS_REVERSAL, CUSTOMDEPLOY_NSTS_RM_SS_ACCRUALS_REVERSAL, arrParam);

		                    var arrCGLField = [];
		                    var arrCGLValue = [];
		                    
		                    arrCGLField.push(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL);
		                    arrCGLField.push(FLD_CLAIM_GEN_STATUS);
		                    
		                    arrCGLValue.push("T");
		                    arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual);
		                    nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
		            	}catch(e_Reversal){
		                    var arrCGLField = [];
		                    var arrCGLValue = [];
		                    
		                    arrCGLField.push(FLD_CLAIM_GEN_GENERATE_REVERSAL_ACCRUAL);
		                    arrCGLField.push(FLD_CLAIM_GEN_STATUS);
		                    arrCGLField.push(FLD_CLAIM_GEN_ERR_CODE);
		                    arrCGLField.push(FLD_CLAIM_GEN_BYPASS_CLAIM);
		                   
		                    arrCGLValue.push("F");
		                    arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.ReversingAccrual_Error);
		                    arrCGLValue.push(e_Reversal.toString());
		                    arrCGLValue.push("F");
		                    nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
		            	}
		                
		    		    
		            }else{
		                var arrCGLField = [];
		                var arrCGLValue = [];
		                
		                arrCGLField.push(FLD_CLAIM_GEN_STATUS);
		                arrCGLField.push(FLD_CLAIM_GEN_ERR_CODE);
		                arrCGLField.push(FLD_CLAIM_GEN_BYPASS_CLAIM);

		                arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Completed);
		                arrCGLValue.push("");
		                arrCGLValue.push("F");
		                nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
		            }

		        }catch(e){
		            stLogs.push(e.toString());
		        }
		        if(!isEmpty(stLogs)){
		            var arrCGLField = [];
		            var arrCGLValue = [];
		            arrCGLField.push(FLD_CLAIM_GEN_ERR_CODE);
		            arrCGLField.push(FLD_CLAIM_GEN_GENERATE_CLAIM);
		            arrCGLField.push(FLD_CLAIM_GEN_STATUS);
		            arrCGLField.push(FLD_CLAIM_GEN_BYPASS_CLAIM);
		            
		            arrCGLValue.push(stLogs.join("</br>"));
		            arrCGLValue.push("F");
		            arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Error);
		            arrCGLValue.push("F");
		            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
		            
		            throw stLogs.join("</br>");
		        }
		        

			}
			
			log("DEBUG", "COMPLITING CGL!", "END")
    	}
    }
   
    for (var index = 0; index < arrCGLId.length; index++) {
        var intCGLId = arrCGLId[index];
        log("debug", stLogTitle,"START CALCULATION");
        var recCGL = nlapiLoadRecord(REC_CLAIM_GENERATION_LOG, intCGLId);
        var stTotalClaim = recCGL.getFieldValue('custrecord_nsts_rm_cgl_total_claim_amnt');
        log("debug", stLogTitle,"total claim amt: "+stTotalClaim+ ' reviewed; '+recCGL.getFieldValue('custrecord_nsts_rm_cgl_is_detail_updated') );
        if(stTotalClaim)
        	stTotalClaim = parseFloat(stTotalClaim);
        //if(!(stTotalClaim)){
        	doCalc(recCGL, context,recCGL.getFieldValue('custrecord_nsts_rm_cgl_is_detail_updated') ,stTotalClaim);
        	
        //}
        var stRebateType        = recCGL.getFieldValue(FLD_CLAIM_GEN_REBATE_TYPE);
        var stRemittanceType    = recCGL.getFieldValue(FLD_CLAIM_GEN_REMIT_TYPE);
       
        //PROCESS THE CLAIM GENERATION
        var stLogs = [];
        try{
            if ((stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase || stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale)
                    && stRemittanceType == HC_REMIT_TYPE.Credit) {
                createVendorRebateCredit(recCGL,stUserId);
            }else if(stRebateType == HC_REBATE_TYPE.Customer_Rebate && stRemittanceType == HC_REMIT_TYPE.Credit){
                createCustomerRebateCredit(recCGL,stUserId);
            }
            
            if ((stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Purchase || stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale)
                    && stRemittanceType == HC_REMIT_TYPE.Refund) {
                createVendorRebateRefund(recCGL,stUserId);
            }else if(stRebateType == HC_REBATE_TYPE.Customer_Rebate && stRemittanceType == HC_REMIT_TYPE.Refund){
                createCustomerRebateRefund(recCGL,stUserId);
            }

        }catch(e){
            stLogs.push(e.toString());
        }

        if(!isEmpty(stLogs)){
            var arrCGLField = [];
            var arrCGLValue = [];
            arrCGLField.push(FLD_CLAIM_GEN_ERR_CODE);
            arrCGLField.push(FLD_CLAIM_GEN_GENERATE_CLAIM);
            arrCGLField.push(FLD_CLAIM_GEN_STATUS);
            arrCGLField.push(FLD_CLAIM_GEN_BYPASS_CLAIM);
            
            arrCGLValue.push(stLogs.join("</br>"));
            arrCGLValue.push("F");
            arrCGLValue.push(HC_CLAIM_GEN_LOG_STATUS.Error);
            arrCGLValue.push("F");
            nlapiSubmitField(REC_CLAIM_GENERATION_LOG, intCGLId, arrCGLField, arrCGLValue);
            
            throw stLogs.join("</br>");
        }
    }
    


}


