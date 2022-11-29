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
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function tierGroup_BeforeLoad(type, form, request){
	
	var intRebateAgreement = nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT);
	
	if(!isEmpty(intRebateAgreement)){
		
		var bIsTiered = nlapiLookupField(REC_REBATE_AGREEMENT, intRebateAgreement, FLD_CUSTRECORD_IS_TIERED);
		
		if(bIsTiered != 'T') throw nlapiCreateError('REBATE_AGREEMENT_NOT_TIERED', 'Rebate Agreement is not Tiered. Tier Group cannot be created.', true);
		
		var objFieldItem = nlapiGetField(FLD_TIER_GROUP_ITEMS);
		var objFieldItemClassification = nlapiGetField(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
		
		if(isRebateAgreementForItems(intRebateAgreement)){
			objFieldItem.setDisplayType(HC_DISPLAY_TYPE.Normal);
			objFieldItemClassification.setDisplayType(HC_DISPLAY_TYPE.Hidden);
		}else{
			objFieldItem.setDisplayType(HC_DISPLAY_TYPE.Hidden);
			objFieldItemClassification.setDisplayType(HC_DISPLAY_TYPE.Normal);
		}
	}
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
function tierGroup_BeforeSubmit(type){
	 
	if(type != HC_MODE_TYPE.Delete){
		
		var intInternalId = nlapiGetRecordId();
		var intRebateAgreement, arrItems, arrItemClassification, stName;
		
		if(type == HC_MODE_TYPE.Xedit){
			var objTgRecord = nlapiGetNewRecord();
			
			intRebateAgreement = objTgRecord.getFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT);
			arrItems = objTgRecord.getFieldValues(FLD_TIER_GROUP_ITEMS);
			arrItemClassification = objTgRecord.getFieldValues(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
			stName = objTgRecord.getFieldValue(FLD_NAME);
		}else{
			intRebateAgreement = nlapiGetFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT);
			arrItems = nlapiGetFieldValues(FLD_TIER_GROUP_ITEMS);
			arrItemClassification = nlapiGetFieldValues(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
			stName = nlapiGetFieldValue(FLD_NAME);
		}
		
		var stReturnedMessage = validateOnTierGroup(intRebateAgreement, intInternalId, stName, arrItems, arrItemClassification);
		
		if(!isEmpty(stReturnedMessage)){
			throw nlapiCreateError('TIER_GROUP_ERROR', stReturnedMessage, true);
		}
	}
}

function validateOnTierGroup(intRebateAgreement, intRecId, stName, arrItems, arrItemClassifications){
	
	var stMessage = '';
	var arrFilters = [], arrColumns = [];
	var arrRadItems = [], arrRadItemClassifications = [], bRaIsItems = false, bNoRad = false, bItemOrClassificationNotFound = false;
	
	//Gather Items or Item Classifications defined on the RAD of RA
	var arrFromRad = checkRebateAgreementdetails(intRebateAgreement, arrItems, arrItemClassifications);
	
	if(arrFromRad['b_ra_no_rad']){
		stMessage += 'Rebate Agreement does not have Rebate Agreement Details\n';
	} else {
		//Get Tier Groups that have the same name and uses the same item or item classification
		var arrFromTierGroups = checkExistingTierGroups(intRebateAgreement, intRecId, stName, arrItems, arrItemClassifications, arrFromRad['b_ra_is_items']);
		
		if(arrFromTierGroups['b_tier_group_name_exists']) stMessage += 'Tier Group Name exists.\n';
		
		if (arrFromRad['b_ra_is_items']) {
			if (!isEmpty(arrItemClassifications)) stMessage += 'Only Items can be used for the Rebate Agreement.\n';
			if (isEmpty(arrItems)) stMessage += 'Items is mandatory.\n';
		}
		if(!arrFromRad['b_ra_is_items']) {
			if (isEmpty(arrItemClassifications)) stMessage += 'Item Classifications is mandatory.\n';
			if (!isEmpty(arrItems)) stMessage += 'Only Item Classification can be used for the Rebate Agreement.\n';
		}
		
		if((arrFromRad['b_ra_is_items'] && !isEmpty(arrItems)) || (!arrFromRad['b_ra_is_items'] && !isEmpty(arrItemClassifications))){
			if(arrFromRad['b_item_or_class_not_found']  && arrFromRad['b_ra_is_items']) stMessage += 'Item is not defined on Rebate Agreement Details.\n';
			if(arrFromRad['b_item_or_class_not_found'] && !arrFromRad['b_ra_is_items']) stMessage += 'Item Classification is not defined on Rebate Agreement Details.\n';
			if(arrFromRad['b_ra_is_items'] && arrFromTierGroups['b_on_other_tier_group']) stMessage += 'Items already on other Tier Group.\n';
			if(!arrFromRad['b_ra_is_items'] && arrFromTierGroups['b_on_other_tier_group']) stMessage += 'Item  Classifications already on other Tier Group.\n';
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
			
			if(bRaIsItems && !isEmpty(arrItems)){
				if(!bItemOrClassificationOnOtherTierGroup && itemsOrClassificationInTierGroup(arrSearchRs[i].getValue(FLD_TIER_GROUP_ITEMS), arrItems)){
					bItemOrClassificationOnOtherTierGroup = true;
					break;
				}
			}else if(!isEmpty(arrItemClassifications)){
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
			if(bRaIsItems){
				arrRadItems.push(arrRs[i].getValue(FLD_CUSTRECORD_DET_ITEM));
			}else{
				arrRadItemClassifications.push(arrRs[i].getValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS));
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

function isRebateAgreementForItems(rebateAgreement){
	
	var isItems = false;
	var filters = [];
	filters.push(new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null, 'anyof', rebateAgreement));
	filters.push(new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'));
	
	var columns = [];
	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn(FLD_CUSTRECORD_DET_ITEM));
	
	var searchRs = nlapiSearchRecord(REC_AGREEMENT_DETAIL, null, filters, columns);
	
	if(!isEmpty(searchRs) && parseFloat(searchRs.length) > parseInt(0)){
		
		var items = searchRs[0].getValue(FLD_CUSTRECORD_DET_ITEM);
		if(!isEmpty(items)){
			isItems = true;
		}
	}
	
	return isItems;
}