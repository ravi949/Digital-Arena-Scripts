/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record'],
    function(message, serverWidget, search, runtime, record) {
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {
                if (scriptContext.type == 'view') {
                    var status = scriptContext.newRecord.getValue('custrecord_da_amm_setup_batch_status_1');
                    if (status == 1) {
                        var s = search.create({
                            type: "customrecordtype",
                            filters: [
                                ["scriptid", "is", "customrecord_da_amm_batch_subjects"]
                            ],
                            columns: ["name", "scriptid"]
                        }).run().getRange(0, 1);
                        var recordId = s[0].id;
                        log.debug(s[0].id);
                        scriptContext.form.addButton({
                            id: 'custpage_prepare_time_schedule',
                            label: 'Prepare Time Schedule',
                            functionName: 'openSubjectRecords("' + recordId + '",' +scriptContext.newRecord.id + ')'
                        });
                        scriptContext.form.clientScriptModulePath = './DA_CS_Setup_Batch.js';
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            log.debug('beforeSubmit', 'beforeSubmit');
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {
               
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
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });