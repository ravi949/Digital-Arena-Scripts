/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget','N/search','N/runtime','N/record'],

		function(message,serverWidget,search,runtime,record) {

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
		try{
			var id = scriptContext.newRecord.id;
            var type = scriptContext.newRecord.type;
				var form = scriptContext.form;
				var button = form.addButton({
					id: 'custpage_duty_resumption',
					label: 'Duty Resumption',
                    functionName:"OpenPrint("+id+")"
				});
          form.clientScriptModulePath = './DA CS Duty Resumption.js';

		}catch(ex){
			log.error(ex.name,ex.message);
		
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
			try{
    }
		catch(ex){
			log.error(ex.name,ex.message);
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
		}
	

	return {
		beforeLoad: beforeLoad,
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});