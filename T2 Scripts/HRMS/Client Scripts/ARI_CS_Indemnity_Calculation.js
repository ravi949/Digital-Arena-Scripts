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
            if(scriptContext.fieldId == 'custrecord_da_ind_cal_name'){



                var postingPeriodId = scriptContext.currentRecord.getValue('custrecord_da_ind_pay_period');
                var empId = scriptContext.currentRecord.getValue('custrecord_da_ind_cal_name');

                 var numLines = scriptContext.currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_final_settl_parent'
                });
                for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_final_settl_parent',
                            line: i,
                            ignoreRecalc: true
                        });
                }

                if(postingPeriodId){
                  var customrecord_da_pay_run_itemsSearchObj = search.create({
                     type: "customrecord_da_pay_run_items",
                     filters:
                     [
                        ["custrecord_da_pay_run_employee","anyof",empId], 
                        "AND", 
                        ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period","anyof",postingPeriodId]
                     ],
                     columns:
                     [
                        search.createColumn({name: "custrecord_da_payroll_item_type", label: "Item Type"}),
                        search.createColumn({name: "custrecord_da_pay_run_paroll_items", label: "Payroll Item"}),
                        search.createColumn({name: "custrecord_da_pay_run_item_amount", label: "Amount"}),
                        search.createColumn({name: "custrecord_da_pay_run_ded_amount", label: "Deducted Amount"}),
                        search.createColumn({
                           name: "custrecord_da_sch_pay_run_account",
                           join: "CUSTRECORD_DA_PAY_RUN_SCHEDULING",
                           label: "Account"
                        }),
                       search.createColumn({
                         name: "custrecord_da_item_expense_account",
                         join: "CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS",
                         label: "Account"
                      })
                     ]
                  });
                  var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                  log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
                  customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
                     scriptContext.currentRecord.setValue('custrecord_da_salaries_account', result.getValue({
                       name :'custrecord_da_sch_pay_run_account',
                       join :'CUSTRECORD_DA_PAY_RUN_SCHEDULING'
                     }));
                     scriptContext.currentRecord.selectNewLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_payroll_type',
                       value : result.getValue('custrecord_da_payroll_item_type'),
                       forceSyncSourcing : true
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_payroll_item',
                       value : result.getValue('custrecord_da_pay_run_paroll_items')
                     });
                    scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_payroll_account',
                       value :  result.getValue({
                       name :'custrecord_da_item_expense_account',
                       join :'CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS'
                     })
                     });
                    scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_amount',
                       value : result.getValue('custrecord_da_pay_run_item_amount')
                     });
                    scriptContext.currentRecord.commitLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                     return true;
                  });
                }
              
                var empfieldLookUp = search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: empId,
                    columns: ['hiredate', 'custentity_da_emp_basic_salary','custentity_da_unpaid_leave_open_balance']   
                });
                var hiredate = empfieldLookUp.hiredate;
                var basicsalary = empfieldLookUp.custentity_da_emp_basic_salary;
                var unpaidleavesOpeningbalance = empfieldLookUp.custentity_da_unpaid_leave_open_balance;
                var day = hiredate.split('/')[0], month = hiredate.split('/')[1],year =hiredate.split('/')[2] ;
                console.log(hiredate);
                log.audit("unpaidleavesOpeningbalance",unpaidleavesOpeningbalance);
                scriptContext.currentRecord.setValue('custrecord_da_ind_cal_doj',new Date(month+"/"+day+"/"+year));
                scriptContext.currentRecord.setValue('custrecord_da_indcal_month_salary',basicsalary);
              
              //set Loan Payable Amount 
              var customrecord_da_emp_special_termsSearchObj = search.create({
                   type: "customrecord_da_emp_special_terms",
                   filters:
                   [
                      ["custrecord_da_sp_term_type","anyof","2"],
                      "AND", 
                      ["custrecord_da_sp_term_employee","anyof",empId]
                   ],
                   columns:
                   [
                     search.createColumn({name: "custrecord_da_sp_term_type", label: "Item Type"}),
                      search.createColumn({name: "custrecord_da_sp_terms_payroll_item", label: "Payroll Item"}),
                      search.createColumn({name: "custrecord_da_sp_term_instalment_amount", label: "Instalment Amount"}),
                      search.createColumn({name: "custrecord_da_paid_amount", label: "Paid Amount"}),
                      search.createColumn({name: "custrecord_da_sp_term_total_amount", label: "Total Amount"})
                   ]
                });
                var loanPayableAmount = 0;
                customrecord_da_emp_special_termsSearchObj.run().each(function(result){
                   var totalAmount = result.getValue('custrecord_da_sp_term_total_amount');
                   var paidAmount = result.getValue('custrecord_da_paid_amount');
                  
                   scriptContext.currentRecord.selectNewLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_payroll_type',
                       value : result.getValue('custrecord_da_sp_term_type'),
                       forceSyncSourcing : true
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_payroll_item',
                       value : result.getValue('custrecord_da_sp_terms_payroll_item')
                     });
                  if(paidAmount){
                     var balance = parseFloat(totalAmount) - parseFloat(paidAmount);
                  loanPayableAmount = parseFloat(loanPayableAmount) + parseFloat(balance);
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_amount',
                       value : balance
                     });
                  }else{
                     loanPayableAmount = parseFloat(loanPayableAmount) + parseFloat(totalAmount);
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_amount',
                       value :totalAmount
                     });
                  }
                   
                    scriptContext.currentRecord.commitLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                  
                   return true;
                });
              console.log(loanPayableAmount);
           scriptContext.currentRecord.setValue('custrecord_da_ind_loan_payable_amount',loanPayableAmount);

                //Earnings sublist
                var earningsAmount = 0,mobileAllowanceAmount = 0,travelallowAmount = 0,leavedays = 0,bonusAmount = 0,ticketsAmount = 0;
                var specialTermsEarnings = 0;

                var totalAllowanceAmount = parseFloat(earningsAmount)+parseFloat(specialTermsEarnings);
                scriptContext.currentRecord.setValue('custrecord_ind_total_allowance',totalAllowanceAmount);

                //unpaid leaves calculation
                //
               var customrecord_da_employee_leavesSearchObj = search.create({
                                    type: "customrecord_da_employee_leaves",
                                    filters: [
                                        ["custrecord_da_employee_leave", "anyof", empId],
                                        "AND",
                                        ["custrecord_da_emp_leavetype", "anyof", "3"],
                                        "AND",
                                        ["custrecord_da_leave_approvalstatus", "anyof", "2"],"AND",["custrecord_da_emp_leavedays", "greaterthan", 21]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "custrecord_da_emp_leavedays",
                                            label: "Leave Days"
                                        })
                                    ]
                                });
                                var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                                log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                                customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                                    var days = result.getValue('custrecord_da_emp_leavedays');
                                      leavedays  = parseFloat(leavedays)+parseFloat(days);
                                    return true;
                                });
                console.log("leavedays"+leavedays);
                var totalunpaidLeaves = ((parseFloat(unpaidleavesOpeningbalance))?parseFloat(unpaidleavesOpeningbalance):0)+parseFloat(leavedays);
                scriptContext.currentRecord.setValue('custrecord_da_indcal_unpaid_leaves',totalunpaidLeaves);


                //salary eligible
                var salaryEligibleforIndemnity = parseFloat(totalAllowanceAmount)+parseFloat(basicsalary);
                scriptContext.currentRecord.setValue('custrecord_da_indcal_salary_eligible',Number(salaryEligibleforIndemnity).toFixed(2));


            }

            if(scriptContext.fieldId == 'custrecord_da_ind_pay_period'){

                var numLines = scriptContext.currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_final_settl_parent'
                    });
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_final_settl_parent',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                var postingPeriodId = scriptContext.currentRecord.getValue('custrecord_da_ind_pay_period');
                var empId = scriptContext.currentRecord.getValue('custrecord_da_ind_cal_name');

                if(postingPeriodId){
                  var customrecord_da_pay_run_itemsSearchObj = search.create({
                     type: "customrecord_da_pay_run_items",
                     filters:
                     [
                        ["custrecord_da_pay_run_employee","anyof",empId], 
                        "AND", 
                        ["custrecord_da_pay_run_scheduling.custrecord_da_sch_pay_run_period","anyof",postingPeriodId]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "custrecord_da_sch_pay_run_account",
                           join: "CUSTRECORD_DA_PAY_RUN_SCHEDULING",
                           label: "Account"
                        }),
                        search.createColumn({
                         name: "custrecord_da_item_expense_account",
                         join: "CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS",
                         label: "Account"
                      }),
                        search.createColumn({name: "custrecord_da_payroll_item_type", label: "Item Type"}),
                        search.createColumn({name: "custrecord_da_pay_run_paroll_items", label: "Payroll Item"}),
                        search.createColumn({name: "custrecord_da_pay_run_item_amount", label: "Amount"}),
                        search.createColumn({name: "custrecord_da_pay_run_ded_amount", label: "Deducted Amount"})
                     ]
                  });
                  var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
                  log.debug("customrecord_da_pay_run_itemsSearchObj result count",searchResultCount);
                  customrecord_da_pay_run_itemsSearchObj.run().each(function(result){
                     scriptContext.currentRecord.setValue('custrecord_da_salaries_account', result.getValue({
                       name :'custrecord_da_sch_pay_run_account',
                       join :'CUSTRECORD_DA_PAY_RUN_SCHEDULING'
                     }));
                     scriptContext.currentRecord.selectNewLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_payroll_type',
                       value : result.getValue('custrecord_da_payroll_item_type'),
                       forceSyncSourcing : true
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_payroll_account',
                       value :  result.getValue({
                       name :'custrecord_da_item_expense_account',
                       join :'CUSTRECORD_DA_PAY_RUN_PAROLL_ITEMS'
                     })
                     });
                     scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_payroll_item',
                       value : result.getValue('custrecord_da_pay_run_paroll_items')
                     });
                    scriptContext.currentRecord.setCurrentSublistValue({
                       sublistId :'recmachcustrecord_final_settl_parent',
                       fieldId :'custrecord_da_add_amount',
                       value : result.getValue('custrecord_da_pay_run_item_amount')
                     });
                    scriptContext.currentRecord.commitLine({
                      sublistId :'recmachcustrecord_final_settl_parent'
                     });
                     return true;
                  });
                }
            }

            if(scriptContext.fieldId == 'custrecord_da_ind_cal_last_work_day'){

                //working years
                var lastworkingday = scriptContext.currentRecord.getValue('custrecord_da_ind_cal_last_work_day');
                var employeeId = scriptContext.currentRecord.getValue('custrecord_da_ind_cal_name');

                if(lastworkingday){

                    var employeeGrade = scriptContext.currentRecord.getValue('custrecord_da_ind_employee_grade');

                    var customrecord_emp_leave_balanceSearchObj = search.create({
                        type: "customrecord_emp_leave_balance",
                        filters:
                            [
                                ["custrecord_employee_id","anyof",employeeId]
                                ],
                                columns:
                                    [
                                        search.createColumn({name: "custrecord_emp_leave_balance", label: "Leave Balance"})
                                        ]
                    });
                    var leaveBalance = 0;
                    var searchResultCount = customrecord_emp_leave_balanceSearchObj.runPaged().count;
                    log.debug("customrecord_emp_leave_balanceSearchObj result count",searchResultCount);
                    customrecord_emp_leave_balanceSearchObj.run().each(function(result){
                        leaveBalance = result.getValue('custrecord_emp_leave_balance');
                    });

                    var customrecord_da_emp_leaves_entitlementSearchObj = search.create({
                        type: "customrecord_da_emp_leaves_entitlement",
                        filters:
                            [
                                ["custrecord_da_leave_entitlement_employee","anyof",employeeId]
                                ],
                                columns:
                                    [
                                        search.createColumn({name: "custrecord_da_leave_entitlement_sdate", label: "Date From"}),
                                        search.createColumn({name: "custrecord_da_leave_entitlement_edate", label: "Date To"}),
                                        search.createColumn({name: "custrecord_da_leave_entitlement_value", label: "Entitlement"})
                                        ]
                    });

                    var leaveEntitlementValue = 0;

                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    customrecord_da_emp_leaves_entitlementSearchObj.run().each(function(result){
                        var endDate = (result.getValue('custrecord_da_leave_entitlement_edate'));
                        var startDate = (result.getValue('custrecord_da_leave_entitlement_sdate'));
                        var sDate = startDate.split("/");
                        var smonth = sDate[1], sDay = sDate[0] , sYear = sDate[2];                  

                        startDate = smonth+"/"+sDay+"/"+sYear;

                        if(endDate == "" || endDate == null || endDate ==" "){                      
                            if(new Date(startDate) <= yesterday){
                                leaveEntitlementValue = result.getValue('custrecord_da_leave_entitlement_value');
                            }
                        }else{
                            var eDate = endDate.split("/");
                            var emonth = eDate[1], eDay = eDate[0] , eYear = eDate[2];
                            endDate = emonth+"/"+eDay+"/"+eYear;

                            if(new Date(endDate) >= yesterday){
                                if(new Date(startDate) <= yesterday){
                                    leaveEntitlementValue = result.getValue('custrecord_da_leave_entitlement_value');
                                }
                            }                       
                        }
                    });
                    console.log("DEBUG",leaveEntitlementValue);

                    var selecteddate = scriptContext.currentRecord.getText('custrecord_da_ind_cal_last_work_day');//leave start date
                    console.log(selecteddate);
                    var resstart1 = selecteddate.split("/");
                    var resmonth1 = resstart1[1];
                    var resday1 = resstart1[0];
                    var resyear1 = resstart1[2];

                    console.log(resmonth1 +""+resday1 +""+resyear1);

                    var date_2 =new Date();
                    var date_1 = new Date(resmonth1+"/"+resday1+"/"+resyear1);

                    var noOfDays = function(date2,date1){
                        console.log(date2);
                        console.log(date1);
                        var res = Math.abs(date1 - date2) / 1000;
                        var days = Math.floor(res / 86400);
                        return days;
                    };
                    noOfDays = noOfDays(date_2,date_1)
                    var daysInMonth = function(month,year) {
                        return new Date(year, month, 0).getDate();
                    }
                    daysInMonth = daysInMonth(resmonth1,resyear1);
                    console.log(noOfDays +" "+leaveEntitlementValue +" "+daysInMonth);

                    var leaveEntitlementbetweenLeaveStartDateandToday = (((leaveEntitlementValue/12)/daysInMonth) * noOfDays);

                    if(date_1 > date_2){
                        leaveBalance = parseFloat(leaveBalance) + parseFloat(leaveEntitlementbetweenLeaveStartDateandToday);
                    }else{
                        leaveBalance = parseFloat(leaveBalance) - parseFloat(leaveEntitlementbetweenLeaveStartDateandToday);
                    }
                    leaveBalance = leaveBalance.toFixed(2);
                    console.log(leaveBalance);
                    scriptContext.currentRecord.setValue('custrecord_d_ind_leave_bal_days',leaveBalance);

                    var basicSalary = scriptContext.currentRecord.getValue('custrecord_da_indcal_month_salary');
                    
                    var totalSalary = scriptContext.currentRecord.getValue('custrecord_da_ind_emp_total_salary');
                    
                    var leavePayment = totalSalary *(12/260) * leaveBalance ;
                    leavePayment = leavePayment.toFixed(2);
                    scriptContext.currentRecord.setValue('custrecord_da_ind_accured_leave_payment',leavePayment);

                    var hiredate = scriptContext.currentRecord.getValue('custrecord_da_ind_cal_doj');
                    console.log(hiredate);

                    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                    var firstDate = new Date(hiredate);
                    var secondDate = new Date(lastworkingday);

                    console.log("firstDate"+firstDate);
                    console.log("secondDate"+secondDate);
                    var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

                    var totalunpaidLeaves = scriptContext.currentRecord.getValue('custrecord_da_indcal_unpaid_leaves');
                    var workingYears = (((parseFloat(diffDays)-parseFloat(totalunpaidLeaves)))+1)/365;
                    console.log(workingYears);
                    scriptContext.currentRecord.setValue('custrecord_da_indcal_workingyears',Number(workingYears).toFixed(2));

                    //salary eligible

                    var salaryEligibleforIndemnity= scriptContext.currentRecord.getValue('custrecord_da_indcal_salary_eligible');

                    //Indemnity KWD

                    var indemnityKWD = 0;               

                    var employeeLeavingType = scriptContext.currentRecord.getValue('custrecord_da_indemnity_type');

                    var noOfDaysEmployed = ((parseFloat(diffDays)-parseFloat(totalunpaidLeaves)));
                    console.log(noOfDaysEmployed);
                    scriptContext.currentRecord.setValue('custrecord_da_ind_no_of_days_employed',Number(noOfDaysEmployed).toFixed(2));
                    
                    var indemnityDays = 0;                  
                    var adjustMent = 0;

                    var customrecord_da_indemnity_pageSearchObj = search.create({
                       type: "customrecord_da_indemnity_page",
                       filters:
                       [
                          ["custrecord_da_ind_setting_parent.custrecord_da_ind_setting_country","anyof",scriptContext.currentRecord.getValue('custrecord_da_final_sett_country')]
                       ],
                       columns:
                       [
                          search.createColumn({name: "custrecord_da_year_limit", label: "From"}),
                          search.createColumn({name: "custrecord_da_ind_calc_to", label: "To"}),
                          search.createColumn({name: "custrecord_da_termination_indemnity", label: "Termination (Formula)"}),
                          search.createColumn({name: "custrecord_da_resignation_indemnity", label: "Resignation Formula"}),
                          search.createColumn({name: "custrecord_da_end_contract_indemnity", label: "Resignation Formula"})
                        ]
                    });
                    var searchResultCount = customrecord_da_indemnity_pageSearchObj.runPaged().count;
                    log.debug("customrecord_da_indemnity_pageSearchObj result count",searchResultCount);
                  
                   var indemnityTotal = 0;
                    customrecord_da_indemnity_pageSearchObj.run().each(function(result){
                       

                       var from = result.getValue('custrecord_da_year_limit');
                       var to = result.getValue('custrecord_da_ind_calc_to');

                       var G = totalSalary;
                       var B = basicSalary;
                       var WD = noOfDaysEmployed;
                       var WY = workingYears;

                      

                        console.log('from', from);
                            console.log('to', to);
                            console.log('workingYears', workingYears);

                            workingYears = Number(workingYears.toFixed(2));


                       if((Number(from) < workingYears) && (workingYears < Number(to))){
                        console.log(true);
                          if(employeeLeavingType == 1){

                             var formula = result.getValue('custrecord_da_termination_indemnity');

                             indemnityTotal = eval(formula);

                             console.log(formula);
                             console.log(indemnityTotal);

                          }
                          if(employeeLeavingType == 2){

                             var formula = result.getValue('custrecord_da_resignation_indemnity');
                              indemnityTotal = eval(formula);
                            
                          }
                          if(employeeLeavingType == 3){
                             var formula = result.getValue('custrecord_da_end_contract_indemnity');
                              indemnityTotal = eval(formula);
                          }
                       }
                       return true;
                    });
                    

                    indemnityDays = parseFloat(indemnityDays) + parseFloat(adjustMent);
                    console.log(indemnityDays);
                    scriptContext.currentRecord.setValue('custrecord_da_indcal_days',Number(noOfDaysEmployed).toFixed(2));

                    //var indemnityTotal = salaryEligibleforIndemnity * (12/365) * indemnityDays;
                    
                    //indemnityTotal = parseFloat(leavePayment) + parseFloat(indemnityTotal);

                    scriptContext.currentRecord.setValue('custrecord_da_indcal_indemnity',Number(indemnityTotal).toFixed(2));

                    //Indemnity(days)
                }

            }
            
            if(scriptContext.fieldId == 'custrecord_da_ind_adjust_amount' || scriptContext.fieldId == 'custrecord_da_indcal_indemnity'){
                var indemnityAmount = scriptContext.currentRecord.getValue('custrecord_da_indcal_indemnity');
                var adjustmentAmount = scriptContext.currentRecord.getValue('custrecord_da_ind_adjust_amount');
              var leavePaymentAmount = 0;
              
              leavePaymentAmount= scriptContext.currentRecord.getValue('custrecord_da_ind_accured_leave_payment');
              var loanPayableAmount = scriptContext.currentRecord.getValue('custrecord_da_ind_loan_payable_amount');
                
                var finalSettlementAmount = parseFloat(indemnityAmount) + parseFloat(adjustmentAmount) - parseFloat(loanPayableAmount) + parseFloat(leavePaymentAmount);
                scriptContext.currentRecord.setValue('custrecord_da_ind_final_settle_amount',finalSettlementAmount.toFixed(2));
            }

            if(scriptContext.fieldId == 'custrecord_da_indemnity_type'){
                scriptContext.currentRecord.setValue('custrecord_da_ind_cal_last_work_day','');
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
   
      var lc = scriptContext.currentRecord.getLineCount({
        sublistId :'recmachcustrecord_final_settl_parent'
      });
      
      var payrollAmount = 0;
      for(var i = 0 ; i < lc; i++){
        var amount = scriptContext.currentRecord.getSublistValue({
           sublistId :'recmachcustrecord_final_settl_parent',
          fieldId :'custrecord_da_add_amount',
          line : i
        });
        var type = scriptContext.currentRecord.getSublistValue({
           sublistId :'recmachcustrecord_final_settl_parent',
          fieldId :'custrecord_da_payroll_type',
          line : i
        });
        console.log(amount);
        if(type == 1){
          payrollAmount = parseFloat(payrollAmount) + parseFloat(amount);
        }
         if(type == 2){
          payrollAmount = parseFloat(payrollAmount) - parseFloat(amount);
        }
        
      }
      console.log(payrollAmount);
      scriptContext.currentRecord.setValue('custrecord_da_payroll_amount', payrollAmount);
      return true;

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
        saveRecord: saveRecord
    };

});