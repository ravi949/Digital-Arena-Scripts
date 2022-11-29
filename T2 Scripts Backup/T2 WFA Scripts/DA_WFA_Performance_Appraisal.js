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

				if(approvalStatus == 1){
					var customrecord_da_appraisal_categoriesSearchObj = search.create({
						type: "customrecord_da_appraisal_categories",
						filters:
							[[["custrecord_da_appraisal_evaluate_by","anyof","1"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND",
								["custrecord_da_appraisal_category_group","anyof",result.id], 
								"AND", 
								["custrecord_da_appraisal_category_period","anyof",appPeriod],
                             "AND",["isinactive","is",false]
							],
							columns:
								[						      
									search.createColumn({name: "scriptid", label: "Script ID"}),
                                  search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })

									]
					});		
				}

				if(approvalStatus == 5){
					var customrecord_da_appraisal_categoriesSearchObj = search.create({
						type: "customrecord_da_appraisal_categories",
						filters:
							[[["custrecord_da_appraisal_evaluate_by","anyof","2"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND",
								["custrecord_da_appraisal_category_group","anyof",result.id], 
								"AND", 
								["custrecord_da_appraisal_category_period","anyof",appPeriod],"AND",["isinactive","is",false]
							],
							columns:
								[						      
									search.createColumn({name: "scriptid", label: "Script ID"})

									]
					});		
				}
				if(approvalStatus == 6){
					var customrecord_da_appraisal_categoriesSearchObj = search.create({
						type: "customrecord_da_appraisal_categories",
						filters:
							[[["custrecord_da_appraisal_evaluate_by","anyof","3"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND",
								["custrecord_da_appraisal_category_group","anyof",result.id], 
								"AND", 
								["custrecord_da_appraisal_category_period","anyof",appPeriod],"AND",["isinactive","is",false]
							],
							columns:
								[						      
									search.createColumn({name: "scriptid", label: "Script ID"}),
                                  search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })

									]
					});		
				}
				var searchResultCount = customrecord_da_appraisal_categoriesSearchObj.runPaged().count;
				log.debug("customrecord_da_appraisal_categoriesSearchObj result count",searchResultCount);
				if(searchResultCount > 0){
					customrecord_da_appraisal_categoriesSearchObj.run().each(function(result){
						apprisalGroupId.push(result.id);
						return true;
					});
				}
				return true;
			});

			if(approvalStatus == 1){
				var customrecord_da_appraisal_categoriesSearchObj = search.create({
					type: "customrecord_da_appraisal_categories",
					filters:
						[["custrecord_da_appraisal_category_group","anyof","@NONE@"],"AND",["isinactive","is",false],"AND",
							[["custrecord_da_appraisal_evaluate_by","anyof","1"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND", 
							["custrecord_da_appraisal_category_period","anyof",appPeriod]
						],
                   columns:[search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })]
				});
			}
			if(approvalStatus == 5){
				var customrecord_da_appraisal_categoriesSearchObj = search.create({
					type: "customrecord_da_appraisal_categories",
					filters:
						[["custrecord_da_appraisal_category_group","anyof","@NONE@"],"AND",["isinactive","is",false],"AND",
							[["custrecord_da_appraisal_evaluate_by","anyof","2"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND", 
							["custrecord_da_appraisal_category_period","anyof",appPeriod]
						],
                  columns:[search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })]
				});
			}
			if(approvalStatus == 6){
				var customrecord_da_appraisal_categoriesSearchObj = search.create({
					type: "customrecord_da_appraisal_categories",
					filters:
						[["custrecord_da_appraisal_category_group","anyof","@NONE@"],"AND",["isinactive","is",false],"AND",
							[["custrecord_da_appraisal_evaluate_by","anyof","3"],"OR",["custrecord_da_appraisal_evaluate_by","anyof","@NONE@"]],"AND", 
							["custrecord_da_appraisal_category_period","anyof",appPeriod]
						],
                   columns:[search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Internal ID"
      })]
				});
			}
			customrecord_da_appraisal_categoriesSearchObj.run().each(function(result){
				apprisalGroupId.push(result.id);
				return true;
			});

			scriptContext.newRecord.setValue('custrecord_da_app_group_id',JSON.stringify(removeDuplicateUsingFilter(apprisalGroupId.sort())));


			var customrecord_int_app_child_recordSearchObj = search.create({
				type: "customrecord_int_app_child_record",
				filters:
					[
						["custrecord_int_app_parent","anyof",scriptContext.newRecord.id]
						],
						columns:
							[
								search.createColumn({
									name: "custrecord_int_app_category",
									summary: "GROUP",
									label: "Category"
								})
								]
			});
			var searchResultCount = customrecord_int_app_child_recordSearchObj.runPaged().count;
			log.debug("customrecord_int_app_child_recordSearchObj result count",searchResultCount);
			var childCatIds = [];
			customrecord_int_app_child_recordSearchObj.run().each(function(result){
				childCatIds.push(result.getValue({name:'custrecord_int_app_category',summary:search.Summary.GROUP}))
				return true;
			});
			log.debug(childCatIds);
			scriptContext.newRecord.setValue('custrecord_da_app_child_cat_ids',JSON.stringify(removeDuplicateUsingFilter(childCatIds.sort())));

			var newArrforSublist = [];

			for (var i = 0;i <apprisalGroupId.length;i++){

				if(childCatIds.indexOf(apprisalGroupId[i]) != 1){
					newArrforSublist.push(apprisalGroupId[i]);
				}
			}

			scriptContext.newRecord.setValue('custrecord_da_app_subtab_arr',JSON.stringify(removeDuplicateUsingFilter(newArrforSublist.sort())));

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
		onAction : onAction
	};

});
