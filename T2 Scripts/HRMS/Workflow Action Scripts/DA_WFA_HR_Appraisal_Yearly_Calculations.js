    /**
     * @NApiVersion 2.x
     * @NScriptType workflowactionscript
     */
    define(['N/task', 'N/record', 'N/format'],
        function(task, record, format) {
            /**
             * Definition of the Workflow Action script trigger point.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {Record} scriptContext.oldRecord - Old record
             * @Since 2016.1
             */
            function onAction(scriptContext) {
                try {

                   var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_hr_create_yearly_app',
					deploymentId: 'customdeploy_da_mr_hr_create_yearly_app',
					params: {'custscript_da_app_rec_id':  scriptContext.newRecord.id}
				}).submit();
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }
            }
      
            return {
                onAction: onAction
            };
        });