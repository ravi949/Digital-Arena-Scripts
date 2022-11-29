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

			var postingPeriodId = scriptContext.newRecord.getValue('custrecord_da_gen_payslip_for_month');
			log.debug('postingPeriod',postingPeriodId);
          
          	var postingPeriodText = scriptContext.newRecord.getText('custrecord_da_gen_payslip_for_month');
			log.debug('postingPeriodText',postingPeriodText);
			var recId = scriptContext.newRecord.id;

			var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_employee_payslip_gene',
				deploymentId: 'customdeploy_da_mr_employee_payslip_gene',
				params: {'custscript_paysllip_period': postingPeriodId,'custscript_da_pp_text':postingPeriodText}
			}).submit();


		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});
