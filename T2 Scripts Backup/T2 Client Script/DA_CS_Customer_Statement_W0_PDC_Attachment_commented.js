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
	    	context = scriptContext;

	    	var url_string = window.location.href;
	    	console.log(url_string);
	    	var url1 = new URL(url_string);
	    	var vendorId = url1.searchParams.get("vendorid");

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
               // var Contract = context.currentRecord;

              if(context.fieldId == 'custpage_ss_pagination'){

                    var index = context.currentRecord.getValue('custpage_ss_pagination');
                    var output = url.resolveScript({
                        scriptId: 'customscriptda_su_customer_stmt_wo_pdc',
                        deploymentId: 'customdeployda_su_customer_stmt_wo_pdc',
                        returnExternalUrl: false,
                        params: {
                            startno: index
                        }

                    });
                   if (window.onbeforeunload){
                       window.onbeforeunload=function() { null;};
                    };
                    console.log(output);

                    window.open(window.location.origin + '' + output, '_self');



                }

                if (context.fieldId == 'custpage_ss_customer' || context.fieldId == 'custpage_ss_end_date' || context.fieldId == 'custpage_ss_start_date' || context.fieldId == 'custpage_ss_subsidiary'){
                    var customerId = context.currentRecord.getValue('custpage_ss_customer');


                    var startDate = context.currentRecord.getValue('custpage_ss_start_date');
                    var endDate = context.currentRecord.getValue('custpage_ss_end_date');
                    if(!startDate && endDate){
							alert("Please Select Start Date");
                            return false;
                    }else if (startDate && !endDate) {
                           return false;
                    }else{
                       var output = url.resolveScript({
                            scriptId: 'customscriptda_su_customer_stmt_wo_pdc',
                            deploymentId: 'customdeployda_su_customer_stmt_wo_pdc',
                            returnExternalUrl: false,
                            params: {
                            	customerId: customerId,
                                startDate :startDate,
                                endDate:endDate,
                                startDateText:context.currentRecord.getText('custpage_ss_start_date'),
                                endDateText:context.currentRecord.getText('custpage_ss_end_date'),
                              subsidiaryId: context.currentRecord.getValue('custpage_ss_subsidiary')
                            }

                        });
                        if (window.onbeforeunload){
                          window.onbeforeunload=function() {null;};
                        };
                        console.log(output);
                        window.open(window.location.origin + '' + output, '_self');
                    }


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
