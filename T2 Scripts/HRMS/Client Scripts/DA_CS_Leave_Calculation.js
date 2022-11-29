/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/format', 'N/url', 'N/https'],
    function(search, record, format, url, https) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode, subsidiaryExists = false,
            generalSettingsRecId = 1;

        function pageInit(scriptContext) {
            var url_string = window.location.href;
            console.log(scriptContext.currentRecord);
            var url1 = new URL(url_string);
            //var jobOrderId = url1.searchParams.get("joborderid");
            var startdate = url1.searchParams.get("st");
            var enddate = url1.searchParams.get("ed");
            var empId = url1.searchParams.get("empId");
            console.log('startdate' + startdate);
            if (startdate && enddate) {
                console.log("setting");
                scriptContext.currentRecord.setText('custrecord_da_leave_start_date', startdate);
                scriptContext.currentRecord.setText('custrecord_da_leave_end_date', enddate);
                scriptContext.currentRecord.setValue('custrecord_da_leave_employee', empId);
                scriptContext.currentRecord.setValue('custrecord_da_extra_leave', true);
            }
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
                var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_empsubsidiary');
                var customrecord_da_general_settingsSearchObj = search.create({
                    type: "customrecord_da_general_settings",
                    filters: [
                        ["custrecord_da_settings_subsidiary", "anyof", subsidairyId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_non_working_days",
                            label: "Non Working Days (In a Week)"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
                log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
                customrecord_da_general_settingsSearchObj.run().each(function(result) {
                    generalSettingsRecId = result.id;
                });
            }
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
                if (scriptContext.fieldId == 'custrecord_da_leave_empsubsidiary') {
                    var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_empsubsidiary');
                    if (subsidiaryExists) {
                        var customrecord_da_general_settingsSearchObj = search.create({
                            type: "customrecord_da_general_settings",
                            filters: [
                                ["custrecord_da_settings_subsidiary", "anyof", subsidairyId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_non_working_days",
                                    label: "Non Working Days (In a Week)"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
                        log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
                        customrecord_da_general_settingsSearchObj.run().each(function(result) {
                            generalSettingsRecId = result.id;
                        });
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_leave_type') {
                    var leaveType = scriptContext.currentRecord.getValue('custrecord_da_leave_type');
                    var employee = scriptContext.currentRecord.getValue('custrecord_da_leave_employee');
                    if (leaveType == 8) {
                      
                     var customrecord_da_employee_sick_leave_balaSearchObj = search.create({
                           type: "customrecord_da_employee_sick_leave_bala",
                           filters:
                           [
                              ["custrecord_da_sick_bal_employee","anyof",employee]
                           ],
                           columns:
                           [
                              search.createColumn({
                                 name: "scriptid",
                                 sort: search.Sort.ASC,
                                 label: "Script ID"
                              }),
                              search.createColumn({name: "custrecord_da_sick_bal_employee", label: "Employee"}),
                              search.createColumn({name: "custrecord_da_emp_sick_leave_balance", label: "Balance"})
                           ]
                        });
                        var searchResultCount = customrecord_da_employee_sick_leave_balaSearchObj.runPaged().count;
                        log.debug("customrecord_da_employee_sick_leave_balaSearchObj result count",searchResultCount);
                      var remainingSickLeaves = 0;
                        customrecord_da_employee_sick_leave_balaSearchObj.run().each(function(result){
                           // .run().each has a limit of 4,000 results
                           remainingSickLeaves = result.getValue('custrecord_da_emp_sick_leave_balance');
                           return true;
                        });
                        scriptContext.currentRecord.setValue('custrecord_da_sick_leave_balance', remainingSickLeaves);
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_leave_start_date') {
                    var oneDay = 24 * 60 * 60 * 1000;
                    var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_start_date');
                    if (startDate) {
                        var leaveType = scriptContext.currentRecord.getValue('custrecord_da_leave_type');
                        var startDay = startDate.getDate();
                        var startmonth = (startDate.getMonth()) + 1;
                        var startYear = startDate.getFullYear();
                        startDate = new Date(startmonth + "/" + startDay + "/" + startYear);
                        console.log(startDate);
                        var hiredate = scriptContext.currentRecord.getValue('custrecord_employee_hire_date');
                        console.log(hiredate);
                        var diffDays = Math.round(Math.abs((startDate.getTime() - hiredate.getTime()) / (oneDay)));
                        console.log(diffDays);
                        if (leaveType == 1 && diffDays < 182) {
                            alert("Sorry, you are not allowed to apply annual leave before 6 months . Please choose unpaid Leave");
                            scriptContext.currentRecord.setValue('custrecord_da_leave_start_date', '');
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_leave_end_date') {
                    var endDate = scriptContext.currentRecord.getValue('custrecord_da_leave_end_date');
                    var startDate = scriptContext.currentRecord.getValue('custrecord_da_leave_start_date');
                    var leaveType = scriptContext.currentRecord.getValue('custrecord_da_leave_type');
                    var endDay = endDate.getDate();
                    var emonth = (endDate.getMonth()) + 1;
                    var eYear = endDate.getFullYear();
                    var startDay = startDate.getDate();
                    var startmonth = (startDate.getMonth()) + 1;
                    var startYear = startDate.getFullYear();
                    console.log(endDay + "sfd" + emonth + "fdsf" + eYear);
                    if (startDate && endDate) {
                        var noOfWorkingDays = calculateNoOfDays(endDate, startDate);
                        console.log(noOfWorkingDays);
                        noOfWorkingDays = parseFloat(noOfWorkingDays) + 1;
                        var noOfFridays = calculateNoOfFridays(startDate, endDate);
                        console.log(noOfFridays);
                        var leaveCalculationBasedOn = search.lookupFields({
                            type: 'customrecord_da_general_settings',
                            id: generalSettingsRecId,
                            columns: ['custrecord_leave_calculation_based_on']
                        });
                        console.log(leaveCalculationBasedOn.custrecord_leave_calculation_based_on[0].value);
                        var leaveCalculationBasedOnType = leaveCalculationBasedOn.custrecord_leave_calculation_based_on[0].value;
                        if (leaveCalculationBasedOnType == 1) {
                            noOfFridays = 0;
                        }
                        if (leaveType == 8 || leaveType == 9) { //sick or unpaid
                            noOfFridays = 0;
                        }
                        var LeaveDays = parseFloat(noOfWorkingDays) - parseFloat(noOfFridays);
                        var customrecord_da_holiday_datesSearchObj = search.create({
                            type: "customrecord_da_holiday_dates",
                            filters: [
                                ["custrecord_holiday_date", "within", startDay + "/" + startmonth + "/" + startYear, endDay + "/" + emonth + "/" + eYear]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "scriptid",
                                    sort: search.Sort.ASC,
                                    label: "Script ID"
                                }),
                                search.createColumn({
                                    name: "custrecord_holiday_date",
                                    label: "Date"
                                })
                            ]
                        });
                        var NoOfholidays = customrecord_da_holiday_datesSearchObj.runPaged().count;
                        log.debug("customrecord_da_holiday_datesSearchObj result count", NoOfholidays);
                        var totalLeaveDays = parseFloat(LeaveDays) - parseFloat(NoOfholidays);
                        scriptContext.currentRecord.setValue('custrecord_da_leave_days', totalLeaveDays);
                    } else {
                        alert("Please select start Date first");
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_att_details_hours') {}
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        function calculateNoOfDays(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days;
        }

        function calculateNoOfFridays(startDate, endDate) {
            //var startDate = new Date("11/01/2019");
            //var endDate = new Date("11/22/2019");
            var totalFridays = 0;
            for (var i = (startDate); i <= (endDate);) {
                if (i.getDay() == 5 || i.getDay() == 6) {
                    totalFridays++;
                }
                i.setTime(i.getTime() + 1000 * 60 * 60 * 24);
            }
            return totalFridays;
        }

        function createNewLeave(std, ed, recid, empId, currentRecId, leaveType) {
            console.log('hii');
           record.submitFields({
                type: 'customrecord_da_employee_leaves',
                id: currentRecId,
                values: {
                    'custrecord_da_leave_approvalstatus': 24
                }
            })
            window.open(window.location.origin + "/app/common/custom/custrecordentry.nl?rectype=" + recid + "&st=" + std + "&ed=" + ed + "&empId=" + empId+ "&leaveType=" + leaveType, "_self");
        }

        function dutyResumption(recid) {
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_da_su_duty_resumption_print',
                deploymentId: 'customdeploy_da_su_duty_resumption_print',
                params: {
                    'recid': recid,
                    'origin': window.location.origin
                }
            });
            console.log(suiteletUrl);
            window.open(suiteletUrl);
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
                if (scriptContext.fieldId == 'custrecord_subsidiary_logo') {}
            } catch (ex) {
                console.log(ex.name, ex.message);
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
        function saveRecord(scriptContext) {
            var leaveType = scriptContext.currentRecord.getValue('custrecord_da_leave_type');
            //console.log(scriptContext.currentRecord.getFields());
            if (leaveType == 1) {
                var leavedays = scriptContext.currentRecord.getValue('custrecord_da_leave_days');
                var leaveBalance = scriptContext.currentRecord.getValue('custrecord_da_leave_balance');
                if (leavedays > leaveBalance) {
                    alert("Sorry, you dont have enough leave balance to apply Leave. Please Apply for Unapid Leave or contact HR ");
                    return false;
                }
            }
          /*  if (subsidiaryExists) {
                var subsidairyId = scriptContext.currentRecord.getValue('custrecord_da_leave_empsubsidiary');
                var getlogoUrl = url.resolveScript({
                    scriptId: 'customscript_da_su_get_logo_url',
                    deploymentId: 'customdeploy_da_su_get_logo_url',
                    params: {
                        'subsidiaryExists': subsidiaryExists,
                        'subsidairyId': subsidairyId
                    },
                    returnExternalUrl: false
                });
            } else {
                var getlogoUrl = url.resolveScript({
                    scriptId: 'customscript_da_su_get_logo_url',
                    deploymentId: 'customdeploy_da_su_get_logo_url',
                    params: {
                        'subsidiaryExists': subsidiaryExists
                    },
                    returnExternalUrl: false
                });
            }
            var response = https.get({
                url: getlogoUrl
            });
            console.log(getlogoUrl);
            console.log(JSON.parse(response.body).logoURL);
            scriptContext.currentRecord.setValue('custrecord_da_subsidiary_logo_url',JSON.parse(response.body).logoURL);*/
            return true;
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            //      lineInit: lineInit,
            //      validateField: validateField,
            //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
            saveRecord: saveRecord,
            createNewLeave: createNewLeave,
            dutyResumption: dutyResumption
        };
    });