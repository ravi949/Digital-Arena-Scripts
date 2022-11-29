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
			var superVisorId = scriptContext.newRecord.getValue('custrecord_da_payroll_pro_superviosr');
			var postingPeriod = scriptContext.newRecord.getText('custrecord_da_payroll_pro_period');
			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_payroll_pro_ded_ot',
				deploymentId: 'customdeploy_da_mr_payroll_pro_ded_ot',
				params: {'custscript_da_supervisor_id': superVisorId,
					'custscript_da_pp_posting_period':postingPeriod,
					'custscript_da_payroll_type':scriptContext.newRecord.getValue('custrecord_da_payroll_proces_type'),
					'custscript_da_payroll_process_id': recId,
                         'custscript_param_subsidairy':scriptContext.newRecord.getValue('custrecord_pyaroll_process_subsidairy')
				}
			}).submit();

		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});
