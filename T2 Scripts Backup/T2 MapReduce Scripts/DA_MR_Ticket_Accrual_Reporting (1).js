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
                    name: 'custscript_da_tickets_posting_period'
                });
                log.debug('postingPeriod', postingPeriod);
                var customrecord_da_ticket_accrualsSearchObj = search.create({
                    type: "customrecord_da_ticket_accruals",
                    filters: [
                        'custrecord_da_ticket_acc_period', 'anyof', postingPeriod
                    ]
                });
                var searchCount = customrecord_da_ticket_accrualsSearchObj.runPaged().count;
                log.debug("customrecord_da_ticket_accrualsSearchObj count", searchCount);
                customrecord_da_ticket_accrualsSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_ticket_accruals',
                        id: result.id
                    })
                    return true;
                });
                return search.create({
                    type: "employee",
                    filters: [

                        ["isinactive", "is", "F"],
                        "AND",
                        ["custentity_da_emp_basic_salary", "greaterthan", "0"],
                        "AND",
                        ["employeetype", "noneof", 1], "AND", ["releasedate", "isempty", ""]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custentity_da_emp_basic_salary",
                            label: "Basic Salary"
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
                //log.debug('values',values);
                var empId = searchResult.values.internalid.value;
                var basicSalary = searchResult.values.custentity_da_emp_basic_salary;
                context.write({
                    key: empId,
                    value: {
                        basicSalary: basicSalary
                    }
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
                var data = JSON.parse(context.values[0]);
                var basicsalary = data.basicSalary;
                var empRecord = record.load({
                    type: 'employee',
                    id: empId
                });
                var hireDate = empRecord.getValue('hiredate');
                var tikcetClaim = empRecord.getValue('custentity_da_employee_ticket');
                var terminationDate = empRecord.getValue('releasedate');
                var totalSalary = empRecord.getValue('custentity_total_salary');
                var basicSalary = empRecord.getValue('custentity_da_emp_basic_salary');
                var subsidiaryCountry = empRecord.getValue('custentity_da_subsidairy_country');

                var homeCountry = empRecord.getValue('custentity_da_emp_home_country');

                var customrecord_define_iata_ratesSearchObj = search.create({
                    type: "customrecord_define_iata_rates",
                    filters: [
                        ["custrecord_employee_country", "anyof", homeCountry]
                    ],
                    columns: [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "custrecord_adult_ticket_rate",
                            label: "Adult Ticket Rate (&gt; 11 Years)"
                        }),
                        search.createColumn({
                            name: "custrecord_child_ticket_rate",
                            label: "Child Ticket Rate (2-11 Years)"
                        }),
                        search.createColumn({
                            name: "custrecord_infant_ticket_rate",
                            label: "Infant Ticket Rate(0 -2 Years)"
                        })
                    ]
                });
                var searchResultCount = customrecord_define_iata_ratesSearchObj.runPaged().count;
                log.debug("customrecord_define_iata_ratesSearchObj result count", searchResultCount);


                if (searchResultCount > 0) {

                    var adultTicketRate = 0;
                    var childTicketRate = 0;
                    var infantTikcetRate = 0;

                    customrecord_define_iata_ratesSearchObj.run().each(function(result) {
                        adultTicketRate = result.getValue('custrecord_adult_ticket_rate');
                        childTicketRate = result.getValue('custrecord_child_ticket_rate');
                        infantTikcetRate = result.getValue('custrecord_infant_ticket_rate');
                        return true;
                    });

                    var customrecord_da_emp_family_membersSearchObj = search.create({
                        type: "customrecord_da_emp_family_members",
                        filters: [
                            ["custrecord_da_family_employee", "anyof", empId],
                            "AND",
                            ["custrecord_include_in_ticket", "is", "T"]
                        ],
                        columns: [

                            search.createColumn({
                                name: "custrecord_family_relation",
                                label: "Relation"
                            }),
                            search.createColumn({
                                name: "custrecord_family_member_name",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "custrecord_da_family_mem_gender",
                                label: "Gender"
                            }),
                            search.createColumn({
                                name: "custrecord_da_family_member_dob",
                                label: "DOB"
                            }),
                            search.createColumn({
                                name: "custrecord_include_in_ticket",
                                label: "Include In Ticket"
                            }),
                            search.createColumn({
                                name: "custrecord_da_family_member_age",
                                label: "Age"
                            }),
                            search.createColumn({
                                name: "custrecord_staying_country",
                                label: "Staying Country"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_emp_family_membersSearchObj.runPaged().count;
                    log.debug("customrecord_da_emp_family_membersSearchObj result count", searchResultCount);
                    var adultTicketAmount = adultTicketRate;
                    var childTikcetAmount = 0;
                    var infantTicketAmount = 0;

                    customrecord_da_emp_family_membersSearchObj.run().each(function(result) {
                        var age = result.getValue('custrecord_da_family_member_age');
                        if (age > 11) {
                            adultTicketAmount = parseFloat(adultTicketAmount) + parseFloat(adultTicketRate);
                        };

                        if (age > 2 && age <= 11) {
                            childTikcetAmount = parseFloat(childTikcetAmount) + parseFloat(childTicketRate);
                        }
                        if (age < 2) {
                            infantTicketAmount = parseFloat(infantTicketAmount) + parseFloat(infantTikcetRate);
                        }
                        return true;
                    });

                    var totalTicketAmount = parseFloat(adultTicketAmount) + parseFloat(childTikcetAmount) + parseFloat(infantTicketAmount);


                   // var da_today = new Date("02/01/2021");
                var scriptObjDate = runtime.getCurrentScript();
                var dateObj = scriptObjDate.getParameter({
                    name: 'custscript_da_ticket_accrual_date'
                });
                log.debug('dateObj', dateObj);
                   // var da_today = new Date(dateObj);
                   // log.debug('da_today',da_today);
                    //posting period id
                    var parsedDate = format.parse({
                    value: dateObj,
                    type: format.Type.DATE
                });
                log.debug('parsedDate',parsedDate);
                
                    var month = (parsedDate.getMonth());
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
                        '0': 'Dec'
                    }
                    var postingperiodMonth = monthsobj[month];
                    var year = parsedDate.getFullYear();
                    log.debug('year',year);
                    if (month == 0 || month == "0") {
                        year = year - 1;
                    }
                    log.debug('postingperiodMonth', postingperiodMonth + " " + year);
                    var accountingperiodSearchObj = search.create({
                        type: "accountingperiod",
                        filters: [
                            ["periodname", "startswith", postingperiodMonth + " " + year]
                        ],
                        columns: [
                            search.createColumn({
                                name: "periodname",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                    });
                    var searchResultCount = accountingperiodSearchObj.runPaged().count;
                    log.debug("accountingperiodSearchObj result count", searchResultCount);
                    var postingPeriodId;
                    accountingperiodSearchObj.run().each(function(result) {
                        postingPeriodId = result.id;
                        return true;
                    });

                    var customrecord_da_ticket_accrualsSearchObj = search.create({
                       type: "customrecord_da_ticket_accruals",
                       filters:
                       [
                          ["custrecord_da_ticket_acc_employee","anyof",empId]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "scriptid",
                             sort: search.Sort.ASC,
                             label: "Script ID"
                          }),
                          search.createColumn({name: "custrecord_da_ticket_acc_employee", label: "Employee"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_period", label: "Period"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_opening", label: "Opening Balance"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_add_amount", label: "Additional Amount"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_final_amount", label: "Ending Amount"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_emp_subsidairy", label: "Subsidiary"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_emp_department", label: "Department"}),
                          search.createColumn({name: "custrecord_da_ticket_acc_emp_location", label: "Location"})
                       ]
                    });
                    var searchResultCount = customrecord_da_ticket_accrualsSearchObj.runPaged().count;
                    log.debug("customrecord_da_ticket_accrualsSearchObj result count",searchResultCount);

                    var openingAmount = 0;
                    customrecord_da_ticket_accrualsSearchObj.run().each(function(result){
                      openingAmount = result.getValue('custrecord_da_ticket_acc_final_amount');
                    });

                    var additionalAmount = Number(totalTicketAmount/(tikcetClaim *12)).toFixed(2);
                    var endingAmount = parseFloat(openingAmount) + parseFloat(additionalAmount);

                    var ticketAccRec = record.create({
                        type : 'customrecord_da_ticket_accruals'
                    });
                    ticketAccRec.setValue('custrecord_da_ticket_acc_employee', empId);
                    ticketAccRec.setValue('custrecord_da_ticket_acc_period', postingPeriodId);
                    ticketAccRec.setValue('custrecord_da_ticket_acc_opening', openingAmount);
                    ticketAccRec.setValue('custrecord_da_ticket_acc_add_amount', additionalAmount);
                    ticketAccRec.setValue('custrecord_da_ticket_acc_final_amount', endingAmount);
                    ticketAccRec.save();
                }

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function getLastDateOFPrevMonth(endDate) {
            var d = new Date(endDate);
            d.setDate(1);
            d.setHours(-20);
            return d;
        };
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
            return unique_array
        }
        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });