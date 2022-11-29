/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
	function(search, record) {
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		var mode, tranType, itemID, locationId, salesQuantity;

		function pageInit(scriptContext) {
			try {
				console.log(window.location.href);
				var url_string = window.location.href;
				//console.log(url_string);
				var url1 = new URL(url_string);
				tranType = url1.searchParams.get("subrecord_transform_from_parent_tran_type");
				itemID = url1.searchParams.get("item");
				locationId = url1.searchParams.get("location");
				salesQuantity = url1.searchParams.get("quantity")
				//console.log(tranType);
				mode = scriptContext.mode;
				//console.log(scriptContext.currentRecord);
				var lineCount = scriptContext.currentRecord.getLineCount({
					sublistId: 'inventoryassignment'
				});
				if (tranType == 'salesord' && lineCount <= 0) {
					console.log(itemID, locationId);
					var itemSearchObj = search.create({
						type: "item",
						filters: [
							["internalid", "anyof", itemID],
							"AND",
							["inventorydetail.location", "anyof", locationId], "AND",
							["inventorydetail.binnumber", "noneof", "@NONE@"],
							"AND",
							["inventorynumber.quantityavailable", "greaterthan", "0"]
						],
						columns: [
							search.createColumn({
								name: "itemid",
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
								name: "expirationdate",
								join: "inventoryDetail",
								label: "Expiration Date",
								sort: search.Sort.ASC
							}),
							search.createColumn({
								name: "inventorynumber",
								join: "inventoryDetail",
								label: " Number"
							}),
							search.createColumn({
								name: "quantity",
								join: "inventoryDetail",
								label: "Quantity"
							})
						]
					});
					var searchResultCount = itemSearchObj.runPaged().count;
					log.debug("itemSearchObj result count", searchResultCount);
					var qtySet = false,
						setQuantity = salesQuantity;
					itemSearchObj.run().each(function(result) {
						var availQty = result.getValue({
							name: 'quantity',
							join: 'inventorydetail'
						});
						if (setQuantity > 0) {
							scriptContext.currentRecord.selectNewLine({
								sublistId: 'inventoryassignment'
							});
							console.log(setQuantity);
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'inventoryassignment',
								fieldId: 'issueinventorynumber',
								value: result.getValue({
									name: 'inventorynumber',
									join: 'inventorydetail'
								}),
								ignoreFieldChange: false,
								forceSyncSourcing: true
							});
							if (availQty >= setQuantity) {
								qtySet = true;
								scriptContext.currentRecord.setCurrentSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'quantity',
									value: setQuantity
								});
							}
							if (availQty < setQuantity) {
								setQuantity = parseFloat(setQuantity) - parseFloat(availQty);
								qtySet = false;
								scriptContext.currentRecord.setCurrentSublistValue({
									sublistId: 'inventoryassignment',
									fieldId: 'quantity',
									value: availQty
								});
							}
							scriptContext.currentRecord.commitLine({
								sublistId: 'inventoryassignment'
							});
							if (qtySet) {
								return false;
							} else {
								return true;
							}
						}
					});
				}
				var customForm = scriptContext.currentRecord.getValue('customform');
				if (customForm == 105 && mode == 'create') {
					var lineCount = scriptContext.currentRecord.getLineCount({
						sublistId: 'item'
					});
					console.log(lineCount);
					for (var i = 0; i < lineCount; i++) {
						scriptContext.currentRecord.selectLine({
							sublistId: 'item',
							line: i
						});
						/*scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'itemreceive',
							value: false,
							ignoreFieldChange: false,
							forceSyncSourcing: true
						});*/
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							value: 1,
							ignoreFieldChange: true
						});
						scriptContext.currentRecord.commitLine({
							sublistId: 'item'
						})
					}
				}
			} catch (ex) {
				console.log(ex.error, ex.message);
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
			try {
				/*if (scriptContext.fieldId == 'expirationdate') {
					var expirationDate = scriptContext.currentRecord.getCurrentSublistValue({
						sublistId: 'inventoryassignment',
						fieldId: 'expirationdate'
					});
					//console.log(expirationDate);
				}*/
              if(scriptContext.fieldId == 'custbody_da_receiving_location'){
                var recLocation =  scriptContext.currentRecord.getValue('custbody_da_receiving_location');
                var lc =  scriptContext.currentRecord.getLineCount({
                  sublistId :'item'
                });
                console.log(lc);
                
                for(var i = 0 ; i<lc; i++){
                  scriptContext.currentRecord.selectLine({
                sublistId: 'item',
                line: i
            });
           scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'location',
                        value : recLocation
					});
                   
                }
              }
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
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
			try {} catch (ex) {
				console.log(ex.name, ex.message);
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
		function sublistChanged(scriptContext) {}
		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function lineInit(scriptContext) {}
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
		function validateField(scriptContext) {}
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
			try {
				if (scriptContext.sublistId == 'inventoryassignment' && tranType == 'purchord') {
					var expirationDate = scriptContext.currentRecord.getCurrentSublistValue({
						sublistId: 'inventoryassignment',
						fieldId: 'expirationdate'
					});
					//console.log(expirationDate);
					if(expirationDate){
                      if (expirationDate < new Date()) {
						alert("Sorry you cant receive this item since its already expired");
						return false;
						}
                    }
					
					// To calculate the time difference of two dates 
					//var Difference_In_Time = expirationDate.getTime() - new Date().getTime();
					// To calculate the no. of days between two dates 
					//var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
					//console.log(Difference_In_Days);
				}
				return true;
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
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
		function validateInsert(scriptContext) {}
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
		function validateDelete(scriptContext) {}
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
			try {
					var lookup = record.load({
						type:'customrecord_da_warranty_expiry_notifica',
						id: 1
					});

					var emailToNotify = lookup.getValue('custrecord_da_expiry_notify_emails')
					console.log(emailToNotify);
					return false;
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			//      postSourcing: postSourcing,
			//      sublistChanged: sublistChanged,
			lineInit: lineInit,
			//      validateField: validateField,
			validateLine: validateLine,
			//      validateInsert: validateInsert,
			//      validateDelete: validateDelete,
			//saveRecord: saveRecord,
			//      createso:createso,
		};
	});