/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],
    function(task, search, record) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
              log.debug('safs');
scriptContext.newRecord.setValue('custbody70', true);
                //intercomapny
                var recId = scriptContext.newRecord.id;
              var employeeId = scriptContext.newRecord.getValue('custbody_da_ic_paycheck_employee');
              var dept = record.load({
                type :'employee',
                id : employeeId
              }).getValue('department');

              scriptContext.newRecord.setValue('department', dept);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });