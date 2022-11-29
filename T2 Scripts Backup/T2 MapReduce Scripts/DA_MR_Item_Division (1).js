/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],

    function(record, search, runtime, format) {


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
                return divisionSearch = search.create({
                    type: 'customrecord_cseg_da_items_devs',
                    columns: [
                        'internalid'
                    ]
                });
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
        }
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            try {
                var recordId = JSON.parse(context.value);
                context.write({
                    value: recordId
                });
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
                var recordId = JSON.parse(context.key);
                var divisionId = recordId.value.id;
                var itemSearch = search.create({
                    type: 'TRANSACTION',
                    columns: [{
                        name: 'item',
                        summary: search.Summary.GROUP
                    }, {
                        name: 'custcol_da_item_type',
                        summary: search.Summary.GROUP
                    }, {
                        name: 'item',
                        summary: search.Summary.GROUP
                    }, {
                        name: 'islotitem',
                        join: 'item',
                        summary: search.Summary.GROUP
                    }, {
                        name: 'isserialitem',
                        join: 'item',
                        summary: search.Summary.GROUP
                    }, {
                        name: 'amount',
                        sort: search.Sort.DESC,
                        summary: search.Summary.SUM
                    }],
                    filters: [
                        ['mainline', 'is', 'F'], 'and', ['type', 'anyof', 'CustInvc', 'CustCred'], 'and', ['custcol_da_item_type', 'anyof', '1'], 'and', ['item.cseg_da_items_devs', 'anyof', divisionId], 'and', ['postingperiod', 'rel', 'TP']
                    ]
                });

                var totalAmount = 0;
                var itemId;
                var itemType;
                var itemCount = itemSearch.runPaged().count;
                itemSearch.run().each(function(result) {
                    itemId = result.getValue({
                        "name": "item",
                        "summary": search.Summary.GROUP
                    });
                    itemType = result.getText({
                        "name": "custcol_da_item_type",
                        "summary": search.Summary.GROUP
                    });
                    var item = result.getText({
                        "name": "item",
                        "summary": search.Summary.GROUP
                    });
                    var amount = result.getValue({
                        "name": "amount",
                        "sort": search.Sort.DESC,
                        "summary": search.Summary.SUM
                    });

                    totalAmount = parseFloat(totalAmount) + parseFloat(amount);
                    return true;
                });
                var gradeA = (80) / (100) * (totalAmount);
                var gradeB = (16) / (100) * (totalAmount);
                var gradeC = (4) / (100) * (totalAmount);

                var runTotal = 0;
                var runValue = 0;
                var iteminternalId;
                var compValue = [gradeA, gradeB, gradeC];
                var gradeValue = [1, 2, 3];
                itemSearch.run().each(function(result) {
                    var itemAmount = result.getValue({
                        "name": "amount",
                        "summary": search.Summary.SUM
                    });
                    var lotItem = result.getValue({
                        name: 'islotitem',
                        join: 'item',
                        "summary": search.Summary.GROUP
                    });
                    var serialItem = result.getValue({
                        name: 'isserialitem',
                        join: 'item',
                        "summary": search.Summary.GROUP
                    });
                    iteminternalId = result.getValue({
                        "name": "item",
                        "summary": search.Summary.GROUP
                    });
                    var itemNo = result.getText({
                        "name": "item",
                        "summary": search.Summary.GROUP
                    });
                    runTotal = parseFloat(runTotal) + parseFloat(itemAmount);
                        if ((runTotal <= compValue[0]) || (gradeValue[0] == '3')) {
                            if (lotItem == true) {
                                var lotItem = record.submitFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else if (serialItem == true) {
                                var serialItem = record.submitFields({
                                    type: 'serializedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else if (runTotal == compValue[0]) {
                            runTotal = itemAmount;
                            runValue = runValue + 1;
                            compValue[0] = compValue[runValue];
                            gradeValue[0] = gradeValue[runValue];
                            if (lotItem == true) {
                                var lotItem = record.submitFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else if (serialItem == true) {
                                var serialItem = record.submitFields({
                                    type: 'serializedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } 
                            else {
                                var invItem = record.submitFields({
                                    type: 'inventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                            } 
                            else {
                                var invItem = record.submitFields({
                                    type: 'inventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                         
                        }
                            else {
                            runTotal = itemAmount;
                            runValue = runValue + 1;
                            compValue[0] = compValue[runValue];
                            gradeValue[0] = gradeValue[runValue];
                            if ((runTotal <= compValue[0]) || (gradeValue[0] == '3')) {
                            if (lotItem == true) {
                                var lotItem = record.submitFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else if (serialItem == true) {
                                var serialItem = record.submitFields({
                                    type: 'serializedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } 
                            else {
                                var invItem = record.submitFields({
                                    type: 'inventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[0]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                        }
                    }
                    return true;
                                            });
            } catch (ex) {
                log.error(ex.name, ex.message);

            }


        }
        // example usage
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                log.debug("Process Completed");
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