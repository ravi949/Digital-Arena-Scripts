/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task'],

        function(task) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        try{ 

            var postingPeriodId = scriptContext.newRecord.getValue('custrecord_da_send_payslips_period');
            log.debug('postingPeriod',postingPeriodId);
            var recId = scriptContext.newRecord.id;

            var mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_da_mr_send_payslips',
                deploymentId: 'customdeploy_da_mr_send_payslips',
                params: {'custscript_da_send_payslip_id': recId}
            }).submit();


        }catch(ex){

            log.error(ex.name,ex.message);
        }
    }

    return {
        onAction : onAction
    };

});