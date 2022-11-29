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
                var date = scriptContext.newRecord.getValue('custrecord_da_indemnity_date');
                var postingPeriod = scriptContext.newRecord.getValue('custrecord_da_indemnity_posting_period');
                log.debug('postingPeriod', postingPeriod);
                var generateReport = scriptContext.newRecord.getValue('custrecord_da_generate_report');
                log.debug('generateReport', generateReport);
                var generateJournal = scriptContext.newRecord.getValue('custrecord_da_generate_journal');
                log.debug('generateJournal', generateJournal);
                if (generateReport) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_monthly_indemnity_rep',
                        deploymentId: 'customdeploy_da_mr_monthly_indemnity_rep',
                        params: {
                            'custscript_da_wfa_indemnity_da': date,
                            'custscript_da_wfa_indemnity_po': postingPeriod,
                            'custscript_da_indemnity_report_rec_id': recId
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
                }
                if (generateJournal) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_indemnity_accrual_jou',
                        deploymentId: 'customdeploy_da_mr_indemnity_accrual_jou',
                        params: {
                            'custscript_da_indemnity_dates': date,
                            'custscript_da_indemnity_post_period': postingPeriod,
                            'custscript_da_indemnity_record_id': recId
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