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
                var month = (new Date().getMonth());
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
                return search.create({
                    type: "customrecord_da_indemnity_report",
                    filters: [
                        ["custrecord_da_indemnity_month", "anyof", postingPeriodId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_da_ind_emp_subsidairy",
                            label: "Subsidiary"
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
                var searchResult = JSON.parse(context.value);
                var values = searchResult.values;
                var indRecId = values.internalid.value;
                var subsidiaryId = values.custrecord_da_ind_emp_subsidairy.value;
                var keyArr = [];
                var accuralId;
                var customrecord_da_accrualsSearchObj = search.create({
                    type: "customrecord_da_accruals",
                    filters: [
                        ["custrecord_da_acc_main_category", "anyof", "14"],"AND",
                        ["custrecord_da_accruals_subsidiary", "anyof", subsidiaryId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_accrualsSearchObj.runPaged().count;
                log.debug("customrecord_da_accrualsSearchObj result count", searchResultCount);
                customrecord_da_accrualsSearchObj.run().each(function(result) {
                    // .run().each has a limit of 4,000 results
                    accuralId = result.id;
                    return true;
                });
                keyArr.push(indRecId, accuralId);
                context.write({
                    key: keyArr,
                    value: keyArr
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
                //log.debug('reduce', context);
                var keyValues = JSON.parse(context.key);
                var indRecId = keyValues[0];
                var accuralId = keyValues[1];
                log.debug('details', indRecId + " accuralId" + accuralId);
                var accuralRec = record.load({
                    type: 'customrecord_da_accruals',
                    id: accuralId
                });
                var Subsidiary = accuralRec.getValue('custrecord_da_accruals_subsidiary');
                var expenseAccount = accuralRec.getValue('custrecord_da_accruals_account');
                var liablityAccount = accuralRec.getValue('custrecord_da_income_account');
                var payrollItemId = accuralRec.getValue('custrecord_da_accruals_item_category');
                var indemnityRec = record.load({
                    type: 'customrecord_da_indemnity_report',
                    id: indRecId
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
                accuralJournalRec.setValue('transtatus', "B");
                accuralJournalRec.setValue('subsidiary', Subsidiary);
                accuralJournalRec.setValue('custbody_da_ic_paycheck_employee', employeeId);
                accuralJournalRec.setValue('custbody_da_accruals_sheet', payrollItemId);
                accuralJournalRec.setValue('department', department);
                accuralJournalRec.setValue('class', empClass);
                accuralJournalRec.setValue('location', location);
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
                accuralJournalRec.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: employeeId
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
                accuralJournalRec.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: employeeId
                });
                accuralJournalRec.commitLine({
                    sublistId: 'line'
                });
                var accuralJournalId = accuralJournalRec.save();
                log.debug('accuralJournalId', accuralJournalId);
                //leave Accurals
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