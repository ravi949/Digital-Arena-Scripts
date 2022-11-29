/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format','N/currentRecord'],

		function(search,record,format,currentRecord) {

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
		try{
		}catch(ex){
			console.log(ex.name,ex.message);
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
			if(scriptContext.fieldId == 'debit'){
				var dr3Dec = scriptContext.currentRecord.getCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_dr_3_decimal'
                            });
                    console.log('dr3Dec',dr3Dec);
                    if(!dr3Dec){
                        console.log('dr3Dec is null');
                        var debitAmt = scriptContext.currentRecord.getCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit'
                            });
                    console.log('debitAmt',debitAmt);
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_dr_3_decimal',
                            value: debitAmt
                        });
                    }
                    }
                    if(scriptContext.fieldId == 'credit'){
				var cr3Dec = scriptContext.currentRecord.getCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_cr_3_decimal'
                            });
                    console.log('cr3Dec',cr3Dec);
                    if(!cr3Dec){
                        console.log('cr3Dec is null');
                        var creditAmt = scriptContext.currentRecord.getCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit'
                            });
                    console.log('creditAmt',creditAmt);
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_cr_3_decimal',
                            value: creditAmt
                        });
                    }
                    }
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
		try{
			var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'line'
                        });
                        console.log('numLines', numLines);
                        var dr3DecimalTotal = 0;
                        var cr3DecimalTotal = 0;
                        for (var i = 0; i < numLines; i++) {
                            dr3Decimal = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_dr_3_decimal',
                                line: i
                            });
                            console.log('dr3Decimal', dr3Decimal);
                            cr3Decimal = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_cr_3_decimal',
                                line: i
                            });
                            console.log('cr3Decimal', cr3Decimal);
                            if(dr3Decimal){
                            	var dr3DecimalTotal = parseFloat(dr3DecimalTotal) + parseFloat(dr3Decimal);
                            }
                            if(cr3Decimal){
                            	var cr3DecimalTotal = parseFloat(cr3DecimalTotal) + parseFloat(cr3Decimal);
                            }
                            
                        }
                            
                            console.log('dr3DecimalTotal', dr3DecimalTotal);
                            console.log('cr3DecimalTotal', cr3DecimalTotal);
                            if (dr3DecimalTotal == cr3DecimalTotal){
                            	return true;
                            }
                            	else {
                            		alert('The DR 3 Decimal total and CR 3 Decimal total should match');
                            		return false;
                            	}
		}catch(ex){
			console.log(ex.name,ex.message);
		}
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
		saveRecord: saveRecord
	}

});