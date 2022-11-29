    /**
     * @NApiVersion 2.x
     * @NScriptType UserEventScript
     * @NModuleScope TargetAccount
     */
    define(['N/runtime', 'N/record', 'N/search'],
        function(runtime, record, search) {
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
            function beforeSubmit(scriptContext) {}
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

                    var lotNo = scriptContext.newRecord.getValue('custrecord_da_trans_inv_detail_number');

                    if (lotNo) {
                        var customrecord_da_inventory_detailSearchObj = search.create({
                            type: "customrecord_da_inventory_detail",
                            filters: [
                                ["custrecord_da_inventory_detail_number", "anyof", lotNo]
                            ],
                            columns: [

                                search.createColumn({
                                    name: "custrecord_da_inventory_detail_quantity",
                                    label: "Quantity"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_inventory_detailSearchObj.runPaged().count;
                        log.debug("customrecord_da_inventory_detailSearchObj result count", searchResultCount);

                        var recordId;
                        customrecord_da_inventory_detailSearchObj.run().each(function(result) {
                            recordId = result.id;
                            return true;
                        });
                        var customrecord_da_trans_inventory_detailSearchObj = search.create({
                            type: "customrecord_da_trans_inventory_detail",
                            filters: [
                                ["isinactive", "is", "F"], "AND", ["custrecord_da_trans_inv_detail_number", "anyof", lotNo]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da__trans_inv_detail_item",
                                    summary: "GROUP",
                                    label: "Item"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_trans_inv_detail_location",
                                    summary: "GROUP",
                                    label: "Location"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_trans_inv_detail_bin",
                                    summary: "GROUP",
                                    label: "Bin"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_trans_inv_detail_number",
                                    summary: "GROUP",
                                    label: "Lot Number"
                                }),
                                search.createColumn({
                                    name: "internalid",
                                    join: "CUSTRECORD_DA_TRANS_INV_DETAIL_NUMBER",
                                    summary: "GROUP",
                                    label: "Lot Id"
                                }),
                                search.createColumn({
                                    name: "formulanumeric",
                                    summary: "SUM",
                                    formula: "CASE WHEN {custrecord_da_inventory_detail_trans} like '%Invoice%' THEN {custrecord_da_trans_inv_detail_quantity} * -1   WHEN {custrecord_da_inventory_detail_trans} like '%Item Fulfillment%' THEN {custrecord_da_trans_inv_detail_quantity} * -1   WHEN {custrecord_da_inventory_detail_trans} like '%Bill Credit%' THEN {custrecord_da_trans_inv_detail_quantity} * -1 ELSE {custrecord_da_trans_inv_detail_quantity} end",
                                    label: "Formula (Numeric)"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_trans_inv_detail_expiry",
                                    summary: "GROUP",
                                    sort: search.Sort.ASC,
                                    label: "Expiry Date"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_trans_inventory_detailSearchObj.runPaged().count;
                        log.debug("customrecord_da_trans_inventory_detailSearchObj result count", searchResultCount);
                        customrecord_da_trans_inventory_detailSearchObj.run().each(function(result) {
                            if (recordId) {
                                var summaryRec = record.load({
                                    type: 'customrecord_da_inventory_detail',
                                    id : recordId
                                });
                            } else {
                                var summaryRec = record.create({
                                    type: 'customrecord_da_inventory_detail'
                                });
                            }

                            var itemId = result.getValue({
                                name: 'custrecord_da__trans_inv_detail_item',
                                summary: search.Summary.GROUP
                            });
                            var binNo = result.getValue({
                                name: 'custrecord_da_trans_inv_detail_bin',
                                summary: search.Summary.GROUP
                            });
                            var locationId = result.getValue({
                                name: 'custrecord_da_trans_inv_detail_location',
                                summary: search.Summary.GROUP
                            });
                            var lotId = result.getValue({
                                name: 'custrecord_da_trans_inv_detail_number',
                                summary: search.Summary.GROUP
                            });
                            var qty = result.getValue({
                                name: 'formulanumeric',
                                summary: search.Summary.SUM
                            });
                            if (itemId) {
                                summaryRec.setValue('custrecord_da_inventory_detail_item', itemId);
                            }
                            if (locationId) {
                                summaryRec.setValue('custrecord_da_inventory_detail_location', locationId);
                            }
                            if (binNo) {
                                summaryRec.setValue('custrecord_da_inventory_detail_bin', binNo);
                            }
                            if (lotId) {
                                summaryRec.setValue('custrecord_da_inventory_detail_number', lotId);
                            }
                            summaryRec.setValue('custrecord_da_inventory_detail_quantity', qty);
                            summaryRec.save();

                        });
                    }
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