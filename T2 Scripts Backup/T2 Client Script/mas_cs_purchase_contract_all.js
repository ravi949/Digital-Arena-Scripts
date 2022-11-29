/**
 * @NScriptName ClientScript
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/runtime", "N/record"], function (require, exports, runtime, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ============= Variables =============
    var accountId = '2338541';
    var showConfirmMessage = true; // Confirm Window to ask the user if he/she wants wants to add the purchase contract again.
    var replaceLines = false;
    var addPCitemsCheckBoxID = 'custbody_da_add_from_purchase_contract';
    var purchaseContractsFieldID = 'custbodyda_purchase_contracts_list';
    // =====================================
    var currentMode;
    var selectedContracts = [];
    function pageInit(context) {
        currentMode = context.mode;
    }
    exports.pageInit = pageInit;
    function fieldChanged(context) {
        if (runtime.accountId == accountId) {
            var purchaseOrder = context.currentRecord;
            var headerPurchaseContract = purchaseOrder.getValue('purchasecontract');
            var isAddingActivated = purchaseOrder.getValue(addPCitemsCheckBoxID);
            if (context.fieldId == 'purchasecontract' && headerPurchaseContract && context.sublistId != 'item' && isAddingActivated) {
                if (replaceLines) {
                    var prevLinesCount = purchaseOrder.getLineCount({ sublistId: 'item' });
                    if (prevLinesCount) {
                        for (var i = 0; i < prevLinesCount; i++) {
                            purchaseOrder.removeLine({ sublistId: 'item', line: 0 });
                        }
                    }
                }
                if (currentMode == 'edit') {
                    selectedContracts = purchaseOrder.getValue(purchaseContractsFieldID);
                }
                var isContractExist = (selectedContracts.indexOf(headerPurchaseContract) == -1) ? false : true;
                var addContract = (isContractExist) ? false : true;
                if (replaceLines)
                    addContract = true;
                if (isContractExist && showConfirmMessage && !replaceLines) {
                    addContract = confirm('The selected purchase contract is already added.\nDo you want to add it again?');
                }
                if (addContract) {
                    var contractRecord = record.load({
                        type: 'purchasecontract',
                        id: Number(headerPurchaseContract),
                    });
                    for (var i = 0; i < contractRecord.getLineCount('item'); i++) {
                        purchaseOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: contractRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }),
                            fireSlavingSync: true,
                            ignoreFieldChange: false
                        });
                        purchaseOrder.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: contractRecord.getSublistSubrecord({ sublistId: 'item', fieldId: 'itempricing', line: i }).getSublistValue({ sublistId: 'discount', fieldId: 'fromquantity', line: 1 }),
                            fireSlavingSync: true,
                            ignoreFieldChange: false
                        });
                        purchaseOrder.commitLine({ sublistId: 'item' });
                    }
                    if (replaceLines) {
                        selectedContracts = [headerPurchaseContract];
                    }
                    else {
                        selectedContracts.push(headerPurchaseContract);
                    }
                    purchaseOrder.setValue(purchaseContractsFieldID, selectedContracts);
                }
            }
        }
    }
    exports.fieldChanged = fieldChanged;
});
