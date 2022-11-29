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
           
              
            var recId = scriptContext.newRecord.id;
                log.debug('recId', recId);
                var type = scriptContext.newRecord.type;
                log.debug('type', type);
              
              try{ 
				 var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_sales_order_inventory',
                        deploymentId: 'customdeploy_da_mr_sales_order_inv_setup',
                        params: {
                            'custscript_da_so_rec_id': recId,
                            'custscript_da_so_rec_type': type
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
                }catch(ex){

                    log.error(ex.name,ex.message);
                    if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
            try{
              var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_sales_order_inventory',
                        deploymentId: 'customdeploy_mr_inv_deploy',
                        params: {
                            'custscript_da_so_rec_id': recId,
                            'custscript_da_so_rec_type': type
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
               log.debug('mrTask',mrTask);
            }catch(ex){
              log.error(ex.name,ex.message);
               if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                  var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_sales_order_inventory',
                        deploymentId: 'customdeploy_mr_inv_deploy3',
                        params: {
                            'custscript_da_so_rec_id': recId,
                            'custscript_da_so_rec_type': type
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
               log.debug('mrTask',mrTask);
               }
            }
           
          }
                
			}
        } 
               

        return {
            onAction: onAction
        };
    });