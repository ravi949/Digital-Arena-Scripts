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
				var recId = scriptContext.newRecord.id;
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_shift_time_sheet_crea',
					deploymentId: 'customdeploy_da_mr_shift_time_sheet_crea',
					params: {
						'custscript_da_shift_allocate_id': recId
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