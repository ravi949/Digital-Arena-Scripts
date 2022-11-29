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
 * This module contains the suitelet that will be used by the transacations 
 * to show the applicable rebates where the user will select which will apply
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 May 2015     pdeleon   Initial version.
 * 
 */

{
    SUBLIST = 'custpage_list';
}
 
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */
function formSuitelet_showApplicableRebates(request, response) {
    var stLogTitle = 'FORMSUITELET_SHOWAPPLICABLEREBATES';
    
    var stRebateType =  request.getParameter(PARAM_REBATETYPE);
    if (request.getMethod() == 'GET') {
        //Show form if request is from transactions
        //Get parameters
        var intItemLine = request.getParameter(PARAM_LINE);
        var stEntity = request.getParameter(PARAM_ENTITY);
        var stRecordType = request.getParameter(PARAM_RECORD_TYPE);
        var stItem = request.getParameter(PARAM_ITEM);
        var stItemType = request.getParameter(PARAM_ITEM_TYPE);
        var stSubsidiary = request.getParameter(PARAM_SUBSIDIARY);
        var stLocation = request.getParameter(PARAM_LOCATION);
        var stCurrency = request.getParameter(PARAM_CURRENCY);
        var stTrandate = request.getParameter(PARAM_TRANDATE);
        var intQty = parseFloat(request.getParameter(PARAM_QTY));
        var flRate = request.getParameter(PARAM_RATE);
        var stUnits = request.getParameter(PARAM_UNITS);
        var selectedRebateDetails = request.getParameter(PARAM_DATA);
        var flAvgCost = request.getParameter(PARAM_AVG_COST);
        var flItemDefCost = request.getParameter(PARAM_ITEM_DEF_COST);
        var flLastPurchPrice = request.getParameter(PARAM_LAST_PURCH_PRICE);
        var flPrefVendorRate = request.getParameter(PARAM_PREF_VENDOR_RATE);
        var stCostBasisInstance = request.getParameter(PARAM_COST_BASES);
        var stRTId = request.getParameter(PARAM_RTID);
        var flLineAmt = request.getParameter('lineamt');
        
        var objClassification = request.getParameter('class');
        nlapiLogExecution('debug', 'objClassification', objClassification);
        objClassification = parseStringToJson(objClassification, {});
        

        nlapiLogExecution('debug', 'cost basis', stCostBasisInstance);
        var objCostBasisInstance = null;
        if (!isEmpty(stCostBasisInstance)) {
            objCostBasisInstance = parseStringToJson(stCostBasisInstance);
        }
        selectedRebateDetails = parseStringToJson(selectedRebateDetails, []);

        intQty = (intQty)? intQty : 0;

        log("debug", stLogTitle, "stRebateType:" + stRebateType);
        //Execute search here
        
        //Create form here
        var objForm = nlapiCreateForm('Applicable Rebates', true);
        
        
        if(isEmpty(stEntity)){
            objForm.addField("custpage_nsts_rm_noentity", "text", "").setDisplayType("inline").setDefaultValue("ENTITY ON THE RECORD IS NOT SET");
            
            response.writePage(objForm);
            return;
        }
        
        if(isEmpty(stItem)){
            objForm.addField("custpage_nsts_rm_item", "text", "").setDisplayType("inline").setDefaultValue("PLEASE SELECT AN ELIGIBLE ITEM");
            response.writePage(objForm);
            return;
        }
        
        if(isEmpty(stCurrency)){
            objForm.addField("custpage_nsts_rm_currency", "text", "").setDisplayType("inline").setDefaultValue("PLEASE ");
            response.writePage(objForm);
            return;
        }
        
        objForm.setScript(CUSTOMSCRIPT_NSTS_RM_LINEVALDNREBATES_CS);
        
        
        var entitySource = (stRecordType == "salesorder")?"customer": "";
        var objEntityField = objForm.addField(FLD_SL_ENTITY, 'select', "entity",stRecordType);
        objEntityField.setDisplayType('hidden');
        objEntityField.setDefaultValue(stEntity);
        
        var objItemLineField = objForm.addField(FLD_SL_ITEM_LINE, 'text', 'Item Line');
        objItemLineField.setDisplayType('hidden');
        objItemLineField.setDefaultValue(intItemLine);
        
        var objItemField = objForm.addField(FLD_SL_ITEM, 'text', 'Item');
        objItemField.setDisplayType('hidden');
        objItemField.setDefaultValue(stItem);
        
        var objRebateType = objForm.addField(FLD_SL_REBATE_TYPE, 'text', 'Item');
        objRebateType.setDisplayType('hidden');
        objRebateType.setDefaultValue(stRebateType);
        
        var objCostBasisField = objForm.addField(FLD_SL_COST_BASIS, 'textarea', 'Cost Basis');
        var stCostBasis = parseJsonToString(objCostBasisInstance);
        objCostBasisField.setDefaultValue(stCostBasis);
        objCostBasisField.setDisplayType('hidden');
        
        var objRTId = objForm.addField(FLD_SL_REBATE_RTID, 'text', 'RTId');
        objRTId.setDefaultValue(stRTId);
        objRTId.setDisplayType('hidden');
        
        var objRebateSublist = objForm.addSubList(SBL_SL_REBATE, 'list', 'Rebates');
        
        objRebateSublist.addField(FLD_SL_REBATE_DATA, 'textarea', 'Data(Jason)').setDisplayType('hidden');
        objRebateSublist.addField(FLD_SL_REBATE_SELECT, 'checkbox', 'Apply');

        var stVenDisplayType = "inline";
        var stCustDisplayType = "inline";
        
        if(stRebateType == "1"){
            stVenDisplayType = "inline";
            stCustDisplayType = "hidden"; //hidden
        }else{
            stVenDisplayType = "hidden";
            stCustDisplayType = "inline";
        }
        
        objRebateSublist.addField(FLD_SL_VEN_CLASS, 'TEXT', 'Vendor Class', REC_CUSTOMRECORD_NSTS_RM_GENERIC_CLASS).setDisplayType(stVenDisplayType);
        objRebateSublist.addField(FLD_SL_CUST_CLASS, 'TEXT', 'Customer Class', REC_CUSTOMRECORD_NSTS_RM_GENERIC_CLASS).setDisplayType(stCustDisplayType);
        objRebateSublist.addField(FLD_SL_ITEM_CLASS, 'TEXT', 'Item Class', REC_CUSTOMRECORD_NSTS_RM_GENERIC_CLASS).setDisplayType('inline');
  
        objRebateSublist.addField(FLD_SL_RA, 'textarea', 'Rebate Agreement', REC_REBATE_AGREEMENT).setDisplayType('inline');
        objRebateSublist.addField(FLD_SL_PRIORITY, 'select', 'Priority', "customlist_nsts_rm_priority_list").setDisplayType('inline');
        objRebateSublist.addField(FLD_SL_STACKABLE, 'select', 'stackable', "customlist_nsts_rm_yesno").setDisplayType('inline');
        objRebateSublist.addField(FLD_SL_REBATE_COMPONENT, 'text', 'Component').setDisplayType('inline');

        objRebateSublist.addField(FLD_SL_AMOUNT, 'text', 'Rebate').setDisplayType('inline');
        objRebateSublist.addField(FLD_SL_TOTAL_AMOUNT, 'text', 'Total Rebate').setDisplayType('inline');
        objRebateSublist.addField('custpage_nsts_rm_sbl_accrual', 'text', 'Accrual').setDisplayType('inline');
        if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale) objRebateSublist.addField(FLD_SL_PASS_THROUGH_AMOUNT, 'text', 'Pass Through Amount').setDisplayType('inline');
        
        objRebateSublist.addField(FLD_SL_RAD, 'text', 'Rebate Agreement Detail').setDisplayType('hidden');
        
        var stRebatesJson = '';
        nlapiLogExecution('debug', 'itemtype', stItemType);
        if (stItemType != null && stItemType != undefined && 
                (stItemType.toUpperCase() == 'ASSEMBLY' || 
                stItemType.toUpperCase() == 'KIT')) {
            //var stComponents = getComponent(stItem,intQty);
            //nlapiLogExecution('DEBUG','RETURN VAL', JSON.stringify(stComponents));
            //setSublsitForAssembly(objRebateSublist, stItem, stEntity);
            stRebatesJson = setSublistForAssembly(objRebateSublist, stRecordType, stEntity, stCurrency, stSubsidiary, stLocation, stTrandate, stItem, stUnits,intQty,
                    stRebateType,selectedRebateDetails, stItemType, flRate, objCostBasisInstance,stRTId,objClassification,flLineAmt);
        } else {
            stRebatesJson = setRebatesSublist(objRebateSublist, stRecordType, stEntity, stCurrency, stSubsidiary, stLocation, stTrandate, stItem, stUnits,intQty,
                    stRebateType,selectedRebateDetails, stItemType, flRate, objCostBasisInstance,stRTId,objClassification,flLineAmt);
        }
        
        var objItemField = objForm.addField(FLD_SL_REBATES, 'textarea', 'Rebates JSON');
        objItemField.setDisplayType('hidden');
        objItemField.setDefaultValue(stRebatesJson);
        
        objForm.addSubmitButton('Submit');
        
        response.writePage(objForm);
    } else {        
        var stHtml = '<html>';  
        stHtml += '   <head>';  
        stHtml += '       <script language="JavaScript">';
        stHtml += '           window.close();';
        stHtml += '       </script>';  
        stHtml += '   </head>';  
        stHtml += '</html>';
        
        nlapiLogExecution('debug', 'html', stHtml);
        response.write(stHtml);
    }
}

function setSublistForAssembly(objRebateSublist, stRecType, stEntity, stCurrency, stSubsidiary, stLocation, stTranDate, stItem, 
        stUOM, intQty,stRebateType,selectedRebateDetails, stItemType, flRate, objCostBasis,stRTId,objClassification,flLineAmt){
    var stLogTitle = "SETSUBLISTFORASSEMBLY";
    
    var arrAddFilters = [];
    var arrPrevRebates = [];
    var objPrevRebInfo = getPreviousApplicableRebates(stRTId, stRebateType);
    arrAddFilters = null;//objPrevRebInfo.arrAddFilters;
    arrPrevRebates = objPrevRebInfo.arrPrevRebates;
    log("debug", stLogTitle,"ASSEMBLY" +  parseJsonToString(arrAddFilters,'[]'))
    log("debug", stLogTitle,"arrPrevRebates" +  parseJsonToString(arrPrevRebates,'[]'))
    var arrComp = [];
    var stComponents = getComponent(stItem,stItemType,intQty,'P',0,objClassification.itemClass);
    nlapiLogExecution('DEBUG','RETURN VAL', stItem+'|'+stComponents.length+'::'+JSON.stringify(stComponents));
    
    var arrRebates = [];
    var stRebatesJson = '';
    var stBaseCurrency = null;
    
    var arrExistingRADPlaceHolding = [];
    log("DEBUG", "SETSUBLISTFORASSEMBLY", parseJsonToString(arrAddFilters));
    
    var arrCostBasis = [];
    if (!isEmpty(objCostBasis)) {
        if (objCostBasis instanceof Array) {
            arrCostBasis = objCostBasis;
        }
    }
    
    for( var i = 0; i < stComponents.length; i++ ) {
        var stLog = "";
        var arrResults = null;
        if (stComponents[i]['id'] == stItem) {
            var objClassificationAssembly = {
                    itemClass: stComponents[i]['itemClass'],
                    vendorClass: objClassification.vendorClass,
                    customerClass: objClassification.customerClass
            };
            arrResults = searchRebates(stRecType, stEntity, stCurrency, stSubsidiary, stTranDate, stComponents[i]['id'], stComponents[i]['type'], stUOM,stLog,stRebateType,objClassificationAssembly,arrAddFilters);
            log("DEBUG", "SETSUBLISTFORASSEMBLY", "if (stComponents[i]['id'] == stItem) ");    
            arrAddFilters = null;//Dispose when the 1st loop is call searchRebates to append the existing Rebate once
        } else if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale) {
            var objClassificationAssembly = {
                    itemClass: stComponents[i]['itemClass'],
                    vendorClass: objClassification.vendorClass,
                    customerClass: objClassification.customerClass
            };
            log("DEBUG", "SETSUBLISTFORASSEMBLY", "else if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale)");    
            arrResults = searchRebates(stRecType, stEntity, stCurrency, stSubsidiary, stTranDate, stComponents[i]['id'], stComponents[i]['type'], stUOM,stLog,stRebateType,objClassificationAssembly,arrAddFilters);
            arrAddFilters = null;//Dispose when the 1st loop is call searchRebates to append the existing Rebate once
        } else {
            continue;
        }
        
        //arrAddFilters = null;//Dispose when the 1st loop is call searchRebates to append the existing Rebate once
        var arrRebatesSeleted = selectedRebateDetails; //parseStringToJson(selectedRebateDetails);


        //nlapiLogExecution("debug", "setRebatesSublist", "selectedRebateDetails:" + selectedRebateDetails);
        nlapiLogExecution('debug', 'assemblyarrResults', JSON.stringify(arrResults));
        nlapiLogExecution('debug', 'arrPrevRebatesres', JSON.stringify(arrPrevRebates));
        var intTotalRebates = arrResults.length;
        var objComponentCostBasis = getCostBasisFromArray(arrCostBasis, stComponents[i]['id']);
        if (isEmpty(objComponentCostBasis)) {
            objComponentCostBasis = retrieveCostBasisObject(stComponents[i]['id'], stComponents[i]['type'], stLocation, stSubsidiary, stBaseCurrency, stCurrency, stTranDate, flRate, flLineAmt);
            arrCostBasis.push(objComponentCostBasis);
        }
        flRate = objComponentCostBasis.transPrice;
        
//        var objComponentCostBasis = retrieveCostBasisObject(stComponents[i]['id'], stComponents[i]['type'], stLocation, stSubsidiary, stBaseCurrency, stCurrency, stTranDate, flRate);
       
        for (var intCtr = 0; intCtr < intTotalRebates; intCtr++) {
            var objRAD = arrResults[intCtr];
            var objRebate = {};
            
            var argUlr = nlapiResolveURL("record", REC_REBATE_AGREEMENT, objRAD.agreementInternalId);
            var objData = {};
            
//            var objComponentCostBasis = getCostBasisObject(stComponents[i]['type'], stComponents[i]['id'], stSubsidiary, stLocation, stCurrency, stTranDate, objRAD.rebateCost, flRate);
            if (!isEmpty(stBaseCurrency)) {
                stBaseCurrency = objRAD.baseCurrency;
            }
            if (!objComponentCostBasis.baseCurrAdjusted) {
                objComponentCostBasis = adjustCostBasisForBaseCurrency(stBaseCurrency, stCurrency, objComponentCostBasis, stTranDate);
            }
            objComponentCostBasis.rebateCost = objRAD.rebateCost;
            
            nlapiLogExecution('debug', stComponents[i]['quantity'], stComponents[i]['appliedQty']);
            var intQtyMultiplier = stComponents[i]['appliedQty'];
            if (!isNaN(intQtyMultiplier) || parseFloat(intQtyMultiplier)<= 0) {
                intQtyMultiplier = stComponents[i]['quantity'];
            }
            
            var objRebateAmount = calculateRebate(stRecType, stRebateType, objRAD.calcType, objRAD.costBasis, intQtyMultiplier, objRAD.rebateAmount, objRAD.rebatePerc, 
                    flRate, objRAD.rebateCost, objComponentCostBasis, objRAD.agreementInternalId, stItem, objRAD.tiered, objRAD.itemClass, stEntity, objRAD.accrualPerc, objRAD.passThroughPerc, objRAD.passThroughVal);
            
            nlapiLogExecution('debug', 'type', stComponents[i]['type']);
            nlapiLogExecution('debug', stLogTitle,"objRebateAmount:" + parseJsonToString(objRebateAmount, '..'));
            //Set Data
            objData.internalId = objRAD.internalId;
            objData.agreementInternalId = objRAD.agreementInternalId;
           // objData.agreementName = objRAD.agreementName;
            objData.stackable = objRAD.stackable;
            objData.rebateType = objRAD.rebateType;
            objData.item = objRAD.item;
            objData.calcMethod = objRAD.calcMethod;
            objData.costBasis = objRAD.costBasis;
            objData.agreementEndDate = objRAD.agreementEndDate;
            objData.rebateAmount = objRAD.rebateAmount; //This Should not be multiply * intQty
            objData.rebatePerc = objRAD.rebatePerc;
            objData.rebateCost = objRAD.rebateCost;
            objData.calcType = objRAD.calcType;
            objData.passThroughPerc = objRAD.passThroughPerc;
            objData.passThroughVal = objRAD.passThroughVal;
            
            var stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink'>" + objRAD.agreementName + "</a>" ;
            if(!isEmpty(arrPrevRebates)){
                arrPrevRebates.filter(function(obj){
                    if(obj.RADId == objRAD.internalId){
                        objData.RTId = obj.RTId;
                        objData.RTDId = obj.RTDId;
                        objData.claims = obj.claims;
                        
                        objData.accrualJE = obj.accrualJE;
                        if(!isEmpty(obj.accrualJE)){
                            objRebate[FLD_SL_REBATE_SELECT] = "T";
                            objRebateAmount.rebateAmt = obj.amount;
                            objRebateAmount.totalRebateAmt = obj.totAmount;
                            stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink' style='background-color: lightblue!important;'>" + objRAD.agreementName + "</a>" ;
                        }
                        
                        if(!isEmpty(obj.claims)){
                            objRebate[FLD_SL_REBATE_SELECT] = "T";
                            objRebateAmount.rebateAmt = obj.amount;
                            objRebateAmount.totalRebateAmt = obj.totAmount;
                            stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink' style='background-color: lightyellow!important;'>" + objRAD.agreementName + "</a>" ;
                        }
                        return true;
                    }
                    return false;
                });
            }
            
            objRebate[FLD_SL_VEN_CLASS] = objRAD.vendorClassTxt;
            objRebate[FLD_SL_CUST_CLASS] = objRAD.customerClassTxt;
            objRebate[FLD_SL_ITEM_CLASS] = objRAD.itemClassTxt;
            
            objRebate[FLD_SL_ITEM] = stComponents[i]['id'];
            objRebate[FLD_SL_RAD] = objRAD.internalId;
            objRebate[FLD_SL_RA] = stRALink;
            objRebate[FLD_SL_AMOUNT] = objRebateAmount.rebateAmt;
            objRebate[FLD_SL_TOTAL_AMOUNT] = objRebateAmount.totalRebateAmt;
            objRebate[FLD_SL_PRIORITY] = objRAD.agreementPriority;
            objRebate[FLD_SL_STACKABLE] = objRAD.stackable;
            //objRebate[FLD_SL_REBATE_COMPONENT] = objRAD.itemText.substring(objRAD.itemText.lastIndexOf(':')+1);
            objRebate[FLD_SL_REBATE_COMPONENT] = stComponents[i]['text'];
            objRebate[FLD_SL_REBATE_DATA] = parseJsonToString(objData);
            objRebate['custpage_nsts_rm_sbl_accrual'] = objRebateAmount.accrual;
            if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale) objRebate[FLD_SL_PASS_THROUGH_AMOUNT] = objRebateAmount.passThroughAmount;
            
            var flAmount = objRebateAmount.rebateAmt;
            objRebate[FLD_SL_AMOUNT] = flAmount;
            var flTotalAmount = objRebateAmount.totalRebateAmt;
            objRebate[FLD_SL_TOTAL_AMOUNT] = flTotalAmount;
            log('debug', flTotalAmount, "FLD_SL_TOTAL_AMOUNT:" + flTotalAmount);
            log('debug', flTotalAmount, "arrRebatesSeleted:" + parseJsonToString(arrRebatesSeleted, "{}"));
            log('debug', flTotalAmount, "objData:" + parseJsonToString(objData, "{}"));
            if(!isEmpty(arrRebatesSeleted)){
         	   log('debug', flTotalAmount, "objData.internalId:" + parseJsonToString(objData.internalId, "{}"));
        	   
        	   var arrFiilSelect = arrRebatesSeleted.filter(function(objElem){
        		   if(objElem.ra == objData.internalId && objElem.item == objData.item){
        			   return true
        		   }
        		   return false;
        	   });
        	   
               if(!isEmpty(arrFiilSelect)){
                   objRebate[FLD_SL_REBATE_SELECT] = "T";
               }else{
                   objRebate[FLD_SL_REBATE_SELECT] = "F";
               }
            }
            
            var intRebateIndex = searchInRebatesList(arrRebates, objRAD.internalId,stComponents[i]['id']);
            if (intRebateIndex >= 0) {
                arrRebates[intRebateIndex] = objRebate;
            } else {
                stRebatesJson += objRAD;
                arrRebates.push(objRebate);
            }
            nlapiLogExecution('debug', 'setarrRebates', JSON.stringify(objRebate));
        }
        
    }
    nlapiLogExecution('debug', 'setarrRebates', JSON.stringify(arrRebates));
    objRebateSublist.setLineItemValues(arrRebates);
    return stRebatesJson;
}

function setRebatesSublist(objRebateSublist, stRecType, stEntity, stCurrency, stSubsidiary, stLocation, stTranDate, stItem, stUOM, intQty,stRebateType,selectedRebateDetails, stItemType, flRate, objCostBasis,stRTId,objClassification,flLineAmt) {
    var stLogTitle = 'SETREBATESSUBLIST';
    log("debug", stLogTitle, "stRebateType:" + stRebateType);
    var stLog = "";

    var arrAddFilters = [];
    var arrPrevRebates = [];
    var objPrevRebInfo = getPreviousApplicableRebates(stRTId, stRebateType);
    arrAddFilters = objPrevRebInfo.arrAddFilters;
    arrPrevRebates = objPrevRebInfo.arrPrevRebates;
    log("debug", stLogTitle, "INVENTORY " + parseJsonToString(arrAddFilters,'[]'))
    
    var arrResults = searchRebates(stRecType, stEntity, stCurrency, stSubsidiary, stTranDate, stItem, stItemType, stUOM,stLog,stRebateType,objClassification,arrAddFilters);
    var stRebatesJson = '';
    
    var arrRebatesSeleted = selectedRebateDetails;//parseStringToJson(selectedRebateDetails);
    nlapiLogExecution("debug", "setRebatesSublist", "selectedRebateDetails:" + selectedRebateDetails);
    
    var intTotalRebates = arrResults.length;
    var arrRebates = [];
    
    var arrExistingRADPlaceHolding = [];
    for (var intCtr = 0; intCtr < intTotalRebates; intCtr++) {
        var objRAD = arrResults[intCtr];
        var objRebate = {};
        
        var argUlr = nlapiResolveURL("record", REC_REBATE_AGREEMENT, objRAD.agreementInternalId);
        var objData = {};
        
      //TODO: _tempRemateAmt related to Rebate calculation "+ (objRAD.agreementInternalId * 10)" is just a test
//        var _tempRemateAmt = objRAD.rebateAmount;
        if (isEmpty(objCostBasis)) {
            objCostBasis = retrieveCostBasisObject(stItem, stItemType, stLocation, stSubsidiary, objRAD.baseCurrency, stCurrency, stTranDate, flRate, flLineAmt);
        }
        objCostBasis.rebateCost = objRAD.rebateCost;
//        objCostBasis.transPrice = objRAD.flAmount;
//        var objRebateAmount = calculateRebate(stItem, stItemType, stRebateType, objRAD.calcType, objRAD.costBasis, null, intQty, objRAD.rebateAmount, 
//                objRAD.rebatePerc, flAmount, stSubsidiary, stCurrency, stTranDate, null, objCostBasis);
        var objRebateAmount = calculateRebate(stRecType, stRebateType, objRAD.calcType, objRAD.costBasis, intQty, objRAD.rebateAmount, objRAD.rebatePerc, 
                flRate, objRAD.rebateCost, objCostBasis, objRAD.agreementInternalId, stItem, objRAD.tiered, objRAD.itemClass, stEntity, objRAD.accrualPerc, objRAD.passThroughPerc, objRAD.passThroughVal);
        

        
        //Set Data
        objData.internalId = objRAD.internalId;
        objData.agreementInternalId = objRAD.agreementInternalId;
        objData.agreementName = objRAD.agreementName;
        objData.stackable = objRAD.stackable;
        objData.rebateType = objRAD.rebateType;
        objData.item = objRAD.item;
        objData.calcMethod = objRAD.calcMethod;
        objData.costBasis = objRAD.costBasis;
        objData.agreementEndDate = objRAD.agreementEndDate;
//        objData.rebateAmount = _tempRemateAmt; //This Should not be multiply * intQty
        objData.rebateAmount = objRAD.rebateAmount; //This Should not be multiply * intQty
        objData.rebatePerc = objRAD.rebatePerc;
        objData.rebateCost = objRAD.rebateCost;
        objData.calcType = objRAD.calcType;
        objData.passThroughPerc = objRAD.passThroughPerc;
        objData.passThroughVal = objRAD.passThroughVal;
                       
        if(!isEmpty(arrRebatesSeleted)){
        	
     	   
     	   var arrFiilSelect = arrRebatesSeleted.filter(function(objElem){
     		   if(objElem.ra == objData.internalId && objElem.item == objData.item){
     			   return true
     		   }
     		   return false;
     	   });
     	   
            if(!isEmpty(arrFiilSelect)){
                objRebate[FLD_SL_REBATE_SELECT] = "T";
            }else{
                objRebate[FLD_SL_REBATE_SELECT] = "F";
            }
        }
        
        var stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink'>" + objRAD.agreementName + "</a>" ;
        if(!isEmpty(arrPrevRebates)){
            arrPrevRebates.filter(function(obj){
                if(obj.RADId == objRAD.internalId){
                    objData.RTId = obj.RTId;
                    objData.RTDId = obj.RTDId;
                    objData.claims = obj.claims;
                    
                    objData.accrualJE = obj.accrualJE;
                    if(!isEmpty(obj.accrualJE)){
                        objRebate[FLD_SL_REBATE_SELECT] = "T";
                        stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink' style='background-color: lightblue!important;'>" + objRAD.agreementName + "</a>" ;
                    }
                    
                    if(!isEmpty(obj.claims)){
                        objRebate[FLD_SL_REBATE_SELECT] = "T";
                        stRALink = "<a href='" + argUlr + "' target='_blank' class='dottedlink' style='background-color: lightyellow!important;'>" + objRAD.agreementName + "</a>" ;
                    }
                    return true;
                }
                return false;
            });
        }
        
        objRebate[FLD_SL_VEN_CLASS] = objRAD.vendorClassTxt;
        objRebate[FLD_SL_CUST_CLASS] = objRAD.customerClassTxt;
        objRebate[FLD_SL_ITEM_CLASS] = objRAD.itemClassTxt;
        
        nlapiLogExecution('debug', stLogTitle, "objRAD:" + JSON.stringify(objRAD));
        nlapiLogExecution('debug', stLogTitle, "objRAD.itemClass:" + objRAD.itemClass);
        
        objRebate[FLD_SL_RA] = stRALink;
        objRebate[FLD_SL_PRIORITY] = objRAD.agreementPriority;
        objRebate[FLD_SL_STACKABLE] = objRAD.stackable;
        objRebate[FLD_SL_REBATE_COMPONENT] = objRAD.itemText.substring(objRAD.itemText.lastIndexOf(':')+1);
        objRebate[FLD_SL_REBATE_DATA] = parseJsonToString(objData);
        objRebate['custpage_nsts_rm_sbl_accrual'] = objRebateAmount.accrual;
        if (stRebateType == HC_REBATE_TYPE.Vendor_Rebate_on_Sale) objRebate[FLD_SL_PASS_THROUGH_AMOUNT] = objRebateAmount.passThroughAmount;
        
        var flAmount = objRebateAmount.rebateAmt;
//        if (!isNaN(flAmount)) {
//            flAmount.toFixed(2);
//        }
        objRebate[FLD_SL_AMOUNT] = flAmount;
        
        var flTotalAmount = objRebateAmount.totalRebateAmt;
//        if (!isNaN(flTotalAmount)) {
//            flTotalAmount.toFixed(2);
//        }
        objRebate[FLD_SL_TOTAL_AMOUNT] = flTotalAmount;
        
        //arrRebates.push(objRebate);
        
        if(arrExistingRADPlaceHolding.indexOf(objRAD.internalId) < 0){
            stRebatesJson += objRAD;
            arrExistingRADPlaceHolding.push(objRAD.internalId);
            arrRebates.push(objRebate);
        }
        
    }
    
    objRebateSublist.setLineItemValues(arrRebates);
    nlapiLogExecution('debug', stLogTitle, stLog);
    
    nlapiSetFieldValue(FLD_SL_COST_BASIS, parseJsonToString(objCostBasis));
    
    return stRebatesJson;
}

/*
 * Returns the index of the RAD in the curent list of rebates to be shown. Returns -1 if it is not yet in the list
 */
function searchInRebatesList(arrRebates, stRAD,stItem) {
    if (!isEmpty(arrRebates)) {
        for (var intCtr in arrRebates) {
            var objRebate = arrRebates[intCtr];
            if (objRebate[FLD_SL_RAD] == stRAD && objRebate[FLD_SL_ITEM] == stItem) {
                return intCtr;
            }
        }
    }

    return -1;
}