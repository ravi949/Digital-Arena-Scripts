/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search','N/runtime'],

		function(record, search,runtime) {

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

	function pageInit(scriptContext) {

	}

	function redirectToBack() {

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
		try {

		} catch (ex) {
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
		try {
          
            var employeeId =  scriptContext.currentRecord.getValue('custrecord_da_addition_employee');

			var itemcategory = scriptContext.currentRecord.getValue('custrecord_da_item_category');

			var grade = scriptContext.currentRecord.getValue('custrecord_da_emp_add_grade');
			var payrollItem = scriptContext.currentRecord.getValue('custrecord_da_addition_type');

			if(itemcategory == 15){
				var pId = scriptContext.currentRecord.getText('custrecord_da_addition_posting_period');

				console.log(pId.split(" ")[1]);

				var customrecord_da_grade_benefitsSearchObj = search.create({
					type: "customrecord_da_grade_benefits",
					filters:
						[
							["custrecord_da_grade_payroll_item","anyof",payrollItem], 
							"AND", 
							["custrecord_da_grade_benefit","anyof",grade]
							],
							columns:
								[
									search.createColumn({name: "custrecord_da_grade_amount", label: "Amount"})
									]
				});
				var searchResultCount = customrecord_da_grade_benefitsSearchObj.runPaged().count;
				log.debug("customrecord_da_grade_benefitsSearchObj result count",searchResultCount);

				var totalEligibleAmount = 0;
				customrecord_da_grade_benefitsSearchObj.run().each(function(result){
					totalEligibleAmount = result.getValue('custrecord_da_grade_amount');
					return true;
				});

				var customrecord_monthly_add_and_deductionsSearchObj = search.create({
					type: "customrecord_monthly_add_and_deductions",
					filters:
						[
                          
							["custrecord_da_item_category","anyof","15"], //schooling
							"AND", 
							["custrecord_da_addition_posting_period.periodname","contains",pId.split(" ")[1].toString()],
                            "AND", 
                            ["custrecord_da_addition_employee","anyof",employeeId]
							],
							columns:
								[
									search.createColumn({name: "custrecord_da_addition_type", label: "Type"}),
									search.createColumn({name: "custrecord_da_addition_employee", label: "Employee"}),
									search.createColumn({name: "custrecord_da_addition_posting_period", label: "Month"}),
									search.createColumn({name: "custrecord_da_additional_amount", label: "Amount"})
									]
				});
				var alreadyTakenAmount = 0;
				var searchResultCount = customrecord_monthly_add_and_deductionsSearchObj.runPaged().count;
				log.debug("customrecord_monthly_add_and_deductionsSearchObj result count",searchResultCount);
				customrecord_monthly_add_and_deductionsSearchObj.run().each(function(result){
					var amount = result.getValue('custrecord_da_additional_amount');
					alreadyTakenAmount = parseFloat(alreadyTakenAmount) + parseFloat(amount);
					return true;
				});
				
				var applyingAmount = scriptContext.currentRecord.getValue('custrecord_da_additional_amount');
				
				var remainingEligibleAmount = parseFloat(totalEligibleAmount) - parseFloat(alreadyTakenAmount);
				
				var totalAmount = parseFloat(applyingAmount) + parseFloat(alreadyTakenAmount);
				
				if(totalAmount > totalEligibleAmount){
					alert('Sorry, Employee Exceeded the Schooling Allowances Limit, Total Eligible Amount = '+totalEligibleAmount +" and Already Taken Amount ="+ alreadyTakenAmount +" and the remaining eligible Amount is "+remainingEligibleAmount);
					return false;
				}
			}

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
		//saveRecord: saveRecord,
		redirectToBack: redirectToBack
	};

});