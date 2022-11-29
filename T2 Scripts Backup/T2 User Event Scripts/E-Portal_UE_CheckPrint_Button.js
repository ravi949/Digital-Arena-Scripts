/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget','N/runtime','N/record','N/search'],

		function(ui,runtime,record,search) {

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
			var scriptObj = runtime.getCurrentScript();
			log.debug("Deployment Id: " + scriptObj.deploymentId);
			if(scriptObj.deploymentId == "customdeploy3"){
				var customrecord_advanced_currencySearchObj = search.create({
					type: "customrecord_advanced_currency",
					filters:
						[
							["custrecord_adv_currency_currencylist","anyof",scriptContext.newRecord.id]
							],
							columns:
								[search.createColumn({name: "custrecord_decimal_precision", label: "Decimal Precision"}),
									search.createColumn({name: "custrecord_sub_unit_name", label: "Sub Unit Name"})
									]
				});
				var searchResultCount = customrecord_advanced_currencySearchObj.runPaged().count;
				log.debug("customrecord_advanced_currencySearchObj result count",searchResultCount);

				var decimalText,decimalPrecision;

				customrecord_advanced_currencySearchObj.run().each(function(result){

					decimalText = result.getValue('custrecord_sub_unit_name');
					decimalPrecision = result.getValue('custrecord_decimal_precision');

				});



				var decimalTextfield = scriptContext.form.addField({
					id : 'custpage_decimal_value',
					type : ui.FieldType.TEXT,
					label : 'Currency Subunit Text'    
				});
				decimalTextfield.isMandatory = true;
				var decimalPrecisionfield = scriptContext.form.addField({
					id : 'custpage_decimal_precision',
					type : ui.FieldType.INTEGER,
					label : 'Currency Precision'    
				});
				decimalPrecisionfield.isMandatory = true;

				if(decimalText){
					decimalTextfield.defaultValue = decimalText;
					decimalPrecisionfield.defaultValue = decimalPrecision
				}
				var standardfield = scriptContext.form.getField({
					id : 'currencyprecision'
				});

				standardfield.updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});
			}

			//field.storevalue = true;

			if(scriptObj.deploymentId == "customdeploy2"){
				if(scriptContext.type == 'view'){
					scriptContext.form.addButton({
						id : 'custpage_print',
						label : 'Print',
						functionName:'openSuitelet("'+scriptContext.newRecord.id+'")'
					});
				}
			//	scriptContext.form.clientScriptModulePath = './E-Portal_CS_Check_Attachment.js';				
			}
            
           /* if(scriptObj.deploymentId == "customdeploy_cust_refund"){
				if(scriptContext.type == 'view'){
					scriptContext.form.addButton({
						id : 'custpage_print',
						label : 'Print',
						functionName:'openSuiteletForCustRefund("'+scriptContext.newRecord.id+'")'
					});
				}
				//scriptContext.form.clientScriptModulePath = './E-Portal_CS_Filling_Currency_Info.js';				
			}
          
          if(scriptObj.deploymentId == "customdeploy_deposit_deploy"){
				if(scriptContext.type == 'view'){
					scriptContext.form.addButton({
						id : 'custpage_print',
						label : 'Print 1',
						functionName:'openSuiteletForDeposit("'+scriptContext.newRecord.id+'")'
					});
                  scriptContext.form.clientScriptModulePath = './DA_CS_customer_refund.js';
				}
            
					
			}*/
scriptContext.form.clientScriptFileId = 83135;			
			if(scriptObj.deploymentId == "customdeploy_invoice_deploy"){

				var currency = scriptContext.newRecord.getValue('currency');
				var customrecord_advanced_currencySearchObj = search.create({
					type: "customrecord_advanced_currency",
					filters:
						[
							["custrecord_adv_currency_currencylist","anyof",currency]
							],
							columns:
								[search.createColumn({name: "custrecord_decimal_precision", label: "Decimal Precision"}),
									search.createColumn({name: "custrecord_sub_unit_name", label: "Sub Unit Name"})
									]
				});
				var searchResultCount = customrecord_advanced_currencySearchObj.runPaged().count;
				log.debug("customrecord_advanced_currencySearchObj result count",searchResultCount);					

				customrecord_advanced_currencySearchObj.run().each(function(result){                      
					var decimalText = result.getValue('custrecord_sub_unit_name');
					var decimalPrecision = result.getValue('custrecord_decimal_precision');
					log.debug('decimalText',decimalText);
					log.debug('decimalPrecision',decimalPrecision);
					var decimalTextField = scriptContext.form.getField({
						id : 'custbody_currency_decimal_text'
					});
					var decimalPrecisionField = scriptContext.form.getField({
						id : 'custbody_currency_decimal_precision'
					});
					decimalTextField.defaultValue = decimalText;
					decimalPrecisionField.defaultValue = decimalPrecision;
				});
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
			var scriptObj = runtime.getCurrentScript();
			log.debug("Deployment Id: " + scriptObj.deploymentId);
			if(scriptObj.deploymentId == "customdeploy3"){

				log.debug('fd',scriptContext.newRecord.getValue('custpage_decimal_value'));

				var decimalText = scriptContext.newRecord.getValue('custpage_decimal_value');
				var decimalPrecision = scriptContext.newRecord.getValue('custpage_decimal_precision');

				var customrecord_advanced_currencySearchObj = search.create({
					type: "customrecord_advanced_currency",
					filters:
						[
							["custrecord_adv_currency_currencylist","anyof",scriptContext.newRecord.id]
							],
							columns:
								[ ]
				});
				var searchResultCount = customrecord_advanced_currencySearchObj.runPaged().count;
				log.debug("customrecord_advanced_currencySearchObj result count",searchResultCount);
				if(searchResultCount == 0){
					var currencyRec = record.create({
						type:'customrecord_advanced_currency'
					});
					currencyRec.setValue('custrecord_adv_currency_currencylist',scriptContext.newRecord.id);
					currencyRec.setValue('custrecord_sub_unit_name',decimalText);
					currencyRec.setValue('custrecord_decimal_precision',decimalPrecision);
					var id = currencyRec.save();	

					log.debug('id',id);
				}else{
					customrecord_advanced_currencySearchObj.run().each(function(result){
						// .run().each has a limit of 4,000 results

						var curencyRec = record.load({
							type:'customrecord_advanced_currency',
							id:result.id
						});
						curencyRec.setValue('custrecord_sub_unit_name',decimalText);
						curencyRec.setValue('custrecord_decimal_precision',decimalPrecision);
						curencyRec.save();
					});
				}
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
	function afterSubmit(scriptContext) {
		log.debug('fd',scriptContext.newRecord.getValue('custpage_abc_text'));

	}

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
