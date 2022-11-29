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
                log.debug('recId',recId);
                var eclSettingsRec = record.load({
                    type: 'customrecord_da_ecl_setting',
                    id: recId
                });
                var customerCategory = eclSettingsRec.getValue('custrecord_da_ecl_category');
                log.debug('customerCategory',customerCategory);
                var subsidiaryId = eclSettingsRec.getValue('custrecord_da_ecl_subsidiary');
                log.debug('subsidiaryId',subsidiaryId);
                


                var currentDate = new Date();
                    var month = currentDate.getMonth()+1;
                    log.debug('month',month);
                    var year = currentDate.getFullYear();
                    log.debug('year',year);
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
                            '12': 'Dec'
                    }
                    
                        var postingperiodMonth = monthsobj[month];
                    //log.debug(month, postingperiodMonth);
                    if(month == 0 || month == "0"){
                        year = year - 1;
                        postingperiodMonth ="Dec";
                    }
                    log.debug('postingperiodMonth',postingperiodMonth +" "+year);

                    var accountingperiodSearchObj = search.create({
                        type: "accountingperiod",
                        filters:
                            [
                                ["periodname","startswith",postingperiodMonth +" "+year]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "periodname",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        })
                                        ]
                    });
                    var searchResultCount = accountingperiodSearchObj.runPaged().count;
                    log.debug("accountingperiodSearchObj result count",searchResultCount);
                    var postingPeriodId ;
                    accountingperiodSearchObj.run().each(function(result){
                        postingPeriodId = result.id;
                        return true;
                    });
                    log.debug('postingPeriodId',postingPeriodId);
                    var customrecord_da_ecl_againgSearchObj = search.create({
                        type: "customrecord_da_ecl_againg",
                        filters:
                            [
                                ["custrecord_da_ecl_period",'anyof',postingPeriodId], "AND", ["custrecord_da_ecl_customer_category",'anyof',customerCategory]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "created",
                                            sort: search.Sort.DESC,
                                            label: "Date Created"
                                        }),
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Internal Id"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_period",
                                            label: "Posting Period"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_aging_bucket",
                                            label: "Not Due"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_1_3_months_bucket",
                                            label: "1_3 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_4_6_months_bucket",
                                            label: "4_6 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_7_12_months_bucket",
                                            label: "7_12 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_13_24_months_bucket",
                                            label: "13_24 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_25_36_months_bucket",
                                            label: "25_36 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_36_months_bucket",
                                            label: "36 Months Above"
                                        })
                                        ]
                    });
                    var searchCount = customrecord_da_ecl_againgSearchObj.runPaged().count;
                    log.debug("customrecord_da_ecl_againgSearchObj result count",searchCount);
                    var internalID, postingPeriod, notDue, Months1_3, Months4_6, Months7_12, Months13_24, Months25_36, above36Months;
                    customrecord_da_ecl_againgSearchObj.run().each(function(result){
                        internalID = result.getValue("internalid");
                        log.debug('internalID',internalID);
                        postingPeriod = result.getValue("custrecord_da_ecl_period");
                        log.debug('postingPeriod',postingPeriod);
                        notDue = result.getValue("custrecord_da_ecl_aging_bucket");
                        log.debug('notDue',notDue);
                        Months1_3 = result.getValue("custrecord_da_ecl_1_3_months_bucket");
                        log.debug('Months1_3',Months1_3);
                        Months4_6 = result.getValue("custrecord_da_ecl_4_6_months_bucket");
                        log.debug('Months4_6',Months4_6);
                        Months7_12 = result.getValue("custrecord_da_ecl_7_12_months_bucket");
                        log.debug('Months7_12',Months7_12);
                        Months13_24 = result.getValue("custrecord_da_ecl_13_24_months_bucket");
                        log.debug('Months13_24',Months13_24);
                        Months25_36  = result.getValue("custrecord_da_ecl_25_36_months_bucket");
                        log.debug('Months25_36',Months25_36);
                        above36Months  = result.getValue("custrecord_da_ecl_36_months_bucket");
                        log.debug('above36Months',above36Months);
                        });
                    var currentDate1 = new Date();
                    var month1 = currentDate1.getMonth();
                    log.debug('month1',month1);
                    var year1 = currentDate1.getFullYear();
                    log.debug('year1',year1);
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
                            '12': 'Dec'
                    }
                    
                        var postingperiodMonth1 = monthsobj[month1];
                    //log.debug(month, postingperiodMonth);
                    if(month1 == 0 || month1 == "0"){
                        year1 = year1 - 1;
                        postingperiodMonth1 ="Dec";
                    }
                    log.debug('postingperiodMonth1',postingperiodMonth1 +" "+year1);

                    var accountingperiodSearchObj1 = search.create({
                        type: "accountingperiod",
                        filters:
                            [
                                ["periodname","startswith",postingperiodMonth1 +" "+year1]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "periodname",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        })
                                        ]
                    });
                    var searchResultCount1 = accountingperiodSearchObj1.runPaged().count;
                    log.debug("accountingperiodSearchObj1 result count",searchResultCount1);
                    var postingPeriodId1 ;
                    accountingperiodSearchObj1.run().each(function(result){
                        postingPeriodId1 = result.id;
                        return true;
                    });
                    log.debug('postingPeriodId1',postingPeriodId1);
                    var customrecord_da_ecl_againgSearchObj1 = search.create({
                        type: "customrecord_da_ecl_againg",
                        filters:
                            [
                                ["custrecord_da_ecl_period",'anyof',postingPeriodId1], "AND", ["custrecord_da_ecl_customer_category",'anyof',customerCategory]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "created",
                                            sort: search.Sort.DESC,
                                            label: "Date Created"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_period",
                                            label: "Posting Period"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_aging_bucket",
                                            label: "Not Due"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_1_3_months_bucket",
                                            label: "1_3 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_4_6_months_bucket",
                                            label: "4_6 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_7_12_months_bucket",
                                            label: "7_12 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_13_24_months_bucket",
                                            label: "13_24 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_25_36_months_bucket",
                                            label: "25_36 Months"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_da_ecl_36_months_bucket",
                                            label: "36 Months Above"
                                        })
                                        ]
                    });
                    var searchCount1 = customrecord_da_ecl_againgSearchObj1.runPaged().count;
                    log.debug("customrecord_da_ecl_againgSearchObj1 result count",searchCount1);
                    var prevPostingPeriod, prevNotDue, prevMonths1_3, prevMonths4_6, prevMonths7_12, prevMonths13_24, prevMonths25_36, prevAbove36Months;
                    customrecord_da_ecl_againgSearchObj1.run().each(function(result){
                        prevPostingPeriod = result.getValue("custrecord_da_ecl_period");
                        log.debug('prevPostingPeriod',prevPostingPeriod);
                        prevNotDue = result.getValue("custrecord_da_ecl_aging_bucket");
                        log.debug('prevNotDue',prevNotDue);
                        prevMonths1_3 = result.getValue("custrecord_da_ecl_1_3_months_bucket");
                        log.debug('prevMonths1_3',prevMonths1_3);
                        prevMonths4_6 = result.getValue("custrecord_da_ecl_4_6_months_bucket");
                        log.debug('prevMonths4_6',prevMonths4_6);
                        prevMonths7_12 = result.getValue("custrecord_da_ecl_7_12_months_bucket");
                        log.debug('prevMonths7_12',prevMonths7_12);
                        prevMonths13_24 = result.getValue("custrecord_da_ecl_13_24_months_bucket");
                        log.debug('prevMonths13_24',prevMonths13_24);
                        prevMonths25_36  = result.getValue("custrecord_da_ecl_25_36_months_bucket");
                        log.debug('prevMonths25_36',prevMonths25_36);
                        prevAbove36Months  = result.getValue("custrecord_da_ecl_36_months_bucket");
                        log.debug('prevAbove36Months',prevAbove36Months);

                    }); 

                    var agingRec = record.load({
                        type: 'customrecord_da_ecl_againg',
                        id: internalID,
                        isDynamic: true
                    });
                    var overallPercentage = ((parseFloat(prevAbove36Months) + parseFloat(prevMonths25_36) - parseFloat(above36Months)) / (parseFloat(prevAbove36Months) + parseFloat(prevMonths25_36))) * 100;
                    log.debug('overallPercentage',overallPercentage);
                    overallPercentage = overallPercentage.toFixed(2);
                    agingRec.setValue('custrecord_da_ecl_overall_percentage',overallPercentage);
                    var agingRecId = agingRec.save();
                    log.debug('agingRecId',agingRecId);
                                           
                    var notDuePercent = parseFloat(Months1_3) / parseFloat(prevNotDue);
                    log.debug('notDuePercent',notDuePercent);
                    var months1_3Percent = parseFloat(Months4_6) / parseFloat(prevMonths1_3);
                    log.debug('months1_3Percent',months1_3Percent);
                    var months4_6Percent = parseFloat(Months7_12) / parseFloat(prevMonths4_6);
                    log.debug('months4_6Percent',months4_6Percent);
                    var months7_12Percent = parseFloat(Months13_24) / parseFloat(prevMonths7_12);
                    log.debug('months7_12Percent',months7_12Percent);
                    var months13_24Percent = parseFloat(Months25_36) / parseFloat(prevMonths13_24);
                    log.debug('months13_24Percent',months13_24Percent);
                    var months25_36Percent = parseFloat(above36Months) / parseFloat(prevMonths25_36);
                    log.debug('months25_36Percent',months25_36Percent);

                    var eclAgingPercentage = record.create({
                            type: 'customrecord_da_ecl_aging_percentage',
                            isDynamic: true
                        });
                        eclAgingPercentage.setValue('custrecord_da_ecl_per_customer_category',customerCategory);
                        eclAgingPercentage.setValue('custrecord_da_ecl_percentage_subsidiary',subsidiaryId);
                        eclAgingPercentage.setValue('custrecord_da_ecl_percentage_aging_perio',postingPeriod);
                        if(notDuePercent < 1){
                            notDuePercent = parseFloat(notDuePercent) * 100;
                            notDuePercent = notDuePercent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_cur_aging_bucket_percent',notDuePercent);
                        } else if(notDuePercent >= 1){
                            eclAgingPercentage.setValue('custrecord_da_cur_aging_bucket_percent','100');
                        }

                        if(months1_3Percent < 1){
                            months1_3Percent = parseFloat(months1_3Percent) * 100;
                            months1_3Percent = months1_3Percent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_1_3_months_percentage',months1_3Percent);
                        } else if(months1_3Percent >= 1){
                            eclAgingPercentage.setValue('custrecord_da_1_3_months_percentage','100');
                        }

                        if(months4_6Percent < 1){
                            months4_6Percent = parseFloat(months4_6Percent) * 100;
                            months4_6Percent = months4_6Percent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_4_6_months_againg_percent',months4_6Percent);
                        } else if(months4_6Percent > 1){
                            eclAgingPercentage.setValue('custrecord_da_4_6_months_againg_percent','100');
                        }

                        if(months7_12Percent < 1){
                            months7_12Percent = parseFloat(months7_12Percent) * 100;
                            months7_12Percent = months7_12Percent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_7_12_aging_bucket_perecent',months7_12Percent);
                        } else if(months7_12Percent >= 1){
                            eclAgingPercentage.setValue('custrecord_da_7_12_aging_bucket_perecent','100');
                        }
              			
              			log.debug('months13_24Percent', months13_24Percent);
                        if(months13_24Percent < 1){
                            months13_24Percent = parseFloat(months13_24Percent) * 100;
                            months13_24Percent = months13_24Percent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_13_24_aging_bucket_percent',months13_24Percent);
                        } else if(months13_24Percent >= 1){
                            eclAgingPercentage.setValue('custrecord_da_13_24_aging_bucket_percent','100');
                        }
                        if(months25_36Percent < 1){
                            months25_36Percent = parseFloat(months25_36Percent) * 100;
                            months25_36Percent = months25_36Percent.toFixed(0);
                            eclAgingPercentage.setValue('custrecord_da_25_36_aging_bucket_percent',months25_36Percent);
                        } else if(months25_36Percent >= 1){
                            eclAgingPercentage.setValue('custrecord_da_25_36_aging_bucket_percent','100');
                        }

                        var eclAgingPercentageId = eclAgingPercentage.save();
                        log.debug('eclAgingPercentageId',eclAgingPercentageId);
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