/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search','N/url'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search,url) {

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
                
                if(context.fieldId == 'custpage_ss_pagination'){

                    var index = context.currentRecord.getValue('custpage_ss_pagination');
                    var mobileNo = context.currentRecord.getValue('custpage_cust_mobile_no');
                	var itemSno = context.currentRecord.getValue('custpage_item_sno');
                	var invNo = context.currentRecord.getValue('custpage_inv_ref_no');
                    var output = url.resolveScript({
                        scriptId: 'customscript_da_su_job_cards_search',
                        deploymentId: 'customdeploy_da_su_job_cards_search',
                        returnExternalUrl: false,
                        params: {
                            startno: index,
                            mobileno: mobileNo,
                			itemsno : itemSno,
                			invNo : invNo
                        }

                    });
                    console.log(output);
                    if (window.onbeforeunload) {
                        window.onbeforeunload = function() {
                            null;
                        };
                    };
                    window.open(window.location.origin + '' + output, '_self');
                   

                
                }
                
                if (context.fieldId == 'custpage_cust_mobile_no' || context.fieldId == 'custpage_item_sno' || context.fieldId == 'custpage_inv_ref_no'){
                	var mobileNo = context.currentRecord.getValue('custpage_cust_mobile_no');
                	var itemSno = context.currentRecord.getValue('custpage_item_sno');
                	var invNo = context.currentRecord.getValue('custpage_inv_ref_no');
                	var output = url.resolveScript({
                		scriptId: 'customscript_da_su_job_cards_search',
                		deploymentId: 'customdeploy_da_su_job_cards_search',
                		returnExternalUrl: false,
                		params: {
                			mobileno: mobileNo,
                			itemsno : itemSno,
                			invNo : invNo
                			
                		}

                	});
                	console.log(output);
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
        		var numLines = scriptContext.currentRecord.getLineCount({
					sublistId: 'custpage_report_inv_sublist'
				});
        		var arr =[];
        		
        		var sno ;
				for(var k = 0;k<numLines;k++){
					var createCheckbox = scriptContext.currentRecord.getSublistValue({
					    sublistId: 'custpage_report_inv_sublist',
					    fieldId: 'custpage_create_job_card',
					    line: k
					});
					var itemSno = scriptContext.currentRecord.getSublistValue({
					    sublistId: 'custpage_report_inv_sublist',
					    fieldId: 'custpage_item_s_no',
					    line: k
					});
					if(createCheckbox){
						arr.push(k);
						sno = itemSno;
					}
				}
				console.log(arr.length);
				if(arr.length < 1){
					alert("Please select atleast One checkbox");
					return false;
				}
                if(arr.length > 1 ){
					alert("Please select Only One checkbox");
					return false;
				}
                
               // window.open(window.location.origin + '/app/common/custom/custrecordentry.nl?rectype=291&itemSno='+sno,'_self');
				
				return true;
        	}catch(ex){
        		console.log(ex.name,ex.message);
        	}
        	
        }
        
        function openNewJobCard(recordId){
        	
        	
        	
        	 window.open(window.location.origin + '/app/common/custom/custrecordentry.nl?rectype='+recordId+'','_self');
        }

        return {
            // pageInit : pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
             saveRecord: saveRecord,
             openNewJobCard :openNewJobCard
        };

    });