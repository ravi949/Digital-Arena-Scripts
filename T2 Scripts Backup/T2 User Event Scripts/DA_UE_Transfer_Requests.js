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
	function afterSubmit(scriptContext) {
		try{

			log.debug('id',scriptContext.newRecord.id);
			
			var transferRec = record.load({
				type:'customrecord_da_transferform',
				id: scriptContext.newRecord.id
			})
			var requestDate = transferRec.getText('custrecord_da_transfer_date');
			//var requestDate1 = scriptContext.newRecord.getValue('custrecord_da_transfer_date');
			//log.debug('requestDate',requestDate1);

			var customrecord_da_moni_transSearchObj = search.create({
				type: "customrecord_da_moni_trans",
				filters:
					[
						["custrecord_da_moni_date","on",requestDate]
						],
						columns:
							[
								search.createColumn({
									name: "scriptid",
									sort: search.Sort.ASC,
									label: "Script ID"
								})
								]
			});
			var searchResultCount = customrecord_da_moni_transSearchObj.runPaged().count;
			log.debug("customrecord_da_moni_transSearchObj result count",searchResultCount);

			var monitoryTransferRec ;

			if(searchResultCount > 0){
				customrecord_da_moni_transSearchObj.run().each(function(result){

					

					var customrecord_da_transfer_request_itemsSearchObj = search.create({
						type: "customrecord_da_transfer_request_items",
						filters:
							[
								["custrecord_da_parent_request","anyof",scriptContext.newRecord.id]
								],
								columns:
									[
										search.createColumn({name: "custrecord_da_item_transfer", label: "Item"}),
										search.createColumn({name: "custrecord_da_tran_req_item_type", label: "Type"}),
										search.createColumn({name: "custrecord_da_tran_req_qty", label: "Quantity"}),
										search.createColumn({name: "custrecord_da_uom", label: "UOM"})
										]
					});
					var searchResultCount = customrecord_da_transfer_request_itemsSearchObj.runPaged().count;
					log.debug("customrecord_da_transfer_request_itemsSearchObj result count",searchResultCount);
					var arr = [];
					customrecord_da_transfer_request_itemsSearchObj.run().each(function(result){
						arr.push(result.id);
						return true;
					});
					
					if(arr.length > 0){
						var customrecord_da_moni_itemsSearchObj = search.create({
							type: "customrecord_da_moni_items",
							filters:
								[
									["custrecord_da_items_req_id","anyof",arr]
									],
									columns:[]
						});
						var searchResultCount = customrecord_da_moni_itemsSearchObj.runPaged().count;
						log.debug("customrecord_da_moni_itemsSearchObj result count",searchResultCount);
						customrecord_da_moni_itemsSearchObj.run().each(function(result){
							record.delete({
								type:'customrecord_da_moni_items',
								id:result.id
							})
							return true;
						});
					}
					
					monitoryTransferRec = record.load({
						type:'customrecord_da_moni_trans',
						id:result.id,
						isDynamic:true
					});

					customrecord_da_transfer_request_itemsSearchObj.run().each(function(result){
						monitoryTransferRec.selectNewLine({
							sublistId: 'recmachcustrecord_da_moni_trans_parent'
						});
						monitoryTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_moni_trans_parent',
							fieldId: 'custrecord_da_moni_item',
							value: result.getValue('custrecord_da_item_transfer'),
							ignoreFieldChange: false,
							forceSyncSourcing:true
						});
						monitoryTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_moni_trans_parent',
							fieldId: 'custrecord_da_mon_item_qty',
							value: result.getValue('custrecord_da_tran_req_qty'),
							ignoreFieldChange: true
						});
						log.debug(result.id);
						monitoryTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_moni_trans_parent',
							fieldId: 'custrecord_da_items_req_id',
							value: result.id,
							ignoreFieldChange: true
						});
						monitoryTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_moni_trans_parent',
							fieldId: 'custrecord_da_moni_location',
							value: scriptContext.newRecord.getValue('custrecord_da_transfer_location'),
							ignoreFieldChange: true
						});
						monitoryTransferRec.commitLine('recmachcustrecord_da_moni_trans_parent');
						return true;
					});

			});
		}else{
			
			var materialTransferRec = record.create({
				type:'customrecord_da_material_transfer'
			});
			materialTransferRec.setText('custrecord_da_material_date',requestDate);	
			var materialTransferId = materialTransferRec.save();
			
			
			monitoryTransferRec = record.create({
				type:'customrecord_da_moni_trans',
				isDynamic:true
			});
			monitoryTransferRec.setText('custrecord_da_moni_date',requestDate);		
			monitoryTransferRec.setValue('custrecord_material_transfer_ref',materialTransferId);		
			
			var customrecord_da_transfer_request_itemsSearchObj = search.create({
				type: "customrecord_da_transfer_request_items",
				filters:
					[
						["custrecord_da_parent_request","anyof",scriptContext.newRecord.id]
						],
						columns:
							[
								search.createColumn({name: "custrecord_da_item_transfer", label: "Item"}),
								search.createColumn({name: "custrecord_da_tran_req_item_type", label: "Type"}),
								search.createColumn({name: "custrecord_da_tran_req_qty", label: "Quantity"}),
								search.createColumn({name: "custrecord_da_uom", label: "UOM"})
								]
			});
			var searchResultCount = customrecord_da_transfer_request_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_transfer_request_itemsSearchObj result count",searchResultCount);
			
			customrecord_da_transfer_request_itemsSearchObj.run().each(function(result){
				monitoryTransferRec.selectNewLine({
					sublistId: 'recmachcustrecord_da_moni_trans_parent'
				});
				monitoryTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_da_moni_trans_parent',
					fieldId: 'custrecord_da_moni_item',
					value: result.getValue('custrecord_da_item_transfer'),
					ignoreFieldChange: false,
					forceSyncSourcing:true
				});
				monitoryTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_da_moni_trans_parent',
					fieldId: 'custrecord_da_mon_item_qty',
					value: result.getValue('custrecord_da_tran_req_qty'),
					ignoreFieldChange: true
				});
				monitoryTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_da_moni_trans_parent',
					fieldId: 'custrecord_da_items_req_id',
					value: result.id,
					ignoreFieldChange: true
				});
				monitoryTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_da_moni_trans_parent',
					fieldId: 'custrecord_da_moni_location',
					value: scriptContext.newRecord.getValue('custrecord_da_transfer_location'),
					ignoreFieldChange: true
				});
				monitoryTransferRec.commitLine('recmachcustrecord_da_moni_trans_parent');
				return true;
			});
		}


		monitoryTransferRec.save();

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
