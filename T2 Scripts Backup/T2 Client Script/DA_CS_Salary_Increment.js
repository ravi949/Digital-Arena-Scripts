/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/format'],
    function(search, record, format) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {}
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
                if (scriptContext.fieldId == 'hjg') {
                    var numLines = scriptContext.currentRecord.getLineCount('recmachcustrecord_salary_increment_parent');
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                    var gradeId = scriptContext.currentRecord.getValue('custrecord_da_emp_new_grade');
                    if (gradeId) {
                        console.log(gradeId);
                        var gradeRec = record.load({
                            type: 'customrecord_da_pay_grades',
                            id: gradeId
                        });
                        console.log(gradeRec);
                        var nationality = scriptContext.currentRecord.getValue('custrecord_da_grade_change_emp_nationa');
                        var basicsalary = gradeRec.getValue('custrecord_change_grade_basic_salary');
                        //scriptContext.currentRecord.setValue('custentity_da_emp_basic_salary', basicsalary);
                        //var subsidiary;
                        for (var j = 0; j < gradeRec.getLineCount('recmachcustrecord_da_grade_benefit'); j++) {
                            //subsidiary = gradeRec.getValue('custrecord_da_grade_subsidiary');
                            var payrollitem = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_payroll_item', j);
                            log.audit('payrollitem', payrollitem);
                            var hours = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_hours', j);
                            var amount = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_amount', j);
                            var type = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_grade_benefit_type', j);
                            var applyTo = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_ben_apply_to', j);
                            var percent = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_salary_percent', j);
                            console.log(applyTo);
                            //console.log(applyTo.includes(nationality));
                            var create = false;
                            if (applyTo.length > 0) {
                                console.log('if');
                                if (applyTo.includes(nationality)) {
                                    create = true;
                                }
                            } else {
                                console.log('else');
                                create = true;
                            }
                            console.log(type + " " + create);
                            if (type == 1 && create == true) {
                                console.log('jj');
                                var empRecord = scriptContext.currentRecord;
                                empRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_salary_increment_parent'
                                });
                                empRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_salary_increment_parent',
                                    fieldId: 'custrecord_allow_inc_payroll_item',
                                    value: payrollitem
                                });                             
                                if (percent > 0) {
                                    var basicSalary = scriptContext.currentRecord.getValue('custrecord_change_grade_basic_salary');
                                    if (basicSalary > 0) {
                                        console.log('setting');
                                        empRecord.setCurrentSublistValue({
                                            sublistId: 'recmachcustrecord_salary_increment_parent',
                                            fieldId: 'custrecord_allow_increment_amount',
                                            value: (basicSalary * (percent / 100)).toFixed(2)
                                        });
                                    }
                                } else {
                                    empRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_salary_increment_parent',
                                        fieldId: 'custrecord_allow_increment_amount',
                                        value: amount
                                    });
                                }
                                empRecord.commitLine({
                                    sublistId: 'recmachcustrecord_salary_increment_parent'
                                });
                            }
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_sal_inc_employee') {
                    var numLines = scriptContext.currentRecord.getLineCount('recmachcustrecord_salary_increment_parent');
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                    var employeeId = scriptContext.currentRecord.getValue('custrecord_da_sal_inc_employee');
                    var customrecord_da_emp_earningsSearchObj = search.create({
                        type: "customrecord_da_emp_earnings",
                        filters: [
                            ["custrecord_da_earnings_employee", "anyof", employeeId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_earnings_payroll_item",
                                label: "Payroll Item"
                            }),
                            search.createColumn({
                                name: "custrecord_da_earnings_amount",
                                label: "Amount"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                    log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                    customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                        scriptContext.currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_salary_increment_parent'
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            fieldId: 'custrecord_allow_inc_payroll_item',
                            value: result.getValue('custrecord_da_earnings_payroll_item'),
                            ignoreFieldChange: true
                        });
                        console.log('amount', result.getValue('custrecord_da_earnings_amount'));
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            fieldId: 'custrecord_all_inc_current_amount',
                            value: result.getValue('custrecord_da_earnings_amount'),
                            ignoreFieldChange: true
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            fieldId: 'custrecord_allow_increment_amount',
                            value: result.getValue('custrecord_da_earnings_amount'),
                            ignoreFieldChange: true
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_salary_increment_parent',
                            fieldId: 'custrecord_org_allowances_id',
                            value: result.id,
                            ignoreFieldChange: true
                        });
                        scriptContext.currentRecord.commitLine({
                            sublistId: 'recmachcustrecord_salary_increment_parent'
                        });
                        return true;
                    });
                }
            } catch (ex) {
                console.log(ex.name, ex.message);
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
        function saveRecord(scriptContext) {}
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
            //      saveRecord: saveRecord
        };
    });