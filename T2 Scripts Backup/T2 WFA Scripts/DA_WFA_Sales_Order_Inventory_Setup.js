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
                var type = scriptContext.newRecord.type;
                log.debug('type', type);
                var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_lot_processing',
                        deploymentId: 'customdeploy_da_mr_lot_processing',
                        params: {
                            'custscript_da_so_rec_id1_2': recId,
                            'custscript_da_so_rec_type1_2': type
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