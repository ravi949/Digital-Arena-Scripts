/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],
    function(search, record) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var totalIndemnityAmount = scriptContext.newRecord.getValue('custrecord_da_ind_final_settle_amount');
              
              var empLeavingType = scriptContext.newRecord.getValue('custrecord_da_indemnity_type');
              var leavingTypeId ;
              if(empLeavingType == 2){
                var employeestatusSearchObj = search.create({
                     type: "employeestatus",
                     filters:
                     [
                        ["name","contains","resign"]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "name",
                           sort: search.Sort.ASC,
                           label: "Status"
                        }),
                        search.createColumn({name: "category", label: "Category"})
                     ]
                  });
                  var searchResultCount = employeestatusSearchObj.runPaged().count;
                  log.debug("employeestatusSearchObj result count",searchResultCount);
                  employeestatusSearchObj.run().each(function(result){
                     leavingTypeId = result.id;
                     return true;
				});
              }
              
               if(empLeavingType == 1){
                var employeestatusSearchObj = search.create({
                     type: "employeestatus",
                     filters:
                     [
                        ["name","contains","termi"]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "name",
                           sort: search.Sort.ASC,
                           label: "Status"
                        }),
                        search.createColumn({name: "category", label: "Category"})
                     ]
                  });
                  var searchResultCount = employeestatusSearchObj.runPaged().count;
                  log.debug("employeestatusSearchObj result count",searchResultCount);
                  employeestatusSearchObj.run().each(function(result){
                     leavingTypeId = result.id;
                     return true;
				});
              }
              var empId = scriptContext.newRecord.getValue('custrecord_da_ind_cal_name');
               var empRecord = record.load({
                    type:'employee',
                    id: empId
                  });
                  empRecord.setValue('employeestatus', leavingTypeId);
                  empRecord.setValue('releasedate', scriptContext.newRecord.getValue('custrecord_da_ind_cal_last_work_day'));
                  empRecord.save();
                if (totalIndemnityAmount > 0) {
                  log.debug('true1');
                     var adjustmentAmount = scriptContext.newRecord.getValue('custrecord_da_ind_adjust_amount');
                    var leavePayment = scriptContext.newRecord.getValue('custrecord_da_ind_accured_leave_payment');
                    var indemnityAmount = scriptContext.newRecord.getValue('custrecord_da_indcal_indemnity');
                  
                  var totalIndemnityAmount = parseFloat(indemnityAmount) + parseFloat(adjustmentAmount) + parseFloat(leavePayment);
                  log.debug('totalIndemnityAmount', totalIndemnityAmount);
                    var paycheckJournalRec = record.create({
                        type: "customtransaction_da_paycheck_journal",
                        isDynamic: true
                    });
                    
                    paycheckJournalRec.setValue('subsidiary', scriptContext.newRecord.getValue('custrecord_da_indemnity_subsidiary'));
                    paycheckJournalRec.setValue('custbody_da_paycheck_emplyee', empId);
                   paycheckJournalRec.setValue('transtatus', "B");
                    paycheckJournalRec.setValue('trandate', scriptContext.newRecord.getValue('custrecord_da_indemntiy_pay_date'));
                    paycheckJournalRec.selectNewLine({
                        sublistId: 'line'
                    });
                    log.debug('credit totalIndemnityAmount', totalIndemnityAmount);
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: scriptContext.newRecord.getValue('custrecord_da_ind_account_credit')
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: totalIndemnityAmount
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: empId
                    });
                    paycheckJournalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: "Total Net indemnityAmount"
                    });
                    paycheckJournalRec.commitLine({
                        sublistId: 'line'
                    });
                    log.debug('true2')
                    var loanPayableAmount = scriptContext.newRecord.getValue('custrecord_da_ind_loan_payable_amount');
                   log.debug(' credit loanPayableAmount', loanPayableAmount);
               
                 
                           
                /*  if(loanPayableAmount > 0 || loanPayableAmount < 0){
                     var customrecord_da_payroll_itemsSearchObj = search.create({
                            type: "customrecord_da_payroll_items",
                            filters: [
                                ["custrecord_da_payrol_item_category", "anyof", "41"],
                                "AND",
                                ["custrecord_da_payroll_item_subsidiary", "anyof", scriptContext.newRecord.getValue('custrecord_da_indemnity_subsidiary')]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),                                
                                search.createColumn({
                                    name: "custrecord_da_item_expense_account",
                                    label: "Expense Account"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_itemsSearchObj result count", searchResultCount);
                        customrecord_da_payroll_itemsSearchObj.run().each(function(result) {
                            paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: result.getValue('custrecord_da_item_expense_account')
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: loanPayableAmount
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: "Loan Payable Amount"
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                            return true;
                        });
                  }*/
                  log.debug('debit indemnityAmount', indemnityAmount);
                    if (indemnityAmount > 0) {
                        var customrecord_da_payroll_itemsSearchObj = search.create({
                            type: "customrecord_da_payroll_items",
                            filters: [
                                ["custrecord_da_payrol_item_category", "anyof", "53"],
                                "AND",
                                ["custrecord_da_payroll_item_subsidiary", "anyof", scriptContext.newRecord.getValue('custrecord_da_indemnity_subsidiary')]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),                                
                                search.createColumn({
                                    name: "custrecord_da_item_expense_account",
                                    label: "Expense Account"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_itemsSearchObj result count", searchResultCount);
                        customrecord_da_payroll_itemsSearchObj.run().each(function(result) {
                            paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: result.getValue('custrecord_da_item_expense_account')
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: indemnityAmount
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: "IndemnityAmount"
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                           if(adjustmentAmount > 0){
                              paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: result.getValue('custrecord_da_item_expense_account')
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: adjustmentAmount
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: "Adjustment Amount"
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                           }
                           return true;
                        });
                    }
                  log.debug(' debit leavePayment', leavePayment);
                    if (leavePayment > 0) {
                        var customrecord_da_payroll_itemsSearchObj = search.create({
                            type: "customrecord_da_payroll_items",
                            filters: [
                                ["custrecord_da_payrol_item_category", "anyof", "2"],
                                "AND",
                                ["custrecord_da_payroll_item_subsidiary", "anyof", scriptContext.newRecord.getValue('custrecord_da_indemnity_subsidiary')]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_standarad_payroll_item_id",
                                    label: "Standarad payroll Item ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_item_expense_account",
                                    label: "Expense Account"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_itemsSearchObj result count", searchResultCount);
                        customrecord_da_payroll_itemsSearchObj.run().each(function(result) {
                            paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: result.getValue('custrecord_da_item_expense_account')
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: leavePayment
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: "Accured Leave Payment"
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                            return true;
                        });
                    }
                  
                  var salariesAccount =  scriptContext.newRecord.getValue('custrecord_da_salaries_account');
                  var payrollAmount = scriptContext.newRecord.getValue('custrecord_da_payroll_amount');
                    paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: salariesAccount
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: payrollAmount
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value: "Total Salalry"
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });
                  
                   var customrecord592SearchObj = search.create({
                     type: "customrecord_da_add_deductions",
                     filters:
                     [
                        ["custrecord_final_settl_parent","anyof",scriptContext.newRecord.id]
                     ],
                     columns:
                     [
                        search.createColumn({name: "custrecord_da_payroll_type", label: "Payroll type"}),
                        search.createColumn({name: "custrecord_da_add_payroll_item", label: "Payroll Item"}),
                        search.createColumn({name: "custrecord_da_add_amount", label: "Amount"}),
                        search.createColumn({name: "custrecord_da_payroll_account", label: "Account"})
                     ]
                  });
                  var searchResultCount = customrecord592SearchObj.runPaged().count;
                  log.debug("customrecord592SearchObj result count",searchResultCount);
                  customrecord592SearchObj.run().each(function(result){
                   
                      var amount = result.getValue('custrecord_da_add_amount');
                       var type =result.getValue('custrecord_da_payroll_type');
                       var comments = result.getText('custrecord_da_add_payroll_item');
                       var account =  result.getValue('custrecord_da_payroll_account');
                      log.debug('account', account);
                        paycheckJournalRec.selectNewLine({
                                sublistId: 'line'
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: account
                            });
                      if(type == 1){
                         paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: amount
                            });
                      }
                       if(type == 2){
                         paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: amount
                            });
                      }
                           
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: empId
                            });
                            paycheckJournalRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'memo',
                                value:comments
                            });
                            paycheckJournalRec.commitLine({
                                sublistId: 'line'
                            });  
                     return true;
                  });
                    var paycheck = paycheckJournalRec.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                    log.debug('paycheck', paycheck);
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });