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
                return search.create({
                    type: "customrecord_da_ecl_setting",
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
                var recId = recordId.value.id;
                log.debug('recId', recId);
                var eclSettingsRec = record.load({
                    type: 'customrecord_da_ecl_setting',
                    id: recId
                });
                var customerCategory = eclSettingsRec.getValue('custrecord_da_ecl_category');
                log.debug('customerCategory', customerCategory);
                var subsidiaryId = eclSettingsRec.getValue('custrecord_da_ecl_subsidiary');
                log.debug('subsidiaryId', subsidiaryId);
                var savedSearchId = eclSettingsRec.getValue('custrecord_da_ecl_ar_aging');
                log.debug('savedSearchId', savedSearchId);

                var month = (new Date().getMonth() + 1);
                log.debug('month', month);
                var monthsobj = {
                    '1': 'Jan',
                    '2': 'Feb',
                    '3': 'Mar',
                    '4': 'Apr',
                    '5': 'May',
                    '6': 'Jun',
                    '7': 'Jul',
                    '8': 'Aug',
                    '9': 'Sep',
                    '10': 'Oct',
                    '11': 'Nov',
                    '0': 'Dec'
                }
                var postingperiodMonth = monthsobj[month];
                var year = new Date().getFullYear();
                if (month == 0 || month == "0") {
                    year = year - 1;
                }
                log.debug('postingperiodMonth', postingperiodMonth + " " + year);
                var accountingperiodSearchObj = search.create({
                    type: "accountingperiod",
                    filters: [
                        ["periodname", "startswith", postingperiodMonth + " " + year]
                    ],
                    columns: [
                        search.createColumn({
                            name: "periodname",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
                });
                var searchResultCount = accountingperiodSearchObj.runPaged().count;
                log.debug("accountingperiodSearchObj result count", searchResultCount);
                var postingPeriodId;
                accountingperiodSearchObj.run().each(function(result) {
                    postingPeriodId = result.id;
                    return true;
                });
                log.debug('postingPeriodId', postingPeriodId);

                var eclAgingRecSearch = search.create({
                    type: "customrecord_da_ecl_againg",
                    filters: [
                        ["custrecord_da_ecl_period", "anyof", postingPeriodId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = eclAgingRecSearch.runPaged().count;
                log.debug("eclAgingRecSearch result count", searchResultCount);
                eclAgingRecSearch.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_ecl_againg',
                        id: result.id
                    })
                    return true;
                });

                var agingSearch = search.create({
                    type: "transaction",
                    filters: [
                        ["type", "anyof", "CustInvc"], "AND", ["mainline", "is", true], "AND", ["status", "anyof", "CustInvc:A"], "AND", ["custtype", "anyof", customerCategory], "AND", ["postingperiod", "anyof", postingPeriodId]
                    ],

                    columns: [
                        search.createColumn({
                            name: "postingperiod",
                            summary: search.Summary.GROUP
                        }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) < 1 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) < 1 then {amountremaining} else 0 end ",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric1",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) <90 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) < 90 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric2",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 91 and 180 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 91 and 180 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric3",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 181 and 270 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 181 and 270 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric4",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 271 and 360 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 271 and 360 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric5",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 361 and 450 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) between 361 and 450 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        }),
                        search.createColumn({
                            name: "formulanumeric6",
                            formula: "Case When substr({amount},1,1) = '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) >451 then ({amountremaining}*-1) When substr({amount},1,1) <> '-' and (NVL({daysoverdue}, Round({today}-{trandate}, 0))) >451 then {amountremaining} else 0 end",
                            summary: search.Summary.SUM
                        })
                    ]
                });

                var agingSearchCount = agingSearch.runPaged().count;
                log.debug('agingSearchCount', agingSearchCount);
                agingSearch.run().each(function(result) {
                    var poPeriod = result.getValue({
                        name: "postingperiod",
                        summary: search.Summary.GROUP
                    });
                    log.debug('poPeriod', poPeriod);
                    var current = result.getValue({
                        name: "formulanumeric",
                        summary: search.Summary.SUM
                    });
                    log.debug('current', current);
                    var months_1to3 = result.getValue({
                        name: "formulanumeric1",
                        summary: search.Summary.SUM
                    });
                    log.debug('months_1to3', months_1to3);
                    var months_4to6 = result.getValue({
                        name: "formulanumeric2",
                        summary: search.Summary.SUM
                    });
                    log.debug('months_4to6', months_4to6);
                    var months_7to12 = result.getValue({
                        name: "formulanumeric3",
                        summary: search.Summary.SUM
                    });
                    log.debug('months_7to12', months_7to12);
                    var months_13to24 = result.getValue({
                        name: "formulanumeric4",
                        summary: search.Summary.SUM
                    });
                    log.debug('months_13to24', months_13to24);
                    var months_25to36 = result.getValue({
                        name: "formulanumeric5",
                        summary: search.Summary.SUM
                    });
                    log.debug('months_25to36', months_25to36);
                    var above_36 = result.getValue({
                        name: "formulanumeric6",
                        summary: search.Summary.SUM
                    });
                    log.debug('above_36', above_36);

                    var eclAgingRec = record.create({
                        type: 'customrecord_da_ecl_againg',
                        isDynamic: true
                    });

                    eclAgingRec.setValue('custrecord_da_ecl_customer_category', customerCategory);
                    eclAgingRec.setValue('custrecord_da_ecl_aging_subsidiary', subsidiaryId);
                    eclAgingRec.setValue('custrecord_da_ecl_period', poPeriod);
                    eclAgingRec.setValue('custrecord_da_ecl_aging_bucket', current);
                    eclAgingRec.setValue('custrecord_da_ecl_1_3_months_bucket', months_1to3);
                    eclAgingRec.setValue('custrecord_da_ecl_4_6_months_bucket', months_4to6);
                    eclAgingRec.setValue('custrecord_da_ecl_7_12_months_bucket', months_7to12);
                    eclAgingRec.setValue('custrecord_da_ecl_13_24_months_bucket', months_13to24);
                    eclAgingRec.setValue('custrecord_da_ecl_25_36_months_bucket', months_25to36);
                    eclAgingRec.setValue('custrecord_da_ecl_36_months_bucket', above_36);

                    var eclAgingRecId = eclAgingRec.save();
                    log.debug('eclAgingRecId', eclAgingRecId);

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