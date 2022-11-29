/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
    function(search, record) {
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
                console.log(ex.error, ex.message);
            }
        }
        /**
         * Function to be executed when field is changed.
         *
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
               if(scriptContext.fieldId == 'quantity' || scriptContext.fieldId == 'item'){
                var location = scriptContext.currentRecord.getValue('location');
                console.log(location);
                 scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId : 'item',
                  fieldId : 'inventorylocation',
                   value : location
                });
                
              }
              
              
              if(scriptContext.fieldId == 'custbody_da_custcredit'){
                var customerId = scriptContext.currentRecord.getValue('entity');
                var contractAmount = 0;
                 var invoiceSearchObj = search.create({
                     type: "invoice",
                     filters:
                     [
                        ["mainline","is","T"], 
                        "AND", 
                        ["type","anyof","CustInvc"], 
                        "AND", 
                        ["status","anyof","CustInvc:A"], 
                        "AND", 
                        ["custbody_da_contract","is","T"], 
                        "AND", 
                        ["name","anyof",customerId]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "amountremaining",
                           summary: "SUM",
                           label: "Amount Remaining"
                        })
                     ]
                  });
                  var searchResultCount = invoiceSearchObj.runPaged().count;
                  log.debug("invoiceSearchObj result count",searchResultCount);
                  invoiceSearchObj.run().each(function(result){
                     contractAmount = result.getValue({
                       name :'amountremaining',
                       summary: search.Summary.SUM
                     });
                     return true;
                  });
                var creditLimit = scriptContext.currentRecord.getValue('custbody_da_custcredit');
               var balance = scriptContext.currentRecord.getValue('balance');
                console.log(creditLimit);
                console.log(balance);
                console.log(contractAmount);
                
                if(!contractAmount){
                  contractAmount = 0;
                }
                
                var availCredit = parseFloat(creditLimit) - (parseFloat(balance) - parseFloat(contractAmount));
                
                scriptContext.currentRecord.setValue('custbody_da_custcreditbal', availCredit);
                
                 }
              
             
                if (scriptContext.fieldId == 'custbody_da_amm_so_batch') {
                    var batchId = scriptContext.currentRecord.getValue('custbody_da_amm_so_batch');
                    if (batchId) {
                        var numLines = scriptContext.currentRecord.getLineCount({
                            sublistId: 'item'
                        });
                        for (var i = numLines - 1; i >= 0; i--) {
                            scriptContext.currentRecord.removeLine({
                                sublistId: 'item',
                                line: i,
                                ignoreRecalc: true
                            });
                        }
                        var customrecord_da_amm_batch_subjectsSearchObj = search.create({
                            type: "customrecord_da_amm_batch_subjects",
                            filters: [
                                ["custrecord_da_amm_batch_parent", "anyof", batchId]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "id",
                                    sort: search.Sort.ASC,
                                    label: "ID"
                                })
                            ]
                        });
                        var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
                        log.debug("customrecord_da_amm_batch_subjectsSearchObj result count", searchResultCount);
                        customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result) {
                            scriptContext.currentRecord.selectNewLine({
                                sublistId: 'item'
                            });
                            scriptContext.currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_da_amm_sub_ref',
                                value: result.id,
                                ignoreFieldChange: false,
                                forceSyncSourcing: true
                            });
                            var amount = scriptContext.currentRecord.getCurrentSublistValue({
                                sublistId:'item',
                                fieldId:'amount'
                            });
                            console.log(amount);
                            if(!amount){
                                scriptContext.currentRecord.setCurrentSublistValue({
                                    sublistId:'item',
                                    fieldId:'amount',
                                    value: 1
                                })
                            }
                            scriptContext.currentRecord.commitLine({
                                sublistId: 'item'
                            });
                            return true;
                        });
                    }
                }
                if (scriptContext.fieldId == 'custcol_da_amm_sub_ref') {
                    var subjectId = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_da_amm_sub_ref'
                    });
                    var lookup = search.lookupFields({
                        type: 'customrecord_da_amm_batch_subjects',
                        id: subjectId,
                        columns: ['custrecord_da_amm_subject_name', 'custrecord_da_amm_subject_qauntity']
                    });
                    var subjectId = lookup.custrecord_da_amm_subject_name[0].value;
                    var qty = lookup.custrecord_da_amm_subject_qauntity;
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: subjectId,
                        ignoreFieldChange: false,
                        forceSyncSourcing: true
                    });
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: qty,
                        ignoreFieldChange: false,
                        forceSyncSourcing: true
                    });
                }
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord -. Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {
            try {
              
              if(scriptContext.fieldId == 'quantity' || scriptContext.fieldId == 'item'){
                var location = scriptContext.currentRecord.getValue('location');
                console.log(location);
                 scriptContext.currentRecord.setCurrentSublistValue({
                  sublistId : 'item',
                  fieldId : 'inventorylocation',
                   value : location
                });
                
              }
              
               if(scriptContext.fieldId == 'custbody_da_custcredit'){
                var customerId = scriptContext.currentRecord.getValue('entity');
                var contractAmount = 0;
                 var invoiceSearchObj = search.create({
                     type: "invoice",
                     filters:
                     [
                        ["mainline","is","T"], 
                        "AND", 
                        ["type","anyof","CustInvc"], 
                        "AND", 
                        ["status","anyof","CustInvc:A"], 
                        "AND", 
                        ["custbody_da_contract","is","T"], 
                        "AND", 
                        ["name","anyof",customerId]
                     ],
                     columns:
                     [
                        search.createColumn({
                           name: "amountremaining",
                           summary: "SUM",
                           label: "Amount Remaining"
                        })
                     ]
                  });
                  var searchResultCount = invoiceSearchObj.runPaged().count;
                  log.debug("invoiceSearchObj result count",searchResultCount);
                  invoiceSearchObj.run().each(function(result){
                     contractAmount = result.getValue({
                       name :'amountremaining',
                       summary: search.Summary.SUM
                     });
                     return true;
                  });
                var creditLimit = scriptContext.currentRecord.getValue('custbody_da_custcredit');
               var balance = scriptContext.currentRecord.getValue('balance');
                console.log(creditLimit);
                console.log(balance);
                console.log(contractAmount);
                
                
                 }
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
        function sublistChanged(scriptContext) {}
        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {}
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
        function validateField(scriptContext) {}
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
            try {} catch (ex) {
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
        function validateInsert(scriptContext) {}
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
        function validateDelete(scriptContext) {}
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
            try {} catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
                postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            //lineInit: lineInit,
            //      validateField: validateField,
            //validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
            //saveRecord: saveRecord,
            //   openSubjectRecords:openSubjectRecords,
        };
    });