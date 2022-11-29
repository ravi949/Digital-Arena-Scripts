/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/ui/serverWidget','N/record'],

		function(search,serverWidget,record) {

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
			if(scriptContext.type == 'view'){
					scriptContext.form.addButton({
						id : 'custpage_print',
						label : 'Print',
						functionName:'openTaskSuitelet("'+scriptContext.newRecord.id+'")'
					});
				}
				scriptContext.form.clientScriptModulePath = './Ameer_CS_Create_WO.js';
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
			var particlursId = scriptContext.newRecord.getValue('custevent_job_order_task_id');
			var status = scriptContext.newRecord.getValue('status');
          log.debug(status);
			
			var jobOrderId = scriptContext.newRecord.getValue('custevent_job_order_ref');
			
			if(jobOrderId && status == "COMPLETE"){
              log.debug("setting");
				var fieldLookUp = search.lookupFields({
					type: 'customrecord_job_order',
					id: jobOrderId,
					columns: ['custrecord_customer_quotation_ref']
				});
				
				if(fieldLookUp.custrecord_customer_quotation_ref.length > 0){

					var estimateId = fieldLookUp.custrecord_customer_quotation_ref[0].value;
					
					var estimateRec = record.load({
						type:'estimate',
						id:estimateId,
						//isDynamic:true
					});
					var numLines = estimateRec.getLineCount({
						sublistId: 'item'
					});
					
					for(var k = 0; k < numLines; k++){
						var taskID = estimateRec.getSublistValue({
							sublistId:'item',
							fieldId:'custcol_job_order_task',
							line:k
						});
						if(taskID == scriptContext.newRecord.id){
                            log.debug("same line");
							estimateRec.setSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_job_orders_task_status',
								line:k,
								value: 3,
								ignoreFieldChange: true
							});
							//estimateRec.commitLine('item');
						}
					}					
					var id= estimateRec.save();
                   log.debug(id);
				}
			}
			if(particlursId && (status == "COMPLETE" || status == "PROGRESS")){
				if(status == "PROGRESS"){
					record.submitFields({
					    type: 'customrecord_jo_particulars',
					    id: particlursId,
					    values: {
					        'custrecord_jo_particulars_status': 2
					    },
					    options: {
					        enableSourcing: false,
					        ignoreMandatoryFields : true
					    }
					});
				}
				if(status == "COMPLETE"){
					record.submitFields({
					    type: 'customrecord_jo_particulars',
					    id: particlursId,
					    values: {
					        'custrecord_jo_particulars_status': 3
					    },
					    options: {
					        enableSourcing: false,
					        ignoreMandatoryFields : true
					    }
					});
				}
				
			}
		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	return {
		beforeLoad: beforeLoad,
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
