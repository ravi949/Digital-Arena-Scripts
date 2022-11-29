/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/currentRecord','N/url'],

		function(search,record,currentRecord,url) {
 

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
	var rec = currentRecord.get();
	
     var type1 = rec.type;
  
   function openSuiteletForBill(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_print_bill',
            deploymentId: 'customdeploy_da_su_print_bill',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
   function openSuiteletForDeposit(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_deposit_print',
            deploymentId: 'customdeploy_da_su_deposit_print',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function openSuiteletForCustomerDeposit(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_customer_depsit_print',
            deploymentId: 'customdeploy_da_su_customer_depsit_print',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function openSuiteletForinventory(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_inventory_adj_print',
            deploymentId: 'customdeploy_da_su_inventory_adj_print',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function openSuiteletForVendorCredit(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_vendor_credit_print',
            deploymentId: 'customdeploy_da_su_vendor_credit_print',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
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
		try{
		}catch(ex){
			console.log(ex.name,ex.message);
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
//		saveRecord: saveRecord,
          openSuiteletForBill:openSuiteletForBill,
      openSuiteletForDeposit:openSuiteletForDeposit,
      openSuiteletForCustomerDeposit:openSuiteletForCustomerDeposit,
      openSuiteletForinventory:openSuiteletForinventory,
      openSuiteletForVendorCredit:openSuiteletForVendorCredit
	}

});