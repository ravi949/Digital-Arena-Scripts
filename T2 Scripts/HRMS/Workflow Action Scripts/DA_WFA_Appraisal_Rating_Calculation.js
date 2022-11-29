/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record'],

		function(search,record) {

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
			var employee =  scriptContext.newRecord.getValue('custrecord_int_app_employee_id');
			var appPeriod  = scriptContext.newRecord.getValue('custrecord_da_select_period');
			var approvalStatus = scriptContext.newRecord.getValue('custrecord_da_per_app_approval_status');
			
			var customrecord_int_app_child_recordSearchObj = search.create({
				   type: "customrecord_int_app_child_record",
				   filters:
				   [
				      ["custrecord_int_app_parent","anyof",scriptContext.newRecord.id], 
				      "AND", 
				      ["custrecord_int_app_feedback","noneof","7"]
				   ],
				   columns:
				   [
				      search.createColumn({
				         name: "custrecord_int_app_category",
				         summary: "GROUP",
				         label: "Category"
				      }),
				      search.createColumn({
				         name: "custrecord_app_feedback_value",
				         summary: "AVG",
				         label: "Feedback Value"
				      }),
				      search.createColumn({
				          name: "custrecord_da_appraisal_category_weight",
				          join: "CUSTRECORD_INT_APP_CATEGORY",
				          summary: "AVG",
				          label: "Weight"
				       })
				   ]
				});
				var searchResultCount = customrecord_int_app_child_recordSearchObj.runPaged().count;
				log.debug("customrecord_int_app_child_recordSearchObj result count",searchResultCount);
				
				/*var appraisalRec  = record.load({
					type:'customrecord_da_performance_appraisal',
					id:scriptContext.newRecord.id,
					isDynamic:true
				});*/
				var appraisalRec = scriptContext.newRecord;
				var totalRate = 0, sumOfWeights = 0;;
				customrecord_int_app_child_recordSearchObj.run().each(function(result){
					var categoryId = result.getValue({name:'custrecord_int_app_category',summary:search.Summary.GROUP});
					var feedbackValue = Number(result.getValue({name:'custrecord_app_feedback_value',summary:search.Summary.AVG})).toFixed(2);
					var weight = Number(result.getValue({name:'custrecord_da_appraisal_category_weight',join:'CUSTRECORD_INT_APP_CATEGORY',summary:search.Summary.AVG})).toFixed(2);
					
					var rate = (feedbackValue * weight);
					totalRate = parseFloat(rate)+parseFloat(totalRate);
					sumOfWeights = parseFloat(weight)+parseFloat(sumOfWeights);
					
					appraisalRec.selectNewLine({
						sublistId: 'recmachcustrecord_appraisal_parent'
					}); 
					appraisalRec.setCurrentSublistValue({ sublistId: 'recmachcustrecord_appraisal_parent',fieldId: 'custrecord_app_results_category',value: categoryId,ignoreFieldChange: true});
					appraisalRec.setCurrentSublistValue({ sublistId: 'recmachcustrecord_appraisal_parent',fieldId: 'custrecord_app_results_rating',value: feedbackValue,ignoreFieldChange: true});
					appraisalRec.setCurrentSublistValue({ sublistId: 'recmachcustrecord_appraisal_parent',fieldId: 'custrecord_app_results_cat_weight',value: weight,ignoreFieldChange: true});
					appraisalRec.commitLine({
						sublistId: 'recmachcustrecord_appraisal_parent'
					});
				   return true;
				});
				
				log.debug('totalRate',totalRate);
				
				appraisalRec.setValue('custrecord_app_total_rate', Number(totalRate/sumOfWeights).toFixed(2));
				
				appraisalRec.setValue('custrecord_app_percentage', Number(((Number(totalRate/sumOfWeights).toFixed(2))/5)*100).toFixed(2));
				
				//appraisalRec.save();

		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	return {
		onAction : onAction
	};

});
