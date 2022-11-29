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
 * This script is used for creating the Suitelet Form that creates 
 * combinations of rebate agreement details.
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Apr 2017     Paolo de Leon     Rebates v2.0
 * 
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */

var HC_OBJ_FEATURE = new objFeature();
var stEnv = null;

/*
 * ====================================================================
 * SUITELET FORM FUNCTION
 * ====================================================================
 */

function procDefineTiers_FormSuitelet(request, response) {
    var objForm = nlapiCreateForm('Define Tiers', false);

    if (request.getMethod() == 'GET') {
        var idRebateAgreement = request.getParameter(HC_REQUEST_PARAM.Agreement);
        var loadType = request.getParameter(HC_REQUEST_PARAM.LoadType);
        var lstCalcMethod = request.getParameter(HC_REQUEST_PARAM.CalcMethod);
        var bTiered = request.getParameter(HC_REQUEST_PARAM.CalcMethod);
        var intRADCount = request.getParameter(HC_REQUEST_PARAM.RADCount);
        var stItemSpecOrClass = (intRADCount > 0) ? request.getParameter(HC_REQUEST_PARAM.ItemSpecOrClass) : '';
        var stSelected = request.getParameter(HC_REQUEST_PARAM.ItemSelect);
        var idTierGroup = request.getParameter(HC_REQUEST_PARAM.TierGroup);
        var stMsg = request.getParameter(HC_REQUEST_PARAM.Message);
        
        // HIDDEN FIELDS - STORES FIELD VALUES FROM THE AGREEMENT RECORD
        objForm.addField(FLD_CUSTPAGE_REBATE_AGREEMENT, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(idRebateAgreement);
        objForm.addField(FLD_CUSTPAGE_CALC_METHOD_PARAM, HC_FIELD_TYPE.Text)
                .setDisplayType(HC_DISPLAY_TYPE.Hidden).setDefaultValue(lstCalcMethod);
        objForm.addField(FLD_CUSTPAGE_RAD_COUNT_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(intRADCount);
        objForm.addField(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(stItemSpecOrClass);
        objForm.addField(FLD_CUSTPAGE_TG_ID, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(idTierGroup);

        // VALUE FIELDS
        objForm.setScript('customscript_nsts_rm_definetiers_cs');
        
        //MESSAGE FIELD
        if (!isEmpty(stMsg)) objForm.addField(FLD_CUSTPAGE_TG_MSG, HC_FIELD_TYPE.InlineHtml)
        	.setDefaultValue(stMsg);
        
        // BUTTONS
        if (isEmpty(idTierGroup)) {
        	objForm.addButton(HC_BTN_CREATE_TIER_GROUP, 'Create Tier Group', 'createTierGroup()');
        } else {
//        	objForm.addButton(HC_BTN_SAVE_TIER_GROUP, 'Save Tier Group', 'saveTierGroup()');
        	objForm.addButton(HC_BTN_DELETE_TIER_GROUP, 'Remove Tier Group', 'deleteTierGroup()');
            objForm.addButton(HC_BTN_RESET_TIER_GROUP, 'Reset Selection', 'resetPage()');
        }
        
        var arrTG = getTierGroup(idRebateAgreement);
        var objSelectedTG = arrTG[idTierGroup];

        createItemFields(objForm, idRebateAgreement, objSelectedTG);
        var objSelected = createTierGroupTab(objForm, idRebateAgreement, lstCalcMethod, intRADCount, stItemSpecOrClass, idTierGroup);
        
        if (loadType == 'search' && !isEmpty(idTierGroup)) {
            objForm.addSubmitButton('Save Tiers');
            createTierTab(objForm, idTierGroup);
        } else if (loadType == 'createTierGroup') {
            var stName = request.getParameter(HC_REQUEST_PARAM.Name);
            var arrItems = (!isEmpty(request.getParameter(HC_REQUEST_PARAM.Items))) ? request.getParameter(HC_REQUEST_PARAM.Items).split(',') : [];
            var arrItemClass = (!isEmpty(request.getParameter(HC_REQUEST_PARAM.ItemClass))) ? request.getParameter(HC_REQUEST_PARAM.ItemClass).split(',') : [];
            var bAggregate = request.getParameter(HC_REQUEST_PARAM.Aggregate);
            
        	var objRes = createTierGroup({
        		idRebateAgreement : idRebateAgreement,
        		stName : stName,
        		arrItems : arrItems,
        		arrItemClass : arrItemClass,
        		bAggregate : bAggregate
        	});
        	
            var arrParam = [];
            arrParam['loadType'] = 'search';
            arrParam['agreementId'] = idRebateAgreement;
            arrParam['calcMethod'] = lstCalcMethod;
            arrParam['radCount'] = intRADCount;
            arrParam['itemSpecOrClass'] = stItemSpecOrClass;
            arrParam['tierGroup'] = objRes.idTierGroup;
            arrParam['msg'] = objRes.stMsg;
            
            nlapiSetRedirectURL('SUITELET', SCRIPT_DEFINE_TIER, DEPLOY_DEFINE_TIER, false, arrParam);
        } else if (loadType == 'saveTierGroup') {
            var stName = request.getParameter(HC_REQUEST_PARAM.Name);
            var arrItems = (!isEmpty(request.getParameter(HC_REQUEST_PARAM.Items))) ? request.getParameter(HC_REQUEST_PARAM.Items).split(',') : [];
            var arrItemClass = (!isEmpty(request.getParameter(HC_REQUEST_PARAM.ItemClass))) ? request.getParameter(HC_REQUEST_PARAM.ItemClass).split(',') : [];
            var bAggregate = request.getParameter(HC_REQUEST_PARAM.Aggregate);

            var stMsg = saveTierGroup({
        		idTierGroup : idTierGroup,
        		stName : stName,
        		arrItems : arrItems,
        		arrItemClass : arrItemClass,
        		bAggregate : bAggregate
        	});

            var arrParam = [];
            arrParam['loadType'] = 'search';
            arrParam['agreementId'] = idRebateAgreement;
            arrParam['calcMethod'] = lstCalcMethod;
            arrParam['radCount'] = intRADCount;
            arrParam['itemSpecOrClass'] = stItemSpecOrClass;
            arrParam['tierGroup'] = idTierGroup;
            arrParam['msg'] = stMsg;
            
            nlapiSetRedirectURL('SUITELET', SCRIPT_DEFINE_TIER, DEPLOY_DEFINE_TIER, false, arrParam);
        } else if (loadType == 'deleteTierGroup') {
        	var stMsg = deleteTierGroup({
        		idTierGroup : idTierGroup
        	});

            var arrParam = [];
            arrParam['agreementId'] = idRebateAgreement;
            arrParam['calcMethod'] = lstCalcMethod;
            arrParam['radCount'] = intRADCount;
            arrParam['itemSpecOrClass'] = stItemSpecOrClass;
            arrParam['msg'] = stMsg;
            
            nlapiSetRedirectURL('SUITELET', SCRIPT_DEFINE_TIER, DEPLOY_DEFINE_TIER, false, arrParam);
        }
        response.writePage(objForm);
    } else {
        var idRebateAgreement = request.getParameter(FLD_CUSTPAGE_REBATE_AGREEMENT);
        var lstCalcMethod = request.getParameter(FLD_CUSTPAGE_CALC_METHOD_PARAM);
        var intRADCount = request.getParameter(FLD_CUSTPAGE_RAD_COUNT_PARAM);
        var stItemSpecOrClass = (intRADCount > 0) ? request.getParameter(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM) : '';
        var idTierGroup = request.getParameter(FLD_CUSTPAGE_TG_ID);
    	
        var stName = request.getParameter(FLD_CUSTPAGE_TG_NAME);
        var arrItems = (!isEmpty(request.getParameter(FLD_CUSTPAGE_TG_ITEMS))) ? request.getParameter(FLD_CUSTPAGE_TG_ITEMS).split(',') : [];
        var arrItemClass = (!isEmpty(request.getParameter(FLD_CUSTPAGE_TG_ITEM_CLASS))) ? request.getParameter(FLD_CUSTPAGE_TG_ITEM_CLASS).split(',') : [];
        var bAggregate = request.getParameter(FLD_CUSTPAGE_TG_AGGREGATE);
        
        var stMsg = saveTierGroup({
    		idTierGroup : idTierGroup,
    		stName : stName,
    		arrItems : arrItems,
    		arrItemClass : arrItemClass,
    		bAggregate : bAggregate
    	});
        
        if (isEmpty(stMsg)) {
	    	stMsg = processTiers({
	    		request : request
	    	});
        }
    	
        var arrParam = [];
        arrParam['loadType'] = 'search';
        arrParam['agreementId'] = idRebateAgreement;
        arrParam['calcMethod'] = lstCalcMethod;
        arrParam['radCount'] = intRADCount;
        arrParam['itemSpecOrClass'] = stItemSpecOrClass;
        arrParam['tierGroup'] = idTierGroup;
        arrParam['msg'] = stMsg;
        
        nlapiSetRedirectURL('SUITELET', SCRIPT_DEFINE_TIER, DEPLOY_DEFINE_TIER, false, arrParam);
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */

/*
 * Retrieves the Tier Group information to be used later
 */
function getTierGroup(idRebateAgreement) {
    var arrFil = [new nlobjSearchFilter(FLD_TIER_GROUP_REBATE_AGREEMENT, null, 'anyof', idRebateAgreement),
		new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')];
	var arrCol = [new nlobjSearchColumn(FLD_INTERNAL_ID).setSort(),
		new nlobjSearchColumn(FLD_NAME),
		new nlobjSearchColumn(FLD_TIER_GROUP_ITEMS),
		new nlobjSearchColumn(FLD_TIER_GROUP_ITEM_CLASSIFICATION),
		new nlobjSearchColumn(FLD_TIER_GROUP_AGGREGATE)];
    
    var objSearch = getAllResults(REC_TIER_GROUP, null, arrFil, arrCol);
    
    var arrTG = getTGArray(objSearch);

    return arrTG;
}

function getTGArray(objTGSearch) {
	var arrTG = [];
	
	if (!isEmpty(objTGSearch)) {
		var objResults = objTGSearch.results;
        var bItem = (!isEmpty(objResults[0].getValue(FLD_TIER_GROUP_ITEMS))) ? true : false;
        var bItemClass = (!isEmpty(objResults[0].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION))) ? true : false;

		for (var intCtr = 0; intCtr < objResults.length; intCtr++) {
			var idTG = objResults[intCtr].getId();
			var arrList = [];
			if (bItem) {
				arrList = objResults[intCtr].getValue(FLD_TIER_GROUP_ITEMS).split(',');
			} else if (bItemClass) {
				arrList = objResults[intCtr].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION).split(',');
			}
			var bAggregate = objResults[intCtr].getValue(FLD_TIER_GROUP_AGGREGATE);
			
			arrTG[idTG] = {
				name : objResults[intCtr].getValue(FLD_NAME),
				arrList : arrList,
				bAggregate : bAggregate
			};
		}
	}
	
	return arrTG;
}

/*
 * Creates the item fields and preselects them
 */
function createItemFields(objForm, idRebateAgreement, objSelectedTG) {
	var bItemSpec = true;
	var fldItemList = null;
	
	objForm.addFieldGroup('custpage_nsts_rm_fldgrp_tg', 'Tier Group');
	
	var fldName = objForm.addField(FLD_CUSTPAGE_TG_NAME, HC_FIELD_TYPE.Text, 'Name', null, 'custpage_nsts_rm_fldgrp_tg');
	fldName.setLayoutType('startrow');
	if (!isEmpty(objSelectedTG)) {
		fldName.setDefaultValue(objSelectedTG.name);
	}
	
	var arrFil = [new nlobjSearchFilter(FLD_REBATE_AGREEMENT_DETAIL_REBATE_AGREEMENT, null, 'anyof', idRebateAgreement),
		new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')];
	var arrCol = [new nlobjSearchColumn(FLD_REBATE_AGREEMENT_DETAIL_ITEM, null, 'group'),
		new nlobjSearchColumn(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS, null, 'group')];
	
	var arrRes = getAllResults(REC_REBATE_AGREEMENT_DETAIL, null, arrFil, arrCol);
	
	if (!isEmpty(arrRes)) {
		var arrResults = arrRes.results;
		
		for (var intCtr = 0; intCtr < arrResults.length; intCtr++){
			if (isEmpty(fldItemList)) {
				var stItem = arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM, null, 'group');
				var stItemClass = arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS, null, 'group');
				
				if (!isEmpty(stItemClass)) {
					fldItemList = objForm.addField(FLD_CUSTPAGE_TG_ITEM_CLASS, HC_FIELD_TYPE.Multi, 'Item Classifications', null, 'custpage_nsts_rm_fldgrp_tg');
					bItemSpec = false;
				} else if (!isEmpty(stItem)) {
					fldItemList = objForm.addField(FLD_CUSTPAGE_TG_ITEMS, HC_FIELD_TYPE.Multi, 'Items', null, 'custpage_nsts_rm_fldgrp_tg');
					bItemSpec = true;
				}
				fldItemList.setLayoutType('startrow');
			}
			
			if (bItemSpec) {
				var blSel = false;
				if (!isEmpty(objSelectedTG) && 
						objSelectedTG.arrList.indexOf(arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM, null, 'group')) >= 0) blSel = true;
				fldItemList.addSelectOption(arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM, null, 'group'), arrResults[intCtr].getText(FLD_REBATE_AGREEMENT_DETAIL_ITEM, null, 'group'), blSel);
			} else {
				var blSel = false;
				if (!isEmpty(objSelectedTG) && 
						objSelectedTG.arrList.indexOf(arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS, null, 'group')) >= 0) blSel = true;
				fldItemList.addSelectOption(arrResults[intCtr].getValue(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS, null, 'group'), arrResults[intCtr].getText(FLD_REBATE_AGREEMENT_DETAIL_ITEM_CLASS, null, 'group'), blSel);
			}
		} 
	}
	
	var fldAgg = objForm.addField(FLD_CUSTPAGE_TG_AGGREGATE, HC_FIELD_TYPE.Checkbox, 'Aggregate', null, 'custpage_nsts_rm_fldgrp_tg');
	fldAgg.setLayoutType('startrow');
	if (!isEmpty(objSelectedTG)) {
		fldAgg.setDefaultValue(objSelectedTG.bAggregate);
	}
}

/*
 * Method to generate Tier Group tab 
 */
function createTierGroupTab(objForm, idRebateAgreement, idCalcMethod, intRadCount, itemSpecOrClass, idTierGroup) {
	return createTierGroupSublist({
		objForm : objForm,
		idRebateAgreement : idRebateAgreement,
		idCalcMethod : idCalcMethod,
		intRadCount : intRadCount,
		itemSpecOrClass : itemSpecOrClass,
		idTierGroup : idTierGroup
	});
}

/*
 * Method to generate inline Tier tab 
 */
function createTierTab(objForm, idTierGroup) {
	createTierSublist({
		objForm : objForm,
		idTierGroup : idTierGroup
	});
}

/*
 * Creates the sublist to be displayed on the Tier Group subtab
 */
function createTierGroupSublist(objParams) {
	var objReturn = [];
	var objForm = objParams.objForm;
	var idRebateAgreement = objParams.idRebateAgreement;
	var idCalcMethod = objParams.idCalcMethod;
	var intRadCount = objParams.intRadCount;
	var itemSpecOrClass = objParams.itemSpecOrClass;
	var idTierGroup = objParams.idTierGroup;
	
    var objSublist = objForm.addSubList(
    		SBL_TIER_GROUP, HC_FIELD_TYPE.List, 'Tier Groups'
            );
    
    var arrFil = [new nlobjSearchFilter(FLD_TIER_GROUP_REBATE_AGREEMENT, null, 'anyof', idRebateAgreement),
		new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')];
	var arrCol = [new nlobjSearchColumn(FLD_INTERNAL_ID).setSort(),
		new nlobjSearchColumn(FLD_NAME),
		new nlobjSearchColumn(FLD_TIER_GROUP_ITEMS),
		new nlobjSearchColumn(FLD_TIER_GROUP_ITEM_CLASSIFICATION)];
    
    var objSearch = null;
    
    objSearch = getAllResults(REC_TIER_GROUP, null, arrFil, arrCol);

    if (!isEmpty(objSearch)) {
        var objResults = objSearch.results;
        // CREATE COLUMNS
        objSublist.addField(FLD_CUSTPAGE_TG_LIST_LINK, 'textarea', 'Tier Group').setDisplayType(HC_DISPLAY_TYPE.Inline);
        
        var bItem = (!isEmpty(objResults[0].getValue(FLD_TIER_GROUP_ITEMS))) ? true : false;
        var bItemClass = (!isEmpty(objResults[0].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION))) ? true : false;
        
        if (bItemClass) {
        	objSublist.addField(FLD_CUSTPAGE_TG_LIST_LIST, 'text', 'Item Classifications').setDisplayType(HC_DISPLAY_TYPE.Inline);
        } else if (bItem) {
        	objSublist.addField(FLD_CUSTPAGE_TG_LIST_LIST, 'text', 'Items').setDisplayType(HC_DISPLAY_TYPE.Inline);
        }
        
        objSublist.addField(FLD_CUSTPAGE_TG_LIST_HIDDEN_TEXT, 'textarea', 'Name').setDisplayType(HC_DISPLAY_TYPE.Hidden);
        objSublist.addField(FLD_CUSTPAGE_TG_LIST_HIDDEN_ID, 'textarea', 'Id').setDisplayType(HC_DISPLAY_TYPE.Hidden);
        objSublist.addField(FLD_CUSTPAGE_TG_LIST_HIDDEN_VAL, 'textarea', 'Values').setDisplayType(HC_DISPLAY_TYPE.Hidden);
        
        // CREATE ROWS AND ADD SEARCH RESULT VALUES
        var arrValues = [];
        for (var i = 0; i < objResults.length; i++) {
            var arrList = [];
            var stUrl = nlapiResolveURL('SUITELET', SCRIPT_DEFINE_TIER, DEPLOY_DEFINE_TIER);
            stUrl += '&loadType=search&agreementId=' + idRebateAgreement 
	            + '&calcMethod=' + idCalcMethod 
	            + '&radCount=' + intRadCount
	            + '&itemSpecOrClass=' + itemSpecOrClass
            	+ '&tierGroup=' + objResults[i].getId();
            arrList[FLD_CUSTPAGE_TG_LIST_LINK] = '<a href="' + stUrl + '" class="dottedlink" style="background-color: lightyellow!important;">' + objResults[i].getValue(FLD_NAME) + '</a>';
            if (bItem) {
            	arrList[FLD_CUSTPAGE_TG_LIST_LIST] = truncateString(objResults[i].getText(FLD_TIER_GROUP_ITEMS));
            	arrList[FLD_CUSTPAGE_TG_LIST_HIDDEN_VAL] = objResults[i].getValue(FLD_TIER_GROUP_ITEMS);
            } else if (bItemClass) {
            	arrList[FLD_CUSTPAGE_TG_LIST_LIST] = truncateString(objResults[i].getText(FLD_TIER_GROUP_ITEM_CLASSIFICATION));
            	arrList[FLD_CUSTPAGE_TG_LIST_HIDDEN_VAL] = objResults[i].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION);
            }
            arrList[FLD_CUSTPAGE_TG_LIST_HIDDEN_TEXT] = objResults[i].getValue(FLD_NAME);
            arrList[FLD_CUSTPAGE_TG_LIST_HIDDEN_ID] = objResults[i].getId();

            arrValues.push(arrList)
            
            if (!isEmpty(idTierGroup) && objResults[i].getId() == idTierGroup) {
            	objReturn['stTGName'] = objResults[i].getValue(FLD_NAME);
            	if (bItem) {
            		objReturn['arrSelected'] = objResults[i].getValue(FLD_TIER_GROUP_ITEMS).split(',');
            	} else if (bItemClass) {
            		objReturn['arrSelected'] = objResults[i].getValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION).split(',');
            	}
            }
        }
        objSublist.setLineItemValues(arrValues);
    }
    
    return objReturn;
}

/*
 * Creates the sublist to be displayed on the Tiers subtab
 */
function createTierSublist(objParams) {
	var objForm = objParams.objForm;
	var idTierGroup = objParams.idTierGroup;
	
    var objSublist = objForm.addSubList(
    		SBL_TIER, HC_FIELD_TYPE.InlineEditor, 'Tiers'
            );

    // CREATE COLUMNS
    objSublist.addField(FLD_CUSTPAGE_TIER_ID, 'text', 'Internal Id').setDisplayType(HC_DISPLAY_TYPE.Hidden);
    var fldCurr = objSublist.addField(FLD_CUSTPAGE_TIER_LEVEL, 'integer', 'Tier Level');
    objSublist.setUniqueField(FLD_CUSTPAGE_TIER_LEVEL);
    fldCurr.setMandatory(true);
    fldCurr = objSublist.addField(FLD_CUSTPAGE_TIER_MIN, 'currency', 'Min');
    fldCurr.setMandatory(true);
    objSublist.addField(FLD_CUSTPAGE_TIER_MAX, 'currency', 'Max');
    fldCurr = objSublist.addField(FLD_CUSTPAGE_TIER_PERC, 'percent', 'Percent (%)');
    fldCurr.setMandatory(true);
    objSublist.addField(FLD_CUSTPAGE_TIER_FORECAST, 'checkbox', 'Forecast Target');
    
    var arrFil = [new nlobjSearchFilter(FLD_TIER_DOLLAR_TIER_GROUP, null, 'anyof', idTierGroup),
		new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F')];
	var arrCol = [new nlobjSearchColumn(FLD_TIER_DOLLAR_LEVEL).setSort(),
		new nlobjSearchColumn(FLD_TIER_DOLLAR_MIN),
		new nlobjSearchColumn(FLD_TIER_DOLLAR_MAX),
		new nlobjSearchColumn(FLD_TIER_DOLLAR_PERCENTAGE),
		new nlobjSearchColumn(FLD_TIER_DOLLAR_FORECAST_TARGET)];
    
    var objSearch = null;
    
    objSearch = getAllResults(REC_TIERS_DOLLARS, null, arrFil, arrCol);

    if (!isEmpty(objSearch)) {
        var objResults = objSearch.results;
        
        // CREATE ROWS AND ADD SEARCH RESULT VALUES
        var arrValues = [];
        var arrIds = [];
        for (var i = 0; i < objResults.length; i++) {
            var arrList = [];
            
            arrList[FLD_CUSTPAGE_TIER_ID] = objResults[i].getId();
            arrList[FLD_CUSTPAGE_TIER_LEVEL] = objResults[i].getValue(FLD_TIER_DOLLAR_LEVEL);
            arrList[FLD_CUSTPAGE_TIER_MIN] = objResults[i].getValue(FLD_TIER_DOLLAR_MIN);
            arrList[FLD_CUSTPAGE_TIER_MAX] = objResults[i].getValue(FLD_TIER_DOLLAR_MAX);
            arrList[FLD_CUSTPAGE_TIER_PERC] = objResults[i].getValue(FLD_TIER_DOLLAR_PERCENTAGE);
            arrList[FLD_CUSTPAGE_TIER_FORECAST] = objResults[i].getValue(FLD_TIER_DOLLAR_FORECAST_TARGET);
            
            arrValues.push(arrList);
            arrIds.push(objResults[i].getId());
        }
        objSublist.setLineItemValues(arrValues);
        objForm.addField(FLD_CUSTPAGE_TIER_ID_LIST, HC_FIELD_TYPE.TextArea).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(arrIds.join(','));
    }
}
/*
 * Creates a Tier Group record using the supplied information
 */
function createTierGroup(objParams) {
	var stMsg = '';
	var idTierGroup = null;
	var idRebateAgreement = objParams.idRebateAgreement;
	var stName = objParams.stName;
	var arrItems = objParams.arrItems;
	var arrItemClass = objParams.arrItemClass;
	var bAggregate = objParams.bAggregate;
	
	try{
		var recTG = nlapiCreateRecord(REC_TIER_GROUP);
		recTG.setFieldValue(FLD_TIER_GROUP_REBATE_AGREEMENT, idRebateAgreement);
		recTG.setFieldValue(FLD_NAME, stName);
		if (!isEmpty(arrItems)) recTG.setFieldValue(FLD_TIER_GROUP_ITEMS, arrItems);
		if (!isEmpty(arrItemClass)) recTG.setFieldValue(FLD_TIER_GROUP_ITEM_CLASSIFICATION, arrItemClass);
		(bAggregate == 'T') ? recTG.setFieldValue(FLD_TIER_GROUP_AGGREGATE, 'T') : recTG.setFieldValue(FLD_TIER_GROUP_AGGREGATE, 'F');
		
		idTierGroup = nlapiSubmitRecord(recTG);
	} catch (e) {
		stMsg = 'Error encountered: ' + e.toString();
	}
	
	return {
		idTierGroup : idTierGroup,
		stMsg : stMsg
	}
}

/*
 * Updates currently selected Tier Group with supplied information
 */
function saveTierGroup(objParams) {
	var stMsg = '';
	var idTierGroup = objParams.idTierGroup;
	var stName = objParams.stName;
	var arrItems = (!isEmpty(objParams.arrItems)) ? objParams.arrItems : [];
	var arrItemClass = (!isEmpty(objParams.arrItemClass)) ? objParams.arrItemClass : [];
	var bAggregate = objParams.bAggregate;

	if (!isEmpty(idTierGroup)) {
		var recTG  = nlapiLoadRecord(REC_TIER_GROUP, idTierGroup);
		
		if (!isEmpty(recTG)) {
			recTG.setFieldValue(FLD_NAME, stName);
			recTG.setFieldValues(FLD_TIER_GROUP_ITEMS, arrItems);
			recTG.setFieldValues(FLD_TIER_GROUP_ITEM_CLASSIFICATION, arrItemClass);
			(bAggregate == 'T') ? recTG.setFieldValue(FLD_TIER_GROUP_AGGREGATE, 'T') : recTG.setFieldValue(FLD_TIER_GROUP_AGGREGATE, 'F');
			
			try {
				nlapiSubmitRecord(recTG);
			} catch (e) {
				stMsg = 'Error encountered: ' + e.toString();
			}
		} else {
			stMsg = 'Tier Group does not exist';
		}
	} else {
		stMsg = 'No Tier Group selected';
	}
	
	return stMsg;
}

/*
 * Deletes Tier Group record
 */
function deleteTierGroup(objParams) {
	var stMsg = '';
	var idTierGroup = objParams.idTierGroup;
	
	try {
		var arrFil = [new nlobjSearchFilter(FLD_TIER_DOLLAR_TIER_GROUP, null, 'anyof', idTierGroup)];
		var arrCol = [new nlobjSearchColumn(HC_INTERNAL_ID)];
		
		var arrRes = getAllResults(REC_TIERS_DOLLARS, null, arrFil, arrCol);
		
		if (!isEmpty(arrRes)) {
			var arrResults = arrRes.results;
			
			for (var intCtr = 0; intCtr < arrResults.length; intCtr++){
				var idTier = arrResults[intCtr].getId();
				
				nlapiDeleteRecord(REC_TIERS_DOLLARS, idTier);
			}
		}
		
		nlapiDeleteRecord(REC_TIER_GROUP, idTierGroup);
	} catch (e) {
		stMsg = 'Error encountered: ' + e.toString();
	}
	
	return stMsg;
}

/*
 * Processes tiers. Checks whether to create, update, or delete Tier records
 */
function processTiers(objParams) {
	var objRequest = objParams.request;

	var arrMsg = [];
	var intCount = request.getLineItemCount(SBL_TIER);
	var arrOldId = (!isEmpty(objRequest.getParameter(FLD_CUSTPAGE_TIER_ID_LIST))) ? objRequest.getParameter(FLD_CUSTPAGE_TIER_ID_LIST).split(',') : [];
	
	if (intCount > 0) {
		var arrExistId = [];
		for (var intCtr = 1; intCtr <= intCount; intCtr++) {
			var idTier = objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_ID, intCtr);
			
			if (!isEmpty(idTier)) {
				var stMsg = updateTier({
					idTierGroup : objRequest.getParameter(FLD_CUSTPAGE_TG_ID),
					idTier : idTier,
					intTierLevel : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_LEVEL, intCtr),
					intMin : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MIN, intCtr),
					intMax : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MAX, intCtr),
					flPerc : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_PERC, intCtr),
					bForecast : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_FORECAST, intCtr)
				});
				
				arrExistId.push(idTier);
				arrMsg.push(stMsg);
			} else {
				var stMsg = createTier({
					idTierGroup : objRequest.getParameter(FLD_CUSTPAGE_TG_ID),
					intTierLevel : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_LEVEL, intCtr),
					intMin : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MIN, intCtr),
					intMax : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_MAX, intCtr),
					flPerc : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_PERC, intCtr),
					bForecast : objRequest.getLineItemValue(SBL_TIER, FLD_CUSTPAGE_TIER_FORECAST, intCtr)
				});
				
				arrMsg.push(stMsg);
			}
		}
		
		for (var intCtr = 0; intCtr < arrOldId.length; intCtr++) {
			if (arrExistId.indexOf(arrOldId[intCtr]) < 0) {
				stMsg = deleteTier({idTier : arrOldId[intCtr]});
				arrMsg.push(stMsg);
			}
		}
	} else {
		for (var intCtr = 0; intCtr < arrOldId.length; intCtr++) {
			stMsg = deleteTier({idTier : arrOldId[intCtr]});
			arrMsg.push(stMsg);
		}
	}
	
	return arrMsg.join('\n');
}

/*
 * Updates an already existing tier with new information
 */
function updateTier(objParams) {
	var stMsg = '';
	var idTierGroup = objParams.idTierGroup;
	var idTier = objParams.idTier;
	var intTierLevel = objParams.intTierLevel;
	var intMin = objParams.intMin;
	var intMax = objParams.intMax;
	var flPerc = objParams.flPerc;
	var bForecast = objParams.bForecast;
	
	var arrFields = [FLD_TIER_DOLLAR_TIER_GROUP, FLD_TIER_DOLLAR_LEVEL, 
		FLD_TIER_DOLLAR_MIN, FLD_TIER_DOLLAR_MAX, FLD_TIER_DOLLAR_PERCENTAGE, FLD_TIER_DOLLAR_FORECAST_TARGET];
	var arrValues = [idTierGroup, intTierLevel, intMin, intMax, flPerc, bForecast];
	
	try {
		nlapiSubmitField(REC_TIERS_DOLLARS, idTier, arrFields, arrValues);
	} catch (e) {
		stMsg = 'Error encountered: ' + e.toString();
	}
	
	return stMsg;
}

/*
 * Creates the necessary Tier record(s) with the supplied information in the sublist
 */
function createTier(objParams) {
	var stMsg = '';
	var idTierGroup = objParams.idTierGroup;
	var intTierLevel = objParams.intTierLevel;
	var intMin = objParams.intMin;
	var intMax = objParams.intMax;
	var flPerc = objParams.flPerc;
	var bForecast = objParams.bForecast;
	
	try{
		var recTier = nlapiCreateRecord(REC_TIERS_DOLLARS, {recordmode : 'dynamic'});
		recTier.setFieldValue(FLD_TIER_DOLLAR_TIER_GROUP, idTierGroup);
		recTier.setFieldValue(FLD_TIER_DOLLAR_LEVEL, intTierLevel);
		recTier.setFieldValue(FLD_TIER_DOLLAR_MIN, intMin);
		recTier.setFieldValue(FLD_TIER_DOLLAR_MAX, intMax);
		recTier.setFieldValue(FLD_TIER_DOLLAR_PERCENTAGE, flPerc);
		recTier.setFieldValue(FLD_TIER_DOLLAR_FORECAST_TARGET, bForecast);
		
		nlapiSubmitRecord(recTier);
	} catch (e) {
		stMsg = 'Error encountered: ' + e.toString();
	}
	
	return stMsg;
}

/*
 * Deletes removed tier record
 */
function deleteTier(objParams) {
	var stMsg = '';
	var idTier = objParams.idTier;
	
	try {
		nlapiDeleteRecord(REC_TIERS_DOLLARS, idTier);
	} catch (e) {
		stMsg = 'Error encountered: ' + e.toString();
	}
	
	return stMsg;
}

/*
 * Truncates the entered string to 300 (max of column)
 */
function truncateString(strText) {
	var stRet = strText;
	if (!isEmpty(strText) && strText.length > 250) {
		stRet = strText.substring(0,250) + '...';
	}
	
	return stRet;
}