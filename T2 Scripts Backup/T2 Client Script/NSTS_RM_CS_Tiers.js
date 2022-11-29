
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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function tiers_PageInit(type){
	
//	if(nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC) == 'T'){
//		var objFieldPercent = nlapiGetField(FLD_TIER_DOLLAR_PERCENTAGE);
//		var objFieldAmount = nlapiGetField(FLD_TIER_DOLLAR_AMOUNT);
//		
//		objFieldPercent.setDisplayType(HC_DISPLAY_TYPE.Normal);
//		nlapiSetFieldValue(FLD_TIER_DOLLAR_AMOUNT, '');
//		objFieldAmount.setDisplayType(HC_DISPLAY_TYPE.Hidden);
//	}else if(nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT) == 'T'){
//		var objFieldPercent = nlapiGetField(FLD_TIER_DOLLAR_PERCENTAGE);
//		var objFieldAmount = nlapiGetField(FLD_TIER_DOLLAR_AMOUNT);
//		
//		nlapiSetFieldValue(FLD_TIER_DOLLAR_PERCENTAGE, '');
//		objFieldPercent.setDisplayType(HC_DISPLAY_TYPE.Hidden);
//		objFieldAmount.setDisplayType(HC_DISPLAY_TYPE.Normal);
//	}else{
//		nlapiSetFieldValue(FLD_TIER_DOLLAR_AMOUNT, '');
//		nlapiSetFieldValue(FLD_TIER_DOLLAR_PERCENTAGE, '');
//		nlapiGetField(FLD_TIER_DOLLAR_PERCENTAGE).setDisplayType(HC_DISPLAY_TYPE.Hidden);
//		nlapiGetField(FLD_TIER_DOLLAR_AMOUNT).setDisplayType(HC_DISPLAY_TYPE.Hidden);
//	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function tiers_SaveRecord(){
	
	var strErrMessage = '';
	var intTierGroup = nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_GROUP);
	var intTier = nlapiGetFieldValue(FLD_TIER_DOLLAR_LEVEL);
	var intTierMin = nlapiGetFieldValue(FLD_TIER_DOLLAR_MIN);
	var intInternalId = nlapiGetRecordId();
	var bForecast = nlapiGetFieldValue(FLD_TIER_DOLLAR_FORECAST_TARGET);
	
	if(!isEmpty(intTierGroup) && !isEmpty(intTier) && !isEmpty(intTierMin)){
		var strReturnedMessage = checkExistingTiers(intTierGroup, intInternalId, intTier, bForecast);
		
		if(!isEmpty(strReturnedMessage)) strErrMessage += strReturnedMessage;
		
		if(nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC) == 'T' && isEmpty(nlapiGetFieldValue(FLD_TIER_DOLLAR_PERCENTAGE))){
			strErrMessage += '\n- Percentage is mandatory';
		}else if(nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT) == 'T' && isEmpty(nlapiGetFieldValue(FLD_TIER_DOLLAR_AMOUNT))){
			strErrMessage += '\n- Amount is mandatory';
		}
		
		var intTierMax = nlapiGetFieldValue(FLD_TIER_DOLLAR_MAX);
		if(!isEmpty(intTierMin) && !isEmpty(intTierMax)){
			if(parseFloat(intTierMin) > parseFloat(intTierMax)){
				strErrMessage += '\n- Tier Minimum cannot be greater than the Tier Maximum';
			}
			if (parseFloat(intTierMin) == parseFloat(intTierMax)) {
				strErrMessage += '\n- Tier Minimum cannot be equal to the Tier Maximum';
			}
		}
		
		if(!isEmpty(intTierMin) && !isEmpty(nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_GROUP)) && isTierOverlap(intTierMin, intTierMax, nlapiGetFieldValue(FLD_TIER_DOLLAR_TIER_GROUP))){
			strErrMessage += '\n- Tier is overlap.';
		}
		
		if(!isEmpty(strErrMessage)){
			strErrMessage = 'Record cannot be saved, adjust the following:' + strErrMessage;
			alert(strErrMessage);
			return false;
		}
	}
	
    return true;
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
			
			if(bHaveForecastTarget && bbTierLevelExists) break;
		}
	}
	
	arrReturn['b_have_forecast_target'] = bHaveForecastTarget;
	arrReturn['b_tier_level_exists'] = bTierLevelExists;
	
	return strMessage;
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

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function tiers_FieldChanged(type, name, linenum){
	
	if(isEmpty(type)){
		
		switch(name){
		case FLD_TIER_DOLLAR_TIER_CALC_METHOD_PERC:
			if(nlapiGetFieldValue(name) == 'T'){
				var objFieldPercent = nlapiGetField(FLD_TIER_DOLLAR_PERCENTAGE);
				var objFieldAmount = nlapiGetField(FLD_TIER_DOLLAR_AMOUNT);
				
				objFieldPercent.setDisplayType(HC_DISPLAY_TYPE.Normal);
				nlapiSetFieldValue(FLD_TIER_DOLLAR_AMOUNT, '');
				objFieldAmount.setDisplayType(HC_DISPLAY_TYPE.Hidden);
			}
			break;
		case FLD_TIER_DOLLAR_TIER_CALC_METHOD_AMT:
			if(nlapiGetFieldValue(name) == 'T'){
				var objFieldPercent = nlapiGetField(FLD_TIER_DOLLAR_PERCENTAGE);
				var objFieldAmount = nlapiGetField(FLD_TIER_DOLLAR_AMOUNT);
				
				nlapiSetFieldValue(FLD_TIER_DOLLAR_PERCENTAGE, '');
				objFieldPercent.setDisplayType(HC_DISPLAY_TYPE.Hidden);
				objFieldAmount.setDisplayType(HC_DISPLAY_TYPE.Normal);
			}
			break;
		case FLD_TIER_DOLLAR_MIN:
			if(parseFloat(nlapiGetFieldValue(FLD_TIER_DOLLAR_MIN)) < parseFloat(0)){
				alert('Minimum value can only be of positive value.');
				nlapiSetFieldValue(FLD_TIER_DOLLAR_MIN, '');
			}
			break;
		case FLD_TIER_DOLLAR_MAX:
			if(parseFloat(nlapiGetFieldValue(FLD_TIER_DOLLAR_MAX)) < parseFloat(0)){
				alert('Maximum value can only be of positive value.');
				nlapiSetFieldValue(FLD_TIER_DOLLAR_MAX, '');
			}
			break;
		}
	}
}