/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/https', 'N/record', 'N/runtime', 'N/url', 'N/search', 'N/format'],
    function(https, record, runtime, url, search, format) {
        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */
        function getInputData() {
            try {
                var scriptObj = runtime.getCurrentScript();
                var recordType = scriptObj.getParameter({
                    name: 'custscript_da_record_type'
                });
                log.debug('recordType', recordType);
                var recordId = scriptObj.getParameter({
                    name: 'custscript_da_record_id'
                });
                log.debug('recordId', recordId);

                var prodSettingsRec = record.load({
                    type: 'customrecord_da_production_settings',
                    id: '1'
                });
                var prodPlanCheckBox = prodSettingsRec.getValue('custrecord_da_prod_plan_avail_prod');
                log.debug('prodPlanCheckBox', prodPlanCheckBox);
                var transferOrderCheckBox = prodSettingsRec.getValue('custrecord_da_prod_plan_avail_to');
                log.debug('transferOrderCheckBox', transferOrderCheckBox);
                var statusVal = prodSettingsRec.getValue('custrecord_da_prod_plan_settings');
                log.debug('statusVal', statusVal);
                var productionPlanRec = record.load({
                    type: recordType,
                    id: recordId
                });
                var subsidiaryId = productionPlanRec.getValue('subsidiary');
                log.debug('subsidiaryId', subsidiaryId);
                var location = productionPlanRec.getValue('location');
                var lineCount = productionPlanRec.getLineCount('item');
                log.debug('lineCount', lineCount);
                for (var i = 0; i < lineCount; i++) {
                    var item = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    var qty = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    log.debug('qty', qty);
                    var backOrderQty = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'backordered',
                        line: i
                    });
                    log.debug('backOrderQty', backOrderQty);
                    var qtyavail = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityavailable',
                        line: i
                    });
                    log.debug('qtyavail', qtyavail);
                    var itemType = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_item_type_2',
                        line: i
                    });
                    log.debug('itemType', itemType);
                    var workOrderRef = productionPlanRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_work_order_ref',
                        line: i
                    });

                    if (!workOrderRef) {
                        if (itemType == 5) {
                            log.debug('Assembly Item');
                            if(prodPlanCheckBox == false && transferOrderCheckBox == true){
                              if(qty > qtyavail){
                                qty = parseFloat(qty) - parseFloat(qtyavail);
                                log.debug('quantity',qty);
                            var workOrderRec = record.create({
                                type: 'workorder',
                                isDynamic: true
                            });
                            workOrderRec.setValue('subsidiary', subsidiaryId);
                            workOrderRec.setValue('assemblyitem', item);
                            if (statusVal == '1') {
                                workOrderRec.setValue('orderstatus', 'B');
                            } else {
                                workOrderRec.setValue('orderstatus', 'A');
                            }
                                workOrderRec.setValue('quantity', qty);
                                log.debug('greater');
                                workOrderRec.setValue('custbody_da_transfer_order_ref', recordId);
                            workOrderRec.setValue('location', location);
                            var workOrderRecId = workOrderRec.save();
                            log.debug('workOrderRecId', workOrderRecId);
                            productionPlanRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_da_work_order_ref',
                                line: i,
                                value: workOrderRecId
                            });
                              }
                              } else {
                                var workOrderRec = record.create({
                                type: 'workorder',
                                isDynamic: true
                            });
                            workOrderRec.setValue('subsidiary', subsidiaryId);
                            workOrderRec.setValue('assemblyitem', item);
                            if (statusVal == '1') {
                                workOrderRec.setValue('orderstatus', 'B');
                            } else {
                                workOrderRec.setValue('orderstatus', 'A');
                            }
                                workOrderRec.setValue('quantity', qty);
                                workOrderRec.setValue('custbody_da_transfer_order_ref', recordId);
                            workOrderRec.setValue('location', location);
                            var workOrderRecId = workOrderRec.save();
                            log.debug('workOrderRecId', workOrderRecId);
                            productionPlanRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_da_work_order_ref',
                                line: i,
                                value: workOrderRecId
                            });
                              }
                            
                        }
                    }
                }
                var productionPlanRecId = productionPlanRec.save();
                log.debug('productionPlanRecId', productionPlanRecId);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            try {

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Executes when the reduce entry point is triggered and applies to each group.
         *
         * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
         * @since 2015.1
         */
        function reduce(context) {
            try {

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                log.debug('process completed');
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });