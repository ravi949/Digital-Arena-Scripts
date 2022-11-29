/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
    function(record, search, runtime) {
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
            // alert('hii');
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
            
            if (scriptContext.fieldId == 'custrecord_da_feedback') {
               var empFeedback = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_employee_feedback_link',
                        fieldId: 'custrecord_da_feedback'
                    });
              
              scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_employee_feedback_link',
                        fieldId: 'custrecord_da_objective_evaluation',
                value : empFeedback
                    });
            }
                if (scriptContext.fieldId == 'custrecord_da_objective_evaluation') {
                    var evalution = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_employee_feedback_link',
                        fieldId: 'custrecord_da_objective_evaluation'
                    });
                    console.log(evalution);
                    if (evalution) {
                        var weightPercent = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link',
                            fieldId: 'custrecord_da_appraisal_weight_percent'
                        });
                        console.log(weightPercent);
                        var evalutionPercent = (evalution / 5) * weightPercent;
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link',
                            fieldId: 'custrecord_da_perform_appraisal_eval',
                            value: evalutionPercent.toFixed(2)
                        });
                    } else {
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link',
                            fieldId: 'custrecord_da_perform_appraisal_eval',
                            value: ''
                        });
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_competencies_evaluation') {
                    var evalution = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_appraisal_ref',
                        fieldId: 'custrecord_da_competencies_evaluation'
                    });
                    console.log(evalution);
                    if (evalution) {
                        var weightPercent = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_appraisal_ref',
                            fieldId: 'custrecord_da_appraisal_competencie_weig'
                        });
                        console.log(weightPercent);
                        var evalutionPercent = (evalution / 5) * weightPercent;
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_appraisal_ref',
                            fieldId: 'custrecord_da_appriasal_competencie_eval',
                            value: evalutionPercent.toFixed(2)
                        });
                    } else {
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_appraisal_ref',
                            fieldId: 'custrecord_da_appriasal_competencie_eval',
                            value: ''
                        });
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_period_ref') {
                    var numLines = scriptContext.currentRecord.getLineCount('recmachcustrecord_da_employee_feedback_link');
                    console.log(numLines);
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                    var numLines = scriptContext.currentRecord.getLineCount('recmachcustrecord_da_appraisal_ref');
                    console.log(numLines);
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_da_appraisal_ref',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                    var appraisalRec = scriptContext.currentRecord;
                    var customrecord_da_set_objectiveSearchObj = search.create({
                        type: "customrecord_da_set_objective",
                        filters: [
                            ["custrecord_da_employee_app", "anyof", scriptContext.currentRecord.getValue('custrecord_da_employee_feed')],
                            "AND",
                            ["custrecord_da_objective_for_apprisal.custrecord_da_appraisal_period_main", "anyof", scriptContext.currentRecord.getValue('custrecord_da_period_ref')],
                            "AND",
                            ["custrecord_da_objective_for_apprisal.custrecord_da_status_set_obj", "anyof", "2"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "scriptid",
                                label: "Script ID"
                            }),
                            search.createColumn({
                                name: "custrecord_da_app_objective_ar",
                                label: "Objective / Arabic"
                            }),
                            search.createColumn({
                                name: "custrecord_da_wight_app",
                                label: "Weight"
                            }),
                            search.createColumn({
                                name: "custrecord_da_employee_app",
                                label: "Employee"
                            }),
                            search.createColumn({
                                name: "custrecord_da_department_line",
                                label: "Department"
                            }),
                            search.createColumn({
                                name: "custrecord_da_set_objective_subsidiary",
                                label: "Subsidiary"
                            }),
                            search.createColumn({
                                name: "custrecord_da_attachment_required",
                                label: "Attachment Required ?"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_set_objectiveSearchObj.runPaged().count;
                    log.debug("customrecord_da_set_objectiveSearchObj result count", searchResultCount);
                    customrecord_da_set_objectiveSearchObj.run().each(function(result) {
                        scriptContext.currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link'
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link',
                            fieldId: 'custrecord_da_objective_ref',
                            value: result.id,
                            ignoreFieldChange: false,
                            forceSyncSourcing: true
                        });
                        scriptContext.currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_da_employee_feedback_link'
                        });
                        return true;
                    });
                    var customrecord_da_competencie_linesSearchObj = search.create({
                        type: "customrecord_da_competencie_lines",
                        filters: [
                            ["custrecord_da_competencies_ref.custrecord_da_competencies_tob_title", "anyof", scriptContext.currentRecord.getValue('custrecord_da_perform_app_emp_job_title')]
                        ],
                        columns: [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_competencie_linesSearchObj.runPaged().count;
                    log.debug("customrecord_da_competencie_linesSearchObj result count", searchResultCount);
                    customrecord_da_competencie_linesSearchObj.run().each(function(result) {
                        appraisalRec.selectNewLine({
                            sublistId: 'recmachcustrecord_da_appraisal_ref'
                        });
                        appraisalRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_appraisal_ref',
                            fieldId: 'custrecord_da_emp_competencies',
                            value: result.id,
                            ignoreFieldChange: false,
                            forceSyncSourcing : true
                        });
                        scriptContext.currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_da_appraisal_ref'
                        });
                        return true;
                    });
                }
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
        function lineInit(scriptContext) {
            try {
              
              var meeting = scriptContext.currentRecord.getValue('custrecord_da_meeting_perf_app');
              
              if(meeting == false){
               
                   var objField = scriptContext.currentRecord.getSublistField({
                    sublistId: 'recmachcustrecord_da_employee_feedback_link',
                    fieldId: 'custrecord_da_objective_evaluation',
                    line: 0
                });
               objField.isDisabled = true;
              }else{
                  var objField = scriptContext.currentRecord.getSublistField({
                    sublistId: 'recmachcustrecord_da_employee_feedback_link',
                    fieldId: 'custrecord_da_objective_evaluation',
                    line: 0
                });
               objField.isDisabled = false;
              }
              
           
            
             
            } catch (ex) {
                console.log(ex.name, ex.message);
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
        function validateLine(scriptContext) {
            console.log('validateLine');
            return true;
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
            try {} catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            //  postSourcing: postSourcing,
            //  sublistChanged: sublistChanged,
              lineInit: lineInit,
            //        validateField: validateField,
            //   validateLine: validateLine,
            //        validateInsert: validateInsert,
            //        validateDelete: validateDelete,
            // saveRecord: saveRecord,
            // redirectToBack: redirectToBack
        };
    });