/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/runtime','N/email'],

		function(search,record,runtime,email) {

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
			var recId = runtime.getCurrentScript().getParameter({name:"custscript_rec_id"});
			log.debug('recId',recId);


			return search.create({
				type: "customrecord_inventory_transfer_bg_data",
				filters:
					[
						["custrecord_parent_id","anyof",recId]
						],
						columns:
							['internalid']
			});
			var searchResultCount = customrecord_inventory_transfer_bg_dataSearchObj.runPaged().count;
			log.debug("customrecord_inventory_transfer_bg_dataSearchObj result count",searchResultCount);

		}catch(ex){
			log.error(ex.name,'getInputData state, message = '+ex.message);
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
			var searchResult = JSON.parse(context.value);
			var values = searchResult.values;
			var internalid = values.internalid.value;
			log.debug('internalid',internalid);
			context.write({
				key:internalid,
				value:internalid
			})
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
			var recID = JSON.parse(context.key);

			log.debug('recID',recID);

			var dataRec = record.load({
				type:'customrecord_inventory_transfer_bg_data',
				id:recID
			});

			var Item = dataRec.getValue('custrecord_job_item');			
			var fromLocation = dataRec.getValue('custrecord_from_location');
			var toLocation = dataRec.getValue('custrecord_to_location');
			var jobId = dataRec.getValue('custrecord_job_card_id');
			var sparePartId = dataRec.getValue('custrecord_spare_part_ref');
			var serialNo = dataRec.getValue('custrecord_item_serial_id');
			var returnToApple = dataRec.getValue('custrecord_item_return_to_apple');
          
          var sector = dataRec.getValue('custrecord_da_inv_tranfer_data_class');
          var department = dataRec.getValue('custrecord_da_inv_transfer_data_dept');

			var itemSearchObj = search.create({
				type: "item",
				filters:
					[
						["inventorylocation.internalid","anyof",fromLocation], 
						"AND", 
						["internalid","anyof",Item]
						],
						columns:
							[
								search.createColumn({name: "itemid", label: "Name"}),
								search.createColumn({name: "locationquantityavailable", label: "Location Available"})
								]
			});

			var avaiQty = 0;
			itemSearchObj.run().each(function(result){
				avaiQty = result.getValue('locationquantityavailable');
				return true;
			});

			if(avaiQty > 0){
				var inventoryTransferRec = record.create({
					type:'inventorytransfer',
					isDynamic:true
				});
              inventoryTransferRec.setValue('department',department);
              inventoryTransferRec.setValue('class',sector);

				inventoryTransferRec.setValue('location',fromLocation);
				inventoryTransferRec.setValue('transferlocation',toLocation);
				inventoryTransferRec.setValue('custbody_da_job_card_ref',jobId);
				inventoryTransferRec.selectNewLine({
					sublistId: 'inventory'
				});
				inventoryTransferRec.setCurrentSublistValue({
					sublistId: 'inventory',
					fieldId: 'item',
					value: Item,
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

				if(serialNo){
					var subrec = inventoryTransferRec.getCurrentSublistSubrecord({
						sublistId: 'inventory',
						fieldId: 'inventorydetail'
					});
					subrec.selectNewLine({
						sublistId: 'inventoryassignment'
					});
					//log.debug('serialid',result.getValue('custrecord_da_transfer_serial_no_kgb'));
					subrec.setCurrentSublistValue({
						sublistId: 'inventoryassignment',
						fieldId: 'issueinventorynumber',
						value: serialNo
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
					id: sparePartId,
					values: {
						'custrecord_da_item_received': true,
						'custrecord_da_spare_part_new_serial':serialNo
					},
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
				var customrecord_da_spare_part_request_itemsSearchObj = search.create({
					type: "customrecord_da_spare_part_request_items",
					filters:
						[
							["custrecord_da_spare_part_ref_2","anyof",sparePartId]
							],
							columns:[]
				});
				var searchResultCount = customrecord_da_spare_part_request_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_spare_part_request_itemsSearchObj result count",searchResultCount);
				customrecord_da_spare_part_request_itemsSearchObj.run().each(function(result){
					record.delete({
						type:'customrecord_da_spare_part_request_items',
						id: result.id
					});
					return true;
				});

				dataRec.setValue('custrecord_da_item_transferred',true);
				dataRec.save();

			}



		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}

	function summarize(context){
		try{
			var recId = runtime.getCurrentScript().getParameter({name:"custscript_rec_id"});
			log.debug('recId',recId);

			var readyToTransferRec = record.load({
				type:'customrecord_ready_to_transfer',
				id:recId
			});
			readyToTransferRec.setValue('custrecord_processing',false);
			readyToTransferRec.setValue('custrecord_processed',true);
			readyToTransferRec.save();


			var customrecord_inventory_transfer_bg_dataSearchObj = search.create({
				type: "customrecord_inventory_transfer_bg_data",
				filters:
					[
						["custrecord_parent_id","anyof",recId]
						],
						columns:
							[
								search.createColumn({name: "custrecord_job_item", label: "Item"}),
								search.createColumn({name: "custrecord_from_location", label: "From Location"}),
								search.createColumn({name: "custrecord_to_location", label: "To Location"}),
								search.createColumn({name: "custrecord_job_card_id", label: "Job Card Id"}),
								search.createColumn({name: "custrecord_inv_tran_job_card_technician", label: "Technician"}),
								search.createColumn({name: "custrecord_da_item_transferred", label: "Transferred?"}),
								search.createColumn({name: "custrecord_item_serial_id", label: "New Serial"})
								]
			});
			var searchResultCount = customrecord_inventory_transfer_bg_dataSearchObj.runPaged().count;
			log.debug("customrecord_inventory_transfer_bg_dataSearchObj result count",searchResultCount);

			var dataArr  = [];
			customrecord_inventory_transfer_bg_dataSearchObj.run().each(function(result){
              var transferred = result.getValue('custrecord_da_item_transferred');
              if(transferred){
                transferred = "yes";
              }else{
                transferred = "No";
              }
				var emailObj = {
						'item': result.getText('custrecord_job_item'),
						'fromloc': result.getText('custrecord_from_location'),
						'toloc': result.getText('custrecord_to_location'),
						'transferred':transferred,
						'jcid':result.getText('custrecord_job_card_id'),
						'tech':result.getText('custrecord_inv_tran_job_card_technician'),
						'serial':result.getText('custrecord_item_serial_id')
				};
				dataArr.push(emailObj);
				return true;
			});

			var emails = record.load({
				type:'customrecord_da_maintenance_settings',
				id:1
			}).getValue('custrecord_da_job_emails_transfer');

			var recipientEmails = emails.split(',');

			log.debug('dataArr',dataArr);

			if (dataArr.length > 0) {
				var htmlBody = '';
				for (i in dataArr) {
					htmlBody += '<tr><td>' + dataArr[i].item+ '</td><td>' + dataArr[i].fromloc+ '</td><td>' + dataArr[i].toloc+ '</td><td>'+dataArr[i].transferred+'</td><td>' + dataArr[i].jcid+ '</td><td>'+dataArr[i].tech+'</td><td>' + dataArr[i].serial+'</td></tr>';
				}
				htmlBody = '<b>Inventory Transfer Deatils for the Job Cards , please find the details below.</b><table border = "4"><tr><th>Item</th><th>From Location</th><th>To Location</th><th>Transferred</th><th>Job Card ID</th><th>Technician</th><th>Serial No</th></tr>' + htmlBody + '</table>';
				log.debug('s',htmlBody);

				email.sendBulk({
					author : -5,
					recipients : recipientEmails,
					subject : 'Inventory Transfer Data Notification',
					body : htmlBody
				});

			}

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}




	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};

});