/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format'],

        function(search, record, runtime, format) {

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        try {

            var scriptObjPeriod = runtime.getCurrentScript();
                var postingPeriod = scriptObjPeriod.getParameter({
                    name: 'custscript_da_leaves_posting_period'
                });
                log.debug('postingPeriod', postingPeriod);
                var customrecord_leaves_accural_reportSearchObj = search.create({
                    type: "customrecord_leaves_accural_report",
                    filters: [
                        'custrecord_da_leave_accruals_month', 'anyof', postingPeriod
                    ]
                });
                var searchCount = customrecord_leaves_accural_reportSearchObj.runPaged().count;
                log.debug("customrecord_leaves_accural_reportSearchObj count", searchCount);
                customrecord_leaves_accural_reportSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_leaves_accural_report',
                        id: result.id
                    })
                    return true;
                });

            return search.create({
                type: "customrecord_emp_leave_balance",
                filters:
                    [
                      ["custrecord_employee_id.employeetype","noneof","1"],"AND",
 ["custrecord_employee_id.isinactive","is","F"],
                        "AND", 
                        ["custrecord_employee_id.custentity_da_emp_include_in_payroll","is","T"],"AND",[["custrecord_employee_id.releasedate","notbefore","monthbeforelast"],"OR",["custrecord_employee_id.releasedate","isempty",""]]
                       
                        ],
                        columns:
                            [
                                search.createColumn({name: "custrecord_employee_id", label: "Employee"}),
                                search.createColumn({name: "custrecord_emp_leave_balance", label: "Leave Balance"})
                                ]
            });
        } catch (ex) {
            log.error(ex.name, 'getInputData state, message = ' + ex.message);
        }

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        try {
            var searchResult = JSON.parse(context.value);
            var values = searchResult.values.custrecord_employee_id.value;
            log.debug('values',values);
            var empId = searchResult.values.custrecord_employee_id.value;
            var leaveBalance = searchResult.values.custrecord_emp_leave_balance;

            context.write({
                key:empId,
                value:leaveBalance
            })
        } catch (ex) {
            log.error(ex.name, ex.message);
        }

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
        try {
            var empId = JSON.parse(context.key);
            var leaveBalance = 0;



            var empRecord = record.load({
                type:'employee',
                id:empId
            });
          
           var worksForsubsidairy = empRecord.getValue('custentity_da_work_for_subsidiary');
          
          var mainSubsidiary = empRecord.getValue('subsidiary');

            var basicSalary = empRecord.getValue('custentity_da_emp_basic_salary');
          
          var gradeId = empRecord.getValue('custentity_da_employee_grade');

            if(basicSalary > 0 ){



                var hireDate = empRecord.getValue('hiredate');

                var earningsAmount = empRecord.getValue('custentity_emp_total_allow_amount');

                basicSalary = parseFloat(basicSalary) + parseFloat(earningsAmount);

                var terminationDate = empRecord.getValue('releasedate');

                var scriptObjDate = runtime.getCurrentScript();
                var dateObj = scriptObjDate.getParameter({
                    name: 'custscript_da_leave_accruals_date'
                });
                log.debug('dateObj', dateObj);
                var parsedDate = format.parse({
                    value: dateObj,
                    type: format.Type.DATE
                });
                log.debug('parsedDate',parsedDate);
                var today = parsedDate;
                today.setHours(0,0,0,0);

                var yesterday = new Date(today);
                log.debug('yesterday',yesterday);

                yesterday.setDate(yesterday.getDate() - 1);
                var yMonth = yesterday.getMonth()+1;
              
                if(terminationDate){
                   log.debug('yMonth',yMonth);
                  var tmonth = (new Date(terminationDate)).getMonth()+1;
                   log.debug('tmonth',tmonth);
                  if(yMonth == tmonth){
                    yesterday = new Date(terminationDate);
                  }
                }

                //log.debug('yesterday',yesterday);


                var yDate = yesterday.getDate();
                var yMonth = yesterday.getMonth()+1;
                var yYear = yesterday.getFullYear();
                log.debug("Hiredate", hireDate);

                //log.debug("Check", hireDate < new Date(yMonth+"/01"+"/"+yYear));

                //var previousMonthEndDate = "31/01/2019";

                //getting leave entitlement value

                var leaveEntitlementValue = 0;
                var customrecord_da_emp_leaves_entitlementSearchObj = search.create({
                    type: "customrecord_da_emp_leaves_entitlement",
                    filters:
                        [["custrecord_da_leave_entitlement_employee","anyof",empId]
                            ],
                            columns:
                                [
                                    search.createColumn({name: "custrecord_da_leave_entitlement_sdate", label: "Date From"}),
                                    search.createColumn({name: "custrecord_da_leave_entitlement_edate", label: "Date To"}),
                                    search.createColumn({name: "custrecord_da_leave_entitlement_value", label: "Entitlement"})
                                    ]
                });
                var searchResultCount = customrecord_da_emp_leaves_entitlementSearchObj.runPaged().count;
                //log.debug("customrecord_da_emp_leaves_entitlementSearchObj result count",searchResultCount);

                if(searchResultCount > 0){


                    customrecord_da_emp_leaves_entitlementSearchObj.run().each(function(result){
                        var endDate = (result.getValue('custrecord_da_leave_entitlement_edate'));
                        var startDate = (result.getValue('custrecord_da_leave_entitlement_sdate'));
                        //log.debug('st date',startDate + " " +new Date(startDate) + " "+ yesterday);
                        //log.debug('startDate',new Date(startDate) < yesterday);
                        //
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
                        return true;
                    });

                    //log.debug("leaveEntitlementValue",leaveEntitlementValue);

                    var previousMonthEndDate = getLastDateOFPrevMonth(yesterday);

                    //log.debug("previousMonthEndDate",previousMonthEndDate);

                    var totalWorkingDays = 0;
                    //log.debug("date",new Date(yMonth+"/01"+"/"+yYear) +"  "+ yesterday);

                    if(hireDate < new Date(yMonth+"/01"+"/"+yYear)){

                        //log.debug("hiredate lessthan");

                        var workingDays = calculateNoOfDays(new Date(yMonth+"/01"+"/"+yYear),yesterday);

                        //log.debug("workingDays",workingDays);

                        var fridays = calculateNoOfFridays(new Date(yMonth+"/01"+"/"+yYear),yesterday);

                        totalWorkingDays = parseFloat(workingDays) - parseFloat(0);
                    }else{
                        //log.debug("hiredate greaterthan");
                        var workingDays = calculateNoOfDays(hireDate,yesterday);

                        var fridays = calculateNoOfFridays(hireDate,yesterday);

                        totalWorkingDays = parseFloat(workingDays) - parseFloat(0);
                    }


                    var month_end_date = new Date(today);

                    month_end_date.setDate(month_end_date.getDate() - 1);
                    var NoOFDaysinMonth = calculateNoOfDays(new Date(yMonth+"/01"+"/"+yYear),month_end_date);

                    NoOFDaysinMonth = parseFloat(NoOFDaysinMonth) + parseFloat(1);


                    totalWorkingDays = parseFloat(totalWorkingDays) +parseFloat(1);
                    //log.debug("totalWorkingDays",totalWorkingDays);


                    var customrecord_leaves_accural_reportSearchObj = search.create({
                        type: "customrecord_leaves_accural_report",
                        filters:
                            [
                                ["custrecord_da_leave_accruals_employee","anyof",empId]
                                ],
                                columns:
                                    [
                                        search.createColumn({name: "custrecord_da_leave_acc_ending_balance", label: "Ending Balance(Days)"}),
                                        search.createColumn({
                                            name: "internalid",
                                            sort: search.Sort.DESC,
                                            label: "Internal ID"
                                        })
                                        ]
                    });

                    var searchResultCount = customrecord_leaves_accural_reportSearchObj.runPaged().count;
                    log.debug("customrecord_leaves_accural_reportSearchObj result count",searchResultCount);


                    if(searchResultCount > 0){
                        customrecord_leaves_accural_reportSearchObj = customrecord_leaves_accural_reportSearchObj.run().getRange(0,1);
                        leaveBalance = customrecord_leaves_accural_reportSearchObj[0].getValue('custrecord_da_leave_acc_ending_balance');
                    }else{
                        log.debug("Date",previousMonthEndDate.getDate()+"/"+(previousMonthEndDate.getMonth()+1)+"/"+previousMonthEndDate.getFullYear());
                        var customrecord_da_leave_balance_at_mon_endSearchObj = search.create({
                            type: "customrecord_da_leave_balance_at_mon_end",
                            filters:
                                [
                                    ["custrecord_da_leave_end_employee","anyof",empId], 
                                    "AND", 
                                    ["custrecord_da_end_leave_bal_date","on",(previousMonthEndDate.getDate())+"/"+(previousMonthEndDate.getMonth()+1)+"/"+previousMonthEndDate.getFullYear()]
                                    ],
                                    columns:
                                        [
                                            search.createColumn({
                                                name: "scriptid",
                                                sort: search.Sort.ASC,
                                                label: "Script ID"
                                            }),
                                            search.createColumn({name: "custrecord_da_end_leave_bal_date", label: "Date"}),
                                            search.createColumn({name: "custrecord_da_leave_balance_of_date", label: "Leave Balance"}),
                                            search.createColumn({name: "custrecord_da_leave_end_employee", label: "Employee"})
                                            ]
                        });
                        var searchResultCount = customrecord_da_leave_balance_at_mon_endSearchObj.runPaged().count;
                        log.debug("customrecord_da_leave_balance_at_mon_endSearchObj result count",searchResultCount);
                        customrecord_da_leave_balance_at_mon_endSearchObj.run().each(function(result){
                            var balance = result.getValue('custrecord_da_leave_balance_of_date');
                            leaveBalance = parseFloat(leaveBalance) + parseFloat(balance);
                            return true;
                        });
                       // leaveBalance = empRecord.getValue('custentity_da_leave_opening_balance');
                        //leaveBalance = (leaveBalance)? leaveBalance: 0;
                    }


                    var totalUnpaidLeave_Days_This_month = 0;
                    

                    //log.debug("details",leaveEntitlementValue +" "+NoOFDaysinMonth +" "+ totalWorkingDays +" "+ totalUnpaidLeave_Days_This_month );

                    var addingDays = ((leaveEntitlementValue /12)/NoOFDaysinMonth) * (parseFloat(totalWorkingDays) - parseFloat(totalUnpaidLeave_Days_This_month));


                    var customrecord_da_monthly_leavesSearchObj = search.create({
                        type: "customrecord_da_monthly_leaves",
                        filters:
                            [
                                ["custrecord_da_emp_month_leave","anyof",empId], 
                                "AND", 
                                ["custrecord_da_emp_leaves.custrecord_da_emp_leavetype","anyof","1"], 
                                "AND", 
                                ["custrecord_da_leave_actual_start_date","on","01/"+yMonth+"/"+yYear], 
                                "AND", 
                                ["custrecord_da_emp_leaves.custrecord_da_leave_approvalstatus","anyof","2","24"]
                                ],
                                columns:
                                    [
                                        search.createColumn({name: "custrecord_da_lmonth_leavedays", label: "Leave Days"})
                                        ]
                    });
                    var searchResultCount = customrecord_da_monthly_leavesSearchObj.runPaged().count;
                    //log.debug("customrecord_da_monthly_leavesSearchObj result count",searchResultCount);

                    var totalannual_Days_This_month = 0;
                    customrecord_da_monthly_leavesSearchObj.run().each(function(result){
                        var leaveDays = result.getValue('custrecord_da_lmonth_leavedays');
                        totalannual_Days_This_month = parseFloat(totalannual_Days_This_month) + parseFloat(leaveDays);
                        return true;
                    });




                    var dailyRate = (basicSalary/30);

                    var leaveAmount = (leaveBalance* dailyRate);

                    var paidDays = totalannual_Days_This_month;

                    var additionalAmount = addingDays * dailyRate;

                    var paidAmount = paidDays * dailyRate;

                    var endingBalance = (parseFloat(leaveBalance) + parseFloat(addingDays)) -parseFloat(paidDays); 

                    var endingAmount = endingBalance * dailyRate;





                    var month = parsedDate.getMonth();
                    log.debug('month',month);
                    var monthsobj = {
                            '1': 'Jan',
                            '2': 'Feb',
                            '3': 'Mar',
                            '4': 'Apr',
                            '5': 'May',
                            '6': 'Jun',
                            '7': 'Jul',
                            '8': 'Aug',
                            '9': 'Sep',
                            '10': 'Oct',
                            '11': 'Nov',
                            '12': 'Dec'
                    }
                    var postingperiodMonth = monthsobj[month];
                    //log.debug(month, postingperiodMonth);
                    var year = parsedDate.getFullYear();
                    log.debug('year',year);

                    if(month == 0 || month == "0"){
                        year = year - 1;
                        postingperiodMonth ="Dec";
                    }

                    log.debug('postingperiodMonth',postingperiodMonth +" "+year);

                    var accountingperiodSearchObj = search.create({
                        type: "accountingperiod",
                        filters:
                            [
                                ["periodname","startswith",postingperiodMonth +" "+year]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "periodname",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        })
                                        ]
                    });
                    var searchResultCount = accountingperiodSearchObj.runPaged().count;
                    //log.debug("accountingperiodSearchObj result count",searchResultCount);

                    var postingPeriodId ;
                    accountingperiodSearchObj.run().each(function(result){
                        postingPeriodId = result.id;
                        return true;
                    });
                    log.debug('postingPeriodId',postingPeriodId);




                    var leaveAccuralReportRec =record.create({
                        type:'customrecord_leaves_accural_report'                   
                    });
                    leaveAccuralReportRec.setValue('custrecord_da_leave_accruals_employee',empId);
                  
                  if(worksForsubsidairy){
                    leaveAccuralReportRec.setValue('custrecord_da_emp_leave_acc_subsidairy',worksForsubsidairy);
                  }else{
                    leaveAccuralReportRec.setValue('custrecord_da_emp_leave_acc_subsidairy',mainSubsidiary);
                  }
                    leaveAccuralReportRec.setValue('custrecord_da_leave_balance_per_this_mon',Number(leaveBalance).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_additional_days',Number(addingDays).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_paid_days',Number(paidDays).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_ending_balance',Number(endingBalance).toFixed(3));
                    // leaveAccuralReportRec.setValue('custrecord_total_working_days',Number(totalWorkingDays).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_emp_leave_accrual_amount',Number(leaveAmount).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_additional_amoun',Number(additionalAmount).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_paid_amount',Number(paidAmount).toFixed(3));
                    leaveAccuralReportRec.setValue('custrecord_da_leave_acc_ending_amount',Number(endingAmount).toFixed(3));

                    if(postingPeriodId){
                        leaveAccuralReportRec.setValue('custrecord_da_leave_accruals_month',postingPeriodId);
                    }
                    leaveAccuralReportRec.save();   
                }

            }

        } catch (ex) {
            log.error(ex.name, ex.message);
        }
    }


    function calculateNoOfDays(date2,date1){
        var res = Math.abs(date1 - date2) / 1000;
        var days = Math.floor(res / 86400);
        return days;
    }

    function getLastDateOFPrevMonth(endDate){

        var d=new Date(endDate); 
        d.setDate(1); 
        d.setHours(-20);

        return d;
    };

    function calculateNoOfFridays(startDate,endDate){
        //var startDate = new Date("11/01/2019");
        //var endDate = new Date("11/22/2019");
        var totalFridays = 0;

        for (var i = startDate; i <= endDate; ){
            if (i.getDay() == 5){
                totalFridays++;
            }
            i.setTime(i.getTime() + 1000*60*60*24);
        }

        return totalFridays;
    }



    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
        try {
            var scriptObj = runtime.getCurrentScript();
                var recordId = scriptObj.getParameter({
                    name: 'custscript_da_leaves_report_rec_id'
                });
                log.debug('recordId', recordId);
                var processRec = record.submitFields({
                    type: 'customrecord_da_leave_report_post_date',
                    id: recordId,
                    values: {
                        'custrecord_da_generate_reports': false
                    }
                });
                log.debug('process completed');
        } catch (ex) {
            log.error(ex.name, ex.message);
        }
    }

    function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});