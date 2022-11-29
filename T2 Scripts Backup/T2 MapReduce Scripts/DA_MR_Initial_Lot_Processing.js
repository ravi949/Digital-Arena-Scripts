/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format'],
    function(search, record, runtime, format) {
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
              
               var customrecord_da_inventory_detailSearchObj = search.create({
                            type: "customrecord_da_inventory_detail",
                            filters: [
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

                        customrecord_da_inventory_detailSearchObj.run().each(function(result) {
                           
                            record.delete({
                              type :'customrecord_da_inventory_detail',
                              id : result.id
                            });
                            return true;
                        });
                var customrecord_da_trans_inventory_detailSearchObj = search.create({
                    type: "customrecord_da_trans_inventory_detail",
                    filters: [
                        ["isinactive", "is", "F"]

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

                    var inventoryDetailRec = record.create({
                        type: 'customrecord_da_inventory_detail'
                    });

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
                        inventoryDetailRec.setValue('custrecord_da_inventory_detail_item', itemId);
                    }
                    if (locationId) {
                        inventoryDetailRec.setValue('custrecord_da_inventory_detail_location', locationId);
                    }
                    if (binNo) {
                        inventoryDetailRec.setValue('custrecord_da_inventory_detail_bin', binNo);
                    }
                    if (lotId) {
                        inventoryDetailRec.setValue('custrecord_da_inventory_detail_number', lotId);
                    }
                    inventoryDetailRec.setValue('custrecord_da_inventory_detail_quantity', qty);
                    inventoryDetailRec.save();
                    return true;
                });
            } catch (ex) {
                log.error(ex.name, 'getInputData state, message = ' + ex.message);
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

        function getLastDateOFPrevMonth(endDate) {
            var d = new Date(endDate);
            d.setDate(1);
            d.setHours(-20);
            return d;
        };
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function removeDuplicateUsingFilter(arr) {
            var unique_array = arr.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            return unique_array
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });