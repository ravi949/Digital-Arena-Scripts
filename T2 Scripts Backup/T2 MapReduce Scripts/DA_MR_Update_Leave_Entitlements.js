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
            try {
                return search.create({
                    type: 'employee',
                    columns: [
                        'internalid'
                    ],
                    filters: []
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
                var searchResult = JSON.parse(context.value);
                var values = searchResult.values;
                var empId = values.internalid.value;
                //
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
               var employeeId = JSON.parse(context.key);
              log.debug('EMpID',employeeId);
                var employeeRec = record.load({
          type:'employee',
          id : employeeId
        });
              var hireDate = employeeRec.getValue('hiredate');
              var date = new Date();
              var tomorrow = new Date(date.setDate(date.getDate() + 1));
              var days = date_diff_indays(hireDate, date);
              log.debug(days);
              if(days == 1825){
                var leaveEntSearch = search.create({
                    type: 'customrecord_da_emp_leaves_entitlement',
                    columns: [
                        'internalid'
                    ],
                    filter: ['custrecord_da_leave_entitlement_employee', 'anyof', employeeId]
                });
                var leaveEntSearchId;
                leaveEntSearch.run().each(function(result) {
                    leaveEntSearchId = result.id;
                    return true;
                });
                var leaveEntRec = record.load({
                  type:'customrecord_da_emp_leaves_entitlement',
                  id : leaveEntSearchId
                });
                leaveEntRec.setValue('custrecord_da_leave_entitlement_edate',new Date());
                leaveEntRec.save();
                var newLeaveEntRec = record.create({
                   type : 'customrecord_da_emp_leaves_entitlement',
                   isDynamic : true
                });
                newLeaveEntRec.setValue('custrecord_da_leave_entitlement_employee',employeeId);
                newLeaveEntRec.setValue('custrecord_da_leave_entitlement_sdate',tomorrow);
                newLeaveEntRec.setValue('custrecord_da_leave_entitlement_value',30);
              newLeaveEntRec.save();
              }
              
               // employeeRec.save();
            } catch (ex) {
                log.error(ex.name, ex.message);

            }
        }
        var date_diff_indays = function(date1, date2) {
            dt1 = new Date(date1);
            dt2 = new Date(date2);
            return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
        }
        // example usage
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

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });