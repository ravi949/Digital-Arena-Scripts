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
  var nonWorkingDays ;
        function pageInit(scriptContext) {
			nonWorkingDays = [];
                        var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_da_subsidairy_overtime');
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
              
              if (scriptContext.fieldId == 'custrecord_da_subsidairy_overtime') {
                    if (true) {
                        nonWorkingDays = [];
                        var subsidiaryId = scriptContext.currentRecord.getValue('custrecord_da_subsidairy_overtime');
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

                if (scriptContext.fieldId == 'custrecord_da_overtime_date') {
                   var empId  = scriptContext.currentRecord.getValue('custrecord_da_overtime_employee');
                  var date = scriptContext.currentRecord.getValue('custrecord_da_overtime_date');
                  var year = new Date(date).getFullYear();
                  console.log(year);
                  var customrecord_da_overtime_requestSearchObj = search.create({
                     type: "customrecord_da_overtime_request",
                     filters:
                     [
                        ["custrecord_da_overtime_date","within","01/01/"+year, "31/12/"+year], 
                        "AND", 
                        ["custrecord_da_approval_status_overtime","anyof","2"], 
                        "AND", 
                        ["custrecord_da_overtime_employee","anyof",empId]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "custrecord_da_overtime_hours",
                           summary: "SUM",
                           label: "per year"
                        })
                     ]
                  });
                  var searchResultCount = customrecord_da_overtime_requestSearchObj.runPaged().count;
                  log.debug("customrecord_da_overtime_requestSearchObj result count",searchResultCount);
                  var hrsPerYear = 0;
                  customrecord_da_overtime_requestSearchObj.run().each(function(result){
                   hrsPerYear = result.getValue({
                     name :'custrecord_da_overtime_hours',
                     summary : search.Summary.SUM
                   })
                     return true;
                  });
                  hrsPerYear = (hrsPerYear)? hrsPerYear : 0;
                   scriptContext.currentRecord.setValue('custrecord_da_total_h_in_year', hrsPerYear);
                    var selectDate = scriptContext.currentRecord.getText('custrecord_da_overtime_date');
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
                            scriptContext.currentRecord.setValue('custrecord_da_overtime_date_type', 3);
                            flag = false;
                        }
                        if (flag) {
                            var today1 = scriptContext.currentRecord.getValue('custrecord_da_overtime_date');
                            if (nonWorkingDays.length > 0) {
                                for (var i = 0; i < nonWorkingDays[0].length; i++) {
                                    console.log(nonWorkingDays[0][i]);
                                    if (today1.getDay() == (parseFloat(nonWorkingDays[0][i]) - 1)) {
                                        scriptContext.currentRecord.setValue('custrecord_da_overtime_date_type', 2);
                                        flag = false;
                                    }
                                }
                            }
                        }
                        if (flag) {
                            scriptContext.currentRecord.setValue('custrecord_da_overtime_date_type', 1);
                        }
                    }
                }

                if (scriptContext.fieldId == 'custrecord_da_overtime_date_type') {

                    var dateType = scriptContext.currentRecord.getValue('custrecord_da_overtime_date_type');

                    var customrecord_da_general_settingsSearchObj = search.create({
                        type: "customrecord_da_general_settings",
                        filters: [
                            ["custrecord_da_settings_subsidiary", "anyof", scriptContext.currentRecord.getValue('custrecord_da_subsidairy_overtime')]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_non_working_day_ot",
                                label: "Non Working Day Overtime (per Hr)"
                            }),
                            search.createColumn({
                                name: "custrecord_normal_working_day_ot",
                                label: "Normal Working Day Overtime (per Hr)"
                            }),
                            search.createColumn({
                                name: "custrecord_public_holiday_ot",
                                label: "Public Holiday Overtime( Per Hr)"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
                    log.debug("customrecord_da_general_settingsSearchObj result count", searchResultCount);
                    customrecord_da_general_settingsSearchObj.run().each(function(result) {
                        if (dateType == 1) {
                            var value = result.getValue('custrecord_normal_working_day_ot');
                        }

                        if (dateType == 2) {
                            var value = result.getValue('custrecord_non_working_day_ot');
                        }

                        if (dateType == 3) {
                            var value = result.getValue('custrecord_public_holiday_ot');
                        }
                        scriptContext.currentRecord.setValue('custrecord_da_overtime_rate', value);
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
          
          var lineCount =  scriptContext.currentRecord.getLineCount({
            sublistId :'recmachcustrecord_da_overtime_link'
          });
          var totalHours = 0;
          
          for(var i = 0 ; i < lineCount ; i++){
            var hours = scriptContext.currentRecord.getSublistValue({
            sublistId :'recmachcustrecord_da_overtime_link',
              fieldId :'custrecord_da_overtime_hours_line',
              line : i
           });
            totalHours = parseFloat(totalHours) + parseFloat(hours);
          }
           scriptContext.currentRecord.setValue('custrecord_da_overtime_hours', totalHours);
          return true;

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            //    postSourcing: postSourcing,
            //    sublistChanged: sublistChanged,
            //    lineInit: lineInit,
            //    validateField: validateField,
            //    validateLine: validateLine,
            //    validateInsert: validateInsert,
            //    validateDelete: validateDelete,
                saveRecord: saveRecord
        };

    });