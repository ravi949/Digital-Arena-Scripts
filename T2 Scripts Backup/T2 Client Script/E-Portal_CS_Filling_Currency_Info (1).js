/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format'],

		function(search,record,format) {

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

		try{
			console.log('Script Triggered');
          
          scriptContext.currentRecord.setValue('custbody_da_inv_url_origin', window.location.origin);

			var currency = scriptContext.currentRecord.getValue('currency');
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
				scriptContext.currentRecord.setValue('custbody_currency_decimal_text',decimalText);
				scriptContext.currentRecord.setValue('custbody_currency_decimal_precision',decimalPrecision);
			});
          
           if(scriptContext.currentRecord.getValue('custbody_item_replaced')){
              scriptContext.currentRecord.setValue('account',1066);
           }
         
		}catch(ex){
			console.log(ex.name,ex.message);
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
		try{
			if(scriptContext.fieldId == 'currency'){
				var currency = scriptContext.currentRecord.getValue('currency');
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
				
				if(searchResultCount > 0){
					customrecord_advanced_currencySearchObj.run().each(function(result){                      
						var decimalText = result.getValue('custrecord_sub_unit_name');
						var decimalPrecision = result.getValue('custrecord_decimal_precision');
						log.debug('decimalText',decimalText);
						log.debug('decimalPrecision',decimalPrecision);
						scriptContext.currentRecord.setValue('custbody_currency_decimal_text',decimalText);
						scriptContext.currentRecord.setValue('custbody_currency_decimal_precision',decimalPrecision);
					});
				}else{
					scriptContext.currentRecord.setValue('custbody_currency_decimal_text',"");
					scriptContext.currentRecord.setValue('custbody_currency_decimal_precision',"");
				}

				
				return true;				
			}

		}catch(ex){
			console.log(ex.name,ex.message);
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

	}

	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
//		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
//		saveRecord: saveRecord
	};

});
