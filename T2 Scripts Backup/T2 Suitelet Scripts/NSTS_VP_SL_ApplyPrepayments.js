/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * Suitelet that shows all prepayments that can applied to a bill. This
 * script also include the menu suitelet that lists down the bills that
 * has prepayments associated in them.
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 May 2016     Roxanne Audette   Initial version.
 * 
 */

/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 */

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/url', 'N/redirect', 'N/runtime', '../Library/NSTS_VP_Lib_ObjectsAndFunctions.js', '../Library/NSTS_VP_Lib_Constants.js'], 
    function (ui, search, record, url, redirect, runtime, lib){
        function onRequest(context){
            var request = context.request;
            var objForm;
            var arRequestParam = {
                    loadType: (!lib.isEmpty(request.parameters.loadtype)) ? request.parameters.loadtype : request.parameters.custpage_nsts_vp_loadtype,
                    bill: request.parameters.idBill,
                    billVendor: request.parameters.idBillVendor,
                    billCriteria: request.parameters.custpage_nsts_vp_bill,
                    billFld: request.parameters.custpage_nsts_vp_po_bill,
                    billVendorFld: request.parameters.custpage_nsts_vp_bill_vendor,
                    vendor: request.parameters.custpage_nsts_vp_vendor
            }
            
           
            switch(arRequestParam.loadType){
                case 'search':
                    objForm = createApplyPrepaymentForm(arRequestParam);
                    break;
                case 'apply':
                    createUpdateVPApplication(request, arRequestParam);
                    break;
                default:
                    objForm = createPOBillsForm();
                    break;
            }
            if(!lib.isEmpty(objForm))
                context.response.writePage(objForm);
        }
        
        /**
         * @description Apply Prepayment form
         */
        function createApplyPrepaymentForm(arRequestParam){
            var form = ui.createForm({title: 'Apply Prepayments'});
            form.clientScriptFileId = lib.clientScriptId();
            
            form.addSubmitButton({
                id : FLD_CUSTPAGE_NSTS_VP_SUBMIT,
                label : 'Submit'
            });
            
            var fldLoadType = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_LOADTYPE,
                label : 'Load Type',
                type : ui.FieldType.TEXT
             });
            if(lib.isEmpty(arRequestParam.loadType)) fldLoadType.defaultValue = 'search'; else fldLoadType.defaultValue = arRequestParam.loadType;
            fldLoadType.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var fldPOBill = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_PO_BILL,
                label : 'PO Bill',
                type : ui.FieldType.TEXT
             });
            if(!lib.isEmpty(arRequestParam.bill)) fldPOBill.defaultValue = arRequestParam.bill; else fldPOBill.defaultValue = arRequestParam.billFld;
            fldPOBill.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var fldBillVendor = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_BILL_VENDOR,
                label : 'Bill Vendor',
                type : ui.FieldType.TEXT
             });
            if(!lib.isEmpty(arRequestParam.bill)) fldBillVendor.defaultValue = arRequestParam.billVendor; else fldBillVendor.defaultValue = arRequestParam.billVendorFld;
            fldBillVendor.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var fldBillDate = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_BILL_DATE,
                label : 'Bill Date',
                type : ui.FieldType.DATE
             });
            fldBillDate.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var fldBillStatus = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_BILL_STATUS,
                label : 'Bill Status',
                type : ui.FieldType.TEXT
             });
            fldBillStatus.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var sublist = form.addSublist({
                id : SBL_NSTS_VP_PREPAYMENT,
                type : ui.SublistType.LIST,
                label : 'Prepayments'
            });
            
            var fldBillHeader = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL_HEADER, type : ui.FieldType.CHECKBOX, label : 'Bill Header'});
            fldBillHeader.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldBillID = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL_ID, type : ui.FieldType.TEXT, label : 'Bill ID'});
            fldBillID.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldPrepaymentId = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_PREPAYMENT_ID, type : ui.FieldType.TEXT, label : 'Prepayment'});
            fldPrepaymentId.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldSblUnpaidAmtHidden = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_UNPAID_AMT_HIDDEN, type : ui.FieldType.CURRENCY, label : 'Unpaid Amount (Hidden)'});
            fldSblUnpaidAmtHidden.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldSblCreditAmtHidden = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AMT_HIDDEN, type : ui.FieldType.CURRENCY, label : 'Total Credit (Hidden)'});
            fldSblCreditAmtHidden.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldSblAvailableCreditHidden = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AVAIL_HIDDEN, type : ui.FieldType.CURRENCY, label : 'Available Credit to Apply (Hidden)'});
            fldSblAvailableCreditHidden.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldCreditId = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_ID, type : ui.FieldType.TEXT, label : 'Prepayment Credit ID'});
            fldCreditId.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldAppliedToBill = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_APPLIED_TO_BILL, type : ui.FieldType.CURRENCY, label : 'Applied to Bill'});
            fldAppliedToBill.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            var fldPurchaseOrderId = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_PO_ID, type : ui.FieldType.TEXT, label : 'Purchase Order Id'});
            fldPurchaseOrderId.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            var fldSblVendor = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_VENDOR, type : ui.FieldType.TEXT, label : 'Vendor', source : HC_TRANS_RECORDS.COMMON.RECORDS.VENDOR});
            var fldSblBill = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL, type : ui.FieldType.TEXT, label : 'Bill'});
            var fldSblUnpaidAmt = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_UNPAID_AMT, type : ui.FieldType.CURRENCY, label : 'Unpaid Amount'});
            var fldSblPaymentHold = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_PAYMENT_HOLD, type : ui.FieldType.CHECKBOX, label : 'Hold'});
            var fldSblRelatedPO = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_REL_PO, type : ui.FieldType.TEXT, label : 'Purchase Order', source : HC_TRANS_RECORDS.COMMON.RECORDS.PURCHASEORDER});
            var fldSblPrepaymentCredit = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT, type : ui.FieldType.TEXT, label : 'Prepayment Credit'});
            var fldSblCreditAmt = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_UNAPPLIED, type : ui.FieldType.CURRENCY, label : 'Total Credit Amount'});
            var fldSblAvailableCredit = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AVAIL, type : ui.FieldType.CURRENCY, label : 'Available Credit to Apply'});
            var fldSblReapplyP = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_P, type : ui.FieldType.PERCENT, label : 'Re-Apply (%)'});
            fldSblReapplyP.updateDisplayType({displayType : ui.FieldDisplayType.ENTRY});
            var fldSblReapplyC = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C, type : ui.FieldType.CURRENCY, label : 'Re-Apply ($)'});
            fldSblReapplyC.updateDisplayType({displayType : ui.FieldDisplayType.ENTRY});
            var fldSblReapplyCOld = sublist.addField({id : FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C_OLD, type : ui.FieldType.CURRENCY, label : 'Re-Apply ($) Old'});
            fldSblReapplyCOld.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
            
            //Set PO Bill Header
            var objFeature = new lib.feature();
            var stPOBill = (!lib.isEmpty(arRequestParam.bill)) ? arRequestParam.bill : arRequestParam.billFld;
            var i = 0;
            var stUnpaidAmt = (objFeature.bMultiCurrency) ? HC_FX_AMOUNT_REMAINING : HC_AMOUNT_REMAINING;
            var stAmount    = (objFeature.bMultiCurrency) ? HC_FX_AMOUNT : HC_AMOUNT;
            var objBillFld  = null;
            if(!lib.isEmpty(stPOBill)){
                var arBillFlds = [stUnpaidAmt, HC_PAYMENT_HOLD, HC_TRANSACTION_NUMBER, 
                                  HC_TRANDATE, 'vendor.entityid', HC_STATUS];
                
                if(objFeature.bMultiCurrency)
                    arBillFlds.push(HC_CURRENCY);
                if(objFeature.bOneWorld)
                    arBillFlds.push(HC_SUBSIDIARY);
                
                objBillFld = search.lookupFields({
                    type: search.Type.VENDOR_BILL,
                    id: stPOBill,
                    columns: arBillFlds
                });
                sublist.setSublistValue({
                    id : FLD_CUSTPAGE_NSTS_VP_SBL_UNPAID_AMT,
                    line : i,
                    value : !lib.isEmpty(objBillFld[stUnpaidAmt]) ? objBillFld[stUnpaidAmt] : 0.00
                });
                sublist.setSublistValue({
                    id : FLD_CUSTPAGE_NSTS_VP_SBL_PAYMENT_HOLD,
                    line : i,
                    value : (objBillFld[HC_PAYMENT_HOLD]) ? 'T' : 'F'
                });
                var stPOBillURL = url.resolveRecord({
                    recordType: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORBILL,
                    recordId: stPOBill,
                    isEditMode: false
                });
                sublist.setSublistValue({
                    id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL,
                    line : i,
                    value : '<a href="'+stPOBillURL+'">BILL #' + objBillFld[HC_TRANSACTION_NUMBER] + '</a>'
                });
                sublist.setSublistValue({
                    id : FLD_CUSTPAGE_NSTS_VP_SBL_VENDOR,
                    line : i,
                    value : '<b>' + objBillFld['vendor.entityid'] + '</b>'
                });
                
                /*Get Bill Date for Allow Non GL Validation*/
                fldBillDate.defaultValue = objBillFld[HC_TRANDATE];
                fldBillStatus.defaultValue = objBillFld[HC_STATUS][0].value;
            }
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL_ID,
                line : i,
                value : stPOBill
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL_HEADER,
                line : i,
                value : 'T'
            });
            i++;
            
            //Search Purchase Orders of PO Bill
            var arIsClosed = [], arVPPO = [], arOpenBill = [], arPOThisBill = [], arOrphanPOCredits = [], arOrphanPO = [], arOrphanBills = [],
                arExpensesOnly = [];
            
            var arVPPOFilters = [search.createFilter({name: 'formulatext', operator: 'isnot', formula: 'NVL({custbody_nsts_vp_prepay_vp}, 0)', values: 0}), 
                search.createFilter({name: HC_MAINLINE, operator: 'is', values: 'F'})];
            
            if(objFeature.bMultiCurrency)
                arVPPOFilters.push(search.createFilter({name: HC_CURRENCY, operator: 'anyof', values: objBillFld[HC_CURRENCY][0].value}));
            if(objFeature.bOneWorld)
                arVPPOFilters.push(search.createFilter({name: HC_SUBSIDIARY, operator: 'anyof', values: objBillFld[HC_SUBSIDIARY][0].value}));
            
            var stBillVendor = (!lib.isEmpty(arRequestParam.billVendor)) ? arRequestParam.billVendor : arRequestParam.billVendorFld;
            if(!lib.isEmpty(stBillVendor))
                arVPPOFilters.push(search.createFilter({name: HC_INTERNAL_ID, join: HC_TRANS_RECORDS.COMMON.RECORDS.VENDOR, operator: 'anyof', values: [stBillVendor]}));
                       
            var objVPPOSearch = search.create({
                type: HC_TRANS_RECORDS.COMMON.RECORDS.PURCHASEORDER,
                columns: [HC_INTERNAL_ID, HC_STATUS, HC_CLOSED,
                          search.createColumn({name: HC_INTERNAL_ID, join: HC_APPLYING_TRANS}),
                          search.createColumn({name: HC_TYPE, join: HC_APPLYING_TRANS}),
                          search.createColumn({name: HC_STATUS, join: HC_APPLYING_TRANS}),
                          search.createColumn({name: HC_TYPE, join: REC_ITEM})],
                filters: arVPPOFilters
             }).run().each(function(result){
                 //Bill Fields
                 var idBill = result.getValue({name: HC_INTERNAL_ID, join: HC_APPLYING_TRANS});
                 var stBillStatus = result.getValue({name: HC_STATUS, join: HC_APPLYING_TRANS});
                 var stRecordType = result.getValue({name: HC_TYPE, join: HC_APPLYING_TRANS}).toLowerCase();
                 var stItemType = result.getValue({name: HC_TYPE, join: REC_ITEM});
                 
                 //PO Fields
                 var stPOStatus = result.getValue(HC_STATUS);
                 var idPurchaseOrder = result.getValue(HC_INTERNAL_ID);
                 
                 if(!lib.isEmpty(idBill) && stRecordType == 'vendbill'){
                     if(stPOBill == idBill){
                         if(stPOStatus != 'closed' && stPOStatus != 'rejected'){
                             arPOThisBill.push(idPurchaseOrder);
                             if(arVPPO.indexOf(idPurchaseOrder) == -1)
                                 arVPPO.push(idPurchaseOrder);
                         }
                     }else{
                         if((stPOStatus == 'closed' || stPOStatus == 'rejected') && arVPPO.indexOf(idPurchaseOrder) == -1){
                             arVPPO.push(idPurchaseOrder);
                             arOrphanPOCredits.push(idPurchaseOrder);
                         }else{
                             if(arVPPO.indexOf(idPurchaseOrder) == -1){
                                 arVPPO.push(idPurchaseOrder);
                                 arOrphanPOCredits.push(idPurchaseOrder);
                             }
                             
                             var intOrphanPOCreditIndex = arOrphanPOCredits.indexOf(idPurchaseOrder);
                             if(arPOThisBill.indexOf(idPurchaseOrder) != -1 && intOrphanPOCreditIndex > -1)
                                 arOrphanPOCredits.splice(intOrphanPOCreditIndex, 1);
                                 
                                 arOrphanPO.push({
                                     purchaseOrder: idPurchaseOrder,
                                     poBill       : idBill,
                                     poStatus     : stPOStatus
                                 });
                                 arOrphanBills.push(idBill);
                         }
                     }
                 }else if((stPOStatus == 'closed' || stPOStatus == 'rejected') && arVPPO.indexOf(idPurchaseOrder) == -1){
                     arVPPO.push(idPurchaseOrder);
                     arOrphanPOCredits.push(idPurchaseOrder);
                 }
                 
                 if(stPOStatus == 'fullyBilled' && arExpensesOnly.indexOf(idPurchaseOrder) == -1 && lib.isEmpty(stItemType)){
                     arIsClosed[idPurchaseOrder] = (!lib.isEmpty(arIsClosed[idPurchaseOrder])) ?
                        arIsClosed[idPurchaseOrder] +','+ result.getValue(HC_CLOSED) : result.getValue(HC_CLOSED);
                     arOrphanPO.push({
                       purchaseOrder: idPurchaseOrder,
                       poBill       : idBill,
                       poStatus     : stPOStatus
                     });
                     arExpensesOnly.push(idPurchaseOrder);
                     if(arOrphanPOCredits.indexOf(idPurchaseOrder) == -1)
                         arOrphanPOCredits.push(idPurchaseOrder);
                 }
                 return true;
             });
            
            log.debug('arVPPO', arVPPO);
            
            var arIsBillOrphaned = [];
            if(!lib.isEmpty(arOrphanBills)){
                var objBillSearch =  search.create({
                type: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORBILL,
                columns: [search.createColumn({name: HC_INTERNAL_ID, summary: search.Summary.GROUP}),
                          search.createColumn({name: stAmount, summary: search.Summary.SUM}),
                          search.createColumn({name: stAmount, join: HC_APPLIED_TO_TRANS, summary: search.Summary.SUM})],
                filters: [[HC_INTERNAL_ID, 'anyof', arOrphanBills], 'and',
                          [HC_MAINLINE, 'is', 'F'], 'and',
                          [HC_STATUS, 'noneof', ['VendBill:A', 'VendBill:D']]] //bill is closed
                 }).run().each(function(result){
                     var idBillTran = result.getValue({name: HC_INTERNAL_ID, summary: search.Summary.GROUP});
                     var flBillAmount = lib.forceParseFloat(result.getValue({name: stAmount, summary: search.Summary.SUM}));
                     var flTotalPOAmount = lib.forceParseFloat(result.getValue({name: stAmount, join: HC_APPLIED_TO_TRANS, summary: search.Summary.SUM}));
                     arIsBillOrphaned.push({bill   : idBillTran,
                                            billAmount : Math.abs(flBillAmount),
                                            poTotal: flTotalPOAmount
                                           });
                     return true;
                 });
            }
            
            /**
             * @description Includes Purchase Orders with orphaned credits
             */
            for(var or = 0; or < arOrphanPO.length; or++){
                var orIndex = arIsBillOrphaned.map(function(e) { return e.bill }).indexOf(arOrphanPO[or].poBill);
                var stOrphanPOStatus = arOrphanPO[or].poStatus;
                var stClosedExp = (lib.isEmpty(String(arIsClosed[arOrphanPO[or].purchaseOrder]))) ? [] : String(arIsClosed[arOrphanPO[or].purchaseOrder]).split(',');

                if(arPOThisBill.indexOf(arOrphanPO[or].purchaseOrder) == -1){
                        if(orIndex != -1){
                        var flSumOfPOAmount = arIsBillOrphaned[orIndex].poTotal;
                        var flPOBillAmount = arIsBillOrphaned[orIndex].billAmount;
                        
                        if(flPOBillAmount < flSumOfPOAmount){
                            if(arVPPO.indexOf(arOrphanPO[or].purchaseOrder) > -1){
                                arVPPO.splice(arVPPO.indexOf(arOrphanPO[or].purchaseOrder), 1);
                                arOrphanPOCredits.splice(arOrphanPOCredits.indexOf(arOrphanPO[or].purchaseOrder), 1);
                            }
                        }
                    }else if(arExpensesOnly.indexOf(arOrphanPO[or].purchaseOrder) == -1){
                        if(arVPPO.indexOf(arOrphanPO[or].purchaseOrder) > -1 && arOrphanPO[or].poStatus != 'closed'){
                            arVPPO.splice(arVPPO.indexOf(arOrphanPO[or].purchaseOrder), 1);
                            arOrphanPOCredits.splice(arOrphanPOCredits.indexOf(arOrphanPO[or].purchaseOrder), 1);
                        }
                    }else{
                        if(!lib.isEmpty(String(arIsClosed[arOrphanPO[or].purchaseOrder]))){
                            if(stClosedExp.indexOf('false') == -1){
                                arVPPO.push(arOrphanPO[or].purchaseOrder);
                                arOrphanPOCredits.push(arOrphanPO[or].purchaseOrder);
                            }else if(arVPPO.indexOf(arOrphanPO[or].purchaseOrder) > -1){
                                arVPPO.splice(arVPPO.indexOf(arOrphanPO[or].purchaseOrder), 1);
                                arOrphanPOCredits.splice(arOrphanPOCredits.indexOf(arOrphanPO[or].purchaseOrder), 1);
                            }
                        }
                    }
                }else if(arOrphanPOCredits.indexOf(arOrphanPO[or].purchaseOrder) > -1 && ((arExpensesOnly.indexOf(arOrphanPO[or].purchaseOrder) == -1) 
                                || (arExpensesOnly.indexOf(arOrphanPO[or].purchaseOrder) != -1 && stClosedExp.indexOf('false') != -1))){
                        arOrphanPOCredits.splice(arOrphanPOCredits.indexOf(arOrphanPO[or].purchaseOrder), 1);
                }
            }
            
            log.debug('arVPPO3', arVPPO + '|' + arOrphanPOCredits);
            
            //Search Vendor Prepayment Requests/Credits
            var arPrepayments = [];
            var arCredits = [];
            var arCreditAmt = [];
            var arOrphanVal = [];
            var arReApply = [];
            var flUnpaidAmount = !lib.isEmpty(objBillFld) ? lib.forceParseFloat(objBillFld[stUnpaidAmt]) : 0.00;
            var arFilters = [['custrecord_nsts_vp_po.mainline', 'is', 'T'], 'and',
                             ['custrecord_nsts_vp_prepay_bill.mainline', 'is', 'T'], 'and',
                             ['custrecord_nsts_vp_prepay_credit.mainline', 'is', 'T'], 'and',
                             [(objFeature.bMultiCurrency) ? 'custrecord_nsts_vp_prepay_credit.fxamountremaining' : 'custrecord_nsts_vp_prepay_credit.amountremaining', 'greaterthan', 0]];
            if(!lib.isEmpty(arVPPO))
                arFilters.push('and', [HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO, 'anyof', arVPPO]);
            
            var objPrepaymentSearch = search.create({
                type: HC_VP_RECORDS.VP.ID,
                columns: [HC_INTERNAL_ID,
                          search.createColumn({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO}),
                          search.createColumn({name: HC_TRANID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO}),
                          search.createColumn({name: HC_TRANSACTION_NUMBER, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_BILL}),
                          search.createColumn({name: HC_TRANID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT}),
                          search.createColumn({name: stUnpaidAmt, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT}),
                          search.createColumn({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT, sort: search.Sort.ASC})],
                filters: arFilters
             }).run().each(function(result){
                 var idPrepayment = result.getValue(HC_INTERNAL_ID);
                 var stBill = result.getValue({name: HC_TRANSACTION_NUMBER, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_BILL});
                 var stPO = result.getValue({name: HC_TRANID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO});
                 var idPO = result.getValue({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO});
                 var stCredit = result.getValue({name: HC_TRANID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT});
                 var idCredit = result.getValue({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT});
                 var flCreditAmount = lib.forceParseFloat(result.getValue({name: stUnpaidAmt, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT})).toFixed(2);
                     flCreditAmount = !lib.isEmpty(flCreditAmount) ? flCreditAmount : 0.00;
                     
                 if(arOrphanPOCredits.indexOf(idPO) == -1){
                     arPrepayments[i] = idPrepayment;
                     arCredits[i] = idCredit;
                     arCreditAmt[idCredit] = flCreditAmount;
                     
                     //Default Value for Re-apply($)
                     arReApply[i] = {
                             bIsOrphan : false,
                             availCred : flCreditAmount,
                             unpaidAmt : flUnpaidAmount,
                             poBill    : stPOBill,
                             prepay    : idPrepayment,
                             credit    : idCredit,
                             purchOrd  : stPO,
                             purchOrdId: idPO,
                             creditName: stCredit,
                             credAmt   : flCreditAmount,
                             reApply   : flCreditAmount,
                             index     : i
                     }
                     
                     //setSublistValues(sublist, i, flUnpaidAmount, stPOBill, idPrepayment, 
                             //idCredit, stPO, stCredit, flCreditAmount, idPO);
                     
                     i++;
                 }else{
                     arOrphanVal.push({
                         unpaidAmount : !lib.isEmpty(objBillFld) ? lib.forceParseFloat(objBillFld[stUnpaidAmt]) : 0.00,
                         poBill       : stPOBill,
                         prepayment   : idPrepayment,
                         creditid     : idCredit,
                         creditName   : stCredit,
                         purchaseOrder: stPO,
                         creditAmount : flCreditAmount,
                         purchaseOrderId : idPO
                     });
                 }
                 
                 return true;
             });
             
             //Set Orphans in Sublist
             if(!lib.isEmpty(arOrphanVal)){
                 var intCurrIndex = i;
                 intCurrIndex += 1;
                 for(var c = 0; c < arOrphanVal.length; c++){
                     arPrepayments[intCurrIndex] = arOrphanVal[c].prepayment;
                     arCredits[intCurrIndex] = arOrphanVal[c].creditid;
                     arCreditAmt[arOrphanVal[c].creditid] = arOrphanVal[c].creditAmount;
                     
                     //Default Value for Re-apply($)
                     arReApply[intCurrIndex] = {
                             bIsOrphan : true,
                             availCred : arOrphanVal[c].creditAmount,
                             unpaidAmt : arOrphanVal[c].unpaidAmount,
                             poBill    : arOrphanVal[c].poBill,
                             prepay    : arOrphanVal[c].prepayment,
                             credit    : arOrphanVal[c].creditid,
                             purchOrd  : arOrphanVal[c].purchaseOrder,
                             purchOrdId: arOrphanVal[c].purchaseOrderId,
                             creditName: arOrphanVal[c].creditName,
                             credAmt   : arOrphanVal[c].creditAmount,
                             reApply   : arOrphanVal[c].creditAmount,
                             index     : intCurrIndex
                     }
                     
                     //setSublistValues(sublist, intCurrIndex, arOrphanVal[c].unpaidAmount, arOrphanVal[c].poBill, arOrphanVal[c].prepayment, 
                             //arOrphanVal[c].creditid, arOrphanVal[c].purchaseOrder, ('*' + arOrphanVal[c].creditName), arOrphanVal[c].creditAmount, arOrphanVal[c].purchaseOrderId);
                     
                     intCurrIndex++;
                 }
             }
             i = 0;
             
             //Get Total Applied Amount of Applications
             if(!lib.isEmpty(arPrepayments)){
                 var objVPApplicationSearch = search.create({
                     type: HC_VP_RECORDS.VP_APPLICATION.ID,
                     columns: [search.createColumn({name: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_PREPAY, summary: search.Summary.GROUP}),
                               search.createColumn({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, summary: search.Summary.GROUP}),
                               //search.createColumn({name: stUnpaidAmt, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, summary: search.Summary.MAX}),
                               search.createColumn({name: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_AMT, summary: search.Summary.SUM})],
                     filters: [search.createFilter({name: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_PREPAY, operator: 'anyof', values: arPrepayments}),
                               search.createFilter({name: HC_MAINLINE, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, operator: 'is', values: 'T'})]
                               //search.createFilter({name: stUnpaidAmt, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, operator: 'isnotempty'})]
                  }).run().each(function(result){
                      var idPrepayCredit = result.getValue({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, summary: search.Summary.GROUP});
                      var intLine = arPrepayments.indexOf(result.getValue({name: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_PREPAY, summary: search.Summary.GROUP}));
                      var flUnappliedCredit = lib.forceParseFloat(arCreditAmt[idPrepayCredit]);//lib.forceParseFloat(result.getValue({name: stUnpaidAmt, join: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, summary: search.Summary.MAX}));
                      var flAppliedApplication = lib.forceParseFloat(result.getValue({name: HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_AMT, summary: search.Summary.SUM}));
                      var flAvailCredit = flUnappliedCredit - flAppliedApplication;
                          flAvailCredit = (flAvailCredit < 0) ? 0.00 : flAvailCredit;
                      
                      //Default Value for Re-apply($)
                      var objAppReApply = arReApply[intLine];
                          objAppReApply.reApply = flAvailCredit;
                          objAppReApply.availCred = flAvailCredit;
                          objAppReApply.index = intLine;
                      /*arReApply[intLine] = {
                              reApply  :  flAvailCredit,
                              index    :  intLine
                      }*/
                      
                      return true;
                  });
             }
             
             //Get Value of Applied Amounts
             var arVPWithApp = [];
             if(!lib.isEmpty(arCredits)){
                 var flRemainingReApply = flUnpaidAmount;
                 var flTotalApplied     = 0;
  
                 var objVPAppliedAmtSearch = search.create({
                     type: HC_VP_RECORDS.VP_APPLICATION.ID,
                     columns: [HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_AMT],
                     filters: [[HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, 'anyof', arCredits], 'and',
                               [HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_BILL, 'anyof', stPOBill]]
                  }).run().each(function(result){
                      var flAppCredit = lib.forceParseFloat(result.getValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_AMT)).toFixed(2);
                      var intIndex = arCredits.indexOf(result.getValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT));
                      
                      arVPWithApp.push(intIndex);
                      
                      //Default Value for Re-apply($)
                      var objVPAppReApply = arReApply[intIndex];
                          objVPAppReApply.reApply = flAppCredit;
                          objVPAppReApply.index = intIndex;
                      /*arReApply[intIndex] = {
                              reApply  :  flAppCredit,
                              index    :  intIndex
                      }*/
                      
                      return true;
                  });
             }
             
             //Set Default Values
             if(!lib.isEmpty(arReApply)){
                 var rIndex = 1, intDefaultCnt = 1;
                 var bWithOrphan = false;
                 arReApply.sort(function(x, y){return parseFloat(x.index) - parseFloat(y.index);});
                 for(var r = 0; r < arReApply.length; r++){
                     var objReApply = arReApply[r];
                     if(!lib.isEmpty(objReApply)){
                         var flReApplyDefault    = 0;
                         var flAppliedToBill     = 0;
                         var flAppAmount      = lib.forceParseFloat(objReApply.reApply);
                         
                         if(lib.isEmpty(arVPWithApp)){
                             flRemainingReApply -= lib.forceParseFloat(objReApply.reApply);
                             if(flRemainingReApply > 0){
                                 flReApplyDefault = flAppAmount;
                                 flTotalApplied += flAppAmount;
                             }else{
                                 flReApplyDefault = flUnpaidAmount - flTotalApplied;
                                 flUnpaidAmount   = 0;
                             }
                         }else{
                             flReApplyDefault = flAppAmount;
                         }
                         
                         if(lib.isEmpty(arVPWithApp)){
                             flReApplyDefault = !lib.isEmpty(flReApplyDefault) ? flReApplyDefault : 0;
                         }else{
                             if(arVPWithApp.indexOf(objReApply.index) != -1)
                                 flReApplyDefault = !lib.isEmpty(flReApplyDefault) ? flReApplyDefault : 0;
                             else
                                 flReApplyDefault = 0;
                             
                             flAppliedToBill = flReApplyDefault;
                         }
                         
                         flReApplyDefault =  (!lib.isEmpty(flReApplyDefault) && lib.forceParseFloat(flReApplyDefault) > -1) ? lib.forceParseFloat(flReApplyDefault.toFixed(2)) : 0;
                         
                         //Only display VP Credit if Available Credits to Apply is greater than 0 and Re-apply $ has no value
                         if(!lib.isEmpty(flReApplyDefault) || !lib.isEmpty(objReApply.availCred)){
                             //Set Reapply default value for the first 150 rows only if no applications are created yet
                             if(intDefaultCnt > 150 && lib.isEmpty(arVPWithApp)) flReApplyDefault = 0;
                             
                             if(objReApply.bIsOrphan && !bWithOrphan){
                                 sublist.setSublistValue({
                                     id : FLD_CUSTPAGE_NSTS_VP_SBL_VENDOR,
                                     line : rIndex,
                                     value : '<b>ORPHANED CREDITS</b>'
                                 });
                                 bWithOrphan = true;
                                 rIndex++;
                             }
                             setSublistValues(sublist, rIndex, objReApply.unpaidAmt, objReApply.poBill, objReApply.prepay, 
                                  objReApply.credit, objReApply.purchOrd, (objReApply.bIsOrphan) ? '*' + objReApply.creditName : objReApply.creditName, flReApplyDefault, 
                                          (lib.isEmpty(arVPWithApp)) ? 0 : flReApplyDefault, objReApply.availCred, objReApply.credAmt, objReApply.purchOrdId, flAppliedToBill);
                             intDefaultCnt++;
                             rIndex++;
                         }
                     }
                 }
             }
             
             
            return form;
        }
        
        /**
         * @description Sets values on the suitelet sublist
         */
        function setSublistValues(sublist, index, flUnpaidAmount, stPOBill, idPrepayment, 
                idCredit, stPO, stCredit, flReApplyDefault, flReApplyDefaultOld, flAvailCred, flCreditAmount, idPO, flAppliedToBill){
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_UNPAID_AMT_HIDDEN,
                line : index,
                value : flUnpaidAmount
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_BILL_ID,
                line : index,
                value : stPOBill
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_PREPAYMENT_ID,
                line : index,
                value : idPrepayment
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_ID,
                line : index,
                value : idCredit
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_PO_ID,
                line : index,
                value : idPO
            });
            var stPOURL = url.resolveRecord({
                recordType: HC_TRANS_RECORDS.COMMON.RECORDS.PURCHASEORDER,
                recordId: idPO,
                isEditMode: false
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_REL_PO,
                line : index,
                value : "<a href='"+stPOURL+"' target='_blank'>"+stPO+"</a>"
            });
            var stCreditURL = url.resolveRecord({
                recordType: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORCREDIT,
                recordId: idCredit,
                isEditMode: false
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT,
                line : index,
                value : "<a href='"+stCreditURL+"' target='_blank'>"+stCredit+"</a>"
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_UNAPPLIED,
                line : index,
                value : flCreditAmount
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AVAIL,
                line : index,
                value : flAvailCred
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AVAIL_HIDDEN,
                line : index,
                value : flAvailCred
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_AMT_HIDDEN,
                line : index,
                value : flCreditAmount
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C,
                line : index,
                value : lib.forceParseFloat(Math.round(flReApplyDefault * 100) / 100).toFixed(2) //lib.forceParseFloat(flReApplyDefault.toFixed(2))
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C_OLD,
                line : index,
                value : lib.forceParseFloat(Math.round(flReApplyDefaultOld * 100) / 100).toFixed(2) //lib.forceParseFloat(flReApplyDefaultOld.toFixed(2))
            });
            sublist.setSublistValue({
                id : FLD_CUSTPAGE_NSTS_VP_SBL_APPLIED_TO_BILL,
                line : index,
                value : flAppliedToBill
            });
        }
        
        /**
         * @description HTML table of bills that has Vendor Prepayments
         */
        function createPOBillsForm(){
            var form = ui.createForm({title: 'Apply Prepayments to Bills'});
            var objFeature = new lib.feature();
            var bOneWorld = objFeature.bOneWorld;
            var bMultiCurrency = objFeature.bMultiCurrency;
            var stRoleId = runtime.getCurrentUser().role;
            var arIsClosed = [], arrVendorHeader = [], arrPOBills = [], arrBillId = [], arrBillHeadFlds = [], arrUniqueId = [], arrPO = [], arrPOFld = [], arExpensesOnly = [];
            var index = 0;
            var stUnpaidAmt = (objFeature.bMultiCurrency) ? HC_FX_AMOUNT_REMAINING : HC_AMOUNT_REMAINING;
            var stAmount = (objFeature.bMultiCurrency) ? HC_FX_AMOUNT : HC_AMOUNT;
            var arSumOfPOAmt = [];
            
            var stTable = "<table class='listtable listborder uir-list-table'><tr class='uir-machine-headerrow'>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Bill</td>" 
                        + ((bMultiCurrency) ? "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Currency</td>" : "")
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Due Date</td>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Bill Amount</td>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Unpaid Balance</td>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Purchase Order</td>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>PO Amount</td>"
                        + "<td class='listheadertdleft listheadertextb uir-column-large' style='font-weight:bold !important;'>Available Credits to Apply</td></tr>";
            
            var arPBFilter = [search.createFilter({
                name: 'formulatext',
                operator: 'isnot',
                formula: 'NVL({custbody_nsts_vp_prepay_vp}, 0)',
                values: 0}),
                search.createFilter({
                    name: HC_MAINLINE,
                    operator: 'is',
                    values: 'F'}),
                search.createFilter({
                    name: HC_STATUS,
                    operator: 'noneof',
                    values: ['PurchOrd:C', 'PurchOrd:H']}),
                search.createFilter({
                    name: HC_TYPE,
                    join: HC_APPLYING_TRANS,
                    operator: 'anyof',
                    values: 'VendBill'}),
                search.createFilter({
                    name: HC_STATUS,
                    join: HC_APPLYING_TRANS,
                    operator: 'anyof',
                    values: ['VendBill:A', 'VendBill:D']}),
                search.createFilter({
                    name: 'formulatext',
                    operator: 'isnot',
                    formula: 'NVL({applyingtransaction.transactionnumber}, 0)',
                    values: 0})];
            var arPBColumn = [HC_INTERNAL_ID, HC_TRANID, stAmount, HC_CLOSED, HC_STATUS,
                              search.createColumn({name: HC_ENTITY_ID, join: HC_TRANS_RECORDS.COMMON.RECORDS.VENDOR, sort: search.Sort.ASC}),
                              search.createColumn({name: HC_INTERNAL_ID, join: HC_APPLYING_TRANS}),
                              search.createColumn({name: HC_TRANSACTION_NUMBER, join: HC_APPLYING_TRANS})];
            
            if(bOneWorld)
                arPBColumn.push(HC_SUBSIDIARY);
                     
            if(bMultiCurrency)
                arPBColumn.push(HC_CURRENCY);
                
            var objPrepaymentBills = search.create({
                type: HC_TRANS_RECORDS.COMMON.RECORDS.PURCHASEORDER,
                columns: arPBColumn,
                filters: arPBFilter
             }).run().each(function(result){
                 var stVendor = result.getValue({name: HC_ENTITY_ID, join: HC_TRANS_RECORDS.COMMON.RECORDS.VENDOR});
                 var idPO = result.getValue(HC_INTERNAL_ID);
                 var idBill = result.getValue({name: HC_INTERNAL_ID, join: HC_APPLYING_TRANS});
                 var stBillTransNum = result.getValue({name: HC_TRANSACTION_NUMBER, join: HC_APPLYING_TRANS});
                 var stPOTransNum = result.getValue(HC_TRANID);
                 var flPOAmount = lib.forceParseFloat(result.getValue(stAmount));
                 var stUniqueId = idBill + '_' + result.getValue(HC_INTERNAL_ID);
                 var arPOSubsidiary = (bOneWorld) ? result.getText(HC_SUBSIDIARY).split(' : ') : [];
                
                 if(arrUniqueId.indexOf(stUniqueId) == -1 && (stRoleId == 3 || lib.subsidiaryHasAccess(arPOSubsidiary))){
                     arrBillId.push(idBill);
                     arrPO.push(idPO);
                     arrPOBills.push({
                         vendor : stVendor,
                         bill : idBill,
                         billTransNum : stBillTransNum,
                         poId : idPO,
                         poTransNum : stPOTransNum,
                         poAmount : flPOAmount,
                         currency :  (bMultiCurrency) ? result.getText(HC_CURRENCY) : ''
                     });
                 }
                 
                 arrUniqueId.push(stUniqueId);
                 return true;
             });
            
            if(!lib.isEmpty(arrBillId)){
                var objBillHeaderFlds = search.create({
                    type: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORBILL,
                    columns: [HC_INTERNAL_ID, HC_TRANSACTION_NUMBER, 'duedate', stUnpaidAmt, stAmount],
                    filters: [[HC_INTERNAL_ID, 'anyof', arrBillId], 'and', [HC_MAINLINE, 'is', 'T']]
                }).run().each(function(result){
                    arrBillHeadFlds[result.getValue(HC_INTERNAL_ID)] = {duedate : result.getValue('duedate'), 
                                                                      unpaidAmount : result.getValue(stUnpaidAmt),
                                                                      amount : result.getValue(stAmount)};
                    return true;
                });
                
                var objPOCredits = search.create({
                    type: HC_VP_RECORDS.VP.ID,
                    columns: [search.createColumn({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO, summary: search.Summary.GROUP}),
                              search.createColumn({name: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO_AMOUNT, summary: search.Summary.AVG}),
                              search.createColumn({name: stUnpaidAmt, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT, summary: search.Summary.SUM})],
                    filters: [search.createFilter({
                              name: HC_MAINLINE,
                              join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO,
                              operator: 'is',
                              values: 'T'}),
                              search.createFilter({
                              name: HC_INTERNAL_ID,
                              join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO,
                              operator: 'anyof',
                              values: arrPO})]
                }).run().each(function(result){
                    var idPOGroup = result.getValue({name: HC_INTERNAL_ID, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO, summary: search.Summary.GROUP}); 
                    var flAvailCredits = lib.forceParseFloat(result.getValue({name: stUnpaidAmt, join: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PREPAY_CREDIT, summary: search.Summary.SUM}));
                        flAvailCredits =  (!lib.isEmpty(flAvailCredits)) ? flAvailCredits : 0;
                    
                    arrPOFld[idPOGroup] = flAvailCredits;
                    arSumOfPOAmt[idPOGroup] = lib.forceParseFloat(result.getValue({name: HC_VP_RECORDS.VP.FIELDS.CUSTRECORD_NSTS_VP_PO_AMOUNT, summary: search.Summary.AVG}));
                    return true;
                });
            }
            
            var arrWithHeader = [];
            var intHeader = 0;
            for(var i = 0; i < arrPOBills.length; i++){
                var flCredits = arrPOFld[arrPOBills[i].poId];
                var bIsDisplay = true;
                
                var stVendorBillURL = url.resolveRecord({
                    recordType: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORBILL,
                    recordId: arrPOBills[i].bill,
                    isEditMode: false
                });
                
                if(!lib.isEmpty(flCredits) && bIsDisplay){
                    index++;
                    if(arrVendorHeader.indexOf(arrPOBills[i].vendor) == -1){
                        stTable += "<tr class='uir-list-row-tr uir-list-row-odd'>"
                            +"<td colspan="+((bMultiCurrency) ? '8' : '7')+" class='custpage_vp_bill_sublistlnk' "
                            +"style='background-color:#c3d1de !important;color:#24385B !important;font-weight:bold;'>"
                            +arrPOBills[i].vendor+"</td></tr>";
                        arrVendorHeader.push(arrPOBills[i].vendor);
                    }
                    stTable += "<tr class='uir-list-row-tr uir-list-row-odd'><td class='uir-list-row-cell listtext'>"
                             + "<a href='"+stVendorBillURL+"' target='_blank'>"+arrPOBills[i].billTransNum+"</a></td>"
                             + ((bMultiCurrency) ? "<td class='uir-list-row-cell listtext'>"+arrPOBills[i].currency+"</td>" : "")
                             + "<td class='uir-list-row-cell listtext'>"+arrBillHeadFlds[arrPOBills[i].bill].duedate+"</td>"
                             + "<td class='uir-list-row-cell listtext'>"+lib.numberWithCommas(arrBillHeadFlds[arrPOBills[i].bill].amount)+"</td>"
                             + "<td class='uir-list-row-cell listtext'>"+lib.numberWithCommas(arrBillHeadFlds[arrPOBills[i].bill].unpaidAmount)+"</td>"
                             + "<td class='uir-list-row-cell listtext'>"+arrPOBills[i].poTransNum+"</td>"
                             + "<td class='uir-list-row-cell listtext'>"+lib.numberWithCommas(lib.forceParseFloat(arSumOfPOAmt[arrPOBills[i].poId]).toFixed(2))+"</td>"
                             + "<td class='uir-list-row-cell listtext'>"+lib.numberWithCommas(lib.forceParseFloat(arrPOFld[arrPOBills[i].poId]).toFixed(2))+"</td></tr>";
                }
            }
            
            stTable += "</table>";
            
            var fldHtml = form.addField({
                id : FLD_CUSTPAGE_NSTS_VP_HTML_APPLY_PREPAY,
                type : ui.FieldType.INLINEHTML,
                label : 'Bills'
            });fldHtml.defaultValue = (!lib.isEmpty(index)) ? stTable : 'No available prepayments to display.';
            
            return form;
        }
        
        /**
         * @description Creates/updates vendor credit applications
         * @param request
         * @param arRequestParam object array of suitelet values
         */
        function createUpdateVPApplication(request, arRequestParam){
            var lineCount = request.getLineCount(SBL_NSTS_VP_PREPAYMENT);
            var dateBill =  request.parameters.custpage_nsts_vp_bill_date;
            var arAppValues = [];
            var arVPCredits = [];
            var arAppliedAmount = [];
            
            var bUpdateBill = lib.isAllowNonGL(dateBill).bUpdateBill;
            
            for(var i = 0; i < lineCount; i++){
                var flApplyAmount = lib.forceParseFloat(request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C, line: i}));
                var flApplyAmountOld = lib.forceParseFloat(request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_REAPPLY_C_OLD, line: i}));
                var bIsBillHeader = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_BILL_HEADER, line: i});
                
                if(bIsBillHeader == 'T' && bUpdateBill){
                    var bPaymentHold = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_PAYMENT_HOLD, line: i});
                    var idBillLine = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_BILL_ID, line: i});
                    record.submitFields({
                        type: HC_TRANS_RECORDS.COMMON.RECORDS.VENDORBILL,
                        id: idBillLine,
                        values: {
                            paymenthold: (bPaymentHold == 'T') ? true : false
                        },
                        ignoreMandatoryFields: true
                    });
                }
                
                    var idPrepayment = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_PREPAYMENT_ID, line: i});
                    var idPrepaymentCredit = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_CREDIT_ID, line: i});
                    var idPurchaseOrder = request.getSublistValue({group: SBL_NSTS_VP_PREPAYMENT, name: FLD_CUSTPAGE_NSTS_VP_SBL_PO_ID, line: i});
                    
                    arVPCredits.push(idPrepaymentCredit);
                    arAppliedAmount.push({
                        appliedAmount: flApplyAmount,
                        appliedAmountOld : flApplyAmountOld,
                        vpCredit     : idPrepaymentCredit
                    });
                    arAppValues.push({
                        appliedAmount : flApplyAmount,
                        appliedAmountOld : flApplyAmountOld,
                        appliedBill : arRequestParam.billFld,
                        prepayment: idPrepayment,
                        prepaymentCredit: idPrepaymentCredit,
                        purchaseOrder: idPurchaseOrder
                    });
            }
            
            if(!lib.isEmpty(arVPCredits)){
              //Update Existing Applications
                var objApplicationSearch = search.create({
                    type: HC_VP_RECORDS.VP_APPLICATION.ID,
                    columns: [HC_INTERNAL_ID, HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT],
                    filters: [[HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_BILL, 'anyof', [arRequestParam.billFld]], 'and',
                              [HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, 'anyof', arVPCredits]]
                 }).run().each(function(result){
                     var idApplicationCredit = result.getValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT);
                     var appliedIndex = arAppliedAmount.map(function(e) { return e.vpCredit }).indexOf(idApplicationCredit);
                     
                     if(arVPCredits.indexOf(idApplicationCredit) != -1){
                         var flAppliedAmount = lib.forceParseFloat(arAppliedAmount[appliedIndex].appliedAmount);
                         
                         if(arAppliedAmount[appliedIndex].appliedAmount != arAppliedAmount[appliedIndex].appliedAmountOld){
                             record.submitFields({
                                 type: HC_VP_RECORDS.VP_APPLICATION.ID,
                                 id: result.getValue(HC_INTERNAL_ID),
                                 values: {
                                     custrecord_nsts_vp_apply_amount: flAppliedAmount
                                 },
                                 ignoreMandatoryFields: true
                             });
                         }
                         arVPCredits.splice(arVPCredits.indexOf(idApplicationCredit), 1);
                     }
                     return true;
                 });
                
                //Create Applications
                if(!lib.isEmpty(arAppValues)){
                    for(var c = 0; c < arVPCredits.length; c++){
                        var intCreditIndex = arAppValues.map(function(e) { return e.prepaymentCredit }).indexOf(arVPCredits[c]);
                        
                        if(!lib.isEmpty(arAppValues[intCreditIndex].appliedAmount)){
                            var objVPApp = record.create({
                            type: HC_VP_RECORDS.VP_APPLICATION.ID,
                            isDynamic: true
                            });
                            objVPApp.setValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_AMT, arAppValues[intCreditIndex].appliedAmount);
                            objVPApp.setValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_BILL, arAppValues[intCreditIndex].appliedBill);
                            objVPApp.setValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_PREPAY, arAppValues[intCreditIndex].prepayment);
                            objVPApp.setValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_CREDIT, arAppValues[intCreditIndex].prepaymentCredit);
                            objVPApp.setValue(HC_VP_RECORDS.VP_APPLICATION.FIELDS.CUSTRECORD_NSTS_VP_APPLY_PO, arAppValues[intCreditIndex].purchaseOrder);
                            objVPApp.save();
                        }
                        
                    }
                }
            }
            
            //Redirect to Bill View Page
            redirect.toRecord({
                type : record.Type.VENDOR_BILL,
                id : arRequestParam.billFld
            });

        }
        
        return {
            onRequest: onRequest
        };
    }
);