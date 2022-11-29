/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record','N/search','N/runtime'],

		function(record,search,runtime) {

	/**
	 * Marks the beginning of the Map/Reduce process and generates input data.
	 *
	 * @typedef {Object} ObjectRef
	 * @property {number} id - Internal ID of the record instance
	 * @property {string} type - Record type id
	 *
	 * @return {Array|Object|Search|RecordRef} inputSummary
	 * @since 2015.1
	 */
	function getInputData() {
		try{

			var recId = runtime.getCurrentScript().getParameter({name:"custscript_da_mat_trans_rec_id"});
			log.debug('recId',recId);

			var toLocation = runtime.getCurrentScript().getParameter({name:"custscript_da_mat_trans_to_loc"});
			log.debug('toLocation',toLocation);

			var customrecord_da_material_transfer_itemsSearchObj = search.create({
				type: "customrecord_da_material_transfer_items",
				filters:
					[
						["custrecord_mat_transfer_parent","anyof",recId], 
						"AND", 
						["custrecord_da_mat_transferable_qty","greaterthan","0"]
						],
						columns:
							[
								search.createColumn({name: "custrecord_da_tran_from_location", label: "From Location"})
								]
			});
			var searchResultCount = customrecord_da_material_transfer_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_material_transfer_itemsSearchObj result count",searchResultCount);

			var locationsArr = [];
			customrecord_da_material_transfer_itemsSearchObj.run().each(function(result){
				var fromLocation = result.getValue('custrecord_da_tran_from_location');
				locationsArr.push(fromLocation);
				return true;
			});

			locationsArr = removeDuplicateUsingFilter(locationsArr);
			
			log.debug('locationsArr',locationsArr);

			if(locationsArr.length > 0){
				for(var i =0 ; i < locationsArr.length ;i++){
					var customrecord_da_material_transfer_itemsSearchObj = search.create({
						type: "customrecord_da_material_transfer_items",
						filters:
							[
								["custrecord_mat_transfer_parent","anyof",recId], 
								"AND", 
								["custrecord_da_mat_transferable_qty","greaterthan","0"], 
								"AND", 
								["custrecord_da_tran_from_location","anyof",locationsArr[i]]
								],
								columns:
									[
										search.createColumn({name: "custrecord_mat_transfer_parent", label: "Material Transfer Item Parent"}),
										search.createColumn({name: "custrecord_da_to_location", label: "Req Location"}),
										search.createColumn({name: "custrecord_da_material_item", label: "Item"}),
										search.createColumn({name: "custrecord_da_material_item_uom", label: "UOM"}),
										search.createColumn({name: "custrecord_da_material_item_quantity", label: "Quantity"}),
										search.createColumn({name: "custrecord_da_mat_transferable_qty", label: "From Location"}),
										search.createColumn({name: "custrecord_da_mat_transfer_avail_qty", label: "Avail Qty"})
										]
					});
					var searchResultCount = customrecord_da_material_transfer_itemsSearchObj.runPaged().count;
					log.debug("customrecord_da_material_transfer_itemsSearchObj result count",searchResultCount);
					if(searchResultCount > 0){
						var inventoryTransferRec = record.create({
							type:'inventorytransfer',
							isDynamic: true
						});
						inventoryTransferRec.setValue('subsidiary',3);
                      inventoryTransferRec.setValue('custbody_da_material_ref_no',recId);
						inventoryTransferRec.setValue('location',locationsArr[i]);
						inventoryTransferRec.setValue('transferlocation',toLocation);
						customrecord_da_material_transfer_itemsSearchObj.run().each(function(result){
							inventoryTransferRec.selectNewLine({
								sublistId: 'inventory'
							});
							inventoryTransferRec.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'item',
								value: result.getValue('custrecord_da_material_item'),
								ignoreFieldChange: false,
								forceSyncSourcing:true
							});
                           inventoryTransferRec.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'units',
								value: result.getValue('custrecord_da_material_item_uom')
							});
							inventoryTransferRec.setCurrentSublistValue({
								sublistId: 'inventory',
								fieldId: 'adjustqtyby',
								value: result.getValue('custrecord_da_mat_transferable_qty'),
								ignoreFieldChange: false,
								forceSyncSourcing:true
							});
							inventoryTransferRec.commitLine('inventory');
							return true;
						});

						var inventoryTransferRecid = inventoryTransferRec.save();
                      log.debug('inventoryTransferRecid',inventoryTransferRecid);
					}
				}
			}
            record.load({
              type:'customrecord_da_material_transfer',
              id:recId
            }).setValue('custrecord_da_materials_transferring',false).setValue('custrecord_da_materials_transferred',true).save();
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

	/**
	 * Executes when the map entry point is triggered and applies to each key/value pair.
	 *
	 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
	 * @since 2015.1
	 */
	function map(context) {
		try{

		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	/**
	 * Executes when the reduce entry point is triggered and applies to each group.
	 *
	 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	 * @since 2015.1
	 */
	function reduce(context) {
		try{}catch(ex){
			log.error(ex.name,ex.message);

		}
	}


	/**
	 * Executes when the summarize entry point is triggered and applies to the result set.
	 *
	 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
	 * @since 2015.1
	 */
	function summarize(summary) {}

	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};

});
