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
                var mySearch = search.load({
                    id: 'customsearch_da_rolling_period_to_date'
                });
                var totalAmount = 0;
                var itemId;
                var itemAmt;
                var itemCount = mySearch.runPaged().count;
                log.debug('itemCount', itemCount);
                mySearch.run().each(function(result) {
                    var itemId = result.getValue({
                        name: 'item',
                        summary: search.Summary.GROUP
                    });
                    log.debug('itemId', itemId);
                    var itemAmt = result.getValue({
                        name: 'amount',
                        sort: search.Sort.DESC,
                        summary: search.Summary.SUM
                    });
                    log.debug('itemAmt', itemAmt);
                    totalAmount = parseFloat(totalAmount) + parseFloat(itemAmt);
                    log.debug('totalAmount', totalAmount);
                    return true;
                });
                var customABCRecord = record.load({
                    type: 'customrecord_da_abc_grades',
                    id: 1,
                    isDynamic: true
                });
                var percentA = customABCRecord.getValue('custrecord_da_percentage_a');
                log.debug('percentA', percentA);
                var percentB = customABCRecord.getValue('custrecord_da_percentage_b');
                log.debug('percentB', percentB);
                var percentC = customABCRecord.getValue('custrecord_da_percentage_c');
                log.debug('percentC', percentC);
                var percentD = customABCRecord.getValue('custrecord_da_percentage_d');
                log.debug('percentD', percentD);
                var gradeA = (percentA) / (100) * (totalAmount);
                log.debug('gradeA', gradeA);
                var gradeB = (percentB) / (100) * (totalAmount);
                log.debug('gradeB', gradeB);
                var gradeC = (percentC) / (100) * (totalAmount);
                log.debug('gradeC', gradeC);
                var gradeD = (percentD) / (100) * (totalAmount);
                log.debug('gradeD', gradeD);

                var runTotal = 0;
                var compRunValue = 0;
                var gradeRunValue = 0;
                var iteminternalId;
                var compValue = [gradeA, gradeB, gradeC, gradeD];
                var gradeValue = [1, 2, 3, 4];
                mySearch.run().each(function(result) {
                    var itemAmount = result.getValue({
                        name: "amount",
                        sort: search.Sort.DESC,
                        summary: search.Summary.SUM
                    });
                    log.debug('itemAmount', itemAmount);
                    var lotItem = result.getValue({
                        name: 'islotitem',
                        join: 'item',
                        summary: search.Summary.GROUP
                    });
                    log.debug('lotItem', lotItem);
                    var serialItem = result.getValue({
                        name: 'isserialitem',
                        join: 'item',
                        summary: search.Summary.GROUP
                    });
                    log.debug('serialItem', serialItem);
                    var itemType = result.getValue({
                        name: 'type',
                        join: 'item',
                        summary: search.Summary.GROUP
                    });
                    log.debug('itemType', itemType);
                    iteminternalId = result.getValue({
                        name: "item",
                        summary: search.Summary.GROUP
                    });
                    log.debug('iteminternalId', iteminternalId);
                    var itemNo = result.getText({
                        name: "item",
                        summary: search.Summary.GROUP
                    });
                    log.debug('itemNo', itemNo);
                    runTotal = parseFloat(runTotal) + parseFloat(itemAmount);
                    log.debug('runTotal', runTotal);
                    if ((runTotal < compValue[compRunValue])) {
                        if (lotItem == true) {
                            var lotItem = record.submitFields({
                                type: 'lotnumberedinventoryitem',
                                id: iteminternalId,
                                values: {
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
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
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            var invItem = record.submitFields({
                                type: 'inventoryitem',
                                id: iteminternalId,
                                values: {
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        }
                    } else if (runTotal == compValue[compRunValue]) {
                        runTotal = 0;
                        if (lotItem == true) {
                            var lotItem = record.submitFields({
                                type: 'lotnumberedinventoryitem',
                                id: iteminternalId,
                                values: {
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
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
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            var invItem = record.submitFields({
                                type: 'inventoryitem',
                                id: iteminternalId,
                                values: {
                                    'custitem_da_item_grade': gradeValue[gradeRunValue]
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        }
                        if(compRunValue < 2){
                            compRunValue = parseFloat(compRunValue) + parseFloat(1);
                        }
                        if(gradeRunValue < 2){
                            gradeRunValue = parseFloat(gradeRunValue) + parseFloat(1);
                        }
                        //compValue[0] = compValue[compRunValue];
                        //gradeValue[gradeRunValue] = gradeValue[gradeRunValue];
                        

                    } else {
                        runTotal = itemAmount;
                        log.debug('else runTotal', runTotal);
                        if(compRunValue < 2){
                            compRunValue = parseFloat(compRunValue) + parseFloat(1);
                        }
                        if(gradeRunValue < 2){
                            gradeRunValue = parseFloat(gradeRunValue) + parseFloat(1);
                        }
                        log.debug('gradeRunValue greater than else part', gradeRunValue);
                        // compValue[0] = compValue[compRunValue];
                        // gradeValue[gradeRunValue] = gradeValue[gradeRunValue];
                        log.debug('compValue', compValue[compRunValue]);
                        log.debug('gradeValue', gradeValue[gradeRunValue]);
                        if ((runTotal <= compValue[compRunValue])) {
                            if (lotItem == true) {
                                var lotItem = record.submitFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
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
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else {
                                var invItem = record.submitFields({
                                    type: 'inventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                        } else {

                            //gradeValue[gradeRunValue] = gradeValue[gradeRunValue] - 1;
                            gradeRunValue = parseFloat(gradeRunValue) - parseFloat(1);
                            log.debug('gradeRunValue greater than else else part', gradeRunValue);
                            log.debug('gradeValue greater than else else part', gradeValue[gradeRunValue]);
                            if (lotItem == true) {
                                var lotItem = record.submitFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
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
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            } else {
                                var invItem = record.submitFields({
                                    type: 'inventoryitem',
                                    id: iteminternalId,
                                    values: {
                                        'custitem_da_item_grade': gradeValue[gradeRunValue]
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });
                            }
                            runTotal = 0;
                            if(gradeRunValue < 2){
                                gradeRunValue = parseFloat(gradeRunValue) + parseFloat(1);
                            }
                            
                        }
                    }
                    return true;
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