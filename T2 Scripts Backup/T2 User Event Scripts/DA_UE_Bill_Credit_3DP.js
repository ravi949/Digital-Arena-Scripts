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
					var billCreditRec = record.load({
						type: 'vendorcredit',
						id: scriptContext.newRecord.id
					});
					var lineCount = billCreditRec.getLineCount({
						sublistId: 'item'
					});
					var postingPeriod = billCreditRec.getValue('postingperiod');
					var subsidiary = billCreditRec.getValue('subsidiary');
					var date = billCreditRec.getValue('trandate');
					var tranId = scriptContext.newRecord.id;
					var createdFrom = billCreditRec.getValue('createdfrom');
					var exchangerate = billCreditRec.getValue('exchangerate');
                    var location = billCreditRec.getValue('location');
                    var department = billCreditRec.getValue('department');
                    var headClass = billCreditRec.getValue('class');
                   var createdFrom = billCreditRec.getValue('createdfrom');
                   var rounndingGainLoass = billCreditRec.getValue('custbody_da_rounding_gain_loss');
                  
					var createdFromText = billCreditRec.getText('createdfrom');
                    createdFromText = createdFromText.toString();
                    log.debug('createdFromText',  createdFromText.split(" "));
					
					var taxAmount = billCreditRec.getValue('custbody_da_tax_header_amount');
					if(taxAmount != 0){
                      if(taxAmount < 0){
                        taxAmount = -(taxAmount);
                      }
						
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', billCreditRec.getValue('custbody_da_vat_on_purchase_acc_bill'));
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_credit', Number(taxAmount).toFixed(3));
						glDatabaseRec.setValue('custrecord_da_gl_memo', "VAT");
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // bill credit
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('custbody_da_tax_authority_ns'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.setValue('custrecord_da_gl_department', department);
						glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
						glDatabaseRec.save();
					}
					if (true) {
						var apAccount = billCreditRec.getValue('custbody_da_vendor_ap_account');
                        var subTotal =  billCreditRec.getValue('custbody_da_subtotal');
                        var taxStoreAmount =  billCreditRec.getValue('custbody_da_tax_stored_amount');
                      taxStoreAmount =(taxStoreAmount) ?taxStoreAmount: 0;
                       if(taxStoreAmount < 0){
                           taxStoreAmount = -(taxStoreAmount);
                         }
						var totalAmount = parseFloat(subTotal) + parseFloat(taxStoreAmount);
                         if(totalAmount < 0){
                           totalAmount = -(totalAmount);
                         }
						var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
						});
						glDatabaseRec.setValue('custrecord_da_gl_account', apAccount);
						glDatabaseRec.setValue('custrecord_da_gl_date', date);
						glDatabaseRec.setValue('custrecord_da_gl_debit', Number(totalAmount).toFixed(3));
						glDatabaseRec.setValue('custrecord_da_gl_memo', "");
						glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
						glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
						glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // bill credit
						glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
						glDatabaseRec.setValue('custrecord_da_gl_location', location);
						glDatabaseRec.setValue('custrecord_da_gl_department', department);
						glDatabaseRec.setValue('custrecord_da_gl_class', headClass);
						glDatabaseRec.save();
						for (var i = 0; i < lineCount; i++) {
							if (true) {
								var location = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'location',
									line: i
								});
								var itemID = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'item',
									line: i
								});
								var itemType = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_type',
									line: i
								});
								var quantity = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'quantity',
									line: i
								});
								var rate = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'rate',
									line: i
								});
								var unitCost;

								if(location){
									var itemSearchObj = search.create({
									type: "item",
									filters: [
										["internalid", "anyof", itemID],
										"AND",
										["inventorylocation.internalid", "anyof", location]
									],
									columns: [
										search.createColumn({
											name: "itemid",
											sort: search.Sort.ASC,
											label: "Name"
										}),
										search.createColumn({
											name: "displayname",
											label: "Display Name"
										}),
										search.createColumn({
											name: "salesdescription",
											label: "Description"
										}),
										search.createColumn({
											name: "type",
											label: "Type"
										}),
										search.createColumn({
											name: "baseprice",
											label: "Base Price"
										}),
										search.createColumn({
											name: "averagecost",
											label: "Average Cost"
										}),
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
								}
								
								log.debug("unitCost", unitCost);
								var memo = " ";
								var cogsAccount = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_cogs_account',
									line: i
								});
								var invtAssetAccount = billCreditRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_asset_account',
									line: i
								});
								if (itemType != 1) {
									var account = billCreditRec.getSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_da_item_expense_account',
										line: i
									});
									var amount = billCreditRec.getSublistValue({
										sublistId: 'item',
										fieldId: 'custcol_da_line_amount_3_decimal',
										line: i
									});
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', account);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_credit', Number(amount * exchangerate).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
								}
								//credit
								if (itemType == 1) {
                                  
                                  if (createdFromText.split(" ")[0] == "Vendor") {
                                    
                                    var acc = billCreditRec.getValue('custbody_da_purchases_retur_not_credi');
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', acc);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_credit', Number(quantity * rate * exchangerate).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
                                  }else{
                                    var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_credit', Number(quantity * rate * exchangerate).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
                                  }
									var totalValue = (quantity * rate * exchangerate);
									var withAverageValue = (quantity * unitCost); //avg cost
                                  
                                  if (createdFromText.split(" ")[0] == "Bill") {
									if (withAverageValue > totalValue) {
										var value = parseFloat(withAverageValue) - parseFloat(totalValue);
										var glDatabaseRec = record.create({
											type: 'customrecord_da_gl_data_base'
										});
										glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
										glDatabaseRec.setValue('custrecord_da_gl_date', date);
										glDatabaseRec.setValue('custrecord_da_gl_debit', Number(value * exchangerate).toFixed(3));
										glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
										glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
										glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
										glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
										glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
										glDatabaseRec.setValue('custrecord_da_gl_location', location);
										glDatabaseRec.save();
										var glDatabaseRec = record.create({
											type: 'customrecord_da_gl_data_base'
										});
										glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
										glDatabaseRec.setValue('custrecord_da_gl_date', date);
										glDatabaseRec.setValue('custrecord_da_gl_credit', Number(value * exchangerate).toFixed(3));
										glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
										glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
										glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
										glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
										glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
										glDatabaseRec.setValue('custrecord_da_gl_location', location);
										glDatabaseRec.save();
									} else {
										var value = parseFloat(totalValue) - parseFloat(withAverageValue);
										var glDatabaseRec = record.create({
											type: 'customrecord_da_gl_data_base'
										});
										glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
										glDatabaseRec.setValue('custrecord_da_gl_date', date);
										glDatabaseRec.setValue('custrecord_da_gl_debit', Number(value * exchangerate).toFixed(3));
										glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
										glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
										glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
										glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
										glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
										glDatabaseRec.setValue('custrecord_da_gl_location', location);
										glDatabaseRec.save();
										var glDatabaseRec = record.create({
											type: 'customrecord_da_gl_data_base'
										});
										glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
										glDatabaseRec.setValue('custrecord_da_gl_date', date);
										glDatabaseRec.setValue('custrecord_da_gl_credit', Number(value * exchangerate).toFixed(3));
										glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
										glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
										glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
										glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 20); // item fulfill
										glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
										glDatabaseRec.setValue('custrecord_da_gl_location', location);
										glDatabaseRec.save();
									}
                                  }
								}
							}
						}
					}
					        var credit3DPAmt = 0;
	                        var debit3DPAmt = 0;
	                        customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
	               
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

					//log.debug('sublists', sublists);
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