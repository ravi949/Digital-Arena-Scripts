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
			var id = scriptContext.newRecord.id;
			log.debug('id',id);
			var type = scriptContext.newRecord.type;
			log.debug('type',type);
			var objRecord = record.load({
				type: type,
				id: id,
				isDynamic: true
			});
			var lineCount = objRecord.getLineCount('item');
			log.debug('lineCount',lineCount);
			if(lineCount > 0){
				var location = objRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'location',
					line: 0
				});
				log.debug('location',location);
			}
			objRecord.setValue('custbody_da_line_location',location);
			var objRec = objRecord.save();
			log.debug('objRec',objRec);
		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}
	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
