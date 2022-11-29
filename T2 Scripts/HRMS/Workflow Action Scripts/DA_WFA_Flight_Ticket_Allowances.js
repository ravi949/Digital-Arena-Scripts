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
			//var superVisorId = scriptContext.newRecord.getValue('custrecord_da_payroll_pro_superviosr');
			//var postingPeriod = scriptContext.newRecord.getText('custrecord_da_payroll_pro_period');
			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_flight_ticket_calcula',
				deploymentId: 'customdeploy_da_mr_flight_ticket_calcula'                
			}).submit();

		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});