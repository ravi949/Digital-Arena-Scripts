/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search','N/url', 'N/format'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search,url,format) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is
         *            being accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */
        function pageInit(scriptContext) {
           
        }

        /**
         * Function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(context) {

            try {                
                
                
                
                if (context.fieldId == 'custpage_date'|| context.fieldId == 'custpage_customer_category' || context.fieldId == 'custpage_subsidiary'){
                    var dateField = context.currentRecord.getValue('custpage_date');
                    var customerCategory = context.currentRecord.getValue('custpage_customer_category');
                    var subsidiary = context.currentRecord.getValue('custpage_subsidiary');
                     var postingPeriodId ;
                   if(dateField){
                    var month = dateField.getMonth()+1;
                    log.debug('month',month);
                    var year = dateField.getFullYear();
                    log.debug('year',year);
                    var monthsobj = {
                            '1': 'Jan',
                            '2': 'Feb',
                            '3': 'Mar',
                            '4': 'Apr',
                            '5': 'May',
                            '6': 'Jun',
                            '7': 'Jul',
                            '8': 'Aug',
                            '9': 'Sep',
                            '10': 'Oct',
                            '11': 'Nov',
                            '12': 'Dec'
                    }
                    
                    var postingperiodMonth = monthsobj[month];
                    //log.debug(month, postingperiodMonth);
                    if(month == 0 || month == "0"){
                        year = year - 1;
                        postingperiodMonth ="Dec";
                    }
                    log.debug('postingperiodMonth',postingperiodMonth +" "+year);

                    var accountingperiodSearchObj = search.create({
                        type: "accountingperiod",
                        filters:
                            [
                                ["periodname","startswith",postingperiodMonth +" "+year]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "periodname",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        })
                                        ]
                    });
                    var searchResultCount = accountingperiodSearchObj.runPaged().count;
                    log.debug("accountingperiodSearchObj result count",searchResultCount);
                   
                    accountingperiodSearchObj.run().each(function(result){
                        postingPeriodId = result.id;
                        return true;
                    });
                }
                    log.debug('postingPeriodId',postingPeriodId);
                        var output = url.resolveScript({
                        scriptId: 'customscript_da_su_ecl_provision_calcula',
                        deploymentId: 'customdeploy_da_su_ecl_provision_calcula',
                        returnExternalUrl: false,
                        params: {
                            dateField: dateField,
                            postingPeriodId: postingPeriodId,
                            customerCategory: customerCategory,
                            subsidiary: subsidiary
                        }
                    });
                    console.log(output);
                 //   }
                  /*  else if(dateField ==  "")
                    {
                        alert('Please Enter value for Date');
                        return false;    
                        }*/
                    
                    if (window.onbeforeunload) {
                        window.onbeforeunload = function() {
                            null;
                        };
                    };
                    window.open(window.location.origin + '' + output, '_self');
                    
                }
                

            } catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        /**
         * Function to be executed when field is slaved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * 
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or
         * edited.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @returns {boolean} Return true if field is valid
         * 
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is
         * committed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         * 
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try{
                var dateField = scriptContext.currentRecord.getValue('custpage_date');
                     var postingPeriodId ;
                   if(dateField){
                    var month = dateField.getMonth()+1;
                    console.log('month',month);
                    var year = dateField.getFullYear();
                    console.log('year',year);
                    var monthsobj = {
                            '1': 'Jan',
                            '2': 'Feb',
                            '3': 'Mar',
                            '4': 'Apr',
                            '5': 'May',
                            '6': 'Jun',
                            '7': 'Jul',
                            '8': 'Aug',
                            '9': 'Sep',
                            '10': 'Oct',
                            '11': 'Nov',
                            '12': 'Dec'
                    }
                    
                    var postingperiodMonth = monthsobj[month];
                    //log.debug(month, postingperiodMonth);
                    if(month == 0 || month == "0"){
                        year = year - 1;
                        postingperiodMonth ="Dec";
                    }
                    console.log('postingperiodMonth',postingperiodMonth +" "+year);

                    var accountingperiodSearchObj = search.create({
                        type: "accountingperiod",
                        filters:
                            [
                                ["periodname","startswith",postingperiodMonth +" "+year]
                                ],
                                columns:
                                    [
                                        search.createColumn({
                                            name: "periodname",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        })
                                        ]
                    });
                    var searchResultCount = accountingperiodSearchObj.runPaged().count;
                    console.log("accountingperiodSearchObj result count",searchResultCount);
                   
                    accountingperiodSearchObj.run().each(function(result){
                        postingPeriodId = result.id;
                        return true;
                    });
                }
                    console.log('postingPeriodId',postingPeriodId);
                    var eclProvisionCalc = search.create({
                        type: "customrecord_da_ecl_provision_calculatio",
                        filters:
                            [
                                ["custrecord_da_ecl_calculation_as_of", "anyof", postingPeriodId]
                                ]
                    });
                    var count = eclProvisionCalc.runPaged().count;
                    console.log("eclProvisionCalc result count",count);
                    if(count > 0){
                        alert('There is already Provision records with this Posting Period');
                        return false;
                    } else {
                        return true;
                    }
                    
            }catch(ex){
                console.log(ex.name,ex.message);
            }
            
        }
        

        return {
             pageInit : pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });