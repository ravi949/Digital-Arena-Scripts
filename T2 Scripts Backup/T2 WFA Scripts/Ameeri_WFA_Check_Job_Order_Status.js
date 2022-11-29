/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task','N/search','N/record'],

		function(task,search,record) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @Since 2016.1
	 */
	function onAction(scriptContext) {
		try{ 

            var jobRecordId = scriptContext.newRecord.id;
            var customrecord_jo_particularsSearchObj = search.create({
            	   type: "customrecord_jo_particulars",
            	   filters:
            	   [
            	      ["custrecord_jo_particulars_job_order","anyof",jobRecordId], 
            	      "AND", 
            	      ["custrecord_jo_particulars_status","anyof","1","2"], 
            	      "AND", 
            	      ["custrecord_jo_particulars_assigned_to","noneof","@NONE@"]
            	   ],
            	   columns:
            	   [
            	      search.createColumn({name: "custrecord_da_subsidiary_line", label: "SubsidiaryLine"})
            	   ]
            	});
            	var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
            	log.debug("customrecord_jo_particularsSearchObj result count",searchResultCount);
            	if(searchResultCount > 0){
            		return "F";
            	}else{
            		return "T";
            	}

		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});