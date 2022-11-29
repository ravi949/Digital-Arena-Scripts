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
 * This script is used for disabling, enabling and hiding of fields for the
 * Process Eligibility Suitelet. Also includes function for the Clear Rebate 
 * Agreement Details button.
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Jan 2017     Paolo de Leon     Rebates v2.0
 * 
 */

/*
 * Validation before page submit
 */
function defineTier_saveRecord() {
	var arrMsg = validateTierGroup();
	if (isEmpty(arrMsg)) {
		arrMsg = validateTiers();
	}
	
	if (!isEmpty(arrMsg)) {
		alert(arrMsg.join('\n'));
		return false;
	} else {
		return true;
	}
}

/*
 * Validates line entries for Tier sublist
 */
function defineTier_validateField(type, name, linenum) {
	if (type == SBL_TIER) {
		if (name == FLD_CUSTPAGE_TIER_PERC) {
			var flPerc = nlapiGetCurrentLineItemValue(type, name);
			flPerc = flPerc.substring(0, flPerc.length - 1);
			if (!(flPerc >= 0 && flPerc <= 100)) {
				alert('Percent must be between 0-100.');
				return false;
			}
		}
	}
	return true;
}

/*
 * Search Tier Group
 */
function searchTierGroup(idTierGroup) {
	var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
	var idCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
	var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
	var itemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
	
	var sUrlSuitelet = nlapiResolveURL('SUITELET',
			SCRIPT_DEFINE_TIER,
			DEPLOY_DEFINE_TIER, false);
    var sUrlParam = sUrlSuitelet + '&loadType=search'
    + '&agreementId='+ idRebateAgreement
    + '&calcMethod=' + idCalcMethod 
    + '&radCount=' + intRadCount
    + '&itemSpecOrClass=' + itemSpecOrClass
    + '&tierGroup=' + idTierGroup;
    
    window.ischanged = false;
    window.location.href = sUrlParam;
}

/*
 * Reload suitelet
 */
function resetPage() {
	var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
	var idCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
	var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
	var itemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
	
	var sUrlSuitelet = nlapiResolveURL('SUITELET',
			SCRIPT_DEFINE_TIER,
            DEPLOY_DEFINE_TIER, false);
    var sUrlParam = sUrlSuitelet 
    + '&agreementId='+ idRebateAgreement
    + '&calcMethod=' + idCalcMethod 
    + '&radCount=' + intRadCount
    + '&itemSpecOrClass=' + itemSpecOrClass;
    
    window.ischanged = false;
    window.location.href = sUrlParam;
}

/*
 * Save Tier Group
 */
function saveTierGroup() {
	var arrMsg = validateTierGroup();
	
	if (!isEmpty(arrMsg)) {
		alert(arrMsg);
	} else {
		var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
		var idCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
		var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
		var itemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
		var idTierGroup = nlapiGetFieldValue(FLD_CUSTPAGE_TG_ID);
		var stName = nlapiGetFieldValue(FLD_CUSTPAGE_TG_NAME);
		var bAggregate = nlapiGetFieldValue(FLD_CUSTPAGE_TG_AGGREGATE);
		
		var sUrlSuitelet = nlapiResolveURL('SUITELET',
				SCRIPT_DEFINE_TIER,
	            DEPLOY_DEFINE_TIER, false);
	    var sUrlParam = sUrlSuitelet + '&loadType=saveTierGroup'
	    + '&agreementId='+ idRebateAgreement
	    + '&calcMethod=' + idCalcMethod 
	    + '&radCount=' + intRadCount
	    + '&itemSpecOrClass=' + itemSpecOrClass
	    + '&tierGroup=' + idTierGroup
	    + '&name=' + stName
	    + '&agg=' + bAggregate;
	
	    if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEMS))) 
	    	sUrlParam += '&items=' + nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEMS).join(',');
		if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEM_CLASS))) 
			sUrlParam += '&itemClass=' + nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEM_CLASS).join(',');
	    
	    window.ischanged = false;
	    window.location.href = sUrlParam;
	}
}

/*
 * Create Tier Group
 */
function createTierGroup() {
	var arrMsg = validateTierGroup();
	
	if (!isEmpty(arrMsg)) {
		alert(arrMsg.join('\n'));
	} else {
		var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
		var idCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
		var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
		var itemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
		var idTierGroup = nlapiGetFieldValue(FLD_CUSTPAGE_TG_ID);
		var stName = nlapiGetFieldValue(FLD_CUSTPAGE_TG_NAME);
		var bAggregate = nlapiGetFieldValue(FLD_CUSTPAGE_TG_AGGREGATE);
		
		var sUrlSuitelet = nlapiResolveURL('SUITELET',
				SCRIPT_DEFINE_TIER,
	            DEPLOY_DEFINE_TIER, false);
	    var sUrlParam = sUrlSuitelet + '&loadType=createTierGroup'
	    + '&agreementId='+ idRebateAgreement
	    + '&calcMethod=' + idCalcMethod 
	    + '&radCount=' + intRadCount
	    + '&itemSpecOrClass=' + itemSpecOrClass
	    + '&tierGroup=' + idTierGroup
	    + '&name=' + stName
	    + '&agg=' + bAggregate;
	
	    if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEMS))) 
	    	sUrlParam += '&items=' + nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEMS).join(',');
		if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEM_CLASS))) 
			sUrlParam += '&itemClass=' + nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEM_CLASS).join(',');
	    
	    window.ischanged = false;
	    window.location.href = sUrlParam;
	}
}

/*
 * Delete Tier Group
 */
function deleteTierGroup() {
	var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
	var idCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
	var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
	var itemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
	var idTierGroup = nlapiGetFieldValue(FLD_CUSTPAGE_TG_ID);
	var stName = nlapiGetFieldValue(FLD_CUSTPAGE_TG_NAME);
	
	var sUrlSuitelet = nlapiResolveURL('SUITELET',
			SCRIPT_DEFINE_TIER,
            DEPLOY_DEFINE_TIER, false);
    var sUrlParam = sUrlSuitelet + '&loadType=deleteTierGroup'
    + '&agreementId='+ idRebateAgreement
    + '&calcMethod=' + idCalcMethod 
    + '&radCount=' + intRadCount
    + '&itemSpecOrClass=' + itemSpecOrClass
    + '&tierGroup=' + idTierGroup
    + '&name=' + stName;

    window.ischanged = false;
    window.location.href = sUrlParam;
}

/*
 * Validates Tier Group data to be saved
 */
function validateTierGroup() {
	var errMsg = [];
	var idTierGroup = nlapiGetFieldValue(FLD_CUSTPAGE_TG_ID);
	var stName = nlapiGetFieldValue(FLD_CUSTPAGE_TG_NAME);
	
	if (isEmpty(stName)) {
		errMsg.push('Tier Group Name is required.');
	}
		
	var arrList = [];
	var stSelection = '';
	if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEMS))) {
		arrList = nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEMS);
		stSelection = 'Item';
	} else if (!isEmpty(nlapiGetField(FLD_CUSTPAGE_TG_ITEM_CLASS))) {
		arrList = nlapiGetFieldValues(FLD_CUSTPAGE_TG_ITEM_CLASS);
		stSelection = 'Item Classification';
	}
	
	if (isEmpty(arrList)) {
		errMsg.push('Please select an ' + stSelection + '.');
	}
	
	errMsg = errMsg.concat(checkTGLines(idTierGroup, stName, arrList, stSelection));
	
	return errMsg;
}

/*
 * Checks the Tier Group sublist for validations
 */
function checkTGLines(idTierGroup, stName, arrSel, stSelection) {
	var errMsg = [];
	var intLen = nlapiGetLineItemCount(SBL_TIER_GROUP);
	
	for (var intCtr = 1; intCtr <= intLen; intCtr++) {
		var idTGLine = nlapiGetLineItemValue(SBL_TIER_GROUP, FLD_CUSTPAGE_TG_LIST_HIDDEN_ID, intCtr);
		if (idTGLine != idTierGroup) {
			var stNameLine = nlapiGetLineItemValue(SBL_TIER_GROUP, FLD_CUSTPAGE_TG_LIST_HIDDEN_TEXT, intCtr);
			var arrSelLine = (!isEmpty(nlapiGetLineItemValue(SBL_TIER_GROUP, FLD_CUSTPAGE_TG_LIST_HIDDEN_VAL, intCtr))) ? 
					nlapiGetLineItemValue(SBL_TIER_GROUP, FLD_CUSTPAGE_TG_LIST_HIDDEN_VAL, intCtr).split(',') : [];
			
			if (stNameLine == stName) {
				errMsg.push('Name already exists');
			}
			for (var intSelCtr = 0; intSelCtr < arrSel.length; intSelCtr++) {
				if (arrSelLine.indexOf(arrSel[intSelCtr]) >= 0) {
					errMsg.push('Another Tier Group already contains the selected ' + stSelection + '/s.');
					break;
				}
			}
			
			if (!isEmpty(errMsg)) {
				break;
			}
		}
	}
	
	return errMsg;
}

/*
 * Validates tiers
 */
function validateTiers() {
	var errMsg = [];
	var intLen = nlapiGetLineItemCount(SBL_TIER);
	
	var bForecastSet = false;
	var arrTemp = [];
	tierLoop:
	for (var intCtr = 1; intCtr <= intLen; intCtr++) {
		var objCurrSel = {
				min : parseFloat(nlapiGetLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MIN, intCtr)),
				max : parseFloat(nlapiGetLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MAX, intCtr))
		};

		if (objCurrSel['min'] == objCurrSel['max']) {
			errMsg.push('Tier with the same min and max exists. Kindly recheck.');
			break;
		} else if (!isEmpty(objCurrSel['max']) && objCurrSel['min'] > objCurrSel['max']) {
			errMsg.push('A Tier has a Min amount that is greater than the Max amount. Please check again.');
			break;
		} else if (objCurrSel['min'] < 0) {
			errMsg.push('A Tier has a negative Min amount.');
			break;
		}
		
		if (nlapiGetLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_FORECAST, intCtr) == 'T') {
			if (!bForecastSet) {
				bForecastSet = true;
			} else {
				errMsg.push('Only 1 tier can be set as the forecast target. Please check again.');
				break;
			}
		} else if (arrTemp.length == 0) {
			arrTemp.push(objCurrSel);
			continue;
		} else if (!isEmpty(objCurrSel['max']) && isEmpty(arrTemp[arrTemp.length-1]['max'])) {
			errMsg.push('Only the highest tier level can have a blank Maximum amount. Please check again.');
			break;
		}
		
		tempLoop:
		for (var intTemp = 0; intTemp < arrTemp.length; intTemp++) {
			var objTempSel = arrTemp[intTemp];
			
			if (objCurrSel['min'] == objTempSel['min'] ||
					objCurrSel['max'] == objTempSel['max'] ||
					objCurrSel['min'] == objTempSel['max'] ||
					objCurrSel['max'] == objTempSel['min']) {
				errMsg.push('There are overlapping tiers. Kindly recheck.');
				break tierLoop;
			} else if (objCurrSel['min'] > objTempSel['max']) {
				if (intTemp == (arrTemp.length - 1)) {
					arrTemp.push(objCurrSel);
					continue tierLoop;
				} else {
					continue;
				}
			} else if (!isEmpty(objCurrSel['max'])) {
				if (objTempSel['min'] < objCurrSel['max']) {
					errMsg.push('There are overlapping tiers. Kindly recheck.');
					break tierLoop;
				} else if (objCurrSel['max'] < objTempSel['min']) {
					arrTemp.splice(intTemp, 0, objCurrSel);
					continue tierLoop;
				}
			} else if (isEmpty(objCurrSel['max']) &&
					intTemp == (arrTemp.length - 1)) {
				errMsg.push('Tiers with blank max should be the highest tier. Kindly recheck.');
				break tierLoop;
			}
		}
		
		if (!isEmpty(errMsg)) {
			break;
		}
	}
	
	return errMsg;
}