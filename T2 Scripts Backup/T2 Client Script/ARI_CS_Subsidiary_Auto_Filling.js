/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime','N/url','N/https'],
    function(record, search, runtime, url, https) {
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
            try {
                console.log('Script Triggered');
              //scriptContext.currentRecord.setValue('comments', 'Test');
                mode = scriptContext.mode;
                var subsidiaryExistsUrl = url.resolveScript({
                    scriptId: 'customscript_da_su_subsidiary_checking',
                    deploymentId: 'customdeploy_da_su_subsidiary_checking',
                    returnExternalUrl: false
                });
                log.debug('subsidiaryExists', subsidiaryExistsUrl);
                var response = https.get({
                    url: subsidiaryExistsUrl
                });
                console.log(response);
                console.log(JSON.parse(response.body).subsidairiesExists);
                if (JSON.parse(response.body).subsidairiesExists) {
                    subsidiaryExists = true;
                }
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        function redirectToBack() {
            history.go(-1);
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
                if (scriptContext.fieldId == 'custrecord_da_grade_subsidiary') {
                    console.log("djgk");
                    var record1 = scriptContext.currentRecord.selectLine({
                        sublistId: 'recmachcustrecord_da_grade_benefit',
                        line: 0
                    });
                    console.log(record1);
                    var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_grade_subsidiary');
                    record1.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_grade_benefit',
                        fieldId: 'custrecord_da_subsidiary_grade',
                        value: subsidairy
                    });
                }
                if (scriptContext.fieldId == 'custentity_da_employee_grade' || scriptContext.fieldId == 'custentity_da_emp_basic_salary') {
                    var gradeId = scriptContext.currentRecord.getValue('custentity_da_employee_grade');
                    scriptContext.currentRecord.setValue('custentity_da_employee_salary_basis', 1);
                  
                  var numLines = scriptContext.currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_da_earnings_employee'
                    });
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_da_earnings_employee',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                  
                    if(gradeId){
                    console.log(gradeId);
                    var gradeRec = record.load({
                        type: 'customrecord_da_pay_grades',
                        id: gradeId
                    });
                    console.log(gradeRec);
                    var nationality = scriptContext.currentRecord.getValue('custentity_da_emp_nationality');
                    var basicsalary = gradeRec.getValue('custrecord_da_grade_default_salary');
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
                      console.log(type +" "+ create);
                        if (type == 1 && create == true) {
                          console.log('jj');
                            var empRecord = scriptContext.currentRecord;
                            empRecord.selectNewLine({
                                sublistId: 'recmachcustrecord_da_earnings_employee'
                            });
                            empRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_earnings_employee',
                                fieldId: 'custrecord_da_earnings_payroll_item',
                                value: payrollitem
                            });
                            empRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_earnings_employee',
                                fieldId: 'custrecord_da_earnings_hours',
                                value: hours
                            });
                          if(percent > 0){
                            var basicSalary = empRecord.getValue('custentity_da_emp_basic_salary');
                            if(basicSalary > 0){
                              console.log('setting');
                              empRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_earnings_employee',
                                fieldId: 'custrecord_da_earnings_amount',
                                value: (basicSalary * (percent/100)).toFixed(2)
                            });
                            }
                            
                          }else{
                            empRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_earnings_employee',
                                fieldId: 'custrecord_da_earnings_amount',
                                value: amount
                            });
                          }
                            
                            empRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_earnings_employee'
                            });
                        }
                    }
                    }
                }
                if (scriptContext.fieldId == 'custentity_da_emp_basic_salary') {
                    /*var salary = scriptContext.currentRecord.getValue('custentity_da_emp_basic_salary');
                    var gradeRecId = scriptContext.currentRecord.getValue('custentity_da_employee_grade');
                    if (gradeRecId) {
                        var fieldLookUp = search.lookupFields({
                            type: 'customrecord_da_pay_grades',
                            id: gradeRecId,
                            columns: ['custrecord_da_grade_salary_from', 'custrecord_da_grade_salary_to']
                        });
                        var from = fieldLookUp.custrecord_da_grade_salary_from;
                        var to = fieldLookUp.custrecord_da_grade_salary_to;
                        if (salary > to || salary < from) {
                            alert('The salary range should be from ' + from + ' to ' + to);
                        }
                    }*/
                }
                if (scriptContext.fieldId == 'custrecord_da_sp_term_type') {
                    console.log('sublist field');
                    if (mode == "create" && subsidiaryExists) {
                        var subsidiary = scriptContext.currentRecord.getValue('subsidiary');
                        var spTermRec = scriptContext.currentRecord.selectLine({
                            sublistId: 'recmachcustrecord_da_sp_term_employee',
                            line: 0
                        });
                        spTermRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_sp_term_employee',
                            fieldId: 'custrecord_da_term_subsidiary',
                            value: subsidiary
                        });
                    }
                }
                if (scriptContext.fieldId == 'custrecord_show_items') {
                    if (mode == "create" && subsidiaryExists) {
                        var subsidiary = scriptContext.currentRecord.getValue('subsidiary');
                        var earningsRec = scriptContext.currentRecord.selectLine({
                            sublistId: 'recmachcustrecord_da_earnings_employee',
                            line: 0
                        });
                        earningsRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_earnings_employee',
                            fieldId: 'custrecord_da_earnings_subsidiary',
                            value: subsidiary
                        });
                    }
                }

                if(scriptContext.fieldId == 'custrecord_da_earnings_amount'){                  
                    var payrollItem = scriptContext.currentRecord.getCurrentSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_payroll_item');
                    var payrollItemLookUp = search.lookupFields({
                        type :'customrecord_da_payroll_items',
                        id : payrollItem,
                        columns : ['custrecord_da_payrol_item_category']
                    });

                    var itemCategory = payrollItemLookUp.custrecord_da_payrol_item_category[0].value;
                  console.log(itemCategory);

                    if(itemCategory == 28){
                        var martialStatus = scriptContext.currentRecord.getValue('custentity_da_emp_martial_status');
                        if(martialStatus == 1){
                            var nationality = scriptContext.currentRecord.getValue('custentity_da_emp_nationality');

                            if(nationality == 1){
                                var checkValue = 1665;
                            }else{
                                var checkValue = 1250;
                            }

                            var amount = scriptContext.currentRecord.getCurrentSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_amount');

                            if(amount < checkValue){
                                alert("Sorry , it should be minimum of" + checkValue);
                                //scriptContext.currentRecord.setCurrentSublistValue('recmachcustrecord_da_earnings_employee', 'custrecord_da_earnings_amount', checkValue);
                            }
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_ded_show_iems') {
                    if (mode == "create" && subsidiaryExists) {
                        var subsidiary = scriptContext.currentRecord.getValue('subsidiary');
                        var deductionRec = scriptContext.currentRecord.selectLine({
                            sublistId: 'recmachcustrecord_deduction_employee',
                            line: 0
                        });
                        deductionRec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_deduction_employee',
                            fieldId: 'custrecord_da_deduction_subsidiary',
                            value: subsidiary
                        });
                    }
                }
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
            if (scriptContext.sublistId == 'recmachcustrecord_da_earnings_employee') {
                console.log("postSourcing");
            }
            return true;
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
            if (scriptContext.sublistId == 'recmachcustrecord_da_earnings_employee') {
                console.log("sublistChanged");
            }
            return true;
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
            try {
                if (scriptContext.sublistId == 'recmachcustrecord_da_grade_benefit') {
                    if (subsidiaryExists) {
                        var subsidairy = scriptContext.currentRecord.getValue('custrecord_da_grade_subsidiary');
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_grade_benefit',
                            fieldId: 'custrecord_da_subsidiary_grade',
                            value: subsidairy
                        });
                    }
                }
                if (mode == "create" && subsidiaryExists) {
                    if (scriptContext.sublistId == 'recmachcustrecord_da_earnings_employee') {
                        var Empsubsidairy = scriptContext.currentRecord.getValue('subsidiary');
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_earnings_employee',
                            fieldId: 'custrecord_da_earnings_subsidiary',
                            value: Empsubsidairy
                        });
                    }
                    if (scriptContext.sublistId == 'recmachcustrecord_deduction_employee') {
                        console.log('Lineinit ded');
                        if (subsidiaryExists) {
                            var Empsubsidairy = scriptContext.currentRecord.getValue('subsidiary');
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_deduction_employee',
                                fieldId: 'custrecord_da_deduction_subsidiary',
                                value: Empsubsidairy
                            });
                        }
                    }
                    if (scriptContext.sublistId == 'recmachcustrecord_da_sp_term_employee') {
                        console.log('Lineinit SP');
                        if (subsidiaryExists) {
                            var Empsubsidairy = scriptContext.currentRecord.getValue('subsidiary');
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_sp_term_employee',
                                fieldId: 'custrecord_da_term_subsidiary',
                                value: Empsubsidairy
                            });
                        }
                    }
                }
                return true;
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
            try {
                var scriptObj = runtime.getCurrentScript();
                log.debug("Deployment Id: " + scriptObj.deploymentId);
                /*  if(scriptObj.deploymentId == 'customdeploy_emp_subsidiary_autofi'){
                  var lc = scriptContext.currentRecord.getLineCount('recmachcustrecord_da_earnings_employee');
                console.log('lc' + lc);
                var earningsRec = scriptContext.currentRecord.selectLine({
                    sublistId: 'recmachcustrecord_da_earnings_employee',
                    line: lc
                });
                earningsRec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_earnings_employee',
                    fieldId: 'custrecord_da_earnings_subsidiary',
                    value: ''
                });
                earningsRec.commitLine({
                    sublistId: 'recmachcustrecord_da_earnings_employee'
                });
               }*/
                if (scriptObj.deploymentId == 'customdeploy_ari_cs_subsidiary_autofill') {
                    var salary = scriptContext.currentRecord.getValue('custentity_da_emp_basic_salary');
                    var gradeRecId = scriptContext.currentRecord.getValue('custentity_da_employee_grade');
                    if (gradeRecId) {
                        var fieldLookUp = search.lookupFields({
                            type: 'customrecord_da_pay_grades',
                            id: gradeRecId,
                            columns: ['custrecord_da_grade_salary_from', 'custrecord_da_grade_salary_to']
                        });
                        var from = fieldLookUp.custrecord_da_grade_salary_from;
                        var to = fieldLookUp.custrecord_da_grade_salary_to;
                        if (salary > to || salary < from) {
                            alert('The salary range should be from ' + from + ' to ' + to);
                            return false;
                        }
                    }
                }
                return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            //        validateField: validateField,
            //   validateLine: validateLine,
            //        validateInsert: validateInsert,
            //        validateDelete: validateDelete,
            saveRecord: saveRecord,
            redirectToBack: redirectToBack
        };
    });