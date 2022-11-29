/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/currentRecord', 'N/url', 'N/format'],

    function(record, currentRecord, url, format) {


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
        function saveRecord(scriptContext) {
            try {
                var selectedDatesArray = [];
                var remainingDatesArray = [];
                var monthsDiff = [];
                var tranDate = scriptContext.currentRecord.getValue('trandate');
                console.log('tranDate',tranDate);
                var tranDateYear = tranDate.getFullYear();
                console.log('tranDateYear',tranDateYear);
                var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'apply'
                        });
                console.log('numLines', numLines);
                

                for(var j = 0; j < numLines; j++){
                    var applyField = scriptContext.currentRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: j
                            });
                        console.log('applyField',applyField);
                        
                        if(applyField){
                        var selectedDate = scriptContext.currentRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'applydate',
                            line: j
                        });
                        console.log('selectedDate',selectedDate);
                        
                        selectedDatesArray.push(selectedDate);
                        console.log('selectedDatesArray',selectedDatesArray);
                        
                       
                       /*var selectedDateYear = selectedDate.getFullYear();
                        console.log('selectedDateYear',selectedDateYear);
                        if(tranDateYear != selectedDateYear){
                            alert('Bill date must match the transaction date');
                            return false;
                        } else{
                            return true;
                        }*/
                       } else {
                        var remainingDate = scriptContext.currentRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'applydate',
                            line: j
                        });
                        console.log('remainingDate',remainingDate);
                        
                        remainingDatesArray.push(remainingDate);
                        console.log('remainingDatesArray',remainingDatesArray);
                       }
                }
               
                for(var k = 0; k < remainingDatesArray.length; k++){
                    for(var l = 0; l < selectedDatesArray.length; l++){
                        if(remainingDatesArray[k] <= selectedDatesArray[l]){
                            if(remainingDatesArray[k] > 0){
                                monthsDiff.push(remainingDatesArray[k]);
                            }
                        }
                    }
                }
                    console.log('monthsDiff',monthsDiff);
                    var monthsDiffLength = monthsDiff.length;
                    console.log('monthsDiffLength',monthsDiffLength);
                        if(monthsDiffLength > 0){
                        alert('Please select the Bill');
                            return false;
                        } else {
                            return true;
                        }
                    
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            //fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
             saveRecord: saveRecord
        };

    });