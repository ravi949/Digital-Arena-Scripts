/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task','N/search','N/record'],

        function(task,search,record) {

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
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_da_mr_update_gosi_values',
                    deploymentId: 'customdeploy_da_mr_update_gosi_values',
                }).submit();
            
        }catch(ex){

            log.error(ex.name,ex.message);
        }
    }

    return {
        onAction : onAction
    };

});