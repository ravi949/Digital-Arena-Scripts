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
			try {} catch (ex) {
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
				if (scriptContext.fieldId == 'custrecord_da_amm_select_course') {
					var numLines = scriptContext.currentRecord.getLineCount({
						sublistId: 'recmachcustrecord_da_amm_batch_parent'
					});
					for (var i = numLines - 1; i >= 0; i--) {
						scriptContext.currentRecord.removeLine({
							sublistId: 'recmachcustrecord_da_amm_batch_parent',
							line: i,
							ignoreRecalc: true
						});
					}
					var courseItemID = scriptContext.currentRecord.getValue('custrecord_da_amm_select_course');
					var itemSearchObj = search.create({
						type: "item",
						filters: [
							["internalid", "anyof", courseItemID]
						],
						columns: [
							search.createColumn({
								name: "memberitem",
								label: "Member Item"
							}),
							search.createColumn({
								name: "memberquantity",
								label: "Member Quantity"
							})
						]
					});
					var searchResultCount = itemSearchObj.runPaged().count;
					log.debug("itemSearchObj result count", searchResultCount);
					itemSearchObj.run().each(function(result) {
						scriptContext.currentRecord.selectNewLine({
							sublistId: 'recmachcustrecord_da_amm_batch_parent'
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_amm_batch_parent',
							fieldId: 'custrecord_da_amm_subject_name',
							value: result.getValue('memberitem')
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_amm_batch_parent',
							fieldId: 'custrecord_da_amm_subject_qauntity',
							value: result.getValue('memberquantity')
						});

						scriptContext.currentRecord.commitLine({
							sublistId:'recmachcustrecord_da_amm_batch_parent'
						});						
						return true;
					});
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
			try {} catch (ex) {
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
			try {} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
  
  function openSubjectRecords(recId, parentId){
    console.log(parentId);
    
     var customrecord_da_amm_batch_subjectsSearchObj = search.create({
                            type: "customrecord_da_amm_batch_subjects",
                            filters: [
                                ["custrecord_da_amm_batch_parent", "anyof", parentId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    label: "Internal ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
                        log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
                        var batchSubjectIds = [];
                        customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
                            window.open(window.location.origin+"/app/common/custom/custrecordentry.nl?rectype="+recId+"&id="+result.id+"&e=T");
                            return true;
                        });
  }
  
  function myFunction(){
    history.go(-1);
  }
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			//      postSourcing: postSourcing,
			//      sublistChanged: sublistChanged,
			//lineInit: lineInit,
			//      validateField: validateField,
			//validateLine: validateLine,
			//      validateInsert: validateInsert,
			//      validateDelete: validateDelete,
			//saveRecord: saveRecord,
			    openSubjectRecords:openSubjectRecords,
          myFunction:myFunction
		};
	});