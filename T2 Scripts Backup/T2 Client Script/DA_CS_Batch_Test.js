/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url', 'N/https'],
    function(search, url, https) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode, subsidiaryExists = false;

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
            try {
                if (scriptContext.fieldId == 'custrecord_da_amm_test_batch') {

                    var customrecord_da_amm_batch_subjectsSearchObj = search.create({
                       type: "customrecord_da_amm_batch_subjects",
                       filters:
                       [
                          ["custrecord_da_amm_batch_parent","anyof",scriptContext.currentRecord.getValue('custrecord_da_amm_test_batch')]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "id",
                             sort: search.Sort.ASC,
                             label: "ID"
                          }),
                          search.createColumn({name: "custrecord_da_amm_subject_name", label: "Subject Name"}),
                          search.createColumn({name: "custrecord_da_amm_subject_qauntity", label: "Quantity"})
                       ]
                    });
                    var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
                    log.debug("customrecord_da_amm_batch_subjectsSearchObj result count",searchResultCount);
                    var field = scriptContext.currentRecord.getField({
                          fieldId: 'custpage_select_subject'
                    });
                  field.removeSelectOption({
                    value: null
                }); 
                   field.insertSelectOption({
                                value:" ",
                                text:" "
                            });
                    customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result){
                        
                            field.insertSelectOption({
                                value: result.id,
                                text: result.getText('custrecord_da_amm_subject_name')
                            });
                            return true;
                    });
                }
                if (scriptContext.fieldId == 'custpage_select_subject') {
                   // 

                    var customrecord_da_amm_time_table_recordSearchObj = search.create({
                       type: "customrecord_da_amm_time_table_record",
                       filters:
                       [
                          ["custrecord_da_amm_tt_batch","anyof",scriptContext.currentRecord.getValue('custrecord_da_amm_test_batch')],
                          "AND", 
                          ["custrecord_da_amm_tt_batch_subject","anyof",scriptContext.currentRecord.getValue('custpage_select_subject')],
                          "AND", 
                          ["custrecord_da_student_name","isnotempty",""]
                       ],
                       columns:
                       [
                         search.createColumn({
                             name: "custrecord_da_amm_tt_student",
                             summary: "GROUP",
                             label: "Student Id"
                          }),
                          search.createColumn({
                             name: "custrecord_da_amm_tt_sub_marks",
                             summary: "MAX",
                             label: "Max. Marks"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                    log.debug("tt result count",searchResultCount);
                  var sc = scriptContext.currentRecord;
                  
                
                                     
  customrecord_da_amm_time_table_recordSearchObj.run().each(function(result){
    
                            var studentID = result.getValue({name:'custrecord_da_amm_tt_student',summary: search.Summary.GROUP});
                            console.log(studentID);
                      
                     		sc.selectNewLine({
                                sublistId: 'recmachcustrecord_da_amm_test_parent'
                            });
                           sc.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_amm_test_parent',
                                fieldId: 'custrecord_da_batch_student_name',
                                value: studentID
                            });
                           sc.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_amm_test_parent',
                                fieldId: 'custrecord_da_batch_student_sub_marks',
                                value: result.getValue({name:'custrecord_da_amm_tt_sub_marks',summary: search.Summary.MAX})
                            });
                            sc.commitLine({
                                sublistId: 'recmachcustrecord_da_amm_test_parent'
                            });
    return true;
  });
               scriptContext.currentRecord.setValue('custrecord_da_amm_test_subject', scriptContext.currentRecord.getValue('custpage_select_subject'));
                }
                //return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
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
        function postSourcing(scriptContext) {}
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
        function lineInit(scriptContext) {}
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
            try {
              return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
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
            //      validateDelete: validateDelete,
            saveRecord: saveRecord,
        };
    });