/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/url'],

		function(search, url) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	var sc;

	function pageInit(scriptContext) {
		sc = scriptContext;
		console.log('hi');

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

		}catch(ex){
			console.log(ex.error,ex.message);
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

	function openIssuematerailRecord() {


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
	
	function openSuitelet(recID,postingPeriodText){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_da_su_employee_payslip_pdf',
			deploymentId: 'customdeploy_da_su_employee_payslip_pdf',
			params:{				
				'recID':recID,
               'urlorigin': window.location.origin,
              'postingPeriodText':postingPeriodText
			}
		});
		console.log(suiteletUrl);
		window.open(window.location.origin+""+suiteletUrl);
	}
  
  function openSuiteletForPayrollReport(recID,subsidiary,currentPeriod,comparePeriod){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_da_su_payroll_rec_report',
			deploymentId: 'customdeploy_da_su_payroll_rec_report',
			params:{				
				'recID':recID,
               'subsidiary': subsidiary,
              'currentPeriod':currentPeriod,
              'comparePeriod':comparePeriod
			}
		});
		console.log(suiteletUrl);
		window.open(window.location.origin+""+suiteletUrl);
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
			var postingPeriod = scriptContext.currentRecord.getValue('custrecord_emp_payslip_select_month');
			var employeeId = scriptContext.currentRecord.getValue('custrecord_payslip_employee');
			var customrecord_da_pay_run_itemsSearchObj = search.create({
				   type: "customrecord_da_pay_run_items",
				   filters:
				   [
				      ["custrecord_da_pay_run_employee","anyof",employeeId], 
				      "AND", 
				      ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period","anyof",postingPeriod]
				   ],
				   columns:['internalid']
				});
				var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
				log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
				
				if(searchResultCount <= 0){
					alert("Sorry, payroll is not processed for this month.");
					return false;
				}
				
				return true;
				

		}catch(ex){
			console.log(ex.error,ex.message);
		}
	}

	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
		//        postSourcing: postSourcing,
		//        sublistChanged: sublistChanged,
		//        lineInit: lineInit,
		//        validateField: validateField,
		//        validateLine: validateLine,
		//        validateInsert: validateInsert,
		//        validateDelete: validateDelete,
		        saveRecord: saveRecord,
		        openSuitelet:openSuitelet,
      openSuiteletForPayrollReport:openSuiteletForPayrollReport
	};

});