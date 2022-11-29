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
                var discAmtTotal = 0;
                var disTotal = 0;
                var discountTotal = 0;
                var discPercent;
                var discountAmt;
                var discAmount = 0;
                var discPOAmount = 0;

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

                    discPercent = objRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_da_po_discount_percentage',
                        line: i
                    });
                    var discAmt = objRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_da_po_discount_amount',
                        line: i
                    });
                    log.debug('discPercent', discPercent);
                    log.debug('discAmt', discAmt);
                    var discValue = parseFloat(discPercent) / 100;
                    log.debug('discValue', discValue);

                    if (discValue > 0) {
                      log.debug(i);
                        log.debug('if condition exists');
                        var amount = objRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: i
                        });
                        log.debug('amount', amount);
                        var quantity = objRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });
                        log.debug('quantity', quantity);

                        discAmount = parseFloat(amount) * parseFloat(discPercent) / 100;
                        log.debug('discAmount', discAmount);

                        objRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_po_discount_amount',
                            value: discAmount,
                            line: i
                        });
                        var unitAmt = parseFloat(discAmount) / parseFloat(quantity);
                        log.debug('unitAmt', unitAmt);

                        objRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_po_1unit_discount_amount',
                            value: Number(unitAmt).toFixed(2),
                            line: i
                        });
                        disTotal = parseFloat(discAmount) + parseFloat(disTotal);
                        log.debug('disTotal', disTotal);
                    }

                    if (discAmt > 0) {

                        var quantity = objRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });
                        log.debug('quantity', quantity);

                        discAmtTotal = parseFloat(discAmt) / parseFloat(quantity);
						discAmtTotal = Number(discAmtTotal).toFixed(2);
                        objRecord.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_po_1unit_discount_amount',
                            value: discAmtTotal,
                            line: i
                        });
                        log.debug('discAmtTotal', discAmtTotal);


                        discountTotal = parseFloat(discAmt) + parseFloat(discountTotal);


                        log.debug('discountTotal', discountTotal);

                    }
                    discPOAmount = parseFloat(disTotal) + parseFloat(discountTotal);
                    objRecord.setValue({
                        fieldId: 'custbody_da_po_discount',
                        value: Number(discPOAmount).toFixed(2)
                    });
                    log.debug('discPOAmount', discPOAmount)

                }

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