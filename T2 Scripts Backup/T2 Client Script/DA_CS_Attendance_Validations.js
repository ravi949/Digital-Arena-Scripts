/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/currentRecord', 'N/url', 'N/https'],
    function(search, record, currentRecord, url, https) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode, Currecord, subsidiaryExists = false,
            generalSettingRecID = 1,
            nonWorkingDays = [];;

        function pageInit(scriptContext) {
            mode = scriptContext.mode;
            Currecord = currentRecord.get();
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
                var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_attendance_subsidiary');
              
               if(subsidiaryId){
                var customrecord_da_general_settingsSearchObj = search.create({
                    type: "customrecord_da_general_settings",
                    filters: [
                        ["custrecord_da_settings_subsidiary", "anyof", subsidiaryId]
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
                    nonWorkingDays.push(result.getValue('custrecord_non_working_days').split(","));
                });
                console.log(nonWorkingDays);
              }
            } else {
                var customrecord_da_general_settingsSearchObj = search.create({
                    type: "customrecord_da_general_settings",
                    filters: [],
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
                    nonWorkingDays.push(result.getValue('custrecord_non_working_days').split(","));
                });
                console.log(nonWorkingDays);
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
                if (scriptContext.fieldId == 'custrecord_attendance_subsidiary') {
                    if (subsidiaryExists) {
                        nonWorkingDays = [];
                        var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_attendance_subsidiary');
                        console.log(subsidiaryId);
                        if (subsidiaryId) {
                            var customrecord_da_general_settingsSearchObj = search.create({
                                type: "customrecord_da_general_settings",
                                filters: [
                                    ["custrecord_da_settings_subsidiary", "anyof", subsidiaryId]
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
                                nonWorkingDays.push(result.getValue('custrecord_non_working_days').split(","));
                            });
                            console.log(nonWorkingDays);
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_att_project_name') {
                    var projectId = scriptContext.currentRecord.getValue('custrecord_da_att_project_name');
                    var dateType = scriptContext.currentRecord.getValue('custrecord_da_att_date_type');
                    var numLines = scriptContext.currentRecord.getLineCount({
                        sublistId: 'recmachcustrecord_da_attendance_parent'
                    });
                    for (var i = numLines - 1; i >= 0; i--) {
                        scriptContext.currentRecord.removeLine({
                            sublistId: 'recmachcustrecord_da_attendance_parent',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                    var jobSearchObj = search.create({
                        type: "job",
                        filters: [
                            ["internalid", "anyof", projectId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "entityid",
                                join: "projectResource",
                                label: "Name/ID"
                            }),
                            search.createColumn({
                                name: "internalid",
                                join: "projectResource",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = jobSearchObj.runPaged().count;
                    log.debug("jobSearchObj result count", searchResultCount);
                    jobSearchObj.run().each(function(result) {
                        scriptContext.currentRecord.selectNewLine({
                            sublistId: 'recmachcustrecord_da_attendance_parent'
                        });
                        console.log(result.getValue({
                            name: 'internalid',
                            join: 'projectresource'
                        }));
                        console.log(result.getValue({
                            name: 'entityid',
                            join: 'projectresource'
                        }));
                        var projEmpId = result.getValue({
                            name: 'internalid',
                            join: 'projectresource'
                        });
                        if (projEmpId) {
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_attendance_parent',
                                fieldId: 'custrecord_da_atten_details_employee',
                                value: result.getValue({
                                    name: 'internalid',
                                    join: 'projectresource'
                                }),
                                ignoreFieldChange: true
                            });
                            if (dateType == 2 || dateType == 3) {
                                scriptContext.currentRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_attendance_parent',
                                    fieldId: 'custrecord_da_atten_details_status',
                                    value: 1,
                                    ignoreFieldChange: true
                                });
                            }
                            scriptContext.currentRecord.commitLine({
                                sublistId: 'recmachcustrecord_da_attendance_parent'
                            });
                        }
                        return true;
                    });
                }
                if (scriptContext.fieldId == 'custrecord_da_att_select_location') {
                    var projectId = scriptContext.currentRecord.getValue('custrecord_da_att_project_name');
                    var dateType = scriptContext.currentRecord.getValue('custrecord_da_att_date_type');
                    if (!projectId) {
                        var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'recmachcustrecord_da_attendance_parent'
                        });
                        for (var i = numLines - 1; i >= 0; i--) {
                            scriptContext.currentRecord.removeLine({
                                sublistId: 'recmachcustrecord_da_attendance_parent',
                                line: i,
                                ignoreRecalc: true
                            });
                        }
                        var locationId = scriptContext.currentRecord.getValue('custrecord_da_att_select_location');
                        if (locationId) {
                            var employeeSearchObj = search.create({
                                type: "employee",
                                filters: [
                                    ["location", "anyof", locationId]
                                ],
                                columns: [
                                    'internalid'
                                ]
                            });
                            var searchResultCount = employeeSearchObj.runPaged().count;
                            log.debug("employeeSearchObj result count", searchResultCount);
                            employeeSearchObj.run().each(function(result) {
                                scriptContext.currentRecord.selectNewLine({
                                    sublistId: 'recmachcustrecord_da_attendance_parent'
                                });
                                scriptContext.currentRecord.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_da_attendance_parent',
                                    fieldId: 'custrecord_da_atten_details_employee',
                                    value: result.id,
                                    ignoreFieldChange: true
                                });
                                if (dateType == 2 || dateType == 3) {
                                    scriptContext.currentRecord.setCurrentSublistValue({
                                        sublistId: 'recmachcustrecord_da_attendance_parent',
                                        fieldId: 'custrecord_da_atten_details_status',
                                        value: 1,
                                        ignoreFieldChange: true
                                    });
                                }
                                scriptContext.currentRecord.commitLine({
                                    sublistId: 'recmachcustrecord_da_attendance_parent'
                                });
                                return true;
                            });
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_atten_details_status') {
                    var dateType = scriptContext.currentRecord.getValue('custrecord_da_att_date_type');
                    var status = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_attendance_parent',
                        fieldId: 'custrecord_da_atten_details_status'
                    });
                    if (dateType == 2 || dateType == 3) {
                        if (status != 1 || status != 6) {
                            alert('you selected wrong status');
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_attendance_parent',
                                fieldId: 'custrecord_da_atten_details_status',
                                value: 1,
                                ignoreFieldChange: true
                            });
                        }
                    }
                }
                if (scriptContext.fieldId == 'custrecord_da_att_details_hours') {
                    /*var status = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_da_attendance_parent',
                        fieldId: 'custrecord_da_atten_details_status'
                    });

                    if(!status){
                        alert("please select status");
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_attendance_parent',
                            fieldId: 'custrecord_da_att_details_hours',
                            value: 0,
                            ignoreFieldChange: true
                        });
                    }else{
                        var hours  = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_da_attendance_parent',
                            fieldId: 'custrecord_da_att_details_hours'
                        });

                        if(status == 4 && hours > 0){
                            alert("you cant enter greater than zero for absent status");
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_da_attendance_parent',
                                fieldId: 'custrecord_da_att_details_hours',
                                value: 0,
                                ignoreFieldChange: true
                            });
                        }
                    }*/
                }
                if (scriptContext.fieldId == 'custrecord_da_att_select_date') {
                    var selectDate = scriptContext.currentRecord.getText('custrecord_da_att_select_date');
                    console.log('selectDate', selectDate);
                    if (selectDate) {
                        var flag = true;
                        var customrecord_da_holiday_datesSearchObj = search.create({
                            type: "customrecord_da_holiday_dates",
                            filters: [
                                ["custrecord_holiday_date", "on", selectDate]
                            ],
                            columns: [search.createColumn({
                                name: "custrecord_holiday_date",
                                label: "Date"
                            })]
                        });
                        var searchResultCount = customrecord_da_holiday_datesSearchObj.runPaged().count;
                        console.log("customrecord_da_holiday_datesSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            scriptContext.currentRecord.setValue('custrecord_da_att_date_type', 3);
                            flag = false;
                        }
                        if (flag) {
                            var today1 = scriptContext.currentRecord.getValue('custrecord_da_att_select_date');
                            if (nonWorkingDays.length > 0) {
                                for (var i = 0; i < nonWorkingDays[0].length; i++) {
                                    console.log(nonWorkingDays[0][i]);
                                    if (today1.getDay() == (parseFloat(nonWorkingDays[0][i]) - 1)) {
                                        scriptContext.currentRecord.setValue('custrecord_da_att_date_type', 2);
                                        flag = false;
                                    }
                                }
                            }
                        }
                        if (flag) {
                            scriptContext.currentRecord.setValue('custrecord_da_att_date_type', 1);
                        }
                    }
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
        function postSourcing(scriptContext) {
            if (scriptContext.fieldId == 'trandate') {
                var selectDate = scriptContext.currentRecord.getText('trandate');
                console.log('selectDate', selectDate);
                if (selectDate) {
                    var flag = true;
                    var customrecord_da_holiday_datesSearchObj = search.create({
                        type: "customrecord_da_holiday_dates",
                        filters: [
                            ["custrecord_holiday_date", "on", selectDate]
                        ],
                        columns: [search.createColumn({
                            name: "custrecord_holiday_date",
                            label: "Date"
                        })]
                    });
                    var searchResultCount = customrecord_da_holiday_datesSearchObj.runPaged().count;
                    console.log("customrecord_da_holiday_datesSearchObj result count", searchResultCount);
                    if (searchResultCount > 0) {
                        scriptContext.currentRecord.setValue('custcol_da_time_date_type', 3);
                        flag = false;
                    }
                    if (flag) {
                        var today1 = scriptContext.currentRecord.getValue('trandate');
                        var customrecord_da_general_settingsSearchObj = search.create({
                            type: "customrecord_da_general_settings",
                            filters: [
                                ["custrecord_da_settings_subsidiary", "anyof", scriptContext.currentRecord.getValue('subsidiary')]
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
                        if (searchResultCount > 0) {
                            var nonWorkingDays = [];
                            customrecord_da_general_settingsSearchObj.run().each(function(result) {
                                nonWorkingDays.push(result.getValue('custrecord_non_working_days').split(","));
                            });
                            console.log(nonWorkingDays);
                            for (var i = 0; i < nonWorkingDays[0].length; i++) {
                                console.log(nonWorkingDays[0][i]);
                                if (today1.getDay() == (parseFloat(nonWorkingDays[0][i]) - 1)) {
                                    scriptContext.currentRecord.setValue('custcol_da_time_date_type', 2);
                                    flag = false;
                                }
                            }
                        }
                    }
                    if (flag) {
                        scriptContext.currentRecord.setValue('custcol_da_time_date_type', 1);
                    }
                }
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

        function getEmployeesBasedOnSubsidiary(subID) {
            console.log(subID);
            console.log(Currecord);
            var subsidiaryId = Currecord.getValue('custrecord_attendance_subsidiary');
            var numLines = Currecord.getLineCount({
                sublistId: 'recmachcustrecord_da_attendance_parent'
            });
            for (var i = numLines - 1; i >= 0; i--) {
                Currecord.removeLine({
                    sublistId: 'recmachcustrecord_da_attendance_parent',
                    line: i,
                    ignoreRecalc: true
                });
            }
            var employeeSearchObj = search.create({
                type: "employee",
                filters: [
                    ["subsidiary", "anyof", subsidiaryId], 'AND', ["custentity_include_ot_and_ded", "is", "true"]
                ],
                columns: [
                    search.createColumn({
                        name: "department",
                        label: "Department"
                    })
                ]
            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            console.log("employeeSearchObj result count", searchResultCount);
            employeeSearchObj.run().each(function(result) {
                console.log(result.id);
                Currecord.selectNewLine({
                    sublistId: 'recmachcustrecord_da_attendance_parent'
                });
                Currecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_attendance_parent',
                    fieldId: 'custrecord_da_atten_details_employee',
                    value: result.id,
                    ignoreFieldChange: true
                });
                Currecord.commitLine({
                    sublistId: 'recmachcustrecord_da_attendance_parent'
                });
                return true;
            });
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
          /*  try {
                var attendanceType = scriptContext.currentRecord.getValue('custrecord_da_att_select_type');
                var payrollType = scriptContext.currentRecord.getValue('custrecord_da_payroll_proces_type');
                if (mode == "create") {
                    if (payrollType) {
                        var customrecord_da_payroll_processSearchObj = search.create({
                            type: "customrecord_da_payroll_process",
                            filters: [                               
                                ["custrecord_da_payroll_proces_type", "anyof", payrollType],
                                "AND",
                                ["custrecord_da_payroll_pro_period", "anyof", scriptContext.currentRecord.getValue('custrecord_da_payroll_pro_period')]
                            ],
                            columns: ['internalid']
                        });

                        if(subsidiaryExists){
                            customrecord_da_payroll_processSearchObj.filters.push(search.createFilter({
                                 "name"    : "custrecord_pyaroll_process_subsidairy",
                                 "operator": "anyof",
                                 "values"  : scriptContext.currentRecord.getValue('custrecord_pyaroll_process_subsidairy')
                             }));
                        }
                        var searchResultCount = customrecord_da_payroll_processSearchObj.runPaged().count;
                        log.debug("customrecord_da_payroll_processSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            alert("Sorry , Already there is a payroll processed record with the same posting period");
                            return false;
                        }
                    }
                    if (attendanceType == 1) { //project
                        var customrecord_da_hr_attendenceSearchObj = search.create({
                            type: "customrecord_da_hr_attendence",
                            filters: [
                                ["custrecord_da_att_select_type", "anyof", "1"],
                                "AND",
                                ["custrecord_da_att_project_name", "anyof", scriptContext.currentRecord.getValue('custrecord_da_att_project_name')],
                                "AND",
                                ["custrecord_da_att_select_location", "anyof", scriptContext.currentRecord.getValue('custrecord_da_att_select_location')],
                                "AND",
                                ["custrecord_da_att_select_date", "on", scriptContext.currentRecord.getText('custrecord_da_att_select_date')]
                            ],
                            columns: ['internalid']
                        });
                        var searchResultCount = customrecord_da_hr_attendenceSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_attendenceSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            alert("Sorry,Already attendance entered on this date");
                            return false;
                        }
                    }
                    if (attendanceType == 2) { //Regular
                        var customrecord_da_hr_attendenceSearchObj = search.create({
                            type: "customrecord_da_hr_attendence",
                            filters: [
                                ["custrecord_da_att_select_type", "anyof", "2"],
                                "AND",
                                ["custrecord_da_att_select_location", "anyof", scriptContext.currentRecord.getValue('custrecord_da_att_select_location')],
                                "AND",
                                ["custrecord_da_att_select_date", "on", scriptContext.currentRecord.getText('custrecord_da_att_select_date')]
                            ],
                            columns: ['internalid']
                        });
                        var searchResultCount = customrecord_da_hr_attendenceSearchObj.runPaged().count;
                        log.debug("customrecord_da_hr_attendenceSearchObj result count", searchResultCount);
                        if (searchResultCount > 0) {
                            alert("Sorry,Already attendance entered on this date");
                            return false;
                        }
                    }
                }
                return true;
            } catch (ex) {
                log.error(ex.name, ex.message);
            }*/
          
          // Added By Alaa
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
            getEmployeesBasedOnSubsidiary: getEmployeesBasedOnSubsidiary
        };
    });