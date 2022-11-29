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
                var batchId = runtime.getCurrentScript().getParameter({
                    name: "custscript_batch_id"
                });
                // log.debug('batchId', batchId);
                if (batchId) {
                    return search.create({
                        type: "customrecord_da_amm_batch_subjects",
                        filters: [
                            ["custrecord_da_amm_batch_parent", "anyof", batchId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                }
                var salesOrderId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sales_order_id"
                });
                if (salesOrderId) {
                    var salesOrderRec = record.load({
                        type: 'salesorder',
                        id: salesOrderId
                    });
                    var batchId = salesOrderRec.getValue('custbody_da_amm_so_batch');
                    var CustomerId = salesOrderRec.getValue('entity');
                    var customrecord_da_amm_time_table_recordSearchObj = search.create({
                        type: "customrecord_da_amm_time_table_record",
                        filters: [
                            ["custrecord_da_amm_tt_batch", "anyof", batchId],
                            "AND",
                            ["custrecord_da_amm_tt_student", "anyof", CustomerId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                    //log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                    customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                        record.delete({
                            type: 'customrecord_da_amm_time_table_record',
                            id: result.id
                        })
                        return true;
                    });
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters: [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["custcol_da_amm_sub_ref", "noneof", "@NONE@"],
                            "AND",
                            ["internalid", "anyof", salesOrderId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "tranid",
                                label: "Document Number"
                            }),
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "entity",
                                label: "Name"
                            }),
                            search.createColumn({
                                name: "custcol_da_amm_sub_ref",
                                label: "Subject Ref"
                            })
                        ]
                    });
                    var searchResultCount = salesorderSearchObj.runPaged().count;
                    //log.debug("salesorderSearchObj result count", searchResultCount);
                    var subjectIds = [];
                    salesorderSearchObj.run().each(function(result) {
                        subjectIds.push(result.getValue('custcol_da_amm_sub_ref'));
                        return true;
                    });
                    return search.create({
                        type: "customrecord_da_amm_batch_subjects",
                        filters: [
                            ["internalid", "anyof", subjectIds]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                }
                var paramsubjectIds = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_subject_ids"
                });
                // log.debug('paramsubjectIds', paramsubjectIds);
                paramsubjectIds = JSON.parse(paramsubjectIds);
                if (paramsubjectIds) {
                    log.debug('paramsubjectIds', paramsubjectIds);
                    return search.create({
                        type: "customrecord_da_amm_batch_subjects",
                        filters: [
                            ["internalid", "anyof", paramsubjectIds]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                }
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
          //    log.debug('values', values);
                var subjectId = values.internalid.value;
           //     log.debug('subjectId', subjectId);
                context.write({
                    key: subjectId,
                    value: subjectId
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
                var subjectId = JSON.parse(context.key);
                //log.debug('subjectId', subjectId);
               /* var calendareventSearchObj = search.create({
                    type: "calendarevent",
                    filters: [
                        ["custevent_da_subject_ref", "anyof", subjectId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var eventsCount = calendareventSearchObj.runPaged().count;
                log.debug("calendareventSearchObj result count", eventsCount);*/
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters: [
                        ["custcol_da_amm_sub_ref", "anyof", subjectId],
                        "AND",
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["mainline", "is", "F"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "tranid",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "entity",
                            label: "Name"
                        })
                    ]
                });
                var salesOrderId = runtime.getCurrentScript().getParameter({
                    name: "custscript_da_sales_order_id"
                });
                if (salesOrderId) {
                    salesorderSearchObj.filters.push(search.createFilter({
                        "name": "internalid",
                        "operator": "anyof",
                        "values": salesOrderId
                    }));
                }
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug("salesorderSearchObj result count", searchResultCount);
                if (searchResultCount > 0) {
                    var registeredStudents = [],
                        timeTableDates = [];
                    salesorderSearchObj.run().each(function(result) {
                        registeredStudents.push(result.getValue('entity'));
                        return true;
                    });
                    var subjectRec = record.load({
                        type: 'customrecord_da_amm_batch_subjects',
                        id: subjectId
                    });
                    var sessions = subjectRec.getValue('custrecord_da_amm_subject_qauntity');
                    var frequency = subjectRec.getValue('custrecord_da_amm_subject_frequency');
                    var batchId = subjectRec.getValue('custrecord_da_amm_batch_parent');
                    var batchRec = record.load({
                        type: 'customrecord_da_amm_setup_batch',
                        id: subjectRec.getValue('custrecord_da_amm_batch_parent')
                    })
                    var startDate = batchRec.getValue('custrecord_da_amm_batch_start_date');
                    var endDate = batchRec.getValue('custrecord_da_amm_batch_end_date');
                    if (frequency == 1) {
                        // Daily                        
                        var dates = getDates(startDate, endDate);
                        dates.forEach(function(date) {
                            //log.debug('date', date);
                            timeTableDates.push(date);
                        });
                    }
                    if (frequency == 2) {
                        // Weekly
                        var days = subjectRec.getValue('custrecord_da_amm_sub_days');
                        //  log.debug('days', days);
                        var weekDays = days.map(function(value) {
                            return value - 1;
                        });
                        // log.debug('weekDays', weekDays);
                        // log.debug('weekDays', typeof weekDays);
                        var dates = getWeekDays(startDate, endDate, weekDays);
                        //  log.debug('dates', dates);
                        dates.forEach(function(date) {
                            //   log.debug('date', date);
                            timeTableDates.push(date);
                        });
                    }
                    if (frequency == 3) {
                        // Monthly
                        var selectedDates = subjectRec.getValue('custrecord_da_batch_selected_dates');
                        //log.debug('length', selectedDates.length);
                        if (selectedDates.length > 0) {
                            var selectedDates = selectedDates.split(",");
                            //log.debug('selectedDates', selectedDates);
                            selectedDates.forEach(function(date) {
                                var parsedDateStringAsRawDateObject = format.parse({
                                    value: date,
                                    type: format.Type.DATE
                                });
                                //log.debug('parsedDateStringAsRawDateObject', new Date(parsedDateStringAsRawDateObject));
                                var formattedDateString = format.format({
                                    value: parsedDateStringAsRawDateObject,
                                    type: format.Type.DATE
                                });
                                //log.debug('formattedDateString', formattedDateString);
                                timeTableDates.push(parsedDateStringAsRawDateObject);
                            });
                        } else {
                            var dates = getDates(startDate, endDate);
                            dates.forEach(function(date) {
                                //log.debug('date', date);
                                timeTableDates.push(date);
                            });
                        }
                    }
                    if (frequency == 4) {
                      log.debug('frequency');
                        for (var i = 0; i < registeredStudents.length; i++) {
                            var studentId = registeredStudents[i];
                            var customrecord_da_amm_time_table_recordSearchObj = search.create({
                                type: "customrecord_da_amm_time_table_record",
                                filters: [
                                    ["custrecord_da_amm_tt_batch_subject", "anyof", subjectId],
                                    "AND",
                                    ["custrecord_da_student_name", "isempty", ""]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "scriptid",
                                        sort: search.Sort.ASC,
                                        label: "Script ID"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_batch",
                                        label: "Batch"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_batch_course",
                                        label: "Course"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_sub_name",
                                        label: "Subject Name"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_date",
                                        label: "Date"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_time_table_date_to",
                                        label: "Date to"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_batch_time_from",
                                        label: "Time From"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_time_to",
                                        label: "Time To"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_sub_tt_room_no",
                                        label: "Room No"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_beauitician_name",
                                        label: "Beautician Name"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_student_name",
                                        label: "Student Id"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_sub_tt_room_no",
                                        label: "Room No"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_da_amm_tt_event_id",
                                        label: "Session Id"
                                    })
                                ]
                            });
                            var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                            log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                            customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                                var batchId = result.getValue('custrecord_da_amm_tt_batch');
                                var date = result.getValue('custrecord_da_amm_tt_date');
                              var dateTo = result.getValue('custrecord_da_time_table_date_to');
                                var transactionSearchObj = search.create({
                                    type: "transaction",
                                    filters: [
                                        ["custbody_da_amm_so_batch", "anyof", batchId],
                                        "AND",
                                        ["name", "anyof", studentId],
                                        "AND",
                                        ["mainline", "is", "T"]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Internal ID"
                                        })
                                    ]
                                });
                                var searchResultCount = transactionSearchObj.runPaged().count;
                                log.debug("transactionSearchObj result count", searchResultCount);
                                var parsedDateStringAsRawDateObject = format.parse({
                                    value: date,
                                    type: format.Type.DATE
                                });
                              var parsedDateStringAsRawDateObjectDateTo = format.parse({
                                    value: dateTo,
                                    type: format.Type.DATE
                                });
                                //log.debug('parsedDateStringAsRawDateObject', new Date(parsedDateStringAsRawDateObject));
                                var formattedDateString = format.format({
                                    value: parsedDateStringAsRawDateObject,
                                    type: format.Type.DATE
                                });
                                var timeFrom = result.getText('custrecord_da_amm_tt_batch_time_from');
                                log.debug('timeFrom', timeFrom);
                                var roomNo = result.getValue('custrecord_da_sub_tt_room_no');
                                timeFrom = format.parse({
                                    value: timeFrom,
                                    type: format.Type.TIMEOFDAY
                                });
                                 log.debug('aftimeFrom', timeFrom);
                                var timeTo = result.getValue('custrecord_da_amm_tt_time_to');
                                log.debug('timeTo', timeTo);
                                timeTo = format.parse({
                                    value: timeTo,
                                    type: format.Type.TIMEOFDAY
                                });
                                log.debug('aftimeTo', timeTo);
                                var subjectId1 = result.getValue('custrecord_da_amm_tt_sub_name');
                                var Beautician = result.getValue('custrecord_da_amm_tt_beauitician_name');
                                var beauticianName = result.getText('custrecord_da_amm_tt_beauitician_name');
                                var eventId = result.getValue('custrecord_da_amm_tt_event_id');

                                 var calendareventSearchObj = search.create({
                                    type: "calendarevent",
                                    filters: [
                                        ["custevent_da_subject_ref", "anyof", subjectId]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "internalid",
                                            label: "Internal ID"
                                        })
                                    ]
                                });
                                var eventsCount = calendareventSearchObj.runPaged().count;
                                log.debug("calendareventSearchObj result count", eventsCount);
                               
                                var enrollmentNo;
                                transactionSearchObj.run().each(function(result) {
                                    enrollmentNo = result.id
                                    return true;
                                });
                                var timeFrom = result.getValue('custrecord_da_amm_tt_batch_time_from');
                                log.debug('timeFrom', timeFrom);
                                //log.debug('details', date + "," + timeFrom + ",,," + timeTo);
                                //
                                 var dates = getDates(parsedDateStringAsRawDateObject, parsedDateStringAsRawDateObjectDateTo);
                            dates.forEach(function(date) {
                              log.debug('dateee', date);
                                 var timeTableRec = record.create({
                                    type: 'customrecord_da_amm_time_table_record'
                                });
                                timeTableRec.setValue('custrecord_da_amm_tt_batch', batchId);
                                timeTableRec.setValue('custrecord_da_amm_tt_sub_name', subjectId1);
                                timeTableRec.setValue('custrecord_da_amm_tt_batch_time_from', timeFrom);
                                timeTableRec.setValue('custrecord_da_amm_tt_batch_subject', subjectId);
                                timeTableRec.setValue('custrecord_da_amm_tt_date', date);
                                timeTableRec.setValue('custrecord_da_amm_tt_time_to', timeTo);
                                timeTableRec.setValue('custrecord_da_amm_tt_student', studentId);
                                timeTableRec.setValue('custrecord_da_sub_tt_room_no', roomNo);
                              try{
                              //  timeTableRec.setValue('custrecord_da_amm_tt_event_id', eventId);
                              }catch(ex){
                                log.error(ex.name,ex.message);
                              }
                                timeTableRec.setValue('custrecord_da_student_enroll_no', enrollmentNo);
                                timeTableRec.setValue('custrecord_da_amm_tt_beauitician_name', result.getValue('custrecord_da_amm_tt_beauitician_name'));
                                var id = timeTableRec.save();
                            });
                              
                                //log.debug('id', id);
                                //event Creating
                                return true;
                            });
                        }
                    } else {
                        for (var i = 0; i < registeredStudents.length; i++) {
                            var index = 0;
                            var studentId = registeredStudents[i];
                            //log.debug('studentId', studentId);
                            var transactionSearchObj = search.create({
                                type: "transaction",
                                filters: [
                                    ["custbody_da_amm_so_batch", "anyof", batchId],
                                    "AND",
                                    ["name", "anyof", studentId],
                                    "AND",
                                    ["mainline", "is", "T"]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "internalid",
                                        label: "Internal ID"
                                    })
                                ]
                            });
                            var searchResultCount = transactionSearchObj.runPaged().count;
                            // log.debug("transactionSearchObj result count", searchResultCount);
                            var enrollmentNo;
                            transactionSearchObj.run().each(function(result) {
                                enrollmentNo = result.id
                                return true;
                            });
                            while (index < timeTableDates.length) {
                                // log.debug('date Val', timeTableDates[index]);
                                var timeTableRec = record.create({
                                    type: 'customrecord_da_amm_time_table_record',
                                    isDynamic: true
                                });
                                timeTableRec.setValue('custrecord_da_amm_tt_batch', batchId);
                                timeTableRec.setValue('custrecord_da_amm_tt_batch_subject', subjectId);
                                timeTableRec.setValue('custrecord_da_amm_tt_date', timeTableDates[index]);
                                timeTableRec.setValue('custrecord_da_amm_tt_student', studentId);
                                timeTableRec.setValue('custrecord_da_student_enroll_no', enrollmentNo);
                                timeTableRec.save();
                                var subjectRecord = record.load({
                                    type: 'customrecord_da_amm_batch_subjects',
                                    id: subjectId
                                });
                                var Beautician = subjectRecord.getValue('custrecord_da_amm_beauitician_name');
                                var beauticianName = subjectRecord.getText('custrecord_da_amm_beauitician_name');
                                if (Beautician && eventsCount == 0) {
                                    var eventRec = record.create({
                                        type: 'calendarevent',
                                        isDynamic: true
                                    });
                                    var timeFrom = subjectRecord.getValue('custrecord_da_amm_sub_time_from');
                                    timeFrom = format.parse({
                                        value: timeFrom,
                                        type: format.Type.TIMEOFDAY
                                    });
                                    var timeTo = subjectRecord.getValue('custrecord_da_amm_sub_time_to');
                                    timeTo = format.parse({
                                        value: timeTo,
                                        type: format.Type.TIMEOFDAY
                                    });
                                    var parsedDateStringAsRawDateObject = format.parse({
                                        value: timeTableDates[index],
                                        type: format.Type.DATE
                                    });
                                    var formattedDateString = format.format({
                                        value: parsedDateStringAsRawDateObject,
                                        type: format.Type.DATE
                                    });
                                    var title = formattedDateString + ":" + beauticianName + ":" + subjectRecord.getText('custrecord_da_amm_subject_name') + "(" + subjectRecord.getText('custrecord_da_amm_sub_time_from') + "--" + subjectRecord.getText('custrecord_da_amm_sub_time_to') + ")";
                                    log.debug('title', title);
                                    eventRec.setValue('title', title);
                                    // eventRec.setValue('title',subjectRecord.getText('custrecord_da_amm_subject_name'));
                                    eventRec.setValue('organizer', Beautician);
                                    eventRec.removeLine({
                                        sublistId: 'attendee',
                                        line: 0
                                    });
                                    eventRec.setValue('custevent_da_subject_ref', subjectId);
                                    eventRec.setValue('location', subjectRecord.getText('custrecord_da_subject_room_no'));
                                    eventRec.setValue('startdate', parsedDateStringAsRawDateObject);
                                    eventRec.setValue('starttime', timeFrom);
                                    eventRec.setValue('endtime', timeTo);
                                    eventRec.setValue('message', "Batch :" + subjectRecord.getText('custrecord_da_amm_batch_parent') + "; And Course : " + subjectRecord.getText('custrecord_da_batch_sub_course'));
                                    eventRec.selectNewLine({
                                        sublistId: 'attendee'
                                    });
                                    eventRec.setCurrentSublistValue({
                                        sublistId: 'attendee',
                                        fieldId: 'attendee',
                                        value: Beautician
                                    });
                                    eventRec.setCurrentSublistValue({
                                        sublistId: 'attendee',
                                        fieldId: 'response',
                                        value: "ACCEPTED"
                                    });
                                    eventRec.commitLine({
                                        sublistId: 'attendee'
                                    });
                                    eventRec.save();
                                }
                                index++;
                            }
                        }
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function calculateNoOfDays(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }

        function getDates(startDate, endDate) {
            var dates = [],
                currentDate = startDate,
                addDays = function(days) {
                    var date = new Date(this.valueOf());
                    date.setDate(date.getDate() + days);
                    return date;
                };
            while (currentDate <= endDate) {
                dates.push(currentDate);
                currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        };

        function getWeekDays(dDate1, dDate2, a) {
            if (dDate1 > dDate2) return false;
            var date = dDate1;
            var dates = [];
            while (date < dDate2) {
                // log.debug(a.indexOf(date.getDay()));
                if (a.indexOf(date.getDay()) != -1) dates.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
            return dates;
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {
                log.debug("Process Completed");
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