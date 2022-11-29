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
			var id = scriptContext.newRecord.id;
			log.debug('id',id);
			var type = scriptContext.newRecord.type;
			log.debug('type',type);
			var objRecord = record.load({
				type: type,
				id: id,
				isDynamic: true
			});
			var recId = objRecord.getValue('custbody_da_created_from_equity');
			log.debug('recId',recId);
			var transactionSearchObj = search.create({
   type: "transaction",
   filters:
   [
      ["mainline","is","T"], 
      "AND", 
      ["type","anyof","Custom274","Custom280","Custom284","Custom283","Custom286"], 
      "AND", 
      ["status","anyof","Custom283:A","Custom280:A","Custom274:A","Custom284:A","Custom286:B","Custom286:C","Custom286:A"], 
      "AND", 
      ["custbody_da_created_from_equity","anyof",recId]
   ],
   columns:
   [
      search.createColumn({
         name: "formulanumeric",
         summary: "SUM",
         formula: "CASE WHEN {type} LIKE '%Reassessment%' AND {custbody_da_fair_value_method} = 'T' AND {custbody_da_apital_appreciation_status} LIKE 'Gain' THEN {custbody_da_ureal_gain_loss} WHEN {type} LIKE '%Reassessment%' AND {custbody_da_fair_value_method} = 'T' AND {custbody_da_apital_appreciation_status} LIKE 'Loss' THEN -{custbody_da_ureal_gain_loss} WHEN {type} LIKE '%Sale of Investment%' AND {custbody_da_fair_value_method} = 'T' THEN {custbody_da_ureal_gain_loss} WHEN {custbody_da_equity_method} = 'T' THEN {custbody_da_updated_changes_in_equity} ELSE 0 END",
         label: "Formula (Numeric)"
      })
   ]
});
var searchResultCount = transactionSearchObj.runPaged().count;
log.debug("transactionSearchObj result count",searchResultCount);
var equityValue;
transactionSearchObj.run().each(function(result){
 equityValue = result.getValue({
		name: "formulanumeric",
        summary: "SUM"
 });
 log.debug('equityValue',equityValue);
 objRecord.setValue('custbody_da_cumulative_changes_quoted_',equityValue);
   return true;
});

			var objRec = objRecord.save();
			log.debug('objRec',objRec);
			var equityVal = objRecord.getValue('custbody_da_cumulative_changes_quoted_');
			log.debug('equityVal',equityVal);
		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}
	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});