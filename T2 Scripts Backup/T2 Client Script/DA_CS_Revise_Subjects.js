/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/url'],

        function(search,url) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    var mode;
    function pageInit(scriptContext) {
              mode = scriptContext.mode;
      console.log('sdkfhs');
      
     
      var field = scriptContext.currentRecord.getField({
                        fieldId: 'custpage_subjects'
                    });
            field.isDisplay = false;
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
        
        if(scriptContext.fieldId == 'custrecord_da_choose_option'){
          
          var selectedOption = scriptContext.currentRecord.getValue('custrecord_da_choose_option');
          
          if(selectedOption == 1){
             var field = scriptContext.currentRecord.getField({
                        fieldId: 'custpage_subjects'
                    });
            field.isDisplay = false;
          }else{
            var field = scriptContext.currentRecord.getField({
                        fieldId: 'custpage_subjects'
                    });
            field.isDisplay = true;
          }
          
          
        }
        if(scriptContext.fieldId == 'custrecord_da_amm_revise_batch_so'){
            var salesOrderId = scriptContext.currentRecord.getValue('custrecord_da_amm_revise_batch_so');
            log.debug('sub',salesOrderId);
            
           var salesorderSearchObj = search.create({
               type: "salesorder",
               filters:
               [
                  ["type","anyof","SalesOrd"], 
                  "AND", 
                  ["mainline","is","F"], 
                  "AND", 
                  ["custcol_da_amm_sub_ref","noneof","@NONE@"], 
                  "AND", 
                  ["internalid","anyof",salesOrderId]
               ],
               columns:
               [
                  search.createColumn({name: "tranid", label: "Document Number"}),
                  search.createColumn({name: "internalid", label: "Internal ID"}),
                  search.createColumn({name: "entity", label: "Name"}),
                  search.createColumn({name: "custcol_da_amm_sub_ref", label: "Subject Ref"}),
                  search.createColumn({name: "item", label: "Item"})
               ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj result count",searchResultCount);           
                salesorderSearchObj.run().each(function(result){
                   // .run().each has a limit of 4,000 results
                    var field = scriptContext.currentRecord.getField({
                        fieldId: 'custpage_subjects'
                    });
                    field.insertSelectOption({
                        value: result.getValue('item'),
                        text: result.getText('item')
                    }); 
                   return true;
                });
                

        }
        if(scriptContext.fieldId == 'custpage_subjects'){
            console.log(scriptContext.currentRecord.getValue('custpage_subjects'));
            scriptContext.currentRecord.setValue('custrecord_da_revise_batch_subject_names',scriptContext.currentRecord.getValue('custpage_subjects'));
        }
        return true;
        
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
        }catch(ex){
            console.log(ex.name,ex.message);
        }

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
//      postSourcing: postSourcing,
//      sublistChanged: sublistChanged,
//      lineInit: lineInit,
//      validateField: validateField,
//      validateLine: validateLine,
//      validateInsert: validateInsert,
//      validateDelete: validateDelete
    };

});