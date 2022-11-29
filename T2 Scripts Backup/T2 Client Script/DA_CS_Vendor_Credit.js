/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record', 'N/format', 'N/currentRecord'],

    function(search, record, format, currentRecord) {


        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */

        function pageInit(scriptContext) {
            try {

                var recId = scriptContext.currentRecord.getValue('custbody_da_bill_payment_ref');
                console.log('recId', recId);
                var billPaymentRec = record.load({
                    type: 'customerpayment',
                    id: recId
                });
                var vendor = billPaymentRec.getValue('customer');
                console.log('vendor', vendor);
                var account = billPaymentRec.getValue('account');
                console.log('account', account);
                var subsidiary = billPaymentRec.getValue('subsidiary');
                console.log('subsidiary', subsidiary);
                var department = billPaymentRec.getValue('department');
                console.log('department', department);
                var classId = billPaymentRec.getValue('class');
                console.log('classId', classId);
                var location = billPaymentRec.getValue('location');
                console.log('location', location);
                //scriptContext.currentRecord.setValue('entity', vendor);
                scriptContext.currentRecord.setValue('account', account);
                scriptContext.currentRecord.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary,
                    forceSyncSourcing: true
                });
                scriptContext.currentRecord.setValue('department', department);
                scriptContext.currentRecord.setValue('class', classId);
                scriptContext.currentRecord.setValue('location', location);

                var billPaymentAmount = billPaymentRec.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'amount',
                    line: 0
                });
                console.log('billPaymentAmount', billPaymentAmount);
                var claimSettings = search.create({
                    type: "customrecord_da_claim_settings",
                    filters: [
                        ["custrecord_da_claim_subsidiary", 'anyof', subsidiary]
                    ],
                    columns: ['custrecord_da_claim_item_']
                });
                var searchCount = claimSettings.runPaged().count;
                console.log("claimSettings result count", searchCount);
                claimSettings.run().each(function(result) {
                    var itemId = result.getValue("custrecord_da_claim_item_");
                    console.log('itemId', itemId);
                    scriptContext.currentRecord.selectNewLine({
                        sublistId: 'item'
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: itemId,
                        forceSyncSourcing: true
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: '1'
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: billPaymentAmount
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: billPaymentAmount
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        value: location
                    });
                    scriptContext.currentRecord.commitLine({
                        sublistId: 'item'
                    });
                    return true;
                });


            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed when field is changed.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try {


            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRec(scriptContext) {
            try {

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }


        return {
            pageInit: pageInit,
            //fieldChanged: fieldChanged,
            //postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            //saveRecord: saveRecord

        };

    });