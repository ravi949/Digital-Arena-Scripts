/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime'],
	function(runtime) {
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {
			try {
				if (scriptContext.type == 'view') {
					var featureEnabled = runtime.isFeatureInEffect({
						feature: 'SUBSIDIARIES'
					});
					log.debug(featureEnabled);
					if (featureEnabled) {
						scriptContext.form.addButton({
							id: 'custpage_print',
							label: 'Genearate Report',
							functionName: 'openSuiteletForPayrollReportWS("' + scriptContext.newRecord.id + '","' + scriptContext.newRecord.getValue('custrecord_da_payroll_rep_subsidiary') + '","' + scriptContext.newRecord.getValue('custrecord_da_payr_current_month') + '","' + scriptContext.newRecord.getValue('custrecord_da_payroll_compare_to') + '")'
						});
					} else {
						scriptContext.form.addButton({
							id: 'custpage_print',
							label: 'Genearate Report',
							functionName: 'openSuiteletForPayrollReportWOS("' + scriptContext.newRecord.id + '","' + scriptContext.newRecord.getValue('custrecord_da_payr_current_month') + '","' + scriptContext.newRecord.getValue('custrecord_da_payroll_compare_to') + '")'
						});
					}
				}
				scriptContext.form.clientScriptModulePath = './DA_CS_Payroll_Report.js';
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function afterSubmit(scriptContext) {}
		return {
			beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});