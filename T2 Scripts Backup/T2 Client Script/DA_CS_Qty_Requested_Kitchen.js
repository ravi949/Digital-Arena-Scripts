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
	    var context;
	    function pageInit(scriptContext) {

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
                if (context.fieldId == 'custpage_start_date' || context.fieldId == 'custpage_end_date' || context.fieldId == 'custpage_workorder' || context.fieldId == 'custpage_location' || context.fieldId == 'custpage_currency' || context.fieldId == 'custpage_is_internal_transfer' || context.fieldId == 'custpage_vendor' || context.fieldId == 'custpage_subsidiary' || context.fieldId == 'custpage_to_location' || context.fieldId == 'custpage_date' || context.fieldId == 'custpage_location_field' || context.fieldId == 'custpage_from_location'){
                    var startDate = context.currentRecord.getValue('custpage_start_date');
                    var endDate = context.currentRecord.getValue('custpage_end_date');
                    var workOrderId = context.currentRecord.getValue('custpage_workorder');
                    var locationId = context.currentRecord.getValue('custpage_location');
                  var dateValText = context.currentRecord.getText('custpage_date');
                    var startDateText = context.currentRecord.getText('custpage_start_date');
                    var endDateText = context.currentRecord.getText('custpage_end_date');
                    var internalTransfer = context.currentRecord.getValue('custpage_is_internal_transfer');
                    var vendorVal = context.currentRecord.getValue('custpage_vendor');
                    var currencyVal = context.currentRecord.getValue('custpage_currency');
                    var subsidiaryVal = context.currentRecord.getValue('custpage_subsidiary');
                    var toLocVal = context.currentRecord.getValue('custpage_to_location');
                    var locationVal = context.currentRecord.getValue('custpage_location_field');
                    var fromLocVal = context.currentRecord.getValue('custpage_from_location');
                    var dateVal = context.currentRecord.getText('custpage_date');
                       var output = url.resolveScript({
                            scriptId: 'customscript_da_su_qty_req_kitchen',
                            deploymentId: 'customdeploy_da_su_qty_req_kitchen',
                            returnExternalUrl: false,
                            params: {
                                workOrderId: workOrderId,
                                locationId: locationId,
                            	startDate: startDate,
                                endDate: endDate,
                                startDateText: startDateText,
                                endDateText: endDateText,
                                internalTransfer: internalTransfer,
                                vendorVal: vendorVal,
                                currencyVal: currencyVal,
                                subsidiaryVal: subsidiaryVal,
                                toLocVal: toLocVal,
                                fromLocVal: fromLocVal,
                                locationVal:locationVal,
                                dateVal: dateVal

                            }

                        });
                        if (window.onbeforeunload){
                          window.onbeforeunload=function() {null;};
                        };
                        console.log(output);
                        window.open(window.location.origin + '' + output, '_self');
                    }
                       
                        
                  }             
                  catch (ex) {
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
        function validateLine(scriptContext) {

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
        function saveRecord(context) {
        }
        
        
        
        return {
             pageInit : pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
        
        };

    });