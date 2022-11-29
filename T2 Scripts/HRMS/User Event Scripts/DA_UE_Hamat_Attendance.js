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

				var hours = scriptContext.newRecord.getText('custrecord_da_attn_late_hours');

				log.debug('hours', hours);

				if(hours){
					var hrs = hours.split(":")[0];
					var minutes = hours.split(":")[1];

					if(Number(minutes) > 0){
						minutes = (Number(minutes)/60);
					}

					var setHours = parseFloat(hrs) +parseFloat(minutes);

					record.load({
						type:scriptContext.newRecord.type,
						id : scriptContext.newRecord.id
					}).setValue('custrecord_da_att_hours_points', setHours.toFixed(2)).save();
				}
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