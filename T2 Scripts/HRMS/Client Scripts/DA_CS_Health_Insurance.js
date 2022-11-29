/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format'],

		function(search,record,format) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	function pageInit(scriptContext) {

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
		try{
			if(scriptContext.fieldId == 'custrecord_da_halth_insurance_employee'){
				var employeeId = scriptContext.currentRecord.getValue('custrecord_da_halth_insurance_employee');
				var customrecord_da_emp_family_membersSearchObj = search.create({
					type: "customrecord_da_emp_family_members",
					filters:
						[
							["custrecord_da_family_employee","anyof",employeeId]
							],
							columns:
								[
									search.createColumn({name: "custrecord_family_relation", label: "Relation"}),
									search.createColumn({name: "custrecord_family_member_name", label: "Name"}),
									search.createColumn({name: "custrecord_da_family_mem_gender", label: "Gender"}),
									search.createColumn({name: "custrecord_da_family_member_age", label: "Age"})
									]
				});
				var searchResultCount = customrecord_da_emp_family_membersSearchObj.runPaged().count;
				log.debug("customrecord_da_emp_family_membersSearchObj result count",searchResultCount);
				customrecord_da_emp_family_membersSearchObj.run().each(function(result){
					scriptContext.currentRecord.selectNewLine({
						sublistId: 'recmachcustrecord_health_insurance_parent'
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_health_insurance_parent',
						fieldId: 'custrecord_da_health_ins_realtion',
						value: result.getValue('custrecord_family_relation')
					});
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_health_insurance_parent',
						fieldId: 'custrecord_dependent_name',
						value: result.getValue('custrecord_family_member_name')
					});
                  console.log(result.getValue('custrecord_family_relation'));
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'recmachcustrecord_health_insurance_parent',
						fieldId: 'custrecord_da_family_depedent_age',
						value: result.getValue('custrecord_da_family_member_age'),
						ignoreFieldChange: true
					});
                  scriptContext.currentRecord.commitLine({
                    sublistId: 'recmachcustrecord_health_insurance_parent'
                  })
					return true;
				});
			}

		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	function convertDate(inputFormat) {
		function pad(s) { return (s < 10) ? '0' + s : s; }
		var d = new Date(inputFormat);
		return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
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
	function postSourcing(scriptContext) {

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

	}

	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
//		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
//		saveRecord: saveRecord
	};

});
