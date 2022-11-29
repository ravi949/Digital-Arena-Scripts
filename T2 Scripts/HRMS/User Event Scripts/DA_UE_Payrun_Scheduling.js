/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget','N/search','N/runtime','N/record'],

		function(message,serverWidget,search,runtime,record) {

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
		try{ 
          var userObj = runtime.getCurrentUser();
          var role = userObj.role;
          log.debug('role', role);
			if(scriptContext.type == 'create'){
				var payrunItemsSublist = scriptContext.form.getSublist({
					id : 'recmachcustrecord_da_pay_run_scheduling'
				});
				payrunItemsSublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
			}
			
			if(scriptContext.type == 'edit'){	
				//create an inline html field
				var hideFld = scriptContext.form.addField({
					id:'custpage_hide_buttons',
					label:'not shown - hidden',
					type: serverWidget.FieldType.INLINEHTML
				});

				//for every button you want to hide, modify the scr += line
				var scr = "";
				scr += 'jQuery("#newrec102").hide();';
				//scr += 'jQuery("#recmachcustrecord_issue_material_child_remove").hide();';
				//push the script into the field so that it fires and does its handy work
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"				


				var frequency = scriptContext.form.getSublist({id: 'recmachcustrecord_da_pay_run_scheduling'}).getField({id: 'custrecord_da_frequencynew'});

				var sublist_month = scriptContext.form.getSublist({id: 'recmachcustrecord_da_pay_run_scheduling'}).getField({id: 'custrecord_da_sublist_month'});

				var leaveid = scriptContext.form.getSublist({id: 'recmachcustrecord_da_pay_run_scheduling'}).getField({id: 'custrecord_da_leave_record_id'});

				frequency.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				leaveid.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
				sublist_month.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});

				var status = scriptContext.newRecord.getValue('custrecord_da_sch_approval_status');
				/*if (status == 2) {
					var contextType = runtime.executionContext;
					var userObj = runtime.getCurrentUser();
					var role = userObj.role;
					if (role != 1002 && contextType == 'USERINTERFACE') {
						throw {
							error: 'Permission Error',
							message: " Sorry, You dont have permission to edit the approved payroll"
						};
					}
				}*/
			}
			if(scriptContext.type == 'view'){	
				var hideFld = scriptContext.form.addField({
					id:'custpage_hide_buttons',
					label:'not shown - hidden',
					type: serverWidget.FieldType.INLINEHTML
				});

				//for every button you want to hide, modify the scr += line
				var scr = "";
				scr += 'jQuery("#EDIT_CUST_201").hide();';
				hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"				
				//push the script into the field so that it fires and does its handy work
			}

			var processing = scriptContext.newRecord.getValue('custrecord_da_sch_payrun_processing');
			if(processing){
				var msgText = message.create({
					title: "Process is in Progress", 
					message: "You will be notified by email once the process is completed, Thank You!",  
					type: message.Type.INFORMATION
				});
				scriptContext.form.addPageInitMessage({message: msgText});
			}
          
          var processing = scriptContext.newRecord.getValue('custrecord_creating_paycheck_jounrals');
			if(processing){
				var msgText = message.create({
					title: "Please Wait", 
					message: "While the system is calculating the paycheck journals",  
					type: message.Type.INFORMATION
				});
				scriptContext.form.addPageInitMessage({message: msgText});
			}

			//Button adding for report
			
			if(scriptContext.newRecord.getValue('custrecord_da_sch_pay_run_processed') && scriptContext.type == 'view'){
				/*scriptContext.form.addButton({
					id : 'custpage_reportbutton',
					label : 'Detail Report',
					functionName:'generatereport('+scriptContext.newRecord.id+')'
				});*/
              if(true){
                scriptContext.form.addButton({
					id : 'custpage_reportbutton',
					label : 'Summary Report',
					functionName:'generatesummaryreport('+scriptContext.newRecord.id+')'
				});  
              }
				            
				scriptContext.form.clientScriptModulePath = './DA_CS_Payrun_Scheduling.js';
			}

		}catch(ex){
			log.error(ex.name,ex.message);
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
      
      try{
          		var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
        
        if(featureEnabled){
          
          var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_payroll_subsidiary');
          var customrecord_da_general_settingsSearchObj = search.create({
             type: "customrecord_da_general_settings",
             filters:
             [
                ["custrecord_da_settings_subsidiary","anyof",subsidiaryId]
             ],
             columns:
             [
             ]
          });
          var searchResultCount = customrecord_da_general_settingsSearchObj.runPaged().count;
          log.debug("customrecord_da_general_settingsSearchObj result count",searchResultCount);
          customrecord_da_general_settingsSearchObj.run().each(function(result){
             scriptContext.newRecord.setValue('custrecord_da_payroll_general_setting_id', result.id);
             //return true;
          });
          
        }else{
          scriptContext.newRecord.setValue('custrecord_da_payroll_general_setting_id', 1);
        }
      }catch(ex){
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
	function afterSubmit(scriptContext) {
		try{
			//setting employees list
			var customrecord_da_pay_run_itemsSearchObj = search.create({
				type: "customrecord_da_pay_run_items",
				filters: [
					["custrecord_da_pay_run_scheduling", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						}),
						search.createColumn({
							name: 'custrecord_da_pay_run_employee'
						})
						]
			});
			var arr = [];
			var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
			customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
				log.debug('Emppppid', result.getValue('custrecord_da_pay_run_employee'));
				arr.push(result.getValue('custrecord_da_pay_run_employee'));
				return true;
			});
			log.debug('arr', arr);
			var empArr = removeDuplicateUsingFilter(arr);

			log.debug('empArr', empArr);


			//getting the total line amount
			var customrecord_da_pay_run_itemsSearchObj = search.create({
				type: "customrecord_da_pay_run_items",
				filters: [
					["custrecord_da_pay_run_scheduling", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_pay_run_ded_amount",
							summary: "SUM",
							label: "Deducted Amount"
						})
						]
			});
			var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
			var total = 0;
			customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
				log.debug(result.getValue({
					name: 'custrecord_da_pay_run_ded_amount',
					summary: search.Summary.SUM
				}));
				total = result.getValue({
					name: 'custrecord_da_pay_run_ded_amount',
					summary: search.Summary.SUM
				});
				return true;
			});
			var payrunSchRecord = record.load({
				type: 'customrecord_da_pay_run_scheduling',
				id: scriptContext.newRecord.id,
				isDynamic: true
			});
			payrunSchRecord.setValue('custrecord_payrun_total_amount', Math.round(total));
			payrunSchRecord.setValue('custrecord_da_sch_pay_run_emplist',JSON.stringify(empArr));
			payrunSchRecord.save();			

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}
	
	function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
