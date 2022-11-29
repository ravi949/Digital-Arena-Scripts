/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search, url, currentRecord) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is being
         *            accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */
        var sc;

        function pageInit(scriptContext) {
            sc = scriptContext;
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
         *            scriptContext.lineNum - Line number. Will be undefined if not
         *            a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be undefined if
         *            not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(context) {

            try {
                // var objRecord = context.currentRecord;

                if (context.fieldId == 'custpage_ss_pagination') {

                    var vacancy_owner = context.currentRecord
                        .getValue('custpage_vacancy_owner');
                    var registered_vacancies = context.currentRecord
                        .getValue('custpage_registered_vacancies_id');
                    var sourceid = context.currentRecord
                        .getValue('custpage_source');
                    var weight = context.currentRecord
                        .getValue('custpage_total_weight');

                    var op = context.currentRecord.getValue('custpage_operator');
                    if (weight != null && op != null) {
                        var output = url.resolveScript({
                            scriptId: 'customscript_da_su_review_applicants',
                            deploymentId: 'customdeploy_da_su_review_applicants',
                            returnExternalUrl: false,
                            params: {
                                vacancy_owner: vacancy_owner,
                                sourceid: sourceid,
                                registered_vacancies: registered_vacancies,
                                weight: weight,
                                op: op
                            }

                        });
                        console.log(output);
                        window.open(window.location.origin + '' + output, '_self');
                    }
                }

                if (context.fieldId == 'custpage_vacancy_owner' ||
                    context.fieldId == 'custpage_registered_vacancies_id' ||
                    context.fieldId == 'custpage_source' ||
                    context.fieldId == 'custpage_total_weight' ||
                    context.fieldId == 'custpage_operator') {
                    var vacancy_owner = context.currentRecord
                        .getValue('custpage_vacancy_owner');
                    var registered_vacancies = context.currentRecord
                        .getValue('custpage_registered_vacancies_id');
                    var sourceid = context.currentRecord
                        .getValue('custpage_source');
                    var weight = context.currentRecord
                        .getValue('custpage_total_weight');
                    var op = context.currentRecord.getValue('custpage_operator');
                    if (weight != null && op != null) {
                        var output = url.resolveScript({
                            scriptId: 'customscript_da_su_review_applicants',
                            deploymentId: 'customdeploy_da_su_review_applicants',
                            returnExternalUrl: false,
                            params: {
                                vacancy_owner: vacancy_owner,
                                sourceid: sourceid,
                                registered_vacancies: registered_vacancies,
                                weight: weight,
                                op: op
                            }

                        });

                        console.log(output);
                        if (window.onbeforeunload) {
                            window.onbeforeunload = function() {
                                null;
                            };
                        };
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
         * Function to be executed after sublist is inserted, removed, or edited.
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
         *            scriptContext.lineNum - Line number. Will be undefined if not
         *            a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be undefined if
         *            not a matrix field
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
        function validateLine(context) {

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
        function saveRecord(scriptContext) {
            try {
                // window.open(window.location.origin +
                // '/app/common/custom/custrecordentry.nl?rectype=291&itemSno='+sno,'_self');

                return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        function markAll() {
            var objRecord = currentRecord.get();
            // console.log(objRecord);
            var numLines = objRecord.getLineCount({
                sublistId: 'custpage_report_data_sublist'
            });
            // console.log(numLines);

            for (var i = 0; i < numLines; i++) {
                var record = objRecord.selectLine({
                    sublistId: 'custpage_report_data_sublist',
                    line: i
                });
                objRecord.setCurrentSublistValue({
                    sublistId: 'custpage_report_data_sublist',
                    fieldId: 'custpage_reject',
                    line: i,
                    value: true
                });

            }
        }

        function unmarkAll() {
            var objRecord = currentRecord.get();
            // console.log(objRecord);
            var numLines = objRecord.getLineCount({
                sublistId: 'custpage_report_data_sublist'
            });
            // console.log(numLines);

            for (var i = 0; i < numLines; i++) {
                var record = objRecord.selectLine({
                    sublistId: 'custpage_report_data_sublist',
                    line: i
                });
                objRecord.setCurrentSublistValue({
                    sublistId: 'custpage_report_data_sublist',
                    fieldId: 'custpage_reject',
                    line: i,
                    value: false
                });

            }
        }

        function setButton() {
            try {
                console.log("trigered");
                var objRecord = currentRecord.get();

                var numLines = objRecord.getLineCount({
                    sublistId: 'custpage_report_data_sublist'
                });

                for (var i = 0; i < numLines; i++) {
                    var check = objRecord.getSublistValue({
                        sublistId: 'custpage_report_data_sublist',
                        fieldId: 'custpage_reject',
                        line: i
                    });
                    console.log(check);

                    if (check == true) {
                        var id = objRecord.getSublistValue({
                            sublistId: 'custpage_report_data_sublist',
                            fieldId: 'custpage_org_record_id',
                            line: i
                        });


                        console.log(id);
                        record.submitFields({
                            type: 'customrecord_da_registered_candidate',
                            id: id,
                            values: {
                                'custrecord_da_job_vacancy_status': 2
                            },
                            enableSourcing: false,
                            ignoreMandatoryFileds: true
                        });

                    }
                }
              window.location.reload();
            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        function funButton() {

            try {

                var objRecord = currentRecord.get();

                var numLines = objRecord.getLineCount({
                    sublistId: 'custpage_report_data_sublist'
                });

                for (var i = 0; i < numLines; i++) {
                    var check = objRecord.getSublistValue({
                        sublistId: 'custpage_report_data_sublist',
                        fieldId: 'custpage_reject',
                        line: i
                    });

                    if (check == true) {
                        var id = objRecord.getSublistValue({
                            sublistId: 'custpage_report_data_sublist',
                            fieldId: 'custpage_org_record_id',
                            line: i
                        });
                        var interv_date = objRecord.getSublistValue({
                            sublistId: 'custpage_report_data_sublist',
                            fieldId: 'custpage_interview_date',
                            line: i
                        });
                        record.submitFields({
                            type: 'customrecord_da_registered_candidate',
                            id: id,
                            values: {
                                'custrecord_da_job_vacancy_status': 3,
                                'custrecord_da_reg_can_interview_date': interv_date
                            },
                            enableSourcing: false,
                            ignoreMandatoryFileds: true
                        });
                        var interview_Record = record.create({
                            type: 'customrecord_da_interview_list',
                            isDynamic: true

                        });
                        interview_Record.setValue('custrecord_da_interview_reg_id',
                            id);
                        interview_Record.save();

                    }
                }
               window.location.reload();
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            // pageInit : pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine : validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord : saveRecord,
            markAll: markAll,
            unmarkAll: unmarkAll,
            setButton: setButton,
            funButton: funButton
        };

    });