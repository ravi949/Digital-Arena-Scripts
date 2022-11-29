/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],

    function(task, search, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var recId = scriptContext.newRecord.id;
                log.debug('recId', recId);
                var date = scriptContext.newRecord.getValue('custrecord_da_leave_report_date');
                log.debug('date', date);
                var postingPeriod = scriptContext.newRecord.getValue('custrecord_da_leave_posting_period');
                log.debug('postingPeriod', postingPeriod);
                var generateReport = scriptContext.newRecord.getValue('custrecord_da_generate_reports');
                log.debug('generateReport', generateReport);
                var generateJournal = scriptContext.newRecord.getValue('custrecord_da_generate_journals');
                log.debug('generateJournal', generateJournal);
                if (generateReport) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_monthly_leaveaccruals',
                        deploymentId: 'customdeploy_da_mr_monthly_leaveaccruals',
                        params: {
                            'custscript_da_leave_accruals_date': date,
                            'custscript_da_leaves_posting_period': postingPeriod,
                            'custscript_da_leaves_report_rec_id': recId
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
                }
                if (generateJournal) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_leave_acc_jounrals',
                        deploymentId: 'customdeploy_da_mr_leave_acc_jounrals',
                        params: {
                            'custscript_da_leave_accrual_date': date,
                            'custscript_da_leave_posting_period': postingPeriod,
                            'custscript_da_leaves_record_id': recId
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
                }

            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });