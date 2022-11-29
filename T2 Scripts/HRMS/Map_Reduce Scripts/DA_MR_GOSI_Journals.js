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
                   
                        ["isinactive", "is", "F"],
                        "AND",
                        ["custentity_da_gosi_total_amount", "greaterthan", "0"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "subsidiary",
                            label: "subsidiary"
                        }),
                        search.createColumn({
                            name: "custentity_da_gosi_total_amount",
                            label: "GOSI Amount"
                        }),
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
                var empSubsidiary = searchResult.values.subsidiary.value;
                var empGOSIAmount = searchResult.values.custentity_da_gosi_total_amount;
                context.write({
                    key: empId,
                    value: {
                        empSubsidiary: empSubsidiary,
                        empGOSIAmount: empGOSIAmount
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
                var empSubsidiary = data.empSubsidiary;
                var empGOSIAmount = data.empGOSIAmount;
                var recid = runtime.getCurrentScript().getParameter({
                    name: 'custscript_da_params_rec_id'
                });
               var date = record.load({
                    type: 'customrecord_da_run_gosi_jounrals',
                    id: recid
                }).getValue('custrecord_da_gosi_jounral_date');

                log.debug('details', empId+"empSubsidiary"+ empSubsidiary +"empGOSIAmount"+ empGOSIAmount);

                var customrecord_da_gosi_informationSearchObj = search.create({
                   type: "customrecord_da_gosi_information",
                   filters:
                   [
                      ["custrecord_da_gosi_subsidiary","anyof",empSubsidiary]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_gosi_subsidiary", label: "Subsidiary"}),
                      search.createColumn({name: "custrecord_da_dr_gosi_account", label: "Dr GOSI Account"}),
                      search.createColumn({name: "custrecord_da_cr_gosi_account", label: "CR Gosi Account"})
                   ]
                });
                var searchResultCount = customrecord_da_gosi_informationSearchObj.runPaged().count;
                log.debug("customrecord_da_gosi_informationSearchObj result count",searchResultCount);

                var debitAccount , creditAccount;
                customrecord_da_gosi_informationSearchObj.run().each(function(result){
                   debitAccount = result.getValue('custrecord_da_dr_gosi_account');
                   creditAccount = result.getValue('custrecord_da_cr_gosi_account');
                   return true;
                });

                 var GOSIJounralRec = record.create({
                        type: "customtransaction_da_gosi_jounrals",
                        isDynamic: true
                    });
              GOSIJounralRec.setValue('trandate', date);
                  GOSIJounralRec.setValue('subsidiary', empSubsidiary);

                   GOSIJounralRec.selectNewLine({
                        sublistId: 'line'
                    });
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: debitAccount
                    });
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: empGOSIAmount
                    });
                   /* GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: empId
                    });*/
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: "GOSI Amount"
                    });
                    GOSIJounralRec.commitLine({
                        sublistId: 'line'
                    });
                    GOSIJounralRec.selectNewLine({
                        sublistId: 'line'
                    });
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: creditAccount
                    });
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: empGOSIAmount
                    });
                    /* GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: empId
                    });*/
                    GOSIJounralRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: "GOSI Amount"
                    });
                    GOSIJounralRec.commitLine({
                        sublistId: 'line'
                    });
                    GOSIJounralRec.save();
              
               
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