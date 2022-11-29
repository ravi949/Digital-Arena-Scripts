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

				//intercomapny
				var recId = scriptContext.newRecord.getValue('custrecord_da_created_from_payroll_sheet');
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_paycheck_journals',
					deploymentId: 'customdeploy_da_mr_paycheck_journals',
					params: {
						'custscript_ic_payroll_id': recId,
                       'custscript_da_ic_payroll_sheet_id' : scriptContext.newRecord.id
					}
				}).submit();
				log.debug('mrTask', mrTask);
			} catch (ex) {
				log.error(ex.name, ex.message);
                if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
            try{
               var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_paycheck_journals',
					deploymentId: 'customdeploy_da_mr_paycheck_journals_1',
					params: {
						'custscript_ic_payroll_id': recId,
                       'custscript_da_ic_payroll_sheet_id' : scriptContext.newRecord.id
					}
				}).submit();
               log.debug('mrTask',mrTask);
            }catch(ex){
              log.error(ex.name,ex.message);
               if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                 var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_paycheck_journals',
					deploymentId: 'customdeploy_da_mr_paycheck_journals_2',
					params: {
						'custscript_ic_payroll_id': recId,
                       'custscript_da_ic_payroll_sheet_id' : scriptContext.newRecord.id
					}
				}).submit();
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