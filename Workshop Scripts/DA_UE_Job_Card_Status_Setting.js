/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/record'],

		function(record) {

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
		log.debug('beforeSubmit','beforeSubmit');

		var jobCardRef = scriptContext.newRecord.getValue('custbody_da_job_card_ref');		
		if(jobCardRef){
			
			if(scriptContext.newRecord.type == "invoice"){
				record.submitFields({
					type:'customrecord_da_job_cards',
					id: jobCardRef,
					values:{
						'custrecord_invoice_status': 2
					},
					options:{
						'enablesourcing':false,
						'ignoreMandatoryFields':true
					}
				})
			}
			
			if(scriptContext.newRecord.type == "itemfulfillment"){
				record.submitFields({
					type:'customrecord_da_job_cards',
					id: jobCardRef,
					values:{
						'custrecord_job_card_fulfillment_status': 2,
                        'custrecord_da_job_work_status': 9,
                        'custrecord_da_job_card_pull_out': false
					},
					options:{
						'enableSourcing':false,
						'ignoreMandatoryFields':true
					}
				})
			}

			
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

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	return {
		//beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		//afterSubmit: afterSubmit
	};

});