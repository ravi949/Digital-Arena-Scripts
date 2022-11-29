/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task'],
    function(runtime, search, record, task) {
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {
                if (scriptContext.type == "view") {
                    scriptContext.form.addButton({
                        id: 'custpage_print_employee_profile',
                        label: 'Employee Profile Print',
                        functionName: 'printEmployeeProfile(' + scriptContext.newRecord.id + ')'
                    });
                }
                scriptContext.form.clientScriptModulePath = './DA_CS_Attach_Links.js';
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            try {
              
             
                var empNationality = scriptContext.newRecord.getValue('custentity_da_emp_nationality');
                
                if(empNationality)
                 var customrecord_da_gosi_settingsSearchObj = search.create({
                     type: "customrecord_da_gosi_settings",
                     filters:
                     [
                     ],
                     columns:
                     [
                        search.createColumn({name: "custrecord_da_company_percent_gosi", label: "Company Percent"}),
                        search.createColumn({name: "custrecord_da_employee_percent_gosi", label: "Employee Percent"}),
                        search.createColumn({name: "custrecord_da_nationality_gosi", label: "Nationality"})
                     ]
                  });
                  var searchResultCount = customrecord_da_gosi_settingsSearchObj.runPaged().count;
                  log.debug("customrecord_da_gosi_settingsSearchObj result count",searchResultCount);
                  customrecord_da_gosi_settingsSearchObj.run().each(function(result){
                     var nationality = result.getValue('custrecord_da_nationality_gosi');
                    //console.log(nationality);
                    // console.log(empNationality);
                    if(empNationality == nationality){
                    //  console.log(true);
                      scriptContext.newRecord.setText('custentity_da_company_gosi', result.getValue('custrecord_da_company_percent_gosi'));
                      scriptContext.newRecord.setText('custentity_da_employee_gosi', result.getValue('custrecord_da_employee_percent_gosi'));
                      return false;
                    }  
                    if(empNationality != nationality && nationality == ''){
                    //    console.log(false);
                       scriptContext.newRecord.setText('custentity_da_company_gosi', result.getValue('custrecord_da_company_percent_gosi'));
                       scriptContext.newRecord.setText('custentity_da_employee_gosi', result.getValue('custrecord_da_employee_percent_gosi'));
                       return false;
                    }
                     return true;
                  });

                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);                
                var generalSettingRecID = 0;
              var attendanceRecId = 0;

                if (featureEnabled) {
                    var Subsidiary = scriptContext.newRecord.getValue('subsidiary');
                    var customrecord_da_general_settingsSearchObj = search.create({
                        type: "customrecord_da_general_settings",
                        filters: [
                            ["custrecord_da_settings_subsidiary", "anyof", Subsidiary]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_settings_subsidiary",
                                label: "Subsidiary"
                            }),
                            search.createColumn({
                                name: "custrecord_da_system_start_date",
                                label: "System Start Date"
                            }),
                            search.createColumn({
                                name: "custrecord_da_leave_balance_period",
                                label: "Leave balance period (Yearly or Monthly)"
                            }),
                            search.createColumn({
                                name: "custrecord_da_setting_working_days",
                                label: "Working Days Per Month"
                            })
                        ]
                    });
                    var c = customrecord_da_general_settingsSearchObj.run().getRange(0, 1);
                    if (c.length > 0) {
                        generalSettingRecID = c[0].id;
                    }
                  
                  var customrecord_da_attendance_setupSearchObj = search.create({
                     type: "customrecord_da_attendance_setup",
                     filters:
                     [
                        ["custrecord_da_att_emp_subsidiary","anyof",Subsidiary]
                     ],
                     columns:
                     [
                        search.createColumn({name: "custrecord_da_payroll_items_salalry", label: "Select Payroll Items To Include Attendance Salary"})
                     ]
                  });
                   var obj = customrecord_da_attendance_setupSearchObj.run().getRange(0, 1);
                    if (obj.length > 0) {
                        attendanceRecId = obj[0].id;
                    }
                }else{
                    generalSettingRecID = 1;
                  attendanceRecId =1;
                }

                if(generalSettingRecID > 0){
                    var settingsRec = record.load({
                            type: 'customrecord_da_general_settings',
                            id: generalSettingRecID
                        });
                        var WorkingHrsPerDay = settingsRec.getText('custrecord_working_hours_per_day');
                        var WorkingDaysPerMonth = settingsRec.getValue('custrecord_da_setting_working_days');

                        var laborCOstCalOn = settingsRec.getValue('custrecord_da_labor_cost_cal_on');
                    var total = 0;
                  
                  try{
                     var attendanceRec = record.load({
                            type: 'customrecord_da_attendance_setup',
                            id: attendanceRecId
                        });
                  var items = attendanceRec.getValue('custrecord_da_payroll_items_salalry');
                  log.debug('items', items);
                  
                    var customrecord_da_emp_earningsSearchObj = search.create({
                   type: "customrecord_da_emp_earnings",
                   filters:
                   [
                      ["custrecord_da_earnings_payroll_item","anyof",items], 
                      "AND", 
                      ["custrecord_da_earnings_employee","anyof",scriptContext.newRecord.id]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_earnings_employee", label: "Employee"}),
                      search.createColumn({name: "custrecord_da_earnings_type", label: "Type"}),
                      search.createColumn({name: "custrecord_da_earnings_hours", label: "Hours"}),
                      search.createColumn({name: "custrecord_da_earnings_amount", label: "Amount"})
                   ]
                });
                var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                log.debug("customrecord_da_emp_earningsSearchObj result count",searchResultCount);
                        
                customrecord_da_emp_earningsSearchObj.run().each(function(result){
                   // .run().each has a limit of 4,000 results
                   var amount = result.getValue('custrecord_da_earnings_amount');
                  total = parseFloat(total) + parseFloat(amount);
                   return true;
                });
                  }catch(ex){
                    log.error(ex.name,ex.message);
                  }
                 
                  var basic= scriptContext.newRecord.getValue('custentity_da_emp_basic_salary');
                  
                  var attTotal = parseFloat(basic) + parseFloat(total);
                  
                  log.debug('attTotal', attTotal);
                  
                        var WorkingHrsPerDay = settingsRec.getText('custrecord_working_hours_per_day');
                                    
                        if (attTotal > 0) {
                            var dailyRate = attTotal / WorkingDaysPerMonth;
                            scriptContext.newRecord.setValue('custentity_da_emp_daily_rate',Number(dailyRate).toFixed(2));
                            var laborCost = (dailyRate / WorkingHrsPerDay).toFixed(2);
                            log.debug(laborCost);
                            scriptContext.newRecord.setValue('custentity_da_attn_ded_value_2', Number(laborCost).toFixed(2));
                        }
                }

                
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {

              var gradeId = scriptContext.newRecord.getValue('custentity_da_employee_grade');



/*if (gradeId) {
   
    var gradeRec = record.load({
        type: 'customrecord_da_pay_grades',
        id: gradeId
    });
    var nationality = scriptContext.newRecord.getValue('custentity_da_employee_category');
    log.debug('nationality', nationality);
    var basicsalary = gradeRec.getValue('custrecord_da_grade_default_salary');
    //scriptContext.newRecord.setValue('custentity_da_emp_basic_salary', basicsalary);
    //var subsidiary;

   var empRecord = record.load({type: scriptContext.newRecord.type, id: scriptContext.newRecord.id, isDynamic : true});;
    for (var j = 0; j < gradeRec.getLineCount('recmachcustrecord_da_grade_benefit'); j++) {
        //subsidiary = gradeRec.getValue('custrecord_da_grade_subsidiary');
        var payrollitem = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_payroll_item', j);
        log.audit('payrollitem', payrollitem);
        var hours = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_hours', j);
        var amount = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_amount', j);
        var type = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_grade_benefit_type', j);

        var applyTo = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_ben_apply_to', j);
        var percent = gradeRec.getSublistValue('recmachcustrecord_da_grade_benefit', 'custrecord_da_grade_salary_percent', j);
       log.debug(applyTo);
        var create = false;
        if (applyTo.length > 0) {          
            if (Number(applyTo) ==(Number(nationality))) {
                create = true;
            }
        } else {
            create = true;
        }
        //console.log(type + " " + create);
        if (type == 1 && create == true) {
         
           
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
            if (percent > 0) {
                var basicSalary = empRecord.getValue('custentity_da_emp_basic_salary');
                if (basicSalary > 0) {
                  
                    empRecord.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_earnings_employee',
                        fieldId: 'custrecord_da_earnings_amount',
                        value: (basicSalary * (percent / 100)).toFixed(2)
                    });
                }

            } else {
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

    empRecord.save();
}*/
                if (scriptContext.type == "create") {
                    /*var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_da_emp_leave_bal_calc',
                    deploymentId: 'customdeploy_da_emp_leave_bal_calc',
                    params: {'custscript_employee_id_2':scriptContext.newRecord.id}
                }).submit();*/
                  var empId = scriptContext.newRecord.id;
                  var employeeProfileRec = record.create({
                    type:'customrecord_da_employee_profile'
                  });
                  employeeProfileRec.setValue('custrecord_da_emp_prof_name', empId);
                  employeeProfileRec.save();
                }
                var currency = scriptContext.newRecord.getText('currency');
                var basicSalary = scriptContext.newRecord.getValue('custentity_da_emp_basic_salary');
              var housingAllowance = 0;
                var customrecord_da_emp_earningsSearchObj = search.create({
                    type: "customrecord_da_emp_earnings",
                    filters: [
                        ["custrecord_da_earnings_employee", "anyof", scriptContext.newRecord.id],
                        "AND",
                        ["custrecord_da_earnings_payroll_item.custrecord_da_payroll_recurring", "is", "T"],
                        "AND",
                        ["custrecord_da_allowance_incl_in_gross","is","T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_earnings_amount",
                            label: "Amount"
                        }),
                     search.createColumn({
                       name: "custrecord_da_payrol_item_category",
                       join: "CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM",
                       label: "Item Category"
                    })
                    ]
                });
                var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                log.debug("customrecord_da_emp_earningsSearchObj result count", searchResultCount);
                var totalAllowanceAmount = 0;
                customrecord_da_emp_earningsSearchObj.run().each(function(result) {
                    var amount = result.getValue('custrecord_da_earnings_amount');
                  var category = result.getValue({name:'custrecord_da_payrol_item_category',join :'CUSTRECORD_DA_EARNINGS_PAYROLL_ITEM'});
                  if(category == 28){
                     housingAllowance = parseFloat(housingAllowance) + parseFloat(amount);
                  }
                    totalAllowanceAmount = parseFloat(totalAllowanceAmount) + parseFloat(amount);
                    return true;
                });
                var totalSalary = parseFloat(totalAllowanceAmount) + parseFloat(basicSalary);
                log.debug('totalSalary', totalSalary);
                log.debug('words', convertNumberToWords(totalSalary));
              var gosiSalary = parseFloat(basicSalary) + parseFloat(housingAllowance);
              
              if(gosiSalary > 45000){
                gosiSalary = 45000;
              }
              
              var companyGosiPercent =  scriptContext.newRecord.getValue('custentity_da_company_gosi');
              var empGosiPercent =  scriptContext.newRecord.getValue('custentity_da_employee_gosi');
              var companyGosiValue = (companyGosiPercent/100) * gosiSalary;
              log.debug('empGosiPercent', empGosiPercent);
              var empGosiValue = (empGosiPercent/100) * gosiSalary;
               var customrecord_da_emp_earningsSearchObj = search.create({
                   type: "customrecord_da_emp_earnings",
                   filters:
                   [
                      ["custrecord_da_earnings_type","anyof","2"], 
                      "AND", 
                      ["custrecord_da_earnings_employee","anyof",scriptContext.newRecord.id]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_earnings_employee", label: "Employee"}),
                      search.createColumn({name: "custrecord_da_earnings_type", label: "Type"}),
                      search.createColumn({name: "custrecord_da_earnings_hours", label: "Hours"}),
                      search.createColumn({name: "custrecord_da_earnings_amount", label: "Amount"})
                   ]
                });
                var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                log.debug("customrecord_da_emp_earningsSearchObj result count",searchResultCount);
                          var basicAmount = 0;
                customrecord_da_emp_earningsSearchObj.run().each(function(result){
                   // .run().each has a limit of 4,000 results
                   var amount = result.getValue('custrecord_da_earnings_amount');
                  basicAmount = parseFloat(basicAmount) + parseFloat(amount);
                   return true;
                });
              
              if(gosiSalary > 45000){
                gosiSalary = 45000;
              }
          
          var basicSalary = scriptContext.newRecord.getValue('custentity_da_emp_basic_salary');
          var totalBasic = parseFloat(basicSalary) + parseFloat(basicAmount);
                record.load({
                    type: 'employee',
                    id: scriptContext.newRecord.id
                }).setValue('custentity_emp_total_allow_amount', totalAllowanceAmount).setValue('custentity_da_total_basic_salalry',totalBasic).setValue('custentity_da_salary_in_english', convertNumberToWords(totalSalary) +" "+currency+" Only").setValue('custentity_da_emp_com_gosi_value',companyGosiValue.toFixed(2)).setValue('custentity_da_emp_gosi_value',empGosiValue.toFixed(2)).setValue('custentity_da_gosi_total_amount',gosiSalary.toFixed(2)).save();
                //scriptContext.newRecord.setValue('custentity_emp_total_allow_amount_2',totalAllowanceAmount);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function convertNumberToWords(s) {
            var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
            var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            s = s.toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s)) return 'not a number';
            var x = s.indexOf('.');
            if (x == -1)
                x = s.length;
            if (x > 15)
                return 'too big';
            var n = s.split('');
            var str = '';
            var sk = 0;
            for (var i = 0; i < x; i++) {
                if ((x - i) % 3 == 2) {
                    if (n[i] == '1') {
                        str += tn[Number(n[i + 1])] + ' ';
                        i++;
                        sk = 1;
                    } else if (n[i] != 0) {
                        str += tw[n[i] - 2] + ' ';
                        sk = 1;
                    }
                } else if (n[i] != 0) { // 0235
                    str += dg[n[i]] + ' ';
                    if ((x - i) % 3 == 0) str += 'hundred ';
                    sk = 1;
                }
                if ((x - i) % 3 == 1) {
                    if (sk)
                        str += th[(x - i - 1) / 3] + ' ';
                    sk = 0;
                }
            }
            if (x != s.length) {
                var y = s.length;
                str += 'point ';
                for (var i = x + 1; i < y; i++)
                    str += dg[n[i]] + ' ';
            }
            return str.replace(/\s+/g, ' ');
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });