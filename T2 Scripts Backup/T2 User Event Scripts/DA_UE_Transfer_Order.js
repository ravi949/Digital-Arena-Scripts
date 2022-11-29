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
                var type = scriptContext.type;
                var recId = scriptContext.id;
                
                var prodSettingsRec = record.load({
                type: 'customrecord_da_production_settings',
                id: 1 
            });
            var fromLocation = prodSettingsRec.getValue('custrecord_da_prod_plan_location');
            log.debug('fromLocation',fromLocation);
            scriptContext.newRecord.setValue('subsidiary',1);
            scriptContext.newRecord.setValue('location',fromLocation);
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
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });