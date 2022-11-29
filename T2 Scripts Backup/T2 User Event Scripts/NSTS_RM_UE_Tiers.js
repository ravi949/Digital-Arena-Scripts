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
 * or editing Tier Record
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Apr 2017     gquiambao			Rebates v2.0
 *
 */
var SEARCH_TIERS_VALIDATION = 'customsearch_nsts_rm_tiers_validation';

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function tiers_BeforeLoad(type, form, request){
 
//	var bCalcMethodIsPercent = nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC);
//	var bCcalcMethodIsAmount 	= nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT);
//	
//	if(bCalcMethodIsPercent == 'T'){
//		form.getField(FLD_TIER_DOLLAR_PERCENTAGE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
//	}else if(bCcalcMethodIsAmount == 'T'){
//		form.getField(FLD_TIER_DOLLAR_AMOUNT).setDisplayType(HC_DISPLAY_TYPE.Disabled);
//	}
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
function tiers_BeforeSubmit(type){
	
	if(type != HC_MODE_TYPE.Delete &&
			nlapiGetContext().getExecutionContext() != HC_EXECUTION_CONTEXT.suitelet &&
			(nlapiGetContext().getExecutionContext() != HC_EXECUTION_CONTEXT.userinterface || type == HC_MODE_TYPE.Xedit)){
		
		var intTierGroup, intTier, intTierLevel, bCalcMethodIsPercent, fltPercentage, bCalcMethodIsAmount, fltAmount;
		var intTierMin, intTierMax;
		var stMessage = '';
		
		var intInternalId = nlapiGetRecordId();
		
		if(type == HC_MODE_TYPE.Xedit){
			var objTierNewRec = nlapiGetNewRecord();
			var objTierOldRec = nlapiGetOldRecord();
			
			intTierGroup 	= getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_TIER_GROUP);
			intTier 		= getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_LEVEL);
			intTierLevel 	= getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_LEVEL);
			bCalcMethodIsPercent = nlapiLookupField(REC_TIERS_DOLLARS, intInternalId, FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC);//getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC);
			fltPercentage 	= getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_PERCENTAGE);
			bCalcMethodIsAmount = nlapiLookupField(REC_TIERS_DOLLARS, intInternalId, FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT);//getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT);
			fltAmount 	= getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_AMOUNT);
			intTierMin = getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_MIN);
			intTierMax = getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_MAX);
			bForecast = getOldOrNewValue(objTierOldRec, objTierNewRec, FLD_TIER_DOLLAR_FORECAST_TARGET);
		}else{
			intTierGroup = nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_GROUP);
			intTier = nlapiGetFieldValue(FLD_TIER_DOLLAR_LEVEL);
			intTierLevel = nlapiGetFieldValue(FLD_TIER_DOLLAR_LEVEL);
			bCalcMethodIsPercent = nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC);
			fltPercentage = nlapiGetFieldValue(FLD_TIER_DOLLAR_PERCENTAGE);
			bCalcMethodIsAmount = nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT);
			fltAmount = nlapiGetFieldValue(FLD_TIER_DOLLAR_AMOUNT);
			intTierMin = nlapiGetFieldValue(FLD_TIER_DOLLAR_MIN);
			intTierMax = nlapiGetFieldValue(FLD_TIER_DOLLAR_MAX);
			bForecast = nlapiGetFieldValue(FLD_TIER_DOLLAR_FORECAST_TARGET);
		}
		
		if(!isEmpty(intTierGroup) && !isEmpty(intTier)){
			
			var strReturnedMessage = checkExistingTiers(intTierGroup, intInternalId, intTier, bForecast);
			if(!isEmpty(strReturnedMessage)) stMessage += strReturnedMessage;
			
			
			if(bCalcMethodIsPercent== 'T' && isEmpty(fltPercentage)){
				stMessage += '\n- Percentage is mandatory';
				//throw nlapiCreateError('PERCENT_MANDATORY', 'Percentage is mandatory.', true);
			}else if(bCalcMethodIsAmount == 'T' && isEmpty(fltAmount)){
				stMessage += '\n- Amount is mandatory';
				//throw nlapiCreateError('AMOUNT_MANDATORY', 'Amount is mandatory.', true);
			}
			
//			if(!isEmpty(fltPercentage) && parseFloat(fltPercentage) <= 0){
//				stMessage += '\n- Percentage must be greater than 0';
//				//throw nlapiCreateError('PERCENT_SHOULD_BE GREATER_THAN_0', 'Percentage must be greater than 0', true);
//			}
			
			if(!isEmpty(intTierMin) && !isEmpty(intTierMax)){
		      	if(parseFloat(intTierMin) < parseFloat(0)){
		      		stMessage += '\n- Tier Minimum must be a positive value.';
					//throw nlapiCreateError('MIN_CANNOT_BE_LESS_THAN_0', 'Tier Minimum must be a positive value.', true);
		        }
		      
				if(parseFloat(intTierMin) > parseFloat(intTierMax)){
					stMessage += '\n- Tier Minimum cannot be greater than the Tier Maximum.';
					//throw nlapiCreateError('MIN_CANNOT_BE_GREATER_THAN_MAX', 'Tier Minimum cannot be greater than the Tier Maximum.', true);
				}
				
				if (parseFloat(intTierMin) == parseFloat(intTierMax)){
					stMessage += '\n- Tier Minimum cannot be equal to the Tier Maximum.';
				}
			}
			
			if(!isEmpty(intTierMin) && !isEmpty(intTierGroup) && isTierOverlap(intTierMin, intTierMax, intTierGroup)){
				stMessage += '\n- Tier is overlap.';
				//throw nlapiCreateError('TIER_OVERLAP', 'Tier is overlap.', true);
			}
			
			if(!isEmpty(stMessage)){
				nlapiLogExecution('DEBUG', 'TEST', stMessage);
				throw nlapiCreateError('TIER_ERROR', stMessage, true);
			}
		}
	}
}

function checkExistingTiers(intTierGroup, intInternalId, intTierLevel, bForecast){
	
	var bHaveForecastTarget = false, bTierLevelExists = false;
	var arrFilters = [], arrColumns = [],  arrReturn = [];
	var strMessage = '';
	
	if(!isEmpty(intInternalId)) arrFilters.push(new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'noneof', intInternalId));
	arrFilters.push(new nlobjSearchFilter(FLD_TIER_DOLLAR_TIER_GROUP, null, 'anyof', intTierGroup));
	
	var arrTiersRs = getAllResults('', SEARCH_TIERS_VALIDATION, arrFilters);
	
	if(!isEmpty(arrTiersRs) && parseInt(arrTiersRs.results.length) > parseInt(0)){
		var arrResults = arrTiersRs.results;
		for(var i = 0; parseInt(i) < parseInt(arrResults.length); i++){
			
			if(bForecast == 'T' && !bHaveForecastTarget && arrResults[i].getValue(FLD_TIER_DOLLAR_FORECAST_TARGET) == 'T') strMessage += '\n- At least 1 Tier should be Forecast Target';//bHaveForecastTarget = true;
			if(!bTierLevelExists && parseInt(arrResults[i].getValue(FLD_TIER_DOLLAR_LEVEL)) == intTierLevel) strMessage += '\n- Tier Level Exists';//bTierLevelExists = true;
			
			if(bHaveForecastTarget && bTierLevelExists) break;
		}
	}
	
	arrReturn['b_have_forecast_target'] = bHaveForecastTarget;
	arrReturn['b_tier_level_exists'] = bTierLevelExists;
	
	return strMessage;
}

function getOldOrNewValue(oldRecord, newRecord, field){
	
	var fieldValue = newRecord.getFieldValue(field) == null ? oldRecord.getFieldValue(field) : newRecord.getFieldValue(field);
	
	return fieldValue;
}

function isTierOverlap(tierMin, tierMax, tierGroup){
	
	var arrFilters = [], arrColumns = [];
	var arrFilter1 = [], arrFilter2 = [], arrTmpFilter = [];
	
	if(!isEmpty(nlapiGetRecordId())){
		arrFilter1.push([FLD_INTERNAL_ID, 'noneof', nlapiGetRecordId()]);
		arrFilter1.push('and');
	}
	arrFilter1.push([FLD_TIER_DOLLAR_TIER_GROUP, 'anyof', tierGroup]);
	arrFilter1.push('and');
	arrFilter1.push([FLD_INACTIVE, 'is', 'F']);
	
	if(!isEmpty(tierMin)){
		arrFilter2.push([FLD_TIER_DOLLAR_MAX, 'equalto', tierMin]);
		
		arrTmpFilter = [];
		arrTmpFilter.push([FLD_TIER_DOLLAR_MIN, 'lessthanorequalto', tierMin]);//here
		arrTmpFilter.push('and');
		arrTmpFilter.push([FLD_TIER_DOLLAR_MAX, 'greaterthan', tierMin]);
		
		arrFilter2.push('or');
		arrFilter2.push(arrTmpFilter);
		
		arrTmpFilter = [];
		arrTmpFilter.push([FLD_TIER_DOLLAR_MAX, 'isempty', '']);
		arrTmpFilter.push('and');
		arrTmpFilter.push([FLD_TIER_DOLLAR_MIN, 'lessthanorequalto', tierMin]);
		
		arrFilter2.push('or');
		arrFilter2.push(arrTmpFilter);
	}
	
	if(!isEmpty(tierMax)){
		arrTmpFilter = [];
		arrTmpFilter.push([FLD_TIER_DOLLAR_MIN, 'greaterthan', tierMin]);
		arrTmpFilter.push('and');
		arrTmpFilter.push([FLD_TIER_DOLLAR_MIN, 'lessthanorequalto', tierMax]);//here
		
		arrFilter2.push('or');
		arrFilter2.push(arrTmpFilter);
		
		arrFilter2.push('or');
		arrFilter2.push([FLD_TIER_DOLLAR_MIN, 'equalto', tierMax]);
	}else{
		arrTmpFilter = [];
		arrTmpFilter.push([FLD_TIER_DOLLAR_MIN, 'lessthanorequalto', tierMin]);
		arrTmpFilter.push('and');
		arrTmpFilter.push([FLD_TIER_DOLLAR_MAX, 'greaterthanorequalto', tierMin]);
		
		arrFilter2.push('or');
		arrFilter2.push(arrTmpFilter);
		
		arrFilter2.push('or');
		arrFilter2.push([FLD_TIER_DOLLAR_MIN, 'greaterthan', tierMin]);
	}
	
	arrFilters.push(arrFilter1);
	arrFilters.push('and');
	arrFilters.push(arrFilter2);
	
	arrColumns.push(new nlobjSearchColumn(FLD_INTERNAL_ID));
	
	var objSearchResult = nlapiSearchRecord(REC_TIERS_DOLLARS, null, arrFilters, arrColumns);
	
	if(!isEmpty(objSearchResult) && parseInt(objSearchResult.length) > parseInt(0)){
		var intInternalId = objSearchResult[0].getValue(FLD_INTERNAL_ID);
		if(parseInt(intInternalId) > 0){
			return true;
		}
	}
	
	return false;
}
