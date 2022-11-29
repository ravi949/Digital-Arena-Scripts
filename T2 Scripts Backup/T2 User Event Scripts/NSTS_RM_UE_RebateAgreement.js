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
 * This script is used for disabling, enabling and hiding of fields.
 * Also includes server side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2015     Roxanne Audette   Initial version.
 * 2.00       01 Sep 2015     Roxanne Audette   Rebates v2.0
 * 
 */

var HC_OBJ_FEATURE = new objFeature();

/*
 * ====================================================================
 * SERVER SIDE FUNCTIONS
 * ====================================================================
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
function procSearchItemCust_BeforeLoad(type, form, request) {

    var objExecution = nlapiGetContext().getExecutionContext();

    if(objExecution == HC_EXECUTION_CONTEXT.csvimport){
    	return true;
    }
    var bInactive = nlapiGetFieldValue(HC_IS_INACTIVE);
    var idRebateAgreement = nlapiGetRecordId();
    var lstRebateStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
    var bEligibleInProc = nlapiGetFieldValue(FLD_CUSTRECORD_ELIG_IN_PROC);
    var dateToday = new Date(); dateToday.setHours(0,0,0,0);

    /* CHANGE SUBSIDIARY FIELD DISPLAY TYPE DEPENDING OF THE ACCOUNT IS OW AND
       NON OW */
    if (HC_OBJ_FEATURE.blnOneWorld != true) {
        nlapiGetField(FLD_CUSTRECORD_SUBSIDIARY).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    } else {
        nlapiGetField(FLD_CUSTRECORD_SUBSIDIARY).setMandatory(true);
    }
    
    //HIDE DEFAULT UOM IF UOM FEATURE IS OFF
    if(!HC_OBJ_FEATURE.bUOM){
    	nlapiGetField(FLD_CUSTRECORD_UOM).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    	var fldUOM = nlapiGetLineItemField(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_UOM, 1);
    	if(!isEmpty(fldUOM)) fldUOM.setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }
    
    var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
    //SET SEARCH HYPERLINKS
//    nlapiSetFieldValue(FLD_CUSTRECORD_ITEM_LINK, getSearchUrl(HC_ITEM));
//    nlapiSetFieldValue(FLD_CUSTRECORD_CUST_LINK, getSearchUrl(HC_CUSTOMER));
//    nlapiSetFieldValue(FLD_CUSTRECORD_VEND_LINK, getSearchUrl(HC_VENDOR));
    
    //FIELD MANIPULATION PER PAGE TYPE
    if (type == HC_MODE_TYPE.Create || type == HC_MODE_TYPE.Copy) {
        nlapiSetFieldValue(FLD_CUSTRECORD_STATUS, HC_AGR_STATUS.Unapprove);
        nlapiGetField(FLD_CUSTRECORD_STATUS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        if (type == HC_MODE_TYPE.Create) {
            var objCompanyInfo = nlapiLoadConfiguration(HC_COMPANY_INFO);
            var stBaseCurrency = objCompanyInfo
                    .getFieldValue(HC_ACCT_BASE_CURRENCY);
            if (HC_OBJ_FEATURE.bMultiCurrency != true)
                nlapiSetFieldValue(FLD_CUSTRECORD_CURRENCY, stBaseCurrency);
            nlapiSetFieldValue(FLD_CUSTRECORD_BASE_CURRENCY, stBaseCurrency);
        }else if (type == HC_MODE_TYPE.Copy) {
            nlapiSetFieldValue(FLD_CUSTRECORD_START_DATE, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_END_DATE, '');
            nlapiSetFieldValue(FLD_CUSTRECORD_AGREEMENT_NAME, '');
            disableSearchBasedOnRemType();
            
            //FIX TO CHECK REBATE
            var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
            
            if(bIsTiered == 'T'){
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_amt', '');
                nlapiSetFieldValue('custrecord_nsts_rm_rebate_cost_percent', '');
                
                nlapiGetField('custrecord_nsts_rm_rebate_cost_amt').setDisplayType(HC_DISPLAY_TYPE.Disabled);
                nlapiGetField('custrecord_nsts_rm_rebate_cost_percent').setDisplayType(HC_DISPLAY_TYPE.Disabled);
            }
            
            //disableSearchBasedOnRebType();
        }
        disableAccrualFields();
        
      //Hide tier group and tier sublists
        var sblHide = form.getSubList(SBL_RA_TIER_GROUP);
        if (sblHide) sblHide.setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }else if (type == HC_MODE_TYPE.Edit || type == HC_MODE_TYPE.Xedit) {
        //ADD CURRENT DATE AND PREVIOUS AGREEMENT DATE HIDDEN FIELDS FOR THE VALIDATION OF AGREEMENT DATES
        form.addField(FLD_CUSTRECORD_CURRENT_DATE, HC_FIELD_TYPE.Date, 'Current Date')
        .setDisplayType(HC_DISPLAY_TYPE.Hidden).setDefaultValue(nlapiDateToString(dateToday));
        form.addField(FLD_CUSTRECORD_PREV_START_DATE, HC_FIELD_TYPE.Date, 'Previous Start Date')
        .setDisplayType(HC_DISPLAY_TYPE.Hidden)
        .setDefaultValue(nlapiDateToString(new Date(nlapiGetFieldValue(FLD_CUSTRECORD_START_DATE))));
        form.addField(FLD_CUSTRECORD_PREV_END_DATE, HC_FIELD_TYPE.Date, 'Previous End Date')
        .setDisplayType(HC_DISPLAY_TYPE.Hidden)
        .setDefaultValue(nlapiDateToString(new Date(nlapiGetFieldValue(FLD_CUSTRECORD_END_DATE))));
        form.addField(FLD_CUSTRECORD_IS_CLASS, HC_FIELD_TYPE.Checkbox, 'Using Item Classification')
        .setDisplayType(HC_DISPLAY_TYPE.Hidden);
        
        if(lstRebateStatus != HC_AGR_STATUS.Closed){
            var bIsClaimGenerated = checkIfClaimGenerated(idRebateAgreement);
            //DISPLAY CLEAR AGREEMENT DETAILS BUTTON
            if(lstRebateStatus == HC_AGR_STATUS.Unapprove || (lstRebateStatus == HC_AGR_STATUS.Approve
                    && isEmpty(checkAssociatedRebTrans(idRebateAgreement)))){
                 form.setScript(SCRIPT_REB_AGR_SUITELET_CS);
                 form.addButton(HC_CLEAR_AGR_DET,
                    'Clear Agreement Details', 'clearAgreementDetail();');
            }
           
            if(lstRebateStatus == HC_AGR_STATUS.Approve){
               //DISABLE ALL FIELDS FOR APPROVE STATUS
                var arEnabledFields = [FLD_CUSTRECORD_STATUS, FLD_CUSTRECORD_START_DATE,
                                       FLD_CUSTRECORD_END_DATE];
                if(!bIsClaimGenerated){
                    arEnabledFields.push(FLD_CUSTRECORD_REMITTANCE_TYPE, FLD_CUSTRECORD_CLAIM_TRANS,
                            FLD_CUSTRECORD_CLAIM_ITEM, FLD_CUSTRECORD_CREDIT_ENTITY,
                            FLD_CUSTRECORD_REFUND_ENTITY, FLD_CUSTRECORD_RECEIVABLE,
                            FLD_CUSTRECORD_REFUND_CASH, FLD_CUSTRECORD_PAYABLE);
                }   
                disableAllFields(REC_REBATE_AGREEMENT, idRebateAgreement, arEnabledFields);
                if(!bIsClaimGenerated) disableSearchBasedOnRemType();
            }else if(lstRebateStatus == HC_AGR_STATUS.Unapprove){
                disableSearchBasedOnRemType();
            }       
            disableAccrualFields();
        }else{
            //DISABLE ALL FIELDS FOR CLOSED STATUS
            disableAllFields(REC_REBATE_AGREEMENT, idRebateAgreement, [FLD_CUSTRECORD_STATUS]);
        }
        
        if (nlapiGetLineItemCount(SBL_REBATE_DETAIL) > 0 && bIsTiered == 'T') {
        	var bIsClass = false;
        	for (var intRADCtr = 1; intRADCtr <= nlapiGetLineItemCount(SBL_REBATE_DETAIL); intRADCtr++) {
        		if (intRADCtr == 1) 
        			 bIsClass = isEmpty(nlapiGetLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_ITEM, intRADCtr)) ? true : false;
        		break;
        	}
			nlapiSetFieldValue(FLD_CUSTRECORD_IS_CLASS, bIsClass? 'T' : 'F');

        	//Add Tier Sublist in Tier Subtab
			showTier(form, idRebateAgreement, (lstRebateStatus == HC_AGR_STATUS.Closed)? true : false);
        } else {
            if (bIsTiered != 'T') nlapiGetField('custrecord_nsts_rm_tier_type').setDisplayType(HC_DISPLAY_TYPE.Disabled);
            
            //Hide tier group sublists
            var sblHide = form.getSubList(SBL_RA_TIER_GROUP);
            if (sblHide) sblHide.setDisplayType(HC_DISPLAY_TYPE.Hidden);
        }
        //disableSearchBasedOnRebType();
    }else if (type == HC_MODE_TYPE.View) {
        var bTiered = nlapiGetFieldValue(FLD_CUSTRECORD_IS_TIERED);
        var objRadSummary = getRADSummary(idRebateAgreement);
    	if (bInactive != 'T' && bEligibleInProc != 'T') {
    		var context = nlapiGetContext();
        	var rolesAllowed = context.getSetting("script", SPARAM_DEFINE_ELIGIBILITY_ROLES);

        	if(!isEmpty(rolesAllowed)){
        		var currentRole = context.getRole();

	        	var rolesAllowedArr = rolesAllowed.replace(/ /, '').split(',');
	        	
	        	if(rolesAllowedArr.indexOf(currentRole.toString()) >= 0){
                    //APPROVE BUTTON
                    if(lstRebateStatus != HC_AGR_STATUS.Approve){
                        form.setScript('customscript_nsts_rm_rebateagreement_cs');
                        form.addButton('custpage_btn_approve',
                                'Approve', 'approveRA()');
                    }

	    	        //PROCESS ELIGIBILITY BUTTON
	    	        if(lstRebateStatus != HC_AGR_STATUS.Closed){
	    	            var sUrlSuitelet = nlapiResolveURL('SUITELET',
	    	                SCRIPT_PROCESS_ELIGIBILITY,
	    	                DEPLOY_PROCESS_EILIGIBILITY, false);
	    	            var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
	    	            var bIncludeAllEntities = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
	    	            var lstItemSearch = nlapiGetFieldValue(FLD_CUSTRECORD_ITEM_SEARCH);
	    	            var lstCustomerSearch = nlapiGetFieldValue(FLD_CUSTRECORD_CUST_SEARCH);
	    	            var lstVendorSearch = nlapiGetFieldValue(FLD_CUSTRECORD_VENDOR_SEARCH);
	    	            var lstCalcMethod = nlapiGetFieldValue(FLD_CUSTRECORD_CALC_METHOD);
	    	            var flPercent = nlapiGetFieldValue(FLD_CUSTRECORD_PERCENT);
	    	            var flAmount = nlapiGetFieldValue(FLD_CUSTRECORD_AMOUNT);
	    	            var lstUOM = nlapiGetFieldValue(FLD_CUSTRECORD_UOM);
	    	            var bIncludeEntities = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
	    	            var idSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
	    	            var idCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
	    	            var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE);
	    	            var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC));
	    	            var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL));
	    	    
	    	            var sScript = "window.open('" + sUrlSuitelet + "&agreementId="
	    	                    + idRebateAgreement + "&rebateType=" + lstRebateType
	    	                    + "&itemSearch=" + lstItemSearch + "&customerSearch="
	    	                    + lstCustomerSearch + "&vendorSearch=" + lstVendorSearch
	    	                    + "&allEntities=" + bIncludeAllEntities + "&calcMethod="
	    	                    + lstCalcMethod + "&percent=" + flPercent + "&amount="
	    	                    + flAmount + "&uom=" + lstUOM + "&subsidiary="
	    	                    + idSubsidiary + "&currency=" + idCurrency + "&agrStatus="
	    	                    + lstRebateStatus + "&radCount=" + objRadSummary.count 
	    	                    + "&entSpecOrClass=" + objRadSummary.entSpecOrClass 
	    	                    + "&itemSpecOrClass=" + objRadSummary.itemSpecOrClass
	    	                    + "&tiered=" + bIsTiered
	    	                    + "&passThroughType=" + lstPassThroughType
	    	                    + "&passThroughPerc=" + flPassThroughPerc
	    	                    + "&passThroughVal=" + flPassThroughVal
	    	                    + "', '_blank');";
	    	           // form.addButton(HC_ADD_SEARCH_DET, 'Define Rebate Eligibility',         sScript);
	    	          //add button inline
	    	            var arrTabs = form.getTabs();
	    	           
	    	    	    for (var intCtr = 0; intCtr < arrTabs.length; intCtr++) {
	    	    	    	
	    	    	    	if (form.getTab(arrTabs[intCtr]).label == 'Agreement Detail') {
	    	    	    		var stLink = sUrlSuitelet + "&agreementId="
	    	                    + idRebateAgreement + "&rebateType=" + lstRebateType
	    	                    + "&itemSearch=" + lstItemSearch + "&customerSearch="
	    	                    + lstCustomerSearch + "&vendorSearch=" + lstVendorSearch
	    	                    + "&allEntities=" + bIncludeAllEntities + "&calcMethod="
	    	                    + lstCalcMethod + "&percent=" + flPercent + "&amount="
	    	                    + flAmount + "&uom=" + lstUOM + "&subsidiary="
	    	                    + idSubsidiary + "&currency=" + idCurrency + "&agrStatus="
	    	                    + lstRebateStatus + "&radCount=" + objRadSummary.count 
	    	                    + "&entSpecOrClass=" + objRadSummary.entSpecOrClass 
	    	                    + "&itemSpecOrClass=" + objRadSummary.itemSpecOrClass
	    	                    + "&tiered=" + bIsTiered
	    	                    + "&passThroughType=" + lstPassThroughType
	    	                    + "&passThroughPerc=" + flPassThroughPerc
	    	                    + "&passThroughVal=" + flPassThroughVal;
	    	    	    		//var objFld = form.addField('custpage_nsts_rm_defradbtn', 'inlinehtml', 'Define Rebate Eligibility Btn',null, arrTabs[intCtr]);
	    	    	    		var stDisplay = '<style type="text/css">' +
	    						'#btnEnabled:link, #btnEnabled:visited, #btnEnabled:active {font-size: 14px !important; font-weight: 600; padding: 3px 12px !important; background-color: #f5f5f5; margin-right: 15px; margin-bottom: 40px; border-radius: 3px; border: 1px solid #999999 !important; text-decoration: none; line-height: 50px !important;}' +
	    						'#btnEnabled:hover {background-color: #e4e4e4}' + 
	    						'#btnDisabled:link, #btnDisabled:visited, #btnDisabled:active {color: #5d5d5d; font-size: 14px !important; font-weight: 600; padding: 3px 12px !important; background-color: #e4e4e4; margin-right: 15px; margin-bottom: 40px; border-radius: 3px; border: 1px solid #999999 !important; text-decoration: none; line-height: 50px !important;}' +
	    						'#btnDisabled:hover {cursor: default;}' + 
	    					'</style>';
	    	    	    		//objFld.setDefaultValue(stDisplay+'<a id="btnEnabled" href="'+stLink+'" target="_blank">Define Rebate Eligibility</a>');
	    	    	    		//objFld.setBreakType('startcol');
	    	    	    		try{
	    	    	           	 	var objFldElig = form.getField('custrecord_nsts_rm_elig_btn');
	    	    	           	 objFldElig.setDefaultValue(stDisplay+'<a id="btnEnabled" href="'+stLink+'" target="_blank">Define Rebate Eligibility</a>');
	    	    	           	 	
	    		    	           }catch(err){
	    		    	           	
	    		    	           }
	    	    	    		 nlapiLogExecution('audit', 'field added','');
	    	    	    	}
	    	    	    }
	    	        }
	        	}
        	}
        }
        if (bTiered == 'T' && objRadSummary.count > 0) {
//          var sUrlSuitelet = nlapiResolveURL('SUITELET',
//                  SCRIPT_DEFINE_TIER,
//                  DEPLOY_DEFINE_TIER, false);
//          var sScript = "window.open('" + sUrlSuitelet + "&loadType=search"
//          + "&agreementId="+ idRebateAgreement 
//          + "&calcMethod=" + lstCalcMethod
//          + "&tiered=" + bTiered
//          + "&itemSpecOrClass=" + objRadSummary.itemSpecOrClass
//          + "&radCount=" + objRadSummary.count
//          + "', '_blank');";
//          
//          form.addButton(HC_BTN_DEFINE_TIER, 'Define Tiers', sScript);
          
        	//Add Tier Sublist in Tier Subtab
	      	showTier(form, idRebateAgreement, true);
	        } else {
	        	if (bIsTiered != 'T') nlapiGetField('custrecord_nsts_rm_tier_type').setDisplayType(HC_DISPLAY_TYPE.Disabled);
	        	//Hide tier group sublists
	        	var sblHide = form.getSubList(SBL_RA_TIER_GROUP);
	        	if (sblHide) sblHide.setDisplayType(HC_DISPLAY_TYPE.Hidden);
	        }
	    }
    
    if(!isEmpty(form)){
        if(!HC_OBJ_FEATURE.bMultiCurrency){
            var objFldCurrency = form.getField(FLD_CUSTRECORD_CURRENCY);
            objFldCurrency.setMandatory(false);
            objFldCurrency.setDisplayType("hidden");
        }
    }
    
    
}

function showTier(form, idRebateAgreement, bDisableAll) {
	try{

	    var arrTabs = form.getTabs();
	    
	    for (var intCtr = 0; intCtr < arrTabs.length; intCtr++) {
	    	if (form.getTab(arrTabs[intCtr]).label == 'Tiers') {
	    		var sblTier = form.addSubList('custpage_nsts_rm_ra_tier_sbl', 'staticlist', 'Tiers', arrTabs[intCtr]);
	    		sblTier.addField(FLD_TIER_DOLLAR_TIER_GROUP, 'select', 'Tier Group', REC_TIER_GROUP).setDisplayType(HC_DISPLAY_TYPE.Inline);
	    		sblTier.addField(FLD_TIER_DOLLAR_LEVEL, 'integer', 'Tier Level').setDisplayType(bDisableAll ? HC_DISPLAY_TYPE.Inline : HC_DISPLAY_TYPE.Normal);
	    		sblTier.addField(FLD_TIER_DOLLAR_MIN, 'currency', 'Min').setDisplayType(bDisableAll ? HC_DISPLAY_TYPE.Inline : HC_DISPLAY_TYPE.Normal);
	    		sblTier.addField(FLD_TIER_DOLLAR_MAX, 'currency', 'Max').setDisplayType(bDisableAll ? HC_DISPLAY_TYPE.Inline : HC_DISPLAY_TYPE.Normal);
	    		sblTier.addField(FLD_TIER_DOLLAR_PERCENTAGE, 'percent', 'Percent (%)').setDisplayType(bDisableAll ? HC_DISPLAY_TYPE.Inline : HC_DISPLAY_TYPE.Normal);
	    		sblTier.addField(FLD_TIER_DOLLAR_FORECAST_TARGET, 'text', 'Forecast Target').setDisplayType(HC_DISPLAY_TYPE.Inline);
	    		
	    		 var objColumn = [new nlobjSearchColumn(FLD_TIER_DOLLAR_TIER_GROUP),
	    		                  new nlobjSearchColumn(FLD_TIER_DOLLAR_LEVEL),
	    		                  new nlobjSearchColumn(FLD_TIER_DOLLAR_MIN),
	    		                  new nlobjSearchColumn(FLD_TIER_DOLLAR_MAX),
	    		                  new nlobjSearchColumn(FLD_TIER_DOLLAR_PERCENTAGE),
	    		                  new nlobjSearchColumn(FLD_TIER_DOLLAR_FORECAST_TARGET)];
	    		 
	    		var ssSearch = nlapiSearchRecord(null, 'customsearch_nsts_rm_tier_sublist',
	    				new nlobjSearchFilter(FLD_TIER_DOLLAR_REBATE_AGREEMENT, null, 'anyof', idRebateAgreement),objColumn);
	    		
	    		var arrItems = [];
	    		for(var i=0;i<ssSearch.length;i++){

	    	        var stFLD_TIER_DOLLAR_TIER_GROUP = ssSearch[i].getValue(FLD_TIER_DOLLAR_TIER_GROUP);
	    	        var stFLD_TIER_DOLLAR_LEVEL = ssSearch[i].getValue(FLD_TIER_DOLLAR_LEVEL);
	    	        var stFLD_TIER_DOLLAR_MIN = ssSearch[i].getValue(FLD_TIER_DOLLAR_MIN);
	    	        var stFLD_TIER_DOLLAR_MAX = ssSearch[i].getValue(FLD_TIER_DOLLAR_MAX);
	    	        var stFLD_TIER_DOLLAR_PERCENTAGE = ssSearch[i].getValue(FLD_TIER_DOLLAR_PERCENTAGE);
	    	        var stFLD_TIER_DOLLAR_FORECAST_TARGET = ssSearch[i].getValue(FLD_TIER_DOLLAR_FORECAST_TARGET);
	    	        arrItems[i]= {};
	    	        arrItems[i][FLD_TIER_DOLLAR_TIER_GROUP] = stFLD_TIER_DOLLAR_TIER_GROUP;
	    	        arrItems[i][FLD_TIER_DOLLAR_LEVEL] = stFLD_TIER_DOLLAR_LEVEL;
	    	        arrItems[i][FLD_TIER_DOLLAR_MIN] = stFLD_TIER_DOLLAR_MIN;
	    	        arrItems[i][FLD_TIER_DOLLAR_MAX] = stFLD_TIER_DOLLAR_MAX;
	    	        arrItems[i][FLD_TIER_DOLLAR_PERCENTAGE] = stFLD_TIER_DOLLAR_PERCENTAGE;
	    	        arrItems[i][FLD_TIER_DOLLAR_FORECAST_TARGET] = stFLD_TIER_DOLLAR_FORECAST_TARGET == 'T'? 'Yes': 'No';

	    		}

	    		nlapiLogExecution('debug','arrItems',JSON.stringify(arrItems))
	    		nlapiLogExecution('debug','tiers',JSON.stringify(ssSearch))
	    		sblTier.setLineItemValues(arrItems);
	    		
	    		break;
	    	}
	    }
	}catch(err){
		nlapiLogExecution('debug','showTier',err.toString())
	}
}

function getRADSummary(idRebateAgreement) {
    var objFilter = [new nlobjSearchFilter(FLD_CUSTRECORD_REBATE_AGREEMENT, null, 'anyof', idRebateAgreement)];
    var objColumn = [new nlobjSearchColumn(FLD_CUSTRECORD_DET_ITEM),
        new nlobjSearchColumn(FLD_CUSTRECORD_DET_EL_ITEM_CLASS),
        new nlobjSearchColumn(FLD_CUSTRECORD_DET_CUST),
        new nlobjSearchColumn(FLD_CUSTRECORD_DET_EL_CUST_CLASS),
        new nlobjSearchColumn(FLD_CUSTRECORD_DET_VEND),
        new nlobjSearchColumn(FLD_CUSTRECORD_DET_EL_VEND_CLASS)];
    var objResult = nlapiSearchRecord(REC_AGREEMENT_DETAIL, null,
            objFilter, objColumn);
    
    var objReturn = {
            intCount : 0
    };
    if (!isEmpty(objResult)) {
        var stItemSpec = objResult[0].getValue(FLD_CUSTRECORD_DET_ITEM);
        var stItemClass = objResult[0].getValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS);
        var stCustSpec = objResult[0].getValue(FLD_CUSTRECORD_DET_CUST);
        var stCustClass = objResult[0].getValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS);
        var stVendSpec = objResult[0].getValue(FLD_CUSTRECORD_DET_VEND);
        var stVendClass = objResult[0].getValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS);
        
        var stEntSpecOrClass = (!isEmpty(stCustClass) || !isEmpty(stVendClass)) ? 'class' : 'spec';
        var stItemSpecOrClass = (!isEmpty(stItemClass)) ? 'class' : 'spec';
        
        objReturn = {
                count : objResult.length,
                entSpecOrClass : stEntSpecOrClass,
                itemSpecOrClass : stItemSpecOrClass
        };
    }
    return objReturn;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function validateFieldValues_BeforeSubmit(type) {
    var objExecution = nlapiGetContext().getExecutionContext();
    var idAgreement = nlapiGetRecordId();
    var stAgreementName = nlapiGetFieldValue(FLD_CUSTRECORD_AGREEMENT_NAME);
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var lstRemittanceType = nlapiGetFieldValue(FLD_CUSTRECORD_REMITTANCE_TYPE);
    var lstCredit = nlapiGetFieldValue(FLD_CUSTRECORD_CREDIT_ENTITY);
    var lstPayable = nlapiGetFieldValue(FLD_CUSTRECORD_PAYABLE);
    var lstRefund = nlapiGetFieldValue(FLD_CUSTRECORD_REFUND_ENTITY);
    var lstReceivable = nlapiGetFieldValue(FLD_CUSTRECORD_RECEIVABLE);
    var lstClaimRefund = nlapiGetFieldValue(FLD_CUSTRECORD_REFUND_CASH);
    var lstClaimItem = nlapiGetFieldValue(FLD_CUSTRECORD_CLAIM_ITEM);
    var bInactive = nlapiGetFieldValue(HC_IS_INACTIVE);
    var lstAgrStatus = nlapiGetFieldValue(FLD_CUSTRECORD_STATUS);
    var lstPrevStatus = nlapiGetFieldValue(FLD_CUSTRECORD_PREV_STATUS);
    var dateAgrStart = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_START_DATE));
    var dateAgrEnd = nlapiStringToDate(nlapiGetFieldValue(FLD_CUSTRECORD_END_DATE));
    var lstClaimTrans = nlapiGetFieldTexts(FLD_CUSTRECORD_CLAIM_TRANS);
    var stRebateType = nlapiGetFieldText(FLD_CUSTRECORD_TYPE);
    var idSubsidiary = nlapiGetFieldValue(FLD_CUSTRECORD_SUBSIDIARY);
    var idCurrency = nlapiGetFieldValue(FLD_CUSTRECORD_CURRENCY);
    var flDefAmount = nlapiGetFieldValue(FLD_CUSTRECORD_AMOUNT);
    var flDefCostPerc = nlapiGetFieldValue(FLD_CUSTRECORD_PERCENT);
    var bIsTiered = nlapiGetFieldValue('custrecord_nsts_rm_is_tiered_ra');
    var stTierType = nlapiGetFieldValue('custrecord_nsts_rm_tier_type');
    var bAccrue = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS);
    var stAccrueExpense = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES);
    var stAccruePayable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE);
    var stAccrueReceivable = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE);
    var lstPassThroughType = nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_TYPE);
    var flPassThroughPerc = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_PERC));
    var flPassThroughVal = forceParseFloat(nlapiGetFieldValue(FLD_CUSTRECORD_PASS_THROUGH_VAL));
    var stAccrualAccount = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUAL_ACCOUNT);
    
//    var idCustSearch =  nlapiGetFieldValue(FLD_CUSTRECORD_CUST_SEARCH);
//    var idVendSearch =  nlapiGetFieldValue(FLD_CUSTRECORD_VENDOR_SEARCH);
//    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
    nlapiLogExecution('audit','beforesub custrecord_nsts_rm_acc_exp',nlapiGetFieldValue('custrecord_nsts_rm_acc_exp') + ': '+nlapiGetNewRecord().getFieldValue('custrecord_nsts_rm_acc_exp'));
    
    if(objExecution != 'scheduled'){
        if(type == HC_MODE_TYPE.Xedit){
            var recAgreementNew = nlapiGetNewRecord();
            var recAgreementLoad = nlapiLoadRecord(REC_REBATE_AGREEMENT, idAgreement);
            stAgreementName = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_AGREEMENT_NAME);
            lstPrevStatus = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PREV_STATUS);
            lstAgrStatus = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_STATUS);
            bInactive = getFieldValuesOnInline(recAgreementLoad, HC_IS_INACTIVE);
            dateAgrStart = nlapiStringToDate(getFieldValuesOnInline(recAgreementLoad, 
                    FLD_CUSTRECORD_START_DATE));
            dateAgrEnd = nlapiStringToDate(getFieldValuesOnInline(recAgreementLoad, 
                    FLD_CUSTRECORD_END_DATE));
            lstRebateType = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_TYPE);
            lstRemittanceType = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_REMITTANCE_TYPE);
            lstReceivable = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_RECEIVABLE);
            lstClaimRefund = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_REFUND_CASH);
            lstRefund = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_REFUND_ENTITY);
            lstClaimItem = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_CLAIM_ITEM);
            lstCredit = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_CREDIT_ENTITY);
            lstPayable = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PAYABLE);
            lstClaimTrans = getFieldTextsOnInline(recAgreementLoad, FLD_CUSTRECORD_CLAIM_TRANS,
                    true);
            stRebateType = getFieldTextsOnInline(recAgreementLoad, FLD_CUSTRECORD_TYPE,
                    false);
            idSubsidiary = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_SUBSIDIARY);
            idCurrency = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_CURRENCY);
            flDefAmount = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_AMOUNT);
            flDefCostPerc = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PERCENT);
            bIsTiered = getFieldValuesOnInline(recAgreementLoad, 'custrecord_nsts_rm_is_tiered_ra');
            stTierType = getFieldValuesOnInline(recAgreementLoad, 'custrecord_nsts_rm_tier_type');
            
            bAccrue = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_ACCRUE_AMOUNTS);
            stAccrueExpense = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_ACCRUED_EXPENSES);
            stAccruePayable = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_ACCRUED_PAYABLE);
            stAccrueReceivable = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_ACCRUED_RECEIVABLE);
            lstPassThroughType = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PASS_THROUGH_TYPE);
            flPassThroughPerc = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PASS_THROUGH_PERC);
            flPassThroughVal = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_PASS_THROUGH_VAL);
            stAccrualAccount = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_ACCRUAL_ACCOUNT);

//            idCustSearch = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_CUST_SEARCH);
//            idVendSearch = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_VENDOR_SEARCH);
//            bIncludeAll = getFieldValuesOnInline(recAgreementLoad, FLD_CUSTRECORD_INCLUDE_ALL);
            
            //VALIDATION FUNCTION
            getAllRAValidations(objExecution, type, idAgreement, stAgreementName, lstPrevStatus, lstAgrStatus,
                    bInactive, dateAgrStart, dateAgrEnd, lstRebateType, lstRemittanceType, lstReceivable,
                    lstRefund, lstClaimItem, lstClaimRefund, lstCredit, lstPayable, lstClaimTrans, 
                    stRebateType, idSubsidiary, idCurrency, flDefAmount, flDefCostPerc, bIsTiered, stTierType,
                    bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable, lstPassThroughType, flPassThroughPerc, flPassThroughVal, stAccrualAccount/*, bIncludeAll, idCustSearch, idVendSearch*/);
            
            //SET PREVIOUS STATUS WITH THE CURRENT STATUS VALUE
            recAgreementNew.setFieldValue(FLD_CUSTRECORD_PREV_STATUS, lstAgrStatus);
        }else if(type != HC_MODE_TYPE.Delete){
            //VALIDATION FUNCTION
            getAllRAValidations(objExecution, type, idAgreement, stAgreementName, lstPrevStatus, lstAgrStatus,
                    bInactive, dateAgrStart, dateAgrEnd, lstRebateType, lstRemittanceType, lstReceivable,
                    lstRefund, lstClaimItem, lstClaimRefund, lstCredit, lstPayable, lstClaimTrans, 
                    stRebateType, idSubsidiary, idCurrency, flDefAmount, flDefCostPerc, bIsTiered, stTierType,
                    bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable, lstPassThroughType, flPassThroughPerc, flPassThroughVal, stAccrualAccount/*, bIncludeAll, idCustSearch, idVendSearch*/);
            //SET PREVIOUS STATUS WITH THE CURRENT STATUS VALUE
            nlapiSetFieldValue(FLD_CUSTRECORD_PREV_STATUS, lstAgrStatus);
            
            //SET ACCRUAL
            var objAccrualAccount = getAccrualAccount(lstRebateType);
            if(bAccrue == 'T'){ //|| (objExecution == HC_EXECUTION_CONTEXT.csvimport && objAccrualAccount.accFlag == 'T')){
            	//if(bAccrue == 'F') nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS, 'T');
            	if(isEmpty(stAccrualAccount)) nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUAL_ACCOUNT, objAccrualAccount.accId);
            	/*if(isEmpty(stAccrueExpense)) nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_EXPENSES, objAccrualAccount.accExpense);
            	if(isEmpty(stAccrueReceivable)) nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_RECEIVABLE, objAccrualAccount.accReceivable);
            	if(isEmpty(stAccruePayable)) nlapiSetFieldValue(FLD_CUSTRECORD_ACCRUED_PAYABLE, objAccrualAccount.accPayable);*/
            }
        }
    }
    
    if(type == HC_MODE_TYPE.Delete){
        if (!isEmpty(checkAssociatedRebTrans(idAgreement)))
            throw nlapiCreateError(
                    'Error',
                    'There are Transactions associated with the agreement, so it cannot be deleted.',
                    true);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function setAgrDetInactive_AfterSubmit(type) {
    var idAgreement = nlapiGetRecordId();
    var objExecution = nlapiGetContext().getExecutionContext();
    nlapiLogExecution('audit','aftersub custrecord_nsts_rm_acc_exp',nlapiGetFieldValue('custrecord_nsts_rm_acc_exp') + ': '+nlapiGetNewRecord().getFieldValue('custrecord_nsts_rm_acc_exp'));
    
    if (type != HC_MODE_TYPE.Delete && objExecution != 'scheduled') {
        var recAgreement = nlapiLoadRecord(REC_REBATE_AGREEMENT, idAgreement);
        var intDetCount = recAgreement.getLineItemCount(SBL_REBATE_DETAIL); //nlapiGetLineItemCount(SBL_REBATE_DETAIL);
        var bIncludeAll = recAgreement.getFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);
        
        if (type != HC_MODE_TYPE.Create && type != HC_MODE_TYPE.Copy) {
            var bInactive = recAgreement.getFieldValue(HC_IS_INACTIVE);//nlapiGetFieldValue(HC_IS_INACTIVE);
            var arAgrSchedId = [];
            var context = nlapiGetContext();
            var dateToday = new Date();
            dateToday.setHours(0, 0, 0, 0);
            var dateAgrStart = nlapiStringToDate(recAgreement
                    .getFieldValue(FLD_CUSTRECORD_START_DATE));
            var dateAgrEnd = nlapiStringToDate(recAgreement
                    .getFieldValue(FLD_CUSTRECORD_END_DATE));
            dateAgrStart.setHours(0, 0, 0, 0);
            dateAgrEnd.setHours(0, 0, 0, 0);
            
            
            /*SETS ASSOCIATED AGREEMENT DETAILS TO INACTIVE IF AGREEMENT 
              IS SET TO INACTIVE VIA SCHEDULED SCRIPT*/
            arAgrSchedId[SPARAM_REB_AGR_ID] = idAgreement;
            arAgrSchedId[SPARAM_REB_AGR_INACTIVE] = bInactive;
            if (bInactive == 'T' && isEmpty(checkAssociatedRebTrans(idAgreement)))
                nlapiScheduleScript(SCRIPT_REB_DET_SS, null,
                        arAgrSchedId);
            
            //SEND NOTIFICATION EMAIL TO USER
            /*if (dateAgrStart < dateToday || dateAgrEnd < dateToday) {
                if (!isEmpty(context.getEmail())) {
                    nlapiSendEmail(
                            context.getUser(),
                            context.getEmail(),
                            'Rebate Agreement Notification: '
                                    + recAgreement.getFieldValue(FLD_CUSTRECORD_AGREEMENT_NAME),
                            'To include transactions processed before the current date, '
                                    + 'run the Retroactive Rebate Calculation program or edit the transaction line.');
                }
            }

            var lstAgrStatus = recAgreement
                    .getFieldValue(FLD_CUSTRECORD_STATUS);
            var lstPrevStatus = nlapiGetOldRecord().getFieldValue(
                    FLD_CUSTRECORD_PREV_STATUS);
            if (lstPrevStatus == 2 && lstAgrStatus == 3)
                nlapiSendEmail(
                        context.getUser(),
                        context.getEmail(),
                        'Rebate Agreement Notification: '
                                + recAgreement.getFieldValue(FLD_CUSTRECORD_AGREEMENT_NAME),
                        'The Agreement will not be available for Rebate Calculations');*/
        }
        
        // SET THE EXTERNAL ID OF RELATED AGREEMENT DETAIL RECORDS
        for (var line = 1; line <= intDetCount; line++) {
            var idAgrDetail = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORT_AGR_DET_ID, line);
            var idItem = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_ITEM, line);
            var idCustomer = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_CUST, line);
            var idVendor = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_VEND, line);
            var idItemClass = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_EL_ITEM_CLASS, line);
            var idCustomerClass = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_EL_CUST_CLASS, line);
            var idVendorClass = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_EL_VEND_CLASS, line);
            var flAmount = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_AMT, line);
            var flPercent = recAgreement.getLineItemValue(SBL_REBATE_DETAIL,
                    FLD_CUSTRECORD_DET_PERCENT, line);
            var lstCalcMethod = recAgreement.getLineItemValue(
                    SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_CALC_METHOD, line);
            var stUom = recAgreement.getLineItemValue(
                    SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_UOM, line);
            var stCustomExternalId = recAgreement.getLineItemValue(
                    SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID, line);
            var intEntity = 0;
            
            var intEligItemEntClass = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(idItemClass);
            
            if(bIncludeAll != 'T'){
                 //intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
                    //: checkEmptyValue(idVendor);
                
                intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer) :
                     (!isEmpty(idCustomerClass)) ? checkEmptyValue(idCustomerClass) :
                         (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(idVendorClass);
            }
           
            var stConcatLineValue = checkEmptyValue(idAgreement) + '_'
                                      + intEligItemEntClass + '_'
                                      + intEntity + '_'
                                      + checkEmptyValue(stUom);
               
            if(stCustomExternalId != stConcatLineValue || isEmpty(stCustomExternalId)){
                nlapiLogExecution('DEBUG', 'EXTERNAL', stCustomExternalId +':'+ stConcatLineValue);
                 //ONLY NEWLY CREATED AND UPDATED RAD WILL BE SUBMITTED
                 nlapiSubmitField(REC_AGREEMENT_DETAIL, idAgrDetail, [HC_EXTERNAL_ID, FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID],
                       [stConcatLineValue, stConcatLineValue]);
            }
           
        }
    }
}

/*
 * ====================================================================
 * REUSABLE FUNCTIONS
 * ====================================================================
 */

//GETS THE FIELD VALUES IN INLINE EDIT MODE
function getFieldValuesOnInline(recAgreementLoad, fldName){
    var recAgreementNew = nlapiGetNewRecord();
    var objEditedFields = recAgreementNew.getAllFields(); //GET FIELDS THAT WERE UPDATED INLINE
    var fldValue = recAgreementLoad.getFieldValue(fldName); //GETS THE OLD FIELD VALUE

    // loop through the returned fields
    for (var i = 0; i < objEditedFields.length; i++){
        if(objEditedFields[i] == fldName){
            fldValue = recAgreementNew.getFieldValue(fldName); //RETURN NEW FIELD VALUE
            return fldValue;
        }
    }
    return fldValue;
}

//GETS THE SELECT FIELD VALUES IN INLINE EDIT MODE
function getFieldTextsOnInline(recAgreementLoad, fldName,
        isMultiSelect){
    var recAgreementNew = nlapiGetNewRecord();
    var objEditedFields = recAgreementNew.getAllFields(); //GET FIELDS THAT WERE UPDATED INLINE
    var fldValue = (isMultiSelect) ? recAgreementLoad.getFieldTexts(fldName) :
        recAgreementLoad.getFieldText(fldName); //GETS THE OLD FIELD VALUE

    // loop through the returned fields
    for (var i = 0; i < objEditedFields.length; i++){
        if(objEditedFields[i] == fldName){
            fldValue = (isMultiSelect) ? recAgreementNew.getFieldTexts(fldName) :
                recAgreementNew.getFieldText(fldName); //RETURN NEW FIELD VALUE
            return fldValue;
        }
    }
    return fldValue;
}

//CHECKS IF A CERTAIN FIELD VALUE IS CHANGED/UPDATED (SPECIFICALLY USED FOR INLINE EDIT)
function isFieldChangedOnInline(arFldNames){
    var recAgreementNew = nlapiGetNewRecord();
    var objEditedFields = recAgreementNew.getAllFields();
    var arValidateFldNames = !isEmpty(arFldNames) ? arFldNames : [];
        
    for (var i = 0; i < objEditedFields.length; i++){
        if(arValidateFldNames.indexOf(objEditedFields[i]) != -1){
            return true;
        }
    }
    return false;
}

//CHECKS IF A CERTAIN FIELD VALUE IS CHANGED/UPDATED (SPECIFICALLY USED FOR CSV IMPORT)
function isFieldChangedOnCSV(recAgreement, arFldNames){
    var arValidateFldNames = !isEmpty(arFldNames) ? arFldNames : [];
    var objEditedFields = recAgreement.getAllFields();
    
//    arValidateFldNames.push(FLD_CUSTRECORD_ITEM_LINK, FLD_CUSTRECORD_CUST_LINK,
//            FLD_CUSTRECORD_VEND_LINK);
    for (var i = 0; i < objEditedFields.length; i++){
        if(objEditedFields[i].indexOf('custrecord') > -1){
            var stNewValue = nlapiGetFieldValue(objEditedFields[i]);
            var stOldValue = recAgreement.getFieldValue(objEditedFields[i]);
            
            stNewValue = (isEmpty(stNewValue)) ? '' : stNewValue;
            stOldValue = (isEmpty(stOldValue)) ? '' : stOldValue;
            
            if(stNewValue != stOldValue 
                    && arValidateFldNames.indexOf(objEditedFields[i]) == -1)
                return true;
        }
    }
    return false;
}

//RUNS ALL USER EVENT VALIDATION FOR THE AGREEMENT
function getAllRAValidations(objExecution, type, idAgreement, stAgreementName, lstPrevStatus, lstAgrStatus,
        bInactive, dateAgrStart, dateAgrEnd, lstRebateType, lstRemittanceType, lstReceivable,
        lstRefund, lstClaimItem, lstClaimRefund, lstCredit, lstPayable, lstClaimTrans, 
        stRebateType, idSubsidiary, idCurrency, flDefAmount, flDefCostPerc, bIsTiered, stTierType,
        bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable, lstPassThroughType, flPassThroughPerc, flPassThroughVal, stAccrualAccount){
    
    var arValidateSubCur = [], arErrMessage = [];
    var arMandatoryFlds = [], arNotRequiredFlds = [];
    
    // VALIDATE AGREEMENT NAME
    if (validateDuplicateAgrName(stAgreementName))
        arErrMessage.push('Agreement Name is Duplicate, Please specify other Agreement Name');
    
    if(!isEmpty(dateAgrStart) && !isEmpty(dateAgrEnd)){
        dateAgrStart.setHours(0, 0, 0, 0);
        dateAgrEnd.setHours(0, 0, 0, 0);
        
        if(dateAgrEnd < dateAgrStart)
            arErrMessage.push('Agreement End Date can not be earlier than the Agreement Start Date');
    }
    
    if(!isEmpty(idAgreement)){
        var recAgreement = nlapiLoadRecord(REC_REBATE_AGREEMENT, idAgreement);
        var arValidateRebTrans = checkAssociatedRebTrans(idAgreement);
        var bIsClaimGenerated = checkIfClaimGenerated(idAgreement);
        var arEditedFlds = [FLD_CUSTRECORD_STATUS, FLD_CUSTRECORD_LAST_CLAIM_GEN_DATE];
        if(lstPrevStatus == HC_AGR_STATUS.Approve && bIsClaimGenerated)
            arEditedFlds.push(FLD_CUSTRECORD_START_DATE, FLD_CUSTRECORD_END_DATE);
        else if(lstPrevStatus == HC_AGR_STATUS.Approve && !bIsClaimGenerated)
            arEditedFlds.push(FLD_CUSTRECORD_START_DATE, FLD_CUSTRECORD_END_DATE, 
                    FLD_CUSTRECORD_REMITTANCE_TYPE, FLD_CUSTRECORD_CLAIM_TRANS,
                    FLD_CUSTRECORD_CLAIM_ITEM, FLD_CUSTRECORD_CREDIT_ENTITY,
                    FLD_CUSTRECORD_REFUND_ENTITY, FLD_CUSTRECORD_RECEIVABLE,
                    FLD_CUSTRECORD_REFUND_CASH, FLD_CUSTRECORD_PAYABLE);
        
        //VALIDATION FOR INLINE EDIT AND CSV IMPORTS ONLY
        if((lstPrevStatus == HC_AGR_STATUS.Approve 
                || lstPrevStatus == HC_AGR_STATUS.Closed) 
                && objExecution != HC_EXECUTION_CONTEXT.userinterface){
            if((type != HC_MODE_TYPE.Xedit && isFieldChangedOnCSV(recAgreement, arEditedFlds))
                    || (type == HC_MODE_TYPE.Xedit && !isFieldChangedOnInline(arEditedFlds)))
                throw nlapiCreateError('Error', 'Agreement cannot be updated if status is Approve or Closed.', true);
        }
        
        /*if(!isFieldChangedOnInline(arEditedFlds) && (lstPrevStatus == HC_AGR_STATUS.Approve 
                || lstPrevStatus == HC_AGR_STATUS.Closed))
            throw nlapiCreateError('Error', 'Agreement cannot be updated if status is Approve or Closed.', true);*/
        
        if (type != HC_MODE_TYPE.Create && !isEmpty(arValidateRebTrans)) {
            if(lstAgrStatus == HC_AGR_STATUS.Unapprove && (lstPrevStatus == HC_AGR_STATUS.Closed 
                    || lstPrevStatus == HC_AGR_STATUS.Approve)) {
                throw nlapiCreateError('There are Transactions associated with the agreement,'
                        + ' so it cannot be updated.');
            }
            
            /*VALIDATE ASSOCIATED REBATE TRANSACTIONS IN AGREEMENT RECORD
            BEFORE SETTING IT TO INACTIVE*/
            if (bInactive == 'T')
                throw nlapiCreateError('There are Transactions associated with the agreement, so it cannot be set to Inactive.');
            
            //VALIDATE START AND END DATE
            var dateToday = new Date();
            dateToday.setHours(0, 0, 0, 0);
            if(!isEmpty(dateAgrStart) && !isEmpty(dateAgrEnd)){
                var datePrevStart = recAgreement.getFieldValue(FLD_CUSTRECORD_START_DATE);
                var datePrevEnd = recAgreement.getFieldValue(FLD_CUSTRECORD_END_DATE);
                dateAgrStart.setHours(0, 0, 0, 0);
                dateAgrEnd.setHours(0, 0, 0, 0);
                
                if(nlapiDateToString(dateAgrStart) != datePrevStart
                        && dateAgrStart > dateToday)
                    arErrMessage.push('Agreement Start Date can only be backdated');
                if(nlapiDateToString(dateAgrEnd) != datePrevEnd
                        && dateAgrEnd <= dateToday)
                    arErrMessage.push('Agreement End Date can only'
                            +' be set to any day post current date');
            }
        }
        
        //VALIDATE REBATE COST LINE ITEM FIELDS
        /*if(lstAgrStatus == HC_AGR_STATUS.Approve 
                && objExecution != HC_EXECUTION_CONTEXT.suitelet
                && objExecution != HC_EXECUTION_CONTEXT.userinterface){
            var intAgrDetail = recAgreement.getLineItemCount(SBL_REBATE_DETAIL);
            var arDetailLineCost = [];
            for(var line = 1; line <= intAgrDetail; line++){
                var stCostBasis = recAgreement.getLineItemValue(SBL_REBATE_DETAIL, 
                        FLD_CUSTRECORD_COST_BASIS, line);
                var flRebateCost = recAgreement.getLineItemValue(SBL_REBATE_DETAIL, 
                        FLD_CUSTRECORD_DET_REBATE_COST, line);
                if(stCostBasis == HC_COST_BASIS.Rebate_Cost 
                        && forceParseFloat(flRebateCost) <= 0){
                    arDetailLineCost.push(line);
                }
            }
            if(!isEmpty(arDetailLineCost)) 
                arErrMessage.push('Rebate Cost field must be specified for the following line details:'
                        + arDetailLineCost);
        }*/
    }  
    
    //VALIDATE DATE RANGE
    /*var dateToday = new Date();
    dateToday.setHours(0, 0, 0, 0);
    nlapiLogExecution('DEBUG', 'TODAY', dateToday);
    if(!isEmpty(dateAgrStart) && !isEmpty(dateAgrEnd)){
        dateAgrStart.setHours(0, 0, 0, 0);
        dateAgrEnd.setHours(0, 0, 0, 0);
        if(dateAgrEnd < dateAgrStart) arErrMessage.push('Agreement End Date can not be earlier '
                +'than the Agreement Start Date.');
        
        if(lstPrevStatus == HC_AGR_STATUS.Approve && lstAgrStatus == HC_AGR_STATUS.Approve){
            //var datePostCurrent = nlapiStringToDate(nlapiGetOldRecord().getFieldValue(FLD_CUSTRECORD_END_DATE));
            //if(!isEmpty(datePostCurrent)) datePostCurrent.setHours(0,0,0,0);
            if(dateAgrStart > dateToday) arErrMessage.push('Agreement Start Date can only be backdated');
            if(dateAgrEnd <= dateToday) arErrMessage.push('Agreement End Date can only'
                    +' be set to any day post current date');
        }
    }*/
    
    //VALIDATE CURRENCY OF SUBSIDIARY
    /*var arValidateCurrencyOfSub = validateSubsidiaryCurrency(
            idSubsidiary, REC_SUBSIDIARY, null, idCurrency, false, true);
    if(!isEmpty(arValidateCurrencyOfSub)) arErrMessage.push(arValidateCurrencyOfSub.toString());*/

    /*VALIDATE EMPTY CLAIM FIELDS AND VALIDATE SUBSIDIARY AND CURRENCY OF
      SELECTED CUSTOMER/VENDOR*/
    if (lstRebateType == HC_REB_TYPE.RebPurchase
        || lstRebateType == HC_REB_TYPE.RebSale) {
        if (lstRemittanceType == HC_REM_TYPE.Credit) {
            if(isEmpty(lstCredit)) arMandatoryFlds.push('Credit Entity');
            if(isEmpty(lstPayable)) arMandatoryFlds.push('Claim Payable');
            if(!isEmpty(lstRefund)) arNotRequiredFlds.push('Refund Entity');
            if(!isEmpty(lstReceivable)) arNotRequiredFlds.push('Claim Receivable');
            
            arValidateSubCur = validateSubsidiaryCurrency(
                    lstCredit, HC_VENDOR, idSubsidiary, idCurrency);
            if (arValidateSubCur.length > 0)
                arErrMessage.push(arValidateSubCur.join('<br>'));
        } else if (lstRemittanceType == HC_REM_TYPE.Refund) {
            if(isEmpty(lstRefund)) arMandatoryFlds.push('Refund Entity');
            if(isEmpty(lstReceivable)) arMandatoryFlds.push('Claim Receivable');
            if(!isEmpty(lstCredit)) arNotRequiredFlds.push('Credit Entity');
            if(!isEmpty(lstPayable)) arNotRequiredFlds.push('Claim Payable');

            arValidateSubCur = validateSubsidiaryCurrency(
                    lstRefund, HC_CUSTOMER, idSubsidiary, idCurrency);
            if (arValidateSubCur.length > 0)
                arErrMessage.push(arValidateSubCur.join('<br>'));
        }else{
            if(!isEmpty(lstCredit)) arNotRequiredFlds.push('Credit Entity');
            if(!isEmpty(lstPayable)) arNotRequiredFlds.push('Claim Payable');
            if(!isEmpty(lstRefund)) arNotRequiredFlds.push('Refund Entity');
            if(!isEmpty(lstReceivable)) arNotRequiredFlds.push('Claim Receivable');
            if(!isEmpty(lstClaimRefund)) arNotRequiredFlds.push('Claim Refund Cash');
        }
        
        if(lstRebateType == HC_REB_TYPE.RebSale){
            if(!isEmpty(lstPassThroughType)){
                if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Percent){
                    if(forceParseFloat(flPassThroughPerc) <= 0) arMandatoryFlds.push('Price Pass Through %');
                    if(forceParseFloat(flPassThroughVal) > 0) arNotRequiredFlds.push('Price Pass Through Value');
                }else if(lstPassThroughType == HC_PASS_THROUGH_TYPE.Value){
                    if(forceParseFloat(flPassThroughVal) <= 0) arMandatoryFlds.push('Price Pass Through Value');
                    if(forceParseFloat(flPassThroughPerc) > 0) arNotRequiredFlds.push('Price Pass Through %');
                }
            }
        }
    } else if (lstRebateType == HC_REB_TYPE.CustReb) { 
        if (lstRemittanceType != HC_REM_TYPE.None) {
            if(isEmpty(lstReceivable)) arMandatoryFlds.push('Claim Receivable');
            if(lstRemittanceType == HC_REM_TYPE.Refund
                    && isEmpty(lstClaimRefund)) arMandatoryFlds.push('Claim Refund Cash');
            if(lstRemittanceType == HC_REM_TYPE.Credit
                    && !isEmpty(lstClaimRefund)) arNotRequiredFlds.push('Claim Refund Cash');
            if(!isEmpty(lstCredit)) arNotRequiredFlds.push('Credit Entity');
            if(!isEmpty(lstRefund)) arNotRequiredFlds.push('Refund Entity');
            if(!isEmpty(lstPayable)) arNotRequiredFlds.push('Claim Payable');
        }else{
            if(!isEmpty(lstCredit)) arNotRequiredFlds.push('Credit Entity');
            if(!isEmpty(lstPayable)) arNotRequiredFlds.push('Claim Payable');
            if(!isEmpty(lstRefund)) arNotRequiredFlds.push('Refund Entity');
            if(!isEmpty(lstReceivable)) arNotRequiredFlds.push('Claim Receivable');
            if(!isEmpty(lstClaimRefund)) arNotRequiredFlds.push('Claim Refund Cash');
        }
    }
    
    if(lstRebateType != HC_REB_TYPE.RebSale){
        if(!isEmpty(lstPassThroughType)) arNotRequiredFlds.push('Price Pass Through Type');
        if(forceParseFloat(flPassThroughPerc) > 0) arNotRequiredFlds.push('Price Pass Through %');
        if(forceParseFloat(flPassThroughVal) > 0) arNotRequiredFlds.push('Price Pass Through Value');
    }
    
    //VALIDATE SEARCH FIELDS
//    if (bIncludeAll != 'T') {
//        if (lstRebateType != HC_REB_TYPE.RebPurchase) { 
//            if(isEmpty(idCustSearch)) arMandatoryFlds.push('Customer Search');
//            if(!isEmpty(idVendSearch)) arNotRequiredFlds.push('Vendor Search');
//        } else if (lstRebateType == HC_REB_TYPE.RebPurchase){
//            if(isEmpty(idVendSearch)) arMandatoryFlds.push('Vendor Search');
//            if(!isEmpty(idCustSearch)) arNotRequiredFlds.push('Customer Search');
//        }
//    }else{
//        if(!isEmpty(idVendSearch)) arNotRequiredFlds.push('Vendor Search');
//        if(!isEmpty(idCustSearch)) arNotRequiredFlds.push('Customer Search');
//    }
    
    if(arMandatoryFlds.length > 0) arErrMessage.push('The following fields must be specified: ' 
            + arMandatoryFlds.toString());
    if(arNotRequiredFlds.length > 0) arErrMessage.push('The following fields must not be specified: ' 
            + arNotRequiredFlds.toString());
    
    //VALIDATE CLAIM ITEM
    if (!isEmpty(lstClaimItem)) {
        var stItemType = nlapiLookupField(HC_ITEM, lstClaimItem, FLD_TYPE);
        if (!isEmpty(stItemType) && HC_VALID_CLAIM_ITEM_TYP.indexOf(stItemType) < 0) {
            arErrMessage.push('Claim Item should be a Non-Inventory or Other Charge item');
        }
    }

    //VALIDATE SUBSIDIARY OF ITEM AND ACCOUNTS
    var arValidateSubMandatoryFlds = validateSubForMandatoryFld(['Claim Item', 'Claim Refund Cash',
                                                                 'Claim Receivable', 'Claim Payable'], 
            [lstClaimItem, lstClaimRefund, lstReceivable, lstPayable], 
            [REC_ITEM, REC_ACCOUNT, REC_ACCOUNT, REC_ACCOUNT], idSubsidiary, arNotRequiredFlds);
    if(!isEmpty(arValidateSubMandatoryFlds)) arErrMessage.push(arValidateSubMandatoryFlds);
    
    // VALIDATE CLAIM TRANSACTION
    if(isEmpty(lstClaimTrans) && lstRemittanceType != HC_REM_TYPE.None
            && !isEmpty(lstRemittanceType)){
        arErrMessage.push('Claim Transaction must be specified.');
    }else{
        var arAcceptedTrans = [];
        if (lstRebateType == HC_REB_TYPE.RebPurchase)
            arAcceptedTrans.push('Bill', 'Vendor Return Authorization',
                    'Item Receipt', 'Bill Credit', 'Purchase Order');
        if(lstRebateType == HC_REB_TYPE.RebSale || 
                lstRebateType == HC_REB_TYPE.CustReb){
            arAcceptedTrans.push('Estimate', 'Sales Order', 'Item Fulfillment',
                    'Invoice', 'Cash Sale', 'Cash Refund', 'Credit Memo', 'Return Authorization');
            if(lstRebateType == HC_REB_TYPE.RebSale)
                arAcceptedTrans.push('Work Order', 'Assembly Build', 'Assembly Unbuild');
        }
            
        /*if (lstRebateType == HC_REB_TYPE.RebSale)
            arAcceptedTrans.push('Invoice', 'Return Authorization',
                    'Credit Memo', 'Item Fulfillment', 'Work Order',
                    'Assembly Build', 'Assembly Unbuild', 'Quote',
                    'Sales Order', 'Cash Sale');
        if (lstRebateType == HC_REB_TYPE.CustReb)
            arAcceptedTrans.push('Invoice', 'Cash Sale', 'Credit Memo',
                    'Return Authorization', 'Cash Refund', 'Quote',
                    'Sales Order', 'Item Fulfillment');*/

        var arUnacceptedTrans = [];
        if (!isEmpty(lstClaimTrans)) {
            for (var i = 0; i < lstClaimTrans.length; i++) {
                if (arAcceptedTrans.indexOf(lstClaimTrans[i]) == -1)
                    arUnacceptedTrans.push(lstClaimTrans[i]);
            }
            if (arUnacceptedTrans.length > 0) {
                arErrMessage.push('Invalid Transaction Types for Rebate Type '
                        + stRebateType + ': ' + arUnacceptedTrans.toString());
            }
        }
    }
    
    if(bIsTiered == 'T'){
        if(isEmpty(stTierType))
            arErrMessage.push('Tier Type must be specified.');
        if(forceParseFloat(flDefAmount) > 0)
            arErrMessage.push('Default Amount must not be specified.');
        if(forceParseFloat(flDefCostPerc) > 0)
            arErrMessage.push('Default % must not be specified.');
    }else{
        nlapiSetFieldValue('custrecord_nsts_rm_tier_type', '');
    }
    
    var arrAccMsg = validateAccrualAccounts(lstRebateType, bAccrue, stAccrueExpense, stAccruePayable, stAccrueReceivable, stAccrualAccount);
    if (!isEmpty(arrAccMsg)) {
        if (!isEmpty(arErrMessage)) {
            arErrMessage = arErrMessage.concat(arrAccMsg);
        } else {
            arErrMessage = arrAccMsg;
        }
    }
    /**
    
    if (type != HC_MODE_TYPE.Xedit) {
	    var arrTGMsg = validateTierGroup();
	    if (!isEmpty(arrTGMsg)) {
	        if (!isEmpty(arErrMessage)) {
	            arErrMessage = arErrMessage.concat(arrTGMsg);
	        } else {
	            arErrMessage = arrTGMsg;
	        }
	    }
    }
    */
    //THROW ALL ERRORS VIA AN ARRAY
    if(arErrMessage.length > 0) throw nlapiCreateError('Error', arErrMessage.join('<br>'), true);
}

//CHECK IF FIELD IS MANDATORY. IF YES, VALIDATE IF ITS SUBSIDIARY MATCHES THE AGREEMENT'S SUBSIDIARY
function validateSubForMandatoryFld(arFieldLabel, arFieldValue, arRecType, idSubsidiary, arNotRequiredFlds){
    var arSubsidiaryMessage = [];
    for(var i = 0 ; i < arFieldLabel.length; i++){
        if(arNotRequiredFlds.indexOf(arFieldLabel[i]) == -1 && !isEmpty(arFieldValue[i])){
            var arValidateSubsidiary = validateSubsidiaryCurrency(
                    arFieldValue[i], arRecType[i], idSubsidiary, null, true);
            if(!isEmpty(arValidateSubsidiary)) arSubsidiaryMessage.push(arValidateSubsidiary);
        }      
    }
    
    if(!isEmpty(arSubsidiaryMessage)) return arSubsidiaryMessage.join('<br>');
}

//VALIDATE THE SUBSIDIARY/CURRENCY OF A FIELD VALUE IF IT MATCHES THE AGREEMENT
function validateSubsidiaryCurrency(idEntity, idRecord, idSubsidiary, idCurrency, bSubsidiaryOnly, bCurrencyOnly) {
    var arCurrency = [], stErrMessage = [];

    if (!isEmpty(idEntity)) {
        if(HC_OBJ_FEATURE.blnOneWorld && bSubsidiaryOnly && !isEmpty(idSubsidiary)){
            var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity)];
            var arrVer = nlapiGetContext().getVersion().split('.');
        	if (idRecord == HC_VENDOR &&
        			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
            	arFilter.push(new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', fldSubsidiary));
            } else {
            	arFilter.push(new nlobjSearchFilter(HC_SUBSIDIARY, null, 'anyof', idSubsidiary));
            }
            var objSubsidiaryResults = nlapiSearchRecord(idRecord, null, arFilter);
            if(isEmpty(objSubsidiaryResults))
                stErrMessage.push(idRecord.capitalizeFirstLetter()
                    + ' subsidiary must be consistent with the Agreement Subsidiary');
        }else if(bCurrencyOnly){
            var objCurrency = nlapiLookupField(idRecord, idEntity, [FLD_CURRENCY]);       
            if(objCurrency[FLD_CURRENCY] != idCurrency)
                stErrMessage
                .push(idRecord.capitalizeFirstLetter()
                      + ' currency must be consistent with the Agreement Currency');
        }else if(!bSubsidiaryOnly && !bCurrencyOnly){
            var recEntity = nlapiLoadRecord(idRecord, idEntity);
            var stEntityType = recEntity.getRecordType();
            var intCurrencyCount = recEntity.getLineItemCount(HC_CURRENCY);
            // VALIDATE SUBSIDIARY
            if (HC_OBJ_FEATURE.blnOneWorld == true) {
            	var arrVer = nlapiGetContext().getVersion().split('.');
            	if (idRecord == HC_VENDOR &&
            			(arrVer[0] > 2017 || (arrVer[0] == 2017 && arrVer[1] == 2))) {
            		var arFilter = [new nlobjSearchFilter(FLD_INTERNAL_ID, null, 'is', idEntity),
                    		new nlobjSearchFilter(FLD_INTERNAL_ID, FLD_MSESUBSIDIARY, 'anyof', idSubsidiary)];
                    var objSubsidiaryResults = nlapiSearchRecord(idRecord, null, arFilter);
                    if(isEmpty(objSubsidiaryResults))
                        stErrMessage.push(stRecType.capitalizeFirstLetter()
                            + ' subsidiary must be consistent with the Agreement Subsidiary');
            	} else {
	                var objEntity = nlapiLookupField(idRecord, idEntity, [
	                    HC_SUBSIDIARY
	                ]);
	                if (objEntity[HC_SUBSIDIARY] != idSubsidiary)
	                    stErrMessage.push(stEntityType.capitalizeFirstLetter()
	                                  + ' subsidiary must be consistent with the Agreement Subsidiary');
            	}
            }
            // VALIDATE CURRENCY
            if (HC_OBJ_FEATURE.bMultiCurrency == true) {
                for (var line = 1; line <= intCurrencyCount; line++) {
                    arCurrency.push(recEntity.getLineItemValue(HC_CURRENCY,
                            'currency', line))
                }
                if (arCurrency.indexOf(idCurrency) < 0) {
                    stErrMessage.push('Currency of the Agreement must be available for the selected '
                                  + stEntityType.capitalizeFirstLetter());
                }
            } /*else {
                var stPrimaryCurrency = recEntity.getFieldValue(HC_CURRENCY);
                if (stPrimaryCurrency != idCurrency) {
                    stErrMessage.push('Currency of the Agreement must be the Primary Currency of the selected '
                                  + stEntityType.capitalizeFirstLetter());
                }
            }*/
        }   
    }
    return stErrMessage;
}

//CHECKS IF THE AGREEMENT NAME ALREADY EXISTS
function validateDuplicateAgrName(stAgreementName) {
    if(!isEmpty(stAgreementName)){
        var objFilter = [
        new nlobjSearchFilter(FLD_CUSTRECORD_AGREEMENT_NAME, null, 'is', stAgreementName)
        ];
        var objResults = nlapiSearchRecord(REC_REBATE_AGREEMENT, null, objFilter);
        var stErrMessage = '';
    
        if (!isEmpty(objResults)) {
            if (objResults[0].getId() != nlapiGetRecordId()) {
                return true;
            }
        }
    }
}

// CHECKS IF THE REBATE AGREEMENT HAS REBATE TRANSACTIONS ASSOCIATED IN IT
function checkAssociatedRebTrans(idAgreement) {
    
    var objFilter = [
        new nlobjSearchFilter(FLD_CUSTRECORD_TRANS_AGREEMENT, null, 'anyof',
                idAgreement)
    ];
    var objTranSearch = nlapiSearchRecord(REC_TRANSACTION_DETAIL, null,
            objFilter);

    return objTranSearch;
}

//CHECKS IF A CLAIM IS ALREADY GENERATED FOR THE AGREEMENT
function checkIfClaimGenerated(idAgreement){
    var objFilter = [new nlobjSearchFilter(FLD_CLAIM_GEN_REBATE_AGREEMENT, null, 'anyof', idAgreement),
                     new nlobjSearchFilter(FLD_CLAIM_GEN_STATUS, null, 'anyof', HC_CLAIM_GEN_LOG_STATUS.Completed)];
    var objClaimSearch = nlapiSearchRecord(REC_CLAIM_GENERATION_LOG, null,
            objFilter);
    
    if(!isEmpty(objClaimSearch)) return true;
    return false;
}

// HIDE/DISABLE FIELDS BASED ON REBATE TYPE
function disableSearchBasedOnRebType() { 
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var bIncludeAll = nlapiGetFieldValue(FLD_CUSTRECORD_INCLUDE_ALL);

    if (bIncludeAll != 'T') {
        if (lstRebateType != HC_REB_TYPE.RebPurchase) { 
            nlapiGetField(FLD_CUSTRECORD_VENDOR_SEARCH).setDisplayType(
                    HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTRECORD_VEND_LINK).setDisplayType(HC_DISPLAY_TYPE.Hidden);
        } else {
            nlapiGetField(FLD_CUSTRECORD_CUST_SEARCH)
                    .setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTRECORD_CUST_LINK).setDisplayType(HC_DISPLAY_TYPE.Hidden);
        }
    } else {
        nlapiGetField(FLD_CUSTRECORD_VENDOR_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_CUST_SEARCH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_VEND_LINK).setDisplayType(HC_DISPLAY_TYPE.Hidden);
        nlapiGetField(FLD_CUSTRECORD_CUST_LINK).setDisplayType(HC_DISPLAY_TYPE.Hidden);
    }
}

// HIDE/DISABLE FIELDS BASED ON REBATE TYPE AND REMITTANCE TYPE
function disableSearchBasedOnRemType() { 
    var lstRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var lstRemittanceType = nlapiGetFieldValue(FLD_CUSTRECORD_REMITTANCE_TYPE);

    nlapiGetField(FLD_CUSTRECORD_CREDIT_ENTITY).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTRECORD_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTRECORD_REFUND_ENTITY).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTRECORD_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTRECORD_REFUND_CASH).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    nlapiGetField(FLD_CUSTRECORD_CLAIM_TRANS).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    
    if (lstRemittanceType != HC_REM_TYPE.None && !isEmpty(lstRebateType)
        && !isEmpty(lstRemittanceType)) {
        // REMITTANCE TYPE - "3" IS THE ID OF NONE
        nlapiGetField(FLD_CUSTRECORD_CLAIM_TRANS).setDisplayType(HC_DISPLAY_TYPE.Normal);

        if (lstRebateType == HC_REB_TYPE.RebPurchase
            || lstRebateType == HC_REB_TYPE.RebSale) {
            if (lstRemittanceType == HC_REM_TYPE.Credit) {
                nlapiGetField(FLD_CUSTRECORD_CREDIT_ENTITY).setDisplayType(
                        HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Normal);
            } else if (lstRemittanceType == HC_REM_TYPE.Refund) {
                nlapiGetField(FLD_CUSTRECORD_REFUND_ENTITY).setDisplayType(
                        HC_DISPLAY_TYPE.Normal);
                nlapiGetField(FLD_CUSTRECORD_RECEIVABLE).setDisplayType(
                        HC_DISPLAY_TYPE.Normal);
            }
        } else if (lstRebateType == HC_REB_TYPE.CustReb) {
            nlapiGetField(FLD_CUSTRECORD_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Normal);
            if (lstRemittanceType == HC_REM_TYPE.Refund)
                nlapiGetField(FLD_CUSTRECORD_REFUND_CASH).setDisplayType(
                        HC_DISPLAY_TYPE.Normal);
        }
    }
}

//GETS THE SEARCH RESULT URL FOR THE DEFAULT SAVED SEARCH HYPERLINKS
function getSearchUrl(stRecType){
    var objLoadSearch = nlapiLoadSearch(null, 'customsearch_nsts_rm_'+stRecType+'_search');
    var stUrl = nlapiResolveURL('TASKLINK', 'LIST_SEARCHRESULTS');
    
    return stUrl + "?searchid="+
    objLoadSearch.getId();
}

function includeInSubmitField(arFields, arFieldValues, idFld, stFldValue){
    if(!isEmpty(stFldValue)){
        arFields.push(idFld);
        arFieldValues.push(stFldValue);
    }
    
}

function disableAccrualFields() {
    var stRebateType = nlapiGetFieldValue(FLD_CUSTRECORD_TYPE);
    var bAccrue = nlapiGetFieldValue(FLD_CUSTRECORD_ACCRUE_AMOUNTS);
    
    if (bAccrue == 'T') {
        if (isEmpty(stRebateType)) {
            nlapiGetField(FLD_CUSTRECORD_ACCRUED_EXPENSES).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTRECORD_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
            nlapiGetField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        } else if (stRebateType != HC_REBATE_TYPE.Customer_Rebate) {
            nlapiGetField(FLD_CUSTRECORD_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        } else {
            nlapiGetField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        }
    } else {
        nlapiGetField(FLD_CUSTRECORD_ACCRUED_EXPENSES).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_ACCRUED_PAYABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
        nlapiGetField(FLD_CUSTRECORD_ACCRUED_RECEIVABLE).setDisplayType(HC_DISPLAY_TYPE.Disabled);
    }
}

function validateTierGroup() {
	var arrMsg = [];
	var recNewRec = nlapiGetNewRecord();
	var bIsItemClass = recNewRec.getFieldValue(FLD_CUSTRECORD_IS_CLASS);
	var arrTierGroup = [], arrItems = [], arrItemClass = [];
	
	for (var intCtr = 1; intCtr <= nlapiGetLineItemCount(SBL_RA_TIER_GROUP); intCtr++) {
		if (isEmpty(nlapiGetLineItemValue(SBL_RA_TIER_GROUP, FLD_NAME, intCtr))) {
			arrMsg.push('There is a Tier Group with no name.');
		} else if (arrTierGroup.indexOf(nlapiGetLineItemValue(SBL_RA_TIER_GROUP, FLD_NAME, intCtr)) < 0) {
			arrTierGroup.push(nlapiGetLineItemValue(SBL_RA_TIER_GROUP, FLD_NAME, intCtr));
		} else {
			arrMsg.push('There are Tier Groups with the same name.');
		}
		
		if (!isEmpty(nlapiGetLineItemValues(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEMS, intCtr))) arrItems = arrItems.concat(nlapiGetLineItemValues(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEMS, intCtr));
		if (!isEmpty(arrItemClass.concat(nlapiGetLineItemValues(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEM_CLASSIFICATION, intCtr)))) arrItemClass = arrItemClass.concat(nlapiGetLineItemValues(SBL_RA_TIER_GROUP, FLD_TIER_GROUP_ITEM_CLASSIFICATION, intCtr));
	}
	
	if (!isEmpty(nlapiGetRecordId())) {
		var arrFromRad = tierGroupcheckRebateAgreementdetails(nlapiGetRecordId(), arrItems, arrItemClass, recNewRec);
		if (arrFromRad['b_ra_no_rad']) arrMsg.push("Can't create Tier Group since there no Rebate Agreement Details."); 
		if((arrFromRad['b_ra_is_items'] && !isEmpty(arrItems)) || (!arrFromRad['b_ra_is_items'] && !isEmpty(arrItemClass))){
			if(arrFromRad['b_item_or_class_not_found']  && arrFromRad['b_ra_is_items']) arrMsg.push('There is a Tier Group Item not defined on Rebate Agreement Details.');
			if(arrFromRad['b_item_or_class_not_found'] && !arrFromRad['b_ra_is_items']) arrMsg.push('There is a Tier Group Item Classification not defined on Rebate Agreement Details.');
		}
	}
	
	return arrMsg;
}

function tierGroupcheckRebateAgreementdetails(intRebateAgreement, arrItems, arrItemClassifications, recNewRec){
	
	var message = '';
	var arrFilters = [], arrColumns = [], arrReturn = [];
	var arrRadItems = [], arrRadItemClassifications = [], bRaIsItems = false, bNoRad = false, bItemOrClassificationNotFound = false;
	var intRADCount = recNewRec.getLineItemCount(SBL_REBATE_DETAIL);
	
	var arrSrc = [], arrTarget = [];
	
	if(!isEmpty(recNewRec) && parseInt(intRADCount) > parseInt(0)){
		if(!isEmpty(recNewRec.getLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_ITEM, 1))) bRaIsItems = true;
		
		for (var intCtr = 1; intCtr <= intRADCount; intCtr++) {
			if (bRaIsItems) {
				arrRadItems.push(recNewRec.getLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_ITEM, intCtr));
			} else {
				arrRadItemClassifications.push(recNewRec.getLineItemValue(SBL_REBATE_DETAIL, FLD_CUSTRECORD_DET_EL_ITEM_CLASS, intCtr));
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
	}
	else{
		bNoRad = true;
	}
	
	arrReturn['b_ra_is_items'] 	= bRaIsItems;
	arrReturn['b_ra_no_rad'] 	= bNoRad;
	arrReturn['b_item_or_class_not_found'] = bItemOrClassificationNotFound;

	return arrReturn;
}

function getAccrualAccount(lstRebateType){
	var objValues = {
			accFlag: '',
			accExpense: '',
			accReceivable: '',
			accPayable: '',
			accId: ''
	};
	
	if (!isEmpty(lstRebateType)) {
		var arrFil = [new nlobjSearchFilter(FLD_INACTIVE, null, 'is', 'F'),
            new nlobjSearchFilter(FLD_ACCRUAL_ACCOUNT_REBATE_TYPE, null, 'anyof', lstRebateType)];
        var arrCol = [new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_FLAG),
            new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE),
            new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE),
            new nlobjSearchColumn(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE)];
        
        var arrRes = getAllResults(REC_ACCRUAL_ACCOUNT, null, arrFil, arrCol);
        
        if (!isEmpty(arrRes)) {
            var arrResults = arrRes.results;
            
            objValues.accFlag = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_FLAG);
            objValues.accExpense = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_EXPENSE);
            objValues.accReceivable = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_RECEIVABLE);
            objValues.accPayable = arrResults[0].getValue(FLD_ACCRUAL_ACCOUNT_ACCRUED_PAYABLE);
            objValues.accId = arrResults[0].getId();
        } 
	}
	
	return objValues;
}