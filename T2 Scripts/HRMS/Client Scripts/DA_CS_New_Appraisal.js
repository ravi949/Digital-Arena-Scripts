/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format'],

        function(search,record,format) {

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
                var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_set_obj_emp_subsidiary');
                var department = scriptContext.currentRecord.getValue('custrecord_da_department_app');
                var employeeExists = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId:'recmachcustrecord_da_objective_for_apprisal',
                    fieldId :'custrecord_da_employee_app'
                });
                console.log(employeeExists);
                if(!employeeExists){
                     scriptContext.currentRecord.setCurrentSublistValue({
                      sublistId :'recmachcustrecord_da_objective_for_apprisal',
                      fieldId :'custrecord_da_set_objective_subsidiary',
                      value: subsidairy
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                      sublistId :'recmachcustrecord_da_objective_for_apprisal',
                      fieldId :'custrecord_da_department_line',
                      value: department
                    });
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

              if(scriptContext.fieldId == 'custrecord_da_department_app'){
                var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_set_obj_emp_subsidiary');
                var department = scriptContext.currentRecord.getValue('custrecord_da_department_app');
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_set_objective_subsidiary',
                  value: subsidairy
                });
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_department_line',
                  value: department
                });
              }
        }catch(ex){
            console.log(ex.name,ex.message);
        }

    }

    function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
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

      if(scriptContext.sublistId == 'recmachcustrecord_da_objective_for_apprisal'){
                var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_set_obj_emp_subsidiary');
                var department = scriptContext.currentRecord.getValue('custrecord_da_department_app');

                var employeeExists = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId:'recmachcustrecord_da_objective_for_apprisal',
                    fieldId :'custrecord_da_employee_app'
                });
                console.log(employeeExists);
                if(!employeeExists){
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_set_objective_subsidiary',
                  value: subsidairy
                });
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_department_line',
                  value: department
                });
            }
        
        return true;
      }
      

                

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

        if(scriptContext.sublistId == 'recmachcustrecord_da_objective_for_apprisal'){
                var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_set_obj_emp_subsidiary');
                var department = scriptContext.currentRecord.getValue('custrecord_da_department_app');
                var employeeExists = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId:'recmachcustrecord_da_objective_for_apprisal',
                    fieldId :'custrecord_da_employee_app'
                });
                console.log(employeeExists);
                if(!employeeExists){
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_set_objective_subsidiary',
                  value: subsidairy
                });
                scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId :'recmachcustrecord_da_objective_for_apprisal',
                  fieldId :'custrecord_da_department_line',
                  value: department
                });
            }
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
//      postSourcing: postSourcing,
    ///    sublistChanged: sublistChanged,
        lineInit: lineInit,
//      validateField: validateField,
//      validateLine: validateLine,
//      validateInsert: validateInsert,
//      validateDelete: validateDelete,
//      saveRecord: saveRecord
    };

});