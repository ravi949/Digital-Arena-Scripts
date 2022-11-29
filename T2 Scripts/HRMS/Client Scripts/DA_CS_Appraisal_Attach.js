/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/currentRecord','N/search','N/runtime'],

		function(currentRecord,search,runtime) {

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	var sc;
	function pageInit(scriptContext) {
		try{

			var scriptObj = runtime.getCurrentScript();

			if(scriptObj.deploymentId != "customdeploy_da_cs_app_categories"){
				var url_string = window.location.href;
				console.log(url_string);
				var url1 = new URL(url_string);
				var appCategoryArr = JSON.parse(url1.searchParams.get("appraisalGroupRecId"));
				//var appCategoryArr = appraisalCategoryIds.split('\u0005');
				log.debug('appCategoryArr',appCategoryArr);

				var count = url1.searchParams.get("count");
				var recId = url1.searchParams.get("recId");
				var newcatIds = JSON.parse(url1.searchParams.get("newcatIds"));

				if(appCategoryArr.length > 0 && count == 0){

					for(var i = 0 ;i < appCategoryArr.length; i++){
						var customrecord_questionnaire_recSearchObj = search.create({
							type: "customrecord_da_appraisal_objectives",
							filters:
								[
									["custrecord_app_category","anyof",appCategoryArr[i]]
									],
									columns:
										['name','custrecord_da_objective_arabic']
						});
						customrecord_questionnaire_recSearchObj.run().each(function(result){
							var name = result.getValue('name');
							console.log(name);
							var lineNum = scriptContext.currentRecord.selectNewLine({
								sublistId: 'custpage_report_sublist'+appCategoryArr[i]
							}); 
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_question',value: result.id,ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_arabic_question',value: result.getValue('custrecord_da_objective_arabic'),ignoreFieldChange: true});
							scriptContext.currentRecord.commitLine({
								sublistId: 'custpage_report_sublist'+appCategoryArr[i]
							});
							return true;
						});
					}
				}

				if(appCategoryArr.length > 0 && count > 0){
					for(var i = 0 ;i < appCategoryArr.length; i++){
						var customrecord_int_app_child_recordSearchObj = search.create({
							type: "customrecord_int_app_child_record",
							filters:
								[
									["custrecord_int_app_parent","anyof",recId],"AND",["custrecord_int_app_category","anyof",appCategoryArr[i]]
									],
									columns:
										['custrecord_int_app_question_id','custrecord_da_int_app_obj_arabic','custrecord_int_app_feedback','custrecord_da_app_brief_explanation']
						});

						customrecord_int_app_child_recordSearchObj.run().each(function(result){
							var name = result.getValue('custrecord_int_app_question_id');
							console.log(name);
							var lineNum = scriptContext.currentRecord.selectNewLine({
								sublistId: 'custpage_report_sublist'+appCategoryArr[i]
							}); 
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_question',value: name,ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_arabic_question',value: result.getValue('custrecord_da_int_app_obj_arabic'),ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_question_feedback',value: result.getValue('custrecord_int_app_feedback'),ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+appCategoryArr[i],fieldId: 'custpage_question_brief_exp',value: result.getValue('custrecord_da_app_brief_explanation'),ignoreFieldChange: true});
							scriptContext.currentRecord.commitLine({
								sublistId: 'custpage_report_sublist'+appCategoryArr[i]
							});
							return true;
						});

					}
				}

				if(newcatIds.length > 0 && count > 0){
					for(var m = 0; m <newcatIds.length; m++){
						var customrecord_questionnaire_recSearchObj = search.create({
							type: "customrecord_da_appraisal_objectives",
							filters:
								[
									["custrecord_app_category","anyof",newcatIds[m]]
									],
									columns:
										['name','custrecord_da_objective_arabic']
						});
						customrecord_questionnaire_recSearchObj.run().each(function(result){
							var name = result.getValue('name');
							console.log(name);
							var lineNum = scriptContext.currentRecord.selectNewLine({
								sublistId: 'custpage_report_sublist'+newcatIds[m]
							}); 
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+newcatIds[m],fieldId: 'custpage_question',value: result.id,ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'custpage_report_sublist'+newcatIds[m],fieldId: 'custpage_arabic_question',value: result.getValue('custrecord_da_objective_arabic'),ignoreFieldChange: true});
							scriptContext.currentRecord.commitLine({
								sublistId: 'custpage_report_sublist'+newcatIds[m]
							});
							return true;
						});
					}
				}
			}
			
			if(scriptObj.deploymentId == "customdeploy_da_cs_app_categories"){
				if(scriptContext.mode == "copy"){
					var url_string = window.location.href;
					var url1 = new URL(url_string);
					var copyRecId = url1.searchParams.get("id");
					console.log(copyRecId);
					
					var fieldLookUp = search.lookupFields({
					    type: 'customrecord_da_appraisal_categories',
					    id: copyRecId,
					    columns: ['name','custrecord_da_appraisal_category_arabic']
					});
					
					scriptContext.currentRecord.setValue('name',fieldLookUp.name);
					scriptContext.currentRecord.setValue('custrecord_da_appraisal_category_arabic',fieldLookUp.custrecord_da_appraisal_category_arabic);
					
					var customrecord_da_appraisal_objectivesSearchObj = search.create({
						   type: "customrecord_da_appraisal_objectives",
						   filters:
						   [
						      ["custrecord_app_category","anyof",copyRecId]
						   ],
						   columns:
						   [
						      search.createColumn({
						         name: "name",
						         sort: search.Sort.ASC,
						         label: "Name"
						      }),
						      search.createColumn({name: "custrecord_da_objective_arabic", label: "Arabic Description"})
						   ]
						});
						customrecord_da_appraisal_objectivesSearchObj.run().each(function(result){
							var lineNum = scriptContext.currentRecord.selectNewLine({
								sublistId: 'recmachcustrecord_app_category'
							}); 
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'recmachcustrecord_app_category',fieldId: 'name',value: result.getValue('name'),ignoreFieldChange: true});
							scriptContext.currentRecord.setCurrentSublistValue({ sublistId: 'recmachcustrecord_app_category',fieldId: 'custrecord_da_objective_arabic',value: result.getValue('custrecord_da_objective_arabic'),ignoreFieldChange: true});
							scriptContext.currentRecord.commitLine({
								sublistId: 'recmachcustrecord_app_category'
							});
						    return true;
						});

					 
				}
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
			if(scriptContext.fieldId == "custrecord_da_select_period"){
				var employee =  scriptContext.currentRecord.getValue('custrecord_int_app_employee_id');
				var appPeriod  = scriptContext.currentRecord.getValue('custrecord_da_select_period');

				var apprisalGroupId = [];

				var entitygroupSearchObj = search.create({
					type: "entitygroup",
					filters:
						[
							["groupmember.internalid","anyof",employee]
							],
							columns:
								[
									search.createColumn({
										name: "groupname",
										sort: search.Sort.ASC,
										label: "Name"
									})
									]
				});
				var searchResultCount = entitygroupSearchObj.runPaged().count;
				log.debug("entitygroupSearchObj result count",searchResultCount);
				entitygroupSearchObj.run().each(function(result){
					var customrecord_da_appraisal_categoriesSearchObj = search.create({
						type: "customrecord_da_appraisal_categories",
						filters:
							[
								["custrecord_da_appraisal_category_group","anyof",result.id], 
								"AND", 
								["custrecord_da_appraisal_category_period","anyof",appPeriod],"AND",
                                ["isinactive","is",false]
								],
								columns:
									[						      
										search.createColumn({name: "scriptid", label: "Script ID"})

										]
					});		
					var searchResultCount = customrecord_da_appraisal_categoriesSearchObj.runPaged().count;
					log.debug("customrecord_da_appraisal_categoriesSearchObj result count",searchResultCount);
					customrecord_da_appraisal_categoriesSearchObj.run().each(function(result){
						apprisalGroupId.push(result.id);
						return true;
					});
					return true;
				});

				var customrecord_da_appraisal_categoriesSearchObj = search.create({
					type: "customrecord_da_appraisal_categories",
					filters:
						[
							["custrecord_da_appraisal_category_group","anyof","@NONE@"],"AND",["isinactive","is",false]
							]
				});
				customrecord_da_appraisal_categoriesSearchObj.run().each(function(result){
					apprisalGroupId.push(result.id);
					return true;
				});

				console.log("apprisalGroupId"+removeDuplicateUsingFilter(apprisalGroupId));				

				scriptContext.currentRecord.setValue('custrecord_da_app_group_id',removeDuplicateUsingFilter(apprisalGroupId));

			}
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}
  
   function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
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

		try{
			var scriptObj = runtime.getCurrentScript();

			if(scriptObj.deploymentId != "customdeploy_da_cs_app_categories"){
				var url_string = window.location.href;
				console.log(url_string);
				var url1 = new URL(url_string);
				var appCategoryArr = JSON.parse(url1.searchParams.get("appraisalGroupRecId"));
              
              if(appCategoryArr){
				console.log('appCategoryArr',appCategoryArr);

				var newcatIds = JSON.parse(url1.searchParams.get("newcatIds"));

				if(appCategoryArr.length > 0 ){
					for(var i = 0 ;i < appCategoryArr.length; i++){
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'custpage_report_sublist'+appCategoryArr[i]
						});
						for(var k = 0;k<numLines;k++){
							var feedback = scriptContext.currentRecord.getSublistValue({
							    sublistId: 'custpage_report_sublist'+appCategoryArr[i],
							    fieldId: 'custpage_question_feedback',
							    line: k
							});
							if(feedback < 1){
								alert("please enter feedback for all objectives");
								return false;
							}
						}
					}
				}
				
				if(newcatIds.length > 0 ){
					for(var g = 0 ;g < newcatIds.length; g++){
						var numLines = scriptContext.currentRecord.getLineCount({
							sublistId: 'custpage_report_sublist'+newcatIds[g]
						});
						for(var k = 0;k<numLines;k++){
							var feedback = scriptContext.currentRecord.getSublistValue({
							    sublistId: 'custpage_report_sublist'+newcatIds[g],
							    fieldId: 'custpage_question_feedback',
							    line: k
							});
							if(feedback < 1){
								alert("please enter feedback for all objectives");
								return false;
							}
						}
					}
				}
            }
              return true;
				
			}
          return true;
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	
	}

	return {
		pageInit: pageInit,
//		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
//		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
		saveRecord: saveRecord,
      removeDuplicateUsingFilter:removeDuplicateUsingFilter
	};

});
