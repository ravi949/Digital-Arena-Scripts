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
			
			var recId = scriptContext.newRecord.id;
			
			var toLocation = scriptContext.newRecord.getValue('custrecord_da_material_tolocation');

			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_items_transfer',
				deploymentId: 'customdeploy_da_mr_items_transfer',
				params: {'custscript_da_mat_trans_rec_id': recId, 'custscript_da_mat_trans_to_loc':toLocation}
			}).submit();


		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});
