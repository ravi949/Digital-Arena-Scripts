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
 * This script creates Rebate Agreement Detail records via selected values
 * in Process Eligibility Suitelet.
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Mar 2015     Roxanne Audette   Initial version.
 * 
 */

/*
 * ====================================================================
 * SCHEDULED SCRIPT FUNCTION
 * ====================================================================
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */
var HC_REC_CREATED = 0,
    HC_REC_FAILED = 0,
    HC_REC_WITH_ERROR = [];

var HC_EXC_CREATED = 0,
    HC_EXC_UPDATED = 0,
    HC_EXC_FAILED = 0,
    HC_EXC_WITH_ERROR = [];

function createRebateDetail_Scheduled(type) {
        var context = nlapiGetContext();
        var idRebateAgreement = context.getSetting(HC_CONTEXT.Script,
                SPARAM_REBATE_AGREEMENT);
        var recAgreement = (!isEmpty(idRebateAgreement)) ? nlapiLoadRecord(REC_REBATE_AGREEMENT, idRebateAgreement) 
                : null;
        var objIsEntGroup = JSON.parse(context.getSetting(HC_CONTEXT.Script, 'custscript_nsts_rm_is_entity_group'));
        var stAgreementUrl = (!isEmpty(idRebateAgreement)) ? 
                    nlapiResolveURL('RECORD', REC_REBATE_AGREEMENT, idRebateAgreement) : '';
                    
        try{
            var arrCustomer = JSON.parse(context.getSetting(HC_CONTEXT.Script,
                    SPARAM_CUSTOMER_IDS)).arrSchedParam;
            var arrVendor = JSON.parse(context.getSetting(HC_CONTEXT.Script,
                    SPARAM_VENDOR_IDS)).arrSchedParam;
            var arrItem = JSON.parse(context.getSetting(HC_CONTEXT.Script, SPARAM_ITEM_IDS)).arrSchedParam;
            var arrItemClass = context.getSetting(HC_CONTEXT.Script, 'custscript_nsts_rm_item_class'); 
                arrItemClass = (!isEmpty(arrItemClass)) ? String(arrItemClass).split(',') : []; 
            var arrCustClass = context.getSetting(HC_CONTEXT.Script, 'custscript_nsts_rm_customer_class');
                arrCustClass = (!isEmpty(arrCustClass)) ? String(arrCustClass).split(',') : [];
            var arrVendClass = context.getSetting(HC_CONTEXT.Script, 'custscript_nsts_rm_vendor_class');
                arrVendClass = (!isEmpty(arrVendClass)) ? String(arrVendClass).split(',') : [];
            var lstCostBasis = context.getSetting(HC_CONTEXT.Script, SPARAM_COST_BASIS);
            var flPercent = context.getSetting(HC_CONTEXT.Script, SPARAM_PERCENT);
            var flAmount = context.getSetting(HC_CONTEXT.Script, SPARAM_AMOUNT);
            var flRebateCost = context.getSetting(HC_CONTEXT.Script, SPARAM_REBATE_COST);
            var lstCalcMethod = context.getSetting(HC_CONTEXT.Script, SPARAM_CALC_METHOD);
            var lstUOM = context.getSetting(HC_CONTEXT.Script, SPARAM_UOM);
            var lstRebateType = context.getSetting(HC_CONTEXT.Script, SPARAM_REBATE_TYPE);
            var bIncludeAll = context.getSetting(HC_CONTEXT.Script, SPARAM_INCLUDE_ALL);
            var flPassThroughPerc = forceParseFloat(context.getSetting(HC_CONTEXT.Script, SPARAM_PASS_THROUGH_PERC));
            var flPassThroughVal = forceParseFloat(context.getSetting(HC_CONTEXT.Script, SPARAM_PASS_THROUGH_VAL));
            
            var arrCombination = (arrCustomer.length > arrVendor.length) ? arrCustomer
                    : arrVendor;
            var intTotalCombinations = arrItem.length * arrCombination.length;
            
            //LOG NUMBER OF RECORDS RETRIEVED AND WILL BE CREATED
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Agreement Details', 
                    'NO. OF RECORDS TO BE CREATED: ' + intTotalCombinations);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Agreement Details', 
                    'NO. OF ENTITIES: ' + arrCombination.length);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Agreement Details', 
                    'NO. OF ITEMS: ' + arrItem.length);
            
            //CHECK 'PROCESS ELIGIBILITY IN PROCESS' TO LOCK RECORD WHEN EXECUTION STARTS
            nlapiSubmitField(REC_REBATE_AGREEMENT, idRebateAgreement, [FLD_CUSTRECORD_ELIG_IN_PROC, FLD_CUSTRECORD_INCLUDE_ALL], ['T', bIncludeAll]);
            
            var arrExclusionId = {}, arrExcClassId = [], arrExcEnt = {};
            var arrExcClass = [];
            var arrORFilter = [];
            var arrCustExcClass = arrCustClass;//JSON.parse(context.getSetting(HC_CONTEXT.Script, SPARAM_CUSTOMER_IDS)).arrClass;
            var arrVendExcClass = arrVendClass;//JSON.parse(context.getSetting(HC_CONTEXT.Script, SPARAM_VENDOR_IDS)).arrClass;
            var arrItemExcClass = arrItemClass;//JSON.parse(context.getSetting(HC_CONTEXT.Script, SPARAM_ITEM_IDS)).arrClass;
            
            if(!isEmpty(arrCustExcClass)) arrExcClass.push(arrCustExcClass);
            if(!isEmpty(arrVendExcClass)) arrExcClass.push(arrVendExcClass);
            if(!isEmpty(arrItemExcClass)) arrExcClass.push(arrItemExcClass);
            
            if(!isEmpty(arrExcClass)){
                var arrExcFilter = [[FLD_EXC_AGREEMENT, 'is', idRebateAgreement]];
                
//                if(!isEmpty(arrExcClass))
//                    arrExcFilter.push('AND');
                
//                if(arrExcFilter[arrExcFilter.length - 1] != 'AND')
//                    arrExcFilter.push('OR');
                
                if(!isEmpty(arrItemExcClass))
                    arrORFilter.push([FLD_EXC_ITEM_CLASS, 'anyof', arrItemExcClass]);
                
                if(arrORFilter[arrORFilter.length - 1] != 'OR' && arrORFilter[arrORFilter.length - 1] != 'AND')
                    arrORFilter.push('OR');
                
                if(!isEmpty(arrCustExcClass))
                    arrORFilter.push([FLD_EXC_CUST_CLASS, 'anyof', arrCustExcClass]);
                
                if(arrORFilter[arrORFilter.length - 1] != 'OR' && arrORFilter[arrORFilter.length - 1] != 'AND')
                    arrORFilter.push('OR');
                
                if(!isEmpty(arrVendExcClass))
                    arrORFilter.push([FLD_EXC_VEND_CLASS, 'anyof', arrVendExcClass]);
                
                if(arrORFilter[0] == 'OR' || arrORFilter[0] == 'AND')
                    arrORFilter.splice(0, 1);
                
                if(arrORFilter[arrORFilter.length - 1] == 'OR' || arrORFilter[arrORFilter.length - 1] == 'AND')
                    arrORFilter.splice((arrORFilter.length - 1), 1);
                
                if(!isEmpty(arrORFilter))
                    arrExcFilter.push('AND', arrORFilter);
                
                //nlapiLogExecution('DEBUG', 'arrExcFilter', arrExcFilter.toString());
                
                var arrExcColumn = [new nlobjSearchColumn(FLD_EXC_ITEM_CLASS),
                                    new nlobjSearchColumn(FLD_EXC_CUST_CLASS),
                                    new nlobjSearchColumn(FLD_EXC_VEND_CLASS),
                                    new nlobjSearchColumn(FLD_EXC_ITEM),
                                    new nlobjSearchColumn(FLD_EXC_CUSTOMER),
                                    new nlobjSearchColumn(FLD_EXC_VENDOR)];
                
                var objExclusionSearch = getAllResults(REC_EXCLUSION, null, arrExcFilter, arrExcColumn);
                
                if (!isEmpty(objExclusionSearch)) {
                    var objExcResults = objExclusionSearch.results;
                    
                    for (var e = 0; e < objExcResults.length; e++) {
                        if(!isEmpty(objExcResults[e].getValue(FLD_EXC_ITEM_CLASS))){
                            arrExcClassId.push(objExcResults[e].getValue(FLD_EXC_ITEM_CLASS));
                            arrExclusionId[objExcResults[e].getValue(FLD_EXC_ITEM_CLASS)] = objExcResults[e].getId();
                            arrExcEnt[objExcResults[e].getValue(FLD_EXC_ITEM_CLASS)] = objExcResults[e].getValue(FLD_EXC_ITEM);
                        }else if(!isEmpty(objExcResults[e].getValue(FLD_EXC_CUST_CLASS))){
                            arrExcClassId.push(objExcResults[e].getValue(FLD_EXC_CUST_CLASS));
                            arrExclusionId[objExcResults[e].getValue(FLD_EXC_CUST_CLASS)] = objExcResults[e].getId();
                            arrExcEnt[objExcResults[e].getValue(FLD_EXC_CUST_CLASS)] = objExcResults[e].getValue(FLD_EXC_CUSTOMER);
                        }else if(!isEmpty(objExcResults[e].getValue(FLD_EXC_VEND_CLASS))){
                            arrExcClassId.push(objExcResults[e].getValue(FLD_EXC_VEND_CLASS));
                            arrExclusionId[objExcResults[e].getValue(FLD_EXC_VEND_CLASS)] = objExcResults[e].getId();
                            arrExcEnt[objExcResults[e].getValue(FLD_EXC_VEND_CLASS)] = objExcResults[e].getValue(FLD_EXC_VENDOR);
                        }
                    }
                }
            }
            //nlapiLogExecution('DEBUG', 'arrEntSpecific', JSON.stringify(objIsEntGroup) +':'+arrExcFilter.toString());
            if(objIsEntGroup.item != 'T' && objIsEntGroup.customer != 'T' && objIsEntGroup.vendor != 'T'){
                //CREATE REBATE AGREEMENT DETAILS IF ENTITY SPECIFIC
                for (var lineItem = 0; lineItem < arrItem.length; lineItem++) {
                    var idItem = arrItem[lineItem];
                    if (arrCombination.length <= 0 && bIncludeAll == 'T') createRebateDetail(context, idRebateAgreement, idItem, 0, 0, lstCostBasis, flPercent,
                            flAmount, flRebateCost, lstCalcMethod, lstUOM, lstRebateType, bIncludeAll, null, null, null, null, flPassThroughPerc, flPassThroughVal);
                    for (var i = 0; i < arrCombination.length; i++) {
                        (arrCustomer.length > arrVendor.length) ? createRebateDetail(context, 
                                idRebateAgreement, idItem, arrCombination[i], 0, lstCostBasis, flPercent,
                                flAmount, flRebateCost, lstCalcMethod, lstUOM, lstRebateType, bIncludeAll, null, null, null, null, flPassThroughPerc, flPassThroughVal) : createRebateDetail(context, 
                                        idRebateAgreement, idItem, 0, arrCombination[i], lstCostBasis, flPercent,
                                        flAmount, flRebateCost, lstCalcMethod, lstUOM, lstRebateType, bIncludeAll, null, null, null, null, flPassThroughPerc, flPassThroughVal);
                    }
                }
            }else{
                var arrEntSpecific = (objIsEntGroup.item == 'F' && !isEmpty(arrItem)) ? {record: 'item', array: arrItem} : 
                    (objIsEntGroup.customer == 'F' /*&& !isEmpty(arrCustomer)*/) ? {record: 'customer', array: (objIsEntGroup.incCust == 'T') ? [null] : arrCustomer} :
                        (objIsEntGroup.vendor == 'F' /*&& !isEmpty(arrVendor)*/) ? {record: 'vendor', array: (objIsEntGroup.incVend == 'T') ? [null] : arrVendor} : null;
                //nlapiLogExecution('DEBUG', 'arrEntSpecific', arrEntSpecific.record +':'+JSON.stringify(arrEntSpecific.array));
                if(!isEmpty(arrEntSpecific)){
                     //CREATE RAD IF ENTITY AND CLASSIFICATION SPECIFIC
                     for(var i = 0; i < (arrEntSpecific.array).length; i++){
                         var arrClass = []; 
                         var stClassType = null;
                         if(!isEmpty(arrItemClass) && objIsEntGroup.item == 'T'){
                             arrClass    = arrItemClass;
                             stClassType = 'item';
                          }
                      
                         if(!isEmpty(arrCustClass) && objIsEntGroup.customer == 'T'){
                             arrClass    = arrCustClass;
                             stClassType = 'customer';
                         }
                      
                         if(!isEmpty(arrVendClass) && objIsEntGroup.vendor == 'T'){
                             arrClass    = arrVendClass;
                             stClassType = 'vendor';
                         }
                         
                         createRADEntClass({
                              objContext: context,
                              arrClass  : arrClass,
                              agreement : idRebateAgreement,
                              EntType   : arrEntSpecific.record,
                              item      : (arrEntSpecific.record == 'item' && !isEmpty(arrEntSpecific.array[i])) ? arrEntSpecific.array[i] : null,
                              customer  : (arrEntSpecific.record == 'customer' && !isEmpty(arrEntSpecific.array[i])) ? arrEntSpecific.array[i] : null,
                              vendor    : (arrEntSpecific.record == 'vendor' && !isEmpty(arrEntSpecific.array[i])) ? arrEntSpecific.array[i] : null,
                              classType : stClassType,
                              costBasis : lstCostBasis,
                              percent   : flPercent,
                              amount    : flAmount,
                              rebateCost: flRebateCost,
                              calcMethod: lstCalcMethod,
                              uom       : lstUOM,
                              rebateType: lstRebateType,
                              exclusion : arrExclusionId,
                              passThroughPerc: flPassThroughPerc,
                              passThroughVal : flPassThroughVal
                         });
                     }
                 }else if(objIsEntGroup.item == 'T' && (objIsEntGroup.customer == 'T' || objIsEntGroup.vendor == 'T')){
                     //CREATE RAD IF CLASSIFICATION SPECIFIC
                     var arrCustVendClass = (!isEmpty(arrCustClass)) ? arrCustClass : arrVendClass;
                     //nlapiLogExecution('DEBUG', 'arrItemClass.length', arrItemClass.length +':'+arrCustVendClass.length);
                     for(var i = 0; i < arrItemClass.length; i++){
                         for(var c = 0; c < arrCustVendClass.length; c++){
                             createRebateDetail(context, idRebateAgreement, 0, 0, 0, lstCostBasis, flPercent,
                                 flAmount, flRebateCost, lstCalcMethod, lstUOM, lstRebateType, bIncludeAll,
                                 arrItemClass[i], arrCustVendClass[c], ((!isEmpty(arrCustClass)) ? 'customer' : 'vendor'),
                                 arrExclusionId, flPassThroughPerc, flPassThroughVal);
                         }
                     }
                 }
                 
                 //CHECK IF SELECTED LINE ITEMS FOR EXCLUSIONS ALREADY HAS EXISTING EXCLUSION RECORDS
                 var arrItemExclusion = (objIsEntGroup.item == 'T' && !isEmpty(arrItem)) ? arrItem : [];
                 var arrCustVendExclusion = (objIsEntGroup.customer == 'T' && !isEmpty(arrCustomer)) ? arrCustomer
                         : (objIsEntGroup.vendor == 'T' && !isEmpty(arrVendor)) ? arrVendor : [];
                 
                 var arrExclusion = arrItemExclusion.concat(arrCustVendExclusion);
                 
                 if(!isEmpty(arrExclusion)){
                     //CREATE/UPDATE EXCLUSION RECORDS
                     arrExclusion.sort(function(a, b) {
                         return parseFloat(a.c) - parseFloat(b.c);
                     });
                     
                     var arrEntities = [];
                     for(var i = 0; i < arrExclusion.length; i++){
                         try{
                             //Max Usage override for inner loop consideration
                             if (context.getRemainingUsage() <= 500) {
                                 //YIELDSCRIPT ONCE USAGE EXCEEDS
                                 var stateMain = nlapiYieldScript();
                                 yieldStateMessage(stateMain);
                             }
                             
                             var stNextVal = (i == (arrExclusion.length - 1)) ? null : arrExclusion[i + 1].c;
                             if(stNextVal != arrExclusion[i].c){
                                 arrEntities.push(arrExclusion[i].e);
                                 
                                 var stClassType = (arrExclusion[i].r == HC_ITEM) ? HC_EXEC_TYPE.Item : (arrExclusion[i].r == HC_CUSTOMER)
                                         ? HC_EXEC_TYPE.Customer : (arrExclusion[i].r == HC_VENDOR) ? HC_EXEC_TYPE.Vendor : '';
                                 var fldClass = (arrExclusion[i].r == HC_ITEM) ? FLD_EXC_ITEM_CLASS : (arrExclusion[i].r == HC_CUSTOMER)
                                         ? FLD_EXC_CUST_CLASS : (arrExclusion[i].r == HC_VENDOR) ? FLD_EXC_VEND_CLASS : '';
                                 var fldEntity = (arrExclusion[i].r == HC_ITEM) ? FLD_EXC_ITEM : (arrExclusion[i].r == HC_CUSTOMER)
                                         ? FLD_EXC_CUSTOMER : (arrExclusion[i].r == HC_VENDOR) ? FLD_EXC_VENDOR : '';
                                 
                                 if(arrExcClassId.indexOf(arrExclusion[i].c) <= -1){
                                     var rec = nlapiCreateRecord(REC_EXCLUSION);
                                     rec.setFieldValue(FLD_EXC_AGREEMENT, idRebateAgreement);
                                     rec.setFieldValue(FLD_EXC_TYPE, stClassType);
                                     rec.setFieldValue(fldClass, arrExclusion[i].c);
                                     rec.setFieldValue(fldEntity, arrEntities);
                                     
                                     var idExclusionRec = nlapiSubmitRecord(rec);
                                     if(!isEmpty(idExclusionRec)){
                                         HC_EXC_CREATED++;
                                         updateRADClass({
                                             objContext    : context,
                                             agreement     : idRebateAgreement,
                                             classType     : arrExclusion[i].r,
                                             classification: arrExclusion[i].c,
                                             exclusion     : idExclusionRec
                                         });
                                     }
                                 }else if(!isEmpty((arrExcEnt[arrExclusion[i].c]))){
                                     arrEntities.push((arrExcEnt[arrExclusion[i].c]).split(','));
                                     var recLoadExc = nlapiLoadRecord(REC_EXCLUSION, arrExclusionId[arrExclusion[i].c]);
                                     recLoadExc.setFieldValue(fldEntity, arrEntities);
                                     var idExclusionRec = nlapiSubmitRecord(recLoadExc);
                                     if(!isEmpty(idExclusionRec)) HC_EXC_UPDATED++;
                                 }
                                 arrEntities = [];
                                 
                             }else{
                                 arrEntities.push(arrExclusion[i].e);
                             }
                         }catch(e){
                             if (e.getDetails != undefined) {
                                 HC_EXC_FAILED++;
                                 HC_EXC_WITH_ERROR.push('<b>Exclusion Type:</b> ' + arrExclusion[i].r + '| <b>Classification id:</b> ' + arrExclusion[i].c);
                                 nlapiLogExecution('ERROR', 'Process Error', e.getCode() + ': ' + e.getDetails());
                             } 
                         }
                     }
                 }
            }
            
            
            //UNCHECK 'PROCESS ELIGIBILITY IN PROCESS' TO UNLOCK RECORD WHEN EXECUTION ENDS
            nlapiSubmitField(REC_REBATE_AGREEMENT, idRebateAgreement, [FLD_CUSTRECORD_ELIG_IN_PROC], ['F']);
            
            //SEND NOTIFICATION EMAIL TO USER
            try {
                if (!isEmpty(context.getEmail())) {
                    var stEmailBody = 'The process eligibility has been completed. ' + HC_REC_CREATED
                        + ' detail(s) and '+ HC_EXC_CREATED +' exclusion(s) were created.<br>Click here to view the transaction: https://system.na1.netsuite.com'
                        + stAgreementUrl;
                    if(!isEmpty(HC_REC_WITH_ERROR)){
                        stEmailBody += '<br><br>There are ' + HC_REC_FAILED +' detail combination(s) that were not created due to error:<br>'
                            + (HC_REC_WITH_ERROR.toString()).replace(/,/g,'<br>');
                    }
                    if(!isEmpty(HC_EXC_WITH_ERROR)){
                        stEmailBody += '<br><br>There are ' + HC_EXC_FAILED +' Exclusion(s) that were not created/updated due to error:<br>'
                            + (HC_EXC_WITH_ERROR.toString()).replace(/,/g,'<br>');
                    }
                    nlapiSendEmail(
                            context.getUser(),
                            context.getEmail(),
                            'Process Eligibility is Complete for ' + recAgreement.getFieldValue(FLD_NAME),
                            stEmailBody);
                }
            } catch (error) { 
                //Do nothing, most likely error encountered when getting email is invalid user or email address
            }
            
            //LOG NUMBER OF DETAILS THAT WERE CREATED AND FAILED
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Exclusions', 
                    'NO. OF RECORDS FAILED: ' + HC_EXC_FAILED);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Exclusions', 
                    'NO. OF RECORDS UPDATED: ' + HC_EXC_UPDATED);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Exclusions', 
                    'NO. OF RECORDS CREATED: ' + HC_EXC_CREATED);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Agreement Details', 
                    'NO. OF RECORDS FAILED: ' + HC_REC_FAILED);
            nlapiLogExecution('DEBUG', 'PROCESS ELIGIBILITY: Create Agreement Details', 
                    'NO. OF RECORDS CREATED: ' + HC_REC_CREATED);
        }catch(err){
            nlapiLogExecution('DEBUG', 'ERROR', err);
            if (!isEmpty(context.getEmail())){
                 nlapiSendEmail(
                    context.getUser(),
                    context.getEmail(),
                    'Process Eligibility has encountered a problem for ' + recAgreement.getFieldValue(FLD_NAME),
                    'The process eligibility has encountered a problem.<br>' + 'Click here to view the agreement: '  + stAgreementUrl);
            }     
        }    
}

/*
 * ====================================================================
 * REUSABLE FUNCTION
 * ====================================================================
 */
function createRADEntClass(option){
    var arrClass = option.arrClass;
   
    for(var i = 0; i < arrClass.length; i++){ 
        try{
            var rec = nlapiCreateRecord(REC_AGREEMENT_DETAIL);
            rec.setFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT, option.agreement);
            rec.setFieldValue(FLD_CUSTRECORD_DET_AGREEMENT_ID, option.agreement);
            
            if(option.EntType == 'item' && !isEmpty(option.item))
                rec.setFieldValue(FLD_CUSTRECORD_DET_ITEM, option.item);
            else if(option.EntType == 'customer' && !isEmpty(option.customer))
                rec.setFieldValue(FLD_CUSTRECORD_DET_CUST, option.customer);
            else if(option.EntType == 'vendor' && !isEmpty(option.vendor))
                rec.setFieldValue(FLD_CUSTRECORD_DET_VEND, option.vendor);
            
            if(option.classType == 'item'){
                rec.setFieldValue(FLD_CUSTRECORD_DET_EL_ITEM_CLASS, arrClass[i]);
                if(!isEmpty(option.exclusion[arrClass[i]])) rec.setFieldValue('custrecord_nsts_rm_ra_item_excl', option.exclusion[arrClass[i]]);
            }else if(option.classType == 'customer'){
                rec.setFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS, arrClass[i]);
                if(!isEmpty(option.exclusion[arrClass[i]])) rec.setFieldValue('custrecord_nsts_rm_ra_cust_excl', option.exclusion[arrClass[i]]);
            }else if(option.classType == 'vendor'){
                rec.setFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS, arrClass[i]);
                if(!isEmpty(option.exclusion[arrClass[i]])) rec.setFieldValue('custrecord_nsts_rm_ra_vend_excl', option.exclusion[arrClass[i]]);
            }
            
            rec.setFieldValue(FLD_CUSTRECORD_COST_BASIS, option.costBasis);
            rec.setFieldValue(FLD_CUSTRECORD_DET_PERCENT, forceParseFloat(option.percent));
            rec.setFieldValue(FLD_CUSTRECORD_DET_AMT, forceParseFloat(option.amount));
            rec.setFieldValue(FLD_CUSTRECORD_DET_REBATE_COST, forceParseFloat(option.rebateCost));
            rec.setFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD, option.calcMethod);
            rec.setFieldValue(FLD_CUSTRECORD_DET_UOM, option.uom);
            rec.setFieldValue(FLD_CUSTRECORD_DET_REB_TYPE, option.rebateType);
            if(option.passThroughPerc > 0) rec.setFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_PERC, option.passThroughPerc);
            if(option.passThroughVal > 0) rec.setFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_VAL, option.passThroughVal);
            
            var intEligItemEntClass = (!isEmpty(option.item)) ? checkEmptyValue(option.item) : checkEmptyValue(arrClass[i]);
            
            var intEntity = (!isEmpty(option.customer)) ? checkEmptyValue(option.customer) :
                    (!isEmpty(option.vendor)) ? checkEmptyValue(option.vendor) : checkEmptyValue(arrClass[i]);
            
            var stConcatCombination = checkEmptyValue(option.agreement) + '_'
                                      + intEligItemEntClass + '_'
                                      + intEntity + '_'
                                      + checkEmptyValue(option.uom);
            
            rec.setFieldValue(FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID, stConcatCombination);
            rec.setFieldValue(HC_EXTERNAL_ID, stConcatCombination);
            
            //nlapiLogExecution('DEBUG', 'stConcatCombination', stConcatCombination +':'+option.EntType + ':'+option.classType+':'+intEntity+':'+arrClass[i]);
            
            var idAgrDetails = nlapiSubmitRecord(rec);
            if(!isEmpty(idAgrDetails)) HC_REC_CREATED++;
            
            if ((option.objContext).getRemainingUsage() <= HC_MAX_USAGE) {
                //YIELDSCRIPT ONCE USAGE EXCEEDS
                var stateMain = nlapiYieldScript();
                yieldStateMessage(stateMain);
            }
        }catch(error){
            if (error.getDetails != undefined) {
                var stItemMsg = (!isEmpty(option.item)) ? '<b>Item id:</b> ' +  option.item : (option.classType == 'item') ? '<b>Item Classification :</b> ' + arrClass[i] : null;
                var stCustMsg = (!isEmpty(option.customer)) ? '| <b>Customer id:</b> ' +  option.customer : (option.classType == 'customer') ? '| <b>Customer Classification :</b> ' + arrClass[i] : null;
                var stVendMsg = (!isEmpty(option.vendor)) ? '| <b>Vendor id:</b> ' +  option.vendor : (option.classType == 'vendor') ? '| <b>Vendor Classification :</b> ' + arrClass[i] : null;
                
                var stErrorMsg = (!isEmpty(stCustMsg)) ? stItemMsg.concat(stCustMsg) : stItemMsg.concat(stVendMsg);
                
                HC_REC_FAILED++;
                HC_REC_WITH_ERROR.push(stErrorMsg);
                nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': '
                                                            + error.getDetails());
            }
        }
    }
}

function createRebateDetail(context, idRebateAgreement, idItem, idCustomer, idVendor, lstCostBasis, flPercent,
        flAmount, flRebateCost, lstCalcMethod, lstUOM, lstRebateType, bIncludeAll, stItemClass, stCustVendClass, stClassType, arrExclusionId, flPassThroughPerc, flPassThroughVal) {
    try {
        var rec = nlapiCreateRecord(REC_AGREEMENT_DETAIL);
        rec.setFieldValue(FLD_CUSTRECORD_REBATE_AGREEMENT, idRebateAgreement);
        rec.setFieldValue(FLD_CUSTRECORD_DET_AGREEMENT_ID, idRebateAgreement);
        rec.setFieldValue(FLD_CUSTRECORD_COST_BASIS, lstCostBasis);
        rec.setFieldValue(FLD_CUSTRECORD_DET_PERCENT, forceParseFloat(flPercent));
        rec.setFieldValue(FLD_CUSTRECORD_DET_AMT, forceParseFloat(flAmount));
        rec.setFieldValue(FLD_CUSTRECORD_DET_REBATE_COST, forceParseFloat(flRebateCost));
        rec.setFieldValue(FLD_CUSTRECORD_DET_CALC_METHOD, lstCalcMethod);
        rec.setFieldValue(FLD_CUSTRECORD_DET_UOM, lstUOM);
        rec.setFieldValue(FLD_CUSTRECORD_DET_REB_TYPE, lstRebateType);
        if(flPassThroughPerc > 0) rec.setFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_PERC, flPassThroughPerc);
        if(flPassThroughVal > 0) rec.setFieldValue(FLD_CUSTRECORD_DET_PASS_THROUGH_VAL, flPassThroughVal);
        
        if (!isEmpty(idCustomer))
            rec.setFieldValue(FLD_CUSTRECORD_DET_CUST, idCustomer);
        if (!isEmpty(idVendor))
            rec.setFieldValue(FLD_CUSTRECORD_DET_VEND, idVendor);
        
        var intEntity = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
            : (!isEmpty(idVendor)) ? checkEmptyValue(idVendor) : checkEmptyValue(stCustVendClass);
        var intItem = (!isEmpty(idItem)) ? checkEmptyValue(idItem) : checkEmptyValue(stItemClass);
        var stItemFld = (!isEmpty(idItem)) ? FLD_CUSTRECORD_DET_ITEM : FLD_CUSTRECORD_DET_EL_ITEM_CLASS;
        

        rec.setFieldValue(stItemFld, intItem);
        
        if(stItemFld == FLD_CUSTRECORD_DET_EL_ITEM_CLASS && !isEmpty(arrExclusionId[intItem]))
            rec.setFieldValue('custrecord_nsts_rm_ra_item_excl', arrExclusionId[intItem]);
        
        if(!isEmpty(stCustVendClass)){
            if(stClassType == 'customer'){
                rec.setFieldValue(FLD_CUSTRECORD_DET_EL_CUST_CLASS, stCustVendClass);
                if(!isEmpty(arrExclusionId[stCustVendClass])) rec.setFieldValue('custrecord_nsts_rm_ra_cust_excl', arrExclusionId[stCustVendClass]);
            }else{
                rec.setFieldValue(FLD_CUSTRECORD_DET_EL_VEND_CLASS, stCustVendClass);
                if(!isEmpty(arrExclusionId[stCustVendClass])) rec.setFieldValue('custrecord_nsts_rm_ra_vend_excl', arrExclusionId[stCustVendClass]);
            }
        }
       
        var stConcatCombination = checkEmptyValue(idRebateAgreement) + '_'
                                  + intItem + '_'
                                  + intEntity + '_'
                                  + checkEmptyValue(lstUOM);
 
        rec.setFieldValue(FLD_CUSTRECORD_DET_CUSTOM_EXTERNAL_ID, stConcatCombination);
        rec.setFieldValue(HC_EXTERNAL_ID, stConcatCombination);
        
    
        var idAgrDetails = nlapiSubmitRecord(rec);
        if(!isEmpty(idAgrDetails)) HC_REC_CREATED++;
        
        if (context.getRemainingUsage() <= HC_MAX_USAGE) {
            // YIELDSCRIPT ONCE USAGE EXCEEDS
            var stateMain = nlapiYieldScript();
            yieldStateMessage(stateMain);
        }
      
    } catch (error) {
        if (error.getDetails != undefined) {
            var stEntityId = (!isEmpty(idCustomer)) ? checkEmptyValue(idCustomer)
                    : checkEmptyValue(idVendor);
            HC_REC_FAILED++;
            HC_REC_WITH_ERROR.push('<b>Item id:</b> ' + idItem + '| <b>Entity id:</b> ' + stEntityId);
            nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': '
                                                        + error.getDetails());
        } 
    }
}

function updateRADClass(option){
    var arrRADFilter = [[FLD_CUSTRECORD_REBATE_AGREEMENT, 'is', option.agreement]];
    var stExcToUpdate  = '';
    
    if(option.classType == HC_ITEM){
        arrRADFilter.push('AND', [FLD_CUSTRECORD_DET_EL_ITEM_CLASS, 'is', option.classification]);
        stExcToUpdate = FLD_CUSTRECORD_DET_ITEM_EXCL;
    }else if(option.classType == HC_CUSTOMER){
        arrRADFilter.push('AND', [FLD_CUSTRECORD_DET_EL_CUST_CLASS, 'is', option.classification]);
        stExcToUpdate = FLD_CUSTRECORD_DET_CUST_EXCL;
    }else if(option.classType == HC_VENDOR){
        arrRADFilter.push('AND', [FLD_CUSTRECORD_DET_EL_VEND_CLASS, 'is', option.classification]);
        stExcToUpdate = FLD_CUSTRECORD_DET_VEND_EXCL;
    }
        
    
    var objRADSearch = getAllResults(REC_AGREEMENT_DETAIL, null, arrRADFilter);
    
    if (!isEmpty(objRADSearch) && !isEmpty(stExcToUpdate)) {
        var objRADResults = objRADSearch.results;
        
        for (var i = 0; i < objRADResults.length; i++) {
            try{
                nlapiSubmitField(REC_AGREEMENT_DETAIL, objRADResults[i].getId(), [stExcToUpdate], [option.exclusion]);
                
//                if ((option.objContext).getRemainingUsage() <= HC_MAX_USAGE) {
//                    //YIELDSCRIPT ONCE USAGE EXCEEDS
//                    var stateMain = nlapiYieldScript();
//                    yieldStateMessage(stateMain);
//                }
            }catch(error){
                if (error.getDetails != undefined) {
                    nlapiLogExecution('ERROR', 'updateRADClass', '[Agreement Detail ID: ' + objRADResults[i].getId() + '] ' + error.getCode() + ': '
                        + error.getDetails());
                }
            }
        }
    }
}