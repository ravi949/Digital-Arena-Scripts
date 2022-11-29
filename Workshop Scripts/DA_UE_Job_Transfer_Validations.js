/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/ui/serverWidget','N/record','N/ui/message','N/runtime','N/task'],

		function(search,serverWidget,record,message,runtime,task) {

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

			//if (runtime.executionContext == runtime.ContextType.USER_INTERFACE){
			if(scriptContext.type == "create" || scriptContext.type == "edit"){
				var sublist = scriptContext.form.getSublist({
					id : 'recmachcustrecord_da_job_card_transfer_order'
				});
				//log.debug(sublist);

				var field = sublist.getField({
					id : 'custrecord_da_transfer_serial_no'
				});
               log.debug(field);
				if(scriptContext.type == "create" || scriptContext.type == "edit"){

					field.updateDisplayType({
						displayType : serverWidget.FieldDisplayType.HIDDEN
					});
				}
			}


			/**/
			//}

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

			var customrecord_da_spare_part_request_itemsSearchObj = search.create({
				type: "customrecord_da_spare_part_request_items",
				filters:
					[
						["custrecord_da_transfer_serial_no","noneof","@NONE@"], 
						"AND", 
						["custrecord_da_job_card_transfer_order","anyof",scriptContext.newRecord.id]
						],
						columns:
							[				     
								search.createColumn({name: "custrecord_da_new_part_job_card", label: "Job Card"}),
								
								search.createColumn({name: "custrecord_da_new_part_customer", label: "Customer"}),
								search.createColumn({name: "custrecord_da_spare_part_ref_2", label: "Spare part #"}),
								search.createColumn({name: "custrecord_da_spare_part_requested_desc", label: "Item Description"}),
								search.createColumn({name: "custrecord_da_transfer_return_to_apple", label: "Return To Apple"}),
								search.createColumn({name: "custrecord_da_transfer_from_location", label: "From Location"}),
								search.createColumn({name: "custrecord_da_location_available_qty", label: "Avail Qty"}),
								search.createColumn({name: "custrecord_da_transfer_serial_no", label: "Serial Number"})
								]
			});
			var searchResultCount = customrecord_da_spare_part_request_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_spare_part_request_itemsSearchObj result count",searchResultCount);

			if(searchResultCount > 0){

				customrecord_da_spare_part_request_itemsSearchObj.run().each(function(result){
					var jobTransferRec = record.create({
						type:'customrecord_da_pending_receiving_kgb'
					});
					jobTransferRec.setValue('custrecord_da_job_card_transfer_ordr_ref',scriptContext.newRecord.id);
					jobTransferRec.setValue({
						fieldId: 'custrecord_da_new_part_job_card_kgb',
						value: result.getValue('custrecord_da_new_part_job_card')
					});
					jobTransferRec.setValue({
						fieldId: 'custrecord_da_spare_part_ref_kgb',
						value: result.getValue('custrecord_da_spare_part_ref_2')
					});
					jobTransferRec.setValue({
						fieldId: 'custrecord_da_transfer_from_location_kgb',
						value: result.getValue('custrecord_da_transfer_from_location')
					});
					jobTransferRec.setValue({
						fieldId: 'custrecord_da_location_available_qty_kgb',
						value: result.getValue('custrecord_da_location_available_qty')
					});
					jobTransferRec.setValue({
						fieldId: 'custrecord_da_transfer_serial_no_kgb',
						value: result.getValue('custrecord_da_transfer_serial_no')
					});
					jobTransferRec.setValue({
						fieldId: 'custrecord_return_to_apple',
						value: result.getValue('custrecord_da_transfer_return_to_apple')
					});
					jobTransferRec.save();

					record.delete({
						type:'customrecord_da_spare_part_request_items',
						id:result.id
					})
					return true;
				});

				//var id = jobTransferRec.save();
				//log.debug(id);
			}

			var customrecord_da_pending_receiving_kgbSearchObj = search.create({
				type: "customrecord_da_pending_receiving_kgb",
				filters:
					[
						["custrecord_da_job_card_transfer_ordr_ref","anyof",scriptContext.newRecord.id], 
						"AND", 
						["custrecord_da_kgb_received","is","T"], 
						"AND", 
						["custrecord_da_transfer_from_location_kgb","noneof","@NONE@"]
						],
						columns:
							[
								search.createColumn({name: "custrecord_da_spare_part_ref_kgb", label: "Spare part Ref"}),
								search.createColumn({name: "custrecord_da_spare_part_item_kgb", label: "Item"}),
								search.createColumn({name: "custrecord_da_transfer_from_location_kgb", label: "From Location"}),
								search.createColumn({name: "custrecord_da_transfer_serial_no_kgb", label: "Serial Number"}),
								search.createColumn({name: "custrecord_return_to_apple", label: "return to apple"}),
								search.createColumn({name: "custrecord_da_new_part_job_card_kgb", label: "Job Card"})
								]
			});
			var searchResultCount = customrecord_da_pending_receiving_kgbSearchObj.runPaged().count;
			log.debug("customrecord_da_pending_receiving_kgbSearchObj result count",searchResultCount);

			var techinicianLocation = scriptContext.newRecord.getValue('custrecord_da_job_technician_location');


			customrecord_da_pending_receiving_kgbSearchObj.run().each(function(result){				  
				var jobcardSparePartId = result.getValue('custrecord_da_spare_part_ref_kgb');
				if(jobcardSparePartId){

					var inventoryTransferRec = record.create({
						type:'inventorytransfer',
						isDynamic:true
					});

					inventoryTransferRec.setValue('location',result.getValue('custrecord_da_transfer_from_location_kgb'));
					inventoryTransferRec.setValue('transferlocation',techinicianLocation);
					inventoryTransferRec.setValue('custbody_da_job_card_ref',result.getValue('custrecord_da_new_part_job_card_kgb'));
					inventoryTransferRec.selectNewLine({
						sublistId: 'inventory'
					});
					inventoryTransferRec.setCurrentSublistValue({
						sublistId: 'inventory',
						fieldId: 'item',
						value: result.getValue('custrecord_da_spare_part_item_kgb'),
						ignoreFieldChange: false,
						forceSyncSourcing:true
					});
					inventoryTransferRec.setCurrentSublistValue({
						sublistId: 'inventory',
						fieldId: 'adjustqtyby',
						value: 1,
						ignoreFieldChange: false,
						forceSyncSourcing:true
					});

					var serialNo = result.getValue('custrecord_da_spare_part_ref_kgb');

					if(serialNo){
						var subrec = inventoryTransferRec.getCurrentSublistSubrecord({
							sublistId: 'inventory',
							fieldId: 'inventorydetail'
						});
						subrec.selectNewLine({
							sublistId: 'inventoryassignment'
						});
						log.debug('serialid',result.getValue('custrecord_da_transfer_serial_no_kgb'));
						subrec.setCurrentSublistValue({
							sublistId: 'inventoryassignment',
							fieldId: 'issueinventorynumber',
							value: result.getValue('custrecord_da_transfer_serial_no_kgb')
						});
						subrec.setCurrentSublistValue({
							sublistId: 'inventoryassignment',
							fieldId: 'quantity',
							value: 1
						});
						subrec.commitLine({
							sublistId: 'inventoryassignment'
						});
					}



					inventoryTransferRec.commitLine('inventory');
					var inventoryTransferRecid = inventoryTransferRec.save();
					log.debug('inventoryTransferRecid',inventoryTransferRecid);

					var id = record.submitFields({
						type: 'customrecord_da_job_card_spare_parts',
						id: jobcardSparePartId,
						values: {
							'custrecord_da_spare_part_new_serial':result.getValue('custrecord_da_transfer_serial_no_kgb'),
							'custrecord_da_item_received':true,
							'custrecord_da_is_return':result.getValue('custrecord_return_to_apple')
						},
						options: {
							enableSourcing: false,
							ignoreMandatoryFields : true
						}
					});

					record.delete({
						type:'customrecord_da_pending_receiving_kgb',
						id:result.id
					});
				}
				return true;
			});


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