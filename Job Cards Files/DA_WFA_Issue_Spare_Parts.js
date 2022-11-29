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

			var parentId = scriptContext.newRecord.id;

			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_issue_spare_parts',
				deploymentId: 'customdeploy_da_mr_issue_spare_parts',
				params: {'custscript_parent_rec_id': parentId}
			}).submit();


		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});