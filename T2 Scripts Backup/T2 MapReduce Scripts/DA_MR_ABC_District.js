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
                    ],
                   filters: [
                   //['internalid', 'anyof', '8']
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

                var customABCRecord = record.load({
                    type: 'customrecord_da_abc_grades',
                    id: 1,
                    isDynamic: true
                });

                var dateFrom = customABCRecord.getText('custrecord_da_rolling_period_start');
                var dateTo = customABCRecord.getText('custrecord_da_rolling_period_end');
                var divisionId = recordId.value.id;
                var currentDate = new Date();
                log.debug('currentDate1', currentDate);
                currentDate.setDate(currentDate.getDate() - 1);
                log.debug('currentDate2', currentDate);
                var year = currentDate.getFullYear();
                log.debug('year', year);
                var month = currentDate.getMonth();
                log.debug('month', month);
                var periodId = getId(month, year);
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
                        ['mainline', 'is', 'F'], 'and', ['type', 'anyof', 'CustInvc', 'CustCred'], 'and', ['custcol_da_item_type', 'anyof', '1'], 'and', ['item.cseg_da_items_devs', 'anyof', divisionId], 'and', ['trandate', 'within', dateFrom, dateTo]
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

                var percentA = customABCRecord.getValue('custrecord_da_percentage_a');
                log.debug('percentA',percentA);
                var percentB = customABCRecord.getValue('custrecord_da_percentage_b');
                log.debug('percentB',percentB);
                var percentC = customABCRecord.getValue('custrecord_da_percentage_c');
                log.debug('percentC',percentC);
                var percentD = customABCRecord.getValue('custrecord_da_percentage_d');
                percentD = (percentD) ? percentD : 0;
                log.debug('percentD',percentD);
                var gradeA = (percentA) / (100) * (totalAmount);
                log.debug('gradeA',gradeA);
                var gradeB = (percentB) / (100) * (totalAmount);
                log.debug('gradeB',gradeB);
                var gradeC = (percentC) / (100) * (totalAmount);
                log.debug('gradeC',gradeC);
                var gradeD = (percentD) / (100) * (totalAmount);
                log.debug('gradeC',gradeD);

                var runTotal = 0;
                var compRunValue = 0;
                var gradeRunValue = 0;
                var iteminternalId;
                var compValue = [gradeA, gradeB, gradeC, gradeD];
                log.debug('compValue length',compValue.length);
                var gradeValue = [1, 2, 3, 4];
                log.debug('gradeValue length',gradeValue.length);
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
                        if(compRunValue < 3){
                            compRunValue = parseFloat(compRunValue) + parseFloat(1);
                        }
                        if(gradeRunValue < 3){
                            gradeRunValue = parseFloat(gradeRunValue) + parseFloat(1);
                        }
                        //compValue[0] = compValue[compRunValue];
                        //gradeValue[gradeRunValue] = gradeValue[gradeRunValue];


                    } else {
                        runTotal = itemAmount;
                        log.debug('else runTotal', runTotal);
                        if(compRunValue < 3){
                            compRunValue = parseFloat(compRunValue) + parseFloat(1);
                        }
                        if(gradeRunValue < 3){
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
                            if(gradeRunValue < 3){
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
        function getId(month, year) {
            var monthObj = {
                00: 'Jan',
                01: 'Feb',
                02: 'Mar',
                03: 'Apr',
                04: 'May',
                05: 'Jun',
                06: 'Jul',
                07: 'Aug',
                08: 'Sep',
                09: 'Oct',
                10: 'Nov',
                11: 'Dec',
            };

            var monthId = monthObj[month];
            var year;
            var sample = search.create({
                type: search.Type.ACCOUNTING_PERIOD,
                filters: [
                    ['periodname', 'is', monthId + ' ' + year]
                ]

            });

            var id;
            sample.run().each(function(result) {
                id = result.id;
                //return true;
            });
            log.debug('po_period', id);
            return id;
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
