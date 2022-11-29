/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/currentRecord', 'N/url', 'N/https'],
    function(search, record, currentRecord, url, https) {
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

            if(scriptContext.fieldId == 'custrecord_da_department_clear_feedback'){
               scriptContext.currentRecord.setCurrentSublistValue({
                sublistId :'recmachcustrecord_da_clearance_id',
                fieldId : 'custrecord_da_checked_by_clear',
                value : scriptContext.currentRecord.getValue('custrecord_da_employee_clearance_proc')
            })
                 var dept = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId :'recmachcustrecord_da_clearance_id',
                    fieldId : 'custrecord_da_department_clear_feedback'
                });
                var customrecord_da_authorized_p_f_clearanceSearchObj = search.create({
                   type: "customrecord_da_authorized_p_f_clearance",
                   filters:
                   [
                      ["custrecord_da_clearance_dept","anyof",dept]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_clearance_dept", label: "Deparrtment"}),
                      search.createColumn({name: "custrecord_da_authorized_employee", label: "Authorized Employee"})
                   ]
                });
                var searchResultCount = customrecord_da_authorized_p_f_clearanceSearchObj.runPaged().count;
                log.debug("customrecord_da_authorized_p_f_clearanceSearchObj result count",searchResultCount);
                customrecord_da_authorized_p_f_clearanceSearchObj.run().each(function(result){
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId :'recmachcustrecord_da_clearance_id',
                        fieldId : 'custrecord_auth_employee',
                        value : result.getValue('custrecord_da_authorized_employee')
                    });
                });
            }


        }

        function convertDate(inputFormat) {
            function pad(s) {
                return (s < 10) ? '0' + s : s;
            }
            var d = new Date(inputFormat);
            return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
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
        function sublistChanged(scriptContext) {}
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
        function validateField(scriptContext) {}
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
        function validateLine(scriptContext) {}
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
        function validateInsert(scriptContext) {}
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
        function validateDelete(scriptContext) {}
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
        //    postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
                 lineInit: lineInit,
            //      validateField: validateField,
            //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
          //  saveRecord: saveRecord,
           
        };
    });