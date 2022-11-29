/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/ui/serverWidget', 'N/record'],
    function(search, serverWidget, record) {
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
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters: [
                        ["type", "anyof", "CustInvc"],
                        "AND",
                        ["custbody_da_linked_to_pdc", "anyof", scriptContext.newRecord.id],
                     	 "AND", 
     					 ["mainline","is","T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = invoiceSearchObj.runPaged().count;
                log.debug("invoiceSearchObj result count", searchResultCount);
                invoiceSearchObj.run().each(function(result) {
                    record.submitFields({
                        type: 'invoice',
                        id: result.id,
                        values: {
                            'custbody_da_linked_to_pdc': ''
                        },
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                    return true;
                });
                var invoiceIds = scriptContext.newRecord.getValue('custbody_da_pdc_open_invoices');
                log.debug('invoiceIds', invoiceIds);
                for (var i = 0; i < invoiceIds.length; i++) {
                    var invoiceId = invoiceIds[i];
                    record.submitFields({
                        type: 'invoice',
                        id: invoiceId,
                        values: {
                            'custbody_da_linked_to_pdc': scriptContext.newRecord.id
                        },
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            beforeLoad: beforeLoad,
            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });