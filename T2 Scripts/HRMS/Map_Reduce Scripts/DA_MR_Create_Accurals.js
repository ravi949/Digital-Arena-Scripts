/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/https', 'N/record', 'N/runtime', 'N/url', 'N/search'],
    function(https, record, runtime, url, search) {
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
                    type: "customrecord_da_accruals",
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({
                            name: "internalid",
                            label: "Id"
                        }),
                        search.createColumn({
                            name: "custrecord_da_accruals_subsidiary",
                            label: "Works For (Subsidiary)"
                        }),
                        search.createColumn({
                            name: "custrecord_da_accruals_item_category",
                            label: "Item Category"
                        }),
                        search.createColumn({
                            name: "custrecord_da_acc_main_category",
                            label: "Main Category"
                        })
                    ]
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
                var month = (new Date("06/01/2020").getMonth());
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
                var year = new Date("06/01/2020").getFullYear();
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
                if (postingPeriodId) {
                    var searchResult = JSON.parse(context.value);
                    var values = searchResult.values;
                    //log.debug('values', values);
                    // var empId = searchResult.values["GROUP(custrecord_da_pay_run_employee)"]["value"];
                    //log.debug('EMpID',empId);
                    var accuralId = values.internalid.value;
                    //log.debug('accuralId', accuralId);
                    var workingSubsidairy = values.custrecord_da_accruals_subsidiary.value;
                    //log.debug('workingSubsidairy', workingSubsidairy);
                    var categoryId = values.custrecord_da_acc_main_category.value;
                    var keyArr = [];
                    keyArr.push(categoryId, accuralId, postingPeriodId);
                    if (categoryId == 42) {
                        var customrecord_da_indemnity_reportSearchObj = search.create({
                            type: "customrecord_da_indemnity_report",
                            filters: [
                                ["custrecord_da_ind_emp_subsidairy", "anyof", workingSubsidairy],
                                "AND",
                                ["custrecord_da_ind_type", "anyof", "1"],
                                "AND",
                                ["custrecord_da_indemnity_month", "anyof", postingPeriodId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    sort: search.Sort.ASC,
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_ind_type",
                                    label: "Type"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_indemnity_reportSearchObj.runPaged().count;
                        // log.debug("customrecord_da_indemnity_reportSearchObj result count", searchResultCount);
                        customrecord_da_indemnity_reportSearchObj.run().each(function(result) {
                            context.write({
                                key: keyArr,
                                value: result.id
                            });
                            return true;
                        });
                    }

                    if (categoryId == 43) {
                       var customrecord_leaves_accural_reportSearchObj = search.create({
                           type: "customrecord_leaves_accural_report",
                           filters:
                           [
                              ["custrecord_da_emp_leave_acc_subsidairy","anyof",workingSubsidairy], 
                              "AND", 
                              ["custrecord_da_leave_accruals_month","anyof",postingPeriodId]
                           ],
                           columns:
                           [
                              search.createColumn({name: "internalid", label: "Internal ID"})
                           ]
                        });                        
                        customrecord_leaves_accural_reportSearchObj.run().each(function(result) {
                            context.write({
                                key: keyArr,
                                value: result.id
                            });
                            return true;
                        });
                    }
                }
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
                //log.debug('reduce', context);
                var keyValues = JSON.parse(context.key);
                var categoryId = keyValues[0];
                var accuralId = keyValues[1];
                var postingPeriodId = keyValues[2];
                log.debug('details', categoryId + " accuralId" + accuralId);
                var recIds = (context.values);
                log.debug('recIds', recIds);
                var accuralRec = record.load({
                    type: 'customrecord_da_accruals',
                    id: accuralId
                });
                var Subsidiary = accuralRec.getValue('custrecord_da_accruals_subsidiary');
                var expenseAccount = accuralRec.getValue('custrecord_da_accruals_account');
                var liablityAccount = accuralRec.getValue('custrecord_da_income_account');
                var payrollItemId = accuralRec.getValue('custrecord_da_accruals_item_category');
                if (categoryId == 42) {
                    log.debug('cate');
                    for (var i = 0; i < recIds.length; i++) {
                        log.debug('id', recIds[i]);

                        var indemnityRec = record.load({
                            type: 'customrecord_da_indemnity_report',
                            id: recIds[i]
                        });
                        var employeeId = indemnityRec.getValue('custrecord_da_ind_employee');
                        var Subsidiary = indemnityRec.getValue('custrecord_da_ind_emp_subsidairy');
                        var department = indemnityRec.getValue('custrecord_da_empl_ind_acc_dept');
                        var empClass = indemnityRec.getValue('custrecord_da_ind_acc_emp_class');
                        var location = indemnityRec.getValue('custrecord_da_ind_acc_emp_location');

                        var additionalAmount = Number(indemnityRec.getValue('custrecord_da_ind_adding_amount')).toFixed(2);

                        var date = new Date();
                        date.setDate(date.getDate() - 1);

                        var accuralJournalRec = record.create({
                            type: "customtransaction_da_accruals_journal",
                            isDynamic: true
                        });
                        accuralJournalRec.setValue('subsidiary', Subsidiary);
                        accuralJournalRec.setValue('custbody_da_ic_paycheck_employee', employeeId);
                        accuralJournalRec.setValue('custbody_da_accruals_sheet', payrollItemId);
                        accuralJournalRec.setValue('department',department);
                        accuralJournalRec.setValue('class',empClass);
                        accuralJournalRec.setValue('location',location);
                        accuralJournalRec.setValue('trandate', date);
                        //accuralJournalRec.setValue('postingperiod', pperiod);
                        accuralJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: expenseAccount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: additionalAmount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: "Indemnity Accural Amount"
                        });
                        accuralJournalRec.commitLine({
                            sublistId: 'line'
                        });
                        //credit
                        accuralJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: liablityAccount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: additionalAmount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: "Indemnity Accural Amount"
                        });
                        accuralJournalRec.commitLine({
                            sublistId: 'line'
                        });

                        var accuralJournalId = accuralJournalRec.save();
                        log.debug('accuralJournalId',accuralJournalId);
                    }
                }

                //leave Accurals

                if (categoryId == 43) {
                    log.debug('cate');
                    for (var i = 0; i < recIds.length; i++) {
                        log.debug('id', recIds[i]);

                        var leaveAccRec = record.load({
                            type: 'customrecord_leaves_accural_report',
                            id: recIds[i]
                        });
                        var employeeId = leaveAccRec.getValue('custrecord_da_leave_accruals_employee');
                        var Subsidiary = leaveAccRec.getValue('custrecord_da_emp_leave_acc_subsidairy');
                        var department = leaveAccRec.getValue('custrecord_da_leave_acc_emp_dept');
                        var empClass = leaveAccRec.getValue('custrecord_da_leav_acc_emp_class');
                        var location = leaveAccRec.getValue('custrecord_da_emp_leave_acc_location');

                        var additionalAmount = Number(leaveAccRec.getValue('custrecord_da_leave_acc_additional_amoun')).toFixed(2);

                        var date = new Date();
                        date.setDate(date.getDate() - 1);

                        var accuralJournalRec = record.create({
                            type: "customtransaction_da_accruals_journal",
                            isDynamic: true
                        });
                        accuralJournalRec.setValue('subsidiary', Subsidiary);
                        accuralJournalRec.setValue('custbody_da_ic_paycheck_employee', employeeId);
                        accuralJournalRec.setValue('custbody_da_accruals_sheet', payrollItemId);
                        accuralJournalRec.setValue('department',department);
                        accuralJournalRec.setValue('class',empClass);
                        accuralJournalRec.setValue('location',location);
                        accuralJournalRec.setValue('trandate', date);
                        //accuralJournalRec.setValue('postingperiod', pperiod);
                        accuralJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: expenseAccount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: additionalAmount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: "Indemnity Accural Amount"
                        });
                        accuralJournalRec.commitLine({
                            sublistId: 'line'
                        });
                        //credit
                        accuralJournalRec.selectNewLine({
                            sublistId: 'line'
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: liablityAccount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: additionalAmount
                        });
                        accuralJournalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: "Indemnity Accural Amount"
                        });
                        accuralJournalRec.commitLine({
                            sublistId: 'line'
                        });

                        var accuralJournalId = accuralJournalRec.save();
                        log.debug('accuralJournalId',accuralJournalId);
                    }
                }
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