/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],

    function(record, search, runtime, format) {

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
            //Getting payrun scheduling record with filter processing checkbox is true
            try {
                log.debug('mapreduce script triggered');
                return search.create({
                    type: "customrecord_da_projects_timesheet",
                    filters: [
                        ["custrecord_da_timesheet_integrated", "is", "F"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_timesheet_employee",
                            label: "Employee"
                        }),
                        search.createColumn({
                            name: "custrecord_da_timesheet_project",
                            label: "Project"
                        }),
                        search.createColumn({
                            name: "custrecord_da_timesheet_location",
                            label: "Location"
                        }),
                        search.createColumn({
                            name: "custrecord_da_timesheet_date",
                            label: "Date"
                        }),
                        search.createColumn({
                            name: "custrecord_da_timesheet_hours",
                            label: "Hours"
                        })
                    ]
                });
            } catch (ex) {
                log.error(ex.name, ex.message);
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
                log.debug('map context', context.key);
                context.write({
                    key: context.key,
                    value: context.key
                });
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
                var recId = JSON.parse(context.key);
                log.debug('recId', recId);

                var projTimesheet = record.load({
                    type: 'customrecord_da_projects_timesheet',
                    id: recId
                });
                var employee = projTimesheet.getValue('custrecord_da_timesheet_employee');
                var project = projTimesheet.getValue('custrecord_da_timesheet_project');
                var location = projTimesheet.getValue('custrecord_da_timesheet_location');
                var date = projTimesheet.getValue('custrecord_da_timesheet_date');
                var hrs = projTimesheet.getValue('custrecord_da_timesheet_hours');
                hrs = hrs.toString();
                log.debug(hrs);


                //  var splitTime1 = hrs.split(':');
                var totaltimehrs = hrs.split(':')[0];
                totaltimehrs = totaltimehrs.split(' ')[4];
                log.debug('totaltimehrs', totaltimehrs.split(' ')[4]);
                var totaltimemns = hrs.split(':')[1];
                log.debug('totaltimemns', totaltimemns);
                if (totaltimemns < 10) {
                    totaltimemns = "0" + totaltimemns;
                }
                var totalTime = time_convert(parseFloat(totaltimehrs * 60) + parseFloat(totaltimemns));
                log.debug('totalTime', totalTime);

                var day = new Date(date).getDay();


                day = parseFloat(day) + parseFloat(1);


                var standardtimeSheet = record.create({
                    type: 'timesheet',
                    isDynamic: true
                });
                standardtimeSheet.setValue('employee', employee);
                standardtimeSheet.setValue('startdate', new Date(date));
                var id = standardtimeSheet.save();
                log.debug('id', id);
                var standardtimeSheet = record.load({
                    type: 'timesheet',
                    id: id,
                    isDynamic: true
                });
                var lineNum = standardtimeSheet.selectNewLine({
                    sublistId: 'timeitem'
                });
                standardtimeSheet.setCurrentSublistValue({
                    sublistId: 'timeitem',
                    fieldId: 'customer',
                    value: project,
                    ignoreFieldChange: true
                });
                if (location) {
                    standardtimeSheet.setCurrentSublistValue({
                        sublistId: 'timeitem',
                        fieldId: 'location',
                        value: location,
                        ignoreFieldChange: true
                    });
                }
                standardtimeSheet.setCurrentSublistValue({
                    sublistId: 'timeitem',
                    fieldId: 'item',
                    value: 10,
                    ignoreFieldChange: true
                });
                log.debug('dayyy', day);
                standardtimeSheet.setCurrentSublistValue({
                    sublistId: 'timeitem',
                    fieldId: 'hours' + day,
                    value: totalTime,
                    ignoreFieldChange: true
                });
                standardtimeSheet.setCurrentSublistValue({
                    sublistId: 'timeitem',
                    fieldId: 'hourstotal',
                    value: totalTime,
                    ignoreFieldChange: true
                });
                standardtimeSheet.commitLine({
                    sublistId: 'timeitem'
                });
                var id = standardtimeSheet.save();
                var id = record.submitFields({
                    type: 'customrecord_da_projects_timesheet',
                    id: recId,
                    values: {
                        'custrecord_da_timesheet_integrated': true
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });


            } catch (ex) {
                log.error(ex.name, ex.message);

            }
        }



        function time_convert(num) {

            return (num / 60).toFixed(2);
        }

        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
            try {


            } catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });