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
                var date = scriptContext.newRecord.getValue('custrecord_da_ticket_date');
                log.debug('date',date);
                var postingPeriod = scriptContext.newRecord.getValue('custrecord_da_ticket_posting_period');
                log.debug('postingPeriod',postingPeriod);
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_da_mr_ticket_accrual_report',
                    deploymentId: 'customdeploy_da_mr_ticket_accrual_report',
                    params: {
                        'custscript_da_ticket_accrual_date': date,
                        'custscript_da_tickets_posting_period': postingPeriod
                    }
                }).submit();
                log.debug('mrTask', mrTask);
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });