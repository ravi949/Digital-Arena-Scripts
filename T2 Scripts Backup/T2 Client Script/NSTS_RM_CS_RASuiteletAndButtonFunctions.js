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
 * 1.00       13 Mar 2015     Roxanne Audette   Initial version.
 * 2.00       23 Jan 2017     Paolo de Leon     Rebates v2.0
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * FUNCTION FOR CLEAR AGREEMENT DETAILS BUTTON
 * ====================================================================
 */
function clearAgreementDetail() {
    var idRebateAgreement = nlapiGetRecordId();
    var stUrlClearSuitelet = nlapiResolveURL('SUITELET',
            SCRIPT_CLEAR_AGR_DET,
            DEPLOY_CLEAR_AGR_DET, false);
    var stRedirectClearUrl = stUrlClearSuitelet + '&agreementId=' + idRebateAgreement;
    
    window.ischanged = false;
    window.location.href = stRedirectClearUrl;
}

/*
 * Function to redirect to Define Tiers suitelet
 */
function defineTiers() {
    var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
    var lstCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
    var bTiered = nlapiGetFieldValue(FLD_CUSTPAGE_IS_TIERED);
    var intRADCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
    var stItemSpecOrClass = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM);
    
    var sUrlSuitelet = nlapiResolveURL('SUITELET',
            SCRIPT_DEFINE_TIER,
            DEPLOY_DEFINE_TIER, false);
    var sUrlParam = sUrlSuitelet + '&loadType=search'
    + '&agreementId='+ idRebateAgreement 
    + '&calcMethod=' + lstCalcMethod
    + '&tiered=' + bTiered
    + "&itemSpecOrClass=" + stItemSpecOrClass
    + '&radCount=' + intRADCount;
    
    window.ischanged = false;
    window.location.href = sUrlParam;
}

/*
 * ====================================================================
 * SEARCH AND ADD AGREEMENT DETAILS SUITELET FUNCTIONS
 * ====================================================================
 */
function searchItemsCustomers(stType) {
    var idItemSearch = nlapiGetFieldValue(FLD_CUSTPAGE_ITEM_SEARCH);
    var idCustomerSearch = nlapiGetFieldValue(FLD_CUSTPAGE_CUSTOMER_SEARCH);
    var idVendorSearch = nlapiGetFieldValue(FLD_CUSTPAGE_VENDOR_SEARCH);
    var idRebateAgreement = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_AGREEMENT);
    var stAgrStatus = nlapiGetFieldValue(FLD_CUSTPAGE_AGREEMENT_STATUS);
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_TYPE);
    var lstCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD);
    var flPercent = nlapiGetFieldValue(FLD_CUSTPAGE_PERCENT);
    var flAmount = nlapiGetFieldValue(FLD_CUSTPAGE_AMOUNT); 
    var flRebateCost = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_COST);
    var lstUom = nlapiGetFieldValue(FLD_CUSTPAGE_UOM);
    var idSubsidiary = nlapiGetFieldValue(FLD_CUSTPAGE_SUBSIDIARY);
    var idCurrency = nlapiGetFieldValue(FLD_CUSTPAGE_CURRENCY);
    var intRadCount = nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM);
    var bIncludeAllEntities = (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL) == 'T' 
        || nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL) == 'T') ? 'T' : 'F';
    var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_TYPE);
    var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_PERC));
    var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_VAL));
    
    var arrItemClass = nlapiGetFieldValues(FLD_CUSTPAGE_SELECT_ITEM_CLASS);
    var arrEntityClass = (stType == HC_VENDOR) ? nlapiGetFieldValues(FLD_CUSTPAGE_SELECT_VEND_CLASS) : nlapiGetFieldValues(FLD_CUSTPAGE_SELECT_CUST_CLASS);
    var idCustVendSearch = (stType == HC_VENDOR) ? idVendorSearch : idCustomerSearch;
    
    var bIsItemClass = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP);
    var bIsCustVendClass = (stType == HC_VENDOR) ? nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP) : nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP);
    
    var bItemSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC);
    var bItemGrp = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP);
    var stItemSel = (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC) == 'T') ? 'spec' : 'grp';
    var stEntSel = '';
    if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC) == 'T' ||
            nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC) == 'T') {
        if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC) == 'T') {
            stEntSel = 'cust';
        } else if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC) == 'T') {
            stEntSel = 'vend';
        }
        
        if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL) == 'T' ||
                nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL) == 'T') {
            stEntSel += 'all';
        } else if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH) == 'T' ||
                nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH) == 'T') {
            stEntSel += 'search';
        }
    } else if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP) == 'T') {
        stEntSel = 'custgroup';
    } else if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP) == 'T') {
        stEntSel = 'vendgroup';
    } 
    
    var arrSearchRecordType = [];
    var arrRecordTypErr = [];
    var bSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC);
    var bGrp = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP);
    var bAll = null;
//  var bSearch = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SEARCH);
    var bSearch = null;
    var arrClass = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_CLASS);
    var idSearch = idItemSearch;
    if (stType == HC_CUSTOMER) {
        bSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC);
        bGrp = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP);
        bAll = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL);
        bSearch = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH);
        arrClass = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_CLASS);
        idSearch = idCustomerSearch;
    } else if (stType == HC_VENDOR) {
        bSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC);
        bGrp = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP);
        bAll = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL);
        bSearch = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH);
        arrClass = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_CLASS);
        idSearch = idVendorSearch;
    }
    if ((!isEmpty(bSpec) && bSpec == 'T') && 
            (isEmpty(bGrp) || bGrp == 'F')) {
        if (!isEmpty(idSearch)) {
            arrSearchRecordType.push([idSearch, stType]);
            arrRecordTypErr = validateRecordType(arrSearchRecordType);
            if (!isEmpty(bAll) && bAll== 'T') {
                arrRecordTypErr.push(stType.capitalizeFirstLetter() + ' search cannot be used with \'All ' + stType.capitalizeFirstLetter() + '\' selection');
            }
        } else if ((!isEmpty(bSearch) && bSearch == 'T') || stType == HC_ITEM) {
            arrRecordTypErr.push('No ' + stType.capitalizeFirstLetter() + ' Search selected');
        } else if (stType != HC_ITEM && (isEmpty(bAll) || bAll == 'F') && (isEmpty(bSearch) || bSearch == 'F')) {
            arrRecordTypErr.push('Please select either \'All ' + stType.capitalizeFirstLetter() + 's\' or \'' + stType.capitalizeFirstLetter() + ' Search\'');
        }
    } else if ((!isEmpty(bGrp) && bGrp == 'T') && 
            (isEmpty(bSpec) || bSpec == 'F')) {
        if (isEmpty(arrClass)) {
            arrRecordTypErr.push('No ' + stType.capitalizeFirstLetter() + ' Classification selected');
        }
    } else {
        arrRecordTypErr.push('Please select either \'' + stType.capitalizeFirstLetter() + ' Specific\' or \'' + stType.capitalizeFirstLetter() + ' Group\'');
    }
    
    if (arrRecordTypErr.length > 0) {
        alert(arrRecordTypErr.join('\n'));
    } else {
        //REMOVE : condition on sprint 4 (dynamic searching)
        if (stType == HC_ITEM) {
            var arrItemSublistCount = getSublistCountPerPage({
                stType : stType,
                sblItemSearch : idItemSearch,
                arrItemClass : arrItemClass,
                sblCustVendSearch : null,
                arrEntityClass : null,
                bIncludeAllEntities : bIncludeAllEntities,
                idSubsidiary : idSubsidiary,
                idCurrency : idCurrency,
                bIsItemClass : bIsItemClass,
                bIsCustVendClass : null
            });
            
            if (arrItemSublistCount.length > 0) {
                alert(arrItemSublistCount.join('\n'));
            }else{
                var objField = nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_ALL);
                if (!isEmpty(objField)) {
                    searchItemsCustomers(HC_CUSTOMER);
                } else {
                    searchItemsCustomers(HC_VENDOR);
                }
            }
        } else {
            var arrSublistCount = getSublistCountPerPage({
                stType : stType,
                sblItemSearch : idItemSearch,
                arrItemClass : arrItemClass,
                sblCustVendSearch : idCustVendSearch,
                arrEntityClass : arrEntityClass,
                bIncludeAllEntities : bIncludeAllEntities,
                idSubsidiary : idSubsidiary,
                idCurrency : idCurrency,
                bIsItemClass : bIsItemClass,
                bIsCustVendClass : bIsCustVendClass
            });
            
            if (arrSublistCount.length > 0) {
                alert(arrSublistCount.join('\n'));
            } else {
                var sUrlSuitelet = nlapiResolveURL('SUITELET',
                        SCRIPT_PROCESS_ELIGIBILITY,
                        DEPLOY_PROCESS_EILIGIBILITY, false);
                var sUrlParam = sUrlSuitelet + '&loadType=search'
                + '&agreementId='+ idRebateAgreement 
                + '&itemSearch=' + idItemSearch
                + '&itemClass=' + JSON.stringify(arrItemClass)//arrItemClass.replace('',',')
                + '&entitySearch=' + idCustVendSearch
                + '&entityClass=' +  JSON.stringify(arrEntityClass)//arrEntityClass.replace('',',')
                + '&rebateType=' + lstRebateType 
                + '&allEntities=' + bIncludeAllEntities
                + '&calcMethod=' + lstCalcMethod 
                + '&percent=' + flPercent
                + '&amount=' + flAmount
                + '&rebateCost=' + flRebateCost
                + '&uom=' +  lstUom
                + '&subsidiary=' + idSubsidiary 
                + '&currency=' + idCurrency 
                + '&agrStatus=' + stAgrStatus
                + '&itemSel=' + stItemSel 
                + '&entSel=' + stEntSel
                + '&type=' + stType
                + '&radCount=' + intRadCount
                + "&passThroughType=" + lstPassThroughType
                + "&passThroughPerc=" + flPassThroughPerc
                + "&passThroughVal=" + flPassThroughVal
                
                window.ischanged = false;
                window.location.href = sUrlParam;
            }
        }
    }
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function validateFieldValues_SaveRecord(){
    var arErrSublistVal = [];
    var stAgrStatus = nlapiGetFieldValue(FLD_CUSTPAGE_AGREEMENT_STATUS);
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_TYPE);
    var bIncludeAllEntities = nlapiGetFieldValue(FLD_CUSTPAGE_ALL_ENTITIES);
    var lstCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD);
    var flPercent = nlapiGetFieldValue(FLD_CUSTPAGE_PERCENT);
    var flAmount = nlapiGetFieldValue(FLD_CUSTPAGE_AMOUNT);
    var flRebateCost = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_COST);
    var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_TYPE);
    var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_PERC));
    var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_VAL));
    
    if(isEmpty(lstCalcMethod)){
        arErrSublistVal.push('Rebate Calculation must be specified.');
    }else{
        var objFieldValue = nlapiLookupField(REC_CALC_METHOD,
                lstCalcMethod, [FLD_CUSTRECORD_SHOW_PERCENT,
                                FLD_CUSTRECORD_SHOW_AMOUNT,
                                FLD_CUSTRECORD_SHOW_REB_COST,
                                FLD_CUSTRECORD_REB_IS_TIERED]);
        
        if(objFieldValue[FLD_CUSTRECORD_SHOW_PERCENT] == 'T'
            && objFieldValue[FLD_CUSTRECORD_REB_IS_TIERED] != 'T'
            && forceParseFloat(flPercent) <= 0)
            arErrSublistVal.push('Rebate Percentage must be greater than 0.');
        
        if(objFieldValue[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T'
            && forceParseFloat(flAmount) <= 0)
            arErrSublistVal.push('Rebate Amount must be greater than 0.');
        
        if(objFieldValue[FLD_CUSTRECORD_SHOW_REB_COST] == 'T'
                && forceParseFloat(flRebateCost) <= 0)
            arErrSublistVal.push('Rebate Cost must be greater than 0.');
    }
    
    if (bIncludeAllEntities != 'T') {
        if (lstRebateType != HC_REB_TYPE.RebPurchase) {
            if(nlapiGetLineItemCount(SBL_CUSTPAGE_CUSTOMERS) == 0)
                arErrSublistVal.push('Please select another Customer Search');
        } else if (lstRebateType == HC_REB_TYPE.RebPurchase) {
            if(nlapiGetLineItemCount(SBL_CUSTPAGE_VENDORS) == 0)
                arErrSublistVal.push('Please select another Vendor Search');
        }
    }
    
    if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Percent && flPassThroughPerc <= 0)
        arErrSublistVal.push('Price Pass Through % must be greater than 0.');
    else if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Value && flPassThroughVal <= 0)
        arErrSublistVal.push('Price Pass Through Value must be greater than 0.');
    
    if(arErrSublistVal.length > 0){
        alert(arErrSublistVal.join('\n'));
        return false;
    }else{
    	alert('An email will be sent after process execution is done on the background.')
    }
    return true;
}

function sourceFieldValues_PageInit() {
    // SOURCE CALCULATION METHODS BASED ON SELECTED REBATE TYPE
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTPAGE_REBATE_TYPE);
    var lstCalcMethodParam = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD_PARAM);
    
    //SOURCE VALUES FOR CALCULATION METHOD BASED ON REBATE TYPE
    nlapiRemoveSelectOption(FLD_CUSTPAGE_CALC_METHOD);
    var objFilters = [new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'),
                      new nlobjSearchFilter(FLD_CUSTRECORD_REB_CALC_REBATE_TYPE, null, 'anyof',
                      lstRebateType)], 
        objColumns = [new nlobjSearchColumn(FLD_CUSTRECORD_REB_CALC_NAME)];
    var recCalcMethod = nlapiSearchRecord(REC_CALC_METHOD, null, objFilters,
            objColumns);
    nlapiInsertSelectOption(FLD_CUSTPAGE_CALC_METHOD, '', '', true);
    for (rec in recCalcMethod) {
        nlapiInsertSelectOption(FLD_CUSTPAGE_CALC_METHOD, recCalcMethod[rec].getId(), 
                recCalcMethod[rec].getValue(FLD_CUSTRECORD_REB_CALC_NAME), false);
    }

    // SOURCE UNIT VALUES VIA SAVED SEARCH
    if(HC_OBJ_FEATURE.bUOM){
    	var lstUOMParam = nlapiGetFieldValue(FLD_CUSTPAGE_UOM_PARAM);
	    var recUnits = nlapiSearchRecord('unitstype');
	    for (uRec in recUnits) {
	        var recUnitsType = nlapiLoadRecord('unitstype', recUnits[uRec].getId());
	        var intUomCount = recUnitsType.getLineItemCount('uom');
	        for(var line = 1; line <= intUomCount; line++){
	            nlapiInsertSelectOption(FLD_CUSTPAGE_UOM, recUnitsType.getLineItemValue('uom', FLD_INTERNAL_ID, line), 
	                    recUnitsType.getLineItemValue('uom', HC_UNIT_NAME, line), false);
	        }
	        /*nlapiInsertSelectOption(FLD_CUSTPAGE_UOM, recUnits[uRec].getValue('internalid'), 
	                recUnits[uRec].getValue(HC_UNIT_NAME), false);*/
	    }
	    
	    if (!isEmpty(lstUOMParam))
	    	nlapiSetFieldValue(FLD_CUSTPAGE_UOM, lstUOMParam, true);
    }
    

    // HIDE PERCENT, AMOUNT AND REBATE COST FIELDS
    nlapiGetField(FLD_CUSTPAGE_PERCENT).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    nlapiGetField(FLD_CUSTPAGE_AMOUNT).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    nlapiGetField(FLD_CUSTPAGE_REBATE_COST).setDisplayType(HC_DISPLAY_TYPE.Hidden);

    // SET CALCULATION METHOD DEFAULT VALUES
    if (!isEmpty(lstCalcMethodParam))
        nlapiSetFieldValue(FLD_CUSTPAGE_CALC_METHOD, lstCalcMethodParam, true);
    
    //DISABLE CHECKBOXES
    disableEnableCheckboxes();
    
    //DISABLE/ENABLE PRICE PASS THROUGH FIELDS ONLOAD OF PAGE
    var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_TYPE);
    
    if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Percent){
        nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_VAL, true);
    }else if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Value){
        nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_PERC, true);
    }
}

/*
 * Disables and enables the checkboxes depending on which are selected
 */
function disableEnableCheckboxes(){
    //Item Tab
    nlapiGetField(FLD_CUSTPAGE_ITEM_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_SPEC).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_GROUP).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    
    var stItemSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC);
    var stItemGroup = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP);
    var bLock = (nlapiGetFieldValue(FLD_CUSTPAGE_RAD_COUNT_PARAM) > 0) ? true : false;

    if (!bLock) {
        nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_SPEC).setDisplayType(HC_DISPLAY_TYPE.Normal);
        nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_GROUP).setDisplayType(HC_DISPLAY_TYPE.Normal);
    }
    if (stItemSpec == 'T' || stItemGroup == 'T') {
        nlapiGetField(FLD_CUSTPAGE_SELECT_ITEM_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
        if (stItemSpec == 'T') {
            nlapiGetField(FLD_CUSTPAGE_ITEM_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
    }
    
    //Customer Tab
    var objField = nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_ALL);
    if (!isEmpty(objField)) {
        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_ALL).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SPEC).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_GROUP).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        
        var stCustSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC);
        var stCustGroup = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP);
        var stCustAll = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL);

        if (!bLock) {
            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SPEC).setDisplayType(HC_DISPLAY_TYPE.Normal);
            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_GROUP).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
        if (stCustSpec == 'T' || stCustGroup == 'T') {
            if (stCustAll != 'T') {
                nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
                if (stCustSpec == 'T') {
                    if (!bLock) {
                        nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_ALL).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    }
    
                    nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH) == 'T') {
                        nlapiGetField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    }
                }
            } else if (!bLock) {
                nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_ALL).setDisplayType(HC_DISPLAY_TYPE.Normal);
            }
        }
    }

    //Vendor Tab
    objField = nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_ALL);
    if (!isEmpty(objField)) {
        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_ALL).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_VENDOR_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SPEC).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_GROUP).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        
        var stVendSpec = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC);
        var stVendGroup = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP);
        var stVendAll = nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL);

        if (!bLock) {
            nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SPEC).setDisplayType(HC_DISPLAY_TYPE.Normal);
            nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_GROUP).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
        if (stVendSpec == 'T' || stVendGroup == 'T') {
            if (stVendAll != 'T') {
                nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
                if (stVendSpec == 'T') {
                    if (!bLock) {
                        nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_ALL).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    }
                    
                    nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH) == 'T') {
                        nlapiGetField(FLD_CUSTPAGE_VENDOR_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                    }
                }
            } else if (!bLock) {
                nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_ALL).setDisplayType(HC_DISPLAY_TYPE.Normal);
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
var blSystemInit = false;
function selectAll_FieldChanged(type, name, linenum) {
    //Item Fields
    if (name == FLD_CUSTPAGE_SELECT_ITEM_SPEC || name == FLD_CUSTPAGE_SELECT_ITEM_GROUP) {
        if (name == FLD_CUSTPAGE_SELECT_ITEM_SPEC && nlapiGetFieldValue(name) == 'T') {
            nlapiGetField(FLD_CUSTPAGE_ITEM_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_GROUP, 'F');
            }
        } else {
            blSystemInit = true;
            nlapiSetFieldValue(FLD_CUSTPAGE_ITEM_SEARCH, '');
            if (nlapiGetFieldValue(name) == 'T' &&
                    nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_ITEM_SPEC, 'F');
            }
        }
        
        disableEnableCheckboxes();
    }
    
    //Customer Fields
    else if (name == FLD_CUSTPAGE_SELECT_CUST_SPEC || name == FLD_CUSTPAGE_SELECT_CUST_GROUP) {
        if (name == FLD_CUSTPAGE_SELECT_CUST_SPEC && nlapiGetFieldValue(name) == 'T') {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_GROUP, 'F');
            }
        } else {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL, 'F');
            }
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH, 'F');
            }
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_CUSTOMER_SEARCH, '');
            }
            if (nlapiGetFieldValue(name) == 'T') {
                if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC) == 'T') {
                    blSystemInit = true;
                    nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SPEC, 'F');
                }
            }
        }
        
        disableEnableCheckboxes();
    } else if (name == FLD_CUSTPAGE_SELECT_CUST_ALL) {
        if (nlapiGetFieldValue(name) == 'T') {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH, 'F');
            }
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_CUSTOMER_SEARCH, '');
            }
            nlapiGetField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_SEARCH))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_CLASS, '');
            }
        } else {
            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
    } else if (name == FLD_CUSTPAGE_SELECT_CUST_SEARCH) {
    	if(nlapiGetFieldValue(name) == 'T'){
    		if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL) == 'T') {
	            blSystemInit = true;
	            nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_CUST_ALL, 'F');
	        }

            nlapiGetField(FLD_CUSTPAGE_SELECT_CUST_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
            nlapiGetField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
    	}else{
            nlapiGetField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);       	
        }
    }
    
    //Vendor Fields
    else if (name == FLD_CUSTPAGE_SELECT_VEND_SPEC || name == FLD_CUSTPAGE_SELECT_VEND_GROUP) {
        if (name == FLD_CUSTPAGE_SELECT_VEND_SPEC && nlapiGetFieldValue(name) == 'T') {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_GROUP, 'F');
            }
        } else {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL, 'F');
            }
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH, 'F');
            }
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_VENDOR_SEARCH, '');
            }
            if (nlapiGetFieldValue(name) == 'T') {
                if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC) == 'T') {
                    blSystemInit = true;
                    nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SPEC, 'F');
                }
            }
        }
        
        disableEnableCheckboxes();
    } else if (name == FLD_CUSTPAGE_SELECT_VEND_ALL) {
        if (nlapiGetFieldValue(name) == 'T') {
            if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH) == 'T') {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_SEARCH, 'F');
            }
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_VENDOR_SEARCH))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_VENDOR_SEARCH, '');
            }
            nlapiGetField(FLD_CUSTPAGE_VENDOR_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_CLASS))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_CLASS, '');
            }
        } else {
            nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
    } else if (name == FLD_CUSTPAGE_SELECT_VEND_SEARCH && nlapiGetFieldValue(name) == 'T') {
        if (nlapiGetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL) == 'T') {
            blSystemInit = true;
            nlapiSetFieldValue(FLD_CUSTPAGE_SELECT_VEND_ALL, 'F');
            nlapiGetField(FLD_CUSTPAGE_SELECT_VEND_CLASS).setDisplayType(HC_DISPLAY_TYPE.Normal);
        }
        nlapiGetField(FLD_CUSTPAGE_VENDOR_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Normal);
    }

    else if (name == FLD_CUSTPAGE_CALC_METHOD) {
        var fldCalcMethod = nlapiGetFieldValue(FLD_CUSTPAGE_CALC_METHOD);
        var arrCalcMethodFields = [
                FLD_CUSTRECORD_REB_CALC_COST_BASIS, FLD_CUSTRECORD_SHOW_PERCENT,
                FLD_CUSTRECORD_SHOW_AMOUNT, FLD_CUSTRECORD_COST];
        
        if (!isEmpty(fldCalcMethod)) {
            var objFieldValue = nlapiLookupField(REC_CALC_METHOD,
                    fldCalcMethod, arrCalcMethodFields);

            blSystemInit = true;
            showHideField(FLD_CUSTPAGE_PERCENT,
                    objFieldValue[FLD_CUSTRECORD_SHOW_PERCENT]);
            blSystemInit = true;
            showHideField(FLD_CUSTPAGE_AMOUNT,
                    objFieldValue[FLD_CUSTRECORD_SHOW_AMOUNT]);
            blSystemInit = true;
            showHideField(FLD_CUSTPAGE_REBATE_COST,
                    objFieldValue[FLD_CUSTRECORD_SHOW_REB_COST]);
            blSystemInit = true;
            nlapiSetFieldValue(FLD_CUSTPAGE_COST_BASIS,
                    objFieldValue[FLD_CUSTRECORD_REB_CALC_COST_BASIS]);
            
            //DEFAULT AMOUNT/PERCENT BASED ON PRICE PASS THROUGH FROM RA
//            var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_PERC));
//            var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_VAL));
//            
//            if(flPassThroughPerc > 0 && objFieldValue[FLD_CUSTRECORD_SHOW_PERCENT] == 'T')
//                nlapiSetFieldValue(FLD_CUSTPAGE_PERCENT, flPassThroughPerc);
//            
//            if(flPassThroughVal > 0 && objFieldValue[FLD_CUSTRECORD_SHOW_AMOUNT] == 'T')
//                nlapiSetFieldValue(FLD_CUSTPAGE_AMOUNT, flPassThroughVal);
        }else{
            if (!isEmpty(nlapiGetFieldValue(FLD_CUSTPAGE_COST_BASIS))) {
                blSystemInit = true;
                nlapiSetFieldValue(FLD_CUSTPAGE_COST_BASIS, '');
            }
        }
    }
    
    else if(name == FLD_CUSTPAGE_PASS_THROUGH_TYPE){
        var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_TYPE);
        
        nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_PERC, true);
        nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_VAL, true);
        
        if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Percent){
            nlapiSetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_VAL, '');
            nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_PERC, false);
        }else if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Value){
            nlapiSetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_PERC, '');
            nlapiDisableField(FLD_CUSTPAGE_PASS_THROUGH_VAL, false);
        }else if(isEmpty(lstPassThroughType)){
            nlapiSetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_PERC, '');
            nlapiSetFieldValue(FLD_CUSTPAGE_PASS_THROUGH_VAL, '');
        }
    }

    blSystemInit = false;
}

/**
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @return {Void}
 */
function adjustCriteria_validateField(type, name, linenum) {
    var bReturn = true;
    var intItemCount = nlapiGetLineItemCount(SBL_CUSTPAGE_ITEM);
    
    if (name == FLD_CUSTPAGE_SELECT_ITEM_SPEC ||
            name == FLD_CUSTPAGE_SELECT_ITEM_GROUP ||
            name == FLD_CUSTPAGE_ITEM_SEARCH ||
            name == FLD_CUSTPAGE_SELECT_ITEM_CLASS ||
            name == FLD_CUSTPAGE_SELECT_CUST_SPEC ||
            name == FLD_CUSTPAGE_SELECT_CUST_GROUP ||
            name == FLD_CUSTPAGE_SELECT_CUST_SEARCH ||
            name == FLD_CUSTPAGE_CUSTOMER_SEARCH ||
            name == FLD_CUSTPAGE_SELECT_CUST_CLASS ||
            name == FLD_CUSTPAGE_SELECT_CUST_ALL ||
            name == FLD_CUSTPAGE_SELECT_VEND_SPEC ||
            name == FLD_CUSTPAGE_SELECT_VEND_GROUP ||
            name == FLD_CUSTPAGE_SELECT_VEND_SEARCH ||
            name == FLD_CUSTPAGE_VENDOR_SEARCH ||
            name == FLD_CUSTPAGE_SELECT_VEND_CLASS ||
            name == FLD_CUSTPAGE_SELECT_VEND_ALL) {
        if (intItemCount > 0 && !blSystemInit) {
          bReturn = confirm('Search results should be updated before Processing for Eligibility. Kindly execute Search again.');
        }
    }
    blSystemInit = false;
    
    return bReturn;
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */
function checkSublistEmpty(stRecordType, sblResults){
    var intLineCount = nlapiGetLineItemCount(sblResults);
    var intTotalSelected = 0;
    
    for(var line = 1; line <= intLineCount; line++){
        if(nlapiGetLineItemValue(sblResults, 'custpage_rm_select_'+stRecordType, 
                line) == 'T') intTotalSelected++;
    }
    
    if(intLineCount > 0 && intTotalSelected == 0) return true;
}

function getSublistCountPerPage(objParams){
    var stType = objParams.stType,
        sblItemSearch = objParams.sblItemSearch,
        arrItemClass = objParams.arrItemClass,
        sblCustVendSearch = objParams.sblCustVendSearch,
        arrEntityClass = objParams.arrEntityClass,
        bIncludeAllEntities = objParams.bIncludeAllEntities,
        idSubsidiary = objParams.idSubsidiary,
        idCurrency = objParams.idCurrency;
    
    var arrCount = [];
    var arrCountResults = [];
    var arResultsLength = [], intTotalResults = 0;
    
    if (isEmpty(stType) || stType == HC_ITEM) {
        var objItemSearch = null;
        var arrFilter = null;
        if (!isEmpty(arrItemClass)) {
            arrFilter = filterSubsidiaryCurrency(HC_ITEM, idSubsidiary, idCurrency);
            arrFilter.push(new nlobjSearchFilter(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION, null, 'anyof', arrItemClass));
        }
            
        if (!isEmpty(sblItemSearch)) {
            objItemSearch = nlapiSearchRecord(HC_ITEM, sblItemSearch, arrFilter, [new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count')]);//getAllResults(HC_ITEM, sblItemSearch, arrFilter);
        } else {
            var arrCol = [];
            arrCol.push(new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count'));
            //arrCol.push(new nlobjSearchColumn(FLD_NAME));
            
            objItemSearch = nlapiSearchRecord(HC_ITEM, null, arrFilter, arrCol);//getAllResults(HC_ITEM, null, arrFilter, arrCol);
        }

        if(!isEmpty(objItemSearch)){
            //var objItemResults = objItemSearch.results;
            arrCount.push([
                objItemSearch[0].getValue(HC_INTERNAL_ID, null, 'count'),//objItemResults.length,
                HC_ITEM
            ]);
        }else{
            var stItemSearchClass = (objParams.bIsItemClass == 'T') ? 'Classification' : 'Search';
            
            arrCountResults.push(HC_ITEM.capitalizeFirstLetter() + ' ' + stItemSearchClass +  ': There are no results to display. '
                    + 'Please select the correct criteria for searching and refresh the page.');
        }
    } else if (bIncludeAllEntities != 'T' && (stType == HC_CUSTOMER || stType == HC_VENDOR)) {
        //Check Item Search
        var objItemSearch = null;
        var arrItemFilter = null;
        
        if (!isEmpty(arrItemClass)) {
            arrItemFilter = filterSubsidiaryCurrency(HC_ITEM, idSubsidiary, idCurrency);
            arrItemFilter.push(new nlobjSearchFilter(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION, null, 'anyof', arrItemClass));
        }
        
        if (!isEmpty(sblItemSearch)) {
            objItemSearch = nlapiSearchRecord(HC_ITEM, sblItemSearch, arrItemFilter, [new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count')]); //getAllResults(HC_ITEM, sblItemSearch, arrItemFilter);
        } else {
            var arrItemCol = [];
            arrItemCol.push(new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count'));
            //arrItemCol.push(new nlobjSearchColumn(FLD_NAME));
            
            objItemSearch = nlapiSearchRecord(HC_ITEM, null, arrItemFilter, arrItemCol);//getAllResults(HC_ITEM, null, arrItemFilter, arrItemCol);
        }
        
        if(!isEmpty(objItemSearch)){
            //var objItemResults = objItemSearch.results;
            arrCount.push([
                objItemSearch[0].getValue(HC_INTERNAL_ID, null, 'count'),//objItemResults.length,
                HC_ITEM
            ]);
        }else{
            var stItemSearchClass = (objParams.bIsItemClass == 'T') ? 'Classification' : 'Search';
            
            arrCountResults.push(HC_ITEM.capitalizeFirstLetter() + ' ' + stItemSearchClass +  ': There are no results to display. '
                    + 'Please select the correct criteria for searching and refresh the page.');
        }
        
        //Check Customer/Vendor Search
        var objCustVendSearch = null;
        var arrFilter = null;
        arrFilter = filterSubsidiaryCurrency(stType, idSubsidiary, idCurrency);

        if (!isEmpty(arrEntityClass)) {
            if (stType == HC_VENDOR) {
                arrFilter.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION, null, 'anyof', arrEntityClass));
            } else if (stType == HC_CUSTOMER) {
                arrFilter.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION, null, 'anyof', arrEntityClass));
            }
        }
        
        if (!isEmpty(sblCustVendSearch)) {
            objCustVendSearch = nlapiSearchRecord(stType, sblCustVendSearch, arrFilter, [new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count')]);//getAllResults(stType, sblCustVendSearch, arrFilter);
        } else {
            var arrCol = [];
            arrCol.push(new nlobjSearchColumn(HC_INTERNAL_ID, null, 'count'));
//            arrCol.push(new nlobjSearchColumn(HC_ENTITY_ID));
//            arrCol.push(new nlobjSearchColumn(HC_COMPANY_NAME));
            
            var objCustVendSearch = nlapiSearchRecord(stType, null, arrFilter, arrCol);//getAllResults(stType, null, arrFilter, arrCol);
        }

        if(!isEmpty(objCustVendSearch)){
            //var objCustVendResults = objCustVendSearch.results;
            arrCount.push([
                   objCustVendSearch[0].getValue(HC_INTERNAL_ID, null, 'count'),//objCustVendResults.length,
                   stType
           ]);
        }else{
            var stCustVendSearchClass = (objParams.bIsCustVendClass == 'T') ? 'Classification' : 'Search';
            
            arrCountResults.push(stType.capitalizeFirstLetter() + ' ' + stCustVendSearchClass +  ': There are no results to display. '
                    + 'Please select the correct criteria for searching and refresh the page.');
        }

        if(bIncludeAllEntities == 'T' && !isEmpty(arrCount)){
            //VALIDATE NUMBER OF ITEM SEARCH RESULTS ONLY
            if (forceParseFloat(arrCount[0][0]) > 500)
                arrCountResults.push(String(arrCount[0][1]).capitalizeFirstLetter()
                    + ' Search: Total Number of Items returned in the search exceeds 500 records. '
                    +'Please modify the search to allow for 500 items and Entities.');
        }else{
            //VALIDATE COMBINATION OF ITEM AND ENTITY SEARCH RESULTS
            for (var i = 0; i < arrCount.length; i++) {
                if(arrCount[i][0] > 0) arResultsLength.push(arrCount[i][0]);
            }
            if(arResultsLength.length > 1){
                //alert(arResultsLength[0] + ':' + arResultsLength[1]);
                intTotalResults = multiplyArray(arResultsLength);
                if(intTotalResults > 5000) arrCountResults.push("If 'All Customers' or 'All Vendors' is not selected, "
                        + "the total possible combinations of the saved searches (Item*Customer or Item*Vendor) should not exceed 5,000 Rebate Agreement Detail records. "
                        + "Please modify both searches to allow for creation of up to 5,000 Rebate Agreement Detail records.");
            }
        }
    }
    
    return arrCountResults;
}

function filterSubsidiaryCurrency(stRecordType, idSubsidiary, idCurrency){
    var arFilter = [];
    
    arFilter.push(new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'));
    if(stRecordType != HC_ITEM){
        if(HC_OBJ_FEATURE.bMultiCurrency){
            arFilter.push(new nlobjSearchFilter(HC_CURRENCY, stRecordType+'CurrencyBalance', 
                'anyof', idCurrency)); 
        }/*else{
            arFilter.push(new nlobjSearchFilter(HC_CURRENCY, null, 'anyof',
                    idCurrency));
        }*/
    }
    
    
    if (HC_OBJ_FEATURE.blnOneWorld == true)
        arFilter.push(new nlobjSearchFilter(HC_SUBSIDIARY, null, 'anyof',
                idSubsidiary));
    
    return arFilter;
}

function multiplyArray(array) {
    if(!isEmpty(array)){
        return array.reduce(function(n, product) { return product * n; });
    } 
}

function validateRecordType(arrSearchType) {
    var arrValResults = [];
    for (var i = 0; i < arrSearchType.length; i++) {
        var objSearchRecordType = nlapiLoadSearch(null, arrSearchType[i][0]);
        if(arrSearchType[i][1] == HC_ITEM){
            var stItemType = objSearchRecordType.type.replace('resale', '').replace('sale', '').replace('purchase', '');
            if(HC_ITEM_TYPES.indexOf(stItemType) == -1)
                arrValResults.push(arrSearchType[i][1].capitalizeFirstLetter()
                        + ' Search: You can only enter a Saved Search with a record type '
                        + arrSearchType[i][1] + '.');
            
        }else if (objSearchRecordType.type != arrSearchType[i][1]){
            arrValResults.push(arrSearchType[i][1].capitalizeFirstLetter()
                          + ' Search: You can only enter a Saved Search with a record type '
                          + arrSearchType[i][1] + '.');
        }
            
    }
    return arrValResults;
}

function showHideField(fld, bool, setInline) {
    var stDisplayType = (bool == 'T') ? stDisplayType = HC_DISPLAY_TYPE.Normal
            : stDisplayType = HC_DISPLAY_TYPE.Hidden;
    if (stDisplayType == HC_DISPLAY_TYPE.Hidden)
        nlapiSetFieldValue(fld, '');
    nlapiGetField(fld).setDisplayType(stDisplayType);
}