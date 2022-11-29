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
 * 1.00       11 Mar 2015     Roxanne Audette   Initial version.
 * 2.00       23 Jan 2017     Paolo de Leon     Rebates v2.0
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

function procSearchItemCust_FormSuitelet(request, response) {
    var objForm = nlapiCreateForm('Define Rebate Eligibility', false);

    if (request.getMethod() == 'GET') {
        var loadType = request.getParameter(HC_REQUEST_PARAM.LoadType);
        var lstRebateType = request.getParameter(HC_REQUEST_PARAM.RebateType);
        var idRebateAgreement = request
                .getParameter(HC_REQUEST_PARAM.Agreement);
        var stStatus = request
                .getParameter(HC_REQUEST_PARAM.AgrStatus);
        var bIncludeAllEntities = request
                .getParameter(HC_REQUEST_PARAM.IncludeEntities);
        var lstItemSearch = request.getParameter(HC_REQUEST_PARAM.ItemSearch);
        var lstCustomerSearch = request
                .getParameter(HC_REQUEST_PARAM.CustSearch);
        var lstVendorSearch = request.getParameter(HC_REQUEST_PARAM.VendSearch);
        var lstCalcMethod = request.getParameter(HC_REQUEST_PARAM.CalcMethod);
        var flPercent = request.getParameter(HC_REQUEST_PARAM.Percent);
        var flAmount = request.getParameter(HC_REQUEST_PARAM.Amount);
        var flRebateCost = request.getParameter(HC_REQUEST_PARAM.RebateCost);
        var lstUOM = request.getParameter(HC_REQUEST_PARAM.UOM);
        var idSubsidiary = request.getParameter(HC_REQUEST_PARAM.Subsidiary);
        var idCurrency = request.getParameter(HC_REQUEST_PARAM.Currency);
        var stType = request.getParameter(HC_REQUEST_PARAM.Type);
        var lstPassThroughType = request.getParameter(HC_REQUEST_PARAM.PassThroughType);
        var flPassThroughPerc = forceParseFloat(request.getParameter(HC_REQUEST_PARAM.PassThroughPerc));
        var flPassThroughVal = forceParseFloat(request.getParameter(HC_REQUEST_PARAM.PassThroughVal));
        
        var stItemClass = request.getParameter(HC_REQUEST_PARAM.ItemClass);
        var arrItemClass = (!isEmpty(stItemClass)) ? JSON.parse(stItemClass) : null;
        var stEntityClass = request.getParameter(HC_REQUEST_PARAM.EntityClass);
        var arrEntityClass = (!isEmpty(stEntityClass)) ? JSON.parse(stEntityClass) : null;
        
        var stItemSel = request.getParameter(HC_REQUEST_PARAM.ItemSelect);
        var stEntSel = request.getParameter(HC_REQUEST_PARAM.EntitySelect);
        
        var intRADCount = request.getParameter(HC_REQUEST_PARAM.RADCount);
        var stEntSpecOrClass = (intRADCount > 0) ? request.getParameter(HC_REQUEST_PARAM.EntSpecOrClass) : '';
        var stItemSpecOrClass = (intRADCount > 0) ? request.getParameter(HC_REQUEST_PARAM.ItemSpecOrClass) : '';
        var bIsTiered = request.getParameter(HC_REQUEST_PARAM.Tiered);

        // HIDDEN FIELDS - STORES FIELD VALUES FROM THE AGREEMENT RECORD
        objForm.addField(FLD_CUSTPAGE_REBATE_AGREEMENT, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(idRebateAgreement);
        objForm.addField(FLD_CUSTPAGE_AGREEMENT_STATUS, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(stStatus);
        objForm.addField(FLD_CUSTPAGE_ALL_ENTITIES, HC_FIELD_TYPE.Checkbox).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(bIncludeAllEntities);
        objForm.addField(FLD_CUSTPAGE_CALC_METHOD_PARAM, HC_FIELD_TYPE.Text)
                .setDisplayType(HC_DISPLAY_TYPE.Hidden).setDefaultValue(lstCalcMethod);
        if(HC_OBJ_FEATURE.bUOM){
        	objForm.addField(FLD_CUSTPAGE_UOM_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(lstUOM);
        }
        objForm.addField(FLD_CUSTPAGE_CURRENCY, HC_FIELD_TYPE.Select, HC_CURRENCY.capitalizeFirstLetter(),
                HC_CURRENCY).setDisplayType(HC_DISPLAY_TYPE.Hidden)
                .setDefaultValue(idCurrency);
        objForm.addField(FLD_CUSTPAGE_RAD_COUNT_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(intRADCount);
        objForm.addField(FLD_CUSTPAGE_ENT_SPECORCLASS_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(stEntSpecOrClass);
        objForm.addField(FLD_CUSTPAGE_ITEM_SPECORCLASS_PARAM, HC_FIELD_TYPE.Text).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(stItemSpecOrClass);
        objForm.addField(FLD_CUSTPAGE_IS_TIERED, HC_FIELD_TYPE.Checkbox).setDisplayType(
                HC_DISPLAY_TYPE.Hidden).setDefaultValue(bIsTiered);
        
        if (HC_OBJ_FEATURE.blnOneWorld == true)
            objForm.addField(FLD_CUSTPAGE_SUBSIDIARY, HC_FIELD_TYPE.Select, HC_SUBSIDIARY.capitalizeFirstLetter(),
                    HC_SUBSIDIARY).setDisplayType(HC_DISPLAY_TYPE.Hidden).setDefaultValue(
                    idSubsidiary);

        // VALUE FIELDS
        objForm.addField(FLD_CUSTPAGE_REBATE_TYPE, HC_FIELD_TYPE.Select,
                'Rebate Agreement Type', LIST_REB_TYPE)
                .setDisplayType(HC_DISPLAY_TYPE.Inline).setDefaultValue(lstRebateType);
        objForm.addField(FLD_CUSTPAGE_CALC_METHOD, HC_FIELD_TYPE.Select,
                'Rebate Calculation Method');
        objForm.addField(FLD_CUSTPAGE_COST_BASIS, HC_FIELD_TYPE.Select, 'Cost Basis',
                LIST_COST_BASIS).setDisplayType(HC_DISPLAY_TYPE.Inline);
        objForm.addField(FLD_CUSTPAGE_PERCENT, HC_FIELD_TYPE.Percent, 'Percent')
                .setDefaultValue(flPercent);
        objForm.addField(FLD_CUSTPAGE_AMOUNT, HC_FIELD_TYPE.Float, 'Amount')
                .setDefaultValue(flAmount);
        objForm.addField(FLD_CUSTPAGE_REBATE_COST, HC_FIELD_TYPE.Currency, 'Rebate Cost')
                .setDefaultValue(flRebateCost);
        if(HC_OBJ_FEATURE.bUOM){
        	objForm.addField(FLD_CUSTPAGE_UOM, HC_FIELD_TYPE.Select, 'UOM');
        }
        
        
        //IF RA REB TYPE IS VROS, CREATE PRICE PASS THROUGH FIELDS
        if(lstRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale){
            objForm.addField(FLD_CUSTPAGE_PASS_THROUGH_TYPE, HC_FIELD_TYPE.Select, 'Price Pass Through Type', LIST_PASS_THROUGH_TYPE).setDefaultValue(lstPassThroughType);
            var fldPassThroughPerc = objForm.addField(FLD_CUSTPAGE_PASS_THROUGH_PERC, HC_FIELD_TYPE.Percent, 'Price Pass Through %');
            var fldPassThroughVal = objForm.addField(FLD_CUSTPAGE_PASS_THROUGH_VAL, HC_FIELD_TYPE.Currency, 'Price Pass Through Value');
            
            if(flPassThroughPerc > 0) fldPassThroughPerc.setDefaultValue(flPassThroughPerc);
            if(flPassThroughVal > 0) fldPassThroughVal.setDefaultValue(flPassThroughVal);
        }
        
        
        objForm.setScript('customscript_nsts_rm_rasuiteletbutton_cs');
        
        createSublist(request, objForm, HC_REQUEST_PARAM.ItemSearch, HC_ITEM, HC_ITEM.capitalizeFirstLetter(), arrItemClass);
        nlapiLogExecution('debug', 'lstRebateType', lstRebateType);
        if (lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Purchase) {
            createSublist(request, objForm, HC_REQUEST_PARAM.CustSearch, HC_CUSTOMER, HC_CUSTOMER.capitalizeFirstLetter(), arrEntityClass);
        } else { 
            createSublist(request, objForm, HC_REQUEST_PARAM.VendSearch, HC_VENDOR, HC_VENDOR.capitalizeFirstLetter(), arrEntityClass);
        }
        if (loadType == 'search') {
            objForm.addSubmitButton('Save');

           // objForm.addButton('custpage_btn_save', 'Save', "alert('An email will be sent after process execution is done on the background.');document.forms[0].submit();");
            createSublistOnTab(request, objForm, HC_REQUEST_PARAM.ItemSearch, HC_ITEM, 'Item Search Results', arrItemClass);
            if (!(!isEmpty(bIncludeAllEntities) && bIncludeAllEntities == 'T')) {
                if (stEntSel.indexOf('cust') > -1) {
                    createSublistOnTab(request, objForm, HC_REQUEST_PARAM.EntitySearch, HC_CUSTOMER, 'Customer Search Results', arrEntityClass);
                } else if (stEntSel.indexOf('vend') > -1) {
                    createSublistOnTab(request, objForm, HC_REQUEST_PARAM.EntitySearch, HC_VENDOR, 'Vendor Search Results', arrEntityClass);
                }
            }
        }
        autoCheckBoxInTab(objForm, request);

        response.writePage(objForm);
    } else {
        var idRebateAgreement = request
                .getParameter(FLD_CUSTPAGE_REBATE_AGREEMENT);
        var lstCostBasis = request.getParameter(FLD_CUSTPAGE_COST_BASIS);
        var flPercent = request.getParameter(FLD_CUSTPAGE_PERCENT);
        var flAmount = request.getParameter(FLD_CUSTPAGE_AMOUNT);
        var flRebateCost = request.getParameter(FLD_CUSTPAGE_REBATE_COST); 
        var lstCalcMethod = request
                .getParameter(FLD_CUSTPAGE_CALC_METHOD);
        var lstUOM = request.getParameter(FLD_CUSTPAGE_UOM);
        var lstRebateType = request.getParameter(FLD_CUSTPAGE_REBATE_TYPE);
        var bIncludeAll = (request.getParameter('custpage_rm_select_' + HC_CUSTOMER + '_spec_all') == 'T'
            || request.getParameter('custpage_rm_select_' + HC_VENDOR + '_spec_all') == 'T') ? 'T' : 'F';
        var arrItemResults = getSublistDetails(request,
                SBL_CUSTPAGE_ITEM, HC_ITEM);
        var arrCustomerResults = getSublistDetails(request,
                SBL_CUSTPAGE_CUSTOMERS, HC_CUSTOMER);
        var arrVendorResults = getSublistDetails(request,
                SBL_CUSTPAGE_VENDORS, HC_VENDOR);
        var arrItemClass = request.getParameter('custpage_rm_class_' + HC_ITEM);
            arrItemClass = (!isEmpty(arrItemClass)) ? arrItemClass.replace(/\D/g,',') : [];
        var arrCustClass = request.getParameter('custpage_rm_class_' + HC_CUSTOMER);
            arrCustClass = (!isEmpty(arrCustClass)) ? arrCustClass.replace(/\D/g,',') : [];
        var arrVendClass = request.getParameter('custpage_rm_class_' + HC_VENDOR);
            arrVendClass = (!isEmpty(arrVendClass)) ? arrVendClass.replace(/\D/g,',') : [];
            
        var flPassThroughPerc = forceParseFloat(request.getParameter(FLD_CUSTPAGE_PASS_THROUGH_PERC));
        var flPassThroughVal = forceParseFloat(request.getParameter(FLD_CUSTPAGE_PASS_THROUGH_VAL));
        
        var arrSchedParam = [];
        arrSchedParam['custscript_nsts_rm_is_entity_group'] = JSON.stringify({
            item    : request.getParameter('custpage_rm_select_' + HC_ITEM + '_group'),
            customer: request.getParameter('custpage_rm_select_' + HC_CUSTOMER + '_group'),
            vendor  : request.getParameter('custpage_rm_select_' + HC_VENDOR + '_group'),
            incCust : request.getParameter('custpage_rm_select_' + HC_CUSTOMER + '_spec_all'),
            incVend : request.getParameter('custpage_rm_select_' + HC_VENDOR + '_spec_all')
        });
        
        arrSchedParam['custscript_nsts_rm_item_class'] = arrItemClass;
        arrSchedParam['custscript_nsts_rm_customer_class'] = arrCustClass;
        arrSchedParam['custscript_nsts_rm_vendor_class'] =  arrVendClass;
        arrSchedParam[SPARAM_ITEM_IDS] = JSON.stringify(arrItemResults);
        arrSchedParam[SPARAM_CUSTOMER_IDS] = JSON.stringify(arrCustomerResults);
        arrSchedParam[SPARAM_VENDOR_IDS] = JSON.stringify(arrVendorResults);
        arrSchedParam[SPARAM_CALC_METHOD] = lstCalcMethod;
        arrSchedParam[SPARAM_COST_BASIS] = lstCostBasis;
        arrSchedParam[SPARAM_PERCENT] = flPercent;
        arrSchedParam[SPARAM_AMOUNT] = flAmount;
        arrSchedParam[SPARAM_REBATE_COST] = flRebateCost;
        arrSchedParam[SPARAM_REBATE_AGREEMENT] = idRebateAgreement;
        arrSchedParam[SPARAM_UOM] = lstUOM;
        arrSchedParam[SPARAM_REBATE_TYPE] = lstRebateType;
        arrSchedParam[SPARAM_INCLUDE_ALL] = bIncludeAll;
        if(flPassThroughPerc > 0) arrSchedParam[SPARAM_PASS_THROUGH_PERC] = flPassThroughPerc;
        if(flPassThroughVal > 0) arrSchedParam[SPARAM_PASS_THROUGH_VAL] = flPassThroughVal;
        
        nlapiScheduleScript(SCRIPT_CREATE_AGR_SS, null,
                arrSchedParam);
        
        var stScheduledScript = null;
        var objScriptSearch = nlapiSearchRecord('scheduledscript', null, new nlobjSearchFilter('scriptid', null, 'is',
                SCRIPT_CREATE_AGR_SS), new nlobjSearchColumn(HC_INTERNAL_ID));
        
        if(!isEmpty(objScriptSearch)){
            stScheduledScript = objScriptSearch[0].getValue(HC_INTERNAL_ID);
        }
    
        var arParam = new Array();
        var dateToday = new Date();
        var stDateToday = String(nlapiDateToString(dateToday, 'date'));
        arParam['daterange'] = 'TODAY';
        arParam['datefrom'] = stDateToday;
        arParam['dateto'] = stDateToday;
        arParam['scripttype'] = stScheduledScript;
        arParam['datemodi'] = 'WITHIN';
        arParam['date'] = 'TODAY';
        //nlapiSetRedirectURL('TASKLINK', 'LIST_SCRIPTSTATUS', null, false, arParam);
        nlapiSetRedirectURL('RECORD', 'customrecord_nsts_rm_rebate_agreement', idRebateAgreement, false );
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */

/*
 * New method to generate the tabs for RM v2
 */
function createSublist(request, form, stSeachParam, idRecordType, stTabLabel, arrClass) {
    var objTab = form.addTab('custpage_rm_' + idRecordType + '_tab', stTabLabel);
    
    //REMOVE condition in sprint 4 (dynamic searching)
    if (idRecordType == HC_ITEM) {
        form.addButton(HC_SEARCH_BTN_SL + idRecordType, 'Search', 'searchItemsCustomers(\'' + idRecordType + '\');');
    }
    
    var fldMsg = form.addField('custpage_rm_msg_' + idRecordType, HC_FIELD_TYPE.InlineHtml, null, null, 'custpage_rm_' + idRecordType + '_tab');
    fldMsg.setDefaultValue(stTabLabel + ' Classification can be used to filter down the results of the ' + stTabLabel + ' Search.');
    fldMsg.setLayoutType('startrow', 'startcol');
    
    form.addField('custpage_rm_select_' + idRecordType + '_spec', HC_FIELD_TYPE.Checkbox,
            'Select ' + idRecordType + ' Specific', null, 'custpage_rm_' + idRecordType + '_tab');
    if (idRecordType != HC_ITEM) {
        var stAll = (request.getParameter('custpage_rm_select_' + idRecordType + '_spec_all') == 'T' || request.getParameter(HC_REQUEST_PARAM.IncludeEntities) == 'T') ?
                'T' : 'F';
        form.addField('custpage_rm_select_' + idRecordType + '_spec_all', HC_FIELD_TYPE.Checkbox,
                'All ' + idRecordType + 's', null, 'custpage_rm_' + idRecordType + '_tab')
                .setDefaultValue(stAll);
        form.addField('custpage_rm_select_' + idRecordType + '_spec_search', HC_FIELD_TYPE.Checkbox,
                idRecordType + ' Search', null, 'custpage_rm_' + idRecordType + '_tab')
                .setDefaultValue(request.getParameter('custpage_rm_select_' + idRecordType + '_spec_search'));
    }
    
    var arrFil = [];
    if (idRecordType == HC_ITEM) {
        form.addField(FLD_CUSTPAGE_ITEM_SEARCH,
                HC_FIELD_TYPE.Select, 'Item Search', HC_TRANS_SEARCH, 'custpage_rm_' + idRecordType + '_tab')
                .setDefaultValue(request.getParameter(FLD_CUSTPAGE_ITEM_SEARCH));
        arrFil = [new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE, null, 'is', HC_CLASSIFICATION_TYPE.Item)];
    } else if (idRecordType == HC_CUSTOMER) {
        form.addField(FLD_CUSTPAGE_CUSTOMER_SEARCH,
                HC_FIELD_TYPE.Select, 'Search', HC_TRANS_SEARCH, 'custpage_rm_' + idRecordType + '_tab')
                .setDefaultValue(request.getParameter(FLD_CUSTPAGE_CUSTOMER_SEARCH));
        arrFil = [new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE, null, 'is', HC_CLASSIFICATION_TYPE.Customer)];
    } else if (idRecordType == HC_VENDOR) {
        form.addField(FLD_CUSTPAGE_VENDOR_SEARCH,
                HC_FIELD_TYPE.Select, 'Search', HC_TRANS_SEARCH, 'custpage_rm_' + idRecordType + '_tab')
                .setDefaultValue(request.getParameter(FLD_CUSTPAGE_VENDOR_SEARCH));
        arrFil = [new nlobjSearchFilter(FLD_CUSTRECORD_NSTS_RM_CLASSIFICATION_TYPE, null, 'is', HC_CLASSIFICATION_TYPE.Vendor)];
    }
    
    form.addField('custpage_rm_select_' + idRecordType + '_group', HC_FIELD_TYPE.Checkbox,
            'Select ' + idRecordType + ' Classification', null, 'custpage_rm_' + idRecordType + '_tab').setLayoutType('midrow', 'startcol');

    var arrClassRes = getAllResults(null, SS_CLASS_SEARCH, arrFil);
    
    var fldClass = form.addField('custpage_rm_class_' + idRecordType, HC_FIELD_TYPE.Multi, idRecordType + ' Classification', 
            null, 'custpage_rm_' + idRecordType + '_tab');
    
    if (!isEmpty(arrClassRes)) {
        var objResults = arrClassRes.results;
        for (var i = 0; i < objResults.length; i++) {
            if (!isEmpty(arrClass) && arrClass.indexOf(objResults[i].getId()) > -1) {
                fldClass.addSelectOption(objResults[i].getId(), objResults[i].getValue(FLD_NAME), true);
            } else {
                fldClass.addSelectOption(objResults[i].getId(), objResults[i].getValue(FLD_NAME));
            }
        }
        fldClass.setDefaultValue(request.getParameter('custpage_rm_class_' + idRecordType));
    }
    
    form.addSubTab('custpage_rm_' + idRecordType + '_list', stTabLabel + ' List', 'custpage_rm_' + idRecordType + '_tab');
}

function autoCheckBoxInTab(form, request) {
    var loadType = request.getParameter(HC_REQUEST_PARAM.LoadType);
    var lstRebateType = request.getParameter(HC_REQUEST_PARAM.RebateType);
    
    if (loadType == 'search') {
        var stParam = request.getParameter(HC_REQUEST_PARAM.ItemSelect);
        var stSearch = request.getParameter(HC_REQUEST_PARAM.ItemSearch);
        if (stParam == 'grp') {
            form.getField(FLD_CUSTPAGE_SELECT_ITEM_GROUP).setDefaultValue('T');
        } else if (!isEmpty(stSearch)) {
            form.getField(FLD_CUSTPAGE_SELECT_ITEM_SPEC).setDefaultValue('T');
            form.getField(FLD_CUSTPAGE_ITEM_SEARCH).setDefaultValue(stSearch);
        }
        
        stParam = request.getParameter(HC_REQUEST_PARAM.EntitySelect);
        stSearch = request.getParameter(HC_REQUEST_PARAM.EntitySearch);
        if (stParam.indexOf('cust') > -1) {
            if (stParam.indexOf('group') > -1) {
                form.getField(FLD_CUSTPAGE_SELECT_CUST_GROUP).setDefaultValue('T');
            } else {
                form.getField(FLD_CUSTPAGE_SELECT_CUST_SPEC).setDefaultValue('T');
                if (stParam.indexOf('all') > -1) {
                    form.getField(FLD_CUSTPAGE_SELECT_CUST_ALL).setDefaultValue('T');
                } else if (stParam.indexOf('search') > -1) {
                    form.getField(FLD_CUSTPAGE_SELECT_CUST_SEARCH).setDefaultValue('T');
                    form.getField(FLD_CUSTPAGE_CUSTOMER_SEARCH).setDefaultValue(stSearch);
                }
            }
        } else if (stParam.indexOf('vend') > -1) {
            if (stParam.indexOf('group') > -1) {
                if (form.getField(FLD_CUSTPAGE_SELECT_VEND_GROUP)) form.getField(FLD_CUSTPAGE_SELECT_VEND_GROUP).setDefaultValue('T');
            } else {
                form.getField(FLD_CUSTPAGE_SELECT_VEND_SPEC).setDefaultValue('T');
                if (stParam.indexOf('all') > -1) {
                    form.getField(FLD_CUSTPAGE_SELECT_VEND_ALL).setDefaultValue('T');
                } else if (stParam.indexOf('search') > -1) {
                    form.getField(FLD_CUSTPAGE_SELECT_VEND_SEARCH).setDefaultValue('T');
                    form.getField(FLD_CUSTPAGE_VENDOR_SEARCH).setDefaultValue(stSearch);
                }
            }
        }
    } else {
        var intRADCount = request.getParameter(HC_REQUEST_PARAM.RADCount);
        var stEntSpecOrClass = (intRADCount > 0) ? request.getParameter(HC_REQUEST_PARAM.EntSpecOrClass) : '';
        var stItemSpecOrClass = (intRADCount > 0) ? request.getParameter(HC_REQUEST_PARAM.ItemSpecOrClass) : '';
        
        if (stItemSpecOrClass == 'spec') {
            form.getField(FLD_CUSTPAGE_SELECT_ITEM_SPEC).setDefaultValue('T');
        } else if (stItemSpecOrClass == 'class') {
            form.getField(FLD_CUSTPAGE_SELECT_ITEM_GROUP).setDefaultValue('T');
        }
        
        if (stEntSpecOrClass == 'spec') {
            if (lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Purchase) {
                form.getField(FLD_CUSTPAGE_SELECT_CUST_SPEC).setDefaultValue('T');
            } else {
                form.getField(FLD_CUSTPAGE_SELECT_VEND_SPEC).setDefaultValue('T');
            }
        } else if (stEntSpecOrClass == 'class') {
            if (lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Purchase) {
                form.getField(FLD_CUSTPAGE_SELECT_CUST_GROUP).setDefaultValue('T');
            } else {
                form.getField(FLD_CUSTPAGE_SELECT_VEND_GROUP).setDefaultValue('T');
            }
        } else {
            if (lstRebateType != HC_REBATE_TYPE.Vendor_Rebate_on_Purchase) {
                form.getField(FLD_CUSTPAGE_SELECT_CUST_ALL).setDefaultValue('F');
            } else {
                form.getField(FLD_CUSTPAGE_SELECT_VEND_ALL).setDefaultValue('F');
            }
        }
    }
}

function createSublistOnTab(request, form, stSearchParam, idRecordType, stSublistLabel, arrClass) {
    var objSublist = form.addSubList(
            'custpage_rm_' + idRecordType + '_sublist', HC_FIELD_TYPE.List, stSublistLabel,
            'custpage_rm_' + idRecordType + '_tab');
    getColumnsRows({
        objSublist : objSublist,
        idRecordType : idRecordType,
        idSearch : request.getParameter(stSearchParam),
        idSubsidiary : request.getParameter(HC_REQUEST_PARAM.Subsidiary),
        idCurrency : request.getParameter(HC_REQUEST_PARAM.Currency),
        blnOneWorld : HC_OBJ_FEATURE.blnOneWorld,
        bMultiCurrency : HC_OBJ_FEATURE.bMultiCurrency,
        arrClass : arrClass
    });
}

function getColumnsRows(objParams) {
    var objSublist = objParams.objSublist;
    var idRecordType = objParams.idRecordType;
    var idSearch = objParams.idSearch;
    var arrClass = objParams.arrClass;
    var idSubsidiary = objParams.idSubsidiary;
    var idCurrency = objParams.idCurrency;
    var blnOneWorld = objParams.blnOneWorld;
    var bMultiCurrency = objParams.bMultiCurrency;
    var objFilter = [];
    
    objFilter.push(new nlobjSearchFilter(HC_IS_INACTIVE, null, 'is', 'F'));
    if (idRecordType != HC_ITEM){
        if(bMultiCurrency == true){
            objFilter.push(new nlobjSearchFilter(HC_CURRENCY, idRecordType+'CurrencyBalance', 
                    'anyof', idCurrency)); 
        }
    }
        
    if (blnOneWorld == true){
    	var arrVer = nlapiGetContext().getVersion().split('.'); nlapiLogExecution('debug', 'arrVer', arrVer);
      	if (idRecordType != HC_ITEM && (arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
        	objFilter.push(new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', idSubsidiary));
        } else {
        	objFilter.push(new nlobjSearchFilter(HC_SUBSIDIARY, null, 'anyof', idSubsidiary));
        }
    }
    
    var objSearch = null;
    var objColumn = null;
    if (!isEmpty(arrClass)) {
        if (idRecordType == HC_ITEM) {
            objFilter.push(new nlobjSearchFilter(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION, null, 'anyof', arrClass));
        } else if (idRecordType == HC_VENDOR) {
            objFilter.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION, null, 'anyof', arrClass));
        } else if (idRecordType == HC_CUSTOMER) {
            objFilter.push(new nlobjSearchFilter(FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION, null, 'anyof', arrClass));
        }
    }
    
    if (isEmpty(idSearch)) {
        objColumn = [];
        objColumn.push(new nlobjSearchColumn(HC_INTERNAL_ID));
        if (idRecordType == HC_ITEM) {
            objColumn.push(new nlobjSearchColumn(FLD_NAME));
            objColumn.push(new nlobjSearchColumn(FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION).setLabel(HC_CLASSIFICATION));
        } else if (idRecordType == HC_VENDOR) {
            objColumn.push(new nlobjSearchColumn(HC_ENTITY_ID));
            //objColumn.push(new nlobjSearchColumn('altname'));
            objColumn.push(new nlobjSearchColumn(HC_COMPANY_NAME));
            objColumn.push(new nlobjSearchColumn(FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION).setLabel(HC_CLASSIFICATION));
        } else if (idRecordType == HC_CUSTOMER) {
            objColumn.push(new nlobjSearchColumn(HC_ENTITY_ID));
          	//objColumn.push(new nlobjSearchColumn('altname'));
            objColumn.push(new nlobjSearchColumn(HC_COMPANY_NAME));
            objColumn.push(new nlobjSearchColumn(FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION).setLabel(HC_CLASSIFICATION));
        }
    }
    
    objSearch = getAllResults(idRecordType, idSearch, objFilter, objColumn);

    if (!isEmpty(objSearch)) {
        var objResults = objSearch.results;
        // CREATE COLUMNS
        objSublist.addField('custpage_rm_select_' + idRecordType, HC_FIELD_TYPE.Checkbox,
                HC_EXCLUDE);
        objSublist.addField('custpage_rm_internalid_' + idRecordType, HC_FIELD_TYPE.Text,
                'Internal Id').setDisplayType(HC_DISPLAY_TYPE.Hidden);
        objSublist.addField('custpage_rm_classid_' + idRecordType, HC_FIELD_TYPE.Text,
        'Classification Id').setDisplayType(HC_DISPLAY_TYPE.Hidden);
        var objColumns = objResults[0].getAllColumns(), label = '';

        for (var i = 0; i < objColumns.length; i++) {
            /*(objColumns[i].getName() == HC_ENTITY_ID) ? label = 'Name'
                    :*/ (isEmpty(objColumns[i].getLabel())) ? label = objColumns[i].getName() : label = objColumns[i].getLabel();
            if (label == FLD_CUSTITEM_NSTS_RM_ITEM_CLASSIFICATION ||
                    label == FLD_CUSTENTITY_NSTS_RM_VEN_CLASSIFICATION ||
                    label == FLD_CUSTENTITY_NSTS_RM_CUST_CLASSIFICATION) {
                label = HC_CLASSIFICATION;
            }
            
            objSublist.addField(objColumns[i].getName(), HC_FIELD_TYPE.TextArea, label);
        }

        // CREATE ROWS AND ADD SEARCH RESULT VALUES
        var arrValues = [];
        for (var i = 0; i < objResults.length; i++) {
            var arrList = [];
            arrList['custpage_rm_select_' + idRecordType] = 'F';
            arrList['custpage_rm_internalid_' + idRecordType] = objResults[i]
                    .getId();

            for (var j = 0; j < objColumns.length; j++) {
                arrList[objColumns[j].getName()] = (!isEmpty(objResults[i]
                .getText(objColumns[j].getName()))) ? objResults[i]
                        .getText(objColumns[j].getName()) : objResults[i]
                        .getValue(objColumns[j].getName());
                        
                arrList['custpage_rm_classid_' + idRecordType] = objResults[i]
                .getValue(objColumns[j].getName());
            }
            arrValues.push(arrList)
        }
        objSublist.setLineItemValues(arrValues);
    }
}

function getSublistDetails(request, sblInternalId, idRecordType) {
    var bIsItemGroup = request.getParameter('custpage_rm_select_' + idRecordType + '_group');
    var bIsEntSpecific = request.getParameter('custpage_rm_select_' + idRecordType + '_spec');
    var count = request.getLineItemCount(sblInternalId);
    var arrSchedParam = [];
    var arrClass      = [];
    for (var line = 1; line <= count; line++) {
        var fldExclude = request.getLineItemValue(sblInternalId,
                'custpage_rm_select_' + idRecordType, line);
        var idRecord = request.getLineItemValue(sblInternalId,
                'custpage_rm_internalid_' + idRecordType, line);
        var idClassification = request.getLineItemValue(sblInternalId,
                'custpage_rm_classid_' + idRecordType, line);
        
        if (fldExclude == 'T' && bIsItemGroup == 'T') {
            arrSchedParam.push({r: idRecordType, e: idRecord, c: idClassification});
            if(arrClass.indexOf(idClassification) <= -1)
                arrClass.push(idClassification);
        }else if(fldExclude == 'F' && bIsEntSpecific == 'T'){
            arrSchedParam.push(idRecord);
        }
    }
    
    return {
        arrSchedParam: arrSchedParam,
        arrClass     : arrClass
    };
}

/*
 * Creates the Define Tier button
 */
function createTierButton(objParams) {
    var objForm = objParams.objForm;
    var idRebateAgreement = objParams.idRebateAgreement;
    var lstCalcMethod = objParams.lstCalcMethod;
    var bTiered = objParams.bTiered;
    var intRADCount = objParams.intRADCount;
    var stItemSpecOrClass = objParams.stItemSpecOrClass;
    
    var sUrlSuitelet = nlapiResolveURL('SUITELET',
            SCRIPT_DEFINE_TIER,
            DEPLOY_DEFINE_TIER, false);
    var sUrlParam = sUrlSuitelet + '&loadType=search'
    + '&agreementId='+ idRebateAgreement 
    + '&calcMethod=' + lstCalcMethod
    + '&tiered=' + bTiered
    + "&itemSpecOrClass=" + stItemSpecOrClass
    + '&radCount=' + intRADCount;
    
    objForm.addButton(HC_BTN_DEFINE_TIER, 'Define Tiers', 'defineTiers()');
}