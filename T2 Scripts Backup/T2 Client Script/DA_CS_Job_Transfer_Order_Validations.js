/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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
            	if(context.fieldId == 'custpage_from_location'){
            		var location = scriptContext.currentRecord.getCurrentSublistValue({
    					sublistId: 'custpage_report_data_sublist',
    					fieldId: 'custpage_from_location'
    				});
            		var itemId = scriptContext.currentRecord.getCurrentSublistValue({
    					sublistId: 'custpage_report_data_sublist',
    					fieldId: 'custpage_job_item'
    				});
            		var itemSearchObj = search.create({
    					type: "item",
    					filters:
    						[
    							["internalid","anyof",itemId],"AND",["inventorylocation.internalid","anyof",location]
    							],
    							columns:
    								[					     
    									search.createColumn({name: "displayname", label: "Display Name"}),
    									search.createColumn({name: "locationquantityavailable", label: "Location Available"})
    								]
    				});
            		
            		itemSearchObj.run().each(function(result){
						scriptContext.currentRecord.setCurrentSublistValue({
							sublistId: 'custpage_report_data_sublist',
							fieldId: 'custpage_avail_qty',
							value: (result.getValue('locationquantityavailable'))?result.getValue('locationquantityavailable'):0,
							ignoreFieldChange: true
						});
					});
            	}
            	
            	if(context.fieldId == 'custpage_serial_no'){
            		var itemId = scriptContext.currentRecord.getCurrentSublistValue({
    					sublistId: 'custpage_report_data_sublist',
    					fieldId: 'custpage_job_item'
    				});
            		var workShopLocation = scriptContext.currentRecord.getCurrentSublistValue({
    					sublistId: 'custpage_report_data_sublist',
    					fieldId: 'custpage_from_location'
    				});
            		var enterSerialNo = scriptContext.currentRecord.getCurrentSublistValue({
    					sublistId: 'custpage_report_data_sublist',
    					fieldId: 'custpage_serial_no'
    				});
            		
            		var inventorynumberSearchObj = search.create({
						type: "inventorynumber",
						filters:
							[
								["item.internalid","anyof",itemId], 
								"AND", 
								["quantityonhand","greaterthan","0"], 
								"AND", 
								["location","anyof",workShopLocation]
								],
								columns:
									[
										search.createColumn({
											name: "inventorynumber",
											sort: search.Sort.ASC,
											label: "Number"
										})
										]
					});

					var serialNoArr = {};
					var searchResultCount = inventorynumberSearchObj.runPaged().count;
					log.debug("inventorynumberSearchObj result count",searchResultCount);
					inventorynumberSearchObj.run().each(function(result){
						var serialNo = result.getValue('inventorynumber').toUpperCase();
						serialNoArr[serialNo] = result.id;
						return true;
					});

					enterSerialNo = enterSerialNo.toUpperCase();

					console.log('serialNoArr',serialNoArr);
					// var key;
					
					var found = false;

					Object.keys(serialNoArr).forEach(function (k) {
						if(k == enterSerialNo){
							console.log(k, serialNoArr[k]);
							 scriptContext.currentRecord.setCurrentSublistValue({
								 sublistId: 'custpage_report_data_sublist',
								 fieldId: 'cupage_serial_no_id',
								 value:serialNoArr[k]
							 });
							 found = true;
						}
					});
					
					if(!found){
						alert('Sorry you entered wrong serial No');
					}
            	}
                
                if(context.fieldId == 'custpage_ss_pagination'){

                	var techinicianId = context.currentRecord.getValue('custpage_technician');
                	var jobCardId = context.currentRecord.getValue('custpage_job_card_id');
                	var itemId = context.currentRecord.getValue('custpage_item_id');
                	var output = url.resolveScript({
                		scriptId: 'customscript_da_su_job_items_transfer',
                		deploymentId: 'customdeploy_da_su_job_items_transfer',
                		returnExternalUrl: false,
                		params: {
                			technician: techinicianId,
                			jobcardid : jobCardId,
                			item : itemId
                		}

                	});
                    console.log(output);                   
                    window.open(window.location.origin + '' + output, '_self'); 
                }
                
                if (context.fieldId == 'custpage_technician' || context.fieldId == 'custpage_job_card_id' || context.fieldId == 'custpage_item_id'){
                	var techinicianId = context.currentRecord.getValue('custpage_technician');
                	var jobCardId = context.currentRecord.getValue('custpage_job_card_id');
                	var itemId = context.currentRecord.getValue('custpage_item_id');
                	var output = url.resolveScript({
                		scriptId: 'customscript_da_su_job_items_transfer',
                		deploymentId: 'customdeploy_da_su_job_items_transfer',
                		returnExternalUrl: false,
                		params: {
                			technician: techinicianId,
                			jobcardid : jobCardId,
                			item : itemId
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
             lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
             saveRecord: saveRecord,
             openNewJobCard :openNewJobCard
        };

    });	