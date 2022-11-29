/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/runtime','N/search','N/record'],

		function(message, serverWidget, runtime,search,record) {

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

			if(scriptContext.type == "view"){
				var processing = scriptContext.newRecord.getValue('custrecord_da_payroll_processing');
				if (processing) {
					var msgText = message.create({
						title: "Please Wait",
						message: "Process is in Progress",
						type: message.Type.INFORMATION
					});
					scriptContext.form.addPageInitMessage({
						message: msgText
					});
				}
              
              var recalculate = scriptContext.newRecord.getValue('custrecord_da_flight_allow_recalculate');
				if (recalculate) {
					var msgText = message.create({
						title: "Please Wait",
						message: "System is Recalculating the Values",
						type: message.Type.INFORMATION
					});
					scriptContext.form.addPageInitMessage({
						message: msgText
					});
				}
			}
          
          if (scriptContext.type == 'create') {
				var payrunItemsSublist = scriptContext.form.getSublist({
					id: 'recmachcustrecord_payroll_process_parent'
				});
				payrunItemsSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
			}
		}catch (ex) {
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
	function afterSubmit(scriptContext) {
		try{

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	function removeDuplicateUsingFilter(arr) {
		var unique_array = arr.filter(function(elem, index, self) {
			return index == self.indexOf(elem);
		});
		return unique_array
	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});