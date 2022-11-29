/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search','N/url','N/currentRecord'],
		/**
		 * @param {record}
		 *            record
		 * @param {search}
		 *            search
		 */
		function(record, search,url,currentRecord) {

	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is
	 *            being accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	var sc ;
	function pageInit(scriptContext) {
		sc= scriptContext;
	}

	/**
	 * Function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined
	 *            if not a sublist or matrix field
	 * @param {number}
	 *            scriptContext.columnNum - Line number. Will be
	 *            undefined if not a matrix field
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {

		try {   
          

			if(context.fieldId == 'custpage_ss_pagination'){
var index = context.currentRecord.getValue('custpage_ss_pagination');
				var techinicianId = context.currentRecord.getValue('custpage_technician');
				var jobCardId = context.currentRecord.getValue('custpage_job_card_id');
				var itemId = context.currentRecord.getValue('custpage_item_id');
				var output = url.resolveScript({
					scriptId: 'customscript_da_su_kbb_receiving',
					deploymentId: 'customdeploy_da_su_kbb_receiving',
					returnExternalUrl: false,
					params: {
						technician: techinicianId,
						jobcardid : jobCardId,
						item : itemId,
                        startno: index
					}

				});
				console.log(output);                   
				window.open(window.location.origin + '' + output, '_self'); 
			}

			if (context.fieldId == 'custpage_technician' || context.fieldId == 'custpage_job_card_id' || context.fieldId == 'custpage_item_id'){
				var techinicianId = context.currentRecord.getValue('custpage_technician');
				var jobCardId = context.currentRecord.getValue('custpage_job_card_id');
				var itemId = context.currentRecord.getValue('custpage_item_id');
				var output = url.resolveScript({
					scriptId: 'customscript_da_su_kbb_receiving',
					deploymentId: 'customdeploy_da_su_kbb_receiving',
					returnExternalUrl: false,
					params: {
						technician: techinicianId,
						jobcardid : jobCardId,
						item : itemId
					}

				});
				console.log(output);
				if (window.onbeforeunload) {
					window.onbeforeunload = function() {
						null;
					};
				};
				window.open(window.location.origin + '' + output, '_self');

			}


		} catch (ex) {
			console.log(ex.name, ex.message);
		}


	}

	/**
	 * Function to be executed when field is slaved.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * 
	 * @since 2015.2
	 */
	function postSourcing(scriptContext) {

	}

	/**
	 * Function to be executed after sublist is inserted, removed, or
	 * edited.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function sublistChanged(scriptContext) {

	}

	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function lineInit(scriptContext) {
		try{
			
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	/**
	 * Validation function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined
	 *            if not a sublist or matrix field
	 * @param {number}
	 *            scriptContext.columnNum - Line number. Will be
	 *            undefined if not a matrix field
	 * 
	 * @returns {boolean} Return true if field is valid
	 * 
	 * @since 2015.2
	 */
	function validateField(scriptContext) {

	}

	/**
	 * Validation function to be executed when sublist line is
	 * committed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @returns {boolean} Return true if sublist line is valid
	 * 
	 * @since 2015.2
	 */
	function validateLine(context) {
		try{
			
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	/**
	 * Validation function to be executed when sublist line is inserted.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
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
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
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
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @returns {boolean} Return true if record is valid
	 * 
	 * @since 2015.2
	 */
	function saveRecord(scriptContext) {
		try{
			// window.open(window.location.origin + '/app/common/custom/custrecordentry.nl?rectype=291&itemSno='+sno,'_self');

			return true;
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	function markAll(){
		var objRecord = currentRecord.get();
		//console.log(objRecord);
		var numLines = objRecord.getLineCount({
			sublistId: 'custpage_report_data_sublist'
		});
		//console.log(numLines);
		
		for(var i =0 ;i<numLines;i++){
			var record = objRecord.selectLine({
			    sublistId: 'custpage_report_data_sublist',
			    line: i
			});
			objRecord.setCurrentSublistValue({
			    sublistId: 'custpage_report_data_sublist',
			    fieldId: 'custpage_recieve',
			    line:i,
			    value: true
			});
			
		}
	}
	
	function unmarkAll(){
		var objRecord = currentRecord.get();
		//console.log(objRecord);
		var numLines = objRecord.getLineCount({
			sublistId: 'custpage_report_data_sublist'
		});
		console.log(numLines);
		
		for(var i =0 ;i<numLines;i++){
			var record = objRecord.selectLine({
			    sublistId: 'custpage_report_data_sublist',
			    line: i
			});
			objRecord.setCurrentSublistValue({
			    sublistId: 'custpage_report_data_sublist',
			    fieldId: 'custpage_recieve',
			    line:i,
			    value: false
			});
			
		}
	}

	function openNewJobCard(recordId){
		window.open(window.location.origin + '/app/common/custom/custrecordentry.nl?rectype='+recordId+'','_self');
	}

	return {
		pageInit : pageInit,
		fieldChanged: fieldChanged,
		// postSourcing: postSourcing,
		// sublistChanged: sublistChanged,
		//lineInit : lineInit,
		// validateField: validateField,
		// validateLine: validateLine,
		// validateInsert: validateInsert,
		// validateDelete: validateDelete,
		//saveRecord: saveRecord,
		openNewJobCard :openNewJobCard,
		markAll:markAll,
		unmarkAll:unmarkAll
	};

});	