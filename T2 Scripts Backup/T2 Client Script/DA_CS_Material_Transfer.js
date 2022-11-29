/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/url','N/ui/dialog'],

		function(search,record,url,dialog) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	var mode,serailNo;
	function pageInit(scriptContext) {
      console.log("triggered");
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


		if(scriptContext.fieldId == 'custrecord_da_tran_from_location'){
			var itemId = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_mat_transfer_parent',
				fieldId: 'custrecord_da_material_item'
			});

			var location = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_mat_transfer_parent',
				fieldId: 'custrecord_da_tran_from_location'
			});
          
          var qty = scriptContext.currentRecord.getCurrentSublistValue({
				sublistId: 'recmachcustrecord_mat_transfer_parent',
				fieldId: 'custrecord_da_material_item_quantity'
			});

			if(location){
				var availQty = 0;
				var itemSearchObj = search.create({
					type: "item",
					filters:
						[
							["internalid","anyof",itemId],
							"AND",
							["location","anyof",location], 
							"AND", 
							["locationquantityavailable","greaterthan","0"]
							],
							columns:
								[
									search.createColumn({name: "locationquantityavailable", label: "Location Available"})
									]
				});
				var searchResultCount = itemSearchObj.runPaged().count;
				log.debug("itemSearchObj result count",searchResultCount);

				itemSearchObj.run().each(function(result){
					availQty = result.getValue('locationquantityavailable');
				});
				scriptContext.currentRecord.setCurrentSublistValue({
					sublistId: 'recmachcustrecord_mat_transfer_parent',
					fieldId: 'custrecord_da_mat_transfer_avail_qty',
					value: availQty,
					ignoreFieldChange: true
				});
              
              if(availQty < qty){
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_mat_transferable_qty',
								value: availQty
							});
						}else{
							scriptContext.currentRecord.setCurrentSublistValue({
								sublistId: 'recmachcustrecord_mat_transfer_parent',
								fieldId: 'custrecord_da_mat_transferable_qty',
								value: qty
							});
						}	

				

			}
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
		try{

		}catch(ex){
			console.log(ex.name,ex.message);
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
		try{

		}catch(ex){
			console.log(ex.name,ex.message);
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
		try{
			return true ;
		}catch(ex){
			console.log(ex.name,ex.message);
		}

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
		saveRecord: saveRecord,
//		createso:createso,


	};

});