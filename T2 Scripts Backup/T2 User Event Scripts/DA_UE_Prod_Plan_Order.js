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
			if (scriptContext.type == "delete"){
				var transferOrderId = scriptContext.newRecord.getValue('custbody_da_transfer_order_reference');
			log.debug('transferOrderId',transferOrderId);
				var transferOrderRec = record.load({
				type: 'transferorder',
				id: transferOrderId,
				isDynamic: true
			});
				var prodPlanOrderId = transferOrderRec.getValue('custbody_da_prod_plan_order_ref');
				log.debug('prodPlanOrderId',prodPlanOrderId);
				if(!prodPlanOrderId){
					transferOrderRec.setValue('custbody_da_to_meant_for_pp',false);
				}
				var transferOrderRecId = transferOrderRec.save();
				log.debug('transferOrderRecId',transferOrderRecId);
			}
			
			
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