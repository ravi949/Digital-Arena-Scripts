/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url', 'N/record'],
    function(search, url, record) {
        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        var mode, subsidiaryExists = false;

        function pageInit(scriptContext) {

          mode = scriptContext.mode;
          
          console.log(mode);

          if(mode == "create"){



          var recId = scriptContext.currentRecord.getValue('custbody_da_created_from_cust_pay');
          var rec = record.load({
            type :'customerpayment',
            id : recId
          });

          

                var journalRec = scriptContext.currentRecord;
                journalRec.setValue('subsidiary', rec.getValue('subsidiary'), false, true);

                var dept = rec.getValue('department');
                if(dept){
                  journalRec.setValue('department', dept);
                }
                var loc = rec.getValue('location');
                if(loc){
                  journalRec.setValue('location', loc);
                }
                journalRec.setValue('transtatus', "B");
                journalRec.setValue('custbody_da_created_from_cust_pay', recId);
                journalRec.setValue('trandate', new Date());
                
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
          
          if(scriptContext.fieldId == "subsidiary"){
              var recId = scriptContext.currentRecord.getValue('custbody_da_created_from_cust_pay');
              var customerpaymentSearchObj = search.create({
                    type: "customerpayment",
                    filters: [
                        ["type", "anyof", "CustPymt"],
                        "AND",
                        ["internalid", "anyof", recId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "ordertype",
                            sort: search.Sort.ASC,
                            label: "Order Type"
                        }),
                        search.createColumn({
                            name: "mainline",
                            label: "*"
                        }),
                        search.createColumn({
                            name: "trandate",
                            label: "Date"
                        }),
                        search.createColumn({
                            name: "asofdate",
                            label: "As-Of Date"
                        }),
                        search.createColumn({
                            name: "postingperiod",
                            label: "Period"
                        }),
                        search.createColumn({
                            name: "taxperiod",
                            label: "Tax Period"
                        }),
                        search.createColumn({
                            name: "type",
                            label: "Type"
                        }),
                        search.createColumn({
                            name: "tranid",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "entity",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "account",
                            label: "Account"
                        }),
                        search.createColumn({
                            name: "memo",
                            label: "Memo"
                        }),
                        search.createColumn({
                            name: "amount",
                            label: "Amount"
                        }),
                        search.createColumn({
                            name: "creditamount",
                            label: "Amount (Credit)"
                        }),
                        search.createColumn({
                            name: "debitamount",
                            label: "Amount (Debit)"
                        }),
                        search.createColumn({
                            name: "memo",
                            label: "Memo"
                        })
                    ]
                });
                var searchResultCount = customerpaymentSearchObj.runPaged().count;
                log.debug("customerpaymentSearchObj result count", searchResultCount);
            var journalRec = scriptContext.currentRecord;
            customerpaymentSearchObj.run().each(function(result) {

                    var amountDebit = result.getValue('debitamount');
                    var amountCredit = result.getValue('creditamount');

                    journalRec.selectNewLine({
                        sublistId: 'line'
                    });
                    journalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: result.getValue('account')
                    });
                    if (amountDebit > 0) {
                        journalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: amountDebit
                        });
                    }

                    if (amountCredit > 0) {
                        journalRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: amountCredit
                        });
                    }

                   journalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: result.getValue('entity')
                    });
                    journalRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: result.getValue('memo')
                    });
                    journalRec.commitLine({
                        sublistId: 'line'
                    });

                    return true;
                });
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
        function validateLine(scriptContext) {}
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
            try {
              return true;
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }
        return {
            pageInit: pageInit,
           // fieldChanged: fieldChanged,
                  postSourcing: postSourcing,
            //      sublistChanged: sublistChanged,
            //      lineInit: lineInit,
            //      validateField: validateField,
            //      validateLine: validateLine,
            //      validateInsert: validateInsert,
            //      validateDelete: validateDelete,
          //  saveRecord: saveRecord,
        };
    });