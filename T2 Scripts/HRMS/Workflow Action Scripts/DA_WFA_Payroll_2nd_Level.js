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
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_payroll_2nd_approval',
					deploymentId: 'customdeploy_da_mr_payroll_2nd_approval',
					params: {
						'custscript_payroll_id': recId
					}
				}).submit();
				log.debug('mrTask', mrTask+"id"+scriptContext.newRecord.id);
			} catch (ex) {
				log.error(ex.name, ex.message);
                if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
            try{
               var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_payroll_2nd_approval',
					deploymentId: 'customdeploy_da_mr_payroll_2nd_approv_1',
					params: {
						'custscript_payroll_id': recId
					}
				}).submit();
               log.debug('mrTask',mrTask);
            }catch(ex){
              log.error(ex.name,ex.message);
               if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_payroll_2nd_approval',
					deploymentId: 'customdeploy_da_mr_payroll_2nd_approv_2',
					params: {
						'custscript_payroll_id': recId
					}
				}).submit();
               }
            }
           
          }
			}
		}
		return {
			onAction: onAction
		};
	});