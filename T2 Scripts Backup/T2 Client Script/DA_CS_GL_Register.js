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
                        scriptId: 'customscript_da_su_gl_register_suitelet',
                            deploymentId: 'customdeploy_da_su_gl_register_suitelet',
                        returnExternalUrl: false,
                        params: {
                            startno: index,
                            startDate :context.currentRecord.getValue('custpage_ss_start_date'),
                            endDate :context.currentRecord.getValue('custpage_ss_end_date'),
                            startDateText:context.currentRecord.getText('custpage_ss_start_date'),
                            endDateText:context.currentRecord.getText('custpage_ss_end_date'),
                            subsidiaryId: context.currentRecord.getValue('custpage_ss_subsidiary'),
                            locationId: context.currentRecord.getValue('custpage_ss_location'),
                            transaction: context.currentRecord.getValue('custpage_ss_transaction'),
                            account: context.currentRecord.getValue('custpage_ss_account'),
                        }

                    });
                   if (window.onbeforeunload){
                       window.onbeforeunload=function() { null;};
                    };
                    console.log(output);
                   
                    window.open(window.location.origin + '' + output, '_self');
                }
                if (context.fieldId == 'custpage_ss_start_date' || context.fieldId == 'custpage_ss_end_date' || context.fieldId == 'custpage_ss_subsidiary' || context.fieldId == 'custpage_ss_location' || context.fieldId == 'custpage_ss_transaction' || context.fieldId == 'custpage_ss_account'){
                   
                    var startDate = context.currentRecord.getValue('custpage_ss_start_date');
                    var endDate = context.currentRecord.getValue('custpage_ss_end_date');
                    if(!startDate && endDate){
                            alert("Please Select Start Date");
                            return false;
                    }else if (startDate && !endDate) {
                           return false;
                    }else{
                       var output = url.resolveScript({
                            scriptId: 'customscript_da_su_gl_register_suitelet',
                            deploymentId: 'customdeploy_da_su_gl_register_suitelet',
                            returnExternalUrl: false,
                            params: {
                                startDate :startDate,
                                endDate :endDate,
                                startDateText:context.currentRecord.getText('custpage_ss_start_date'),
                                endDateText:context.currentRecord.getText('custpage_ss_end_date'),
                                subsidiaryId: context.currentRecord.getValue('custpage_ss_subsidiary'),
                                locationId: context.currentRecord.getValue('custpage_ss_location'),
                                transaction: context.currentRecord.getValue('custpage_ss_transaction'),
                                account: context.currentRecord.getValue('custpage_ss_account'),
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
            //getSuiteletPage:getSuiteletPage
            
            
        };

    });