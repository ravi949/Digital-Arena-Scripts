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
                var recID = recordId.value.id;
                log.debug('recID',recID);
                var eclSettingsRec = record.load({
                    type: 'customrecord_da_ecl_setting',
                    id: recID
                });
                var customerCategory = eclSettingsRec.getValue('custrecord_da_ecl_category');
                log.debug('customerCategory',customerCategory);
                var subsidiaryId = eclSettingsRec.getValue('custrecord_da_ecl_subsidiary');
                log.debug('subsidiaryId',subsidiaryId);


                var eclAgingPercentSearch = search.create({
                        type: "customrecord_da_ecl_aging_percentage",
                        filters:
                            [
                                ["custrecord_da_ecl_per_customer_category",'anyof',customerCategory]
                                ],
                        columns:
                                    [   
                                        search.createColumn({
                                            name: "custrecord_da_cur_aging_bucket_percent",
                                            label: "Not Due"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_1_3_months_percentage",
                                            label: "month1_3"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_4_6_months_againg_percent",
                                            label: "month4_6"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_7_12_aging_bucket_perecent",
                                            label: "month7_12"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_13_24_aging_bucket_percent",
                                            label: "month13_24"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_25_36_aging_bucket_percent",
                                            label: "month25_36"
                                        })
                                        ]
                    });
                    var count = eclAgingPercentSearch.runPaged().count;
                    log.debug('count',count);
                    var notDue, month1_3, month4_6, month7_12, month13_24, month25_36;
                    var notDueSum = 0, month1_3Sum = 0, month4_6Sum = 0, month7_12Sum = 0, month13_24Sum = 0, month25_36Sum = 0;
                    eclAgingPercentSearch.run().each(function(result) {
                        notDue = result.getValue({
                            name: 'custrecord_da_cur_aging_bucket_percent'
                        });
                        log.debug('notDue',notDue);
                        month1_3 = result.getValue({
                            name: 'custrecord_da_1_3_months_percentage'
                        });
                        log.debug('month1_3',month1_3);
                        month4_6 = result.getValue({
                            name: 'custrecord_da_4_6_months_againg_percent'
                        });
                        log.debug('month4_6',month4_6);
                        month7_12 = result.getValue({
                            name: 'custrecord_da_7_12_aging_bucket_perecent'
                        });
                        log.debug('month7_12',month7_12);
                        month13_24 = result.getValue({
                            name: 'custrecord_da_13_24_aging_bucket_percent'
                        });
                        log.debug('month13_24',month13_24);
                        month25_36 = result.getValue({
                            name: 'custrecord_da_25_36_aging_bucket_percent'
                        });
                        log.debug('month25_36',month25_36);

                        notDueSum = parseFloat(notDueSum) + parseFloat(notDue);
                        log.debug('notDueSum',notDueSum);
                        month1_3Sum = parseFloat(month1_3Sum) + parseFloat(month1_3);
                        log.debug('month1_3Sum',month1_3Sum);
                        month4_6Sum = parseFloat(month4_6Sum) + parseFloat(month4_6);
                        log.debug('month4_6Sum',month4_6Sum);
                        month7_12Sum = parseFloat(month7_12Sum) + parseFloat(month7_12);
                        log.debug('month7_12Sum',month7_12Sum);
                        month13_24Sum = parseFloat(month13_24Sum) + parseFloat(month13_24);
                        log.debug('month13_24Sum',month13_24Sum);
                        month25_36Sum = parseFloat(month25_36Sum) + parseFloat(month25_36);
                        log.debug('month25_36Sum',month25_36Sum);
                        return true;
                    });
                    notDueSum = parseFloat(notDueSum) / count;
                    notDueSum = notDueSum.toFixed(0);
                    month1_3Sum = parseFloat(month1_3Sum) / count;
                    month1_3Sum = month1_3Sum.toFixed(0);
                    month4_6Sum = parseFloat(month4_6Sum) / count;
                    month4_6Sum = month4_6Sum.toFixed(0);
                    month7_12Sum = parseFloat(month7_12Sum) / count;
                    month7_12Sum = month7_12Sum.toFixed(0);
                    month13_24Sum = parseFloat(month13_24Sum) / count;
                    month13_24Sum = month13_24Sum.toFixed(0);
                    month25_36Sum = parseFloat(month25_36Sum) /count;
                    month25_36Sum = month25_36Sum.toFixed(0);
                    var eclAvgFlowRateSearch = search.create({
                        type: "customrecord_da_ecl_average_flow_rate"
                    });
                    var eclAvgFlowRateSearchCount = eclAvgFlowRateSearch.runPaged().count;
                    log.debug('eclAvgFlowRateSearchCount',eclAvgFlowRateSearchCount);
                    if(!eclAvgFlowRateSearchCount){
                        var eclAvgFlowRateRec = record.create({
                            type: 'customrecord_da_ecl_average_flow_rate',
                            isDynamic: true
                        });
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_customer_category',customerCategory);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_subsidiary',subsidiaryId);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_not_due_percent',notDueSum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_1_3_month_pcent',month1_3Sum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_4_6_month_pcent',month4_6Sum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_7_12_month_pcent',month7_12Sum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_13_24_month_pcent',month13_24Sum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_25_36_month_pcent',month25_36Sum);
                        eclAvgFlowRateRec.setValue('custrecord_da_ecl_avg_abv_36_month_pcent',100);

                        var eclAvgFlowRateRecId = eclAvgFlowRateRec.save();
                        log.debug('eclAvgFlowRateRecId',eclAvgFlowRateRecId);
                    } else if(eclAvgFlowRateSearchCount > 0){
                        var recId;
                        eclAvgFlowRateSearch.run().each(function(result) {
                        recId = result.id;
                        log.debug('recId',recId);
                        });
                        var eclAvgFlowRateRecord = record.load({
                            type: 'customrecord_da_ecl_average_flow_rate',
                            id: recId,
                            isDynamic: true
                        });
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_customer_category',customerCategory);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_subsidiary',subsidiaryId);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_not_due_percent',notDueSum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_1_3_month_pcent',month1_3Sum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_4_6_month_pcent',month4_6Sum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_7_12_month_pcent',month7_12Sum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_13_24_month_pcent',month13_24Sum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_25_36_month_pcent',month25_36Sum);
                        eclAvgFlowRateRecord.setValue('custrecord_da_ecl_avg_abv_36_month_pcent',100);

                        var eclAvgFlowRateRecordId = eclAvgFlowRateRecord.save();
                        log.debug('eclAvgFlowRateRecordId',eclAvgFlowRateRecordId);
                    }

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