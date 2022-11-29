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


	function openSuiteletForPayrollReportWS(recID,subsidiary,currentPeriod,comparePeriod){
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
  
  function openSuiteletForPayrollReportWOS(recID,currentPeriod,comparePeriod){
		var suiteletUrl = url.resolveScript({
			scriptId: 'customscript_da_su_payroll_rec_report',
			deploymentId: 'customdeploy_da_su_payroll_rec_report',
			params:{				
				'recID':recID,
				'currentPeriod':currentPeriod,
				'comparePeriod':comparePeriod
			}
		});
		console.log(suiteletUrl);
		window.open(window.location.origin+""+suiteletUrl);
	}


	return {
		pageInit: pageInit,
		//fieldChanged: fieldChanged,
		//        postSourcing: postSourcing,
		//        sublistChanged: sublistChanged,
		//        lineInit: lineInit,
		//        validateField: validateField,
		//        validateLine: validateLine,
		//        validateInsert: validateInsert,
		//        validateDelete: validateDelete,
		//       saveRecord: saveRecord,
		//      openSuitelet:openSuitelet,
		openSuiteletForPayrollReportWS:openSuiteletForPayrollReportWS,
      openSuiteletForPayrollReportWOS:openSuiteletForPayrollReportWOS
	};

});