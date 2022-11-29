/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/search','N/record','N/url','N/ui/dialog'],

		function(search,record,url,dialog) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	var mode,itemSno, lotId;
	function pageInit(scriptContext) {
		mode = scriptContext.mode;
		console.log(scriptContext);
		var type = scriptContext.currentRecord.type;
		console.log(type);		
		if(mode == "create"){
//			Setting job order Id on transfer order

			var url_string = window.location.href;
			console.log(url_string);
			var url1 = new URL(url_string);
			var jobOrderId = url1.searchParams.get("joborderid");
			var subId = url1.searchParams.get("subid");
			var invoiceId = url1.searchParams.get("inv");
			
			var itemid = url1.searchParams.get("itemid");
            lotId = url1.searchParams.get("lotId");
			var invid = url1.searchParams.get("invid");

			itemSno = url1.searchParams.get("itemSno");
			if(itemSno || itemid || invid){
				if(itemSno){
					scriptContext.currentRecord.setValue('custrecord_jo_item_sno',itemSno);
                  scriptContext.currentRecord.setValue('custrecord_jo_ref_serial_lot_number',lotId);
				}else{
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_item',itemid);
					scriptContext.currentRecord.setValue('custrecord_jo_company',invid); //actually customer
				}
				scriptContext.currentRecord.setValue('custrecord_item_purchase_from',1);
			}else if(type == "customrecord_job_order"){
				console.log("dddddddddd");
				/*var invRefField = scriptContext.currentRecord.getField({
					fieldId: 'custrecord_cust_inv_ref_no'
				});
				invRefField.isDisplay = false;*/
				scriptContext.currentRecord.setValue('custrecord_item_purchase_from',2);
			}
          
          if(type == "customrecord_job_order"){
             if(itemSno){
            console.log(true);
            
          }else{
              console.log(false);
            var origInvId = url1.searchParams.get("orignialInvId");
			var itemId = url1.searchParams.get("itemid");
				var customrecord_wrm_warrantyregSearchObj = search.create({
					type: "customrecord_wrm_warrantyreg",
					filters:
						[
							["custrecord_wrm_reg_invoice","anyof",origInvId], 
                            "AND", 
                            ["custrecord_wrm_reg_item","anyof",itemId]
							],
							columns:
								[
									search.createColumn({name: "custrecord_wrm_reg_invoice", label: "Invoice No."}),
									search.createColumn({name: "custrecord_wrm_reg_ref_invoice", label: "Reference Invoice"}),
									search.createColumn({name: "custrecord_wrm_reg_invoicedate", label: "Invoice Date"}),
									search.createColumn({name: "custrecord_wrm_reg_item", label: "Item"}),
									search.createColumn({name: "custrecord_wrm_reg_quantity", label: "Quantity"}),
									search.createColumn({name: "custrecord_wrm_reg_uom", label: "Units"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantyterm", label: "Original Warranty Terms"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantybegin", label: "Original Warranty Start Date"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantyexpire", label: "Warranty Expiration"}),
									search.createColumn({name: "custrecord_wrm_reg_status", label: "Status"}),
									search.createColumn({name: "custrecord_wrm_reg_invoice", label: "Invoice No."})
									]
				});
				var searchResultCount = customrecord_wrm_warrantyregSearchObj.runPaged().count;
				log.debug("customrecord_wrm_warrantyregSearchObj result count",searchResultCount);
				if(searchResultCount > 0){
					customrecord_wrm_warrantyregSearchObj.run().each(function(result){
						scriptContext.currentRecord.setValue('custrecord_warranty_id',result.id);
						scriptContext.currentRecord.setValue('custrecord_jo_warranty_status',result.getValue('custrecord_wrm_reg_status'));
						scriptContext.currentRecord.setValue('custrecord_jo_invoice_no',result.getValue('custrecord_wrm_reg_invoice'));
						scriptContext.currentRecord.setValue('custrecord_jo_original_warranty_terms',result.getValue('custrecord_wrm_reg_warrantyterm'));
					//	scriptContext.currentRecord.setValue('custrecord_jo_origin_warranty_st_date',new Date(result.getValue('custrecord_wrm_reg_warrantybegin')));
						scriptContext.currentRecord.setValue('custrecord_jo_quantity',result.getValue('custrecord_wrm_reg_quantity'));
						//scriptContext.currentRecord.setValue('custrecord_jo_warranty_expiration',new Date(result.getValue('custrecord_wrm_reg_warrantyexpire')));
						scriptContext.currentRecord.setValue('custrecord_jo_unit',result.getValue('custrecord_wrm_reg_uom'));
					//	scriptContext.currentRecord.setValue('custrecord_jo_invoice_date',new Date(result.getValue('custrecord_wrm_reg_invoicedate')));
						//return true;
					});
				}else{
					scriptContext.currentRecord.setValue('custrecord_warranty_id',' ');
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_status',' ');
					scriptContext.currentRecord.setValue('custrecord_jo_invoice_no','');
					scriptContext.currentRecord.setValue('custrecord_jo_original_warranty_terms','');
					scriptContext.currentRecord.setValue('custrecord_jo_origin_warranty_st_date','');
					scriptContext.currentRecord.setValue('custrecord_jo_quantity','');
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_expiration','');
					scriptContext.currentRecord.setValue('custrecord_jo_unit','');
					scriptContext.currentRecord.setValue('custrecord_jo_invoice_date','');
				}
			}
          }
          
         
			
			//setting job order on payment
			if(invoiceId){
				var fieldLookUp = search.lookupFields({
					type: 'invoice',
					id: invoiceId,
					columns: ['custbody_job_order_link']
				});
				if(fieldLookUp.custbody_job_order_link.length > 0){
					scriptContext.currentRecord.setValue('custbody_job_order_link',fieldLookUp.custbody_job_order_link[0].value);
				}

			}
			var location = url1.searchParams.get("loc");
			var estId = url1.searchParams.get("estId");
			scriptContext.currentRecord.setValue('custbody_job_order_link',jobOrderId);	
			if(subId){
				scriptContext.currentRecord.setValue('subsidiary',subId,false,true);
			}
			if(estId && type == "invoice"){
				scriptContext.currentRecord.setValue('customform',127);
			}
		}

		if(mode == "copy"){
			
		}
	}

	/**
	 * Function to be executed when field is changed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
	 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
	 *
	 * @since 2015.2
	 */
	function fieldChanged(scriptContext) {
		if(scriptContext.fieldId == 'custrecord_customer_have'){
			var value = scriptContext.currentRecord.getValue('custrecord_customer_have');
			if(value == 4){
				var ItemField = scriptContext.currentRecord.getField({
					fieldId: 'custpage_item_id'
				});	ItemField.isMandatory = false;
				ItemField.isDisplay = false;
				/*ItemField.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });*/
			}
		}

		if(scriptContext.fieldId == 'custrecord_da_disc_percent'){
			var discountPercent = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_da_disc_percent'
			});
			var qty = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_qty'
			});
			var amount = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_unit_price'
			});
			amount = amount * qty;
			console.log(discountPercent +" "+amount * discountPercent);
			var finalAmount = parseFloat(amount) + parseFloat((amount *(discountPercent/100)));
			console.log(finalAmount);
			scriptContext.currentRecord.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_total',
				value : finalAmount
			});
			//scriptContext.currentRecord.setValue('custrecord_jo_particulars_total',amount * discountPercent);
		}
		if(scriptContext.fieldId == 'custrecord_jo_ref_serial_lot_number'){
			var SerialNo = scriptContext.currentRecord.getValue('custrecord_jo_ref_serial_lot_number');

			if(SerialNo){
				var customrecord_wrm_warrantyregSearchObj = search.create({
					type: "customrecord_wrm_warrantyreg",
					filters:
						[
							["custrecord_wrm_reg_serialnumber","anyof",SerialNo]
							],
							columns:
								[
									search.createColumn({name: "custrecord_wrm_reg_invoice", label: "Invoice No."}),
									search.createColumn({name: "custrecord_wrm_reg_ref_invoice", label: "Reference Invoice"}),
									search.createColumn({name: "custrecord_wrm_reg_invoicedate", label: "Invoice Date"}),
									search.createColumn({name: "custrecord_wrm_reg_item", label: "Item"}),
									search.createColumn({name: "custrecord_wrm_reg_quantity", label: "Quantity"}),
									search.createColumn({name: "custrecord_wrm_reg_uom", label: "Units"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantyterm", label: "Original Warranty Terms"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantybegin", label: "Original Warranty Start Date"}),
									search.createColumn({name: "custrecord_wrm_reg_warrantyexpire", label: "Warranty Expiration"}),
									search.createColumn({name: "custrecord_wrm_reg_status", label: "Status"}),
									search.createColumn({name: "custrecord_wrm_reg_invoice", label: "Invoice No."})
									]
				});
				var searchResultCount = customrecord_wrm_warrantyregSearchObj.runPaged().count;
				log.debug("customrecord_wrm_warrantyregSearchObj result count",searchResultCount);
				if(searchResultCount > 0){
					customrecord_wrm_warrantyregSearchObj.run().each(function(result){
						scriptContext.currentRecord.setValue('custrecord_warranty_id',result.id);
						scriptContext.currentRecord.setValue('custrecord_jo_warranty_status',result.getValue('custrecord_wrm_reg_status'));
						scriptContext.currentRecord.setValue('custrecord_jo_invoice_no',result.getValue('custrecord_wrm_reg_invoice'));
						scriptContext.currentRecord.setValue('custrecord_jo_original_warranty_terms',result.getValue('custrecord_wrm_reg_warrantyterm'));
					//	scriptContext.currentRecord.setValue('custrecord_jo_origin_warranty_st_date',new Date(result.getValue('custrecord_wrm_reg_warrantybegin')));
						scriptContext.currentRecord.setValue('custrecord_jo_quantity',result.getValue('custrecord_wrm_reg_quantity'));
						//scriptContext.currentRecord.setValue('custrecord_jo_warranty_expiration',new Date(result.getValue('custrecord_wrm_reg_warrantyexpire')));
						scriptContext.currentRecord.setValue('custrecord_jo_unit',result.getValue('custrecord_wrm_reg_uom'));
					//	scriptContext.currentRecord.setValue('custrecord_jo_invoice_date',new Date(result.getValue('custrecord_wrm_reg_invoicedate')));
						//return true;
					});
				}else{
					scriptContext.currentRecord.setValue('custrecord_warranty_id',' ');
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_status',' ');
					scriptContext.currentRecord.setValue('custrecord_jo_invoice_no','');
					scriptContext.currentRecord.setValue('custrecord_jo_original_warranty_terms','');
					scriptContext.currentRecord.setValue('custrecord_jo_origin_warranty_st_date','');
					scriptContext.currentRecord.setValue('custrecord_jo_quantity','');
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_expiration','');
					scriptContext.currentRecord.setValue('custrecord_jo_unit','');
					scriptContext.currentRecord.setValue('custrecord_jo_invoice_date','');
				}
			}			
		}
		if(scriptContext.fieldId == 'custrecord_cust_inv_ref_no'){
		}

		if(scriptContext.fieldId == 'custrecord_jo_particulars_type'){
			var type = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_type'
			});
			/*var currIndex = scriptContext.currentRecord.getCurrentSublistIndex({
    sublistId: 'recmachcustrecord_jo_particulars_job_order'
});
          console.log(currIndex);*/

			if(type == 2){
				var salesPrice = scriptContext.currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_jo_particulars_unit_price'
				});
				/*var purchasePriceField = scriptContext.currentRecord.getCurrentSublistField({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_prchase_price_of_vendor'
				});	
				purchasePriceField.isDisabled = false;*/

				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_prchase_price_of_vendor',
					value:salesPrice
				});
			}
		}

		if(scriptContext.fieldId == 'custrecord_select_item_s_no'){

		}

		if(scriptContext.fieldId == 'custrecord_jo_item_sno'){

			var serialNo = scriptContext.currentRecord.getValue('custrecord_jo_item_sno');

			if(serialNo && itemSno){
				var invoiceSearchObj = search.create({
					type: "invoice",
					filters:[
						["type","anyof","CustInvc"], 
						"AND", 
						["shipping","is","F"], 
						"AND", 
						["itemnumber.inventorynumber","contains",serialNo], 
						"AND", 
						["taxline","is","F"], 
						"AND", 
						["shipping","is","F"], 
						"AND", 
						["mainline","is","F"], 
						"AND", 
						["cogs","is","F"]
						],
						columns:
							[
								search.createColumn({name: "item", label: "Item"}),
								search.createColumn({name: "entity", label: "Name"}),
								search.createColumn({
									name: "internalid",
									join: "itemNumber",
									label: "Internal ID"
								})
								]
				});
				var searchResultCount = invoiceSearchObj.runPaged().count;
				console.log("invoiceSearchObj result count",searchResultCount);
				if(searchResultCount > 0){
					/*var ItemField = scriptContext.currentRecord.getField({
						fieldId: 'custpage_item_id'
					});
					ItemField.isDisplay = false;
					ItemField.isMandatory = false;*/
					invoiceSearchObj.run().each(function(result){
						var item = result.getValue('item');
						var entity = result.getValue('entity');
						scriptContext.currentRecord.setValue('custrecord_cust_inv_ref_no',result.id);
						scriptContext.currentRecord.setValue('custrecord_jo_warranty_item',item);
						scriptContext.currentRecord.setValue('custrecord_jo_company',entity);
						//	scriptContext.currentRecord.setValue('custrecord_item_purchase_from',1);
						scriptContext.currentRecord.setValue('custrecord_jo_ref_serial_lot_number',result.getValue({name:'internalid', join:'itemNumber'}));

					});
				}else{
					console.log("Other");
					var InvRefField = scriptContext.currentRecord.getField({
						fieldId: 'custrecord_cust_inv_ref_no'
					});
					InvRefField.isDisplay = false;
					var sNoField = scriptContext.currentRecord.getField({
						fieldId: 'custrecord_jo_ref_serial_lot_number'
					});
					sNoField.isDisplay = false;

					//scriptContext.currentRecord.setValue('custrecord_item_purchase_from',2);
					scriptContext.currentRecord.setValue('custrecord_jo_ref_serial_lot_number','');
					scriptContext.currentRecord.setValue('custrecord_cust_inv_ref_no','');
					scriptContext.currentRecord.setValue('custrecord_jo_warranty_item','');
					scriptContext.currentRecord.setValue('custrecord_jo_company','');

				}

				var customrecord_da_job_cardsSearchObj = search.create({
					type: "customrecord_job_order",
					filters:
						[
							["custrecord_jo_item_sno","is",serialNo]
							],
							columns:[] 
				});
				var previousJobssearchResultCount = customrecord_da_job_cardsSearchObj.runPaged().count;
				console.log("customrecord_da_job_cardsSearchObj result count",previousJobssearchResultCount);

				if(previousJobssearchResultCount > 0){
					scriptContext.currentRecord.setValue('custrecord_da_maintenace_type',2);
				}else{
					scriptContext.currentRecord.setValue('custrecord_da_maintenace_type',1);
				}
			}

		}

		if(scriptContext.fieldId == 'custrecord_cust_phone_no'){

		}

		if(scriptContext.fieldId == 'custrecord_jo_particulars_product'){
			var itemId = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_product'
			});
			var workShopLocation = scriptContext.currentRecord.getValue('custrecord_work_shop_location');
			console.log(itemId);
			if(itemId){
              
              var warrantyStatus = scriptContext.currentRecord.getValue('custrecord_jo_warranty_status');
              if(warrantyStatus == "Under Warranty"){
                scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_jo_particulars_job_order',
						fieldId: 'custrecord_is_vendor_approved',
						value:true,
						ignoreFieldChange: true
					});
              }

				var itemSearchObj = search.create({
					type: "item",
					filters:
						[
							["internalid","anyof",itemId]
							],
							columns:
								[					     
									search.createColumn({name: "displayname", label: "Display Name"}),
									search.createColumn({name: "salesdescription", label: "Description"}),
									search.createColumn({name: "type", label: "Type"}),
									search.createColumn({name: "baseprice", label: "Base Price"}),
									//search.createColumn({name: "custitemitem_arabic_name", label: "Item Arabic Name"}),
									search.createColumn({name: "locationquantityavailable", label: "Location Available"}),
									search.createColumn({
										name: "unitprice",
										join: "pricing",
										label: "Unit Price"
									})
									]
				});
				var searchResultCount = itemSearchObj.runPaged().count;
				log.debug("itemSearchObj result count",searchResultCount);
				itemSearchObj.run().each(function(result){
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_jo_particulars_job_order',
						fieldId: 'custrecord_jo_particulars_description',
						value: result.getValue('salesdescription'),
						ignoreFieldChange: true
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_jo_particulars_job_order',
						fieldId: 'custrecord_jo_particulars_unit_price',
						value: result.getValue({name:'unitprice',join:"pricing"}),
						ignoreFieldChange: true
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_jo_particulars_job_order',
						fieldId: 'custrecord_jo_particulars_total',
						value: result.getValue({name:'unitprice',join:"pricing"}),
						ignoreFieldChange: true
					});
				}); 

				if(workShopLocation){
					itemSearchObj.filters.push(search.createFilter({
						"name"    : "internalid",
						"join"   :"inventorylocation",
						"operator": "anyof",
						"values"  : workShopLocation
					}));
					itemSearchObj.run().each(function(result){
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_jo_particulars_job_order',
							fieldId: 'custrecord_avaialble_qty',
							value: result.getValue({name:'locationquantityavailable'}),
							ignoreFieldChange: true
						});
					});
				}
			}
		}
		if(scriptContext.fieldId == 'custrecord_jo_ref_serial_lot_number'){
			var serailNo = 	scriptContext.currentRecord.getValue('custrecord_jo_ref_serial_lot_number');
			console.log('serailNo'+serailNo);

			if(serailNo){
				var customrecord_wrm_warrantyregSearchObj = search.create({
					type: "customrecord_wrm_warrantyreg",
					filters:
						[
							["custrecord_wrm_reg_serialnumber","anyof",serailNo]
							],
							columns:
								[
									search.createColumn({
										name: "id",
										sort: search.Sort.ASC,
										label: "ID"
									})
									]
				});
				var searchResultCount = customrecord_wrm_warrantyregSearchObj.runPaged().count;
				log.debug("itemreceiptSearchObj result count", searchResultCount);
				if(searchResultCount <= 0){
					scriptContext.currentRecord.setValue('custrecord_warranty_id',"");
				}
				customrecord_wrm_warrantyregSearchObj.run().each(function(result){
					scriptContext.currentRecord.setValue('custrecord_warranty_id',result.id);
					console.log(result.id);
					//return true;
				});
			}			
		}

		if(scriptContext.fieldId == 'custrecord_is_vendor_approved'){
			/*var isVendorApproved = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_is_vendor_approved'
			});
			scriptContext.currentRecord.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_is_under_warranty',
				value:(isVendorApproved)?true:false
			});*/
		}
		if(scriptContext.fieldId == 'custrecord_jo_particulars_qty'){
			var qty = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_qty'
			});
			var itemPrice = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_unit_price'
			});
			if(itemPrice){
				var amount = parseFloat(qty)*parseFloat(itemPrice);
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_jo_particulars_total',
					value:amount
				});
			}
		}
		if(scriptContext.fieldId == 'custrecord_jo_particulars_unit_price'){
			var qty = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_qty'
			});
			var itemPrice = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_unit_price'
			});
			if(itemPrice){
				var amount = parseFloat(qty)*parseFloat(itemPrice);
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_jo_particulars_total',
					value:amount
				});
			}
		}

		if(scriptContext.fieldId == 'custpage_item_id'){
			var itemId = scriptContext.currentRecord.getValue('custpage_item_id');
			scriptContext.currentRecord.setValue('custrecord_jo_warranty_item',itemId);
			console.log('serailNo',serailNo);
		}

		if(scriptContext.fieldId == 'custrecord_jo_ref_serial_lot_number'){
			var serailNo = scriptContext.currentRecord.getValue('custrecord_jo_ref_serial_lot_number');
			scriptContext.currentRecord.setValue('custrecord_hiddden_serial_lot_no',serailNo);
		}
		if(scriptContext.fieldId =="custrecord_jo_subsidiary"){
			var subsidiary = scriptContext.currentRecord.getValue('custrecord_jo_subsidiary');
			/*var sublistValue = scriptContext.currentRecord.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_da_subsidiary_line',
				value: subsidiary,
				ignoreFieldChange: false,
				forceSyncSourcing:false
			});*/

		}

	}
	function openSuitelet(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_ir_print',
			deploymentId: 'customdeploy_ameeri_su_ir_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}
	function openSuiteletFOrSalesOrder(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_su_sale_order_print',
			deploymentId: 'customdeploy_su_sale_order_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openSuiteletFOrLeasingContract(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_lc_print',
			deploymentId: 'customdeploy_ameeri_su_lc_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openCheckSuitelet(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ammeri_su_check_print',
			deploymentId: 'customdeploy_ammeri_su_check_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}


	function jobprint(id){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_su_job_order_print',
			deploymentId: 'customdeploy_su_job_order_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin,
				'print':1
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}
	function generateRepairAgreement(id){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_su_job_order_print',
			deploymentId: 'customdeploy_su_job_order_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openTaskSuitelet(id){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_task_pdf_report',
			deploymentId: 'customdeploy_ameeri_su_task_pdf_report',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}


	function generateQuotation(id,subsidairyID){
		console.log(true);
		if(subsidairyID){ //ps
			window.open(window.location.origin+""+"/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=125&trantype=estimate&&id="+id+"&label=Estimate&printtype=transaction")
		}
		if(subsidairyID == 16){ //sd
			window.open(window.location.origin+""+"/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&formnumber=144&trantype=estimate&&id="+id+"&label=Estimate&printtype=transaction")
		}

	}


	function createtransferOrder(id,subid,loc){
		window.open(window.location.origin+""+"/app/accounting/transactions/trnfrord.nl?whence=&joborderid="+id+"&subid="+subid+"&loc="+loc);		
	}


	function recieveItems(poId){
		window.open(window.location.origin+""+"/app/accounting/transactions/itemrcpt.nl?transform=purchord&whence=&id="+poId+"&e=T&memdoc=0");
	}

	function generateInvoice(estId,joborderId){
		window.open(window.location.origin+""+"/app/accounting/transactions/custinvc.nl?id="+estId+"&e=T&transform=salesord&billorderedtime=T&memdoc=0&whence=","_self");
	}
	
	function generateFulfill(estId,joborderId){
		window.open(window.location.origin+""+"/app/accounting/transactions/itemship.nl?id="+estId+"&e=T&transform=salesord&memdoc=0&whence=","_self");
	}

	/**
	 * Function to be executed when field is slaved.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord -. Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 *
	 * @since 2015.2
	 */
	function postSourcing(scriptContext) {
		try{
			if(scriptContext.fieldId == 'custrecord_jo_warranty_item'){
				var sNO = scriptContext.currentRecord.getValue('custrecord_hiddden_serial_lot_no');
				if(true){
					scriptContext.currentRecord.setValue('custrecord_jo_ref_serial_lot_number',lotId);
				}	
			}

			if(scriptContext.fieldId == 'custrecord_jo_company'){}



			if(scriptContext.fieldId == 'subsidiary'){
				var url_string = window.location.href;
				console.log(url_string);
				var url1 = new URL(url_string);
				var location = url1.searchParams.get("loc");
				if(location){

					var jobOrderID = url1.searchParams.get("joborderid");
					var objRecord = scriptContext.currentRecord;
					var customrecord_jo_particularsSearchObj = search.create({
						type: "customrecord_jo_particulars",
						filters:
							[
								["custrecord_jo_particulars_job_order","anyof",jobOrderID], 
								"AND", 
								["custrecord_create_to","is","T"]
								],
								columns:
									[
										search.createColumn({name: "custrecord_jo_particulars_product", label: "Product"}),
										search.createColumn({name: "custrecord_jo_particulars_qty", label: "Qty"}),
										search.createColumn({name: "custrecord_jo_particulars_total", label: "total"})
										]
					});
					var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
					log.debug("customrecord_jo_particularsSearchObj result count",searchResultCount);
					customrecord_jo_particularsSearchObj.run().each(function(result){
						objRecord.selectNewLine({
							sublistId: 'item'
						});
						objRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							value: result.getValue('custrecord_jo_particulars_product'),
							ignoreFieldChange: true
						});
						objRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							value: result.getValue('custrecord_jo_particulars_qty'),
							ignoreFieldChange: true
						});
						objRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'amount',
							value: result.getValue('custrecord_jo_particulars_total'),
							ignoreFieldChange: true
						});
						objRecord.commitLine({
							sublistId: 'item'
						});
						return true;
					});
					scriptContext.currentRecord.setValue('transferlocation',location);
				}
			}

			if(scriptContext.fieldId == 'transferlocation'){}
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	/**
	 * Function to be executed after sublist is inserted, removed, or edited.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function sublistChanged(scriptContext) {

	}

	/**
	 * Function to be executed after line is selected.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function lineInit(scriptContext) {
		try{

			var subsidiary = scriptContext.currentRecord.getValue('custrecord_jo_subsidiary');
			console.log(subsidiary);


			/*var sublistValue = scriptContext.currentRecord.setCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_da_subsidiary_line',
				value: subsidiary,
				ignoreFieldChange: false,
				forceSyncSourcing:true
			});

			var itemID = objRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_jo_particulars_job_order',
				fieldId: 'custrecord_jo_particulars_product'
			});
			if(itemID){
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_jo_particulars_job_order',
					fieldId: 'custrecord_jo_particulars_product',
					value: itemID
				});
			}*/


		}catch(ex){
			console.log(ex.name,ex.message);
		}
	}

	/**
	 * Validation function to be executed when field is changed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
	 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
	 *
	 * @returns {boolean} Return true if field is valid
	 *
	 * @since 2015.2
	 */
	function validateField(scriptContext) {

	}

	/**
	 * Validation function to be executed when sublist line is committed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateLine(scriptContext) {

	}

	/**
	 * Validation function to be executed when sublist line is inserted.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateInsert(scriptContext) {

	}

	/**
	 * Validation function to be executed when record is deleted.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateDelete(scriptContext) {

	}

	/**
	 * Validation function to be executed when record is saved.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @returns {boolean} Return true if record is valid
	 *
	 * @since 2015.2
	 */
	function saveRecord(scriptContext) {
		try{
			return true ;
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	function openSuitelet(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_ir_print',
			deploymentId: 'customdeploy_ameeri_su_ir_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}
function openSuitelet1(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_da_su_ir_without_cost',
			deploymentId: 'customdeploy_da_su_ir_without_cost',
			params:{
				'recordId1':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openCheckSuitelet(id){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ammeri_su_check_print',
			deploymentId: 'customdeploy_ammeri_su_check_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openSuiteletFOrLeasingContract(id,record){
		console.log(id);
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_lc_print',
			deploymentId: 'customdeploy_ameeri_su_lc_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin,
				'record':record
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openTransferSuitelet(id){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_su_transfer_print',
			deploymentId: 'customdeploy_su_transfer_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	function openSuiteletForCustRefund(id){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_ameeri_su_cust_ref_print',
			deploymentId: 'customdeploy_ameeri_su_cust_ref_print',
			params:{
				'recordId':id,
				'urlorigin':window.location.origin
			}
		});
		console.log(suiteletUrl);
		window.open(suiteletUrl);
	}

	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
		saveRecord: saveRecord,
//		createso:createso,
		openSuitelet:openSuitelet,
      openSuitelet1:openSuitelet1,
		openSuiteletFOrSalesOrder:openSuiteletFOrSalesOrder,
		openSuiteletFOrLeasingContract:openSuiteletFOrLeasingContract,
		openCheckSuitelet:openCheckSuitelet,
		generateRepairAgreement:generateRepairAgreement,
		generateQuotation:generateQuotation,
		createtransferOrder:createtransferOrder,
		recieveItems:recieveItems,
		generateInvoice:generateInvoice,
		openTaskSuitelet:openTaskSuitelet,
		jobprint:jobprint,
		openSuiteletForCustRefund:openSuiteletForCustRefund,
		openTransferSuitelet:openTransferSuitelet,
		generateFulfill:generateFulfill

	};

});