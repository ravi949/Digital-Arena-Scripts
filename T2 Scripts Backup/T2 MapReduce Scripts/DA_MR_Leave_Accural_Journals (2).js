/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/https', 'N/record', 'N/runtime', 'N/url', 'N/search', 'N/format'],
    function(https, record, runtime, url, search, format) {
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
                /* var month = (new Date().getMonth());
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
                 log.debug('postingPeriodId', postingPeriodId);*/
                var scriptObjPeriod = runtime.getCurrentScript();
                var postingPeriod = scriptObjPeriod.getParameter({
                    name: 'custscript_da_leave_posting_period'
                });
                log.debug('postingPeriod', postingPeriod);
                return search.create({
                    type: "customrecord_leaves_accural_report",
                    filters: [
                        ["custrecord_da_leave_accruals_month", "anyof", postingPeriod]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custrecord_da_emp_leave_acc_subsidairy",
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
                var subsidiaryId = values.custrecord_da_emp_leave_acc_subsidairy.value;
                var keyArr = [];
                var accuralId;
                var customrecord_da_accrualsSearchObj = search.create({
                    type: "customrecord_da_accruals",
                    filters: [
                        ["custrecord_da_acc_main_category", "anyof", "2"], "AND", ["custrecord_da_accruals_subsidiary", "anyof", subsidiaryId]
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
                var leaveAccRecId = keyValues[0];
                var accuralId = keyValues[1];
                log.debug('details', leaveAccRecId + " accuralId" + accuralId);
                var accuralRec = record.load({
                    type: 'customrecord_da_accruals',
                    id: accuralId
                });
                var Subsidiary = accuralRec.getValue('custrecord_da_accruals_subsidiary');
                var expenseAccount = accuralRec.getValue('custrecord_da_accruals_account');
                var liablityAccount = accuralRec.getValue('custrecord_da_income_account');
                var payrollItemId = accuralRec.getValue('custrecord_da_accruals_item_category');
                var leaveAccRec = record.load({
                    type: 'customrecord_leaves_accural_report',
                    id: leaveAccRecId
                });
                var employeeId = leaveAccRec.getValue('custrecord_da_leave_accruals_employee');
                var employeeName = leaveAccRec.getText('custrecord_da_leave_accruals_employee');
                var Subsidiary = leaveAccRec.getValue('custrecord_da_emp_leave_acc_subsidairy');
                var department = leaveAccRec.getValue('custrecord_da_leave_acc_emp_dept');
                var empClass = leaveAccRec.getValue('custrecord_da_leav_acc_emp_class');
                var location = leaveAccRec.getValue('custrecord_da_emp_leave_acc_location');
                var additionalAmount = Number(leaveAccRec.getValue('custrecord_da_leave_acc_additional_amoun')).toFixed(2);
                var scriptObjDate = runtime.getCurrentScript();
                var dateObj = scriptObjDate.getParameter({
                    name: 'custscript_da_leave_accrual_date'
                });
                log.debug('dateObj', dateObj);
                var parsedDate = format.parse({
                    value: dateObj,
                    type: format.Type.DATE
                });
                log.debug('parsedDate', parsedDate);
                var date = new Date(parsedDate);
                log.debug('date', date);
                date.setDate(date.getDate() - 1);
                var empRec = record.load({
                    type: 'employee',
                    id: employeeId
                });
                var workForSubsidiary = empRec.getValue('subsidiary');
                log.debug('workForSubsidiary',workForSubsidiary);
                var primarySubsidiary = empRec.getValue('custentity_da_work_for_subsidiary');
                log.debug('primarySubsidiary',primarySubsidiary);
                if(workForSubsidiary == primarySubsidiary){
                    var accuralJournalRec = record.create({
                    type: "customtransaction_da_accruals_journal",
                    isDynamic: true
                });
                accuralJournalRec.setValue('subsidiary', Subsidiary);
                accuralJournalRec.setValue('custbody_da_ic_paycheck_employee', employeeId);
                accuralJournalRec.setValue('custbody_da_accruals_sheet', payrollItemId);
                accuralJournalRec.setValue('department', department);
                accuralJournalRec.setValue('class', empClass);
                accuralJournalRec.setValue('location', location);
                accuralJournalRec.setValue('transtatus', "B");
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
                    value: "Leave Accural Amount" + employeeName
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
                    value: "Leave Accural Amount" + employeeName
                });
                accuralJournalRec.commitLine({
                    sublistId: 'line'
                });
                 var accuralJournalId = accuralJournalRec.save();
                log.debug('accuralJournalId', accuralJournalId);
            } else {
                var generalSettingsRec = search.create({
                    type: "customrecord_da_general_settings",
                    filters: [
                    ['custrecord_da_settings_subsidiary', 'anyof', workForSubsidiary]
                    ],
                    columns: [
                    'custrecord_da_intercompany_account_payab', 'custrecord_da_intercompany_account_recei'
                    ]
                });
                var searchResultCount = generalSettingsRec.runPaged().count;
                log.debug("generalSettingsRec result count", searchResultCount);
                generalSettingsRec.run().each(function(result) {
                    var interCompanyRecAcc = result.getValue('custrecord_da_intercompany_account_payab');
                    log.debug('interCompanyRecAcc',interCompanyRecAcc);
                    var interCompanyPayAcc = result.getValue('custrecord_da_intercompany_account_payab');
                    log.debug('interCompanyPayAcc',interCompanyPayAcc);

                var accuralJournalRec1 = record.create({
                    type: "customtransaction_da_accruals_journal",
                    isDynamic: true
                });
                accuralJournalRec1.setValue('subsidiary', primarySubsidiary);
                accuralJournalRec1.setValue('custbody_da_ic_paycheck_employee', employeeId);
                accuralJournalRec1.setValue('custbody_da_accruals_sheet', payrollItemId);
                accuralJournalRec1.setValue('department', department);
                accuralJournalRec1.setValue('class', empClass);
                accuralJournalRec1.setValue('location', location);
                accuralJournalRec1.setValue('transtatus', "B");
                accuralJournalRec1.setValue('trandate', date);
                //accuralJournalRec1.setValue('postingperiod', pperiod);
                accuralJournalRec1.selectNewLine({
                    sublistId: 'line'
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: interCompanyRecAcc
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    value: additionalAmount
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: "Leave Accural Amount" + employeeName
                });
                accuralJournalRec1.commitLine({
                    sublistId: 'line'
                });
                //credit
                accuralJournalRec1.selectNewLine({
                    sublistId: 'line'
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: liablityAccount
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: additionalAmount
                });
                accuralJournalRec1.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: "Leave Accural Amount" + employeeName
                });
                accuralJournalRec1.commitLine({
                    sublistId: 'line'
                });
                var accuralJournalId1 = accuralJournalRec1.save();
                log.debug('accuralJournalId1', accuralJournalId1);
                var accuralJournalRec2 = record.create({
                    type: "customtransaction_da_accruals_journal",
                    isDynamic: true
                });
                accuralJournalRec2.setValue('subsidiary', workForSubsidiary);
                accuralJournalRec2.setValue('custbody_da_ic_paycheck_employee', employeeId);
                accuralJournalRec2.setValue('custbody_da_accruals_sheet', payrollItemId);
                accuralJournalRec2.setValue('department', department);
                accuralJournalRec2.setValue('class', empClass);
                accuralJournalRec2.setValue('location', location);
                accuralJournalRec2.setValue('transtatus', "B");
                accuralJournalRec2.setValue('trandate', date);
                //accuralJournalRec2.setValue('postingperiod', pperiod);
                accuralJournalRec2.selectNewLine({
                    sublistId: 'line'
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: expenseAccount
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    value: additionalAmount
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: "Leave Accural Amount" + employeeName
                });
                accuralJournalRec2.commitLine({
                    sublistId: 'line'
                });
                //credit
                accuralJournalRec2.selectNewLine({
                    sublistId: 'line'
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: interCompanyPayAcc
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: additionalAmount
                });
                accuralJournalRec2.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: "Leave Accural Amount" + employeeName
                });
                accuralJournalRec2.commitLine({
                    sublistId: 'line'
                });
                var accuralJournalId2 = accuralJournalRec2.save();
                log.debug('accuralJournalId2', accuralJournalId2);
                    return true;
                });
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
                var scriptObj = runtime.getCurrentScript();
                var recordId = scriptObj.getParameter({
                    name: 'custscript_da_leaves_record_id'
                });
                log.debug('recordId', recordId);
                var processRec = record.submitFields({
                    type: 'customrecord_da_leave_report_post_date',
                    id: recordId,
                    values: {
                        'custrecord_da_generate_journals': false
                    }
                });
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