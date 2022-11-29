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

            if(scriptContext.fieldId == 'subsidiary' || scriptContext.fieldId == 'postingperiod'){
                var subsidiaryId = scriptContext.currentRecord.getValue('subsidiary');
                var periodID = scriptContext.currentRecord.getValue('postingperiod');

                var customrecord_da_pay_run_itemsSearchObj = search.create({
                   type: "customrecord_da_pay_run_items",
                   filters:
                   [
                      ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period","anyof",periodID], 
                      "AND",                      
                     [[["custrecord_da_pay_run_scheduling.custrecord_da_payroll_subsidiary","anyof",subsidiaryId],"AND",["custrecord_da_pay_run_scheduling.custrecord_da_override_primary_subsidair","anyof","@NONE@"]],"OR",["custrecord_da_pay_run_scheduling.custrecord_da_override_primary_subsidair","anyof",subsidiaryId]],
                      "AND",
                      ["custrecord_da_pay_run_scheduling.custrecord_da_sch_approval_status","anyof","3"]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "custrecord_da_pay_run_ded_amount",
                         summary: "SUM",
                         label: "Deducted Amount"
                      })
                   ]
                });
                var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
                customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
                   //
                   var amount = result.getValue({
                    name :'custrecord_da_pay_run_ded_amount',
                    summary : search.Summary.SUM
                   });
                   log.debug('amount', amount);
                   scriptContext.currentRecord.setValue('custbody_paycheck_payment_total', amount);
                });
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

        try{
        }catch(ex){
            console.log(ex.name, ex.message);
        }

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
//      pageInit: pageInit,
     fieldChanged: fieldChanged,
//      postSourcing: postSourcing,
//      sublistChanged: sublistChanged,
//      lineInit: lineInit,
//      validateField: validateField,
  //  validateLine: validateLine,
//      validateInsert: validateInsert,
//      validateDelete: validateDelete,
//      saveRecord: saveRecord
    };

});