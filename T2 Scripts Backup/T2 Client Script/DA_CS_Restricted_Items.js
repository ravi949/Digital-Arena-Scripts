/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/currentRecord', 'N/url', 'N/runtime', 'N/search'],

    function(record, currentRecord, url, runtime, search) {


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
         var restrictedItemsArray = [];
        function fieldChanged(scriptContext) {
            try {
                if(scriptContext.fieldId =="entity"){
                    var customerId = scriptContext.currentRecord.getValue('entity');
                    console.log('customerId',customerId);
                    restrictedItemsArray.length = [];
                    var restrictedItemSearch = search.create({
                    type: 'customrecord_da_restricted_items',
                    columns: [
                        'custrecord_da_blacklist_items'
                    ],
                    filters: ['custrecord204', 'anyof', customerId]
                });
                console.log('restrictedItemSearch count', restrictedItemSearch.runPaged().count);
                 restrictedItemSearch.run().each(function(result) {
                    var itemId = result.getValue('custrecord_da_blacklist_items');
                    console.log('itemId',itemId);
                    restrictedItemsArray.push(itemId);
                    console.log('restrictedItemsArray',restrictedItemsArray);
                    
                    return true;
                });
             }
             if(scriptContext.fieldId =="item"){
                 var item = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });
                    console.log('item',item);
                    console.log('array',restrictedItemsArray);
                    console.log('array length',restrictedItemsArray.length);
                    var arrayItem = restrictedItemsArray.includes(item);
                    console.log('arrayItem',arrayItem);
                    }
                 	if(arrayItem == true){
                    	alert('The Item you are selected are restricted for this customer');
                    	scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: "",
                        ignoreFieldChange: true
                    });
                    	return false;
                    	
                    } else {
                    	return true;
                    }
                    
                }
         catch (ex) {
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
            try {} catch (ex) {
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
        function saveRecord(scriptContext) {
            try {
                
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    });