/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/runtime'],
	function(search, serverWidget, record, runtime) {
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
				if (scriptContext.type == 'create') {
					var featureEnabled = runtime.isFeatureInEffect({
						feature: 'SUBSIDIARIES'
					});
					log.debug(featureEnabled);
					if (featureEnabled) {
						var sublist = scriptContext.form.getSublist({
							id: 'recmachcustrecord_da_attendance_parent'
						});
						sublist.addButton({
							id: 'custpage_print',
							label: 'Fill Employees Based On Subsidairy',
							functionName: 'getEmployeesBasedOnSubsidiary("' + scriptContext.newRecord.getValue('custrecord_attendance_subsidiary') + '")'
						});
					}
				}
				scriptContext.form.clientScriptModulePath = './DA_CS_Attendance_Validations.js';
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
		function beforeSubmit(scriptContext) {
			log.debug('beforeSubmit', 'beforeSubmit');
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
		function afterSubmit(scriptContext) {}
		return {
			beforeLoad: beforeLoad,
			//beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});