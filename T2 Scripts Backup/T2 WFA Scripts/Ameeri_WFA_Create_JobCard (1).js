/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task','N/search','N/record'],

		function(task,search,record) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @Since 2016.1
	 */
	function onAction(scriptContext) {
		try{ 

			var jobRecordId = scriptContext.newRecord.id;
//"AND", 						["custrecord_jo_particulars_type","anyof","3"]
			var customrecord_jo_particularsSearchObj = search.create({
				type: "customrecord_jo_particulars",
				filters:
					[
						["custrecord_jo_particulars_job_order","anyof",jobRecordId], 
						
						],
						columns:
							[
								search.createColumn({
									name: "name",
									sort: search.Sort.ASC,
									label: "ID"
								}),
								search.createColumn({name: "custrecord_jo_particulars_job_order", label: "Work Order"}),
								search.createColumn({name: "custrecord_jo_particulars_product", label: "Service/Item"}),
								search.createColumn({name: "custrecord_jo_particulars_description", label: "Description"}),
								search.createColumn({name: "custrecord_avaialble_qty", label: "Avail. Qty"}),
								search.createColumn({name: "custrecord_jo_particulars_qty", label: "Qty"}),
								search.createColumn({name: "custrecord_jo_particulars_unit_price", label: "Unit Price"}),
								search.createColumn({name: "custrecord_jo_particulars_total", label: "Total"}),
								search.createColumn({name: "custrecord_jo_particulars_assigned_to", label: "Assigned To"}),
								]
			});
			var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
			log.debug("customrecord_jo_particularsSearchObj result count",searchResultCount);

			if(searchResultCount > 0){
				var salesOrder = scriptContext.newRecord.getValue('custrecord_da_job_card_sales_order');
				var soRec;
				if(salesOrder){
					soRec = record.load({
						type:'salesorder',
						id:salesOrder,
						isDynamic:true
					});
				}else{
					var jobOrderRec = scriptContext.newRecord;
					var workshopLocation = jobOrderRec.getValue('custrecord_work_shop_location');
					var customer = jobOrderRec.getValue('custrecord_jo_company');
					soRec = record.create({
						type:'salesorder',
						isDynamic: true  
					});
					soRec.setValue('entity',customer);
					soRec.setValue('location',workshopLocation);
					soRec.setValue('custbody_job_order_link',jobRecordId);
					soRec.setValue('orderstatus',"B");
				}
				customrecord_jo_particularsSearchObj.run().each(function(result){
					var item = result.getValue('custrecord_jo_particulars_product');

					var qty = result.getValue('custrecord_jo_particulars_qty');

					var unitRate = result.getValue('custrecord_jo_particulars_unit_price');

					var amount = result.getValue('custrecord_jo_particulars_total');

					soRec.selectNewLine({
						sublistId: 'item'
					});
					soRec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						value: item,
						ignoreFieldChange: false,
						forceSyncSourcing:true
					});
					soRec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: qty,
						ignoreFieldChange: true
					});
					soRec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: unitRate,
						ignoreFieldChange: true
					});
					soRec.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						value: amount,
						ignoreFieldChange: true
					});

					soRec.commitLine('item');
					return true;
				});

				var soId = soRec.save();
				
				scriptContext.newRecord.setValue('custrecord_da_job_card_sales_order',soId);
			}



		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});