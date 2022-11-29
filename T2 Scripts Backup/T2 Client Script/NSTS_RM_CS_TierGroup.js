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
var IS_REBATE_FOR_ITEMS = false;
var SEARCH_TIER_GROUP_VALIDATION = 'customsearch_nsts_rm_rad_valid_tg';
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 *  On Create of record, hide the Items and Item Classification fields
 *  On Copy or Edit, displays the Item or Item Classification based from the setup of the Rebate Agreement
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function tierGroup_PageInit(type){
	
	if(type == HC_MODE_TYPE.Create && isEmpty(nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT))){
		nlapiGetField(FLD_TIER_GROUP_ITEMS).setDisplayType(HC_DISPLAY_TYPE.Hidden);
		nlapiGetField(FLD_TIER_GROUP_ITEM_CLASSIFICATION).setDisplayType(HC_DISPLAY_TYPE.Hidden);
	}else{
		if(!isEmpty(nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT))){
			IS_REBATE_FOR_ITEMS = isRebateAgreementForItems(nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT));
			if(IS_REBATE_FOR_ITEMS){
				nlapiGetField(FLD_TIER_GROUP_ITEMS).setDisplayType(HC_DISPLAY_TYPE.Normal);
				nlapiGetField(FLD_TIER_GROUP_ITEM_CLASSIFICATION).setDisplayType(HC_DISPLAY_TYPE.Hidden);
			}else{
				nlapiGetField(FLD_TIER_GROUP_ITEMS).setDisplayType(HC_DISPLAY_TYPE.Hidden);
				nlapiGetField(FLD_TIER_GROUP_ITEM_CLASSIFICATION).setDisplayType(HC_DISPLAY_TYPE.Normal);
			}
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function tierGroup_SaveRecord(){

	var intRecId = nlapiGetRecordId();
	var intRebateAgreement = nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT);
	var arrItems = nlapiGetFieldValues(FLD_TIER_GROUP_ITEMS);
	var arrItemClassification = nlapiGetFieldValues(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
	var stName = nlapiGetFieldValue(FLD_NAME);
	var strMessage = '';
	
	if(!isEmpty(intRebateAgreement)){
		
		var strReturnedMessage = validateOnTierGroup(intRebateAgreement, intRecId, stName, arrItems, arrItemClassification);
		strReturnedMessage += validateTiers();
		
		if(!isEmpty(strReturnedMessage)){
			strMessage = 'Record cannot be saved due to the following:' + strReturnedMessage;
			alert(strMessage);
			return false;
		}
	}
	
    return true;
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
function tierGroup_FieldChanged(type, name, linenum){
	
	if(isEmpty(type)){
		if(name == FLD_TIER_GROUP_REBATE_AGREEMENT){
			
			var intRebateAgreement 		= nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT);
			var fldItem 				= nlapiGetField(FLD_TIER_GROUP_ITEMS);
			var fldItemClassification 	= nlapiGetField(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
			
			if(isEmpty(intRebateAgreement)){
				IS_REBATE_FOR_ITEMS = false;
				fldItem.setDisplayType(HC_DISPLAY_TYPE.Hidden);
				fldItemClassification.setDisplayType(HC_DISPLAY_TYPE.Hidden);
			}else{
				if(rebateAgreementHaveDetails(intRebateAgreement)){
					if(!isEmpty(intRebateAgreement)){
						IS_REBATE_FOR_ITEMS = isRebateAgreementForItems(nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT));
						
						if(IS_REBATE_FOR_ITEMS){
							fldItem.setDisplayType(HC_DISPLAY_TYPE.Normal);
							nlapiSetFieldValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION, '');
							fldItemClassification.setDisplayType(HC_DISPLAY_TYPE.Hidden);
						}else{
							nlapiSetFieldValue(FLD_TIER_GROUP_ITEMS, '');
							fldItem.setDisplayType(HC_DISPLAY_TYPE.Hidden);
							fldItemClassification.setDisplayType(HC_DISPLAY_TYPE.Normal);
						}
					}
				}else{
					alert('Tier Group cannot be created for Rebate Agreement without Rebate Agreement Details.');
					nlapiSetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT, '');
				}
			}
		}
	}
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
function tierGroup_ValidateField(type, name, linenum) {
	var bReturn = true;
	if (type == SBL_TIER_GROUP_TIER) {
		if (name == FLD_TIER_DOLLAR_PERCENTAGE) {
			var flPerc = nlapiGetCurrentLineItemValue(type, name);
			flPerc = parseFloat(flPerc.substring(0, flPerc.length - 1));
			if (!(flPerc >= 0 && flPerc <= 100)) {
				alert('Percent must be between 0-100.');
				bReturn = false;
			}
		}
	}
	
	return bReturn;
}

function validateOnTierGroup(intRebateAgreement, intRecId, stName, arrItems, arrItemClassifications){
	
	var stMessage = '';
	var arrFilters = [], arrColumns = [];
	var arrRadItems = [], arrRadItemClassifications = [], bRaIsItems = false, bNoRad = false, bItemOrClassificationNotFound = false;
	
	//Gather Items or Item Classifications defined on the RAD of RA
	var arrFromRad = checkRebateAgreementdetails(intRebateAgreement, arrItems, arrItemClassifications);
	
	if(arrFromRad['b_ra_no_rad']){
		stMessage += '\n- Rebate Agreement does not have Rebate Agreement Details';
	}else{
		//Get Tier Groups that have the same name and uses the same item or item classification
		var arrFromTierGroups = checkExistingTierGroups(intRebateAgreement, intRecId, stName, arrItems, arrItemClassifications, arrFromRad['b_ra_is_items']);
		
		if(arrFromTierGroups['b_tier_group_name_exists']) stMessage += '\n- Tier Group Name exists.';
		if(arrFromRad['b_ra_is_items'] && isEmpty(arrItems)) stMessage += '\n- Items is mandatory.';
		if(!arrFromRad['b_ra_is_items'] && isEmpty(arrItemClassifications)) stMessage += '\n- Item  Classifications is mandatory.';
		
		if((arrFromRad['b_ra_is_items'] && !isEmpty(arrItems)) || (!arrFromRad['b_ra_is_items'] && !isEmpty(arrItemClassifications))){
			if(arrFromRad['b_item_or_class_not_found']  && arrFromRad['b_ra_is_items']) stMessage += '\n- Selected Item is not defined on Rebate Agreement Details.';
			if(arrFromRad['b_item_or_class_not_found'] && !arrFromRad['b_ra_is_items']) stMessage += '\n- Item Classification is not defined on Rebate Agreement Details.';
			if(arrFromRad['b_ra_is_items'] && arrFromTierGroups['b_on_other_tier_group']) stMessage += '\n- Items already on other Tier Group.';
			if(!arrFromRad['b_ra_is_items'] && arrFromTierGroups['b_on_other_tier_group']) stMessage += '\n- Item  Classifications already on other Tier Group.';
		}
	}
	
	return stMessage;
}

function checkExistingTierGroups(intRebateAgreement, intRecId, stName, arrItems, arrItemClassifications, bRaIsItems){
	
	var arrReturn = [], arrFilters = [], arrColumns = [];
	
	arrFilters.push([FLD_INACTIVE, 'is', 'F']);
	arrFilters.push('and');
	arrFilters.push([FLD_TIER_GROUP_REBATE_AGREEMENT, 'anyof', intRebateAgreement]);
	
	if(!isEmpty(intRecId)){
		arrFilters.push('and');
		arrFilters.push([FLD_INTERNAL_ID, 'noneof', intRecId]);
	}
	
	var arrSubFilter = [];
	arrSubFilter.push([FLD_NAME, 'is', stName]);
	
	if(bRaIsItems){
		if(!isEmpty(arrItems) && parseInt(arrItems.length) > parseInt(0) && !isEmpty(arrItems[0]) && arrItems[0] != ""){
			arrSubFilter.push('or');
			arrSubFilter.push([FLD_TIER_GROUP_ITEMS, 'anyof', arrItems]);
		}
	}else if(!isEmpty(arrItemClassifications) && parseInt(arrItemClassifications.length) > parseInt(0) && !isEmpty(arrItemClassifications[0]) && arrItemClassifications[0] != ""){
		arrSubFilter.push('or');
		arrSubFilter.push([FLD_TIER_GROUP_ITEM_CLASSIFICATION, 'anyof', arrItemClassifications]);
	}
	
	arrFilters.push('and');
	arrFilters.push(arrSubFilter);
	
	arrColumns.push(new nlobjSearchColumn(FLD_NAME));
	arrColumns.push(new nlobjSearchColumn(FLD_TIER_GROUP_ITEMS));
	arrColumns.push(new nlobjSearchColumn(FLD_TIER_GROUP_ITEM_CLASSIFICATION));
	
	var arrSearchRs = nlapiSearchRecord(REC_TIER_GROUP, '', arrFilters, arrColumns);
	var bTierGroupNameExists = false, bItemOnOtherTierGroup = false, bItemOrClassificationOnOtherTierGroup = false;
	
	if(!isEmpty(arrSearchRs) && parseInt(arrSearchRs.length) > parseInt(0)){
		var stTierGroupName, arrTierGroupItems, arrTierGroupItemClassifications;
		
		for(var i = 0; parseInt(i) < parseInt(arrSearchRs.length); i++){
			
			if(!bTierGroupNameExists && arrSearchRs[i].getValue(FLD_NAME) == stName){
				bTierGroupNameExists = true;
			}
			
			if(bRaIsItems){
				if(!bItemOrClassificationOnOtherTierGroup && itemsOrClassificationInTierGroup(arrSearchRs[i].getValue(FLD_TIER_GROUP_ITEMS), arrItems)){
					bItemOrClassificationOnOtherTierGroup = true;
					break;
				}
			}else{
				if(!bItemOrClassificationOnOtherTierGroup && itemsOrClassificationInTierGroup(arrSearchRs[i].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION), arrItemClassifications)){
					bItemOrClassificationOnOtherTierGroup = true;
					break;
				}
			}
		}
	}
	
	arrReturn['b_tier_group_name_exists'] = bTierGroupNameExists;
	arrReturn['b_on_other_tier_group'] = bItemOrClassificationOnOtherTierGroup;

	return arrReturn;
}

function checkRebateAgreementdetails(intRebateAgreement, arrItems, arrItemClassifications){
	
	var message = '';
	var arrFilters = [], arrColumns = [], arrReturn = [];
	var arrRadItems = [], arrRadItemClassifications = [], bRaIsItems = false, bNoRad = false, bItemOrClassificationNotFound = false;
	
	arrFilters.push(new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null, 'anyof', intRebateAgreement));
	
	var arrSearchRs = getAllResults(REC_AGREEMENT_DETAIL, SEARCH_TIER_GROUP_VALIDATION, arrFilters);
	var arrRs 		= arrSearchRs.results;
	var arrSrc = [], arrTarget = [];
	
	if(!isEmpty(arrRs) && parseInt(arrRs.length) > parseInt(0)){
		if(!isEmpty(arrRs[0].getValue(FLD_CUSTRECORD_DET_ITEM))) bRaIsItems = true;
		
		for(var i = 0; parseInt(i) < parseInt(parseInt(arrRs.length)); i++){
			if(!isEmpty(arrRs[i])){
				if(bRaIsItems){
					arrRadItems.push(arrRs[i].getValue(FLD_CUSTRECORD_DET_ITEM));
				}else{
					arrRadItemClassifications.push(arrRs[i].getValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS));
				}
			}
		}
		
		if(bRaIsItems){
			arrSrc 		= arrItems;
			arrTarget 	= arrRadItems;
		}else{
			arrSrc 		= arrItemClassifications;
			arrTarget 	= arrRadItemClassifications;
		}
		
		var item;
		if(!isEmpty(arrSrc) && !isEmpty(arrTarget)){
			for(var i = 0; parseInt(i) < parseInt(parseInt(arrSrc.length)); i++){
				if(parseInt(arrTarget.indexOf(arrSrc[i])) < parseInt(0)){
					bItemOrClassificationNotFound = true;
					break;
				}
			}
		}
	}else{
		bNoRad = true;
	}
	
	arrReturn['b_ra_is_items'] 	= bRaIsItems;
	arrReturn['b_ra_no_rad'] 	= bNoRad;
	arrReturn['b_item_or_class_not_found'] = bItemOrClassificationNotFound;

	return arrReturn;
}

function itemsOrClassificationInTierGroup(arrTierGroupItems, arrItems){
	
	var item;
	arrTierGroupItems = arrTierGroupItems.split(',');
	
	for(var itemIndx = 0; parseInt(itemIndx) < parseInt(arrItems.length); itemIndx++){
		
		item = arrItems[itemIndx];
		
		if(parseInt(arrTierGroupItems.indexOf(item)) >= 0){
			return true;
		}
	}
	
	return false;
}

function rebateAgreementHaveDetails(intRebateAgreement){
	
	var arrFilters = [];
	arrFilters.push(new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'));
	arrFilters.push(new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null, 'anyof', intRebateAgreement));
	
	var arrColumns = [];
	arrColumns.push(new nlobjSearchColumn(FLD_INTERNAL_ID));
	
	var arrSearchRs = nlapiSearchRecord(REC_AGREEMENT_DETAIL, null, arrFilters, arrColumns);
	if(!isEmpty(arrSearchRs) && parseInt(arrSearchRs.length) > parseInt(0)){
		return true;
	}
	
	return false;
}

function isRebateAgreementForItems(intRebateAgreement){
	
	var bItems = false;
	var arrFilters = [];
	arrFilters.push(new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null, 'anyof', intRebateAgreement));
	arrFilters.push(new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'));
	
	var arrColumns = [];
	arrColumns.push(new nlobjSearchColumn(FLD_INTERNAL_ID));
	arrColumns.push(new nlobjSearchColumn(FLD_CUSTRECORD_DET_ITEM));
	
	var arrSearchRs = nlapiSearchRecord(REC_AGREEMENT_DETAIL, null, arrFilters, arrColumns);
	
	if(!isEmpty(arrSearchRs) && parseFloat(arrSearchRs.length) > parseInt(0)){
		
		var arrItems = arrSearchRs[0].getValue(FLD_CUSTRECORD_DET_ITEM);
		if(!isEmpty(arrItems)){
			bItems = true;
		}
	}
	
	return bItems;
}

/*
 * Validates tiers
 */
function validateTiers() {
	var errMsg = [];
	var intLen = nlapiGetLineItemCount(SBL_TIER_GROUP_TIER);
	
	var bForecastSet = false;
	var bHasBlank = false;
	var arrTemp = [];
	tierLoop:
	for (var intCtr = 1; intCtr <= intLen; intCtr++) {
		var objCurrSel = {
				lvl : parseFloat(nlapiGetLineItemValue(SBL_TIER_GROUP_TIER, FLD_TIER_DOLLAR_LEVEL, intCtr)),
				min : parseFloat(nlapiGetLineItemValue(SBL_TIER_GROUP_TIER, FLD_TIER_DOLLAR_MIN, intCtr)),
				max : parseFloat(nlapiGetLineItemValue(SBL_TIER_GROUP_TIER, FLD_TIER_DOLLAR_MAX, intCtr))
		};
		var stCurrMax = isNaN(objCurrSel['max']) ? '' : objCurrSel['max'];

		if (objCurrSel['min'] == stCurrMax) {
			errMsg.push('\n- Tier with the same min and max exists. Kindly recheck.');
			break;
		} else if (!isEmpty(stCurrMax) && objCurrSel['min'] > stCurrMax) {
			errMsg.push('\n- A Tier has a Min amount that is greater than the Max amount. Please check again.');
			break;
		} else if (objCurrSel['min'] < 0) {
			errMsg.push('\n- A Tier has a negative Min amount.');
			break;
		}

		if (stCurrMax == '') {
			if (!bHasBlank) {
				bHasBlank = true;
			} else {
				errMsg.push('\n- Only the highest tier level can have a blank Maximum amount. Please check again.');
				break;
			}
		}
		
		if (nlapiGetLineItemValue(SBL_TIER_GROUP_TIER, FLD_TIER_DOLLAR_FORECAST_TARGET, intCtr) == 'T') {
			if (!bForecastSet) {
				bForecastSet = true;
			} else {
				errMsg.push('\n- Only 1 tier can be set as the forecast target. Please check again.');
				break;
			}
		} else if (arrTemp.length == 0) {
			arrTemp.push(objCurrSel);
			continue;
		} else if (!isEmpty(stCurrMax) && (isEmpty(arrTemp[arrTemp.length-1]['max']) || isNaN(arrTemp[arrTemp.length-1]['max']))) {
			errMsg.push('\n- Only the highest tier level can have a blank Maximum amount. Please check again.');
			break;
		}
		
		tempLoop:
		for (var intTemp = 0; intTemp < arrTemp.length; intTemp++) {
			var objTempSel = arrTemp[intTemp];
			var stTempMax = isNaN(objTempSel['max']) ? '' : objTempSel['max'];
			
			if (objCurrSel['lvl'] == objTempSel['lvl']) {
				errMsg.push('\n- Tier levels should be unique. Kindly recheck.');
				break tierLoop;
			} else if (objCurrSel['min'] === objTempSel['min'] ||
					(stCurrMax === stTempMax && stCurrMax !== '') ||
					objCurrSel['min'] === stTempMax ||
					stCurrMax === objTempSel['min']) {
				errMsg.push('\n- There are overlapping tiers. Kindly recheck.');
				break tierLoop;
			} else if (objCurrSel['min'] > forceParseFloat(stTempMax)) {
				if (intTemp == (arrTemp.length - 1)) {
					arrTemp.push(objCurrSel);
					continue tierLoop;
				} else {
					continue;
				}
			} else if (isEmpty(stCurrMax) &&
					intTemp == (arrTemp.length - 1)) {
				errMsg.push('\n- Tiers with blank max should be the highest tier. Kindly recheck.');
				break tierLoop;
			} else if (!isEmpty(stCurrMax)) {
				if (objTempSel['min'] < forceParseFloat(stCurrMax)) {
					errMsg.push('\n- There are overlapping tiers. Kindly recheck.');
					break tierLoop;
				} else if (stCurrMax < objTempSel['min']) {
					arrTemp.splice(intTemp, 0, objCurrSel);
					continue tierLoop;
				}
			}
		}
		
		if (!isEmpty(errMsg)) {
			break;
		}
	}
	
	return errMsg;
}