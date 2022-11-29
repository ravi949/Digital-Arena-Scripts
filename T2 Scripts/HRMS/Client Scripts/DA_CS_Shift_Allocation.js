/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
	function(record, search, runtime) {
		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		var mode;

		function pageInit(scriptContext) {}

		function redirectToBack() {}
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
				if (scriptContext.fieldId == 'custrecord_da_shift_allocate_option') {
					var option = scriptContext.currentRecord.getValue('custrecord_da_shift_allocate_option');
					var lineCount = scriptContext.currentRecord.getLineCount({
						sublistId: 'recmachcustrecord_da_shift_allocation_parent'
					});
					for (var i = 0; i < lineCount; i++) {
						for (var i = lineCount - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_da_shift_allocation_parent',
								line: i,
								ignoreRecalc: true
							});
						}
					}
					if (option == 1) {
						var employeeSearchObj = search.create({
							type: "employee",
							filters: [
								["subsidiary", "anyof", scriptContext.currentRecord.getValue('custrecord_da_shift_allocate_subsidiary')]
							],
							columns: [
								search.createColumn({
									name: "internalid",
									label: "Internal ID"
								})
							]
						});
						var searchResultCount = employeeSearchObj.runPaged().count;
						log.debug("employeeSearchObj result count", searchResultCount);
						employeeSearchObj.run().each(function(result) {
							scriptContext.currentRecord.selectNewLine({
								sublistId: 'recmachcustrecord_da_shift_allocation_parent'
							});
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_da_shift_allocation_parent',
								fieldId: 'custrecord_da_shift_alloc_empid',
								value: result.id
							});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_da_shift_allocation_parent'
							});
							return true;
						});
					}
				}
				if (scriptContext.fieldId == 'custrecord_da_select_department') {
					var lineCount = scriptContext.currentRecord.getLineCount({
						sublistId: 'recmachcustrecord_da_shift_allocation_parent'
					});
					for (var i = 0; i < lineCount; i++) {
						for (var i = lineCount - 1; i >= 0; i--) {
							scriptContext.currentRecord.removeLine({
								sublistId: 'recmachcustrecord_da_shift_allocation_parent',
								line: i,
								ignoreRecalc: true
							});
						}
					}
					var employeeSearchObj = search.create({
						type: "employee",
						filters: [
							["department", "anyof", scriptContext.currentRecord.getValue('custrecord_da_select_department')]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							})
						]
					});
					var searchResultCount = employeeSearchObj.runPaged().count;
					log.debug("employeeSearchObj result count", searchResultCount);
					employeeSearchObj.run().each(function(result) {
						scriptContext.currentRecord.selectNewLine({
							sublistId: 'recmachcustrecord_da_shift_allocation_parent'
						});
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'recmachcustrecord_da_shift_allocation_parent',
							fieldId: 'custrecord_da_shift_alloc_empid',
							value: result.id
						});
						scriptContext.currentRecord.commitLine({
							sublistId: 'recmachcustrecord_da_shift_allocation_parent'
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
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 *
		 * @since 2015.2
		 */
		function postSourcing(scriptContext) {}
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
		function lineInit(scriptContext) {
			try {} catch (ex) {
				console.log(ex.name, ex.message);
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
			console.log('validateLine');
			return true;
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
				return true;
			} catch (ex) {
				console.log(ex.name, ex.message);
			}
		}
		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			postSourcing: postSourcing,
			sublistChanged: sublistChanged,
			lineInit: lineInit,
			//        validateField: validateField,
			//   validateLine: validateLine,
			//        validateInsert: validateInsert,
			//        validateDelete: validateDelete,
			saveRecord: saveRecord,
			redirectToBack: redirectToBack
		};
	});