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
					var itemfulfillmentRec = record.load({
						type: 'itemfulfillment',
						id: scriptContext.newRecord.id
					});
					var lineCount = itemfulfillmentRec.getLineCount({
						sublistId: 'item'
					});
					var postingPeriod = itemfulfillmentRec.getValue('postingperiod');
					var subsidiary = itemfulfillmentRec.getValue('subsidiary');
					var date = itemfulfillmentRec.getValue('trandate');
					var rounndingGainLoass = itemfulfillmentRec.getValue('custbody_da_rounding_gain_loss');
					var tranId = scriptContext.newRecord.id;
					var createdFrom = itemfulfillmentRec.getValue('createdfrom');
                  
					var createdFromText = itemfulfillmentRec.getText('createdfrom');
                    createdFromText = createdFromText.toString();
                    log.debug('createdFromText',  createdFromText.split(" "));
					if (createdFromText.split(" ")[0] == "Sales") {
						log.debug('createdFromText', createdFromText);
						log.debug('total amount creating');
						log.debug('lineCount', lineCount);
						for (var i = 0; i < lineCount; i++) {
							var fullfilled = itemfulfillmentRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'itemreceive',
								line: i
							});
                          var itemType = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_type',
									line: i
								}); 
							if (fullfilled && itemType == 1) {
								var location = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'location',
									line: i
								});
                              
								var itemID = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'item',
									line: i
								});
								var quantity = itemfulfillmentRec.getSublistValue({
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
								log.debug("unitCost", unitCost);
								var memo = "Cost Of Sales";
								var cogsAccount = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_cogs_account',
									line: i
								});
								var invtAssetAccount = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_asset_account',
									line: i
								});
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', Number(quantity * unitCost).toFixed(3));
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
								//credit
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_credit', Number(quantity * unitCost).toFixed(3));
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
							}
						}
					}

					if(createdFromText.split(" ")[0] == "Vendor"){
                      
                      var vendorReturnAuthRec = record.load({
                        type:'vendorreturnauthorization',
                        id: createdFrom
                      })

					var exchangerate = vendorReturnAuthRec.getValue('exchangerate');


						for (var i = 0; i < lineCount; i++) {
							var fullfilled = itemfulfillmentRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'itemreceive',
								line: i
							});
                            var itemType = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_type',
									line: i
								}); 
							if (fullfilled && itemType == 1) {
								var location = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'location',
									line: i
								});
								var itemID = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'item',
									line: i
								});
								var quantity = itemfulfillmentRec.getSublistValue({
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
								log.debug("unitCost", unitCost);
								var memo = "";
								var cogsAccount = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_cogs_account',
									line: i
								});
								var rate = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'rate',
									line: i
								});
								var invtAssetAccount = itemfulfillmentRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_da_item_asset_account',
									line: i
								});
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', scriptContext.newRecord.getValue('custbody_da_purchases_retur_not_credi'));
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_debit', Number(quantity * rate * exchangerate).toFixed(3));
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();
								//credit
								var glDatabaseRec = record.create({
									type: 'customrecord_da_gl_data_base'
								});
								glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
								glDatabaseRec.setValue('custrecord_da_gl_date', date);
								glDatabaseRec.setValue('custrecord_da_gl_credit', Number(quantity * rate * exchangerate).toFixed(3));
								glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
								glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
								glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
								glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
								glDatabaseRec.setValue('custrecord_da_gl_location', location);
								glDatabaseRec.save();

								var totalValue = (quantity * rate * exchangerate);
								var withAverageValue = (quantity * unitCost);//avg cost

								if(withAverageValue > totalValue){
									var value = parseFloat(withAverageValue) - parseFloat(totalValue);
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_debit', Number(value).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_credit', Number(value).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
								}else{
									var value = parseFloat(totalValue) - parseFloat(withAverageValue);
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', invtAssetAccount);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_debit', Number(value).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
									var glDatabaseRec = record.create({
										type: 'customrecord_da_gl_data_base'
									});
									glDatabaseRec.setValue('custrecord_da_gl_account', cogsAccount);
									glDatabaseRec.setValue('custrecord_da_gl_date', date);
									glDatabaseRec.setValue('custrecord_da_gl_credit', Number(value).toFixed(3));
									glDatabaseRec.setValue('custrecord_da_gl_memo', "Cost of Sales Adjustment");
									glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
									glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
									glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 32); // item fulfill
									glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
									glDatabaseRec.setValue('custrecord_da_gl_location', location);
									glDatabaseRec.save();
								}
							}
						}

					}
					//log.debug('sublists', sublists);
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