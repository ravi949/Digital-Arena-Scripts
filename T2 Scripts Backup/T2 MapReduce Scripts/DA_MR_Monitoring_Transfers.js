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

			var recId = runtime.getCurrentScript().getParameter({name:"custscript_da_mr_parent_rec_id"});
			log.debug('recId',recId);

			return search.create({
				type: "customrecord_da_moni_items",
				filters:
					[
						["custrecord_da_moni_trans_parent","anyof",recId]
						],
						columns:
							[
								search.createColumn({name: "custrecord_da_moni_item", label: "Item"}),
								search.createColumn({name: "custrecord_da_moni_type", label: "Type"}),
								search.createColumn({name: "custrecord_da_moni_uom", label: "UOM"}),
								search.createColumn({name: "custrecord_da_mon_item_qty", label: "Quantity"})
								]
			});
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	/**
	 * Executes when the map entry point is triggered and applies to each key/value pair.
	 *
	 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
	 * @since 2015.1
	 */
	function map(context) {
		try{
			//log.debug('context',context);
			context.write({
				key: context.key,
				value: context.key
			});
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
		try{

			var materialTransferrecId = runtime.getCurrentScript().getParameter({name:"custscript_da_mr_material_tran_id"});
			log.debug('materialTransferrecId',materialTransferrecId);

			var materilTransferRec = record.load({
				type:'customrecord_da_material_transfer',
				id: materialTransferrecId,
				isDynamic: true
			})

			// Here the Employee InternalId comes from the stage of Map. and Assigning to the variable.
			var reqItemID = JSON.parse(context.key);
			log.debug('reqItemID',reqItemID);

			var requestRec = record.load({
				type:'customrecord_da_moni_items',
				id:reqItemID
			});

			var reqItem = requestRec.getValue('custrecord_da_moni_item');
			var itemType = requestRec.getValue('custrecord_da_moni_type');
			log.debug('itemType',itemType);
			var reqQty = requestRec.getValue('custrecord_da_mon_item_qty');
			var reqLocation = requestRec.getValue('custrecord_da_moni_location');

			if(itemType == 5){
				var assemblyitemSearchObj = search.create({
					type: "assemblyitem",
					filters:
						[
							["type","anyof","Assembly"], 
							"AND", 
							["internalid","anyof",reqItem]
							],
							columns:
								[
									search.createColumn({
										name: "itemid",
										sort: search.Sort.ASC,
										label: "Name"
									}),
									search.createColumn({name: "type", label: "Type"}),
									search.createColumn({name: "memberquantity", label: "Member Quantity"}),
									search.createColumn({name: "memberitem", label: "Member Item"}),
                                    search.createColumn({name: "memberunit", label: "Member Unit"}),
									search.createColumn({
										name: "type",
										join: "memberItem",
										label: "Type"
									})
									]
				});
				var searchResultCount = assemblyitemSearchObj.runPaged().count;
				log.debug("assemblyitemSearchObj result count",searchResultCount);
				assemblyitemSearchObj.run().each(function(result){
					var memberItemType = result.getValue({
						name:'type',
						join:'memberItem'
					});
					log.debug('memberItemType',memberItemType);
					if(memberItemType == "InvtPart"){

						var itemId = result.getValue('memberitem');
						var memeberQty = result.getValue('memberquantity');

						var itemLocation = record.load({
							type:'inventoryitem',
							id:itemId
						}).getValue('location');

						log.debug('itemLocation',itemLocation);

						var availQty = 0;

						if(itemLocation){

							var itemSearchObj = search.create({
								type: "item",
								filters:
									[
										["internalid","anyof",itemId],"AND",										
										["inventorylocation.internalid","anyof",itemLocation], 
										"AND", 
										["locationquantityavailable","greaterthan","0"]
										],
										columns:
											[
												search.createColumn({name: "locationquantityavailable", label: "Location Available"})
												]
							});
							var searchResultCount = itemSearchObj.runPaged().count;
							log.debug("itemSearchObj result count",searchResultCount);

							itemSearchObj.run().each(function(result){
								availQty = result.getValue('locationquantityavailable');
								//return true;
							});
						}
						materilTransferRec.selectNewLine({
							sublistId: 'recmachcustrecord_mat_transfer_parent'
						});
						materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_material_item',
							value: itemId,
							ignoreFieldChange: false,
							forceSyncSourcing:true
						});
						materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_to_location',
							value: reqLocation
						});
						var qty = (reqQty * memeberQty);
						materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_material_item_quantity',
							value: (reqQty * memeberQty)
						});
						materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_tran_from_location',
							value: itemLocation
						});
						materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_mat_transfer_avail_qty',
							value: availQty
						});
                       
                      materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_material_item_uom',
							value: result.getValue('memberunit')
						});

						if(availQty < qty){
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_mat_transferable_qty',
								value: availQty
							});
						}else{
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_mat_transferable_qty',
								value: qty
							});
						}	

						materilTransferRec.commitLine({
							sublistId: 'recmachcustrecord_mat_transfer_parent'
						});

					}

					if(memberItemType == "Assembly"){
						var memeberItem = result.getValue('memberitem');
						var assemblyitemSearchObj1 = search.create({
							type: "assemblyitem",
							filters:
								[
									["type","anyof","Assembly"], 
									"AND", 
									["internalid","anyof",memeberItem]
									],
									columns:
										[
											search.createColumn({
												name: "itemid",
												sort: search.Sort.ASC,
												label: "Name"
											}),
											search.createColumn({name: "type", label: "Type"}),
											search.createColumn({name: "memberquantity", label: "Member Quantity"}),
											search.createColumn({name: "memberitem", label: "Member Item"}),
                                            search.createColumn({name: "memberunit", label: "Member Unit"}),
											search.createColumn({
												name: "type",
												join: "memberItem",
												label: "Type"
											})
											]
						});
						var searchResultCount = assemblyitemSearchObj1.runPaged().count;
						log.debug("assemblyitemSearchObj result count",searchResultCount);

						assemblyitemSearchObj1.run().each(function(result){
							var itemId = result.getValue('memberitem');
							var memeberQty = result.getValue('memberquantity');


							var itemLocation = record.load({
								type:'inventoryitem',
								id:itemId
							}).getValue('location');

							log.debug('memberItem',itemId);

							log.debug('itemLocation',itemLocation);
							var availQty = 0;
							if(itemLocation){

								var itemSearchObj = search.create({
									type: "item",
									filters:
										[

											["internalid","anyof",itemId],"AND",
											["inventorylocation.internalid","anyof",itemLocation], 
											"AND", 
											["locationquantityavailable","greaterthan","0"]
											],
											columns:
												[
													search.createColumn({name: "locationquantityavailable", label: "Location Available"})
													]
								});
								var searchResultCount = itemSearchObj.runPaged().count;
								log.debug("itemSearchObj result count",searchResultCount);

								itemSearchObj.run().each(function(result){
									availQty = result.getValue('locationquantityavailable');
									//return true;
								});
							}


							var qty = (reqQty * memeberQty);
							materilTransferRec.selectNewLine({
								sublistId: 'recmachcustrecord_mat_transfer_parent'
							});
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_to_location',
								value: reqLocation
							});
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_material_item',
								value: itemId,
								ignoreFieldChange: false,
								forceSyncSourcing:true
							});
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_material_item_quantity',
								value: (reqQty * memeberQty)
							});
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_tran_from_location',
								value: itemLocation
							});
                           materilTransferRec.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_mat_transfer_parent',
							fieldId: 'custrecord_da_material_item_uom',
							value: result.getValue('memberunit')
						   });
							materilTransferRec.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_mat_transfer_avail_qty',
								value: availQty
							});

							if(availQty < qty){
								materilTransferRec.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_mat_transfer_parent',
									fieldId: 'custrecord_da_mat_transferable_qty',
									value: availQty
								});
							}else{
								materilTransferRec.setCurrentSublistValue({
									sublistId: 'recmachcustrecord_mat_transfer_parent',
									fieldId: 'custrecord_da_mat_transferable_qty',
									value: qty
								});
							}							
							materilTransferRec.commitLine({
								sublistId: 'recmachcustrecord_mat_transfer_parent'
							});

							return true;
						});
					}
					return true;
				});

			}

			if(itemType == 1){
				var itemLocation = record.load({
					type:'inventoryitem',
					id:reqItem
				}).getValue('location');

				log.debug('itemLocation',itemLocation);
				var availQty = 0;

				if(itemLocation){

					var itemSearchObj = search.create({
						type: "item",
						filters:
							[
								["internalid","anyof",reqItem],
								"AND",
								["inventorylocation.internalid","anyof",itemLocation], 
								"AND", 
								["locationquantityavailable","greaterthan","0"]
								],
								columns:
									[
										search.createColumn({name: "locationquantityavailable", label: "Location Available"})
										]
					});
					var searchResultCount = itemSearchObj.runPaged().count;
					log.debug("itemSearchObj result count",searchResultCount);

					itemSearchObj.run().each(function(result){
						availQty = result.getValue('locationquantityavailable');
						//return true;
					});
				}
				materilTransferRec.selectNewLine({
					sublistId: 'recmachcustrecord_mat_transfer_parent'
				});
				materilTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_to_location',
					value: reqLocation
				});
				materilTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_material_item',
					value: reqItem,
					ignoreFieldChange: false,
					forceSyncSourcing:true
				});
				materilTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_material_item_quantity',
					value: reqQty
				});
				materilTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_tran_from_location',
					value: itemLocation
				});
				materilTransferRec.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_mat_transfer_avail_qty',
					value: availQty
				});

				if(availQty < reqQty){
					materilTransferRec.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_mat_transfer_parent',
						fieldId: 'custrecord_da_mat_transferable_qty',
						value: availQty
					});
				}else{
					materilTransferRec.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_mat_transfer_parent',
						fieldId: 'custrecord_da_mat_transferable_qty',
						value: reqQty
					});
				}

				if(availQty >= reqQty){
					materilTransferRec.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_mat_transfer_parent',
						fieldId: 'custrecord_da_can_transfer_items',
						value: true
					});
				}
				materilTransferRec.commitLine({
					sublistId: 'recmachcustrecord_mat_transfer_parent'
				});
			}


			materilTransferRec.save();


		}catch(ex){
			log.error(ex.name,ex.message);

		}
	}


	/**
	 * Executes when the summarize entry point is triggered and applies to the result set.
	 *
	 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
	 * @since 2015.1
	 */
	function summarize(summary) {
		try {
			log.debug("Process Completed");
			var recId = runtime.getCurrentScript().getParameter({name:"custscript_da_mr_parent_rec_id"});
			log.debug('recId',recId);

			var materilTransferRec = record.load({
				type:'customrecord_da_moni_trans',
				id: recId
			})
           materilTransferRec.setValue('custrecord_da_mat_transfer_processed',true);
           materilTransferRec.setValue('custrecord_da_mat_transfer_processing',false);
          materilTransferRec.save();
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};

});
