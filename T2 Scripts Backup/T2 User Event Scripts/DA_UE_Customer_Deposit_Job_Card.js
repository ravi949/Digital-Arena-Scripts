/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget','N/search','N/runtime','N/record','N/error'],

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
          
          var jobCardRef = scriptContext.newRecord.getValue('custbody_da_job_card_ref');
          var customer = record.load({
            type :'customrecord_da_job_cards',
            id : jobCardRef
          }).getValue('custrecord_da_customer');
          scriptContext.newRecord.setValue('customer', customer);
		}catch(ex){
			log.error(ex.name,ex.message)
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

		try{
			var jobCardId = scriptContext.newRecord.getValue('custbody_da_job_card_ref');
			log.debug('jobCardId',jobCardId);
			var id = record.submitFields({
    type: 'customrecord_da_job_cards',
    id: jobCardId,
    values: {
        'custrecord_da_jc_customer_deposit_ref_2': scriptContext.newRecord.id
    },
    options: {
        enableSourcing: false,
        ignoreMandatoryFields : true
    }
});
    }

		catch(ex){
			log.error(ex.name,ex.message);
		}
		
		}
	

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
	    afterSubmit: afterSubmit
	};

});
