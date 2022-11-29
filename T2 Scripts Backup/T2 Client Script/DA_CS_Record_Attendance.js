/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url'],
    function(search, url) {
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
          var lc  = scriptContext.currentRecord.getLineCount({ sublistId: 'recmachcustrecord_da_amm_atten_parent'});
            if (mode == "edit" && lc == 0) {
               var sessionId = scriptContext.currentRecord.getValue('custrecord_da_bam_session_id');
               var date = scriptContext.currentRecord.getText('custrecord_da_attn_db_date');
                    var subId = scriptContext.currentRecord.getValue('custrecord_da_rec_att_sub_id');
                    console.log(subId);
                  
                    var customrecord_da_amm_time_table_recordSearchObj = search.create({
                        type: "customrecord_da_amm_time_table_record",
                        filters: [
                            ["custrecord_da_amm_tt_event_id", "anyof", sessionId],
                              "AND",
                            ["custrecord_da_student_name", "isnotempty", ""]
                        ],
                        columns: [
                           search.createColumn({
                             name: "custrecord_da_amm_tt_student",
                             summary: "GROUP",
                             label: "Student"
                          }),
                           search.createColumn({
         name: "internalid",
         summary: "MAX",
         label: "Internal ID"
      })
                        ]
                    });
                    var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                    log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                    customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                      
                      var value =  result.getValue({name :'custrecord_da_amm_tt_student',summary : search.Summary.GROUP});
                      
                      if(value){
                        console.log(result.id);
                        scriptContext.currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent'
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent',
                            fieldId: 'custrecord_da_amm_attn_student',
                            value: result.getValue({name :'custrecord_da_amm_tt_student',summary : search.Summary.GROUP})
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent',
                            fieldId: 'custrecord_da_att_db_tt_id',
                            value:result.getValue({name :'internalid',summary : search.Summary.MAX})
                        });
                        scriptContext.currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent'
                        });
                      }
                        
                        
                        return true;
                    });
             /*   var calendareventSearchObj = search.create({
                    type: "calendarevent",
                    filters: [
                        ["date", "on", "today"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "title",
                            sort: search.Sort.ASC,
                            label: "Event"
                        })
                    ]
                });
                var searchResultCount = calendareventSearchObj.runPaged().count;
                log.debug("calendareventSearchObj result count", searchResultCount);
                var field = scriptContext.currentRecord.getField({
                    fieldId: 'custpage_event'
                });
                calendareventSearchObj.run().each(function(result) {
                    // .run().each has a limit of 4,000 results
                    field.insertSelectOption({
                        value: result.id,
                        text: result.getValue('title')
                    });
                    return true;
                });*/
            }
            console.log('sdkfhs');
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
                if (scriptContext.fieldId == 'custpage_event') {
                    var eventId = scriptContext.currentRecord.getValue('custpage_event');
                    scriptContext.currentRecord.setValue('custrecord_da_bam_session_id', eventId);
                  var numLines =  scriptContext.currentRecord.getLineCount({
                     sublistId: 'recmachcustrecord_da_amm_atten_parent'
                   });
                  console.log(numLines);
                  for (var i = numLines - 1; i >= 0; i--) {
                    console.log(i);
						scriptContext.currentRecord.removeLine({
							sublistId: 'recmachcustrecord_da_amm_atten_parent',
							line: i,
							ignoreRecalc: true
						});
					}
                }
                if (scriptContext.fieldId == 'custrecord_da_attn_db_date') {
                    var date = scriptContext.currentRecord.getText('custrecord_da_attn_db_date');
                    console.log(date);
                    var calendareventSearchObj = search.create({
                        type: "calendarevent",
                        filters: [
                            ["date", "on", date]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "title",
                                sort: search.Sort.ASC,
                                label: "Event"
                            })
                        ]
                    });
                    var searchResultCount = calendareventSearchObj.runPaged().count;
                    log.debug("calendareventSearchObj result count", searchResultCount);
                    var field = scriptContext.currentRecord.getField({
                        fieldId: 'custpage_event'
                    });
                    field.removeSelectOption({
                        value: null,
                    });
                    field.insertSelectOption({
                        value: " ",
                        text: " "
                    });
                    calendareventSearchObj.run().each(function(result) {
                        // .run().each has a limit of 4,000 results
                        field.insertSelectOption({
                            value: result.id,
                            text: result.getValue('title')
                        });
                        if (searchResultCount == 1) {
                            scriptContext.currentRecord.setValue('custpage_event', result.id);
                        }
                        return true;
                    });
                }
                if (scriptContext.fieldId == 'custpage_event') {}
                return true;
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
        function postSourcing(scriptContext) {
            try {
                if (scriptContext.fieldId == 'custrecord_da_rec_att_sub_id') {
                    var date = scriptContext.currentRecord.getText('custrecord_da_attn_db_date');
                    var subId = scriptContext.currentRecord.getValue('custrecord_da_rec_att_sub_id');
                    console.log(subId);
                  
                    var customrecord_da_amm_time_table_recordSearchObj = search.create({
                        type: "customrecord_da_amm_time_table_record",
                        filters: [
                            ["custrecord_da_amm_tt_batch_subject", "anyof", subId],
                            "AND",
                            ["custrecord_da_amm_tt_date", "on", date]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_amm_tt_student",
                                label: "Student Id"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                    log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                    customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                        
                        scriptContext.currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent'
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent',
                            fieldId: 'custrecord_da_amm_attn_student',
                            value: result.getValue('custrecord_da_amm_tt_student')
                        });
                         scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent',
                            fieldId: 'custrecord_da_att_db_tt_id',
                            value: result.id
                        });
                        scriptContext.currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_da_amm_atten_parent'
                        });
                        return true;
                    });
                }
                return true;
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
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
            try {} catch (ex) {
                log.error(ex.name, ex.message);
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
           // postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            lineInit: lineInit,
            //      validateField: validateField,
            //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
            saveRecord: saveRecord
        };
    });