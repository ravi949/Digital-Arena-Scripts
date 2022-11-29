	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope TargetAccount
	 */
	define(['N/runtime', 'N/record', 'N/search'],
		function(runtime, record, search) {
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
				try {} catch (ex) {
					log.error(ex.name, ex.message);
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
			function beforeSubmit(scriptContext) {}
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
				try {

					var scriptObj = runtime.getCurrentScript();

					if(scriptObj.deploymentId == 'customdeploy_da_ue_invoice_3dp'){
						var customrecord_da_gl_data_baseSearchObj = search.create({
						type: "customrecord_da_gl_data_base",
						filters: [
							["custrecord_da_gl_impact_created_from", "anyof", scriptContext.newRecord.id]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							}),
							search.createColumn({
								name: "custrecord_da_gl_credit",
								label: "Credit Amount"
							}),
							search.createColumn({
								name: "custrecord_da_gl_debit",
								label: "Debit Amount"
							})
						]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_gl_data_base',
							id: result.id
						})
						return true;
					});
					var invoiceRec = record.load({
						type: 'invoice',
						id: scriptContext.newRecord.id,
                      isDynamic: true
					});
					var lineCount = invoiceRec.getLineCount({
						sublistId: 'item'
					});
                      var unitCost = 0; 
                      for (var i = 0; i < lineCount; i++) {
						var itemId = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						var location = invoiceRec.getValue({
							fieldId: 'location'
						});
                        
                        var itemType = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type',
							line: i
						});

						if(itemType == 1){
                        log.debug('itemId',itemId +"");
						
						var itemSearchObj = search.create({
							type: "item",
							filters: [
								["internalid", "anyof", itemId],
								"AND",
								["inventorylocation.internalid", "anyof", location]
							],
							columns: [
								search.createColumn({
									name: "locationaveragecost",
									label: "Location Average Cost"
								})
							]
						});
						var searchResultCount = itemSearchObj.runPaged().count;
						itemSearchObj.run().each(function(result) {
							unitCost = result.getValue('locationaveragecost');
							return true;
						});
                        
                        
                        
                        invoiceRec.selectLine({
                            sublistId: 'item',
                            line: i
                        });
						invoiceRec.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_average_cost_in_decimal',
                            value:unitCost
						});
                        invoiceRec.commitLine({
                          sublistId: 'item'
                        });
                        }
						
					}
					var postingPeriod = invoiceRec.getValue('postingperiod');
					var subsidiary = invoiceRec.getValue('subsidiary');
					var createdFrom = invoiceRec.getValue('createdfrom');
					var date = invoiceRec.getValue('trandate');
					var tranId = scriptContext.newRecord.id;
					var location = invoiceRec.getValue('location');
					var department = invoiceRec.getValue('department');
					var headClass = invoiceRec.getValue('class');
					var total = invoiceRec.getValue('custbody_da_total_3_decimal');
					var memo = invoiceRec.getValue('memo');
					var rounndingGainLoass = invoiceRec.getValue('custbody_da_rounding_gain_loss');

					var subTotal = invoiceRec.getValue('custbody_da_subtotal');
					var taxHeaderAmount = invoiceRec.getValue('custbody_da_tax_header_amount_complia');
					var headerDiscount = invoiceRec.getValue('custbody_da_header_discount');
                      log.debug('deatils', subTotal + "taxHeaderAmount" + taxHeaderAmount+ " headerDiscount" + headerDiscount);

					total = parseFloat(subTotal) + parseFloat(taxHeaderAmount) + parseFloat(headerDiscount);
					if (total > 0) {
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', scriptContext.newRecord.getValue('custbody_da_customer_ar_account'));
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_debit', total.toFixed(3));
						glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // invoice
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.setValue('custrecord_da_gl_department', department);
						glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
						glDatabaseRec.save();
					}

					var exchangeRate = invoiceRec.getValue('exchangerate');
					//log.debug('createdFromText', createdFromText);
					//log.debug('total amount creating');
					log.debug('lineCount', lineCount);
					for (var i = 0; i < lineCount; i++) {
						var location = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
						var amount = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_line_amount_3_decimal',
							line: i
						});
						var salesAccount = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_revenue_account',
							line: i
						});
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', salesAccount);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_credit', Number((amount * exchangeRate)).toFixed(3));
						//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // Invoice
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.save();

						var itemType = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type',
							line: i
						});

						if(itemType == 1){
                          
                            var itemID = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'item',
								line: i
							});
							var cogsAccount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_cogs_account',
								line: i
							});
							var cogsAmount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_cogs_3_decimal',
								line: i
							});
                          
                          var location = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'location',
								line: i
							});
                          
                          var qty = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								line: i
							});
                          
                          var unitCost;
                          var itemSearchObj = search.create({
									type: "item",
									filters: [
										["internalid", "anyof", itemID],
										"AND",
										["inventorylocation.internalid", "anyof", location]
									],
									columns: [										
										search.createColumn({
											name: "locationaveragecost",
											label: "Location Average Cost"
										})
									]
								});
								var searchResultCount = itemSearchObj.runPaged().count;
								itemSearchObj.run().each(function(result) {
									unitCost = result.getValue('locationaveragecost');
									return true;
								});
                          
                            cogsAmount = (qty * unitCost).toFixed(3);

							var invtAssetAccount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_asset_account',
								line: i
							}); 

							if(!createdFrom){
								var glDatabaseRec = record.create({
								   type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', (cogsAmount));
								glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost Of Sales");
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // Invoice
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();

								var glDatabaseRec = record.create({
								   type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_credit', (cogsAmount));
								glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost Of Sales");
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // Invoice
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
							}
						}
					}

					//tax Amount 

					var taxAmount = invoiceRec.getValue('custbody_da_tax_header_amount_complia');

					if(taxAmount > 0){

							var vatAccount = invoiceRec.getValue('custbody_da_vat_on_sales_acc_invoice');
							var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', vatAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', taxAmount.toFixed(3));
							glDatabaseRec.setValue('custrecord_da_gl_memo', "VAT");
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // Invoice
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('custbody_da_tax_authority_ns'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					}

					var discountAmount = invoiceRec.getValue('custbody_da_header_discount');

					if(discountAmount < 0){
						discountAmount = -(discountAmount);
					}

					if(discountAmount > 0){

							var discAccount = invoiceRec.getValue('custbody_da_discount_account_header');
							var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', discAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', discountAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', "Discount");
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 7); // Invoice
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					}
                      
                      invoiceRec.save();

                            var credit3DPAmt = 0;
	                        var debit3DPAmt = 0;
	                        var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					        log.debug("customrecord_da_gl_data_baseSearchObj result invoice count", searchResultCount);
	                        customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
	                        	var recId = result.id;
	                        	//log.debug('recId',recId);
	                            var credit3DP = result.getValue('custrecord_da_gl_credit');
	                            log.debug('credit3DP', credit3DP);
	                            var debit3DP = result.getValue('custrecord_da_gl_debit');
	                            log.debug('debit3DP', debit3DP);
	                            credit3DP = (credit3DP) ? credit3DP : 0;
	                            debit3DP = (debit3DP) ? debit3DP : 0;
	                            if(credit3DP > 0){
	                            	credit3DPAmt = parseFloat(credit3DPAmt) + parseFloat(credit3DP);
	                                log.debug('credit3DPAmt', credit3DPAmt);
	                            }
	                            else {
	                            	debit3DPAmt = parseFloat(debit3DPAmt) + parseFloat(debit3DP);
	                                log.debug('debit3DPAmt', debit3DPAmt);
	                            }
	                            
	                            return true;
	                        });
	                        if (Number(credit3DPAmt) != Number(debit3DPAmt)) {
	                            if (credit3DPAmt > debit3DPAmt) {
	                                var debitDiff = parseFloat(credit3DPAmt) - parseFloat(debit3DPAmt);
	                                log.debug('debitDiff', debitDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_debit', Number(debitDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecDebit = trialBalRec.save();
	                                log.debug('trialBalRecDebit', trialBalRecDebit);
	                            } else {
	                                var creditDiff = parseFloat(debit3DPAmt) - parseFloat(credit3DPAmt);
	                                log.debug('creditDiff', creditDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_credit', Number(creditDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecCredit = trialBalRec.save();
	                                log.debug('trialBalRecCredit', trialBalRecCredit);
	                            }
	                        }

					}

					if(scriptObj.deploymentId == 'customdeploy_da_cash_sale_3dp'){
						var customrecord_da_gl_data_baseSearchObj = search.create({
						type: "customrecord_da_gl_data_base",
						filters: [
							["custrecord_da_gl_impact_created_from", "anyof", scriptContext.newRecord.id]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							}),
							search.createColumn({
								name: "custrecord_da_gl_credit",
								label: "Credit Amount"
							}),
							search.createColumn({
								name: "custrecord_da_gl_debit",
								label: "Debit Amount"
							})
						]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_gl_data_base',
							id: result.id
						})
						return true;
					});
					var invoiceRec = record.load({
						type: 'cashsale',
						id: scriptContext.newRecord.id,
						isDynamic :true
					});


					var lineCount = invoiceRec.getLineCount({
						sublistId: 'item'
					});
                      var unitCost = 0; 
                      for (var i = 0; i < lineCount; i++) {
						var itemId = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
                        
                        var itemType = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type',
							line: i
						});

						if(itemType == 1){
                        log.debug('itemId',itemId +"");
                          var location = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
						
						var itemSearchObj = search.create({
							type: "item",
							filters: [
								["internalid", "anyof", itemId],
								"AND",
								["inventorylocation.internalid", "anyof", location]
							],
							columns: [
								search.createColumn({
									name: "locationaveragecost",
									label: "Location Average Cost"
								})
							]
						});
						var searchResultCount = itemSearchObj.runPaged().count;
                        log.debug('searchResultCount',searchResultCount);
						itemSearchObj.run().each(function(result) {
							unitCost = result.getValue('locationaveragecost');
							return true;
						});
                        
                        
                        
                        invoiceRec.selectLine({
                            sublistId: 'item',
                            line: i
                        });
						invoiceRec.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_average_cost_in_decimal',
                            value:unitCost
						});
                        invoiceRec.commitLine({
                          sublistId: 'item'
                        });
                        }
						
					}
					var lineCount = invoiceRec.getLineCount({
						sublistId: 'item'
					});
					var postingPeriod = invoiceRec.getValue('postingperiod');
					var subsidiary = invoiceRec.getValue('subsidiary');
					var date = invoiceRec.getValue('trandate');
					var tranId = scriptContext.newRecord.id;
					var location = invoiceRec.getValue('location');
					var department = invoiceRec.getValue('department');
					var headClass = invoiceRec.getValue('class');
					var total = invoiceRec.getValue('custbody_da_total_3_decimal');
					var memo = invoiceRec.getValue('memo');
					var rounndingGainLoass = invoiceRec.getValue('custbody_da_rounding_gain_loss');

					var subTotal = invoiceRec.getValue('custbody_da_subtotal');
					var taxHeaderAmount = invoiceRec.getValue('custbody_da_tax_header_amount_complia');
					var headerDiscount = invoiceRec.getValue('custbody_da_header_discount');

					total = parseFloat(subTotal) + parseFloat(taxHeaderAmount) + parseFloat(headerDiscount);
					if (total > 0) {
                      
                      var account = scriptContext.newRecord.getValue('account');
                      if(account){
                        account = account;
                      }else{
                        account = scriptContext.newRecord.getValue('custbody_da_gl_impact_customer_pay_acc');
                      }
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', account);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_debit', total.toFixed(3));
						glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // invoice
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.setValue('custrecord_da_gl_department', department);
						glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
						glDatabaseRec.save();
					}

					var createdFrom = invoiceRec.getValue('createdfrom');
					var exchangerate = invoiceRec.getValue('exchangerate');
					//log.debug('createdFromText', createdFromText);
					//log.debug('total amount creating');
					log.debug('lineCount', lineCount);
					for (var i = 0; i < lineCount; i++) {
						var location = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'location',
							line: i
						});
						var amount = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_line_amount_3_decimal',
							line: i
						});
						var salesAccount = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_revenue_account',
							line: i
						});
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', salesAccount);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_credit', Number(amount * exchangerate).toFixed(3));
						//glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // Invoice
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.save();

						var itemType = invoiceRec.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_da_item_type',
							line: i
						});

						if(itemType == 1){
                          
                            var itemID = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'item',
								line: i
							});
							var cogsAccount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_cogs_account',
								line: i
							});
							var cogsAmount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_cogs_3_decimal',
								line: i
							});
                          
                          var location = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'location',
								line: i
							});
                          
                          var qty = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								line: i
							});
                          
                          var unitCost;
                          var itemSearchObj = search.create({
									type: "item",
									filters: [
										["internalid", "anyof", itemID],
										"AND",
										["inventorylocation.internalid", "anyof", location]
									],
									columns: [										
										search.createColumn({
											name: "locationaveragecost",
											label: "Location Average Cost"
										})
									]
								});
								var searchResultCount = itemSearchObj.runPaged().count;
								itemSearchObj.run().each(function(result) {
									unitCost = result.getValue('locationaveragecost');
									return true;
								});
                          
                          cogsAmount = (qty * unitCost).toFixed(3);

							var invtAssetAccount = invoiceRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_da_item_asset_account',
								line: i
							}); 

							if(!createdFrom){
								var glDatabaseRec = record.create({
								  type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', cogsAmount);
								glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost Of Sales");
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // Invoice
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();

								var glDatabaseRec = record.create({
								  type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_credit', cogsAmount);
								glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost Of Sales");
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // Invoice
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
							}


							
						}
					}

					//tax Amount 

					var taxAmount = invoiceRec.getValue('custbody_da_tax_header_amount_complia');

					if(taxAmount > 0){

							var vatAccount = invoiceRec.getValue('custbody_da_vat_on_sales_acc_invoice');
							var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', vatAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_credit', taxAmount.toFixed(3));
							glDatabaseRec.setValue('custrecord_da_gl_memo', "VAT");
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // Invoice
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('custbody_da_tax_authority_ns'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					}


					var discountAmount = invoiceRec.getValue('custbody_da_header_discount');

					if(discountAmount < 0){
						discountAmount = -(discountAmount);
					}

					if(discountAmount > 0){

							var discAccount = invoiceRec.getValue('custbody_da_discount_account_header');
							var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', discAccount);
							glDatabaseRec.setValue('custrecord_da_gl_date', date);
							glDatabaseRec.setValue('custrecord_da_gl_debit', discountAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', "Discount");
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 5); // cash sale
							glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					}
                      invoiceRec.save();
                            var credit3DPAmt = 0;
	                        var debit3DPAmt = 0;
	                        var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					        log.debug("customrecord_da_gl_data_baseSearchObj result cash sale count", searchResultCount);
	                        customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
	                        	var recordId = result.id;
	                        	//log.debug('recordId',recordId);
	                            var credit3DP = result.getValue('custrecord_da_gl_credit');
	                            log.debug('credit3DP', credit3DP);
	                            var debit3DP = result.getValue('custrecord_da_gl_debit');
	                            log.debug('debit3DP', debit3DP);
	                            credit3DP = (credit3DP) ? credit3DP : 0;
	                            debit3DP = (debit3DP) ? debit3DP : 0;
	                            if(credit3DP > 0){
	                            	credit3DPAmt = parseFloat(credit3DPAmt) + parseFloat(credit3DP);
	                                log.debug('credit3DPAmt', credit3DPAmt);
	                            }
	                            else {
	                            	debit3DPAmt = parseFloat(debit3DPAmt) + parseFloat(debit3DP);
	                                log.debug('debit3DPAmt', debit3DPAmt);
	                            }
	                            
	                            return true;
	                        });
	                        if (Number(credit3DPAmt) != Number(debit3DPAmt)) {
	                            if (credit3DPAmt > debit3DPAmt) {
	                                var debitDiff = parseFloat(credit3DPAmt) - parseFloat(debit3DPAmt);
	                                log.debug('debitDiff', debitDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_debit', Number(debitDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecDebit = trialBalRec.save();
	                                log.debug('trialBalRecDebit', trialBalRecDebit);
	                            } else {
	                                var creditDiff = parseFloat(debit3DPAmt) - parseFloat(credit3DPAmt);
	                                log.debug('creditDiff', creditDiff);
	                                var trialBalRec = record.create({
	                                    type: "customrecord_da_gl_data_base",
	                                    isDynamic: true
	                                });
	                                trialBalRec.setValue('custrecord_da_gl_account', rounndingGainLoass);
	                                trialBalRec.setValue('custrecord_da_gl_memo', 'Round Of Gain/Loss');
	                                trialBalRec.setValue('custrecord_da_gl_credit', Number(creditDiff).toFixed(3));
									trialBalRec.setValue('custrecord_da_gl_date', date);
									trialBalRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									trialBalRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
	                                var trialBalRecCredit = trialBalRec.save();
	                                log.debug('trialBalRecCredit', trialBalRecCredit);
	                            }
	                        }

					}
					

				} catch (ex) {
					log.error(ex.name, ex.message);
				}
			}
			return {
				beforeLoad: beforeLoad,
				beforeSubmit: beforeSubmit,
				afterSubmit: afterSubmit
			};
		});