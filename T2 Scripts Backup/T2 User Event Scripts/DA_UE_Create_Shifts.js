/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/record'],
	function(runtime, record) {
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
			try {

				
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
		function afterSubmit(scriptContext) {
			try {

					var shiftRec  = record.load({
						type:'customrecord_da_hr_create_shifts',
						id : scriptContext.newRecord.id
					});
              
                    var name = shiftRec.getText('custrecord_da_shift_type');

					var timeIn = shiftRec.getText('custrecord_da_shift_time_in');
					var timeOut =  shiftRec.getText('custrecord_da_shift_time_out');

					var value = name + "("+ timeIn +" - "+ timeOut +")";
					shiftRec.setValue('name', value);
					shiftRec.save();
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}

		
		return {
			beforeLoad: beforeLoad,
			beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});