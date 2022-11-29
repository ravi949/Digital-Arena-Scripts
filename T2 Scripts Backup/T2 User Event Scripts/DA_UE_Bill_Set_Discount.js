/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record', 'N/error'],

    function(message, serverWidget, search, runtime, record) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {


            } catch (ex) {
                log.error(ex.name, ex.message)
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */

        function beforeSubmit(scriptContext) {
            try {

            } catch (ex) {
                log.error(ex.name, ex.message);
            }

        }




        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {

                var recId = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                log.debug('recId', recId);
                var disTotal = 0;
                var objRecord = record.load({
                    type: type,
                    id: recId
                });
                log.debug('objRecord', objRecord);

                var itemLineCount = objRecord.getLineCount({
                    sublistId: 'item'
                });
                log.debug('itemLineCount', itemLineCount);

                for (var i = 0; i < itemLineCount; i++) {

                    var quantity = objRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    log.debug('quantity', quantity);
                    var unitAmt = objRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_po_1unit_discount_amount',
                        line: i
                    });
                    log.debug('unitAmt', unitAmt);
                    var originalUnitAmt = parseFloat(unitAmt) * parseFloat(quantity);

                  /*  objRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_po_1unit_discount_amount',
                        value: originalUnitAmt,
                        line: i
                    });*/
                    log.debug('originalUnitAmt', originalUnitAmt);
                    if (originalUnitAmt) {

                        disTotal = parseFloat(originalUnitAmt) + parseFloat(disTotal);
                        log.debug('disTotal', disTotal);
                    }

                }
                objRecord.setValue({
                    fieldId: 'custbody_da_po_discount',
                    value: disTotal
                });
                objRecord.save();

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });