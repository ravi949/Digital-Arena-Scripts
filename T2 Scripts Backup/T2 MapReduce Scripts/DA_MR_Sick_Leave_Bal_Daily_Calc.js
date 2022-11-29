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
                return search.create({
                    type: "employee",
                    filters: [
                        ["isinactive", "is", false]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            sort: search.Sort.ASC,
                            label: "id"
                        }),
                        search.createColumn({
                            name: "email",
                            label: "Email"
                        }),
                        search.createColumn({
                            name: "phone",
                            label: "Phone"
                        })
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
                var values = searchResult.values;
                var empId = values.internalid.value;
                //log.debug('EMpID',empId);
                context.write({
                    key: empId,
                    value: empId
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
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);

                var customrecord_da_leave_types_settingsSearchObj = search.create({
                   type: "customrecord_da_leave_types_settings",
                   filters:
                   [
                      ["custrecord_da_leave_categories","anyof","2"]//sick leave                      
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_no_of_days", label: "No of Days per year"}),
                      search.createColumn({name: "custrecord_da_frequency_method", label: "Frequency Method"})
                   ]
                });
                var searchResultCount = customrecord_da_leave_types_settingsSearchObj.runPaged().count;
                log.debug("customrecord_da_leave_types_settingsSearchObj result count",searchResultCount);

                if(featureEnabled){
                    var employeeSubsidairy = record.load({
                        type :'employee',
                        id : empId
                    }).getValue('subsidiary');
                   customrecord_da_leave_types_settingsSearchObj.filters.push(search.createFilter({
                     "name"    : "custrecord_da_leave_subsidiary",
                     "operator": "anyof",
                     "values"  : employeeSubsidairy
                  }));
                }

                var calcBasedOn;
                var totalSickLeaves;
                customrecord_da_leave_types_settingsSearchObj.run().each(function(result){
                   calcBasedOn = result.getValue('custrecord_da_frequency_method');
                   totalSickLeaves = result.getValue('custrecord_da_no_of_days');
                   return true;
                });

                if (true) {
                    log.debug('empId', empId);
                    // Search for leeave balance records if exists ok otherwise will cretae the record.
                    var currentLeaveBalance = 0;
                    var customrecord407SearchObj = search.create({
                        type: "customrecord_da_employee_sick_leave_bala",
                        filters: [
                            ["custrecord_da_sick_bal_employee", "anyof", empId]
                        ],
                        columns: ['custrecord_da_emp_sick_leave_balance']
                    });
                    var searchResultCount = customrecord407SearchObj.runPaged().count;
                    //log.debug("customrecord407SearchObj result count",searchResultCount);
                    var leavebalanceRecId;
                    if (searchResultCount > 0) {
                        customrecord407SearchObj.run().each(function(result) {
                            leavebalanceRecId = result.id;
                            //currentLeaveBalance = result.getValue('custrecord_emp_leave_balance');
                        });
                    } else {
                        var leavebalcRec = record.create({
                            type: 'customrecord_da_employee_sick_leave_bala'
                        });
                        leavebalcRec.setValue('custrecord_da_sick_bal_employee', empId);
                        leavebalanceRecId = leavebalcRec.save();
                    }
                    log.debug('calcBasedOn', calcBasedOn);
                    //Process starts now
                    if (calcBasedOn == 3) {
                        var customrecord_da_employee_leavesSearchObj = search.create({
                            type: "customrecord_da_employee_leaves",
                            filters: [
                                ["custrecord_da_sickleave_period", "is", "T"],
                                "AND",
                                ["custrecord_da_employee_leave", "anyof", empId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_leave_startdate",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                        log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                        var startDate;
                        customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                            startDate = result.getValue('custrecord_da_leave_startdate');
                            return true;
                        });
                        log.debug('startDate', startDate);
                      
                      var totalSickLeavesTaken = 0;
                      if(startDate){
                        
                      
                        var month = startDate.split("/")[1];
                        var date = startDate.split("/")[0];
                        var year = startDate.split("/")[2];
                        log.debug('month', date + "/" + month + "/" + year);
                        var customrecord_da_employee_leavesSearchObj = search.create({
                            type: "customrecord_da_employee_leaves",
                            filters: [
                                ["custrecord_da_emp_leavetype", "anyof", "2"],
                                "AND",
                                ["custrecord_da_employee_leave", "anyof", empId],
                                "AND",
                                ["custrecord_da_leave_startdate", "within", date + "/" + month + "/" + year, date + "/" + month + "/" + (parseFloat(year) + parseFloat(1))]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_emp_leavedays",
                                    summary: "SUM",
                                    label: "Leave Days"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                        log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                        
                        customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                            var days = result.getValue({
                                name: 'custrecord_da_emp_leavedays',
                                summary: search.Summary.SUM
                            });
                            totalSickLeavesTaken = parseFloat(totalSickLeavesTaken) + parseFloat(days);
                            return true;
                        });
                        }
                        var balance = parseFloat(totalSickLeaves) - parseFloat(totalSickLeavesTaken);
                        record.load({
                            type: 'customrecord_da_employee_sick_leave_bala',
                            id: leavebalanceRecId
                        }).setValue('custrecord_da_emp_sick_leave_balance', balance).save();
                    }
                    if (calcBasedOn == 2) {
                        var empRec = record.load({
                            type: 'employee',
                            id: empId
                        });
                        var hireDate = empRec.getValue('hiredate');
                        log.debug('hiredate', hireDate);
                    }
                    if (calcBasedOn == 1) {
                        var customrecord_da_employee_leavesSearchObj = search.create({
                            type: "customrecord_da_employee_leaves",
                            filters: [
                                ["custrecord_da_emp_leavetype", "anyof", "2"],
                                "AND",
                                ["custrecord_da_employee_leave", "anyof", empId],
                                "AND",
                                ["custrecord_da_leave_startdate", "within", "thisyear"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "custrecord_da_emp_leavedays",
                                    summary: "SUM",
                                    label: "Leave Days"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_employee_leavesSearchObj.runPaged().count;
                        log.debug("customrecord_da_employee_leavesSearchObj result count", searchResultCount);
                        var totalSickLeavesTaken = 0;
                        customrecord_da_employee_leavesSearchObj.run().each(function(result) {
                            // .run().each has a limit of 4,000 results
                            var days = result.getValue({
                                name: 'custrecord_da_emp_leavedays',
                                summary: search.Summary.SUM
                            })
                            totalSickLeavesTaken = parseFloat(totalSickLeavesTaken) + parseFloat(days);
                            return true;
                        });
                        
                        var balance = parseFloat(totalSickLeaves) - parseFloat(totalSickLeavesTaken);
                        record.load({
                            type: 'customrecord_da_employee_sick_leave_bala',
                            id: leavebalanceRecId
                        }).setValue('custrecord_da_emp_sick_leave_balance', balance).save();
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function removeDuplicateUsingFilter(arr) {
            var unique_array = arr.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            return unique_array;
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });