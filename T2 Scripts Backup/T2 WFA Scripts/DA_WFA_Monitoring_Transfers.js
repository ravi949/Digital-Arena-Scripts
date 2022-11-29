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
			
			var materialTransferId = scriptContext.newRecord.getValue('custrecord_material_transfer_ref');

			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_monitoring_transfers',
				deploymentId: 'customdeploy_da_mr_monitoring_transfers',
				params: {'custscript_da_mr_parent_rec_id': recId, 'custscript_da_mr_material_tran_id':materialTransferId}
			}).submit();


		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});
