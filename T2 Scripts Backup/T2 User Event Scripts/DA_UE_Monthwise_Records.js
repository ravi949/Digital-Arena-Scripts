function afterSubmit() {
  try{
    nlapiLogExecution("DEBUG", "isalreadyCreatedMonthLeaves", nlapiGetContext().getExecutionContext());
    var contexttype = nlapiGetContext().getExecutionContext();
    if (contexttype == "userinterface") {
        var recid = nlapiGetRecordId();
        var rec = nlapiLoadRecord("customrecord_da_leaves", recid);
        var linecount = rec.getLineItemCount('recmachcustrecord_da_leave_record');
        if (linecount > 0) {
          
          for(var m= (rec.getLineItemCount('recmachcustrecord_da_leave_record')); m > 0; m--){
              rec.removeLineItem('recmachcustrecord_da_leave_record',m);
          }
          
        }

        nlapiLogExecution("DEBUG", "xxxxxxxxxxxxxx");
        var starDate = rec.getFieldValue("custrecord_da_leave_start_date");
        
        var leaveType = rec.getFieldValue("custrecord_da_leave_type");

        var endDate = rec.getFieldValue("custrecord_da_leave_end_date");
        var employee = rec.getFieldValue("custrecord_da_leave_employee");
        var leavesmain = rec.getFieldValue("custrecord_da_leave_days");
        var splitStartDate = starDate.split("/");
        var splitEndDate = endDate.split("/");
        var monthdate = splitStartDate[0] + "/" + splitStartDate[1] + "/" + splitStartDate[2];
        var monthscheck = splitStartDate[1] + "/" + splitStartDate[0] + "/" + splitStartDate[2];
        monthscheck = new Date(monthscheck);
        var monthscheckorg = new Date(monthscheck.getFullYear(), monthscheck.getMonth() + 1, 0);
        var monthenddatel = splitEndDate[1] + '/' + splitEndDate[0] + '/' + splitEndDate[2];
        var endDatecheck = new Date(monthenddatel);


        if (splitStartDate[1] != splitEndDate[1]) {

            /*.............*/
            function pad(num) {
                return String("0" + num).slice(-2);
            }

            function formatDate(d) {
                return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
            }
            var aDay = 24 * 60 * 60 * 1000,
                range = { // your range
                    start: new Date(splitStartDate[2], Number(splitStartDate[1]) - 1, splitStartDate[0]), // remember month is 0 based
                    end: new Date(splitEndDate[2], Number(splitEndDate[1]) - 1, splitEndDate[0])
                },
                ranges = [];


            for (var i = range.start.getTime(), end = range.end.getTime(); i <= end;) {
                var first = new Date(i),

                    last = new Date(first.getFullYear(), first.getMonth() + 1, 0);

                ranges.push({
                    start: formatDate(first),
                    end: formatDate(last)
                })
                i = last.getTime() + aDay;
                // if (!confirm(formatDate(new Date(i)))) break
            }

            for (c = 0; c < ranges.length; c++) {
                var monthstartdate = ranges[c].start;
                var monthenddate = ranges[c].end;
                var resstart1 = monthstartdate.split("-");
                var resmonth1 = resstart1[1];
                var resday1 = resstart1[2];
                var resyear1 = resstart1[0];
                var startdayfull1 = resmonth1 + '/' + resday1 + '/' + resyear1;
                nlapiLogExecution("DEBUG", "resday1", resday1);

                var startdayfullset = resday1 + '/' + resmonth1 + '/' + resyear1;
                var day = '01';
                var startdayfullmonth = day + '/' + resmonth1 + '/' + resyear1;
                var startdayfullmonthcheck = resmonth1 + '/' + day + '/' + resyear1;
                startdayfullmonthcheck = new Date(startdayfullmonthcheck);
                var lastdayfullmonthcheck = new Date(startdayfullmonthcheck.getFullYear(), startdayfullmonthcheck.getMonth() + 1, 0);
                nlapiLogExecution("DEBUG",'lastdayfullmonthcheck',lastdayfullmonthcheck);
                var resstart2 = monthenddate.split("-");
                var resmonth2 = resstart2[1];
                var resday2 = resstart2[2];
                var resyear2 = resstart2[0];
                var startdayfull2 = resmonth2 + '/' + resday2 + '/' + resyear2;
                var startdayfullset2 = resday2 + '/' + resmonth2 + '/' + resyear2;
                var lastdayfullmonthorg = new Date(startdayfull2);

                var startDate1 = new Date(startdayfull1); //YYYY-MM-DD
                var endDate1 = new Date(startdayfull2); //YYYY-MM-DD
                var endDate2 = new Date(monthenddatel);

                var getDateArray = function(start, end) {
                    var arr = new Array();
                    var dt = new Date(start);
                    while (dt <= end) {
                        arr.push((new Date(dt)).toString().substring(0, 15)); //save only the Day MMM DD YYYY part
                        dt.setDate(dt.getDate() + 1);
                    }
                    return arr;
                }


                var prepareDateArray = function(dtArr) {
                    var arr = new Array();
                    for (var i = 0; i < dtArr.length; i++) {
                        arr.push((new Date(dtArr[i])).toString().substring(0, 15)); //save only the Day MMM DD YYYY part
                    }
                    return arr;
                }


                var getWorkingDateArray = function(dates, hoildayDates, workingWeekendDates) {

                    var arr = dates.filter(function(dt) {
                        return holidaysArray.indexOf(dt) < 0;
                    });

                    var result = arr.filter(function(dt) {
                        if (dt.indexOf("Fri") > -1 || dt.indexOf("Sat") > -1) {
                            if (workingWeekendDates.indexOf(dt) > -1) {
                                return dt;
                            }
                        } else {
                            return dt;
                        }
                    });

                    return result;

                }
                var holidaysArray = [];
                var workingWeekends = [];

                if (ranges.length == (c + 1)) {
                    var dateArray = getDateArray(startDate1, endDate2);

                } else {
                    var dateArray = getDateArray(startDate1, endDate1);
                }

                var arrSearchColumn = new Array();
                arrSearchColumn[0] = new nlobjSearchColumn('custrecord_da_holiday_start_date');
                arrSearchColumn[1] = new nlobjSearchColumn('custrecord_da_holiday_end_date');

                var searchResult = nlapiSearchRecord('customrecord_da_holidays', null, null, arrSearchColumn);
                if (searchResult.length > 0) {
                    var dates = [];
                    for (i = 0; i < searchResult.length; i++) {
                        // Returns an array of dates between the two dates
                        var getDates = function(holidaystartDate, holidayendDate) {

                            currentDate = holidaystartDate,
                                addDays = function(days) {
                                    var date = new Date(this.valueOf());
                                    date.setDate(date.getDate() + days);
                                    return date;
                                };
                            while (currentDate <= holidayendDate) {
                                dates.push(currentDate);
                                currentDate = addDays.call(currentDate, 1);
                            }
                            return dates;
                        };

                        // Usage
                        var actualholidaystartdate = searchResult[i].getValue('custrecord_da_holiday_start_date');
                        var resstart = actualholidaystartdate.split("/");
                        var startmonth = resstart[1];
                        var startday = resstart[0];
                        var startyear = resstart[2];
                        var actualholidayenddate = searchResult[i].getValue('custrecord_da_holiday_end_date');
                        var resend = actualholidayenddate.split("/");
                        var resmonth = resend[1];
                        var resday = resend[0];
                        var resyear = resend[2];
                        var startdayfull = startmonth + '/' + startday + '/' + startyear;
                        var enddayfull = resmonth + '/' + resday + '/' + resyear;
                        var dates = getDates(new Date(startdayfull), new Date(enddayfull));
                        var holidaysArray = dates;
                    }
                } else {
                    var holidaysArray = [];
                }
                var holidaysArray = prepareDateArray(holidaysArray);

                var workingWeekendsArray = prepareDateArray(workingWeekends);
                
                
                
                if(leaveType == 8 || leaveType == 9){ //unpaid or sick leave
                	workingWeekendsArray = [];
                }

                var workingDateArray = getWorkingDateArray(dateArray, holidaysArray, workingWeekendsArray);

                var totalleaves = workingDateArray.length;
                var customrecord_da_month_wise_leaveSearch = nlapiSearchRecord("customrecord_da_month_wise_leave", null,
                    [
                        ["custrecord_da_leave_record", "anyof", recid],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                    [
                        new nlobjSearchColumn("id").setSort(false)
                    ]
                );
                var isalreadyCreatedMonthLeaves = true;
                nlapiLogExecution("DEBUG", "isalreadyCreatedMonthLeaves", isalreadyCreatedMonthLeaves+" cv"+customrecord_da_month_wise_leaveSearch);                
                nlapiLogExecution("DEBUG", "isalreadyCreatedMonthLeaves1", isalreadyCreatedMonthLeaves);
                if (isalreadyCreatedMonthLeaves) {
                    nlapiLogExecution("DEBUG", "sfsdf", "dgndf");
                    rec.selectNewLineItem('recmachcustrecord_da_leave_record');
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month', startdayfullmonth);
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_start_date', startdayfullset);
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_employee', employee);
                    if (ranges.length == (c + 1)) {
                        rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_end_date', endDate);
                        if (lastdayfullmonthcheck - endDatecheck === 0) {
                           
                            if(leaveType == 8 || leaveType == 9){ //unpaid or sick leave
                            	 rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', totalleaves);
                            }else{
                            	 rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', 22);
                            }
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'T');

                        } else {
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', totalleaves);
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'F');
                        }
                    } else {


                        rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_end_date', startdayfullset2);
                        if (lastdayfullmonthcheck - lastdayfullmonthorg === 0 && (resday1 == "01" || resday1 == 01 || resday1 == "1" || resday1 == 1)) {

                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', 22);
                            
                            if(leaveType == 8 || leaveType == 9){ //unpaid or sick leave
                           	 rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', totalleaves);
                           }
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'T');

                        } else {
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', totalleaves);
                            rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'F');
                        }

                    }


                    //   rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record','custrecord_da_month_leave_days',totalleaves);
                    //rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record','custrecord_da_full_month','T');

                    rec.commitLineItem('recmachcustrecord_da_leave_record');
                }



            }
        } else {
            var customrecord_da_month_wise_leaveSearch = nlapiSearchRecord("customrecord_da_month_wise_leave", null,
                [
                    ["custrecord_da_leave_record", "anyof", recid],
                    "AND",
                    ["isinactive", "is", "F"]
                ],
                [
                    new nlobjSearchColumn("id").setSort(false)
                ]
            );
            var isalreadyCreatedMonthLeaves = true;
            nlapiLogExecution("DEBUG", "isalreadyCreatedMonthLeaves", customrecord_da_month_wise_leaveSearch);            
            nlapiLogExecution("DEBUG", "isalreadyCreatedMonthLeaves1", isalreadyCreatedMonthLeaves);
            if (isalreadyCreatedMonthLeaves) {
                nlapiLogExecution("DEBUG", "bfhgf");
                rec.selectNewLineItem('recmachcustrecord_da_leave_record');
                rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month', monthdate);
                rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_start_date', starDate);
                rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_end_date', endDate);
                rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_employee', employee);
                if (monthscheckorg - endDatecheck === 0 && (splitStartDate[0] == "1" || splitStartDate[0] == "01" || splitStartDate[0] == 1 || splitStartDate[0] == 01)) {



                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', 22);
                    
                    if(leaveType == 8 || leaveType == 9){ //unpaid or sick leave
                   	 rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', leavesmain);
                   }
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'T');
                } else {
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_month_leave_days', leavesmain);
                    rec.setCurrentLineItemValue('recmachcustrecord_da_leave_record', 'custrecord_da_full_month', 'F');
                }
                rec.commitLineItem('recmachcustrecord_da_leave_record');
            }

        }
        nlapiSubmitRecord(rec, true);
    }
  }catch(ex){
    nlapiLogExecution("ERROR", ex.name,ex.message);
  }

}